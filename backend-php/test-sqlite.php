<?php
// Tes koneksi + tulis SQLite (CLI)
try {
    $dir = __DIR__ . '/database';
    @mkdir($dir, 0775, true);
    $t0 = microtime(true);
    $pdo = new PDO('sqlite:' . $dir . '/tes.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $pdo->exec('CREATE TABLE IF NOT EXISTS tes (id INTEGER PRIMARY KEY, nama TEXT)');
    $pdo->exec("INSERT INTO tes (nama) VALUES ('ok')");
    $n = $pdo->query('SELECT COUNT(*) FROM tes')->fetchColumn();
    $ms = round((microtime(true) - $t0) * 1000);
    echo "sqlite OK, baris: $n, durasi: {$ms} ms\n";
} catch (Throwable $e) {
    echo "ERR: " . $e->getMessage() . "\n";
}
