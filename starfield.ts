// starfield.ts
// Simple starfield background for the Asteroids game

import { state } from "./state.js";
import { wrapPosition } from "./utils.js";

const STAR_COUNT: number = 100;
const STAR_MIN_RADIUS: number = 0.5;
const STAR_MAX_RADIUS: number = 1.5;
const STAR_MIN_SPEED: number = 5; // px/sec
const STAR_MAX_SPEED: number = 20; // px/sec

export function initStarfield(): void {
  const { canvas } = state;
  if (!canvas) return;
  
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

export function updateStarfield(delta: number): void {
  const { stars, canvas } = state;
  if (!stars || !canvas) return;
  
  for (const star of stars) {
    star.y += star.speed * delta;
    wrapPosition(star, canvas.width, canvas.height);
    if (star.y < 0.5) {
      // If a star wraps to the top, randomize its x for a more natural look
      star.x = Math.random() * canvas.width;
    }
  }
}

export function drawStarfield(ctx: CanvasRenderingContext2D): void {
  const { stars } = state;
  if (!stars) return;
  
  ctx.save();
  ctx.fillStyle = "white";
  ctx.globalAlpha = 0.7;
  for (const star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
  ctx.restore();
}
