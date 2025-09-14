// Type definitions for the Asteroids game

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  velocityX: number;
  velocityY: number;
}

export interface Ship extends Position, Velocity {
  angle: number;
  turningLeft: boolean;
  turningRight: boolean;
  accelerating: boolean;
  braking: boolean;
}

export interface Laser extends Position {
  vx: number;
  vy: number;
  angle: number;
  createdAt: number;
}

export interface AsteroidShape {
  x: number;
  y: number;
}

export interface Asteroid extends Position, Velocity {
  size: number;
  shape: AsteroidShape[];
  rotation: number;
  rotationSpeed: number;
}

export interface Star extends Position {
  radius: number;
  speed: number;
}

export interface GameState {
  ship: Ship;
  lasers: Laser[];
  shooting: boolean;
  lastBulletTime: number;
  score: number;
  ctx: CanvasRenderingContext2D | null;
  canvas: HTMLCanvasElement | null;
  asteroids: Asteroid[];
  gameOver: boolean;
  stars?: Star[];
}

// DOM event types
export type KeyCode = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Space";

// Sound types
export type SoundName = "laser1" | "laser2" | "explosion";

// Global window extensions for game-specific functions
declare global {
  interface Window {
    checkShipAsteroidCollision?: () => boolean;
    _gameOverSpaceListener?: (e: KeyboardEvent) => void;
  }
}
