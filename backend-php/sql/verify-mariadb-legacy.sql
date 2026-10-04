-- =====================================================================
-- FINTRACK - Verifikasi Skema & Business Rules (dijalankan SETELAH schema.sql)
-- Tes yang ditandai EXPECT-ERROR memang harus GAGAL.
-- Jalankan dengan: mysql --force (agar lanjut setelah error yang diharapkan)
-- =====================================================================

-- ===== Data uji =====
INSERT INTO users (id, name, email, password_hash) VALUES
  ('11111111-1111-1111-1111-111111111111', 'User A', 'a@mail.com', 'hashA');
INSERT INTO users (id, name, email, password_hash) VALUES
  ('22222222-2222-2222-2222-222222222222', 'User B', 'b@mail.com', 'hashB');

CALL create_default_categories('11111111-1111-1111-1111-111111111111');
CALL create_default_categories('22222222-2222-2222-2222-222222222222');

SELECT COUNT(*) AS default_cats_A_must_be_11
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- ===== T1 [EXPECT-ERROR] BR-AUTH-01: email duplikat case-insensitive =====
INSERT INTO users (name, email, password_hash) VALUES ('Dup', 'A@Mail.Com', 'x');

-- ===== T2 [EXPECT-OK] BR-TRX-01..04: transaksi expense valid =====
INSERT INTO transactions (id, user_id, category_id, type, amount, date)
SELECT 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', id, 'EXPENSE', 25000.00, '2026-09-20'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Makanan';

-- ===== T3 [EXPECT-ERROR] BR-TRX-04: kategori milik user lain =====
INSERT INTO transactions (id, user_id, category_id, type, amount, date)
SELECT 'aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', id, 'EXPENSE', 10000.00, '2026-09-20'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Makanan';

-- ===== T4 [EXPECT-ERROR] BR-TRX-03: type transaksi ≠ type kategori =====
INSERT INTO transactions (id, user_id, category_id, type, amount, date)
SELECT 'aaaaaaaa-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', id, 'INCOME', 50000.00, '2026-09-20'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Makanan';

-- ===== T5 [EXPECT-ERROR] BR-TRX-01: amount = 0 =====
INSERT INTO transactions (id, user_id, category_id, type, amount, date)
SELECT 'aaaaaaaa-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', id, 'EXPENSE', 0, '2026-09-20'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Makanan';

-- ===== T6 Auto Expense: todo A1 + transaksi otomatis pertama [EXPECT-OK] =====
INSERT INTO financial_todos (id, user_id, title, amount, due_date, is_completed, auto_expense) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Bayar Listrik', 150000.00, '2026-09-25', 1, 1);

INSERT INTO transactions (id, user_id, category_id, source_todo_id, type, amount, date, notes)
SELECT 'aaaaaaaa-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', id,
       'bbbbbbbb-0000-0000-0000-000000000001', 'EXPENSE', 150000.00, '2026-09-25', 'Auto expense: Bayar Listrik'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Tagihan';

-- ===== T7 [EXPECT-ERROR] BR-AUTO-03: auto expense kedua untuk todo sama (double request) =====
INSERT INTO transactions (id, user_id, category_id, source_todo_id, type, amount, date, notes)
SELECT 'aaaaaaaa-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', id,
       'bbbbbbbb-0000-0000-0000-000000000001', 'EXPENSE', 150000.00, '2026-09-25', 'Retry jaringan'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Tagihan';

-- ===== T8 [EXPECT-ERROR] BR-TRX-04: source_todo milik user lain =====
INSERT INTO transactions (id, user_id, category_id, source_todo_id, type, amount, date)
SELECT 'aaaaaaaa-0000-0000-0000-000000000012', '22222222-2222-2222-2222-222222222222', id,
       'bbbbbbbb-0000-0000-0000-000000000001', 'EXPENSE', 150000.00, '2026-09-25'
FROM categories WHERE user_id = '22222222-2222-2222-2222-222222222222' AND name = 'Tagihan';

-- ===== T9 transaksi biasa: source_todo_id NULL berulang [EXPECT-OK] =====
INSERT INTO transactions (id, user_id, category_id, source_todo_id, type, amount, date)
SELECT 'aaaaaaaa-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111111', id, NULL, 'EXPENSE', 12000.00, '2026-09-19'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Makanan';
INSERT INTO transactions (id, user_id, category_id, source_todo_id, type, amount, date)
SELECT 'aaaaaaaa-0000-0000-0000-000000000021', '11111111-1111-1111-1111-111111111111', id, NULL, 'EXPENSE', 8000.00, '2026-09-21'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Makanan';

-- ===== T10 [EXPECT-ERROR] BR-BUD-02: budget pakai kategori INCOME =====
INSERT INTO budgets (id, user_id, category_id, amount_limit, month_year)
SELECT 'cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', id, 1000000.00, '2026-09-01'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Gaji';

-- ===== T11 [EXPECT-ERROR] BR-BUD-03: month_year bukan tanggal pertama =====
INSERT INTO budgets (id, user_id, category_id, amount_limit, month_year)
SELECT 'cccccccc-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', id, 1000000.00, '2026-09-15'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Makanan';

-- ===== T12 [EXPECT-OK] BR-BUD-01..04: budget valid =====
INSERT INTO budgets (id, user_id, category_id, amount_limit, month_year)
SELECT 'cccccccc-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', id, 1000000.00, '2026-09-01'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Makanan';

-- ===== T13 [EXPECT-ERROR] BR-BUD-04: budget ganda kategori sama bulan sama =====
INSERT INTO budgets (id, user_id, category_id, amount_limit, month_year)
SELECT 'cccccccc-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', id, 500000.00, '2026-09-01'
FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Makanan';

-- ===== T14 [EXPECT-ERROR] BR-BUD-02 (UPDATE): ubah kategori budget ke INCOME =====
UPDATE budgets SET category_id = (SELECT id FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Gaji')
WHERE id = 'cccccccc-0000-0000-0000-000000000003';

-- ===== T15 [EXPECT-ERROR] BR-TODO-01: judul kosong =====
INSERT INTO financial_todos (id, user_id, title, amount) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '   ', 0);

-- ===== T16 BR-CAT-03: kategori duplikat case-insensitive [EXPECT-ERROR] =====
INSERT INTO categories (user_id, name, type) VALUES ('11111111-1111-1111-1111-111111111111', 'MAKANAN', 'EXPENSE');

-- ===== T17 BR-CAT-03: nama sama, type beda [EXPECT-OK] =====
INSERT INTO categories (user_id, name, type) VALUES ('11111111-1111-1111-1111-111111111111', 'Makanan', 'INCOME');

-- ===== T18 [EXPECT-ERROR] BR-DATA-03: hapus kategori terpakai (RESTRICT) =====
DELETE FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111' AND name = 'Makanan' AND type = 'EXPENSE';

-- ===== Ringkasan perhitungan (Bagian 34): saldo, income, expense, budget usage =====
SELECT
  COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount WHEN type = 'EXPENSE' THEN -amount END), 0) AS balance,
  COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0)  AS total_income,
  COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expense
FROM transactions
WHERE user_id = '11111111-1111-1111-1111-111111111111';

SELECT b.amount_limit,
       COALESCE((SELECT SUM(t.amount) FROM transactions t
                 WHERE t.user_id = b.user_id AND t.category_id = b.category_id
                   AND t.type = 'EXPENSE' AND DATE_FORMAT(t.date, '%Y-%m') = DATE_FORMAT(b.month_year, '%Y-%m')), 0) AS spent,
       ROUND(COALESCE((SELECT SUM(t.amount) FROM transactions t
                 WHERE t.user_id = b.user_id AND t.category_id = b.category_id
                   AND t.type = 'EXPENSE' AND DATE_FORMAT(t.date, '%Y-%m') = DATE_FORMAT(b.month_year, '%Y-%m')), 0)
             / b.amount_limit * 100, 1) AS usage_pct,
       CASE
         WHEN COALESCE((SELECT SUM(t.amount) FROM transactions t
                 WHERE t.user_id = b.user_id AND t.category_id = b.category_id
                   AND t.type = 'EXPENSE' AND DATE_FORMAT(t.date, '%Y-%m') = DATE_FORMAT(b.month_year, '%Y-%m')), 0)
             / b.amount_limit >= 1 THEN 'OVER_BUDGET'
         WHEN COALESCE((SELECT SUM(t.amount) FROM transactions t
                 WHERE t.user_id = b.user_id AND t.category_id = b.category_id
                   AND t.type = 'EXPENSE' AND DATE_FORMAT(t.date, '%Y-%m') = DATE_FORMAT(b.month_year, '%Y-%m')), 0)
             / b.amount_limit >= 0.8 THEN 'WARNING'
         ELSE 'OK'
       END AS status_br_bud_06_07
FROM budgets b
WHERE b.id = 'cccccccc-0000-0000-0000-000000000003';

-- ===== Bersih-bersih data uji =====
DELETE FROM transactions WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM transactions WHERE user_id = '22222222-2222-2222-2222-222222222222';
DELETE FROM budgets WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM financial_todos WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM categories WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM categories WHERE user_id = '22222222-2222-2222-2222-222222222222';
DELETE FROM users WHERE id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');
