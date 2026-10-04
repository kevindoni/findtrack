-- =========================================================
-- FINTRACK
-- PostgreSQL Schema (Produksi: Vercel Postgres / Neon)
-- Development lokal: PostgreSQL Laragon (port 5432)
-- =========================================================

BEGIN;

-- =========================================================
-- 1. EXTENSIONS
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =========================================================
-- 2. ENUM TYPES
-- =========================================================

CREATE TYPE transaction_type AS ENUM (
    'INCOME',
    'EXPENSE'
);


-- =========================================================
-- 3. USERS
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_users_email
ON users (LOWER(email));


-- =========================================================
-- 4. CATEGORIES
-- =========================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    name VARCHAR(100) NOT NULL,

    type transaction_type NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_categories_user_name_type
        UNIQUE (user_id, name, type)
);


CREATE INDEX idx_categories_user
ON categories(user_id);


-- =========================================================
-- 5. TRANSACTIONS
-- =========================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    category_id UUID NOT NULL,

    source_todo_id UUID NULL,

    type transaction_type NOT NULL,

    amount NUMERIC(15,2) NOT NULL,

    date DATE NOT NULL DEFAULT CURRENT_DATE,

    notes TEXT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_transactions_amount_positive
        CHECK (amount > 0)
);


CREATE INDEX idx_transactions_user_date
ON transactions(user_id, date DESC);

CREATE INDEX idx_transactions_user_type
ON transactions(user_id, type);

CREATE INDEX idx_transactions_category
ON transactions(category_id);

CREATE UNIQUE INDEX uq_transactions_source_todo
ON transactions(source_todo_id)
WHERE source_todo_id IS NOT NULL;


-- =========================================================
-- 6. BUDGETS
-- =========================================================

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    category_id UUID NOT NULL,

    amount_limit NUMERIC(15,2) NOT NULL,

    -- Selalu menggunakan tanggal pertama bulan.
    -- Contoh: 2026-09-01
    month_year DATE NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_budgets_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_budgets_amount_positive
        CHECK (amount_limit > 0),

    CONSTRAINT ck_budgets_month_first_day
        CHECK (month_year = DATE_TRUNC('month', month_year)::DATE),

    CONSTRAINT uq_budgets_user_category_month
        UNIQUE (user_id, category_id, month_year)
);


CREATE INDEX idx_budgets_user_month
ON budgets(user_id, month_year);

CREATE INDEX idx_budgets_category
ON budgets(category_id);


-- =========================================================
-- 7. FINANCIAL TODOS
-- =========================================================

CREATE TABLE financial_todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    title VARCHAR(200) NOT NULL,

    amount NUMERIC(15,2) NOT NULL DEFAULT 0,

    due_date DATE NULL,

    is_completed BOOLEAN NOT NULL DEFAULT FALSE,

    auto_expense BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_financial_todos_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_financial_todos_amount_non_negative
        CHECK (amount >= 0),

    CONSTRAINT ck_financial_todos_title_not_empty
        CHECK (LENGTH(TRIM(title)) > 0)
);


CREATE INDEX idx_financial_todos_user
ON financial_todos(user_id);

CREATE INDEX idx_financial_todos_user_due_date
ON financial_todos(user_id, due_date);

CREATE INDEX idx_financial_todos_pending
ON financial_todos(user_id, due_date)
WHERE is_completed = FALSE;


-- =========================================================
-- 8. UPDATED_AT TRIGGER
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


CREATE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


CREATE TRIGGER trg_budgets_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


CREATE TRIGGER trg_financial_todos_updated_at
BEFORE UPDATE ON financial_todos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =========================================================
-- 9. OWNERSHIP VALIDATION
-- =========================================================
--
-- category.user_id harus sama dengan transaction.user_id
-- category.user_id harus sama dengan budget.user_id
-- source_todo.user_id harus sama dengan transaction.user_id
--
-- Hal ini tidak cukup hanya dengan FK biasa karena
-- PostgreSQL perlu memvalidasi kombinasi ownership.
-- =========================================================

CREATE OR REPLACE FUNCTION validate_transaction_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    category_owner UUID;
    todo_owner UUID;
BEGIN

    SELECT user_id
    INTO category_owner
    FROM categories
    WHERE id = NEW.category_id;

    IF category_owner IS NULL THEN
        RAISE EXCEPTION 'Category tidak ditemukan';
    END IF;

    IF category_owner <> NEW.user_id THEN
        RAISE EXCEPTION
            'Category bukan milik user yang melakukan transaksi';
    END IF;


    IF NEW.source_todo_id IS NOT NULL THEN

        SELECT user_id
        INTO todo_owner
        FROM financial_todos
        WHERE id = NEW.source_todo_id;

        IF todo_owner IS NULL THEN
            RAISE EXCEPTION 'Financial Todo tidak ditemukan';
        END IF;

        IF todo_owner <> NEW.user_id THEN
            RAISE EXCEPTION
                'Financial Todo bukan milik user yang melakukan transaksi';
        END IF;

    END IF;


    RETURN NEW;
END;
$$;


CREATE TRIGGER trg_validate_transaction_ownership
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION validate_transaction_ownership();


-- =========================================================
-- 10. BUDGET OWNERSHIP VALIDATION
-- =========================================================

CREATE OR REPLACE FUNCTION validate_budget_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    category_owner UUID;
    category_type transaction_type;
BEGIN

    SELECT user_id, type
    INTO category_owner, category_type
    FROM categories
    WHERE id = NEW.category_id;

    IF category_owner IS NULL THEN
        RAISE EXCEPTION 'Category tidak ditemukan';
    END IF;

    IF category_owner <> NEW.user_id THEN
        RAISE EXCEPTION
            'Category bukan milik user budget';
    END IF;

    IF category_type <> 'EXPENSE' THEN
        RAISE EXCEPTION
            'Budget hanya dapat menggunakan category EXPENSE';
    END IF;

    RETURN NEW;
END;
$$;


CREATE TRIGGER trg_validate_budget_ownership
BEFORE INSERT OR UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION validate_budget_ownership();


-- =========================================================
-- 11. TRANSACTION CATEGORY TYPE VALIDATION
-- =========================================================

CREATE OR REPLACE FUNCTION validate_transaction_category_type()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    category_type transaction_type;
BEGIN

    SELECT type
    INTO category_type
    FROM categories
    WHERE id = NEW.category_id;

    IF category_type <> NEW.type THEN
        RAISE EXCEPTION
            'Jenis transaksi harus sesuai dengan jenis category';
    END IF;

    RETURN NEW;
END;
$$;


CREATE TRIGGER trg_validate_transaction_category_type
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION validate_transaction_category_type();


-- =========================================================
-- 12. DEFAULT CATEGORY FUNCTION
-- =========================================================

-- Fungsi ini dapat dipanggil setelah user melakukan register.

CREATE OR REPLACE FUNCTION create_default_categories(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN

    INSERT INTO categories (user_id, name, type)
    VALUES
        (p_user_id, 'Gaji', 'INCOME'),
        (p_user_id, 'Uang Saku', 'INCOME'),
        (p_user_id, 'Freelance', 'INCOME'),
        (p_user_id, 'Bonus', 'INCOME'),
        (p_user_id, 'Makanan', 'EXPENSE'),
        (p_user_id, 'Transportasi', 'EXPENSE'),
        (p_user_id, 'Pendidikan', 'EXPENSE'),
        (p_user_id, 'Tagihan', 'EXPENSE'),
        (p_user_id, 'Hiburan', 'EXPENSE'),
        (p_user_id, 'Belanja', 'EXPENSE'),
        (p_user_id, 'Lainnya', 'EXPENSE');

END;
$$;


COMMIT;
