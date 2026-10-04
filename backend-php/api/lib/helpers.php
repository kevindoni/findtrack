<?php

function json_out(int $http, array $payload): void
{
    http_response_code($http);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(int $http, string $code, string $message): void
{
    json_out($http, ['status' => 'error', 'code' => $code, 'message' => $message]);
}

function body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function uuid4(): string
{
    $d = random_bytes(16);
    $d[6] = chr((ord($d[6]) & 0x0f) | 0x40);
    $d[8] = chr((ord($d[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($d), 4));
}

function set_token_cookie(array $user): void
{
    $cfg = config();
    $jwt = jwt_sign([
        'sub' => $user['id'],
        'name' => $user['name'],
        'exp' => time() + $cfg['jwt_expires'],
    ]);
    setcookie('token', $jwt, [
        'expires' => time() + $cfg['jwt_expires'],
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => (($_SERVER['HTTPS'] ?? '') !== '' && ($_SERVER['HTTPS'] ?? '') !== 'off'),
    ]);
}

function current_user_id(): ?string
{
    $token = $_COOKIE['token'] ?? null;
    if (!is_string($token) || $token === '') return null;
    $payload = jwt_verify($token);
    return $payload['sub'] ?? null;
}

function require_auth(): string
{
    $uid = current_user_id();
    if ($uid === null) {
        json_error(401, 'UNAUTHENTICATED', 'Sesi tidak ditemukan. Silakan login.');
    }
    return $uid;
}

function is_valid_email(string $email): bool
{
    return (bool)preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email);
}

function is_valid_password(string $password): bool
{
    return strlen($password) >= 8
        && preg_match('/[a-zA-Z]/', $password)
        && preg_match('/[0-9]/', $password);
}

function lock_file(): string
{
    return sys_get_temp_dir() . '/fintrack_locks.json';
}

function lock_state(string $email): array
{
    $all = json_decode(@file_get_contents(lock_file()), true);
    return is_array($all) && isset($all[$email]) ? $all[$email] : ['failures' => 0, 'lockedUntil' => null];
}

function lock_is_locked(string $email): bool
{
    $st = lock_state($email);
    return isset($st['lockedUntil']) && $st['lockedUntil'] > time();
}

function lock_record_failure(string $email): void
{
    $all = json_decode(@file_get_contents(lock_file()), true) ?: [];
    $st = $all[$email] ?? ['failures' => 0, 'lockedUntil' => null];
    $st['failures'] += 1;
    if ($st['failures'] >= 5) {
        $st['lockedUntil'] = time() + 15 * 60;
        $st['failures'] = 0;
    }
    $all[$email] = $st;
    file_put_contents(lock_file(), json_encode($all));
}

function lock_record_success(string $email): void
{
    $all = json_decode(@file_get_contents(lock_file()), true) ?: [];
    unset($all[$email]);
    file_put_contents(lock_file(), json_encode($all));
}
