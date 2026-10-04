<?php
// Simulasi request register PERSIS seperti lewat web (routing + handler)
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/api/index.php?r=%2Fapi%2Fv1%2Fauth%2Fregister';
$_GET['r'] = '/api/v1/auth/register';
$_SERVER['HTTP_ORIGIN'] = '';

echo "MULAI ROUTER\n";
require __DIR__ . '/api/index.php';
echo "ROUTER SELESAI\n";
