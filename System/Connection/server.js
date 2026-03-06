const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const ARENA_WIDTH = 700;
const ARENA_HEIGHT = 380;
const SPEED = 12;
const ATTACK_RANGE = 80;
const ATTACK_DAMAGE = 15;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

app.use(express.static(path.join(__dirname, 'public')));

let waitingPlayer = null;
const matches = new Map();
const playerToMatch = new Map();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createMatch(playerA, playerB) {
  const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  playerA.join(roomId);
  playerB.join(roomId);

  const state = {
    roomId,
    players: {
      [playerA.id]: { x: 110, y: ARENA_HEIGHT / 2, hp: 100, name: playerA.data.name || 'Player 1' },
      [playerB.id]: { x: ARENA_WIDTH - 110, y: ARENA_HEIGHT / 2, hp: 100, name: playerB.data.name || 'Player 2' }
    },
    over: false
  };

  matches.set(roomId, state);
  playerToMatch.set(playerA.id, roomId);
  playerToMatch.set(playerB.id, roomId);

  playerA.emit('match_found', {
    roomId,
    you: playerA.id,
    enemy: playerB.id,
    arena: { width: ARENA_WIDTH, height: ARENA_HEIGHT },
    state
  });

  playerB.emit('match_found', {
    roomId,
    you: playerB.id,
    enemy: playerA.id,
    arena: { width: ARENA_WIDTH, height: ARENA_HEIGHT },
    state
  });

  io.to(roomId).emit('state_update', state);
}

function endMatch(roomId, winnerId, reason) {
  const match = matches.get(roomId);
  if (!match) return;
  match.over = true;

  io.to(roomId).emit('match_end', {
    winnerId,
    reason: reason || 'Match finished.'
  });

  Object.keys(match.players).forEach((socketId) => {
    playerToMatch.delete(socketId);
  });

  matches.delete(roomId);
}

io.on('connection', (socket) => {
  socket.data.name = 'Player';

  socket.on('set_name', (name) => {
    if (typeof name === 'string' && name.trim()) {
      socket.data.name = name.trim().slice(0, 24);
    }
  });

  socket.on('find_match', () => {
    if (playerToMatch.has(socket.id)) return;

    if (!waitingPlayer || waitingPlayer.id === socket.id) {
      waitingPlayer = socket;
      socket.emit('queue_status', { waiting: true, message: 'Waiting for opponent...' });
      return;
    }

    const opponent = waitingPlayer;
    waitingPlayer = null;
    createMatch(opponent, socket);
  });

  socket.on('cancel_matchmaking', () => {
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
      socket.emit('queue_status', { waiting: false, message: 'Matchmaking cancelled.' });
    }
  });

  socket.on('move', (direction) => {
    const roomId = playerToMatch.get(socket.id);
    if (!roomId) return;

    const match = matches.get(roomId);
    if (!match || match.over) return;

    const me = match.players[socket.id];
    if (!me) return;

    if (direction === 'left') me.x = clamp(me.x - SPEED, 20, ARENA_WIDTH - 20);
    if (direction === 'right') me.x = clamp(me.x + SPEED, 20, ARENA_WIDTH - 20);
    if (direction === 'up') me.y = clamp(me.y - SPEED, 20, ARENA_HEIGHT - 20);
    if (direction === 'down') me.y = clamp(me.y + SPEED, 20, ARENA_HEIGHT - 20);

    io.to(roomId).emit('state_update', match);
  });

  socket.on('attack', () => {
    const roomId = playerToMatch.get(socket.id);
    if (!roomId) return;

    const match = matches.get(roomId);
    if (!match || match.over) return;

    const ids = Object.keys(match.players);
    if (ids.length !== 2) return;

    const enemyId = ids.find((id) => id !== socket.id);
    const me = match.players[socket.id];
    const enemy = match.players[enemyId];
    if (!me || !enemy) return;

    const distance = Math.hypot(me.x - enemy.x, me.y - enemy.y);
    if (distance <= ATTACK_RANGE) {
      enemy.hp = clamp(enemy.hp - ATTACK_DAMAGE, 0, 100);
      io.to(roomId).emit('state_update', match);

      if (enemy.hp === 0) {
        endMatch(roomId, socket.id, `${me.name} wins!`);
      }
    }
  });

  socket.on('disconnect', () => {
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }

    const roomId = playerToMatch.get(socket.id);
    if (!roomId) return;

    const match = matches.get(roomId);
    if (!match) return;

    const enemyId = Object.keys(match.players).find((id) => id !== socket.id);
    endMatch(roomId, enemyId || null, 'Opponent disconnected.');
  });
});

server.listen(PORT, () => {
  console.log(`1v1 server running at http://localhost:${PORT}`);
});