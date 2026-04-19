import { useMemo, useRef, useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import Panel from "../ui/Panel";
import {
  ThrustParams,
  residualVsVoltage,
  residualVsPressure,
  formatForceG,
} from "../../utils/thrustLeakage";

interface Props {
  base: ThrustParams;
}

type Sweep = "voltage" | "pressure";

function drawSweep(
  canvas: HTMLCanvasElement,
  data: { x: number; residual: number; leakage: number }[],
  xLabel: string,
  isDark: boolean
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const pad = { top: 20, right: 20, bottom: 40, left: 70 };
  const pw = w - pad.left - pad.right;
  const ph = h - pad.top - pad.bottom;

  const xs = data.map((d) => d.x);
  const allY = data.flatMap((d) => [d.residual, d.leakage]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(0, ...allY);
  const yMax = Math.max(...allY) * 1.1 || 1;

  const toX = (v: number) => pad.left + ((v - xMin) / (xMax - xMin || 1)) * pw;
  const toY = (v: number) => pad.top + (1 - (v - yMin) / (yMax - yMin || 1)) * ph;

  ctx.strokeStyle = isDark ? "#334155" : "#d1d5db";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, toY(0));
  ctx.lineTo(w - pad.right, toY(0));
  ctx.stroke();

  const drawLine = (vals: number[], color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((d, i) => {
      const px = toX(d.x);
      const py = toY(vals[i]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  };

  drawLine(
    data.map((d) => d.leakage),
    "#22d3ee"
  );
  drawLine(
    data.map((d) => d.residual),
    "#f97316"
  );

  const textColor = isDark ? "#64748b" : "#4b5563";
  const gridColor = isDark ? "#1e293b" : "#d1d5db";
  const tickColor = isDark ? "#475569" : "#6b7280";

  ctx.fillStyle = textColor;
  ctx.font = "11px monospace";
  ctx.textAlign = "center";
  ctx.fillText(xLabel, pad.left + pw / 2, h - 6);

  ctx.save();
  ctx.translate(14, pad.top + ph / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Force (g)", 0, 0);
  ctx.restore();

  const nTicks = 5;
  ctx.textAlign = "right";
  for (let i = 0; i <= nTicks; i++) {
    const v = yMin + ((yMax - yMin) * i) / nTicks;
    const py = toY(v);
    ctx.fillStyle = tickColor;
    ctx.fillText(formatForceG(v), pad.left - 6, py + 4);
    ctx.strokeStyle = gridColor;
    ctx.beginPath();
    ctx.moveTo(pad.left, py);
    ctx.lineTo(w - pad.right, py);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  for (let i = 0; i <= 4; i++) {
    const v = xMin + ((xMax - xMin) * i) / 4;
    ctx.fillStyle = tickColor;
    ctx.fillText(v.toFixed(0), toX(v), h - 24);
  }

  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#22d3ee";
  ctx.fillRect(w - pad.right - 130, 6, 10, 10);
  ctx.fillStyle = isDark ? "#a1f5ff" : "#0891b2";
  ctx.fillText("Leakage", w - pad.right - 80, 15);
  ctx.fillStyle = "#f97316";
  ctx.fillRect(w - pad.right - 50, 6, 10, 10);
  ctx.fillStyle = isDark ? "#fdba74" : "#d97706";
  ctx.fillText("Residual", w - pad.right - 2, 15);
}

function SweepCanvas({
  base,
  sweep,
}: {
  base: ThrustParams;
  sweep: Sweep;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark" || theme === "coffee";

  const data = useMemo(() => {
    if (sweep === "voltage") {
      return residualVsVoltage(base).map((d) => ({
        x: d.voltageV,
        residual: d.residualG,
        leakage: d.totalLeakageG,
      }));
    }
    return residualVsPressure(base).map((d) => ({
      x: d.pressurePa,
      residual: d.residualG,
      leakage: d.totalLeakageG,
    }));
  }, [base.claimedDeltaG, base.driveVoltageV, base.ambientPressurePa, base.electrodeGapM, base.deviceMassKg, base.vibrationAmpNm, base.vibrationFreqHz, base.tempGradientKPerM, base.deviceHeightM, base.plateAreaM2, base.electrostaticFieldVPerM, sweep]);

  const xLabel = sweep === "voltage" ? "Drive voltage (V)" : "Pressure (Pa)";

  useEffect(() => {
    if (ref.current) drawSweep(ref.current, data, xLabel, isDark);
  }, [data, xLabel, isDark]);

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      if (ref.current) drawSweep(ref.current, data, xLabel, isDark);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [data, xLabel, isDark]);

  return (
    <canvas
      ref={ref}
      className="w-full h-64 dark-mode:bg-slate-900 light-mode:bg-white coffee-mode:bg-slate-900 rounded-lg"
    />
  );
}

export default function ThrustSweeps({ base }: Props) {
  const [sweep, setSweep] = useState<Sweep>("voltage");

  return (
    <Panel title="Parametric Sweeps">
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["voltage", "pressure"] as Sweep[]).map((s) => (
            <button
              key={s}
              onClick={() => setSweep(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sweep === s
                  ? "bg-cyan-600 text-white"
                  : "dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:text-slate-400 light-mode:text-slate-700 coffee-mode:text-slate-400 dark-mode:hover:text-slate-200 light-mode:hover:text-slate-900 coffee-mode:hover:text-slate-200"
              }`}
            >
              {s === "voltage" ? "Voltage sweep" : "Pressure sweep"}
            </button>
          ))}
        </div>
        <SweepCanvas base={base} sweep={sweep} />
      </div>
    </Panel>
  );
}
