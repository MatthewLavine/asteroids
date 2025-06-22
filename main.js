import { state } from "./state.js";
import { setupInput } from "./input.js";
import { updateShip, drawShip } from "./ship.js";
import { shootLaser, updateLasers, drawLasers } from "./lasers.js";
import {
  drawAsteroids,
  updateAsteroids,
  spawnAsteroids,
  checkLaserAsteroidCollisions,
} from "./asteroids.js";
import { drawScore } from "./score.js";
import { LASER_INTERVAL } from "./constants.js";
import { initStarfield, updateStarfield, drawStarfield } from "./starfield.js";
import { setMuted } from "./sound.js";

let lastFrameTime = null;

function gameLoop(now) {
  if (!lastFrameTime) lastFrameTime = now;
  const delta = (now - lastFrameTime) / 1000; // seconds
  lastFrameTime = now;
  const { ctx, canvas, ship, lasers, asteroids } = state;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  updateStarfield(delta);
  drawStarfield(ctx);
  updateShip(delta);
  if (
    state.shooting &&
    (!state.lastBulletTime || now - state.lastBulletTime > LASER_INTERVAL)
  ) {
    shootLaser(now);
    state.lastBulletTime = now;
  }
  updateLasers(now, delta);
  updateAsteroids(delta);
  checkLaserAsteroidCollisions();
  drawScore(ctx, state.score);
  drawAsteroids(ctx, asteroids);
  drawLasers(ctx, lasers);
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

window.addEventListener("DOMContentLoaded", () => {
  const muteBtn = document.createElement("button");
  muteBtn.textContent = "🔊";
  muteBtn.style.position = "absolute";
  muteBtn.style.top = "10px";
  muteBtn.style.right = "10px";
  muteBtn.style.zIndex = 10;
  muteBtn.style.fontSize = "2rem";
  muteBtn.style.background = "rgba(0,0,0,0.5)";
  muteBtn.style.color = "white";
  muteBtn.style.border = "none";
  muteBtn.style.borderRadius = "8px";
  muteBtn.style.cursor = "pointer";
  muteBtn.setAttribute("aria-label", "Mute/Unmute sound");
  muteBtn.setAttribute("tabindex", "0");
  let muted = false;
  muteBtn.addEventListener("click", (e) => {
    muted = !muted;
    setMuted(muted);
    muteBtn.textContent = muted ? "🔇" : "🔊";
    muteBtn.blur(); // Remove focus after click
    e.preventDefault();
  });
  muteBtn.addEventListener("keydown", (e) => {
    // Prevent space/enter from toggling when focused
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
    }
  });
  document.body.appendChild(muteBtn);
});
