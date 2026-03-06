<?php
include '../Login/config.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

if ($action === 'get') {
    $game = $_GET['game'] ?? 'maze';
    
    // Validate game name
    $allowed_games = ['maze', 'iqgame', 'platform'];
    if (!in_array(strtolower($game), $allowed_games)) {
        echo json_encode(['ok' => false, 'error' => 'Invalid game']);
        exit;
    }
    
    $game = strtolower($game);
    
    // Create table if not exists
    $table = "leaderboard_$game";
    $createTable = "CREATE TABLE IF NOT EXISTS $table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(255) NOT NULL,
        user_id_number VARCHAR(50) NOT NULL,
        time_recorded VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->query($createTable);
    
    // Rank maze results by fastest completion time, then oldest submission first for ties.
    $orderBy = "CAST(REPLACE(time_recorded, 's', '') AS DECIMAL(10,2)) ASC, created_at ASC";
    $stmt = $conn->prepare("SELECT username, user_id_number, time_recorded, created_at FROM $table ORDER BY $orderBy LIMIT 50");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $leaderboard = [];
    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = $row;
    }
    
    echo json_encode(['ok' => true, 'leaderboard' => $leaderboard]);
    exit;
}

if ($action === 'add') {
    $game = $_GET['game'] ?? '';
    $time = $_POST['time'] ?? '';
    
    // Validate game name
    $allowed_games = ['maze', 'iqgame', 'platform'];
    if (!in_array(strtolower($game), $allowed_games)) {
        echo json_encode(['ok' => false, 'error' => 'Invalid game']);
        exit;
    }
    
    $game = strtolower($game);
    
    // Get user session data
    session_start();
    $user_id = $_SESSION['user_id'] ?? 0;
    $username = $_SESSION['username'] ?? 'Guest';
    $user_id_number = $_SESSION['user_id_number'] ?? 'N/A';
    
    if ($user_id === 0) {
        echo json_encode(['ok' => false, 'error' => 'Not logged in']);
        exit;
    }
    
    $table = "leaderboard_$game";
    $createTable = "CREATE TABLE IF NOT EXISTS $table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(255) NOT NULL,
        user_id_number VARCHAR(50) NOT NULL,
        time_recorded VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->query($createTable);
    
    // Insert score
    $stmt = $conn->prepare("INSERT INTO $table (user_id, username, user_id_number, time_recorded) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $user_id, $username, $user_id_number, $time);
    
    if ($stmt->execute()) {
        echo json_encode(['ok' => true]);
    } else {
        echo json_encode(['ok' => false, 'error' => $stmt->error]);
    }
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Invalid action']);
?>

