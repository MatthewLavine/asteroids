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

let lastFrameTime: number | null = null;

// Make collision check available globally for the game loop
window.checkShipAsteroidCollision = checkShipAsteroidCollision;

function showNewGameButton(y?: number): void {
  let btn = document.getElementById("newGameBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "newGameBtn";
    btn.textContent = "New Game";
    btn.style.position = "absolute";
    btn.style.left = "50%";
    btn.style.transform = "translate(-50%, -50%)";
    btn.style.fontSize = "2rem";
    btn.style.padding = "0.5em 2em";
    btn.style.background = "#222";
    btn.style.color = "#fff";
    btn.style.border = "2px solid #fff";
    btn.style.borderRadius = "10px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "20";
    btn.addEventListener("click", () => {
      btn?.remove();
      resetGame();
    });
    document.body.appendChild(btn);
  }
  if (typeof y === "number") {
    btn.style.top = `${y}px`;
  } else {
    btn.style.top = "60%";
  }
}

function resetGame(): void {
  const { canvas } = state;
  if (!canvas) return;
  
  state.score = 0;
  state.ship.x = canvas.width / 2;
  state.ship.y = canvas.height / 2;
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

function drawGameOverScreen(): void {
  const { ctx, canvas, ship, lasers, asteroids } = state;
  if (!ctx || !canvas) return;
  
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
  // Calculate vertical positions for even spacing
  const centerY = canvas.height / 2;
  const spacing = 140;
  const topScoreY = centerY - spacing;
  const gameOverY = centerY;
  const newGameBtnY = centerY + spacing;

  // Show top score above GAME OVER
  let topScore = 0;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      topScore =
        parseInt(window.localStorage.getItem("asteroidsTopScore") || "0") || 0;
    }
  } catch {
    // ignore
  }
  if (state.score > topScore) {
    topScore = state.score;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("asteroidsTopScore", topScore.toString());
      }
    } catch {
      // ignore
    }
  }
  ctx.font = "bold 32px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(`Top Score: ${topScore}`, canvas.width / 2, topScoreY);
  ctx.font = "bold 64px sans-serif";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, gameOverY);
  ctx.restore();
  showNewGameButton(newGameBtnY);
  // Listen for spacebar to restart
  if (!window._gameOverSpaceListener) {
    window._gameOverSpaceListener = function (e: KeyboardEvent) {
      if (state.gameOver && (e.code === "Space" || e.key === " ")) {
        const btn = document.getElementById("newGameBtn");
        if (btn) btn.remove();
        resetGame();
        if (window._gameOverSpaceListener) {
          window.removeEventListener("keydown", window._gameOverSpaceListener);
          window._gameOverSpaceListener = undefined;
        }
      }
    };
    window.addEventListener("keydown", window._gameOverSpaceListener);
  }
}

function gameLoop(now: number): void {
  if (!lastFrameTime) lastFrameTime = now;
  const delta = (now - lastFrameTime) / 1000; // seconds
  lastFrameTime = now;
  const { ctx, canvas, ship, lasers, asteroids } = state;
  if (!ctx || !canvas) return;
  
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

function startGame(): void {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (!canvas) return;
  
  state.canvas = canvas;
  state.ctx = canvas.getContext("2d");
  if (!state.ctx) return;
  
  state.ship.x = canvas.width / 2;
  state.ship.y = canvas.height / 2;
  spawnAsteroids();
  setupInput();
  initStarfield();
  requestAnimationFrame(gameLoop);
}

function handleResize(): void {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (!canvas) return;
  
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
  muteBtn.style.zIndex = "10";
  muteBtn.style.fontSize = "2rem";
  muteBtn.style.background = "rgba(0,0,0,0.5)";
  muteBtn.style.color = "white";
  muteBtn.style.border = "none";
  muteBtn.style.borderRadius = "8px";
  muteBtn.style.cursor = "pointer";
  muteBtn.setAttribute("aria-label", "Mute/Unmute sound");
  muteBtn.setAttribute("tabindex", "0");
  let muted = false;
  muteBtn.addEventListener("click", (e: MouseEvent) => {
    muted = !muted;
    setMuted(muted);
    muteBtn.textContent = muted ? "🔇" : "🔊";
    muteBtn.blur(); // Remove focus after click
    e.preventDefault();
  });
  muteBtn.addEventListener("keydown", (e: KeyboardEvent) => {
    // Prevent space/enter from toggling when focused
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
    }
  });
  document.body.appendChild(muteBtn);

  // Add GitHub repo link in bottom left corner
  let githubLink = document.getElementById("githubRepoLink") as HTMLAnchorElement;
  if (!githubLink) {
    githubLink = document.createElement("a");
    githubLink.id = "githubRepoLink";
    githubLink.href = "https://github.com/MatthewLavine/asteroids";
    githubLink.target = "_blank";
    githubLink.rel = "noopener noreferrer";
    githubLink.style.position = "fixed";
    githubLink.style.left = "16px";
    githubLink.style.bottom = "16px";
    githubLink.style.background = "rgba(0,0,0,0.7)";
    githubLink.style.color = "#fff";
    githubLink.style.padding = "8px";
    githubLink.style.borderRadius = "8px";
    githubLink.style.fontSize = "1.1rem";
    githubLink.style.textDecoration = "none";
    githubLink.style.zIndex = "30";
    githubLink.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    githubLink.style.transition = "background 0.2s";
    githubLink.style.display = "flex";
    githubLink.style.alignItems = "center";
    githubLink.style.justifyContent = "center";
    githubLink.style.width = "44px";
    githubLink.style.height = "44px";
    githubLink.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-label="GitHub" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
      </svg>
    `;
    githubLink.addEventListener("mouseover", () => {
      githubLink!.style.background = "#333";
    });
    githubLink.addEventListener("mouseout", () => {
      githubLink!.style.background = "rgba(0,0,0,0.7)";
    });
    githubLink.setAttribute("aria-label", "View on GitHub");
    document.body.appendChild(githubLink);
  }
});
