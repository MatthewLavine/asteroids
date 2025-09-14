import { GameState } from "./types.js";

export const state: GameState = {
  ship: {
    x: 0,
    y: 0,
    angle: 0,
    velocityX: 0,
    velocityY: 0,
    turningLeft: false,
    turningRight: false,
    accelerating: false,
    braking: false,
  },
  lasers: [],
  shooting: false,
  lastBulletTime: 0,
  score: 0,
  ctx: null,
  canvas: null,
  asteroids: [],
  gameOver: false, // Track game over state
};
