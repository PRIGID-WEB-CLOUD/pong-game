const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const leftScoreEl = document.getElementById('left-score');
const rightScoreEl = document.getElementById('right-score');

const paddleWidth = 18;
const paddleHeight = 110;
const ballRadius = 10;
const paddleSpeed = 8;

const leftPaddle = {
  x: 20,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: paddleSpeed,
};

const rightPaddle = {
  x: canvas.width - paddleWidth - 20,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 5.2,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  vx: 5,
  vy: 3,
};

let leftScore = 0;
let rightScore = 0;
const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateScoreboard() {
  leftScoreEl.textContent = leftScore;
  rightScoreEl.textContent = rightScore;
}

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  const baseSpeed = 5;
  ball.vx = direction * (baseSpeed + Math.random() * 1.5);
  ball.vy = (Math.random() * 6 - 3);
}

function handleInput() {
  if (keys.ArrowUp) {
    leftPaddle.y -= leftPaddle.speed;
  }
  if (keys.ArrowDown) {
    leftPaddle.y += leftPaddle.speed;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);
}

function updateComputer() {
  const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
  const target = ball.y - rightPaddle.height / 2;
  const diff = target - paddleCenter;
  rightPaddle.y += diff * 0.1;
  rightPaddle.y = clamp(rightPaddle.y, 0, canvas.height - rightPaddle.height);
}

function intersectsWithPaddle(paddle, ballObj) {
  const hitTop = ballObj.y - ballObj.radius < paddle.y + paddle.height;
  const hitBottom = ballObj.y + ballObj.radius > paddle.y;
  const hitLeft = ballObj.x - ballObj.radius < paddle.x + paddle.width;
  const hitRight = ballObj.x + ballObj.radius > paddle.x;

  return hitTop && hitBottom && hitLeft && hitRight;
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, canvas.height - ball.radius);
  }

  if (intersectsWithPaddle(leftPaddle, ball)) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    ball.vx = Math.abs(ball.vx) + 0.3;
    ball.vy += (ball.y - (leftPaddle.y + leftPaddle.height / 2)) * 0.12;
  }

  if (intersectsWithPaddle(rightPaddle, ball)) {
    ball.x = rightPaddle.x - ball.radius;
    ball.vx = -Math.abs(ball.vx) - 0.3;
    ball.vy += (ball.y - (rightPaddle.y + rightPaddle.height / 2)) * 0.12;
  }

  if (ball.x - ball.radius <= 0) {
    rightScore += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (ball.x + ball.radius >= canvas.width) {
    leftScore += 1;
    updateScoreboard();
    resetBall(-1);
  }
}

function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCenterLine();
  drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, '#f9fafb');
  drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, '#f9fafb');
  drawBall(ball.x, ball.y, ball.radius, '#fbbf24');
}

function gameLoop() {
  handleInput();
  updateComputer();
  updateBall();
  draw();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
  }

  if (event.key in keys) {
    keys[event.key] = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = event.clientY - rect.top;
  leftPaddle.y = mouseY - leftPaddle.height / 2;
  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);
});

updateScoreboard();
resetBall(1);
setInterval(gameLoop, 1000 / 60);

