import { state } from "./state.js";
import { setupInput } from "./input.js";
import { updateShip, drawShip } from "./ship.js";
import { shootBullet, updateBullets, drawBullets } from "./bullets.js";
import {
  drawAsteroids,
  updateAsteroids,
  spawnAsteroids,
  checkBulletAsteroidCollisions,
} from "./asteroids.js";
import { drawScore } from "./score.js";
import { BULLET_INTERVAL } from "./constants.js";
import { initStarfield, updateStarfield, drawStarfield } from "./starfield.js";

let lastFrameTime = null;

function gameLoop(now) {
  if (!lastFrameTime) lastFrameTime = now;
  const delta = (now - lastFrameTime) / 1000; // seconds
  lastFrameTime = now;
  const { ctx, canvas, ship, bullets, asteroids } = state;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  updateStarfield(delta);
  drawStarfield(ctx);
  updateShip(delta);
  if (
    state.shooting &&
    (!state.lastBulletTime || now - state.lastBulletTime > BULLET_INTERVAL)
  ) {
    shootBullet(now);
    state.lastBulletTime = now;
  }
  updateBullets(now, delta);
  updateAsteroids(delta);
  checkBulletAsteroidCollisions();
  drawScore(ctx, state.score);
  drawAsteroids(ctx, asteroids);
  drawBullets(ctx, bullets);
  drawShip(ctx, ship);
  requestAnimationFrame(gameLoop);
}

function startGame() {
  state.canvas = document.getElementById("gameCanvas");
  state.ctx = state.canvas.getContext("2d");
  state.ship.x = state.canvas.width / 2;
  state.ship.y = state.canvas.height / 2;
  spawnAsteroids();
  setupInput();
  initStarfield();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("DOMContentLoaded", startGame);
