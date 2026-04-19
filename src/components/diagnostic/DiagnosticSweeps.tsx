import { useEffect, useRef } from "react";
import Panel from "../ui/Panel";
import {
  LeakageParams,
  residualVsShield,
  residualVsTemperature,
} from "../../utils/leakage";

interface Props {
  base: LeakageParams;
}

function drawResidualSweep(
  canvas: HTMLCanvasElement,
  data: { x: number; residualW: number; totalLeakageW: number }[],
  xLabel: string,
  xFormat: (x: number) => string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const padL = 54;
  const padR = 12;
  const padT = 14;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const yVals = data
    .flatMap((d) => [Math.abs(d.residualW), Math.abs(d.totalLeakageW)])
    .filter((v) => v > 0);
  const yMin = yVals.length ? Math.min(...yVals) : 1e-18;
  const yMax = yVals.length ? Math.max(...yVals) : 1;
  const logMin = Math.floor(Math.log10(Math.max(yMin, 1e-24)));
  const logMax = Math.ceil(Math.log10(Math.max(yMax, 1e-12)));

  const xMin = data[0].x;
  const xMax = data[data.length - 1].x;

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#64748b";
  ctx.font = "10px ui-monospace,monospace";

  for (let l = logMin; l <= logMax; l++) {
    const y = padT + plotH - ((l - logMin) / (logMax - logMin)) * plotH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.fillText(`10^${l}`, 4, y + 3);
  }

  for (let i = 0; i <= 5; i++) {
    const x = padL + (plotW * i) / 5;
    const v = xMin + ((xMax - xMin) * i) / 5;
    ctx.fillStyle = "#64748b";
    ctx.fillText(xFormat(v), x - 14, H - 8);
  }

  const toY = (w: number) => {
    const a = Math.max(Math.abs(w), Math.pow(10, logMin));
    return padT + plotH - ((Math.log10(a) - logMin) / (logMax - logMin)) * plotH;
  };
  const toX = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin || 1)) * plotW;

  ctx.strokeStyle = "#22d3ee";
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = toX(d.x);
    const y = toY(d.totalLeakageW);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.strokeStyle = "#fb923c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = toX(d.x);
    const y = toY(d.residualW);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px ui-sans-serif,system-ui";
  ctx.fillText(xLabel, padL + plotW / 2 - 40, H - 2);

  ctx.fillStyle = "#22d3ee";
  ctx.fillText("leakage", padL + 8, padT + 12);
  ctx.fillStyle = "#fb923c";
  ctx.fillText("|residual|", padL + 70, padT + 12);
}

export default function DiagnosticSweeps({ base }: Props) {
  const shieldRef = useRef<HTMLCanvasElement>(null);
  const tempRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (shieldRef.current) {
      const data = residualVsShield(base).map((d) => ({
        x: d.shieldDb,
        residualW: d.residualW,
        totalLeakageW: d.totalLeakageW,
      }));
      drawResidualSweep(shieldRef.current, data, "Shielding (dB)", (v) =>
        `${v.toFixed(0)}`
      );
    }
    if (tempRef.current) {
      const data = residualVsTemperature(base).map((d) => ({
        x: d.tHotK,
        residualW: d.residualW,
        totalLeakageW: d.totalLeakageW,
      }));
      drawResidualSweep(tempRef.current, data, "Hot-side T (K)", (v) =>
        `${v.toFixed(0)}`
      );
    }
  }, [base]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Panel title="Residual vs. Shielding">
        <canvas
          ref={shieldRef}
          className="w-full h-56 dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg"
        />
        <p className="mt-3 text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 leading-relaxed">
          As shielding improves, RF pickup collapses and the residual
          approaches (claim − thermal − mechanical). If the residual stays
          flat, the claimed signal is not an RF artifact.
        </p>
      </Panel>
      <Panel title="Residual vs. Hot-side Temperature">
        <canvas
          ref={tempRef}
          className="w-full h-56 dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg"
        />
        <p className="mt-3 text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 leading-relaxed">
          Sweeping T_h exposes blackbody leakage. A residual that drops to
          zero as T_h → T_c indicates the "signal" was actually thermal.
        </p>
      </Panel>
    </div>
  );
}
