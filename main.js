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

function gameLoop(now) {
  const { ctx, canvas, ship, bullets, asteroids } = state;
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

function startGame() {
  state.canvas = document.getElementById("gameCanvas");
  state.ctx = state.canvas.getContext("2d");
  state.ship.x = state.canvas.width / 2;
  state.ship.y = state.canvas.height / 2;
  spawnAsteroids();
  setupInput();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("DOMContentLoaded", startGame);
