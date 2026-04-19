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

export default function DeviceSweepBeta({ base }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = { l: 64, r: 20, t: 26, b: 52 };
    const rect = plotRect(ctx, pad);
    clearCanvas(ctx);
    drawGrid(ctx, rect, 4, 5);

    const N = 200;
    const vals: number[] = [];
    for (let i = 0; i <= N; i++) {
      const b = (i / N) * 1;
      const pred = predictDevice({ ...base, beta: b });
      vals.push(Math.max(pred.P_output, 1e-80));
    }
    const logYMax = Math.log10(Math.max(...vals));
    const logYMin = logYMax - 10;

    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const px = rect.x + (i / N) * rect.w;
      const t = (Math.log10(vals[i]) - logYMin) / (logYMax - logYMin);
      pts.push({ x: px, y: rect.y + rect.h - Math.max(0, t) * rect.h });
    }
    drawPolyline(ctx, pts, "#14b8a6", 2.5);

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
        "claim 1.3 W is above plot range for all β ≤ 1",
        rect.x + rect.w / 2,
        rect.y + 14,
        { color: "#f59e0b", align: "center" }
      );
    }

    const currentPx = rect.x + base.beta * rect.w;
    drawVLine(ctx, rect, currentPx, "#e2e8f0", true, 1.5);
    label(ctx, `β = ${base.beta.toFixed(2)}`, currentPx, rect.y - 6, {
      color: "#e2e8f0",
      align: "center",
    });

    ["0", "0.2", "0.4", "0.6", "0.8", "1.0"].forEach((s, i) => {
      const px = rect.x + (i / 5) * rect.w;
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
      "Modulation depth β",
      rect.x + rect.w / 2,
      ctx.canvas.height - 8,
      { color: "#94a3b8", align: "center" }
    );
  }, [base]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-200 coffee-mode:bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-900 coffee-mode:text-slate-300 uppercase tracking-wider mb-3">
        Output power vs. modulation depth β
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
