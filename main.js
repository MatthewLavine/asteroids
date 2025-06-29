import { state } from "./state.js";
import { setupInput } from "./input.js";
import { updateShip, drawShip } from "./ship.js";
import { shootLaser, updateLasers, drawLasers } from "./lasers.js";
import {
  drawAsteroids,
  updateAsteroids,
  spawnAsteroids,
  checkLaserAsteroidCollisions,
  checkShipAsteroidCollision,
} from "./asteroids.js";
import { drawScore } from "./score.js";
import { LASER_INTERVAL } from "./constants.js";
import { initStarfield, updateStarfield, drawStarfield } from "./starfield.js";
import { setMuted } from "./sound.js";

let lastFrameTime = null;

// Make collision check available globally for the game loop
window.checkShipAsteroidCollision = checkShipAsteroidCollision;

function showNewGameButton() {
  let btn = document.getElementById("newGameBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "newGameBtn";
    btn.textContent = "New Game";
    btn.style.position = "absolute";
    btn.style.left = "50%";
    btn.style.top = "60%";
    btn.style.transform = "translate(-50%, -50%)";
    btn.style.fontSize = "2rem";
    btn.style.padding = "0.5em 2em";
    btn.style.background = "#222";
    btn.style.color = "#fff";
    btn.style.border = "2px solid #fff";
    btn.style.borderRadius = "10px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = 20;
    btn.addEventListener("click", () => {
      btn.remove();
      resetGame();
    });
    document.body.appendChild(btn);
  }
}

function resetGame() {
  state.score = 0;
  state.ship.x = state.canvas.width / 2;
  state.ship.y = state.canvas.height / 2;
  state.ship.angle = 0;
  state.ship.velocityX = 0;
  state.ship.velocityY = 0;
  state.ship.turningLeft = false;
  state.ship.turningRight = false;
  state.ship.accelerating = false;
  state.ship.braking = false;
  state.lasers = [];
  state.asteroids = [];
  state.shooting = false;
  state.lastBulletTime = 0;
  state.gameOver = false;
  spawnAsteroids();
  lastFrameTime = null;
  requestAnimationFrame(gameLoop);
}

function drawGameOverScreen() {
  const { ctx, canvas, ship, lasers, asteroids } = state;
  // Draw background and starfield
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (typeof drawStarfield === "function") {
    drawStarfield(ctx);
  }
  drawScore(ctx, state.score);
  drawAsteroids(ctx, asteroids);
  drawLasers(ctx, lasers);
  drawShip(ctx, ship);
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1.0;
  ctx.font = "bold 64px sans-serif";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  ctx.restore();
  showNewGameButton();
  // Listen for spacebar to restart
  if (!window._gameOverSpaceListener) {
    window._gameOverSpaceListener = function (e) {
      if (state.gameOver && (e.code === "Space" || e.key === " ")) {
        const btn = document.getElementById("newGameBtn");
        if (btn) btn.remove();
        resetGame();
        window.removeEventListener("keydown", window._gameOverSpaceListener);
        window._gameOverSpaceListener = null;
      }
    };
    window.addEventListener("keydown", window._gameOverSpaceListener);
  }
}

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
  // Check for ship-asteroid collision
  if (
    window.checkShipAsteroidCollision &&
    window.checkShipAsteroidCollision()
  ) {
    drawGameOverScreen();
    return; // Stop the game loop
  }
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

function handleResize() {
  const canvas = document.getElementById("gameCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (state.canvas !== canvas) {
    state.canvas = canvas;
    state.ctx = canvas.getContext("2d");
  }
  if (state.stars) {
    // Reinitialize starfield for new size
    initStarfield();
  }
  if (state.gameOver) {
    // Redraw game over overlay
    drawGameOverScreen();
  }
}

document.addEventListener("DOMContentLoaded", startGame);
window.addEventListener("resize", handleResize);

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
