<?php
// Installer sekali pakai: buat tabel + perbaiki api/config.php.
// Akses: install.php?key=FindtrackInstall2026  →  HAPUS FILE INI setelah berhasil!
// Mandiri: kredensial DB tertanam di sini (tidak butuh config.php yang rusak).

$key = $_GET['key'] ?? '';
if ($key !== 'FindtrackInstall2026') {
    http_response_code(403);
    exit('Forbidden');
}

$DB = [
    'host' => 'localhost',
    'name' => 'nure4885_fintrack',
    'user' => 'nure4885_fintrack',
    'pass' => 'Findtrack17',
];

try {
    $pdo = new PDO(
        "mysql:host={$DB['host']};dbname={$DB['name']};charset=utf8mb4",
        $DB['user'],
        $DB['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (Throwable $e) {
    http_response_code(500);
    exit('KONEKSI GAGAL: ' . $e->getMessage());
}

$statements = [
    "CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci",
    "CREATE TABLE IF NOT EXISTS categories (
        id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        type ENUM('INCOME','EXPENSE') NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_categories_user_name_type (user_id, name, type),
        KEY idx_categories_user (user_id),
        CONSTRAINT fk_categories_user FOREIGN KEY (user_id)
            REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci",
    "CREATE TABLE IF NOT EXISTS financial_todos (
        id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        title VARCHAR(200) NOT NULL,
        amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        due_date DATE NULL,
        is_completed TINYINT(1) NOT NULL DEFAULT 0,
        auto_expense TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_financial_todos_user (user_id),
        KEY idx_financial_todos_user_due_date (user_id, due_date),
        CONSTRAINT fk_financial_todos_user FOREIGN KEY (user_id)
            REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci",
    "CREATE TABLE IF NOT EXISTS transactions (
        id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        category_id CHAR(36) NOT NULL,
        source_todo_id CHAR(36) NULL,
        type ENUM('INCOME','EXPENSE') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        date DATE NOT NULL,
        notes TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci",
    "CREATE TABLE IF NOT EXISTS budgets (
        id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        category_id CHAR(36) NOT NULL,
        amount_limit DECIMAL(15,2) NOT NULL,
        month_year DATE NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci",
];

echo "Versi server: " . $pdo->query('SELECT VERSION()')->fetchColumn() . "\n";
foreach ($statements as $i => $sql) {
    try {
        $pdo->exec($sql);
        echo "Tabel " . ($i + 1) . ": OK\n";
    } catch (PDOException $e) {
        echo "Tabel " . ($i + 1) . " GAGAL: " . $e->getMessage() . "\n";
    }
}
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "Tabel akhir: " . implode(', ', $tables) . "\n";

// Tulis ulang api/config.php di server
$configPhp = "<?php\nreturn " . var_export([
    'db' => $DB,
    'jwt_secret' => 'fintrack-b8f2c41d7e9a4c6f8a1d3b5e7c9f0a2d',
    'jwt_expires' => 7 * 24 * 60 * 60,
], true) . ";\n";
$written = file_put_contents(__DIR__ . '/api/config.php', $configPhp);
echo "api/config.php ditulis: " . ($written !== false ? $written . " bytes" : "GAGAL") . "\n";
echo "SELESAI — hapus file install.php dari server!\n";
