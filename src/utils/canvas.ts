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

/**
 * Logical canvas size: the CSS-pixel dimensions a chart is drawn in,
 * independent of the retina backing store. All helpers below use this so
 * drawing code works identically at 1× and 2× device pixel ratio.
 */
export function logicalSize(ctx: CanvasRenderingContext2D): { w: number; h: number } {
  const scale = ctx.getTransform().a || 1;
  return { w: ctx.canvas.width / scale, h: ctx.canvas.height / scale };
}

/**
 * Prepare a canvas for sharp rendering on high-DPR displays: size the
 * backing store by devicePixelRatio (capped at 2), scale the context so
 * all drawing stays in logical pixels, and fix the element's aspect ratio
 * so CSS sizing cannot distort it. Call once per redraw, before drawing.
 * Returns the ready context, or null (no 2D support — same contract the
 * components already handled).
 */
export function prepareCanvas(
  canvas: HTMLCanvasElement,
  w: number,
  h: number
): CanvasRenderingContext2D | null {
  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    2
  );
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = "100%";
  canvas.style.aspectRatio = `${w} / ${h}`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export function clearCanvas(ctx: CanvasRenderingContext2D, bg = "#0f172a") {
  const { w, h } = logicalSize(ctx);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
}

export function plotRect(
  ctx: CanvasRenderingContext2D,
  pad: Padding
): PlotRect {
  return {
    x: pad.l,
    y: pad.t,
    w: logicalSize(ctx).w - pad.l - pad.r,
    h: logicalSize(ctx).h - pad.t - pad.b,
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
