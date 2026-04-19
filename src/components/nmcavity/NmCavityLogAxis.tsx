import { useEffect, useRef } from "react";
import {
  clearCanvas,
  drawGrid,
  drawVLine,
  plotRect,
  label,
} from "../../utils/canvas";

interface LogAxisProps {
  f0Hz: number;
  driveHz: number;
}

const RF_DRIVE_HZ = 500e3;

export default function NmCavityLogAxis({ f0Hz, driveHz }: LogAxisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = { l: 50, r: 20, t: 30, b: 46 };
    const rect = plotRect(ctx, pad);

    clearCanvas(ctx);
    drawGrid(ctx, rect, 2, 18);

    const logMin = 3;
    const logMax = 18;
    const span = logMax - logMin;

    const toX = (hz: number) => {
      const l = Math.log10(hz);
      const t = (l - logMin) / span;
      return rect.x + t * rect.w;
    };

    for (let e = logMin; e <= logMax; e++) {
      const px = toX(Math.pow(10, e));
      label(ctx, `10^${e}`, px, rect.y + rect.h + 14, {
        color: "#475569",
        align: "center",
        font: "9px monospace",
      });
    }

    const bands: { lo: number; hi: number; color: string; name: string }[] = [
      { lo: 3e3, hi: 3e8, color: "#334155", name: "RF / μwave" },
      { lo: 3e8, hi: 3e11, color: "#1e3a5f", name: "mm / sub-mm" },
      { lo: 3e11, hi: 4e14, color: "#3b1f4a", name: "IR" },
      { lo: 4e14, hi: 7.5e14, color: "#4a2f1f", name: "visible" },
      { lo: 7.5e14, hi: 3e16, color: "#3a1f4a", name: "UV" },
      { lo: 3e16, hi: 3e19, color: "#4a1f1f", name: "X-ray" },
    ];
    bands.forEach((b) => {
      const x1 = toX(b.lo);
      const x2 = toX(b.hi);
      ctx.fillStyle = b.color;
      ctx.fillRect(x1, rect.y, Math.max(1, x2 - x1), rect.h);
    });

    drawGrid(ctx, rect, 0, 15);

    const rfPx = toX(RF_DRIVE_HZ);
    drawVLine(ctx, rect, rfPx, "#f43f5e", true, 2);
    label(ctx, "500 kHz drive", rfPx, rect.y - 16, {
      color: "#f43f5e",
      align: "center",
    });
    label(ctx, "RF", rfPx, rect.y - 4, {
      color: "#f43f5e",
      align: "center",
      font: "9px monospace",
    });

    const f0Px = toX(f0Hz);
    drawVLine(ctx, rect, f0Px, "#22d3ee", false, 2);
    label(
      ctx,
      `f₀ (${(f0Hz / 1e12).toFixed(1)} THz)`,
      f0Px,
      rect.y - 16,
      { color: "#22d3ee", align: "center" }
    );

    const drivePx = toX(driveHz);
    drawVLine(ctx, rect, drivePx, "#f59e0b", true, 2);
    label(
      ctx,
      `drive (${(driveHz / 1e12).toFixed(1)} THz)`,
      drivePx,
      rect.y - 4,
      { color: "#f59e0b", align: "center", font: "10px sans-serif" }
    );

    label(
      ctx,
      "log₁₀ frequency (Hz)  —  full spectrum view",
      rect.x + rect.w / 2,
      ctx.canvas.height - 8,
      { color: "#94a3b8", align: "center" }
    );
  }, [f0Hz, driveHz]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-50 coffee-mode:bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 uppercase tracking-wider mb-3">
        Where does 500 kHz sit vs. the nm-cavity resonance?
      </h3>
      <canvas
        ref={canvasRef}
        width={780}
        height={160}
        className="w-full rounded-lg"
        style={{ maxHeight: 160 }}
      />
    </div>
  );
}
