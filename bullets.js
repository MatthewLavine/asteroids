import { state } from "./state.js";
import {
  SHIP_SIZE,
  BULLET_SPEED,
  BULLET_RADIUS,
  BULLET_LIFESPAN,
} from "./constants.js";
import { wrapPosition } from "./utils.js";

export function shootBullet(now) {
  const { ship, bullets } = state;
  const tipX = ship.x + Math.sin(ship.angle) * SHIP_SIZE;
  const tipY = ship.y - Math.cos(ship.angle) * SHIP_SIZE;
  bullets.push({
    x: tipX,
    y: tipY,
    vx: Math.sin(ship.angle) * BULLET_SPEED + ship.velocityX,
    vy: -Math.cos(ship.angle) * BULLET_SPEED + ship.velocityY,
    createdAt: now,
  });
}

export function updateBullets(now) {
  const { bullets, canvas } = state;
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    wrapPosition(b, canvas.width, canvas.height);
    if (now - b.createdAt > BULLET_LIFESPAN) {
      bullets.splice(i, 1);
    }
  }
}

export function drawBullets(ctx, bullets) {
  ctx.save();
  ctx.fillStyle = "red";
  for (const b of bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
