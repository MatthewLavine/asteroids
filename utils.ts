import { Position } from "./types.js";

export function wrapPosition(obj: Position, width: number, height: number): void {
  obj.x = (obj.x + width) % width;
  obj.y = (obj.y + height) % height;
}
