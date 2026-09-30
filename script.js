const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const game = {
  width: canvas.width,
  height: canvas.height,
  paddleWidth: 12,
  paddleHeight: 90,
  paddleSpeed: 7,
  running: false,
  mouseY: null,
  keys: {
    ArrowUp: false,
    ArrowDown: false,
  },
  player: {
    x: 20,
    y: (canvas.height - 90) / 2,
    score: 0,
  },
  computer: {
    x: canvas.width - 32,
    y: (canvas.height - 90) / 2,
    score: 0,
  },
  ball: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    vx: 5,
    vy: 3,
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateScoreboard() {
  playerScoreEl.textContent = game.player.score;
  computerScoreEl.textContent = game.computer.score;
}

function resetBall(direction = Math.random() < 0.5 ? -1 : 1) {
  game.ball.x = game.width / 2;
  game.ball.y = game.height / 2;

  const baseSpeed = 5;
  game.ball.vx = direction * baseSpeed;
  game.ball.vy = (Math.random() * 2 - 1) * baseSpeed * 0.9;
}

function startGame() {
  if (!game.running) {
    game.running = true;
    resetBall(Math.random() < 0.5 ? -1 : 1);
  }
}

function resetGame() {
  game.player.score = 0;
  game.computer.score = 0;
  game.player.y = (game.height - game.paddleHeight) / 2;
  game.computer.y = (game.height - game.paddleHeight) / 2;
  updateScoreboard();
  resetBall(Math.random() < 0.5 ? -1 : 1);
}

function movePlayer() {
  if (game.keys.ArrowUp) {
    game.player.y -= game.paddleSpeed;
  }

  if (game.keys.ArrowDown) {
    game.player.y += game.paddleSpeed;
  }

  if (game.mouseY !== null) {
    game.player.y = game.mouseY - game.paddleHeight / 2;
  }

  game.player.y = clamp(game.player.y, 0, game.height - game.paddleHeight);
}

function moveComputer() {
  const paddleCenter = game.computer.y + game.paddleHeight / 2;
  const target = game.ball.y - paddleCenter;

  if (Math.abs(target) > 20) {
    if (target > 0) {
      game.computer.y += 4.2;
    } else {
      game.computer.y -= 4.2;
    }
  }

  game.computer.y = clamp(game.computer.y, 0, game.height - game.paddleHeight);
}

function handleBallCollisions() {
  if (game.ball.y - game.ball.radius <= 0 || game.ball.y + game.ball.radius >= game.height) {
    game.ball.vy *= -1;
    game.ball.y = clamp(game.ball.y, game.ball.radius, game.height - game.ball.radius);
  }

  const playerLeft = game.player.x;
  const playerRight = game.player.x + game.paddleWidth;
  const playerTop = game.player.y;
  const playerBottom = game.player.y + game.paddleHeight;

  const computerLeft = game.computer.x;
  const computerRight = game.computer.x + game.paddleWidth;
  const computerTop = game.computer.y;
  const computerBottom = game.computer.y + game.paddleHeight;

  if (
    game.ball.vx < 0 &&
    game.ball.x - game.ball.radius <= playerRight &&
    game.ball.x + game.ball.radius >= playerLeft &&
    game.ball.y >= playerTop &&
    game.ball.y <= playerBottom
  ) {
    const relativeIntersectY = (game.ball.y - (playerTop + game.paddleHeight / 2)) / (game.paddleHeight / 2);
    game.ball.vx = Math.abs(game.ball.vx) + 0.4;
    game.ball.vy = relativeIntersectY * 5.5;
    game.ball.x = playerRight + game.ball.radius;
  }

  if (
    game.ball.vx > 0 &&
    game.ball.x + game.ball.radius >= computerLeft &&
    game.ball.x - game.ball.radius <= computerRight &&
    game.ball.y >= computerTop &&
    game.ball.y <= computerBottom
  ) {
    const relativeIntersectY = (game.ball.y - (computerTop + game.paddleHeight / 2)) / (game.paddleHeight / 2);
    game.ball.vx = -Math.abs(game.ball.vx) - 0.4;
    game.ball.vy = relativeIntersectY * 5.5;
    game.ball.x = computerLeft - game.ball.radius;
  }

  if (game.ball.x < -20) {
    game.computer.score += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (game.ball.x > game.width + 20) {
    game.player.score += 1;
    updateScoreboard();
    resetBall(-1);
  }
}

function updateGame() {
  if (!game.running) {
    return;
  }

  movePlayer();
  moveComputer();

  game.ball.x += game.ball.vx;
  game.ball.y += game.ball.vy;

  handleBallCollisions();
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(game.width / 2, 0);
  ctx.lineTo(game.width / 2, game.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();
}

function drawGame() {
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, game.width, game.height);

  drawCenterLine();
  drawPaddle(game.player.x, game.player.y, game.paddleWidth, game.paddleHeight, '#00ff88');
  drawPaddle(game.computer.x, game.computer.y, game.paddleWidth, game.paddleHeight, '#ff4d4d');
  drawBall();

  if (!game.running) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press Start', game.width / 2, game.height / 2 - 10);
  }
}

function gameLoop() {
  updateGame();
  drawGame();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    game.keys.ArrowUp = true;
  }

  if (event.key === 'ArrowDown') {
    game.keys.ArrowDown = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp') {
    game.keys.ArrowUp = false;
  }

  if (event.key === 'ArrowDown') {
    game.keys.ArrowDown = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  const mouseY = (event.clientY - rect.top) * scaleY;
  game.mouseY = mouseY;
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', () => {
  game.running = false;
  resetGame();
});

updateScoreboard();
drawGame();
requestAnimationFrame(gameLoop);
