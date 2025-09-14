import { state } from "./state.js";
import {
  ASTEROID_MIN_SIZE,
  ASTEROID_MAX_SIZE,
  ASTEROID_MIN_SPEED,
  ASTEROID_MAX_SPEED,
  ASTEROID_COUNT,
  LASER_RADIUS,
  SHIP_SIZE,
} from "./constants.js";
import { wrapPosition } from "./utils.js";
import { playSound } from "./sound.js";
import { Asteroid, AsteroidShape } from "./types.js";

function randomBetween(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

function generateAsteroidShape(size: number): AsteroidShape[] {
  // Generate a random, jagged polygon for a rocky look
  const points: AsteroidShape[] = [];
  const numPoints = Math.floor(Math.random() * 6) + 8; // 8-13 points
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const radius = (size / 2) * (0.7 + Math.random() * 0.5); // 70%-120% of base radius
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }
  return points;
}

export function spawnAsteroids(): void {
  const { canvas } = state;
  if (!canvas) return;
  
  state.asteroids = [];
  const SAFE_RADIUS = SHIP_SIZE / 2 + ASTEROID_MAX_SIZE + 40; // Add buffer
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    const size = randomBetween(ASTEROID_MIN_SIZE, ASTEROID_MAX_SIZE);
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED);
    let x: number, y: number, attempts = 0;
    do {
      x = randomBetween(0, canvas.width);
      y = randomBetween(0, canvas.height);
      attempts++;
      // Avoid infinite loop in rare cases
      if (attempts > 100) break;
    } while (distance(x, y, state.ship.x, state.ship.y) < SAFE_RADIUS);
    state.asteroids.push({
      x,
      y,
      velocityX: Math.sin(angle) * speed,
      velocityY: -Math.cos(angle) * speed,
      size,
      shape: generateAsteroidShape(size),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.6, // -0.3 to 0.3 rad/sec
    });
  }
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

const ASTEROID_RESPAWN_INTERVAL: number = 2.5; // seconds between spawns
const ASTEROID_MAX_ON_SCREEN: number = ASTEROID_COUNT;
let asteroidRespawnTimer: number = 0;

export function spawnAsteroid(): void {
  const { canvas } = state;
  if (!canvas) return;
  
  const SAFE_RADIUS = SHIP_SIZE / 2 + ASTEROID_MAX_SIZE + 40; // Add buffer
  const size = randomBetween(ASTEROID_MIN_SIZE, ASTEROID_MAX_SIZE);
  const angle = Math.random() * Math.PI * 2;
  const speed = randomBetween(ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED);
  let x: number, y: number, attempts = 0;
  do {
    x = randomBetween(0, canvas.width);
    y = randomBetween(0, canvas.height);
    attempts++;
    if (attempts > 100) break;
  } while (distance(x, y, state.ship.x, state.ship.y) < SAFE_RADIUS);
  state.asteroids.push({
    x,
    y,
    velocityX: Math.sin(angle) * speed,
    velocityY: -Math.cos(angle) * speed,
    size,
    shape: generateAsteroidShape(size),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.6, // -0.3 to 0.3 rad/sec
  });
}

export function updateAsteroids(delta: number): void {
  const { asteroids, canvas } = state;
  if (!canvas) return;
  
  for (const asteroid of asteroids) {
    asteroid.x += asteroid.velocityX * delta;
    asteroid.y += asteroid.velocityY * delta;
    asteroid.rotation += asteroid.rotationSpeed * delta;
    wrapPosition(asteroid, canvas.width, canvas.height);
  }
  // Asteroid respawn logic
  asteroidRespawnTimer += delta;
  if (asteroidRespawnTimer >= ASTEROID_RESPAWN_INTERVAL) {
    asteroidRespawnTimer = 0;
    if (asteroids.length < ASTEROID_MAX_ON_SCREEN) {
      spawnAsteroid();
    }
  }
}

export function drawAsteroids(ctx: CanvasRenderingContext2D, asteroids: Asteroid[]): void {
  ctx.save();
  for (const a of asteroids) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rotation || 0);
    // Shading gradient
    const grad = ctx.createRadialGradient(
      0,
      0,
      a.size * 0.2,
      0,
      0,
      a.size * 0.6
    );
    grad.addColorStop(0, "#e0e0e0");
    grad.addColorStop(0.5, "#888888");
    grad.addColorStop(1, "#444444");
    ctx.fillStyle = grad;
    ctx.beginPath();
    const shape = a.shape || generateAsteroidShape(a.size);
    ctx.moveTo(shape[0].x, shape[0].y);
    for (let i = 1; i < shape.length; i++) {
      ctx.lineTo(shape[i].x, shape[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#bbbbbb";
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

export function checkLaserAsteroidCollisions(): void {
  const { lasers, asteroids } = state;
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    for (let j = lasers.length - 1; j >= 0; j--) {
      const l = lasers[j];
      const dx = a.x - l.x;
      const dy = a.y - l.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < a.size / 2 + LASER_RADIUS) {
        // Split asteroid if large enough
        if (a.size > ASTEROID_MIN_SIZE * 1.5) {
          for (let s = 0; s < 2; s++) {
            const newSize = a.size / 2;
            const angle = Math.random() * Math.PI * 2;
            const speed = randomBetween(ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED);
            asteroids.push({
              x: a.x,
              y: a.y,
              velocityX: Math.sin(angle) * speed,
              velocityY: -Math.cos(angle) * speed,
              size: newSize,
              shape: generateAsteroidShape(newSize),
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.6,
            });
          }
        }
        asteroids.splice(i, 1);
        lasers.splice(j, 1);
        state.score += 1;
        playSound("explosion");
        break;
      }
    }
  }
}

export function checkShipAsteroidCollision(): boolean {
  const { ship, asteroids } = state;
  for (let i = 0; i < asteroids.length; i++) {
    const a = asteroids[i];
    const dx = a.x - ship.x;
    const dy = a.y - ship.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < a.size / 2 + SHIP_SIZE / 2) {
      state.gameOver = true;
      playSound("explosion");
      return true;
    }
  }
  return false;
}
