import { state } from "./state.js";
import {
  SHIP_SIZE,
  LASER_SPEED,
  LASER_RADIUS,
  LASER_LIFESPAN,
} from "./constants.js";
import { wrapPosition } from "./utils.js";

export function shootLaser(now) {
  const { ship, lasers } = state;
  const tipX = ship.x + Math.sin(ship.angle) * SHIP_SIZE;
  const tipY = ship.y - Math.cos(ship.angle) * SHIP_SIZE;
  lasers.push({
    x: tipX,
    y: tipY,
    vx: Math.sin(ship.angle) * LASER_SPEED + ship.velocityX,
    vy: -Math.cos(ship.angle) * LASER_SPEED + ship.velocityY,
    angle: ship.angle, // store angle for laser direction
    createdAt: now,
  });
}

export function updateLasers(now, delta) {
  const { lasers, canvas } = state;
  for (let i = lasers.length - 1; i >= 0; i--) {
    const l = lasers[i];
    l.x += l.vx * delta;
    l.y += l.vy * delta;
    wrapPosition(l, canvas.width, canvas.height);
    if (now - l.createdAt > LASER_LIFESPAN) {
      lasers.splice(i, 1);
    }
  }
}

export function drawLasers(ctx, lasers) {
  ctx.save();
  for (const l of lasers) {
    const age = performance.now() - l.createdAt;
    let alpha = 1 - age / LASER_LIFESPAN;
    if (alpha < 0) alpha = 0;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#ff66ff";
    ctx.lineWidth = 3;
    // Draw as a short laser bolt in the direction of travel
    const len = 18;
    const x1 = l.x - (Math.sin(l.angle) * len) / 2;
    const y1 = l.y + (Math.cos(l.angle) * len) / 2;
    const x2 = l.x + (Math.sin(l.angle) * len) / 2;
    const y2 = l.y - (Math.cos(l.angle) * len) / 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
