-- =========================================================
-- FINTRACK
-- MySQL / MariaDB Final Schema - Capstone Project
-- (Adaptasi dari fintrack.md Bagian 34 - baseline MariaDB 11.x)
-- Semua Business Rules (Bagian 35) tetap terjaga.
-- =========================================================

-- =========================================================
-- 1. USERS
-- =========================================================
-- BR-AUTH-01: email unik case-insensitive.
-- MariaDB tidak punya functional index: pakai generated column.
CREATE TABLE users (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    email_key     VARCHAR(255) GENERATED ALWAYS AS (LOWER(email)) STORED,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 2. CATEGORIES
-- =========================================================
-- BR-CAT-01: ownership. BR-CAT-02: type ENUM.
-- BR-CAT-03: unik kombinasi user+name+type (collation ci = case-insensitive).
CREATE TABLE categories (
    id         CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id    CHAR(36)     NOT NULL,
    name       VARCHAR(100) NOT NULL,
    type       ENUM('INCOME','EXPENSE') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_user_name_type (user_id, name, type),
    KEY idx_categories_user (user_id),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 3. FINANCIAL TODOS
-- =========================================================
-- BR-TODO-01..04. Dibuat sebelum transactions agar urutan FK jelas.
CREATE TABLE financial_todos (
    id           CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id      CHAR(36)     NOT NULL,
    title        VARCHAR(200) NOT NULL,
    amount       DECIMAL(15,2) NOT NULL DEFAULT 0,
    due_date     DATE NULL,
    is_completed TINYINT(1) NOT NULL DEFAULT 0,
    auto_expense TINYINT(1) NOT NULL DEFAULT 0,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_financial_todos_user (user_id),
    KEY idx_financial_todos_user_due_date (user_id, due_date),
    CONSTRAINT fk_financial_todos_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_financial_todos_amount_non_negative CHECK (amount >= 0),
    CONSTRAINT ck_financial_todos_title_not_empty CHECK (CHAR_LENGTH(TRIM(title)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 4. TRANSACTIONS
-- =========================================================
-- BR-TRX-01/02/07: CHECK + ENUM. BR-TRX-03/04: trigger (bawah).
-- BR-AUTO-02/03: source_todo_id unik; NULL boleh berulang
-- (ekuivalen partial unique index PostgreSQL).
CREATE TABLE transactions (
    id             CHAR(36)      NOT NULL DEFAULT (UUID()),
    user_id        CHAR(36)      NOT NULL,
    category_id    CHAR(36)      NOT NULL,
    source_todo_id CHAR(36)      NULL,
    type           ENUM('INCOME','EXPENSE') NOT NULL,
    amount         DECIMAL(15,2) NOT NULL,
    date           DATE NOT NULL DEFAULT (CURRENT_DATE),
    notes          TEXT NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_transactions_source_todo (source_todo_id),
    KEY idx_transactions_user_date (user_id, date),
    KEY idx_transactions_user_type (user_id, type),
    KEY idx_transactions_category (category_id),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON DELETE RESTRICT,
    CONSTRAINT ck_transactions_amount_positive CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 5. BUDGETS
-- =========================================================
-- BR-BUD-01..04. BR-BUD-02 (EXPENSE only): trigger (bawah).
CREATE TABLE budgets (
    id           CHAR(36)      NOT NULL DEFAULT (UUID()),
    user_id      CHAR(36)      NOT NULL,
    category_id  CHAR(36)      NOT NULL,
    amount_limit DECIMAL(15,2) NOT NULL,
    -- Selalu tanggal pertama bulan, contoh: 2026-09-01 (BR-BUD-03)
    month_year   DATE NOT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_budgets_user_category_month (user_id, category_id, month_year),
    KEY idx_budgets_user_month (user_id, month_year),
    KEY idx_budgets_category (category_id),
    CONSTRAINT fk_budgets_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_budgets_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON DELETE RESTRICT,
    CONSTRAINT ck_budgets_amount_positive CHECK (amount_limit > 0),
    CONSTRAINT ck_budgets_month_first_day CHECK (DAY(month_year) = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 6. TRIGGER VALIDASI TRANSACTIONS (INSERT & UPDATE)
-- =========================================================
-- Gabungan validate_transaction_ownership + validate_transaction_category_type:
--   BR-TRX-03: type transaksi = type kategori
--   BR-TRX-04: kategori & source_todo milik user yang sama
DELIMITER $$

CREATE TRIGGER trg_transactions_validate_insert
BEFORE INSERT ON transactions
FOR EACH ROW
BEGIN
    DECLARE v_cat_owner CHAR(36);
    DECLARE v_cat_type  CHAR(7);
    DECLARE v_todo_owner CHAR(36);

    SELECT user_id, type INTO v_cat_owner, v_cat_type
    FROM categories WHERE id = NEW.category_id;

    IF v_cat_owner IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category tidak ditemukan';
    END IF;

    IF v_cat_owner <> NEW.user_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category bukan milik user yang melakukan transaksi';
    END IF;

    IF v_cat_type <> NEW.type THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Jenis transaksi harus sesuai dengan jenis category';
    END IF;

    IF NEW.source_todo_id IS NOT NULL THEN
        SELECT user_id INTO v_todo_owner
        FROM financial_todos WHERE id = NEW.source_todo_id;

        IF v_todo_owner IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Financial Todo tidak ditemukan';
        END IF;

        IF v_todo_owner <> NEW.user_id THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Financial Todo bukan milik user yang melakukan transaksi';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_transactions_validate_update
BEFORE UPDATE ON transactions
FOR EACH ROW
BEGIN
    DECLARE v_cat_owner CHAR(36);
    DECLARE v_cat_type  CHAR(7);
    DECLARE v_todo_owner CHAR(36);

    SELECT user_id, type INTO v_cat_owner, v_cat_type
    FROM categories WHERE id = NEW.category_id;

    IF v_cat_owner IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category tidak ditemukan';
    END IF;

    IF v_cat_owner <> NEW.user_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category bukan milik user yang melakukan transaksi';
    END IF;

    IF v_cat_type <> NEW.type THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Jenis transaksi harus sesuai dengan jenis category';
    END IF;

    IF NEW.source_todo_id IS NOT NULL THEN
        SELECT user_id INTO v_todo_owner
        FROM financial_todos WHERE id = NEW.source_todo_id;

        IF v_todo_owner IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Financial Todo tidak ditemukan';
        END IF;

        IF v_todo_owner <> NEW.user_id THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Financial Todo bukan milik user yang melakukan transaksi';
        END IF;
    END IF;
END$$

-- =========================================================
-- 7. TRIGGER VALIDASI BUDGETS (INSERT & UPDATE)
-- =========================================================
-- validate_budget_ownership:
--   BR-BUD-02: kategori budget wajib EXPENSE
--   ownership: kategori milik user budget
CREATE TRIGGER trg_budgets_validate_insert
BEFORE INSERT ON budgets
FOR EACH ROW
BEGIN
    DECLARE v_cat_owner CHAR(36);
    DECLARE v_cat_type  CHAR(7);

    SELECT user_id, type INTO v_cat_owner, v_cat_type
    FROM categories WHERE id = NEW.category_id;

    IF v_cat_owner IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category tidak ditemukan';
    END IF;

    IF v_cat_owner <> NEW.user_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category bukan milik user budget';
    END IF;

    IF v_cat_type <> 'EXPENSE' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Budget hanya dapat menggunakan category EXPENSE';
    END IF;
END$$

CREATE TRIGGER trg_budgets_validate_update
BEFORE UPDATE ON budgets
FOR EACH ROW
BEGIN
    DECLARE v_cat_owner CHAR(36);
    DECLARE v_cat_type  CHAR(7);

    SELECT user_id, type INTO v_cat_owner, v_cat_type
    FROM categories WHERE id = NEW.category_id;

    IF v_cat_owner IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category tidak ditemukan';
    END IF;

    IF v_cat_owner <> NEW.user_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category bukan milik user budget';
    END IF;

    IF v_cat_type <> 'EXPENSE' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Budget hanya dapat menggunakan category EXPENSE';
    END IF;
END$$

-- =========================================================
-- 8. DEFAULT CATEGORY PROCEDURE
-- =========================================================
-- Dipanggil setelah register: CALL create_default_categories(?)
CREATE PROCEDURE create_default_categories(IN p_user_id CHAR(36))
BEGIN
    INSERT INTO categories (user_id, name, type) VALUES
        (p_user_id, 'Gaji',          'INCOME'),
        (p_user_id, 'Uang Saku',     'INCOME'),
        (p_user_id, 'Freelance',     'INCOME'),
        (p_user_id, 'Bonus',         'INCOME'),
        (p_user_id, 'Makanan',       'EXPENSE'),
        (p_user_id, 'Transportasi',  'EXPENSE'),
        (p_user_id, 'Pendidikan',    'EXPENSE'),
        (p_user_id, 'Tagihan',       'EXPENSE'),
        (p_user_id, 'Hiburan',       'EXPENSE'),
        (p_user_id, 'Belanja',       'EXPENSE'),
        (p_user_id, 'Lainnya',       'EXPENSE');
END$$

DELIMITER ;
