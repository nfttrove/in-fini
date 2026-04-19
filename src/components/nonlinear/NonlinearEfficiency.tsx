import { useEffect, useRef } from "react";
import {
  clearCanvas,
  drawGrid,
  drawPolyline,
  drawVLine,
  plotRect,
  label,
} from "../../utils/canvas";
import { besselJ } from "../../utils/bessel";

interface EfficiencyProps {
  beta: number;
  maxBeta: number;
}

export default function NonlinearEfficiency({ beta, maxBeta }: EfficiencyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = { l: 50, r: 20, t: 22, b: 46 };
    const rect = plotRect(ctx, pad);

    clearCanvas(ctx);
    drawGrid(ctx, rect, 4, 5);

    const N = 400;
    const j0: { x: number; y: number }[] = [];
    const j1: { x: number; y: number }[] = [];
    const j2: { x: number; y: number }[] = [];
    const j1pow: { x: number; y: number }[] = [];

    for (let i = 0; i <= N; i++) {
      const b = (i / N) * maxBeta;
      const px = rect.x + (i / N) * rect.w;
      const j0v = besselJ(0, b);
      const j1v = besselJ(1, b);
      const j2v = besselJ(2, b);
      j0.push({ x: px, y: rect.y + rect.h - Math.abs(j0v) * rect.h });
      j1.push({ x: px, y: rect.y + rect.h - Math.abs(j1v) * rect.h });
      j2.push({ x: px, y: rect.y + rect.h - Math.abs(j2v) * rect.h });
      j1pow.push({
        x: px,
        y: rect.y + rect.h - 2 * j1v * j1v * rect.h,
      });
    }

    drawPolyline(ctx, j0, "#f59e0b", 2);
    drawPolyline(ctx, j2, "#94a3b8", 1.5);
    drawPolyline(ctx, j1, "#22d3ee", 2.5);
    drawPolyline(ctx, j1pow, "#3b82f6", 2);

    const betaPx = rect.x + (beta / maxBeta) * rect.w;
    drawVLine(ctx, rect, betaPx, "#e2e8f0", true, 1.5);
    label(ctx, `β = ${beta.toFixed(3)}`, betaPx, rect.y + 10, {
      color: "#e2e8f0",
      align: "center",
    });

    for (let i = 0; i <= 5; i++) {
      const b = (i / 5) * maxBeta;
      const px = rect.x + (i / 5) * rect.w;
      label(ctx, b.toFixed(1), px, rect.y + rect.h + 14, {
        color: "#64748b",
        align: "center",
        font: "10px monospace",
      });
    }
    ["0.0", "0.25", "0.5", "0.75", "1.0"].forEach((v, i) => {
      label(ctx, v, rect.x - 6, rect.y + rect.h - (i / 4) * rect.h + 4, {
        color: "#64748b",
        align: "right",
        font: "10px monospace",
      });
    });

    label(
      ctx,
      "Modulation depth β",
      rect.x + rect.w / 2,
      ctx.canvas.height - 8,
      { color: "#94a3b8", align: "center" }
    );

    const lx = rect.x + rect.w - 150;
    const ly = rect.y + 8;
    const legend = [
      { c: "#f59e0b", t: "|J₀(β)| carrier" },
      { c: "#22d3ee", t: "|J₁(β)| amplitude" },
      { c: "#3b82f6", t: "2·J₁²  (n=1 power)" },
      { c: "#94a3b8", t: "|J₂(β)|" },
    ];
    legend.forEach((l, i) => {
      ctx.fillStyle = l.c;
      ctx.fillRect(lx, ly + i * 14, 10, 3);
      label(ctx, l.t, lx + 14, ly + i * 14 + 4, {
        color: "#cbd5e1",
        font: "10px sans-serif",
      });
    });
  }, [beta, maxBeta]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-50 coffee-mode:bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 uppercase tracking-wider mb-3">
        Sideband amplitude vs. modulation depth
      </h3>
      <canvas
        ref={canvasRef}
        width={780}
        height={220}
        className="w-full rounded-lg"
        style={{ maxHeight: 220 }}
      />
    </div>
  );
}
