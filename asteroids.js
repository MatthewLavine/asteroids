// --- Constants ---
const SHIP_SIZE = 40;
const ACCEL_AMOUNT = 0.1;
const FRICTION = 0.999;
const BRAKING_FORCE = 0.97;
const MAX_SPEED = 3;
const TURN_SPEED = 0.05;
const BULLET_SPEED = 10;
const BULLET_RADIUS = 4;
const BULLET_INTERVAL = 120; // ms between shots
const BULLET_LIFESPAN = 1000; // ms
const ASTEROID_MIN_SIZE = 50;
const ASTEROID_MAX_SIZE = 100;
const ASTEROID_MIN_SPEED = 0.1;
const ASTEROID_MAX_SPEED = 0.5;
const ASTEROID_COUNT = 5;

// --- State ---
const state = {
  ship: {
    x: 0,
    y: 0,
    angle: 0,
    velocityX: 0,
    velocityY: 0,
    turningLeft: false,
    turningRight: false,
    accelerating: false,
    braking: false,
  },
  bullets: [],
  shooting: false,
  lastBulletTime: 0,
  score: 0,
  ctx: null,
  canvas: null,
  asteroids: [],
};

// --- Input Handling ---
function setupInput() {
  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "ArrowUp":
        state.ship.accelerating = true;
        break;
      case "ArrowLeft":
        state.ship.turningLeft = true;
        break;
      case "ArrowRight":
        state.ship.turningRight = true;
        break;
      case "Space":
        state.shooting = true;
        break;
      case "ArrowDown":
        state.ship.braking = true;
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "ArrowUp":
        state.ship.accelerating = false;
        break;
      case "ArrowLeft":
        state.ship.turningLeft = false;
        break;
      case "ArrowRight":
        state.ship.turningRight = false;
        break;
      case "Space":
        state.shooting = false;
        break;
      case "ArrowDown":
        state.ship.braking = false;
        break;
    }
  });
}

// --- Utility Functions ---
function wrapPosition(obj, width, height) {
  if (obj.y < 0) obj.y = height;
  else if (obj.y > height) obj.y = 0;
  if (obj.x < 0) obj.x = width;
  else if (obj.x > width) obj.x = 0;
}

// --- Game Logic ---
function shootBullet(now) {
  const { ship, bullets, ctx, canvas } = state;
  const tipX = ship.x + Math.sin(ship.angle) * SHIP_SIZE;
  const tipY = ship.y - Math.cos(ship.angle) * SHIP_SIZE;
  bullets.push({
    x: tipX,
    y: tipY,
    vx: Math.sin(ship.angle) * BULLET_SPEED + ship.velocityX,
    vy: -Math.cos(ship.angle) * BULLET_SPEED + ship.velocityY,
    createdAt: now,
  });
}

function updateShip() {
  const { ship, canvas } = state;
  if (ship.turningLeft) ship.angle -= TURN_SPEED;
  if (ship.turningRight) ship.angle += TURN_SPEED;
  if (ship.accelerating) {
    ship.velocityX += Math.sin(ship.angle) * ACCEL_AMOUNT;
    ship.velocityY -= Math.cos(ship.angle) * ACCEL_AMOUNT;
  }
  if (ship.braking) {
    ship.velocityX *= BRAKING_FORCE;
    ship.velocityY *= BRAKING_FORCE;
  }
  ship.velocityX *= FRICTION;
  ship.velocityY *= FRICTION;
  const speed = Math.sqrt(ship.velocityX ** 2 + ship.velocityY ** 2);
  if (speed > MAX_SPEED) {
    ship.velocityX = (ship.velocityX / speed) * MAX_SPEED;
    ship.velocityY = (ship.velocityY / speed) * MAX_SPEED;
  }
  ship.x += ship.velocityX;
  ship.y += ship.velocityY;
  wrapPosition(ship, canvas.width, canvas.height);
}

function updateBullets(now) {
  const { bullets, canvas } = state;
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    wrapPosition(b, canvas.width, canvas.height);
    if (now - b.createdAt > BULLET_LIFESPAN) {
      bullets.splice(i, 1);
    }
  }
}

function randomAsteroid(canvas) {
  // Spawn at edge, random direction
  const size =
    Math.random() * (ASTEROID_MAX_SIZE - ASTEROID_MIN_SIZE) + ASTEROID_MIN_SIZE;
  let x, y, angle;
  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? 0 : canvas.width;
    y = Math.random() * canvas.height;
  } else {
    x = Math.random() * canvas.width;
    y = Math.random() < 0.5 ? 0 : canvas.height;
  }
  angle = Math.random() * Math.PI * 2;
  const speed =
    Math.random() * (ASTEROID_MAX_SPEED - ASTEROID_MIN_SPEED) +
    ASTEROID_MIN_SPEED;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size,
    angle,
  };
}

function spawnAsteroids() {
  state.asteroids = [];
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    state.asteroids.push(randomAsteroid(state.canvas));
  }
}

function updateAsteroids() {
  const { asteroids, canvas } = state;
  for (const a of asteroids) {
    a.x += a.vx;
    a.y += a.vy;
    wrapPosition(a, canvas.width, canvas.height);
  }
}

function drawAsteroids(ctx, asteroids) {
  ctx.save();
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 3;
  for (const a of asteroids) {
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function checkBulletAsteroidCollisions() {
  const { bullets, asteroids } = state;
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < a.size + BULLET_RADIUS) {
        // Remove asteroid and bullet
        asteroids.splice(i, 1);
        bullets.splice(j, 1);
        state.score += 1;
        break;
      }
    }
  }
  // Respawn asteroids if all destroyed
  if (asteroids.length === 0) {
    spawnAsteroids();
  }
}

// --- Drawing ---
function drawShip(ctx, ship) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);

  // Ship body
  ctx.beginPath();
  ctx.moveTo(0, -SHIP_SIZE);
  ctx.lineTo(SHIP_SIZE * 0.7, SHIP_SIZE * 0.7);
  ctx.lineTo(-SHIP_SIZE * 0.7, SHIP_SIZE * 0.7);
  ctx.closePath();
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Rocket plume
  if (ship.accelerating) {
    ctx.beginPath();
    ctx.moveTo(-SHIP_SIZE * 0.4, SHIP_SIZE * 0.7);
    ctx.lineTo(0, SHIP_SIZE * 1.2);
    ctx.lineTo(SHIP_SIZE * 0.4, SHIP_SIZE * 0.7);
    ctx.closePath();
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.stroke();
  }
  ctx.restore();
}

function drawBullets(ctx, bullets) {
  ctx.save();
  ctx.fillStyle = "red";
  for (const b of bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawScore(ctx, score) {
  ctx.save();
  ctx.font = "28px Arial";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.strokeText(`Score: ${score}`, 20, 20);
  ctx.fillText(`Score: ${score}`, 20, 20);
  ctx.restore();
}

// --- Main Game Loop ---
function gameLoop(now) {
  const { ctx, canvas, ship, bullets, asteroids } = state;
  // Draw space background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updateShip();

  if (
    state.shooting &&
    (!state.lastBulletTime || now - state.lastBulletTime > BULLET_INTERVAL)
  ) {
    shootBullet(now);
    state.lastBulletTime = now;
  }

  updateBullets(now);
  updateAsteroids();
  checkBulletAsteroidCollisions();

  drawScore(ctx, state.score);
  drawAsteroids(ctx, asteroids);
  drawBullets(ctx, bullets);
  drawShip(ctx, ship);

  requestAnimationFrame(gameLoop);
}

// --- Initialization ---
function startGame() {
  console.log("Asteroids game started!");
  state.canvas = document.getElementById("gameCanvas");
  state.ctx = state.canvas.getContext("2d");
  state.ship.x = state.canvas.width / 2;
  state.ship.y = state.canvas.height / 2;
  spawnAsteroids();
  setupInput();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("DOMContentLoaded", startGame);
