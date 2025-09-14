// Game constants with proper TypeScript typing
export const SHIP_SIZE: number = 40;
// All speeds and accelerations are now in units per second
export const ACCEL_AMOUNT: number = 400; // px/sec^2
export const FRICTION: number = 0.1; // fraction of velocity lost per second
export const BRAKING_FORCE: number = 2.0; // fraction of velocity lost per second
export const MAX_SPEED: number = 500; // px/sec
export const TURN_SPEED: number = 1.5 * Math.PI; // radians/sec
export const LASER_SPEED: number = 600; // px/sec
export const LASER_RADIUS: number = 4;
export const LASER_INTERVAL: number = 120; // ms
export const LASER_LIFESPAN: number = 2000; // ms
export const ASTEROID_MIN_SIZE: number = 100;
export const ASTEROID_MAX_SIZE: number = 300;
export const ASTEROID_MIN_SPEED: number = 40; // px/sec
export const ASTEROID_MAX_SPEED: number = 120; // px/sec
export const ASTEROID_COUNT: number = 5;
