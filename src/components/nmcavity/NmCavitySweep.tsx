import { useEffect, useRef } from "react";
import {
  clearCanvas,
  drawGrid,
  drawPolyline,
  drawVLine,
  plotRect,
  label,
} from "../../utils/canvas";

interface SweepProps {
  f0Hz: number;
  driveHz: number;
  Q: number;
}

function lorentz(f: number, f0: number, Q: number) {
  const gamma = f0 / Q;
  const delta = f - f0;
  return 1 / Math.sqrt(1 + Math.pow((2 * delta) / gamma, 2));
}

export default function NmCavitySweep({ f0Hz, driveHz, Q }: SweepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = { l: 60, r: 24, t: 24, b: 46 };
    const rect = plotRect(ctx, pad);

    clearCanvas(ctx);
    drawGrid(ctx, rect, 4, 6);

    const gamma = f0Hz / Q;
    const halfSpan = Math.max(gamma * 8, f0Hz * 0.02);
    const fMin = f0Hz - halfSpan;
    const fMax = f0Hz + halfSpan;

    const pts: { x: number; y: number }[] = [];
    const N = 600;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const f = fMin + (fMax - fMin) * t;
      pts.push({ x: t, y: lorentz(f, f0Hz, Q) });
    }

    const grad = ctx.createLinearGradient(0, rect.y + rect.h, 0, rect.y);
    grad.addColorStop(0, "#0ea5e910");
    grad.addColorStop(1, "#0ea5e950");
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
      "#0ea5e9",
      2.5
    );

    const resT = (f0Hz - fMin) / (fMax - fMin);
    const resPx = rect.x + resT * rect.w;
    drawVLine(ctx, rect, resPx, "#22d3ee", false, 1.5);
    label(
      ctx,
      `f₀ = ${(f0Hz / 1e12).toFixed(2)} THz`,
      resPx,
      rect.y - 8,
      { color: "#22d3ee", align: "center" }
    );

    const driveInRange = driveHz >= fMin && driveHz <= fMax;
    if (driveInRange) {
      const drivT = (driveHz - fMin) / (fMax - fMin);
      const drivPx = rect.x + drivT * rect.w;
      drawVLine(ctx, rect, drivPx, "#f59e0b", true, 2);
      label(
        ctx,
        `drive = ${(driveHz / 1e12).toFixed(2)} THz`,
        drivPx,
        rect.y + 12,
        { color: "#f59e0b", align: "center" }
      );
    } else {
      const side = driveHz < fMin ? "left" : "right";
      const msgX =
        side === "left" ? rect.x + 8 : rect.x + rect.w - 8;
      label(
        ctx,
        `drive off-scale (${(driveHz / 1e12).toFixed(1)} THz ${
          side === "left" ? "below" : "above"
        } window)`,
        msgX,
        rect.y + 14,
        {
          color: "#f59e0b",
          align: side === "left" ? "left" : "right",
        }
      );
    }

    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const f = fMin + (fMax - fMin) * t;
      const px = rect.x + t * rect.w;
      const fThz = f / 1e12;
      label(
        ctx,
        fThz >= 1000 ? `${(fThz / 1000).toFixed(2)}P` : `${fThz.toFixed(1)}T`,
        px,
        rect.y + rect.h + 14,
        { color: "#64748b", align: "center", font: "10px monospace" }
      );
    }

    label(ctx, "1.0", rect.x - 6, rect.y + 10, {
      color: "#64748b",
      font: "10px monospace",
      align: "right",
    });
    label(ctx, "0.5", rect.x - 6, rect.y + rect.h / 2 + 4, {
      color: "#64748b",
      font: "10px monospace",
      align: "right",
    });
    label(ctx, "0", rect.x - 6, rect.y + rect.h, {
      color: "#64748b",
      font: "10px monospace",
      align: "right",
    });

    label(
      ctx,
      `Frequency (narrow sweep ±${(halfSpan / 1e12).toFixed(3)} THz around f₀)`,
      rect.x + rect.w / 2,
      ctx.canvas.height - 6,
      { color: "#94a3b8", align: "center" }
    );

    ctx.save();
    ctx.translate(16, rect.y + rect.h / 2);
    ctx.rotate(-Math.PI / 2);
    label(ctx, "Coupling efficiency η(f)", 0, 0, {
      color: "#94a3b8",
      align: "center",
    });
    ctx.restore();
  }, [f0Hz, driveHz, Q]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-50 coffee-mode:bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 uppercase tracking-wider mb-3">
        Sweep: η(f) around f₀
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
