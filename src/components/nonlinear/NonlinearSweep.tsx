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

interface SweepProps {
  f0Hz: number;
  fmHz: number;
  beta: number;
  Q: number;
}

export default function NonlinearSweep({ f0Hz, fmHz, beta, Q }: SweepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = { l: 60, r: 22, t: 24, b: 54 };
    const rect = plotRect(ctx, pad);

    clearCanvas(ctx);
    drawGrid(ctx, rect, 4, 6);

    const logMin = Math.log10(1e3);
    const logMax = Math.log10(1e7);
    const span = logMax - logMin;

    const gamma = f0Hz / Q;
    const j1_sq = Math.pow(besselJ(1, beta), 2);

    const N = 400;
    const pts: { x: number; y: number }[] = [];
    let ymax = 1e-30;
    const raw: number[] = [];
    for (let i = 0; i <= N; i++) {
      const l = logMin + (span * i) / N;
      const fm = Math.pow(10, l);
      const detune = fm;
      const lor = 1 / (1 + Math.pow((2 * detune) / gamma, 2));
      const eff = j1_sq * lor;
      raw.push(eff);
      if (eff > ymax) ymax = eff;
    }
    const logYMax = Math.log10(Math.max(ymax, 1e-30));
    const logYMin = logYMax - 8;

    for (let i = 0; i <= N; i++) {
      const l = logMin + (span * i) / N;
      const px = rect.x + (i / N) * rect.w;
      const e = Math.max(raw[i], Math.pow(10, logYMin));
      const ly = Math.log10(e);
      const t = (ly - logYMin) / (logYMax - logYMin);
      pts.push({ x: px, y: rect.y + rect.h - t * rect.h });
      void l;
    }

    drawPolyline(ctx, pts, "#3b82f6", 2.5);

    const currentLog = Math.log10(fmHz);
    if (currentLog >= logMin && currentLog <= logMax) {
      const px = rect.x + ((currentLog - logMin) / span) * rect.w;
      drawVLine(ctx, rect, px, "#f59e0b", true, 2);
      label(
        ctx,
        `fₘ = ${
          fmHz >= 1e6
            ? `${(fmHz / 1e6).toFixed(2)} MHz`
            : `${(fmHz / 1e3).toFixed(1)} kHz`
        }`,
        px,
        rect.y + 12,
        { color: "#f59e0b", align: "center" }
      );
    }

    const gammaLog = Math.log10(gamma);
    if (gammaLog >= logMin && gammaLog <= logMax) {
      const px = rect.x + ((gammaLog - logMin) / span) * rect.w;
      drawVLine(ctx, rect, px, "#22d3ee", true, 1.5);
      label(ctx, "γ = f₀/Q", px, rect.y - 8, {
        color: "#22d3ee",
        align: "center",
      });
    } else if (gammaLog < logMin) {
      label(ctx, `γ < 1 kHz (cavity narrower than sweep)`, rect.x + 8, rect.y - 8, {
        color: "#22d3ee",
      });
    } else {
      label(
        ctx,
        `γ > 10 MHz (cavity wider than sweep)`,
        rect.x + rect.w - 8,
        rect.y - 8,
        { color: "#22d3ee", align: "right" }
      );
    }

    ["1k", "10k", "100k", "1M", "10M"].forEach((s, i) => {
      const px = rect.x + (i / 4) * rect.w;
      label(ctx, s, px, rect.y + rect.h + 14, {
        color: "#64748b",
        align: "center",
        font: "10px monospace",
      });
    });

    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      const ly = logYMin + t * (logYMax - logYMin);
      label(
        ctx,
        `10^${ly.toFixed(0)}`,
        rect.x - 6,
        rect.y + rect.h - t * rect.h + 4,
        { color: "#64748b", align: "right", font: "10px monospace" }
      );
    }

    label(
      ctx,
      "Modulation frequency fₘ (log, 1 kHz – 10 MHz)",
      rect.x + rect.w / 2,
      ctx.canvas.height - 8,
      { color: "#94a3b8", align: "center" }
    );

    ctx.save();
    ctx.translate(14, rect.y + rect.h / 2);
    ctx.rotate(-Math.PI / 2);
    label(ctx, "η  (n=1 coupling into cavity, log scale)", 0, 0, {
      color: "#94a3b8",
      align: "center",
    });
    ctx.restore();
  }, [f0Hz, fmHz, beta, Q]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-50 coffee-mode:bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 uppercase tracking-wider mb-3">
        Sweep fₘ: is there an optimal modulation frequency?
      </h3>
      <canvas
        ref={canvasRef}
        width={780}
        height={240}
        className="w-full rounded-lg"
        style={{ maxHeight: 240 }}
      />
    </div>
  );
}
