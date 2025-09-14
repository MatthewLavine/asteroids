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
import { Ship } from "./types.js";

/**
 * Updates the ship's position, velocity, and angle based on input and physics.
 * Keeps the angle within [0, 2π) and clamps speed to MAX_SPEED.
 * @param delta - Time elapsed since last frame in seconds
 */
export function updateShip(delta: number): void {
  const { ship, canvas } = state;
  if (!canvas) return;
  
  if (ship.turningLeft) ship.angle -= TURN_SPEED * delta;
  if (ship.turningRight) ship.angle += TURN_SPEED * delta;
  ship.angle = (ship.angle + Math.PI * 2) % (Math.PI * 2);
  if (ship.accelerating) {
    ship.velocityX += Math.sin(ship.angle) * ACCEL_AMOUNT * delta;
    ship.velocityY -= Math.cos(ship.angle) * ACCEL_AMOUNT * delta;
  }
  if (ship.braking) {
    ship.velocityX *= 1 - BRAKING_FORCE * delta;
    ship.velocityY *= 1 - BRAKING_FORCE * delta;
  }
  ship.velocityX *= 1 - FRICTION * delta;
  ship.velocityY *= 1 - FRICTION * delta;
  const speed = Math.hypot(ship.velocityX, ship.velocityY);
  if (speed > MAX_SPEED) {
    ship.velocityX = (ship.velocityX / speed) * MAX_SPEED;
    ship.velocityY = (ship.velocityY / speed) * MAX_SPEED;
  }
  ship.x += ship.velocityX * delta;
  ship.y += ship.velocityY * delta;
  wrapPosition(ship, canvas.width, canvas.height);
}

export function drawShip(ctx: CanvasRenderingContext2D, ship: Ship): void {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  const nose: [number, number] = [0, -SHIP_SIZE];
  const right: [number, number] = [SHIP_SIZE * 0.7, SHIP_SIZE * 0.7];
  const left: [number, number] = [-SHIP_SIZE * 0.7, SHIP_SIZE * 0.7];

  // Main body
  ctx.beginPath();
  ctx.moveTo(nose[0], nose[1]);
  ctx.lineTo(right[0], right[1]);
  ctx.lineTo(left[0], left[1]);
  ctx.closePath();
  // Gradient for metallic look
  const grad = ctx.createLinearGradient(0, -SHIP_SIZE, 0, SHIP_SIZE * 0.7);
  grad.addColorStop(0, "#e0e0ff");
  grad.addColorStop(0.5, "#8888aa");
  grad.addColorStop(1, "#222244");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "#66ccff";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Cockpit
  ctx.beginPath();
  ctx.ellipse(
    0,
    -SHIP_SIZE * 0.5,
    SHIP_SIZE * 0.18,
    SHIP_SIZE * 0.28,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "#66ccff";
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Accents (side fins)
  ctx.beginPath();
  ctx.moveTo(-SHIP_SIZE * 0.7, SHIP_SIZE * 0.7);
  ctx.lineTo(-SHIP_SIZE * 0.5, SHIP_SIZE * 0.3);
  ctx.lineTo(-SHIP_SIZE * 0.3, SHIP_SIZE * 0.7);
  ctx.closePath();
  ctx.fillStyle = "#ff3366";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(SHIP_SIZE * 0.7, SHIP_SIZE * 0.7);
  ctx.lineTo(SHIP_SIZE * 0.5, SHIP_SIZE * 0.3);
  ctx.lineTo(SHIP_SIZE * 0.3, SHIP_SIZE * 0.7);
  ctx.closePath();
  ctx.fillStyle = "#33ffd7";
  ctx.fill();

  // Flame
  if (ship.accelerating) {
    const flameLeft: [number, number] = [-SHIP_SIZE * 0.4, SHIP_SIZE * 0.7];
    const flameTip: [number, number] = [0, SHIP_SIZE * 1.3];
    const flameRight: [number, number] = [SHIP_SIZE * 0.4, SHIP_SIZE * 0.7];
    ctx.beginPath();
    ctx.moveTo(flameLeft[0], flameLeft[1]);
    ctx.lineTo(flameTip[0], flameTip[1]);
    ctx.lineTo(flameRight[0], flameRight[1]);
    ctx.closePath();
    ctx.fillStyle = "orange";
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "red";
    ctx.stroke();
  }

  // Braking effect: blue reverse thrusters on all three points
  if (ship.braking) {
    // Helper to draw a braking cone at a given point and angle
    function drawBrakingCone(x: number, y: number, angle: number): void {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      const brakeLeft: [number, number] = [-SHIP_SIZE * 0.18, 0];
      const brakeTip: [number, number] = [0, -SHIP_SIZE * 0.35]; // Shorter cone
      const brakeRight: [number, number] = [SHIP_SIZE * 0.18, 0];
      ctx.beginPath();
      ctx.moveTo(brakeLeft[0], brakeLeft[1]);
      ctx.lineTo(brakeTip[0], brakeTip[1]);
      ctx.lineTo(brakeRight[0], brakeRight[1]);
      ctx.closePath();
      ctx.fillStyle = "#33aaff";
      ctx.shadowColor = "#66ccff";
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#66ccff";
      ctx.stroke();
      ctx.restore();
    }
    const nose: [number, number] = [0, -SHIP_SIZE];
    const right: [number, number] = [SHIP_SIZE * 0.7, SHIP_SIZE * 0.7];
    const left: [number, number] = [-SHIP_SIZE * 0.7, SHIP_SIZE * 0.7];
    // Outward direction is from center (0,0) to each point
    function angleFromCenter([x, y]: [number, number]): number {
      return Math.atan2(y, x) + Math.PI / 2;
    }
    drawBrakingCone(nose[0], nose[1], angleFromCenter(nose));
    drawBrakingCone(right[0], right[1], angleFromCenter(right));
    drawBrakingCone(left[0], left[1], angleFromCenter(left));
  }
  ctx.restore();
}
