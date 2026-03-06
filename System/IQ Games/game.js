// ==================== GAME CONFIGURATION ====================
const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');
const PLAYER_SIZE = 40;
const CANVAS_WIDTH = CANVAS.width;
const CANVAS_HEIGHT = CANVAS.height;
const SESSION_API_URL = '../Login/session_user.php';
const PROGRESS_API_URL = '../Login/progress_api.php';

// ==================== CLASSES ====================

class Question {
    constructor(text, correctAns, wrongAns) {
        this.text = text;
        this.correctAns = correctAns;
        this.wrongAns = wrongAns;
    }
}

class MovingObstacle {
    constructor(x, y, w, h, horizontal, speed) {
        this.rect = { x, y, width: w, height: h };
        this.horizontal = horizontal;
        this.speed = speed;
    }

    move(panelWidth, panelHeight) {
        if (this.horizontal) {
            this.rect.x += this.speed;
            if (this.rect.x > panelWidth) this.rect.x = -this.rect.width;
            if (this.rect.x + this.rect.width < 0) this.rect.x = panelWidth;
        } else {
            this.rect.y += this.speed;
            if (this.rect.y > panelHeight) this.rect.y = -this.rect.height;
            if (this.rect.y + this.rect.height < 0) this.rect.y = panelHeight;
        }
    }
}

class PowerUp {
    constructor(x, y, w, h, type, duration) {
        this.rect = { x, y, width: w, height: h };
        this.type = type; // "star", "clock", "shield"
        this.duration = duration;
    }
}

class Badge {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
}

// ==================== GAME STATE ====================

const game = {
    username: '',
    subject: '',
    playerX: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    playerY: CANVAS_HEIGHT - 150,
    keys: { w: false, a: false, s: false, d: false },
    score: 0,
    timeLeft: 60,
    level: 1,
    combo: 0,
    maxCombo: 0,
    questionsAnswered: 0,
    totalQuestions: 0,
    gameOver: false,
    gameRunning: false,
    
    // UI State
    correctBox: { x: 0, y: 200, width: 200, height: 50 },
    wrongBox: { x: 0, y: 400, width: 200, height: 50 },
    moveRight: true,
    answerBoxSpeed: 2,
    bonusDisplayCounter: 0,
    timeBonusMessage: '',
    
    // Questions
    currentQuestion: '',
    correctAns: '',
    wrongAns: '',
    
    // Obstacles & PowerUps
    obstacles: [],
    powerUps: [],
    
    // Timers
    shieldTimer: 0,
    timeBoostTimer: 0,
    scoreBoostTimer: 0,
    respawnInvincibility: 0,
    
    // Badges
    earnedBadges: [],
};

// ==================== QUESTION POOLS ====================

const questionPools = {
    Math: [
        new Question("Math: 12 × 8 = ?", "96", "98"),
        new Question("Math: √81 = ?", "9", "8"),
        new Question("Math: 25% of 200 = ?", "50", "40"),
        new Question("Math: 15 + 27 = ?", "42", "40"),
        new Question("Math: 100 ÷ 4 = ?", "25", "20"),
        new Question("Math: 7 × 9 = ?", "63", "64"),
        new Question("Math: 5² = ?", "25", "20"),
        new Question("Math: 45 − 18 = ?", "27", "30"),
        new Question("Math: 3³ = ?", "27", "9"),
        new Question("Math: 2 × (10 + 5) = ?", "30", "25"),
        new Question("Math: 1/2 of 60 = ?", "30", "20"),
        new Question("Math: 14 × 3 = ?", "42", "41"),
        new Question("Math: 100 − 75 = ?", "25", "20"),
        new Question("Math: 9 × 11 = ?", "99", "100"),
        new Question("Math: (8 × 7) ÷ 2 = ?", "28", "30"),
        new Question("Math: 6² = ?", "36", "30"),
        new Question("Math: 120 ÷ 12 = ?", "10", "12"),
        new Question("Math: 5 × 15 = ?", "75", "70"),
        new Question("Math: 200 ÷ 25 = ?", "8", "10"),
        new Question("Math: (4 × 4) + 10 = ?", "26", "24"),
    ],
    Research: [
        new Question("Research: First step in research process?", "Identifying the problem", "Writing the conclusion"),
        new Question("Research: A hypothesis is best described as?", "An educated guess", "A proven fact"),
        new Question("Research: Research design defines?", "The plan for the study", "The final results"),
        new Question("Research: Valid data means?", "Accurate and reliable", "Fabricated"),
        new Question("Research: Literature review purpose?", "Provide background and context", "Write the conclusion"),
        new Question("Research: Sampling is?", "Selecting participants", "Writing results"),
        new Question("Research: Qualitative research focuses on?", "Meaning and experiences", "Numbers only"),
        new Question("Research: Quantitative research focuses on?", "Numerical data", "Feelings only"),
        new Question("Research: A survey is used for?", "Collecting data", "Analyzing results only"),
        new Question("Research: Research ethics require?", "Honesty and integrity", "Cheating"),
        new Question("Research: A variable is?", "A factor that can change", "Always constant"),
        new Question("Research: Independent variable?", "The cause", "The effect"),
        new Question("Research: Dependent variable?", "The effect", "The cause"),
        new Question("Research: Research title should be?", "Clear and concise", "Confusing"),
        new Question("Research: Abstract contains?", "A summary of the study", "References only"),
        new Question("Research: Data analysis means?", "Interpreting collected data", "Writing the introduction"),
        new Question("Research: Conclusion is based on?", "Findings and analysis", "Hypothesis only"),
        new Question("Research: Research instrument example?", "Questionnaire", "Bibliography"),
        new Question("Research: Valid source is?", "Peer-reviewed journal", "Random blog"),
        new Question("Research: Plagiarism is?", "Copying without credit", "Original writing"),
    ],
    Science: [
        new Question("Science: Water formula?", "H2O", "HO2"),
        new Question("Science: Force = ?", "Mass × Acceleration", "Energy × Time"),
        new Question("Science: Earth revolves around the?", "Sun", "Moon"),
        new Question("Science: Speed formula?", "Distance ÷ Time", "Mass ÷ Volume"),
        new Question("Science: Gravity pulls objects?", "Downward", "Upward"),
        new Question("Science: Solid to liquid phase change?", "Melting", "Freezing"),
        new Question("Science: Liquid to gas phase change?", "Evaporation", "Condensation"),
        new Question("Science: Gas to liquid phase change?", "Condensation", "Evaporation"),
        new Question("Science: Newton's 3rd law?", "Action-Reaction", "Gravity only"),
        new Question("Science: SI unit of energy?", "Joule", "Watt"),
        new Question("Science: Heat transfer by contact?", "Conduction", "Radiation"),
        new Question("Science: Heat transfer by waves?", "Radiation", "Conduction"),
        new Question("Science: Heat transfer by fluid motion?", "Convection", "Conduction"),
        new Question("Science: Atom is the smallest unit of?", "Matter", "Energy"),
        new Question("Science: Proton charge?", "Positive", "Negative"),
        new Question("Science: Electron charge?", "Negative", "Positive"),
        new Question("Science: Neutron charge?", "Neutral", "Positive"),
        new Question("Science: Chemical change example?", "Burning", "Cutting"),
        new Question("Science: Physical change example?", "Melting", "Rusting"),
        new Question("Science: Renewable energy example?", "Solar", "Coal"),
    ],
    "Oral Communication": [
        new Question("Oral Com: Effective communication requires?", "Clarity", "Confusion"),
        new Question("Oral Com: Non-verbal communication includes?", "Gestures", "Equations"),
        new Question("Oral Com: Listening is?", "Active process", "Passive only"),
        new Question("Oral Com: Public speaking needs?", "Confidence", "Fear"),
        new Question("Oral Com: Communication model includes?", "Sender & Receiver", "Receiver only"),
        new Question("Oral Com: Feedback is?", "Response", "Silence only"),
        new Question("Oral Com: Eye contact shows?", "Engagement", "Disinterest"),
        new Question("Oral Com: Tone of voice conveys?", "Emotion", "Numbers"),
        new Question("Oral Com: Persuasive speech aims to?", "Convince", "Entertain only"),
        new Question("Oral Com: Informative speech aims to?", "Educate", "Persuade only"),
        new Question("Oral Com: Debate requires?", "Evidence", "Opinions only"),
        new Question("Oral Com: Interview success needs?", "Preparation", "Guessing"),
        new Question("Oral Com: Communication barrier example?", "Noise", "Silence only"),
        new Question("Oral Com: Formal speech uses?", "Structured language", "Slang"),
        new Question("Oral Com: Informal speech uses?", "Casual words", "Technical terms only"),
        new Question("Oral Com: Oral report purpose?", "Share info", "Hide info"),
        new Question("Oral Com: Audience analysis helps?", "Adapt message", "Ignore listeners"),
        new Question("Oral Com: Communication channel example?", "Phone", "Silence only"),
        new Question("Oral Com: Persuasion technique?", "Logic", "Confusion"),
        new Question("Oral Com: Effective speaker shows?", "Confidence", "Nervousness"),
    ],
    Pagbasa: [
        new Question("Pagbasa: Layunin ng pagbasa?", "Pag-unawa", "Pagkalito"),
        new Question("Pagbasa: Kritikal na pagbasa?", "Masusing pagsusuri", "Pagsasaulo lamang"),
        new Question("Pagbasa: Skimming ay?", "Mabilisang pagbasa", "Mabagal na pagsusuri"),
        new Question("Pagbasa: Scanning ay?", "Paghahanap ng detalye", "Pagbuo ng nobela"),
        new Question("Pagbasa: Intensibong pagbasa?", "Masusing pag-aaral", "Pagsasaulo lamang"),
        new Question("Pagbasa: Ekstensibong pagbasa?", "Malawak na saklaw", "Limitado lamang"),
        new Question("Pagbasa: Tekstong deskriptibo?", "Naglalarawan", "Naguutos"),
        new Question("Pagbasa: Tekstong naratibo?", "Nagsasalaysay", "Naglalarawan lamang"),
        new Question("Pagbasa: Tekstong argumentatibo?", "Nanghihikayat", "Naglalarawan"),
        new Question("Pagbasa: Tekstong ekspositori?", "Nagpapaliwanag", "Nagsasalaysay"),
        new Question("Pagbasa: Pangunahing ideya?", "Sentral na paksa", "Maliit na detalye"),
        new Question("Pagbasa: Suportang detalye?", "Nagpapatibay", "Walang saysay"),
        new Question("Pagbasa: Konklusyon ay?", "Pagtatapos", "Simula"),
        new Question("Pagbasa: Tema ng akda?", "Pinakapaksa", "Maliit na detalye"),
        new Question("Pagbasa: Layunin ng may-akda?", "Magpaliwanag", "Magtago ng impormasyon"),
        new Question("Pagbasa: Kritikal na mambabasa?", "Mapanuri", "Walang pakialam"),
        new Question("Pagbasa: Pagbasa ng mapa?", "Pag-unawa sa lokasyon", "Pagbasa ng nobela"),
        new Question("Pagbasa: Pagbasa ng talumpati?", "Pag-unawa sa mensahe", "Pagkakabisado lang"),
        new Question("Pagbasa: Pagbasa ng tula?", "Pag-unawa sa damdamin", "Pagbilang ng salita"),
        new Question("Pagbasa: Pagbasa ng diyaryo?", "Pagkuha ng impormasyon", "Pagkakabisado lang"),
    ]
};

// ==================== UTILITY FUNCTIONS ====================

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rectsIntersect(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function hasBadge(name) {
    return game.earnedBadges.some(b => b.name === name);
}

function addBadge(name, description) {
    if (!hasBadge(name)) {
        game.earnedBadges.push(new Badge(name, description));
        alert(`🏅 Badge Unlocked: ${name}!\n${description}`);
    }
}

// ==================== GAME INITIALIZATION ====================

async function fetchSessionUsername() {
    try {
        const response = await fetch(SESSION_API_URL, { credentials: 'include' });
        if (!response.ok) return null;
        const data = await response.json();
        if (!data || !data.ok || !data.username) return null;
        return data.username;
    } catch (error) {
        return null;
    }
}

async function saveAccountProgress(fields) {
    try {
        await fetch(PROGRESS_API_URL, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.assign({ action: 'update' }, fields))
        });
    } catch (error) {
        // Silent fallback keeps gameplay responsive if backend is unavailable.
    }
}

async function startGame() {
    const sessionUsername = await fetchSessionUsername();
    if (!sessionUsername) {
        alert('Please login first.');
        window.location.href = '../Login/login.php';
        return;
    }

    game.username = sessionUsername;
    const subjects = ["Math", "Research", "Science", "Oral Communication", "Pagbasa"];
    const subject = prompt(`Choose your subject (${subjects.join(", ")}):`);

    if (!subjects.includes(subject)) return;

    game.subject = subject;
    game.totalQuestions = questionPools[subject].length;

    initializeGame();
    showGameUI();
    startGameLoop();
}

function initializeGame() {
    game.score = 0;
    game.timeLeft = 60;
    game.level = 1;
    game.combo = 0;
    game.maxCombo = 0;
    game.questionsAnswered = 0;
    game.gameOver = false;
    game.gameRunning = true;
    game.earnedBadges = [];
    game.playerX = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;
    game.playerY = CANVAS_HEIGHT - 150;
    game.obstacles = [];
    game.powerUps = [];
    game.shieldTimer = 0;
    game.timeBoostTimer = 0;
    game.scoreBoostTimer = 0;
    game.respawnInvincibility = 0;

    // Create obstacles
    game.obstacles = [
        new MovingObstacle(300, 300, 60, 60, true, 3),
        new MovingObstacle(800, 200, 80, 80, true, 2),
        new MovingObstacle(500, 100, 60, 60, false, 3),
        new MovingObstacle(200, 400, 80, 80, false, 2),
    ];

    generateQuestion();

    // Show initial messages
    setTimeout(() => {
        alert("If you got the wrong answer your timer -3 seconds!");
        alert("Avoid obstacles (-5 seconds). Good Luck!");
    }, 100);
}

function generateQuestion() {
    const questions = questionPools[game.subject];
    const q = questions[getRandomInt(0, questions.length - 1)];

    game.currentQuestion = q.text;
    game.correctAns = q.correctAns;
    game.wrongAns = q.wrongAns;

    // Randomize vertical positions
    if (Math.random() > 0.5) {
        game.correctBox.y = 200;
        game.wrongBox.y = 400;
    } else {
        game.correctBox.y = 400;
        game.wrongBox.y = 200;
    }

    // Reset horizontal position
    const boxX = (CANVAS_WIDTH - game.correctBox.width) / 2;
    game.correctBox.x = boxX;
    game.wrongBox.x = boxX;
}

function showGameUI() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameInfo').classList.remove('hidden');
    CANVAS.classList.remove('hidden');
}

function hideGameUI() {
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameInfo').classList.add('hidden');
    CANVAS.classList.add('hidden');
}

function goHome() {
    game.gameRunning = false;
    hideGameUI();
}

function closeLeaderboard() {
    document.getElementById('leaderboardModal').classList.add('hidden');
}

// ==================== GAME LOOP ====================

let gameLoopId = null;

function startGameLoop() {
    if (gameLoopId) cancelAnimationFrame(gameLoopId);

    // Countdown timer
    const countdownIntervalId = setInterval(() => {
        if (!game.gameRunning) {
            clearInterval(countdownIntervalId);
            return;
        }
        if (!game.gameOver) {
            game.timeLeft--;
            if (game.timeLeft <= 0) {
                endGame(`Game Over! Final Score: ${game.score}`);
            }
        }
    }, 1000);

    function update() {
        if (!game.gameRunning) {
            clearInterval(countdownIntervalId);
            return;
        }

        if (game.gameOver) {
            gameLoopId = requestAnimationFrame(update);
            return;
        }

        // Player movement
        const speed = 5;
        if (game.keys.a) game.playerX -= speed;
        if (game.keys.d) game.playerX += speed;
        if (game.keys.w) game.playerY -= speed;
        if (game.keys.s) game.playerY += speed;

        const playerBox = {
            x: game.playerX,
            y: game.playerY,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE
        };

        // Border collision
        if (game.playerX <= 0 || game.playerY <= 0 ||
            game.playerX + PLAYER_SIZE >= CANVAS_WIDTH ||
            game.playerY + PLAYER_SIZE >= CANVAS_HEIGHT) {
            resetMovement();
            endGame(`You touched the red border! Game Over! Final Score: ${game.score}`);
            gameLoopId = requestAnimationFrame(update);
            return;
        }

        // Power-up collision
        for (let i = game.powerUps.length - 1; i >= 0; i--) {
            const pu = game.powerUps[i];
            if (rectsIntersect(playerBox, pu.rect)) {
                switch (pu.type) {
                    case "star":
                        game.scoreBoostTimer = pu.duration;
                        alert("⭐ Score Boost Active!");
                        break;
                    case "clock":
                        game.timeBoostTimer = pu.duration;
                        alert("⏰ Time Boost Active!");
                        break;
                    case "shield":
                        game.shieldTimer = pu.duration;
                        alert("🛡 Shield Active!");
                        break;
                }
                game.powerUps.splice(i, 1);
                resetMovement();
                break;
            }
        }

        // Countdown timers
        if (game.shieldTimer > 0) game.shieldTimer--;
        if (game.timeBoostTimer > 0) game.timeBoostTimer--;
        if (game.scoreBoostTimer > 0) game.scoreBoostTimer--;

        // Correct answer collision
        if (rectsIntersect(playerBox, game.correctBox)) {
            const pointsGained = game.scoreBoostTimer > 0 ? 20 : 10;
            const timeGained = game.timeBoostTimer > 0 ? 5 : 3;

            game.score += pointsGained;
            game.timeLeft += timeGained;
            game.combo++;
            if (game.combo > game.maxCombo) game.maxCombo = game.combo;

            if (game.combo >= 10 && !hasBadge("Combo Master")) {
                addBadge("Combo Master", "Reached a 10 combo streak!");
            }

            game.timeBonusMessage = `(+${timeGained}s)`;
            game.bonusDisplayCounter = 60;

            game.questionsAnswered++;
            checkLevelUp();
            generateQuestion();
            resetPlayer();
            resetMovement();
        }
        // Wrong answer collision
        else if (rectsIntersect(playerBox, game.wrongBox)) {
            game.timeLeft -= 3;
            game.combo = 0;

            if (game.timeLeft <= 0) {
                endGame(`Game Over! Final Score: ${game.score}`);
                gameLoopId = requestAnimationFrame(update);
                return;
            }

            game.questionsAnswered++;
            checkLevelUp();
            generateQuestion();
            resetPlayer();
            resetMovement();
        }

        // Obstacle collision
        for (let obs of game.obstacles) {
            obs.move(CANVAS_WIDTH, CANVAS_HEIGHT);

            if (game.shieldTimer === 0 && rectsIntersect(playerBox, obs.rect)) {
                game.timeLeft -= 5;
                alert("Ouch! You hit an obstacle");
                resetPlayer();
                resetMovement();
                break;
            }
        }

        // Invincibility countdown
        if (game.respawnInvincibility > 0) game.respawnInvincibility--;

        // Move answer boxes
        if (game.moveRight) {
            game.correctBox.x += game.answerBoxSpeed;
            game.wrongBox.x -= game.answerBoxSpeed;
        } else {
            game.correctBox.x -= game.answerBoxSpeed;
            game.wrongBox.x += game.answerBoxSpeed;
        }

        if (game.correctBox.x < 100 || game.correctBox.x > CANVAS_WIDTH - 300) {
            game.moveRight = !game.moveRight;
        }

        if (game.bonusDisplayCounter > 0) {
            game.bonusDisplayCounter--;
            if (game.bonusDisplayCounter === 0) {
                game.timeBonusMessage = "";
            }
        }

        draw();
        gameLoopId = requestAnimationFrame(update);
    }

    gameLoopId = requestAnimationFrame(update);
}

// ==================== RENDERING ====================

function draw() {
    // Clear canvas
    CTX.fillStyle = '#f0f0f0';
    CTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background gradient
    const gradient = CTX.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#e8e8e8');
    gradient.addColorStop(1, '#f5f5f5');
    CTX.fillStyle = gradient;
    CTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Border
    CTX.strokeStyle = '#ff4444';
    CTX.lineWidth = 8;
    CTX.strokeRect(0, 0, CANVAS_WIDTH - 1, CANVAS_HEIGHT - 1);

    // Draw obstacles
    CTX.fillStyle = '#ff6666';
    for (let obs of game.obstacles) {
        CTX.fillRect(obs.rect.x, obs.rect.y, obs.rect.width, obs.rect.height);
    }

    // Draw power-ups
    for (let pu of game.powerUps) {
        switch (pu.type) {
            case "star":
                CTX.fillStyle = '#FFD700';
                break;
            case "clock":
                CTX.fillStyle = '#00CED1';
                break;
            case "shield":
                CTX.fillStyle = '#FF8C00';
                break;
        }
        CTX.beginPath();
        CTX.arc(pu.rect.x + pu.rect.width / 2, pu.rect.y + pu.rect.height / 2, pu.rect.width / 2, 0, Math.PI * 2);
        CTX.fill();
    }

    // Draw question
    CTX.fillStyle = '#000000';
    CTX.font = 'bold 20px Arial';
    CTX.textAlign = 'center';
    CTX.fillText(game.currentQuestion, CANVAS_WIDTH / 2, 100);

    // Draw answer boxes
    CTX.fillStyle = '#4CAF50';
    CTX.fillRect(game.correctBox.x, game.correctBox.y, game.correctBox.width, game.correctBox.height);
    CTX.fillRect(game.wrongBox.x, game.wrongBox.y, game.wrongBox.width, game.wrongBox.height);

    CTX.fillStyle = '#000000';
    CTX.font = '18px Arial';
    CTX.textAlign = 'center';
    const correctY = game.correctBox.y + 32;
    const wrongY = game.wrongBox.y + 32;
    CTX.fillText(game.correctAns, game.correctBox.x + game.correctBox.width / 2, correctY);
    CTX.fillText(game.wrongAns, game.wrongBox.x + game.wrongBox.width / 2, wrongY);

    // Draw player
    CTX.fillStyle = '#3366cc';
    CTX.fillRect(game.playerX, game.playerY, PLAYER_SIZE, PLAYER_SIZE);
    CTX.fillStyle = '#ffffff';
    CTX.font = 'bold 20px Arial';
    CTX.textAlign = 'center';
    CTX.fillText('P', game.playerX + PLAYER_SIZE / 2, game.playerY + PLAYER_SIZE / 2 + 8);

    // Draw HUD
    CTX.fillStyle = '#000000';
    CTX.font = 'bold 18px Arial';
    CTX.textAlign = 'left';
    CTX.fillText(`Level: ${game.level}`, 20, CANVAS_HEIGHT - 120);
    CTX.fillText(`Progress: ${game.questionsAnswered}/${game.totalQuestions}`, 20, CANVAS_HEIGHT - 90);
    CTX.fillText(`Time: ${game.timeLeft}s ${game.timeBonusMessage}`, 20, CANVAS_HEIGHT - 60);
    CTX.fillText(`Score: ${game.score}`, 20, CANVAS_HEIGHT - 30);

    // Power-up timers
    CTX.font = 'bold 14px Arial';
    CTX.fillStyle = '#FF8C00';
    CTX.textAlign = 'right';
    CTX.fillText(`Shield: ${Math.floor(game.shieldTimer / 60)}s`, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 120);

    CTX.fillStyle = '#00CED1';
    CTX.fillText(`Time Boost: ${Math.floor(game.timeBoostTimer / 60)}s`, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 90);

    CTX.fillStyle = '#FFD700';
    CTX.fillText(`Score Boost: ${Math.floor(game.scoreBoostTimer / 60)}s`, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 60);

    // Combo display
    CTX.textAlign = 'right';
    CTX.fillStyle = '#0066cc';
    CTX.font = 'bold 18px Arial';
    CTX.fillText(`Combo: ${game.combo}`, CANVAS_WIDTH - 20, 40);
    CTX.fillStyle = '#CC00CC';
    CTX.fillText(`Max Combo: ${game.maxCombo}`, CANVAS_WIDTH - 20, 70);
}

// ==================== GAME LOGIC ====================

function resetPlayer() {
    let safeX = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;
    let safeY = CANVAS_HEIGHT - 150;
    let newPos = { x: safeX, y: safeY, width: PLAYER_SIZE, height: PLAYER_SIZE };

    let collision;
    do {
        collision = false;
        for (let obs of game.obstacles) {
            if (rectsIntersect(newPos, obs.rect)) {
                collision = true;
                safeY -= 100;
                newPos.y = safeY;
                break;
            }
        }
    } while (collision);

    game.playerX = safeX;
    game.playerY = safeY;
    game.respawnInvincibility = 60;
}

function resetMovement() {
    game.keys.w = false;
    game.keys.a = false;
    game.keys.s = false;
    game.keys.d = false;
}

function checkLevelUp() {
    if (game.questionsAnswered > 0 && game.questionsAnswered % 5 === 0) {
        game.level++;
        saveAccountProgress({ level: game.level });

        for (let obs of game.obstacles) {
            obs.speed += 1;
        }

        game.obstacles.push(new MovingObstacle(
            getRandomInt(0, CANVAS_WIDTH),
            getRandomInt(0, CANVAS_HEIGHT),
            60, 60,
            Math.random() > 0.5,
            2 + game.level
        ));

        alert(`🎉 Level ${game.level}! Obstacles are faster and more appear!`);
    }
}

function endGame(message) {
    game.gameOver = true;
    saveScore(game.username, game.score);
    saveAccountProgress({
        level: game.level,
        iq_high_score: game.score,
        stars: Math.max(game.level - 1, 0)
    });

    let resultMessage = message + "\n\n";
    if (game.earnedBadges.length > 0) {
        resultMessage += "🏅 Badges Earned:\n";
        for (let badge of game.earnedBadges) {
            resultMessage += `  • ${badge.name} - ${badge.description}\n`;
        }
    } else {
        resultMessage += "No badges earned this round.";
    }

    alert(resultMessage);
}

// Save score - would need backend in real implementation
function saveScore(username, score) {
    let leaderboard = JSON.parse(localStorage.getItem('gameLeaderboard') || '[]');
    leaderboard.push({ username, score, date: new Date().toLocaleDateString() });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 100); // Keep top 100
    localStorage.setItem('gameLeaderboard', JSON.stringify(leaderboard));
}

function getLeaderboard() {
    return JSON.parse(localStorage.getItem('gameLeaderboard') || '[]');
}

function displayLeaderboard() {
    const leaderboard = getLeaderboard();
    let html = '<table><tr><th>Rank</th><th>Username</th><th>Score</th><th>Date</th></tr>';

    leaderboard.forEach((entry, index) => {
        html += `<tr><td>${index + 1}</td><td>${entry.username}</td><td>${entry.score}</td><td>${entry.date}</td></tr>`;
    });

    html += '</table>';
    document.getElementById('leaderboardTable').innerHTML = html;
    document.getElementById('leaderboardModal').classList.remove('hidden');
}

// ==================== EVENT LISTENERS ====================

document.getElementById('startGameBtn').addEventListener('click', startGame);
document.getElementById('viewLeaderboardBtn').addEventListener('click', displayLeaderboard);
document.getElementById('homeBtn').addEventListener('click', goHome);

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') game.keys.w = true;
    if (key === 'a') game.keys.a = true;
    if (key === 's') game.keys.s = true;
    if (key === 'd') game.keys.d = true;
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') game.keys.w = false;
    if (key === 'a') game.keys.a = false;
    if (key === 's') game.keys.s = false;
    if (key === 'd') game.keys.d = false;
});
