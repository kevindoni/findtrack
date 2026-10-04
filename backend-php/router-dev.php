<?php
// Router untuk development lokal: php -S 127.0.0.1:3000 router-dev.php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

if (preg_match('#^/api(/|$)#', $uri)) {
    require __DIR__ . '/api/index.php';
    return true;
}

// Selain /api: biarkan server bawaan menyajikan file (atau 404)
return false;
