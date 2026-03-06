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

$userId = (int) $_SESSION['user_id'];

$createSql = "CREATE TABLE IF NOT EXISTS user_progress (
    user_id INT NOT NULL PRIMARY KEY,
    level INT NOT NULL DEFAULT 0,
    coins INT NOT NULL DEFAULT 0,
    gems INT NOT NULL DEFAULT 0,
    stars INT NOT NULL DEFAULT 0,
    iq_high_score INT NOT NULL DEFAULT 0,
    platform_level INT NOT NULL DEFAULT 1,
    platform_points INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if (!$conn->query($createSql)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Failed to initialize progress table',
        'error' => $conn->error
    ]);
    exit();
}

$insertSql = "INSERT IGNORE INTO user_progress (user_id) VALUES (?)";
$insertStmt = $conn->prepare($insertSql);
$insertStmt->bind_param("i", $userId);
$insertStmt->execute();
$insertStmt->close();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    $selectSql = "SELECT user_id, level, coins, gems, stars, iq_high_score, platform_level, platform_points, updated_at
                  FROM user_progress
                  WHERE user_id = ?";
    $selectStmt = $conn->prepare($selectSql);
    $selectStmt->bind_param("i", $userId);
    $selectStmt->execute();
    $result = $selectStmt->get_result();
    $row = $result->fetch_assoc();
    $selectStmt->close();

    echo json_encode([
        'ok' => true,
        'progress' => $row
    ]);
    exit();
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

$raw = file_get_contents('php://input');
$json = json_decode($raw, true);
$payload = is_array($json) ? $json : $_POST;
$action = $payload['action'] ?? $action;

if ($action !== 'update') {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Invalid action'
    ]);
    exit();
}

$selectCurrentSql = "SELECT level, coins, gems, stars, iq_high_score, platform_level, platform_points
                     FROM user_progress
                     WHERE user_id = ?";
$selectCurrentStmt = $conn->prepare($selectCurrentSql);
$selectCurrentStmt->bind_param("i", $userId);
$selectCurrentStmt->execute();
$currentResult = $selectCurrentStmt->get_result();
$current = $currentResult->fetch_assoc();
$selectCurrentStmt->close();

$level = isset($payload['level']) ? max((int) $current['level'], (int) $payload['level']) : (int) $current['level'];
$coins = isset($payload['coins']) ? max(0, (int) $payload['coins']) : (int) $current['coins'];
$gems = isset($payload['gems']) ? max(0, (int) $payload['gems']) : (int) $current['gems'];
$stars = isset($payload['stars']) ? max(0, (int) $payload['stars']) : (int) $current['stars'];
$iqHighScore = isset($payload['iq_high_score']) ? max((int) $current['iq_high_score'], (int) $payload['iq_high_score']) : (int) $current['iq_high_score'];
$platformLevel = isset($payload['platform_level']) ? max((int) $current['platform_level'], (int) $payload['platform_level']) : (int) $current['platform_level'];
$platformPoints = isset($payload['platform_points']) ? max((int) $current['platform_points'], (int) $payload['platform_points']) : (int) $current['platform_points'];

$updateSql = "UPDATE user_progress
              SET level = ?, coins = ?, gems = ?, stars = ?, iq_high_score = ?, platform_level = ?, platform_points = ?
              WHERE user_id = ?";
$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param("iiiiiiii", $level, $coins, $gems, $stars, $iqHighScore, $platformLevel, $platformPoints, $userId);
$ok = $updateStmt->execute();
$updateStmt->close();

if (!$ok) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Failed to update progress',
        'error' => $conn->error
    ]);
    exit();
}

echo json_encode([
    'ok' => true,
    'progress' => [
        'user_id' => $userId,
        'level' => $level,
        'coins' => $coins,
        'gems' => $gems,
        'stars' => $stars,
        'iq_high_score' => $iqHighScore,
        'platform_level' => $platformLevel,
        'platform_points' => $platformPoints
    ]
]);
?>
