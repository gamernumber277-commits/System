<?php
session_start();
include "config.php";

$email = $_POST['email'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['user_id_number'] = $user['user_id_number'] ?? '';
        
        $_SESSION['show_dialogue'] = true; 

        header("Location: dashboard.php");
        exit(); 
    } else {
        $_SESSION['error'] = "Invalid password!";
        header("Location: login.php");
        exit();
    }
} else {
    $_SESSION['error'] = "User not found!";
    header("Location: login.php");
    exit();
}
?>