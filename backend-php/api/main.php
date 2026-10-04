<?php

require __DIR__ . '/lib/db.php';
require __DIR__ . '/lib/jwt.php';
require __DIR__ . '/lib/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
if (isset($_GET['r'])) {
    $qpos = strpos($_GET['r'], '?');
    if ($qpos !== false) {
        parse_str(substr($_GET['r'], $qpos + 1), $merged);
        $_GET = array_merge($_GET, $merged);
        $_GET['r'] = substr($_GET['r'], 0, $qpos);
    }
}
$path = $_GET['r'] ?? (parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$path = preg_replace('#^/api/v1#', '', $path);
$path = rtrim($path, '/');
if ($path === '') $path = '/';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function cast_bool($v): bool
{
    return (bool)$v;
}

function category_owned_by(string $uid, string $catId): ?array
{
    return row('SELECT id, name, type FROM categories WHERE id = ? AND user_id = ?', [$catId, $uid]);
}

try {

    if ($path === '/auth/register' && $method === 'POST') {
        $b = body();
        $name = trim((string)($b['name'] ?? ''));
        $email = strtolower(trim((string)($b['email'] ?? '')));
        $password = (string)($b['password'] ?? '');

        if ($name === '') json_error(400, 'VALIDATION_ERROR', 'Nama wajib diisi.');
        if (strlen($name) > 100) json_error(400, 'VALIDATION_ERROR', 'Nama maksimal 100 karakter.');
        if (!is_valid_email($email)) json_error(400, 'VALIDATION_ERROR', 'Format email tidak valid.');
        if (!is_valid_password($password)) json_error(400, 'VALIDATION_ERROR', 'Password minimal 8 karakter dan mengandung huruf serta angka.');

        $userId = uuid4();
        $hash = password_hash($password, PASSWORD_BCRYPT);
        db()->beginTransaction();
        try {
            q('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
                [$userId, $name, $email, $hash]);
            $defaults = [
                ['Gaji', 'INCOME'], ['Uang Saku', 'INCOME'],
                ['Freelance', 'INCOME'], ['Bonus', 'INCOME'],
                ['Makanan', 'EXPENSE'], ['Transportasi', 'EXPENSE'],
                ['Pendidikan', 'EXPENSE'], ['Tagihan', 'EXPENSE'],
                ['Hiburan', 'EXPENSE'], ['Belanja', 'EXPENSE'],
                ['Lainnya', 'EXPENSE'],
            ];
            foreach ($defaults as $d) {
                q('INSERT INTO categories (id, user_id, name, type) VALUES (?, ?, ?, ?)',
                    [uuid4(), $userId, $d[0], $d[1]]);
            }
            db()->commit();
        } catch (PDOException $e) {
            db()->rollBack();
            if ($e->getCode() === '23000') {
                json_error(409, 'BR-AUTH-01', 'Email sudah terdaftar.');
            }
            throw $e;
        }

        $user = row('SELECT id, name, email, created_at FROM users WHERE id = ?', [$userId]);
        set_token_cookie($user);
        json_out(201, ['status' => 'success', 'data' => ['user' => $user]]);
    }

    if ($path === '/auth/login' && $method === 'POST') {
        $b = body();
        $email = strtolower(trim((string)($b['email'] ?? '')));
        $password = (string)($b['password'] ?? '');

        if (!is_valid_email($email) || $password === '') {
            json_error(400, 'VALIDATION_ERROR', 'Email dan password wajib diisi.');
        }
        if (lock_is_locked($email)) {
            json_error(429, 'ACCOUNT_LOCKED', 'Terlalu banyak percobaan gagal. Akun dikunci 15 menit.');
        }

        $user = row('SELECT id, name, email, password_hash FROM users WHERE email = ?', [$email]);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            lock_record_failure($email);
            json_error(401, 'INVALID_CREDENTIALS', 'Email atau password salah.');
        }

        lock_record_success($email);
        set_token_cookie($user);
        json_out(200, ['status' => 'success', 'data' => ['user' => [
            'id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'],
        ]]]);
    }

    if ($path === '/auth/logout' && $method === 'POST') {
        setcookie('token', '', ['expires' => time() - 3600, 'path' => '/', 'httponly' => true]);
        json_out(200, ['status' => 'success', 'message' => 'Logout berhasil.']);
    }

    if ($path === '/auth/me' && $method === 'GET') {
        $uid = require_auth();
        $user = row('SELECT id, name, email, created_at FROM users WHERE id = ?', [$uid]);
        if (!$user) json_error(401, 'UNAUTHENTICATED', 'User tidak ditemukan.');
        json_out(200, ['status' => 'success', 'data' => ['user' => $user]]);
    }

    if ($path === '/auth/profile' && $method === 'PUT') {
        $uid = require_auth();
        $name = trim((string)(body()['name'] ?? ''));
        if ($name === '' || strlen($name) > 100) {
            json_error(400, 'VALIDATION_ERROR', 'Nama wajib diisi (maks 100 karakter).');
        }
        q('UPDATE users SET name = ? WHERE id = ?', [$name, $uid]);
        $user = row('SELECT id, name, email FROM users WHERE id = ?', [$uid]);
        set_token_cookie($user); // perbarui payload JWT agar nama di sesi ikut terbarui
        json_out(200, ['status' => 'success', 'data' => ['user' => $user]]);
    }

    if ($path === '/auth/password' && $method === 'PUT') {
        $uid = require_auth();
        $b = body();
        $current = (string)($b['current_password'] ?? '');
        $new = (string)($b['new_password'] ?? '');
        if (!is_valid_password($new)) {
            json_error(400, 'VALIDATION_ERROR', 'Password baru minimal 8 karakter dan mengandung huruf serta angka.');
        }
        $user = row('SELECT password_hash FROM users WHERE id = ?', [$uid]);
        if (!password_verify($current, $user['password_hash'])) {
            json_error(401, 'WRONG_PASSWORD', 'Password saat ini salah.');
        }
        q('UPDATE users SET password_hash = ? WHERE id = ?',
            [password_hash($new, PASSWORD_BCRYPT), $uid]);
        json_out(200, ['status' => 'success', 'message' => 'Password berhasil diubah.']);
    }

    if ($path === '/auth/account' && $method === 'DELETE') {
        $uid = require_auth();
        $user = row('SELECT password_hash FROM users WHERE id = ?', [$uid]);
        if (!password_verify((string)(body()['password'] ?? ''), $user['password_hash'])) {
            json_error(401, 'WRONG_PASSWORD', 'Password salah. Akun tidak dihapus.');
        }
        q('DELETE FROM users WHERE id = ?', [$uid]);
        setcookie('token', '', ['expires' => time() - 3600, 'path' => '/', 'httponly' => true]);
        json_out(200, ['status' => 'success', 'message' => 'Akun dan seluruh data telah dihapus permanen.']);
    }

    if ($path === '/categories' && $method === 'GET') {
        $uid = require_auth();
        $sql = 'SELECT id, name, type, created_at FROM categories WHERE user_id = ?';
        $params = [$uid];
        $type = $_GET['type'] ?? '';
        if (in_array($type, ['INCOME', 'EXPENSE'], true)) {
            $sql .= ' AND type = ?';
            $params[] = $type;
        }
        $sql .= ' ORDER BY name ASC';
        json_out(200, ['status' => 'success', 'data' => rows($sql, $params)]);
    }

    if ($path === '/categories' && $method === 'POST') {
        $uid = require_auth();
        $b = body();
        $name = trim((string)($b['name'] ?? ''));
        $type = (string)($b['type'] ?? '');
        if ($name === '' || strlen($name) > 100 || !in_array($type, ['INCOME', 'EXPENSE'], true)) {
            json_error(400, 'VALIDATION_ERROR', 'Nama kategori wajib diisi (maks 100 karakter) dan type harus INCOME atau EXPENSE.');
        }
        try {
            $id = uuid4();
            q('INSERT INTO categories (id, user_id, name, type) VALUES (?, ?, ?, ?)',
                [$id, $uid, $name, $type]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                json_error(409, 'BR-CAT-03', 'Kategori dengan nama dan type tersebut sudah ada.');
            }
            throw $e;
        }
        json_out(201, ['status' => 'success', 'data' => row('SELECT id, name, type FROM categories WHERE id = ?', [$id])]);
    }

    if (preg_match('#^/categories/([a-f0-9\-]{36})$#i', $path, $m)) {
        $uid = require_auth();
        $id = $m[1];
        $cat = category_owned_by($uid, $id);
        if (!$cat) json_error(404, 'NOT_FOUND', 'Kategori tidak ditemukan.');

        if ($method === 'PUT') {
            $b = body();
            $name = trim((string)($b['name'] ?? ''));
            $type = (string)($b['type'] ?? '');
            if ($name === '' || strlen($name) > 100 || !in_array($type, ['INCOME', 'EXPENSE'], true)) {
                json_error(400, 'VALIDATION_ERROR', 'Nama kategori wajib diisi (maks 100 karakter) dan type harus INCOME atau EXPENSE.');
            }
            if ($cat['type'] !== $type) {
                $usage = row(
                    'SELECT (SELECT COUNT(*) FROM transactions WHERE category_id = ?) AS trx,
                            (SELECT COUNT(*) FROM budgets WHERE category_id = ?) AS bud',
                    [$id, $id]
                );
                if ((int)$usage['trx'] > 0 || (int)$usage['bud'] > 0) {
                    json_error(409, 'CATEGORY_TYPE_LOCKED', 'Tipe kategori tidak dapat diubah karena sudah dipakai transaksi atau budget.');
                }
            }
            try {
                q('UPDATE categories SET name = ?, type = ? WHERE id = ?', [$name, $type, $id]);
            } catch (PDOException $e) {
                if ($e->getCode() === '23000') {
                    json_error(409, 'BR-CAT-03', 'Kategori dengan nama dan type tersebut sudah ada.');
                }
                throw $e;
            }
            json_out(200, ['status' => 'success', 'data' => row('SELECT id, name, type FROM categories WHERE id = ?', [$id])]);
        }

        if ($method === 'DELETE') {
            try {
                q('DELETE FROM categories WHERE id = ?', [$id]);
            } catch (PDOException $e) {
                if (in_array($e->getCode(), ['23000', '23001'], true)) {
                    json_error(409, 'BR-DATA-03', 'Kategori sudah dipakai transaksi atau budget, sehingga tidak dapat dihapus. Ubah namanya bila perlu.');
                }
                throw $e;
            }
            http_response_code(204);
            exit;
        }
    }

    if ($path === '/transactions' && $method === 'GET') {
        $uid = require_auth();
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $where = 't.user_id = ?';
        $params = [$uid];
        $month = $_GET['month'] ?? '';
        if (preg_match('/^\d{4}-\d{2}$/', $month)) {
            $where .= " AND substr(t.date, 1, 7) = ?";
            $params[] = $month;
        }
        $catId = $_GET['category_id'] ?? '';
        if (preg_match('/^[a-f0-9\-]{36}$/i', $catId)) {
            $where .= ' AND t.category_id = ?';
            $params[] = $catId;
        }
        $type = $_GET['type'] ?? '';
        if (in_array($type, ['INCOME', 'EXPENSE'], true)) {
            $where .= ' AND t.type = ?';
            $params[] = $type;
        }
        $search = trim((string)($_GET['search'] ?? ''));
        if ($search !== '') {
            $where .= ' AND (t.notes LIKE ? OR c.name LIKE ?)';
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $total = (int)row("SELECT COUNT(*) AS n FROM transactions t
                           JOIN categories c ON c.id = t.category_id WHERE {$where}", $params)['n'];
        $data = rows(
            "SELECT t.id, t.type, t.amount, t.date, t.notes, t.category_id,
                    c.name AS category_name, t.created_at
             FROM transactions t
             JOIN categories c ON c.id = t.category_id
             WHERE {$where}
             ORDER BY t.date DESC, t.created_at DESC
             LIMIT {$limit} OFFSET {$offset}",
            $params
        );
        json_out(200, ['status' => 'success', 'data' => $data, 'page' => $page, 'limit' => $limit, 'total' => $total]);
    }

    function validate_transaction_body(array $b): ?array
    {
        $type = (string)($b['type'] ?? '');
        if (!in_array($type, ['INCOME', 'EXPENSE'], true)) {
            return ['VALIDATION_ERROR', 'Type transaksi harus INCOME atau EXPENSE.'];
        }
        $amountRaw = $b['amount'] ?? null;
        $amount = is_string($amountRaw) ? (float)str_replace(',', '.', $amountRaw) : (float)$amountRaw;
        if (!is_finite($amount) || $amount <= 0 || $amount > 999999999999.99) {
            return ['BR-TRX-01', 'Nominal harus berupa angka lebih besar dari 0.'];
        }
        $catId = (string)($b['category_id'] ?? '');
        if (!preg_match('/^[a-f0-9\-]{36}$/i', $catId)) {
            return ['VALIDATION_ERROR', 'Kategori tidak valid.'];
        }
        $date = (string)($b['date'] ?? '');
        if ($date !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return ['BR-TRX-07', 'Tanggal tidak valid, gunakan format YYYY-MM-DD.'];
        }
        $notes = (string)($b['notes'] ?? '');
        if (strlen($notes) > 1000) {
            return ['VALIDATION_ERROR', 'Catatan maksimal 1000 karakter.'];
        }
        return null;
    }

    if ($path === '/transactions' && $method === 'POST') {
        $uid = require_auth();
        $b = body();
        $err = validate_transaction_body($b);
        if ($err) json_error(400, $err[0], $err[1]);

        $amount = is_string($b['amount']) ? (float)str_replace(',', '.', $b['amount']) : (float)$b['amount'];
        $date = ($b['date'] ?? '') !== '' ? (string)$b['date'] : date('Y-m-d');

        $cat = category_owned_by($uid, (string)$b['category_id']);
        if (!$cat) json_error(404, 'NOT_FOUND', 'Kategori tidak ditemukan.');
        if ($cat['type'] !== $b['type']) {
            json_error(409, 'BR-TRX-03', 'Jenis transaksi harus sesuai dengan jenis category');
        }

        $id = uuid4();
        q('INSERT INTO transactions (id, user_id, category_id, type, amount, date, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)',
            [$id, $uid, $b['category_id'], $b['type'], $amount, $date, trim((string)($b['notes'] ?? '')) ?: null]);
        $row = row(
            'SELECT t.id, t.type, t.amount, t.date, t.notes, t.category_id, c.name AS category_name
             FROM transactions t JOIN categories c ON c.id = t.category_id WHERE t.id = ?',
            [$id]
        );
        $row['amount'] = (float)$row['amount'];
        json_out(201, ['status' => 'success', 'data' => $row]);
    }

    if (preg_match('#^/transactions/([a-f0-9\-]{36})$#i', $path, $m)) {
        $uid = require_auth();
        $id = $m[1];
        $owned = row('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [$id, $uid]);
        if (!$owned) json_error(404, 'NOT_FOUND', 'Transaksi tidak ditemukan.');

        if ($method === 'PUT') {
            $b = body();
            $err = validate_transaction_body($b);
            if ($err) {
                [$code, $message] = $err;
                json_error(400, $code, $message);
            }
            $amount = is_string($b['amount']) ? (float)str_replace(',', '.', $b['amount']) : (float)$b['amount'];
            $date = ($b['date'] ?? '') !== '' ? (string)$b['date'] : date('Y-m-d');
            $cat = category_owned_by($uid, (string)$b['category_id']);
            if (!$cat) json_error(404, 'NOT_FOUND', 'Kategori tidak ditemukan.');
            if ($cat['type'] !== $b['type']) {
                json_error(409, 'BR-TRX-03', 'Jenis transaksi harus sesuai dengan jenis category');
            }
            q('UPDATE transactions SET type = ?, category_id = ?, amount = ?, date = ?, notes = ? WHERE id = ?',
                [$b['type'], $b['category_id'], $amount, $date, trim((string)($b['notes'] ?? '')) ?: null, $id]);
            $row = row(
                'SELECT t.id, t.type, t.amount, t.date, t.notes, t.category_id, c.name AS category_name
                 FROM transactions t JOIN categories c ON c.id = t.category_id WHERE t.id = ?',
                [$id]
            );
            $row['amount'] = (float)$row['amount'];
            json_out(200, ['status' => 'success', 'data' => $row]);
        }

        if ($method === 'DELETE') {
            q('DELETE FROM transactions WHERE id = ?', [$id]);
            json_out(200, ['status' => 'success', 'message' => 'Transaksi dihapus.']);
        }
    }

    function budget_with_usage(array $b, string $uid, string $month): array
    {
        $spent = (float)(row(
            "SELECT COALESCE(SUM(amount), 0) AS s FROM transactions
             WHERE user_id = ? AND type = 'EXPENSE'
               AND category_id = ? AND substr(date, 1, 7) = ?",
            [$uid, $b['category_id'], $month]
        )['s'] ?? 0);
        $limit = (float)$b['amount_limit'];
        $usage = $limit > 0 ? round($spent / $limit * 100, 1) : 0;
        $status = $usage >= 100 ? 'OVER_BUDGET' : ($usage >= 80 ? 'WARNING' : 'OK');
        return [
            'id' => $b['id'],
            'category_id' => $b['category_id'],
            'category_name' => $b['category_name'],
            'amount_limit' => (float)$b['amount_limit'],
            'spent' => $spent,
            'usage_percentage' => $usage,
            'status' => $status,
        ];
    }

    if ($path === '/budgets' && $method === 'GET') {
        $uid = require_auth();
        $month = $_GET['month'] ?? date('Y-m');
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) json_error(400, 'VALIDATION_ERROR', 'Format bulan tidak valid.');
        $cats = rows(
            'SELECT b.id, b.category_id, c.name AS category_name, b.amount_limit, b.month_year
             FROM budgets b JOIN categories c ON c.id = b.category_id
             WHERE b.user_id = ? AND substr(b.month_year, 1, 7) = ?
             ORDER BY b.amount_limit DESC',
            [$uid, $month]
        );
        $data = array_map(fn($b) => budget_with_usage($b, $uid, $month), $cats);
        json_out(200, ['status' => 'success', 'data' => $data]);
    }

    if ($path === '/budgets' && $method === 'POST') {
        $uid = require_auth();
        $b = body();
        $catId = (string)($b['category_id'] ?? '');
        $limit = is_string($b['amount_limit'] ?? null) ? (float)str_replace(',', '.', $b['amount_limit']) : (float)($b['amount_limit'] ?? 0);
        $monthYear = (string)($b['month_year'] ?? '');

        if (!preg_match('/^[a-f0-9\-]{36}$/i', $catId)) json_error(400, 'VALIDATION_ERROR', 'Kategori tidak valid.');
        if (!is_finite($limit) || $limit <= 0 || $limit > 999999999999.99) {
            json_error(400, 'BR-BUD-01', 'Batas budget harus berupa angka lebih besar dari 0.');
        }
        if (!preg_match('/^\d{4}-\d{2}-01$/', $monthYear)) {
            json_error(400, 'BR-BUD-03', 'Periode budget harus tanggal pertama bulan, format YYYY-MM-01 (contoh: 2026-09-01).');
        }
        $cat = category_owned_by($uid, $catId);
        if (!$cat) json_error(404, 'NOT_FOUND', 'Kategori tidak ditemukan.');
        if ($cat['type'] !== 'EXPENSE') {
            json_error(409, 'BR-BUD-02', 'Budget hanya dapat menggunakan category EXPENSE');
        }

        $id = uuid4();
        try {
            q('INSERT INTO budgets (id, user_id, category_id, amount_limit, month_year) VALUES (?, ?, ?, ?, ?)',
                [$id, $uid, $catId, $limit, $monthYear]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                json_error(409, 'BR-BUD-04', 'Budget untuk kategori dan bulan tersebut sudah ada.');
            }
            throw $e;
        }
        $row = row(
            'SELECT b.id, b.category_id, c.name AS category_name, b.amount_limit, b.month_year
             FROM budgets b JOIN categories c ON c.id = b.category_id WHERE b.id = ?',
            [$id]
        );
        $row['amount_limit'] = (float)$row['amount_limit'];
        json_out(201, ['status' => 'success', 'data' => $row]);
    }

    if (preg_match('#^/budgets/([a-f0-9\-]{36})$#i', $path, $m)) {
        $uid = require_auth();
        $id = $m[1];
        $owned = row('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [$id, $uid]);
        if (!$owned) json_error(404, 'NOT_FOUND', 'Budget tidak ditemukan.');

        if ($method === 'PUT') {
            $limit = is_string(body()['amount_limit'] ?? null) ? (float)str_replace(',', '.', body()['amount_limit']) : (float)(body()['amount_limit'] ?? 0);
            if (!is_finite($limit) || $limit <= 0 || $limit > 999999999999.99) {
                json_error(400, 'BR-BUD-01', 'Batas budget harus berupa angka lebih besar dari 0.');
            }
            q('UPDATE budgets SET amount_limit = ? WHERE id = ?', [$limit, $id]);
            $row = row(
                'SELECT b.id, b.category_id, c.name AS category_name, b.amount_limit, b.month_year
                 FROM budgets b JOIN categories c ON c.id = b.category_id WHERE b.id = ?',
                [$id]
            );
            $row['amount_limit'] = (float)$row['amount_limit'];
            json_out(200, ['status' => 'success', 'data' => $row]);
        }

        if ($method === 'DELETE') {
            q('DELETE FROM budgets WHERE id = ?', [$id]);
            http_response_code(204);
            exit;
        }
    }

    if ($path === '/todos' && $method === 'GET') {
        $uid = require_auth();
        $status = $_GET['status'] ?? '';
        $where = 'user_id = ?';
        if ($status === 'active') $where .= ' AND is_completed = 0';
        if ($status === 'completed') $where .= ' AND is_completed = 1';
        $data = rows(
            "SELECT id, title, amount, due_date, is_completed, auto_expense, created_at
             FROM financial_todos
             WHERE {$where}
             ORDER BY is_completed ASC, (due_date IS NULL) ASC, due_date ASC, created_at DESC",
            [$uid]
        );
        $data = array_map(function ($t) {
            $t['is_completed'] = (bool)$t['is_completed'];
            $t['auto_expense'] = (bool)$t['auto_expense'];
            return $t;
        }, $data);
        json_out(200, ['status' => 'success', 'data' => $data]);
    }

    function validate_todo_body(array $b): ?array
    {
        $title = trim((string)($b['title'] ?? ''));
        if ($title === '' || strlen($title) > 200) {
            return ['BR-TODO-01', 'Judul to-do wajib diisi (maks 200 karakter).'];
        }
        $amountRaw = $b['amount'] ?? 0;
        $amount = is_string($amountRaw) ? (float)str_replace(',', '.', $amountRaw) : (float)$amountRaw;
        if (!is_finite($amount) || $amount < 0 || $amount > 999999999999.99) {
            return ['BR-TODO-02', 'Nominal harus angka >= 0.'];
        }
        $due = (string)($b['due_date'] ?? '');
        if ($due !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $due)) {
            return ['BR-TODO-03', 'Tanggal tenggat tidak valid.'];
        }
        return null;
    }

    if ($path === '/todos' && $method === 'POST') {
        $uid = require_auth();
        $b = body();
        $err = validate_todo_body($b);
        if ($err) {
            [$code, $message] = $err;
            json_error(400, $code, $message);
        }
        $id = uuid4();
        $amount = is_string($b['amount'] ?? null) ? (float)str_replace(',', '.', $b['amount']) : (float)($b['amount'] ?? 0);
        q('INSERT INTO financial_todos (id, user_id, title, amount, due_date, auto_expense) VALUES (?, ?, ?, ?, ?, ?)',
            [$id, $uid, trim((string)$b['title']), $amount, ($b['due_date'] ?? '') ?: null,
             ($b['auto_expense'] ?? false) ? 1 : 0]);
        $row = row('SELECT * FROM financial_todos WHERE id = ?', [$id]);
        $row['amount'] = (float)$row['amount'];
        $row['is_completed'] = (bool)$row['is_completed'];
        $row['auto_expense'] = (bool)$row['auto_expense'];
        json_out(201, ['status' => 'success', 'data' => $row]);
    }

    if (preg_match('#^/todos/([a-f0-9\-]{36})$#i', $path, $m)) {
        $uid = require_auth();
        $id = $m[1];
        $owned = row('SELECT id FROM financial_todos WHERE id = ? AND user_id = ?', [$id, $uid]);
        if (!$owned) json_error(404, 'NOT_FOUND', 'To-Do tidak ditemukan.');

        if ($method === 'PUT') {
            $b = body();
            $err = validate_todo_body($b);
            if ($err) {
                [$code, $message] = $err;
                json_error(400, $code, $message);
            }
            $amount = is_string($b['amount'] ?? null) ? (float)str_replace(',', '.', $b['amount']) : (float)($b['amount'] ?? 0);
            q('UPDATE financial_todos SET title = ?, amount = ?, due_date = ?, auto_expense = ? WHERE id = ?',
                [trim((string)$b['title']), $amount, ($b['due_date'] ?? '') ?: null,
                 ($b['auto_expense'] ?? false) ? 1 : 0, $id]);
            $row = row('SELECT * FROM financial_todos WHERE id = ?', [$id]);
            $row['amount'] = (float)$row['amount'];
            $row['is_completed'] = (bool)$row['is_completed'];
            $row['auto_expense'] = (bool)$row['auto_expense'];
            json_out(200, ['status' => 'success', 'data' => $row]);
        }

        if ($method === 'DELETE') {
            q('DELETE FROM financial_todos WHERE id = ?', [$id]);
            http_response_code(204);
            exit;
        }
    }

    if (preg_match('#^/todos/([a-f0-9\-]{36})/complete$#i', $path, $m) && $method === 'PATCH') {
        $uid = require_auth();
        $id = $m[1];
        db()->beginTransaction();
        try {
            $todo = row('SELECT id, title, amount, due_date, is_completed, auto_expense
                         FROM financial_todos WHERE id = ? AND user_id = ?', [$id, $uid]);
            if (!$todo) {
                db()->rollBack();
                json_error(404, 'NOT_FOUND', 'To-Do tidak ditemukan.');
            }

            if ((int)$todo['is_completed'] === 1) {
                db()->commit();
                json_out(200, ['status' => 'success', 'data' => [
                    'todo' => $todo,
                    'transaction_created' => false,
                ]]);
            }

            q('UPDATE financial_todos SET is_completed = 1 WHERE id = ?', [$id]);

            $transaction = null;
            if ((int)$todo['auto_expense'] === 1 && (float)$todo['amount'] > 0) {
                $cat = row("SELECT id FROM categories WHERE user_id = ? AND name = 'Lainnya' AND type = 'EXPENSE' LIMIT 1", [$uid]);
                if ($cat) {
                    $trxId = uuid4();
                    try {
                        q("INSERT INTO transactions (id, user_id, category_id, source_todo_id, type, amount, date, notes)
                           VALUES (?, ?, ?, ?, 'EXPENSE', ?, CURRENT_DATE, ?)",
                            [$trxId, $uid, $cat['id'], $id, (float)$todo['amount'], 'Auto expense: ' . $todo['title']]);
                        $transaction = row('SELECT * FROM transactions WHERE id = ?', [$trxId]);
                    } catch (PDOException $e) {
                        if ($e->getCode() !== '23000') throw $e;
                        $transaction = null;
                    }
                }
            }

            db()->commit(); // BR-AUTO-04: atomik
        } catch (Exception $e) {
            db()->rollBack();
            throw $e;
        }

        $todo = row('SELECT * FROM financial_todos WHERE id = ?', [$id]);
        $todo['is_completed'] = (bool)$todo['is_completed'];
        $todo['auto_expense'] = (bool)$todo['auto_expense'];
        if ($transaction) {
            $transaction['amount'] = (float)$transaction['amount'];
            $transaction['source_todo_id'] = $transaction['source_todo_id'];
        }
        json_out(200, ['status' => 'success', 'data' => [
            'todo' => $todo,
            'transaction_created' => $transaction !== null,
            'transaction' => $transaction,
        ]]);
    }

    if ($path === '/dashboard/summary' && $method === 'GET') {
        $uid = require_auth();
        $month = $_GET['month'] ?? date('Y-m');
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) json_error(400, 'VALIDATION_ERROR', 'Format bulan tidak valid.');

        $totals = row(
            "SELECT
               COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount WHEN type = 'EXPENSE' THEN -amount END), 0) AS balance,
               COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS total_income,
               COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expense
             FROM transactions
             WHERE user_id = ? AND substr(date, 1, 7) = ?",
            [$uid, $month]
        );

        $budgets = rows(
            "SELECT b.id, b.category_id, c.name AS category_name, b.amount_limit,
                    COALESCE(s.spent, 0) AS spent
             FROM budgets b
             JOIN categories c ON c.id = b.category_id
             LEFT JOIN (
               SELECT category_id, SUM(amount) AS spent
               FROM transactions
               WHERE user_id = ? AND type = 'EXPENSE' AND substr(date, 1, 7) = ?
               GROUP BY category_id
             ) s ON s.category_id = b.category_id
             WHERE b.user_id = ? AND substr(b.month_year, 1, 7) = ?",
            [$uid, $month, $uid, $month]
        );
        $budgets = array_map(function ($b) use ($uid, $month) {
            return budget_with_usage($b, $uid, $month);
        }, $budgets);

        $recent = rows(
            "SELECT t.id, t.type, t.amount, t.date, t.category_id, c.name AS category_name
             FROM transactions t
             JOIN categories c ON c.id = t.category_id
             WHERE t.user_id = ?
             ORDER BY t.date DESC, t.created_at DESC
             LIMIT 5",
            [$uid]
        );

        $todos = rows(
            "SELECT id, title, amount, due_date, auto_expense
             FROM financial_todos
             WHERE user_id = ? AND is_completed = 0
             ORDER BY (due_date IS NULL) ASC, due_date ASC
             LIMIT 5",
            [$uid]
        );

        $totalLimit = 0.0;
        $totalSpent = 0.0;
        foreach ($budgets as $b) {
            $totalLimit += (float)$b['amount_limit'];
            $totalSpent += (float)$b['spent'];
        }

        $seriesRows = rows(
            "SELECT substr(date, 1, 7) AS ym,
                    SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) AS income,
                    SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS expense
             FROM transactions
             WHERE user_id = ? AND date >= ?
             GROUP BY substr(date, 1, 7)
             ORDER BY ym ASC",
            [$uid]
        );
        $seriesMap = [];
        foreach ($seriesRows as $r) $seriesMap[$r['ym']] = $r;
        $series = [];
        $base = new DateTime('first day of this month');
        for ($i = 5; $i >= 0; $i--) {
            $d = (clone $base)->modify("-{$i} months");
            $ym = $d->format('Y-m');
            $r = $seriesMap[$ym] ?? null;
            $series[] = ['month' => $ym, 'income' => (float)($r['income'] ?? 0), 'expense' => (float)($r['expense'] ?? 0)];
        }

        $donut = rows(
            "SELECT c.name, SUM(t.amount) AS total
             FROM transactions t
             JOIN categories c ON c.id = t.category_id
             WHERE t.user_id = ? AND t.type = 'EXPENSE' AND substr(t.date, 1, 7) = ?
             GROUP BY c.id, c.name
             ORDER BY total DESC",
            [$uid, $month]
        );

        json_out(200, ['status' => 'success', 'data' => [
            'month' => $month,
            'balance' => (float)$totals['balance'],
            'total_income' => (float)$totals['total_income'],
            'total_expense' => (float)$totals['total_expense'],
            'budget' => [
                'total_limit' => $totalLimit,
                'total_spent' => $totalSpent,
                'total_limit_pct' => $totalLimit > 0 ? (int)round($totalSpent / $totalLimit * 100) : 0,
                'sisa' => $totalLimit - $totalSpent,
            ],
            'budgets' => $budgets,
            'recent' => $recent,
            'todos' => $todos,
            'series' => $series,
            'expense_by_category' => array_map(
                fn($r) => ['name' => $r['name'], 'total' => (float)$r['total']],
                $donut
            ),
        ]]);
    }

    json_error(404, 'NOT_FOUND', 'Endpoint tidak ditemukan.');
} catch (PDOException $e) {
    $sqlState = $e->getCode();
    if ($sqlState === '23001' || $sqlState === '23503') {
        json_error(409, 'BR-DATA-03', 'Data masih dipakai oleh data lain sehingga tidak dapat dihapus.');
    }
    if ($sqlState === '23505') {
        json_error(409, 'DUPLICATE', 'Data duplikat.');
    }
    if ($sqlState === '23514' || $sqlState === '3819') {
        json_error(400, 'CONSTRAINT_VIOLATION', $e->getMessage());
    }
    if ($sqlState === '45000') {
        json_error(409, 'BR-VIOLATION', $e->getMessage());
    }
    error_log('FINTRACK API error: ' . $e->getMessage());
    json_error(500, 'INTERNAL', 'Terjadi kesalahan server.');
} catch (Throwable $e) {
    error_log('FINTRACK API error: ' . $e->getMessage());
    json_error(500, 'INTERNAL', 'Terjadi kesalahan server.');
}
