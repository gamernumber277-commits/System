<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: admin.login.php');
    exit();
}

$admin_user = trim($_POST['admin_user'] ?? '');
$admin_pass = $_POST['admin_pass'] ?? '';

if ($admin_user === '' || $admin_pass === '') {
    $_SESSION['error'] = 'Invalid credentials.';
    header('Location: admin.login.php');
    exit();
}

$sql = 'SELECT id, username, password FROM admin WHERE username = ? ORDER BY id DESC';
$stmt = $conn->prepare($sql);

if (!$stmt) {
    $_SESSION['error'] = 'Login temporarily unavailable.';
    header('Location: admin.login.php');
    exit();
}

$stmt->bind_param('s', $admin_user);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows < 1) {
    $_SESSION['error'] = 'Invalid credentials.';
    header('Location: admin.login.php');
    exit();
}

$matchedAdmin = null;
while ($admin = $result->fetch_assoc()) {
    $storedPassword = $admin['password'];
    $isValidPassword = password_verify($admin_pass, $storedPassword) || hash_equals($storedPassword, $admin_pass);
    if ($isValidPassword) {
        $matchedAdmin = $admin;
        break;
    }
}

if ($matchedAdmin === null) {
    $_SESSION['error'] = 'Invalid credentials.';
    header('Location: admin.login.php');
    exit();
}

$_SESSION['user_id'] = $matchedAdmin['id'];
$_SESSION['username'] = $matchedAdmin['username'];
$_SESSION['show_dialogue'] = true;

header('Location: dashboard.php');
exit();
?>
