import { useEffect, useRef } from "react";
import { couplingStrength } from "../../utils/physics";
import {
  clearCanvas,
  drawGrid,
  drawPolyline,
  drawVLine,
  plotRect,
  label,
} from "../../utils/canvas";

interface CavitySpectrumProps {
  resonantFreqHz: number;
  drivingFreqMHz: number;
  Q: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function CavitySpectrum({
  resonantFreqHz,
  drivingFreqMHz,
  Q,
}: CavitySpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resonantFreqMHz = resonantFreqHz / 1e6;
    const pad = { l: 50, r: 20, t: 20, b: 40 };
    const rect = plotRect(ctx, pad);

    clearCanvas(ctx);
    drawGrid(ctx, rect, 4, 0);

    const freqMin = 1;
    const freqMax = Math.max(resonantFreqMHz * 3, drivingFreqMHz * 1.5, 2000);

    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 400; i++) {
      const t = i / 400;
      const freq = lerp(freqMin, freqMax, t) * 1e6;
      pts.push({ x: t, y: couplingStrength(freq, resonantFreqHz, Q) });
    }

    const grad = ctx.createLinearGradient(0, rect.y + rect.h, 0, rect.y);
    grad.addColorStop(0, "#3b82f610");
    grad.addColorStop(1, "#3b82f640");
    ctx.beginPath();
    pts.forEach((p, i) => {
      const px = rect.x + p.x * rect.w;
      const py = rect.y + rect.h - p.y * rect.h;
      if (i === 0) ctx.moveTo(px, rect.y + rect.h);
      ctx.lineTo(px, py);
    });
    ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    drawPolyline(
      ctx,
      pts.map((p) => ({
        x: rect.x + p.x * rect.w,
        y: rect.y + rect.h - p.y * rect.h,
      })),
      "#3b82f6",
      2.5
    );

    const drivT = (drivingFreqMHz - freqMin) / (freqMax - freqMin);
    const drivPx = rect.x + drivT * rect.w;
    drawVLine(ctx, rect, drivPx, "#f59e0b", true, 2);
    label(ctx, `f_drive = ${drivingFreqMHz} MHz`, drivPx, rect.y - 6, {
      color: "#f59e0b",
      align: "center",
    });

    const resT = (resonantFreqMHz - freqMin) / (freqMax - freqMin);
    const resPx = rect.x + resT * rect.w;
    drawVLine(ctx, rect, resPx, "#06b6d4", true, 1.5);
    label(
      ctx,
      `f₀ = ${resonantFreqMHz.toFixed(0)} MHz`,
      resPx,
      rect.y + rect.h + 18,
      { color: "#06b6d4", align: "center" }
    );

    label(ctx, "1.0", rect.x - 4, rect.y + 10, {
      color: "#64748b",
      font: "10px monospace",
      align: "right",
    });
    label(ctx, "0.5", rect.x - 4, rect.y + rect.h / 2 + 5, {
      color: "#64748b",
      font: "10px monospace",
      align: "right",
    });
    label(ctx, "0", rect.x - 4, rect.y + rect.h, {
      color: "#64748b",
      font: "10px monospace",
      align: "right",
    });
    label(
      ctx,
      "Driving Frequency (MHz)",
      rect.x + rect.w / 2,
      ctx.canvas.height - 4,
      { color: "#94a3b8", align: "center" }
    );

    ctx.save();
    ctx.translate(14, rect.y + rect.h / 2);
    ctx.rotate(-Math.PI / 2);
    label(ctx, "Coupling (normalized)", 0, 0, {
      color: "#94a3b8",
      align: "center",
    });
    ctx.restore();
  }, [resonantFreqHz, drivingFreqMHz, Q]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-50 coffee-mode:bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 uppercase tracking-wider mb-3">
        Coupling Spectrum (Lorentzian)
      </h3>
      <canvas
        ref={canvasRef}
        width={700}
        height={220}
        className="w-full rounded-lg"
        style={{ maxHeight: 220 }}
      />
    </div>
  );
}
