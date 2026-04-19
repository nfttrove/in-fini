import { useEffect, useRef } from "react";
import { casimirForce, formatScientific } from "../../utils/physics";
import {
  clearCanvas,
  drawGrid,
  drawPolyline,
  horizontalGradient,
  plotRect,
  label,
} from "../../utils/canvas";

interface CasimirChartProps {
  sepNm: number;
  areaM2: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function CasimirChart({ sepNm, areaM2 }: CasimirChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = { l: 56, r: 20, t: 20, b: 40 };
    const rect = plotRect(ctx, pad);

    const logMin = 0;
    const logMax = 3;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= 300; i++) {
      const t = i / 300;
      const d = Math.pow(10, lerp(logMin, logMax, t)) * 1e-9;
      points.push({ x: t, y: Math.abs(casimirForce(d, areaM2)) });
    }
    const maxF = Math.max(...points.map((p) => p.y));

    clearCanvas(ctx);
    drawGrid(ctx, rect, 4, 4);

    const curve = points.map((p) => ({
      x: rect.x + p.x * rect.w,
      y: rect.y + rect.h - (p.y / maxF) * rect.h,
    }));
    drawPolyline(ctx, curve, horizontalGradient(ctx, rect, "#3b82f6", "#06b6d4"), 2.5);

    const curT = (Math.log10(sepNm) - logMin) / (logMax - logMin);
    const curF = Math.abs(casimirForce(sepNm * 1e-9, areaM2));
    const curPx = rect.x + curT * rect.w;
    const curPy = rect.y + rect.h - (curF / maxF) * rect.h;

    ctx.strokeStyle = "#f59e0b44";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(curPx, rect.y + rect.h);
    ctx.lineTo(curPx, curPy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(curPx, curPy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.stroke();

    const xLabels = ["1", "10", "100", "1000"];
    xLabels.forEach((txt, i) => {
      const x = rect.x + (i / 3) * rect.w;
      label(ctx, txt + " nm", x, rect.y + rect.h + 18, {
        color: "#64748b",
        font: "11px monospace",
        align: "center",
      });
    });

    label(ctx, formatScientific(maxF, 1) + " N", rect.x - 4, rect.y + 10, {
      color: "#64748b",
      font: "10px monospace",
      align: "right",
    });
    label(ctx, "0", rect.x - 4, rect.y + rect.h, {
      color: "#64748b",
      font: "10px monospace",
      align: "right",
    });
    label(ctx, "Separation (log scale)", rect.x + rect.w / 2, ctx.canvas.height - 4, {
      color: "#94a3b8",
      align: "center",
    });
  }, [sepNm, areaM2]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-50 coffee-mode:bg-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 uppercase tracking-wider mb-4">
        Force vs. Separation (F ∝ d⁻⁴)
      </h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={220}
        className="w-full rounded-lg"
        style={{ maxHeight: 220 }}
      />
    </div>
  );
}
