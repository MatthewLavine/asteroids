import { state } from "./state.js";
import {
  ASTEROID_MIN_SIZE,
  ASTEROID_MAX_SIZE,
  ASTEROID_MIN_SPEED,
  ASTEROID_MAX_SPEED,
  ASTEROID_COUNT,
  LASER_RADIUS,
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
      velocityX: Math.sin(angle) * speed,
      velocityY: -Math.cos(angle) * speed,
      size,
    });
  }
}

const ASTEROID_RESPAWN_INTERVAL = 2.5; // seconds between spawns
const ASTEROID_MAX_ON_SCREEN = ASTEROID_COUNT;
let asteroidRespawnTimer = 0;

export function spawnAsteroid() {
  const size = randomBetween(ASTEROID_MIN_SIZE, ASTEROID_MAX_SIZE);
  const angle = Math.random() * Math.PI * 2;
  const speed = randomBetween(ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED);
  state.asteroids.push({
    x: randomBetween(0, state.canvas.width),
    y: randomBetween(0, state.canvas.height),
    velocityX: Math.sin(angle) * speed,
    velocityY: -Math.cos(angle) * speed,
    size,
  });
}

export function updateAsteroids(delta) {
  for (const asteroid of state.asteroids) {
    asteroid.x += asteroid.velocityX * delta;
    asteroid.y += asteroid.velocityY * delta;
    wrapPosition(asteroid, state.canvas.width, state.canvas.height);
  }
  // Asteroid respawn logic
  asteroidRespawnTimer += delta;
  if (asteroidRespawnTimer >= ASTEROID_RESPAWN_INTERVAL) {
    asteroidRespawnTimer = 0;
    if (state.asteroids.length < ASTEROID_MAX_ON_SCREEN) {
      spawnAsteroid();
    }
  }
}

export function drawAsteroids(ctx, asteroids) {
  ctx.save();
  ctx.fillStyle = "#888";
  for (const a of asteroids) {
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function checkLaserAsteroidCollisions() {
  const { lasers, asteroids } = state;
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    for (let j = lasers.length - 1; j >= 0; j--) {
      const l = lasers[j];
      const dx = a.x - l.x;
      const dy = a.y - l.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < a.size / 2 + LASER_RADIUS) {
        asteroids.splice(i, 1);
        lasers.splice(j, 1);
        state.score += 1;
        break;
      }
    }
  }
}
