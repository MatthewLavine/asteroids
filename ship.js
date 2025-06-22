import { state } from "./state.js";
import {
  SHIP_SIZE,
  TURN_SPEED,
  ACCEL_AMOUNT,
  BRAKING_FORCE,
  FRICTION,
  MAX_SPEED,
} from "./constants.js";
import { wrapPosition } from "./utils.js";

/**
 * Updates the ship's position, velocity, and angle based on input and physics.
 * Keeps the angle within [0, 2π) and clamps speed to MAX_SPEED.
 */
export function updateShip() {
  const { ship, canvas } = state;
  if (ship.turningLeft) ship.angle -= TURN_SPEED;
  if (ship.turningRight) ship.angle += TURN_SPEED;
  ship.angle = (ship.angle + Math.PI * 2) % (Math.PI * 2);
  if (ship.accelerating) {
    ship.velocityX += Math.sin(ship.angle) * ACCEL_AMOUNT;
    ship.velocityY -= Math.cos(ship.angle) * ACCEL_AMOUNT;
  }
  if (ship.braking) {
    ship.velocityX *= BRAKING_FORCE;
    ship.velocityY *= BRAKING_FORCE;
  }
  ship.velocityX *= FRICTION;
  ship.velocityY *= FRICTION;
  const speed = Math.hypot(ship.velocityX, ship.velocityY);
  if (speed > MAX_SPEED) {
    ship.velocityX = (ship.velocityX / speed) * MAX_SPEED;
    ship.velocityY = (ship.velocityY / speed) * MAX_SPEED;
  }
  ship.x += ship.velocityX;
  ship.y += ship.velocityY;
  wrapPosition(ship, canvas.width, canvas.height);
}

export function drawShip(ctx, ship) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  const nose = [0, -SHIP_SIZE];
  const right = [SHIP_SIZE * 0.7, SHIP_SIZE * 0.7];
  const left = [-SHIP_SIZE * 0.7, SHIP_SIZE * 0.7];
  ctx.beginPath();
  ctx.moveTo(...nose);
  ctx.lineTo(...right);
  ctx.lineTo(...left);
  ctx.closePath();
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 3;
  ctx.stroke();
  if (ship.accelerating) {
    const flameLeft = [-SHIP_SIZE * 0.4, SHIP_SIZE * 0.7];
    const flameTip = [0, SHIP_SIZE * 1.2];
    const flameRight = [SHIP_SIZE * 0.4, SHIP_SIZE * 0.7];
    ctx.beginPath();
    ctx.moveTo(...flameLeft);
    ctx.lineTo(...flameTip);
    ctx.lineTo(...flameRight);
    ctx.closePath();
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.stroke();
  }
  ctx.restore();
}
