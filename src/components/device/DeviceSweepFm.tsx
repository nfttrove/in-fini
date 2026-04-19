import { useEffect, useRef } from "react";
import {
  clearCanvas,
  drawGrid,
  drawPolyline,
  drawVLine,
  plotRect,
  label,
} from "../../utils/canvas";
import { predictDevice, DeviceParams } from "../../utils/device";

interface Props {
  base: DeviceParams;
}

export default function DeviceSweepFm({ base }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = { l: 64, r: 20, t: 26, b: 52 };
    const rect = plotRect(ctx, pad);
    clearCanvas(ctx);
    drawGrid(ctx, rect, 4, 6);

    const logMin = 3;
    const logMax = 7;
    const span = logMax - logMin;
    const N = 320;

    const pts: { x: number; y: number }[] = [];
    const vals: number[] = [];
    for (let i = 0; i <= N; i++) {
      const fm = Math.pow(10, logMin + (i / N) * span);
      const pred = predictDevice({ ...base, fmHz: fm });
      vals.push(Math.max(pred.P_output, 1e-60));
    }
    const logYMax = Math.log10(Math.max(...vals));
    const logYMin = logYMax - 12;
    for (let i = 0; i <= N; i++) {
      const px = rect.x + (i / N) * rect.w;
      const t = (Math.log10(vals[i]) - logYMin) / (logYMax - logYMin);
      pts.push({ x: px, y: rect.y + rect.h - Math.max(0, t) * rect.h });
    }
    drawPolyline(ctx, pts, "#22d3ee", 2.5);

    const claimLog = Math.log10(1.3);
    if (claimLog >= logYMin && claimLog <= logYMax) {
      const t = (claimLog - logYMin) / (logYMax - logYMin);
      const y = rect.y + rect.h - t * rect.h;
      ctx.strokeStyle = "#f59e0b";
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rect.x, y);
      ctx.lineTo(rect.x + rect.w, y);
      ctx.stroke();
      ctx.setLineDash([]);
      label(ctx, "claim: 1.3 W", rect.x + 8, y - 4, { color: "#f59e0b" });
    } else {
      label(
        ctx,
        "claim 1.3 W is far above plot range",
        rect.x + rect.w / 2,
        rect.y + 14,
        { color: "#f59e0b", align: "center" }
      );
    }

    const currentLog = Math.log10(base.fmHz);
    if (currentLog >= logMin && currentLog <= logMax) {
      const px = rect.x + ((currentLog - logMin) / span) * rect.w;
      drawVLine(ctx, rect, px, "#e2e8f0", true, 1.5);
      label(ctx, `fₘ`, px, rect.y - 6, {
        color: "#e2e8f0",
        align: "center",
      });
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
        `10^${ly.toFixed(0)} W`,
        rect.x - 6,
        rect.y + rect.h - t * rect.h + 4,
        { color: "#64748b", align: "right", font: "10px monospace" }
      );
    }
    label(
      ctx,
      "Drive frequency fₘ (log)",
      rect.x + rect.w / 2,
      ctx.canvas.height - 8,
      { color: "#94a3b8", align: "center" }
    );
  }, [base]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-200 coffee-mode:bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-900 coffee-mode:text-slate-300 uppercase tracking-wider mb-3">
        Output power vs. drive frequency
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
