import { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/theme-context";
import { CircuitQEDParams, predictCqed } from "../../utils/circuitQED";

/**
 * Pair production rate vs pump frequency across the 2·f₀ resonance,
 * with the thermal noise floor for comparison — the spectrum you would
 * actually scan in the lab.
 */
export default function CqedSweep({ base }: { base: CircuitQEDParams }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark" || theme === "coffee";

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const bg = isDark ? "#0f172a" : "#f8fafc";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const pad = { l: 52, r: 12, t: 14, b: 28 };
    const rect = { x: pad.l, y: pad.t, w: W - pad.l - pad.r, h: H - pad.t - pad.b };

    const f0 = base.f0GHz;
    // Scan ±10% around the 2f0 resonance.
    const fmMin = 2 * f0 * 0.9;
    const fmMax = 2 * f0 * 1.1;
    const N = 320;
    const rates: number[] = [];
    let thermal = 0;
    for (let i = 0; i < N; i++) {
      const fm = fmMin + ((fmMax - fmMin) * i) / (N - 1);
      const p = predictCqed({ ...base, fmGHz: fm });
      rates.push(p.pairRateHz);
      thermal = Math.max(thermal, p.thermalFluxHz);
    }
    const peak = Math.max(...rates, thermal, 1e-30);

    // log y scale (rates span decades across the resonance)
    const logMin = Math.log10(peak * 1e-4);
    const logMax = Math.log10(peak * 1.6);
    const yOf = (v: number) => {
      const lv = Math.log10(Math.max(v, 1e-300));
      const t = (lv - logMin) / (logMax - logMin);
      return rect.y + rect.h - Math.min(Math.max(t, 0), 1) * rect.h;
    };
    const xOf = (fm: number) => rect.x + ((fm - fmMin) / (fmMax - fmMin)) * rect.w;

    // grid
    ctx.strokeStyle = isDark ? "#1e3a5f" : "#dbe3ee";
    for (let i = 0; i <= 4; i++) {
      const y = rect.y + (rect.h * i) / 4;
      ctx.beginPath();
      ctx.moveTo(rect.x, y);
      ctx.lineTo(rect.x + rect.w, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const x = rect.x + (rect.w * i) / 4;
      ctx.beginPath();
      ctx.moveTo(x, rect.y);
      ctx.lineTo(x, rect.y + rect.h);
      ctx.stroke();
    }

    // resonance line at 2f0
    ctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(xOf(2 * f0), rect.y);
    ctx.lineTo(xOf(2 * f0), rect.y + rect.h);
    ctx.stroke();
    ctx.setLineDash([]);

    // thermal floor
    ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rect.x, yOf(thermal));
    ctx.lineTo(rect.x + rect.w, yOf(thermal));
    ctx.stroke();

    // pair-rate curve
    ctx.strokeStyle = isDark ? "#22d3ee" : "#0891b2";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    rates.forEach((r, i) => {
      const fm = fmMin + ((fmMax - fmMin) * i) / (N - 1);
      const x = xOf(fm);
      const y = yOf(r);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // labels
    ctx.fillStyle = "#64748b";
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillText(`2·f₀ = ${(2 * f0).toFixed(1)} GHz`, xOf(2 * f0) + 4, rect.y + 10);
    ctx.fillText(`thermal ${thermal.toExponential(1)}/s`, rect.x + 6, yOf(thermal) - 4);
    for (let i = 0; i <= 4; i++) {
      const fm = fmMin + ((fmMax - fmMin) * i) / 4;
      ctx.fillText(fm.toFixed(1), rect.x + (rect.w * i) / 4 - 10, H - 8);
    }
    ctx.fillText("pump fₘ (GHz)", rect.x + rect.w - 84, H - 8);
    ctx.fillText("pairs/s (log)", 8, rect.y + 8);
  }, [base, isDark]);

  return (
    <canvas
      ref={ref}
      width={640}
      height={220}
      className="w-full rounded-lg border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700"
    />
  );
}
