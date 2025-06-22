export function wrapPosition(obj, width, height) {
  if (obj.y < 0) obj.y = height;
  else if (obj.y > height) obj.y = 0;
  if (obj.x < 0) obj.x = width;
  else if (obj.x > width) obj.x = 0;
}
