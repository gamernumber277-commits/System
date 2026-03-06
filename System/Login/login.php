<?php include 'config.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Lake View</title>
    <style>
        :root {
            --bg-1: #0e1f36;
            --bg-2: #0a1729;
            --bg-3: #060d18;
            --panel-1: #0e2742;
            --panel-2: #081d33;
            --panel-3: #061424;
            --line-soft: rgba(134, 183, 228, 0.42);
            --mint: #78e59b;
            --mint-2: #4ec879;
            --mint-glow: rgba(120, 229, 155, 0.35);
            --text-main: #e9f7ff;
            --text-sub: #b7d7e8;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: radial-gradient(circle at 50% -10%, #0b1630 0%, #040913 52%, #01040a 100%);
            color: var(--text-main);
            overflow: hidden;
            padding: 0;
        }

        .room {
            position: relative;
            width: 100vw;
            height: 100vh;
            min-height: 100vh;
            transition: opacity 0.5s ease;
        }

        .scene {
            position: relative;
            width: 100%;
            height: 100%;
            border: 0;
            background: radial-gradient(circle at 24% 26%, #0a1a31 0%, #050f20 48%, #020811 100%);
            box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.82);
            overflow: hidden;
        }

        .scene::after {
            content: "";
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 70% 35%, rgba(31, 118, 189, 0.09), transparent 52%);
            pointer-events: none;
        }

        .scene::before {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            width: 980px;
            height: 620px;
            transform: translate(-50%, -50%);
            border: 1px solid rgba(132, 194, 228, 0.35);
            border-radius: 16px;
            box-shadow: inset 0 0 30px rgba(19, 52, 84, 0.45), 0 0 24px rgba(21, 66, 104, 0.18);
            pointer-events: none;
            z-index: 0;
        }

        .lamp-zone {
            position: absolute;
            left: calc(50% - 430px);
            top: 50%;
            transform: translateY(-50%);
            width: 360px;
            height: 560px;
            z-index: 5;
            --pull-x: 76px;
            --pull-y: 252px;
        }

        .rope-group {
            position: absolute;
            inset: 0;
            z-index: 8;
        }

        .rope-svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: visible;
            pointer-events: none;
        }

        .rope-line {
            stroke: #dbe9f8;
            stroke-width: 2.2;
            stroke-linecap: round;
            filter: none;
            transition: x2 0.26s cubic-bezier(0.2, 0.8, 0.2, 1), y2 0.26s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .pull {
            position: absolute;
            top: var(--pull-y);
            left: var(--pull-x);
            transform: translate(-50%, -50%);
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 1px solid #c9dae8;
            background: radial-gradient(circle at 30% 30%, #f6fbff, #9cafc2);
            cursor: pointer;
            transition: transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.18s ease;
            touch-action: none;
        }

        .rope-group.dragging .rope-line,
        .rope-group.dragging .pull {
            transition: none;
        }

        .rope-group.snapback .rope-line,
        .rope-group.snapback .pull {
            transition: none;
        }

        .pull:active {
            box-shadow: 0 0 0 4px rgba(186, 215, 240, 0.2);
        }

        .lamp-head {
            position: absolute;
            top: 48px;
            left: 36px;
            width: 152px;
            height: 96px;
            border-radius: 62px 62px 28px 28px;
            background: linear-gradient(180deg, #a3c39a 0%, #6e8f67 100%);
            border: 2px solid #476247;
            transition: box-shadow 0.2s ease, transform 0.25s ease, filter 0.25s ease;
            z-index: 6;
        }

        .face-eye {
            position: absolute;
            top: 38px;
            width: 14px;
            height: 7px;
            border-bottom: 2px solid #071117;
            border-radius: 0 0 14px 14px;
            transition: all 0.22s ease;
        }

        .face-eye.left {
            left: 40px;
        }

        .face-eye.right {
            right: 40px;
        }

        .face-mouth {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            background: #0f1213;
            transition: opacity 0.18s ease, transform 0.18s ease;
        }

        .mouth-smile {
            top: 56px;
            width: 26px;
            height: 13px;
            border-radius: 0 0 22px 22px;
            opacity: 1;
        }

        .mouth-smile::before,
        .mouth-smile::after {
            content: "";
            position: absolute;
            top: 4px;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: #ff7d95;
        }

        .mouth-smile::before {
            left: -8px;
        }

        .mouth-smile::after {
            right: -8px;
        }

        .mouth-sad {
            top: 58px;
            width: 24px;
            height: 10px;
            border-radius: 14px 14px 0 0;
            transform: translateX(-50%) rotate(180deg);
            opacity: 0;
        }

        .lamp-neck {
            position: absolute;
            top: 145px;
            left: 104px;
            width: 15px;
            height: 198px;
            border-radius: 7px;
            background: linear-gradient(180deg, #f5f9fd, #a2b3c1);
            z-index: 6;
        }

        .lamp-base {
            position: absolute;
            top: 336px;
            left: 70px;
            width: 86px;
            height: 18px;
            border-radius: 50%;
            background: radial-gradient(circle at 50% 30%, #fbffff, #a6b1ba);
            border: 1px solid #9eacb7;
            z-index: 6;
        }

        .lamp-floor-shadow {
            position: absolute;
            top: 352px;
            left: 60px;
            width: 112px;
            height: 20px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.33);
            filter: blur(2px);
            z-index: 2;
        }

        .light-cone {
            position: absolute;
            top: 146px;
            left: 112px;
            transform: translateX(-50%);
            width: 560px;
            height: 540px;
            clip-path: polygon(47% 0, 53% 0, 94% 100%, 6% 100%);
            background: linear-gradient(180deg, rgba(120, 229, 155, 0.75), rgba(120, 229, 155, 0.25) 58%, rgba(120, 229, 155, 0.08) 100%);
            opacity: 0;
            transition: opacity 0.24s ease, filter 0.24s ease;
            pointer-events: none;
            z-index: 1;
            filter: drop-shadow(0 16px 40px rgba(78, 200, 121, 0.6)) blur(0.2px);
            mask-image: radial-gradient(circle at 50% 20%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%);
        }

        .login-card {
            position: absolute;
            top: 50%;
            left: calc(50% + 40px);
            transform: translateY(-50%) translateX(190px) scale(0.98);
            width: 360px;
            background: rgba(7, 25, 37, 0.9);
            border: 1px solid rgba(120, 229, 155, 0.68);
            border-radius: 14px;
            box-shadow: 0 0 16px var(--mint-glow), 0 10px 18px rgba(0, 0, 0, 0.35);
            padding: 26px 22px 20px;
            opacity: 0;
            visibility: hidden;
            filter: blur(4px);
            pointer-events: none;
            transition: transform 0.32s ease, opacity 0.28s ease, filter 0.28s ease, visibility 0s linear 0.32s;
            z-index: 7;
        }

        .login-card::before {
            content: "";
            position: absolute;
            top: 12px;
            bottom: 12px;
            left: -12px;
            width: 12px;
            border-radius: 8px 0 0 8px;
            background: linear-gradient(180deg, rgba(186, 247, 167, 0.72), rgba(186, 247, 167, 0.06));
            opacity: 0;
            transition: opacity 0.24s ease, box-shadow 0.24s ease;
        }

        .login-card::after {
            content: "";
            position: absolute;
            top: 12px;
            bottom: 12px;
            right: -12px;
            width: 12px;
            border-radius: 0 8px 8px 0;
            background: linear-gradient(180deg, rgba(186, 247, 167, 0.72), rgba(186, 247, 167, 0.06));
            opacity: 0;
            transition: opacity 0.24s ease, box-shadow 0.24s ease;
        }

        .login-card h2 {
            font-size: 32px;
            margin-bottom: 6px;
            color: #effff3;
        }

        .subtext {
            font-size: 14px;
            color: #b7dcc5;
            margin-bottom: 18px;
        }

        .error-box {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 8px;
            border: 1px solid rgba(255, 112, 112, 0.55);
            background: rgba(255, 112, 112, 0.14);
            color: #ffd6d6;
            font-size: 13px;
            text-align: center;
        }

        input {
            width: 100%;
            height: 46px;
            margin-bottom: 12px;
            border: 1px solid rgba(129, 188, 163, 0.6);
            border-radius: 8px;
            background: rgba(6, 21, 34, 0.86);
            color: #effcf4;
            padding: 0 14px;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
            font-size: 16px;
        }

        input:focus {
            border-color: var(--mint-2);
            box-shadow: 0 0 0 3px rgba(78, 200, 121, 0.2);
            background: rgba(8, 26, 39, 0.92);
        }

        .submit-btn {
            width: 100%;
            height: 44px;
            margin-top: 4px;
            border: 1px solid rgba(123, 195, 148, 0.55);
            border-radius: 8px;
            background: rgba(11, 31, 47, 0.85);
            color: #d9e9f3;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s ease, filter 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
            font-size: 17px;
        }

        .submit-btn:hover {
            transform: translateY(-1px);
            background: linear-gradient(180deg, var(--mint), var(--mint-2));
            color: #05200c;
            border-color: rgba(137, 227, 159, 0.95);
            box-shadow: 0 0 16px rgba(120, 229, 155, 0.45);
            filter: brightness(1.02);
        }

        .back-link {
            display: block;
            text-align: center;
            margin-top: 16px;
            font-size: 14px;
            color: var(--text-sub);
            text-decoration: none;
        }

        .back-link:hover {
            color: #d8f0ff;
        }

        .room.lit .light-cone {
            opacity: 1;
        }

        .room.lit .scene {
            box-shadow: inset 0 0 70px rgba(78, 200, 121, 0.35), inset 0 20px 80px rgba(120, 229, 155, 0.2);
        }

        .room.lit .lamp-head {
            box-shadow: 0 0 26px rgba(120, 229, 155, 1), 0 0 40px rgba(78, 200, 121, 0.8);
            transform: translateY(-2px);
            filter: saturate(1.15) brightness(1.2);
        }

        .room.lit .face-eye {
            top: 34px;
            width: 12px;
            height: 12px;
            border-bottom: 0;
            border-radius: 50%;
            background: #0b1218;
            animation: cuteBlink 3.2s infinite;
        }

        .room.lit .face-eye.left {
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08) inset;
        }

        .room.lit .face-eye.right {
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08) inset;
        }

        .room.lit .mouth-smile {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        .room.lit .mouth-sad {
            opacity: 0;
            transform: translateX(-50%) rotate(180deg) translateY(2px);
        }

        .room:not(.lit) .mouth-smile {
            opacity: 0;
            transform: translateX(-50%) translateY(2px);
        }

        .room:not(.lit) .mouth-sad {
            opacity: 1;
            transform: translateX(-50%) rotate(180deg) translateY(0);
        }

        .room:not(.lit) .face-eye {
            background: transparent;
            animation: none;
        }

        @keyframes cuteBlink {
            0%, 42%, 46%, 100% { transform: scaleY(1); }
            44% { transform: scaleY(0.15); }
        }

        .room.lit .login-card {
            transform: translateY(-50%) translateX(0) scale(1);
            opacity: 1;
            visibility: visible;
            filter: blur(0);
            pointer-events: auto;
            transition-delay: 0s, 0s, 0s, 0s;
        }

        .room.lit .login-card::before {
            opacity: 1;
            box-shadow: -8px 0 35px rgba(120, 229, 155, 0.9);
        }

        .room.lit .login-card::after {
            opacity: 1;
            box-shadow: 8px 0 35px rgba(120, 229, 155, 0.9);
        }

        .admin-corner {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }

        .admin-btn {
            background: #ff4b2b;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: background 0.3s;
        }

        .admin-btn:hover {
            background: #ff6b5b;
        }
    </style>
</head>
<body>
    <div class="room" id="room">
        <div class="scene">
            <div class="lamp-zone">
                <div class="rope-group" id="ropeGroup">
                    <svg class="rope-svg" viewBox="0 0 360 560" preserveAspectRatio="none" aria-hidden="true">
                        <line id="ropeLine" class="rope-line" x1="76" y1="145" x2="76" y2="252"></line>
                    </svg>
                    <button type="button" id="lampPull" class="pull" aria-label="Pull lamp cord"></button>
                </div>

                <div class="lamp-head">
                    <span class="face-eye left"></span>
                    <span class="face-eye right"></span>
                    <span class="face-mouth mouth-smile"></span>
                    <span class="face-mouth mouth-sad"></span>
                </div>
                <div class="lamp-neck"></div>
                <div class="lamp-base"></div>
                <div class="lamp-floor-shadow"></div>
                <div class="light-cone"></div>
            </div>

            <form id="loginForm" class="login-card" action="login.process.php" method="POST">
                <h2>Welcome Back</h2>
                <p class="subtext">Login to your account</p>

                <?php if (isset($_SESSION['error'])): ?>
                    <div class="error-box">
                        <?php echo htmlspecialchars($_SESSION['error'], ENT_QUOTES, 'UTF-8'); unset($_SESSION['error']); ?>
                    </div>
                <?php endif; ?>

                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Password" required>

                <button type="submit" class="submit-btn">Login</button>
                <a href="#" onclick="animateTo('register.php')" class="back-link">Need an account? Register here</a>
            </form>
        </div>
    </div>

    <script>
        (function () {
            const room = document.getElementById('room');
            const lampPull = document.getElementById('lampPull');
            const ropeGroup = document.getElementById('ropeGroup');
            const ropeLine = document.getElementById('ropeLine');
            const lampZone = document.querySelector('.lamp-zone');
            const hasError = <?php echo isset($_SESSION['error']) ? 'true' : 'false'; ?>;
            const anchorX = 76;
            const anchorY = 145;
            const restX = 76;
            const restY = 252;
            let dragging = false;
            let dragOffsetX = 0;
            let dragOffsetY = 0;
            let pullX = restX;
            let pullY = restY;
            let snapAnimationId = null;
            let snapVX = 0;
            let snapVY = 0;

            if (hasError) {
                room.classList.add('lit');
            }

            function pointerToLocal(event) {
                const rect = lampZone.getBoundingClientRect();
                return {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                };
            }

            function setRopeState(x, y) {
                const clampedX = Math.max(24, Math.min(180, x));
                const clampedY = Math.max(170, Math.min(390, y));
                pullX = clampedX;
                pullY = clampedY;

                lampZone.style.setProperty('--pull-x', pullX + 'px');
                lampZone.style.setProperty('--pull-y', pullY + 'px');
                ropeLine.setAttribute('x1', String(anchorX));
                ropeLine.setAttribute('y1', String(anchorY));
                ropeLine.setAttribute('x2', String(pullX));
                ropeLine.setAttribute('y2', String(pullY));
            }

            function stopSnapAnimation() {
                if (snapAnimationId !== null) {
                    cancelAnimationFrame(snapAnimationId);
                    snapAnimationId = null;
                }
            }

            function animateSnapBack() {
                ropeGroup.classList.remove('dragging');
                ropeGroup.classList.add('snapback');
                stopSnapAnimation();
                snapVX = 0;
                snapVY = 0;

                const spring = 0.22;
                const damping = 0.74;

                function step() {
                    const dx = restX - pullX;
                    const dy = restY - pullY;

                    snapVX = (snapVX + dx * spring) * damping;
                    snapVY = (snapVY + dy * spring) * damping;

                    pullX += snapVX;
                    pullY += snapVY;
                    setRopeState(pullX, pullY);

                    const velocityMag = Math.sqrt((snapVX * snapVX) + (snapVY * snapVY));
                    const distMag = Math.sqrt((dx * dx) + (dy * dy));

                    if (velocityMag < 0.15 && distMag < 0.35) {
                        setRopeState(restX, restY);
                        ropeGroup.classList.remove('snapback');
                        snapAnimationId = null;
                        return;
                    }
                    snapAnimationId = requestAnimationFrame(step);
                }

                snapAnimationId = requestAnimationFrame(step);
            }

            lampPull.addEventListener('pointerdown', function (event) {
                stopSnapAnimation();
                dragging = true;
                const local = pointerToLocal(event);
                dragOffsetX = local.x - pullX;
                dragOffsetY = local.y - pullY;
                ropeGroup.classList.add('dragging');
                lampPull.setPointerCapture(event.pointerId);
            });

            lampPull.addEventListener('pointermove', function (event) {
                if (!dragging) return;
                const local = pointerToLocal(event);
                setRopeState(local.x - dragOffsetX, local.y - dragOffsetY);
            });

            function finishPull(event) {
                if (!dragging) return;
                dragging = false;
                try { lampPull.releasePointerCapture(event.pointerId); } catch (e) {}
                const displacement = Math.sqrt(((pullX - restX) * (pullX - restX)) + ((pullY - restY) * (pullY - restY)));
                const shouldToggle = displacement > 30;
                animateSnapBack();
                if (shouldToggle) {
                    room.classList.toggle('lit');
                }
            }

            lampPull.addEventListener('pointerup', finishPull);
            lampPull.addEventListener('pointercancel', function () {
                dragging = false;
                animateSnapBack();
            });
            lampPull.addEventListener('lostpointercapture', function () {
                if (dragging) {
                    dragging = false;
                    animateSnapBack();
                }
            });

            if (hasError) {
                room.classList.add('lit');
            }
            setRopeState(restX, restY);

            room.style.opacity = '0';
            setTimeout(() => { room.style.opacity = '1'; }, 50);

            function animateTo(url) {
                room.classList.add('fade-out');
                setTimeout(() => window.location.href = url, 500);
            }

            window.animateTo = animateTo;
        })();
    </script>
</body>
</html>