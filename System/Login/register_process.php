<?php
include "config.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];


    $checkEmail = $conn->prepare("SELECT email FROM users WHERE email = ?");
    $checkEmail->bind_param("s", $email);
    $checkEmail->execute();
    $result = $checkEmail->get_result();

    if ($result->num_rows > 0) {
        $_SESSION['error'] = "Email already registered!";
        header("Location: register.php");
        exit();
    }

  
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Generate unique user ID number
    $user_id_number = rand(1000, 9999);
    
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, user_id_number) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sssi", $username, $email, $password_hash, $user_id_number);

    if ($stmt->execute()) {
        $_SESSION['success'] = "Registration successful! Please login.";
        header("Location: login.php");
    } else {
        $_SESSION['error'] = "Registration failed. Please try again.";
        header("Location: register.php");
    }
    $stmt->close();
    $conn->close();
    exit();
}
?>