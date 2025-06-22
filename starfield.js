// starfield.js
// Simple starfield background for the Asteroids game

import { state } from "./state.js";
import { wrapPosition } from "./utils.js";

const STAR_COUNT = 100;
const STAR_MIN_RADIUS = 0.5;
const STAR_MAX_RADIUS = 1.5;
const STAR_MIN_SPEED = 5; // px/sec
const STAR_MAX_SPEED = 20; // px/sec

export function initStarfield() {
  const { canvas } = state;
  state.stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const radius =
      STAR_MIN_RADIUS + Math.random() * (STAR_MAX_RADIUS - STAR_MIN_RADIUS);
    // Parallax: speed is proportional to radius
    const t = (radius - STAR_MIN_RADIUS) / (STAR_MAX_RADIUS - STAR_MIN_RADIUS);
    const speed = STAR_MIN_SPEED + t * (STAR_MAX_SPEED - STAR_MIN_SPEED);
    state.stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius,
      speed,
    });
  }
}

export function updateStarfield(delta) {
  const { stars, canvas } = state;
  for (const star of stars) {
    star.y += star.speed * delta;
    wrapPosition(star, canvas.width, canvas.height);
    if (star.y < 0.5) {
      // If a star wraps to the top, randomize its x for a more natural look
      star.x = Math.random() * canvas.width;
    }
  }
}

export function drawStarfield(ctx) {
  ctx.save();
  ctx.fillStyle = "white";
  ctx.globalAlpha = 0.7;
  for (const star of state.stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
  ctx.restore();
}
