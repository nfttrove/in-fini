export interface Padding {
  l: number;
  r: number;
  t: number;
  b: number;
}

export interface PlotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function clearCanvas(ctx: CanvasRenderingContext2D, bg = "#0f172a") {
  const { width, height } = ctx.canvas;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
}

export function plotRect(
  ctx: CanvasRenderingContext2D,
  pad: Padding
): PlotRect {
  return {
    x: pad.l,
    y: pad.t,
    w: ctx.canvas.width - pad.l - pad.r,
    h: ctx.canvas.height - pad.t - pad.b,
  };
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  rect: PlotRect,
  rows = 4,
  cols = 0,
  color = "#1e3a5f"
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i <= rows; i++) {
    const y = rect.y + (i / rows) * rect.h;
    ctx.beginPath();
    ctx.moveTo(rect.x, y);
    ctx.lineTo(rect.x + rect.w, y);
    ctx.stroke();
  }
  if (cols > 0) {
    for (let i = 0; i <= cols; i++) {
      const x = rect.x + (i / cols) * rect.w;
      ctx.beginPath();
      ctx.moveTo(x, rect.y);
      ctx.lineTo(x, rect.y + rect.h);
      ctx.stroke();
    }
  }
}

export function drawPolyline(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  stroke: string | CanvasGradient,
  lineWidth = 2
) {
  ctx.beginPath();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
}

export function horizontalGradient(
  ctx: CanvasRenderingContext2D,
  rect: PlotRect,
  from: string,
  to: string
): CanvasGradient {
  const g = ctx.createLinearGradient(rect.x, 0, rect.x + rect.w, 0);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

export function drawVLine(
  ctx: CanvasRenderingContext2D,
  rect: PlotRect,
  x: number,
  color: string,
  dashed = false,
  width = 1.5
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dashed) ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(x, rect.y);
  ctx.lineTo(x, rect.y + rect.h);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: {
    color?: string;
    font?: string;
    align?: CanvasTextAlign;
  } = {}
) {
  ctx.fillStyle = opts.color ?? "#94a3b8";
  ctx.font = opts.font ?? "11px sans-serif";
  ctx.textAlign = opts.align ?? "left";
  ctx.fillText(text, x, y);
}
