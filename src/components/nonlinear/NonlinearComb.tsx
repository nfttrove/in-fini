import { useEffect, useRef } from "react";
import {
  clearCanvas,
  drawGrid,
  drawVLine,
  plotRect,
  label,
  drawPolyline,
} from "../../utils/canvas";

interface CombProps {
  f0Hz: number;
  fmHz: number;
  maxOrder: number;
  Q: number;
  sidebands: { n: number; freq: number; amp: number }[];
}

export default function NonlinearComb({
  f0Hz,
  fmHz,
  maxOrder,
  Q,
  sidebands,
}: CombProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = { l: 60, r: 20, t: 28, b: 54 };
    const rect = plotRect(ctx, pad);

    clearCanvas(ctx);
    drawGrid(ctx, rect, 4, 0);

    const spanFactor = Math.max(1.2, maxOrder + 1);
    const fMin = f0Hz - spanFactor * fmHz;
    const fMax = f0Hz + spanFactor * fmHz;
    const maxAmp = Math.max(
      1e-6,
      ...sidebands.map((s) => Math.abs(s.amp))
    );

    const gamma = f0Hz / Q;
    const lorPts: { x: number; y: number }[] = [];
    const N = 400;
    for (let i = 0; i <= N; i++) {
      const f = fMin + ((fMax - fMin) * i) / N;
      const denom = 1 + Math.pow((2 * (f - f0Hz)) / gamma, 2);
      const y = 1 / Math.sqrt(denom);
      lorPts.push({
        x: rect.x + ((f - fMin) / (fMax - fMin)) * rect.w,
        y: rect.y + rect.h - y * rect.h * 0.95,
      });
    }
    ctx.globalAlpha = 0.35;
    drawPolyline(ctx, lorPts, "#0ea5e9", 1.5);
    ctx.globalAlpha = 1;

    const resPx = rect.x + ((f0Hz - fMin) / (fMax - fMin)) * rect.w;
    drawVLine(ctx, rect, resPx, "#22d3ee", true, 1);
    label(ctx, "f₀", resPx, rect.y - 10, {
      color: "#22d3ee",
      align: "center",
    });

    sidebands.forEach((s) => {
      const t = (s.freq - fMin) / (fMax - fMin);
      const px = rect.x + t * rect.w;
      const h = (Math.abs(s.amp) / maxAmp) * rect.h * 0.95;
      const color =
        s.n === 0 ? "#f59e0b" : Math.abs(s.n) === 1 ? "#22d3ee" : "#64748b";
      ctx.fillStyle = color;
      ctx.fillRect(px - 2, rect.y + rect.h - h, 4, h);
      ctx.beginPath();
      ctx.arc(px, rect.y + rect.h - h, 3.5, 0, 2 * Math.PI);
      ctx.fill();
      if (Math.abs(s.amp) / maxAmp > 0.08) {
        label(ctx, `${s.n >= 0 ? "+" : ""}${s.n}`, px, rect.y + rect.h - h - 8, {
          color,
          align: "center",
          font: "10px monospace",
        });
      }
    });

    const fmHzStr =
      fmHz >= 1e6
        ? `${(fmHz / 1e6).toFixed(2)} MHz`
        : fmHz >= 1e3
        ? `${(fmHz / 1e3).toFixed(1)} kHz`
        : `${fmHz.toFixed(1)} Hz`;
    label(
      ctx,
      `Spectrum: f₀ ± n·fₘ   (fₘ = ${fmHzStr}, spacing exaggerated)`,
      rect.x + rect.w / 2,
      ctx.canvas.height - 8,
      { color: "#94a3b8", align: "center" }
    );

    label(ctx, "|Jₙ(β)|", rect.x - 8, rect.y + 10, {
      color: "#64748b",
      align: "right",
      font: "10px monospace",
    });

    ctx.fillStyle = "#64748b";
    ctx.font = "10px monospace";
    [-maxOrder, 0, maxOrder].forEach((n) => {
      const f = f0Hz + n * fmHz;
      const t = (f - fMin) / (fMax - fMin);
      const px = rect.x + t * rect.w;
      ctx.textAlign = "center";
      ctx.fillText(
        n === 0 ? "f₀" : `f₀${n > 0 ? "+" : ""}${n}fₘ`,
        px,
        rect.y + rect.h + 16
      );
    });
  }, [f0Hz, fmHz, maxOrder, Q, sidebands]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-50 coffee-mode:bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 uppercase tracking-wider mb-3">
        Frequency Comb (Bessel sidebands)
      </h3>
      <canvas
        ref={canvasRef}
        width={780}
        height={260}
        className="w-full rounded-lg"
        style={{ maxHeight: 260 }}
      />
    </div>
  );
}
