import { state } from "./state.js";
import {
  ASTEROID_MIN_SIZE,
  ASTEROID_MAX_SIZE,
  ASTEROID_MIN_SPEED,
  ASTEROID_MAX_SPEED,
  ASTEROID_COUNT,
} from "./constants.js";
import { wrapPosition } from "./utils.js";

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

export function spawnAsteroids() {
  state.asteroids = [];
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    const size = randomBetween(ASTEROID_MIN_SIZE, ASTEROID_MAX_SIZE);
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED);
    state.asteroids.push({
      x: randomBetween(0, state.canvas.width),
      y: randomBetween(0, state.canvas.height),
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed,
      size,
    });
  }
}

export function updateAsteroids() {
  for (const asteroid of state.asteroids) {
    asteroid.x += asteroid.vx;
    asteroid.y += asteroid.vy;
    wrapPosition(asteroid, state.canvas.width, state.canvas.height);
  }
}

export function drawAsteroids(ctx, asteroids) {
  ctx.save();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  for (const a of asteroids) {
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.size / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function checkBulletAsteroidCollisions() {
  const { bullets, asteroids } = state;
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < a.size / 2 + 4) {
        // 4 is bullet radius
        asteroids.splice(i, 1);
        bullets.splice(j, 1);
        state.score += 1;
        break;
      }
    }
  }
}
