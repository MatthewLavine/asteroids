import { state } from "./state.js";
import { KeyCode } from "./types.js";

export function setupInput(): void {
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    switch (e.code as KeyCode) {
      case "ArrowUp":
        state.ship.accelerating = true;
        break;
      case "ArrowLeft":
        state.ship.turningLeft = true;
        break;
      case "ArrowRight":
        state.ship.turningRight = true;
        break;
      case "Space":
        state.shooting = true;
        break;
      case "ArrowDown":
        state.ship.braking = true;
        break;
    }
  });

  document.addEventListener("keyup", (e: KeyboardEvent) => {
    switch (e.code as KeyCode) {
      case "ArrowUp":
        state.ship.accelerating = false;
        break;
      case "ArrowLeft":
        state.ship.turningLeft = false;
        break;
      case "ArrowRight":
        state.ship.turningRight = false;
        break;
      case "Space":
        state.shooting = false;
        break;
      case "ArrowDown":
        state.ship.braking = false;
        break;
    }
  });
}
