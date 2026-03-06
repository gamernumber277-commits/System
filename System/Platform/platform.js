const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const PROGRESS_API_URL = '../Login/progress_api.php';

// Config
canvas.width = 1370;
canvas.height = 768;

// Game State
let currentLevel = 1;
const MAX_LEVELS = 10;
let health = 3;
let points = 0;
let timeLeft = 60;
let timerCounter = 0;
let isPaused = false;

// Player & Entities
let player = { x: 50, y: 450, w: 30, h: 30, velX: 0, velY: 0, jumping: false };
let enemy = { x: 400, y: 400, w: 30, h: 30, speed: 1.5 };
let goal = { x: 700, y: 160, w: 30, h: 30 };
let platforms = [];
let levelColor = "#141e3c";

// Input Handling
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyR') restartGame();
});
window.addEventListener('keyup', e => keys[e.code] = false);

function goHome() {
    window.location.href = '../Home/home.html';
}

async function loadAccountProgress() {
    try {
        const response = await fetch(`${PROGRESS_API_URL}?action=get`, {
            credentials: 'include'
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!data || !data.ok || !data.progress) return;

        currentLevel = Math.max(1, parseInt(data.progress.platform_level || 1, 10));
        points = Math.max(0, parseInt(data.progress.platform_points || 0, 10));
        updateUI();
        loadLevel(currentLevel);
    } catch (error) {
        // Keep defaults when backend is unavailable.
    }
}

async function saveAccountProgress() {
    try {
        await fetch(PROGRESS_API_URL, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'update',
                level: currentLevel,
                platform_level: currentLevel,
                platform_points: points
            })
        });
    } catch (error) {
        // Ignore network failures during gameplay.
    }
}

function loadLevel(level) {
    platforms = [];
    timeLeft = 60;
    player.velX = 0;
    player.velY = 0;
    player.x = 50;
    player.y = 400;
    player.jumping = false;

    enemy.speed = 1.0 + (level * 0.2);
    const colorVal = Math.min(level * 20, 150);
    levelColor = `rgb(${20 + colorVal}, 30, 60)`;

    // Ground
    platforms.push({ x: 0, y: 500, w: 150, h: 20 });

    switch(level) {
        case 1:
            platforms.push({ x: 250, y: 400, w: 100, h: 20 });
            platforms.push({ x: 450, y: 300, w: 100, h: 20 });
            platforms.push({ x: 650, y: 200, w: 150, h: 20 });
            goal.x = 700; goal.y = 160;
            enemy.x = 800; enemy.y = 100;
            break;
        // Additional levels would go here
        default:
            platforms.push({ x: 250, y: 400, w: 100, h: 20 });
            goal.x = 700; goal.y = 160;
    }
}

function restartGame() {
    currentLevel = 1;
    health = 3;
    points = 0;
    isPaused = false;
    document.getElementById('gameOver').classList.add('hidden');
    loadLevel(currentLevel);
}

function askTrivia() {
    isPaused = true;
    const a = Math.floor(Math.random() * (currentLevel * 5)) + 2;
    const b = Math.floor(Math.random() * (currentLevel * 5)) + 2;
    const answer = prompt(`ANSWER: ${a} + ${b}`);

    if (answer !== null && parseInt(answer) === (a + b)) {
        points += (timeLeft * 10);
        if (currentLevel < MAX_LEVELS) {
            currentLevel++;
            loadLevel(currentLevel);
            saveAccountProgress();
        } else {
            alert(`YOU WIN! FINAL SCORE: ${points}`);
            saveAccountProgress();
            restartGame();
        }
    } else {
        health--;
        alert("WRONG! -1 HEALTH");
    }
    isPaused = false;
}

function update() {
    if (health <= 0 || isPaused) {
        if (health <= 0) {
            document.getElementById('gameOver').classList.remove('hidden');
            saveAccountProgress();
        }
        return;
    }

    // Player Input
    if (keys['KeyA']) player.velX = -6;
    else if (keys['KeyD']) player.velX = 6;
    else player.velX = 0;

    if ((keys['KeyW'] || keys['Space']) && !player.jumping) {
        player.velY = -15;
        player.jumping = true;
    }

    // Physics
    player.x += player.velX;
    player.y += player.velY;
    player.velY += 0.8; // Gravity

    // Enemy AI (Follow player)
    if (enemy.x < player.x) enemy.x += enemy.speed;
    else enemy.x -= enemy.speed;
    if (enemy.y < player.y) enemy.y += enemy.speed;
    else enemy.y -= enemy.speed;

    // Platform Collisions
    platforms.forEach(rect => {
        if (player.x < rect.x + rect.w && player.x + player.w > rect.x &&
            player.y < rect.y + rect.h && player.y + player.h > rect.y) {
            
            // Basic SAT collision response
            let overlapX = Math.min(player.x + player.w - rect.x, rect.x + rect.w - player.x);
            let overlapY = Math.min(player.y + player.h - rect.y, rect.y + rect.h - player.y);

            if (overlapY < overlapX) {
                if (player.y < rect.y) { // Top
                    player.y = rect.y - player.h;
                    player.velY = 0;
                    player.jumping = false;
                } else { // Bottom
                    player.y = rect.y + rect.h;
                    player.velY = 0;
                }
            } else {
                if (player.x < rect.x) player.x = rect.x - player.w;
                else player.x = rect.x + rect.w;
            }
        }
    });

    // Enemy Collision
    if (player.x < enemy.x + enemy.w && player.x + player.w > enemy.x &&
        player.y < enemy.y + enemy.h && player.y + player.h > enemy.y) {
        health--;
        player.x = 50; player.y = 400;
    }

    // Fall off screen
    if (player.y > canvas.height) {
        health--;
        player.x = 50; player.y = 400;
    }

    // Goal Collision
    if (player.x < goal.x + goal.w && player.x + player.w > goal.x &&
        player.y < goal.y + goal.h && player.y + player.h > goal.y) {
        askTrivia();
    }

    // Timer Logic (roughly 60fps)
    timerCounter++;
    if (timerCounter >= 60) {
        timeLeft--;
        timerCounter = 0;
        if (timeLeft <= 0) health = 0;
    }

    updateUI();
}

function updateUI() {
    document.getElementById('levelVal').innerText = currentLevel;
    document.getElementById('healthVal').innerText = health;
    document.getElementById('pointsVal').innerText = points;
    document.getElementById('timerVal').innerText = timeLeft;
}

function draw() {
    ctx.fillStyle = levelColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Platforms
    ctx.fillStyle = "lightgray";
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // Goal
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(goal.x + 15, goal.y + 15, 15, 0, Math.PI * 2);
    ctx.fill();

    // Enemy
    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

    // Player
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.w, player.h);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.getElementById('homeBtn').onclick = goHome;
loadLevel(1);
loadAccountProgress();
gameLoop();
