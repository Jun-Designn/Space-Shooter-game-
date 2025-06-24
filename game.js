// game.js

const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

const PLAYER = '🚀';
const AST    = '🪨';
const SIZE   = 32;

ctx.textBaseline = 'top';
ctx.textAlign    = 'center';
ctx.font         = `${SIZE}px serif`;

let px, py, bullets, asteroids, score, gameOver;
let keys = {}, lastTime, spawnTimer;

function init() {
  px = canvas.width / 2;
  py = canvas.height - SIZE - 10;
  bullets   = [];
  asteroids = [];
  score     = 0;
  gameOver  = false;
  spawnTimer= 0;
  lastTime  = performance.now();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (gameOver && e.code === 'Enter') init();
});
window.addEventListener('keyup', e => keys[e.code] = false);

function loop(now) {
  const dt = now - lastTime;
  lastTime = now;

  update(dt);
  draw();

  if (!gameOver) requestAnimationFrame(loop);
  else drawGameOver();
}

function update(dt) {
  if (keys['ArrowLeft'])  px = Math.max(SIZE/2, px - 200 * dt/1000);
  if (keys['ArrowRight']) px = Math.min(canvas.width - SIZE/2, px + 200 * dt/1000);

  if (keys['Space']) {
    bullets.push({ x: px, y: py, vy: -400 });
    keys['Space'] = false;
  }

  bullets = bullets.filter(b => {
    b.y += b.vy * dt/1000;
    return b.y > -10;
  });

  spawnTimer += dt;
  if (spawnTimer > 800) {
    spawnTimer = 0;
    asteroids.push({
      x: Math.random()*(canvas.width-SIZE) + SIZE/2,
      y: -SIZE,
      vy: 50 + Math.random()*100
    });
  }

  asteroids = asteroids.filter(a => {
    a.y += a.vy * dt/1000;
    return a.y < canvas.height + SIZE;
  });

  asteroids.forEach((a, ai) => {
    if (!gameOver &&
        Math.abs(a.x - px) < SIZE &&
        Math.abs(a.y - py) < SIZE) {
      gameOver = true;
    }
    bullets.forEach((b, bi) => {
      if (Math.abs(a.x - b.x) < SIZE/2 &&
          Math.abs(a.y - b.y) < SIZE/2) {
        asteroids.splice(ai, 1);
        bullets.splice(bi, 1);
        score += 10;
      }
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw rocket tilted 45° up-right
  ctx.save();
  ctx.translate(px, py + SIZE/2);
  ctx.rotate(-Math.PI / 4);       // 45°
  ctx.fillText(PLAYER, 0, -SIZE/2);
  ctx.restore();

  ctx.fillStyle = '#ff0';
  bullets.forEach(b => ctx.fillRect(b.x-2, b.y, 4, 10));
  ctx.fillStyle = '#fff';

  asteroids.forEach(a => ctx.fillText(AST, a.x, a.y));

  ctx.fillText(`Score: ${score}`, 80, 10);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = '36px sans-serif';
  ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
  ctx.font = '18px sans-serif';
  ctx.fillText('Press Enter to Restart', canvas.width/2, canvas.height/2 + 20);
  ctx.font = `${SIZE}px serif`;
}

init();
