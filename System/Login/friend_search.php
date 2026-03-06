<?php
include 'config.php';

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'message' => 'Not authenticated'
    ]);
    exit();
}

$mode = $_GET['mode'] ?? 'name';
$q = trim((string) ($_GET['q'] ?? ''));
$currentUserId = (int) $_SESSION['user_id'];
$limit = 50;

if ($mode !== 'id') {
    $mode = 'name';
}

if ($mode === 'id') {
    $like = '%' . preg_replace('/[^0-9]/', '', $q) . '%';
    $sql = "SELECT id, username
            FROM users
            WHERE id <> ? AND CAST(id AS CHAR) LIKE ?
            ORDER BY id ASC
            LIMIT ?";
} else {
    $like = '%' . $q . '%';
    $sql = "SELECT id, username
            FROM users
            WHERE id <> ? AND username LIKE ?
            ORDER BY username ASC
            LIMIT ?";
}

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Failed to prepare search query'
    ]);
    exit();
}

$stmt->bind_param("isi", $currentUserId, $like, $limit);
$stmt->execute();
$result = $stmt->get_result();

$players = [];
while ($row = $result->fetch_assoc()) {
    $players[] = [
        'id' => (string) $row['id'],
        'name' => (string) $row['username'],
        'level' => 'LV ?',
        'status' => 'Player'
    ];
}

$stmt->close();

echo json_encode([
    'ok' => true,
    'mode' => $mode,
    'query' => $q,
    'players' => $players
]);
?>
