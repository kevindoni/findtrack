<?php

function b64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode(string $data): string
{
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_sign(array $payload): string
{
    $secret = config()['jwt_secret'] ?? 'dev-secret';
    $header = b64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $body = b64url_encode(json_encode($payload));
    $signature = b64url_encode(hash_hmac('sha256', "$header.$body", $secret, true));
    return "$header.$body.$signature";
}

function jwt_verify(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $body, $signature] = $parts;
    $secret = config()['jwt_secret'] ?? 'dev-secret';
    $expected = b64url_encode(hash_hmac('sha256', "$header.$body", $secret, true));
    if (!hash_equals($expected, $signature)) return null;

    $payload = json_decode(b64url_decode($body), true);
    if (!is_array($payload)) return null;
    if (isset($payload['exp']) && $payload['exp'] < time()) return null;

    return $payload;
}
