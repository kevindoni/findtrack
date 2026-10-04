<?php
// Koneksi database: driver sqlite (development lokal, tanpa server DB)
// atau mysql (hosting produksi). Dipilih lewat key 'driver' di config.

function config(): array
{
    static $config = null;
    if ($config === null) {
        $local = __DIR__ . '/../config.local.php';
        $config = file_exists($local) ? require $local : require __DIR__ . '/../config.php';
    }
    return $config;
}

function db_driver(): string
{
    return config()['driver'] ?? 'mysql';
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = config();
        $driver = $c['driver'] ?? 'mysql';

        if ($driver === 'sqlite') {
            $path = $c['sqlite_path'] ?? (__DIR__ . '/../../database/fintrack.sqlite');
            @mkdir(dirname($path), 0775, true);
            $pdo = new PDO('sqlite:' . $path, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            $pdo->exec('PRAGMA foreign_keys = ON');
            sqlite_init($pdo);
        } else {
            $pdo = new PDO(
                "mysql:host={$c['db']['host']};dbname={$c['db']['name']};charset=utf8mb4",
                $c['db']['user'],
                $c['db']['pass'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        }
    }
    return $pdo;
}

// Skema SQLite dibuat otomatis saat pertama kali dijalankan (zero setup)
function sqlite_init(PDO $pdo): void
{
    $ada = $pdo->query("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'users'")->fetchColumn();
    if ((int)$ada > 0) return;

    $ddl = [
        "CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
        "CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('INCOME','EXPENSE')),
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            UNIQUE (user_id, name, type)
        )",
        "CREATE TABLE IF NOT EXISTS financial_todos (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
            amount REAL NOT NULL DEFAULT 0 CHECK (amount >= 0),
            due_date TEXT NULL,
            is_completed INTEGER NOT NULL DEFAULT 0,
            auto_expense INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
        "CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
            source_todo_id TEXT NULL UNIQUE,
            type TEXT NOT NULL CHECK (type IN ('INCOME','EXPENSE')),
            amount REAL NOT NULL CHECK (amount > 0),
            date TEXT NOT NULL,
            notes TEXT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
        "CREATE TABLE IF NOT EXISTS budgets (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
            amount_limit REAL NOT NULL CHECK (amount_limit > 0),
            month_year TEXT NOT NULL CHECK (substr(month_year, 9, 2) = '01'),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, category_id, month_year)
        )",
    ];
    foreach ($ddl as $sql) {
        $pdo->exec($sql);
    }
}

function q(string $sql, array $params = []): PDOStatement
{
    $st = db()->prepare($sql);
    $st->execute($params);
    return $st;
}

function row(string $sql, array $params = []): ?array
{
    $r = q($sql, $params)->fetch();
    return $r === false ? null : $r;
}

function rows(string $sql, array $params = []): array
{
    return q($sql, $params)->fetchAll();
}
