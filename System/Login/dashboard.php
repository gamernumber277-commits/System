<?php 
include 'config.php'; 


if (!isset($_SESSION['user_id'])) {
    header("Location: .php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EduQuest - Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #0a4d6d 0%, #1a7a96 50%, #0d5f7a 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        /* Background educational icons pattern */
        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><text x="20" y="40" font-size="30" fill="rgba(255,182,193,0.1)">∑</text><text x="80" y="60" font-size="35" fill="rgba(102,194,255,0.08)">⚛</text><circle cx="150" cy="80" r="15" fill="rgba(255,215,0,0.08)"/><text x="30" y="140" font-size="28" fill="rgba(255,165,0,0.1)">⚙</text><text x="110" y="170" font-size="32" fill="rgba(100,200,255,0.08)">?</text></svg>');
            background-repeat: repeat;
            background-size: 300px 300px;
            pointer-events: none;
            z-index: 0;
        }

        .welcome-container {
            position: relative;
            z-index: 1;
            text-align: center;
            background: rgba(255, 255, 255, 0.95);
            padding: 60px 80px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 700px;
            width: 90%;
        }

        .welcome-text {
            font-size: 28px;
            color: #333;
            margin-bottom: 30px;
            font-weight: 500;
            letter-spacing: 1px;
        }

        .username {
            color: #0a4d6d;
            font-weight: bold;
        }

        .logo-title {
            font-size: 72px;
            font-weight: 900;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6347 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 3px 3px 6px rgba(139, 69, 19, 0.2);
            margin: 30px 0;
            letter-spacing: -2px;
            filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.1));
        }

        .proceed-btn {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            border: none;
            color: white;
            padding: 18px 60px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 50px;
            cursor: pointer;
            margin-top: 40px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .proceed-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
            background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
        }

        .proceed-btn:active {
            transform: translateY(-1px);
        }

        .logout-link {
            position: absolute;
            top: 20px;
            right: 30px;
            color: white;
            text-decoration: none;
            font-size: 14px;
            background: rgba(255, 69, 0, 0.7);
            padding: 8px 16px;
            border-radius: 5px;
            transition: all 0.3s ease;
            z-index: 2;
        }

        .logout-link:hover {
            background: rgba(255, 69, 0, 1);
        }

        @media (max-width: 600px) {
            .welcome-container {
                padding: 40px 30px;
            }

            .logo-title {
                font-size: 48px;
            }

            .welcome-text {
                font-size: 20px;
            }

            .proceed-btn {
                padding: 14px 40px;
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <a href="logout.php" class="logout-link">Logout</a>

    <?php if(isset($_SESSION['show_dialogue'])): ?>
        <script>
            alert("Login Successful!");
        </script>
        <?php unset($_SESSION['show_dialogue']); ?>
    <?php endif; ?>

    <div class="welcome-container">
        <div class="welcome-text">
            Welcome,<span class="username"><?php echo htmlspecialchars($_SESSION['username']); ?></span>!
        </div>
        
        <div class="logo-title">EduQuest</div>
        
        <button class="proceed-btn" onclick="window.location.href='../Home/home.html'">PROCEED</button>
    </div>

</body>
</html>