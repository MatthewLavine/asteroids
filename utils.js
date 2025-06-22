export function wrapPosition(obj, width, height) {
  obj.x = (obj.x + width) % width;
  obj.y = (obj.y + height) % height;
}
