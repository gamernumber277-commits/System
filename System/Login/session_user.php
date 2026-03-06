<?php
include 'config.php';

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['user_id']) || !isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'message' => 'Not authenticated'
    ]);
    exit();
}

echo json_encode([
    'ok' => true,
    'user_id' => $_SESSION['user_id'],
    'username' => $_SESSION['username'],
    'user_id_number' => $_SESSION['user_id_number'] ?? ''
]);
?>
