const socket = io('http://localhost:3000');

const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const findBtn = document.getElementById('findBtn');
const cancelBtn = document.getElementById('cancelBtn');
const backBtn = document.getElementById('backBtn');
const saveNameBtn = document.getElementById('saveNameBtn');
const nameInput = document.getElementById('nameInput');
const youName = document.getElementById('youName');
const enemyName = document.getElementById('enemyName');
const youHp = document.getElementById('youHp');
const enemyHp = document.getElementById('enemyHp');

const keyMap = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  a: 'left',
  d: 'right',
  w: 'up',
  s: 'down'
};

let currentState = null;
let myId = null;
let enemyId = null;
let inMatch = false;

function setStatus(text) {
  statusEl.textContent = text;
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 16; i += 1) {
    ctx.fillRect(i * 44, 0, 1, canvas.height);
  }
  for (let j = 0; j < 10; j += 1) {
    ctx.fillRect(0, j * 38, canvas.width, 1);
  }

  if (!currentState || !currentState.players) {
    ctx.fillStyle = '#e7f5ff';
    ctx.font = '18px Segoe UI';
    ctx.fillText('Find a match to start 1v1.', 24, 38);
    return;
  }

  Object.entries(currentState.players).forEach(([id, p]) => {
    const isMe = id === myId;
    ctx.beginPath();
    ctx.fillStyle = isMe ? '#22e29f' : '#ff6b6b';
    ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '13px Segoe UI';
    ctx.fillText(p.name || 'Player', p.x - 26, p.y - 26);
    ctx.fillText(`HP ${p.hp}`, p.x - 18, p.y + 35);
  });
}

function updateHud() {
  if (!currentState || !currentState.players || !myId || !enemyId) {
    youName.textContent = '-';
    enemyName.textContent = '-';
    youHp.style.width = '0%';
    enemyHp.style.width = '0%';
    return;
  }

  const me = currentState.players[myId];
  const enemy = currentState.players[enemyId];
  if (!me || !enemy) return;

  youName.textContent = me.name;
  enemyName.textContent = enemy.name;
  youHp.style.width = `${me.hp}%`;
  enemyHp.style.width = `${enemy.hp}%`;
}

findBtn.addEventListener('click', () => {
  socket.emit('find_match');
  setStatus('Searching for opponent...');
});

cancelBtn.addEventListener('click', () => {
  socket.emit('cancel_matchmaking');
});

saveNameBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) {
    setStatus('Type your nickname first.');
    return;
  }
  socket.emit('set_name', name);
  setStatus('Nickname saved.');
});

backBtn.addEventListener('click', () => {
  window.location.href = 'http://localhost/System/Home/home.html';
});

window.addEventListener('keydown', (event) => {
  if (!inMatch) return;

  if (event.code === 'Space') {
    event.preventDefault();
    socket.emit('attack');
    return;
  }

  const direction = keyMap[event.key];
  if (direction) {
    event.preventDefault();
    socket.emit('move', direction);
  }
});

socket.on('connect', () => {
  setStatus('Connected. Save name, then Find 1v1 Match.');
});

socket.on('disconnect', () => {
  inMatch = false;
  setStatus('Disconnected from 1v1 server.');
});

socket.on('queue_status', (payload) => {
  setStatus(payload.message || 'Queue update.');
});

socket.on('match_found', (payload) => {
  myId = payload.you;
  enemyId = payload.enemy;
  currentState = payload.state;
  inMatch = true;
  setStatus('Match found. Fight!');
  updateHud();
  drawScene();
});

socket.on('state_update', (state) => {
  currentState = state;
  updateHud();
  drawScene();
});

socket.on('match_end', (payload) => {
  inMatch = false;
  const result = payload && payload.reason ? payload.reason : 'Match ended.';
  setStatus(result);
});

drawScene();