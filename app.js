const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

const PLATFORM_WIDTH = 90;
const PLATFORM_HEIGHT = 18;
const PLAYER_SIZE = 26;
const GRAVITY = 0.95;
const JUMP_SPEED_BASE = 7;
const HORIZONTAL_FACTOR = 0.24;

let platforms;
let player;
let score;
let gameOver;
let charging;
let chargePower;

function resetGame() {
  platforms = [
    { x: 60, y: 520 },
    { x: 240, y: 400 },
  ];

  player = {
    x: platforms[0].x + PLATFORM_WIDTH / 2,
    y: platforms[0].y - PLAYER_SIZE / 2,
    vx: 0,
    vy: 0,
    airborne: false,
    squash: 1,
  };

  score = 0;
  gameOver = false;
  charging = false;
  chargePower = 0;
  scoreEl.textContent = String(score);
}

function nextPlatform() {
  const prev = platforms[platforms.length - 1];
  const gapX = 110 + Math.random() * 120;
  const direction = Math.random() > 0.5 ? 1 : -1;
  let nx = prev.x + gapX * direction;
  nx = Math.max(25, Math.min(canvas.width - PLATFORM_WIDTH - 25, nx));
  const ny = Math.max(140, Math.min(540, prev.y - (Math.random() * 110 - 55)));
  return { x: nx, y: ny };
}

function update() {
  if (gameOver) return;

  if (charging && !player.airborne) {
    chargePower = Math.min(chargePower + 0.28, 30);
    player.squash = Math.max(0.68, 1 - chargePower * 0.011);
  }

  if (player.airborne) {
    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    const target = platforms[1];
    const touchingY = player.y + PLAYER_SIZE / 2 >= target.y && player.vy > 0;
    const inX =
      player.x >= target.x + 6 && player.x <= target.x + PLATFORM_WIDTH - 6;

    if (touchingY && inX) {
      player.airborne = false;
      player.vx = 0;
      player.vy = 0;
      player.y = target.y - PLAYER_SIZE / 2;
      player.squash = 1;

      platforms.shift();
      platforms.push(nextPlatform());
      score += 1;
      scoreEl.textContent = String(score);
    }

    if (
      player.y - PLAYER_SIZE > canvas.height ||
      player.x < -60 ||
      player.x > canvas.width + 60
    ) {
      gameOver = true;
    }
  }
}

function drawPlatform(p) {
  ctx.fillStyle = "#5b6ca8";
  ctx.fillRect(p.x, p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(p.x + 8, p.y + 3, PLATFORM_WIDTH - 16, 3);
}

function drawPlayer() {
  const w = PLAYER_SIZE * (1 + (1 - player.squash) * 0.5);
  const h = PLAYER_SIZE * player.squash;

  ctx.save();
  ctx.translate(player.x, player.y + PLAYER_SIZE / 2 - h / 2);
  ctx.fillStyle = "#2e3654";
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 9);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-5, -2, 2.1, 0, Math.PI * 2);
  ctx.arc(5, -2, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGuide() {
  const start = platforms[0];
  const target = platforms[1];
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = "rgba(62, 78, 132, 0.55)";
  ctx.beginPath();
  ctx.moveTo(start.x + PLATFORM_WIDTH / 2, start.y);
  ctx.lineTo(target.x + PLATFORM_WIDTH / 2, target.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGuide();
  platforms.forEach(drawPlatform);
  drawPlayer();

  if (charging && !player.airborne) {
    ctx.fillStyle = "rgba(88,101,242,0.22)";
    ctx.fillRect(14, 14, chargePower * 10, 12);
    ctx.strokeStyle = "#5865f2";
    ctx.strokeRect(14, 14, 300, 12);
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(20, 24, 40, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText("游戏结束", canvas.width / 2, canvas.height / 2 - 18);
    ctx.font = "20px sans-serif";
    ctx.fillText(`最终得分：${score}`, canvas.width / 2, canvas.height / 2 + 22);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function startCharge() {
  if (gameOver || player.airborne) return;
  charging = true;
}

function releaseJump() {
  if (!charging || gameOver || player.airborne) return;

  charging = false;
  const target = platforms[1];
  const dx = target.x + PLATFORM_WIDTH / 2 - player.x;
  const direction = Math.sign(dx) || 1;

  player.airborne = true;
  player.vx = direction * (JUMP_SPEED_BASE + chargePower * HORIZONTAL_FACTOR);
  player.vy = -(JUMP_SPEED_BASE + chargePower * 0.55);
  player.squash = 1;
  chargePower = 0;
}

canvas.addEventListener("pointerdown", startCharge);
canvas.addEventListener("pointerup", releaseJump);
canvas.addEventListener("pointerleave", releaseJump);
restartBtn.addEventListener("click", resetGame);

resetGame();
loop();
