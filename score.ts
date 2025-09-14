export function drawScore(ctx: CanvasRenderingContext2D, score: number): void {
  ctx.save();
  ctx.font = "28px Arial";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.strokeText(`Score: ${score}`, 20, 20);
  ctx.fillText(`Score: ${score}`, 20, 20);
  ctx.restore();
}
