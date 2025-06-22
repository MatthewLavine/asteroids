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

export function updateShip() {
  const { ship, canvas } = state;
  if (ship.turningLeft) ship.angle -= TURN_SPEED;
  if (ship.turningRight) ship.angle += TURN_SPEED;
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
  const speed = Math.sqrt(ship.velocityX ** 2 + ship.velocityY ** 2);
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
  ctx.beginPath();
  ctx.moveTo(0, -SHIP_SIZE);
  ctx.lineTo(SHIP_SIZE * 0.7, SHIP_SIZE * 0.7);
  ctx.lineTo(-SHIP_SIZE * 0.7, SHIP_SIZE * 0.7);
  ctx.closePath();
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 3;
  ctx.stroke();
  if (ship.accelerating) {
    ctx.beginPath();
    ctx.moveTo(-SHIP_SIZE * 0.4, SHIP_SIZE * 0.7);
    ctx.lineTo(0, SHIP_SIZE * 1.2);
    ctx.lineTo(SHIP_SIZE * 0.4, SHIP_SIZE * 0.7);
    ctx.closePath();
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.stroke();
  }
  ctx.restore();
}
