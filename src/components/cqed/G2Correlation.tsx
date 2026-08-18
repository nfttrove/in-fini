import { useMemo, useState } from "react";
import Slider from "../ui/Slider";
import MetricCard from "../ui/MetricCard";
import { g2Correlations } from "../../utils/correlation";

/**
 * Correlation spectroscopy section of the circuit-QED panel: the
 * Cauchy–Schwarz test that separates vacuum photon pairs from a hot
 * resistor. Physics in utils/correlation.ts (unit-tested).
 */
export default function G2Correlation({
  defaultPairNumber,
  defaultThermal,
}: {
  defaultPairNumber: number;
  defaultThermal: number;
}) {
  const [logPair, setLogPair] = useState(Math.log10(Math.max(defaultPairNumber, 1e-4)));
  const [logThermal, setLogThermal] = useState(
    Math.log10(Math.max(defaultThermal, 1e-6))
  );

  const n_p = Math.pow(10, logPair);
  const n_th = Math.pow(10, logThermal);
  const r = useMemo(() => g2Correlations(n_p, n_th), [n_p, n_th]);

  // Bar position: csRatio on a log scale from 0.1 to 10; the classical
  // bound sits at 1.
  const barFrac = Math.min(
    Math.max((Math.log10(r.csRatio) + 1) / 2, 0),
    1
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-5">
          <Slider
            label="Pairs per mode nₚ (from the pump: (λ/κ)²)"
            value={logPair}
            displayValue={n_p.toExponential(2)}
            min={-4}
            max={2}
            step={0.05}
            onChange={setLogPair}
            minLabel="10⁻⁴"
            maxLabel="10²"
          />
          <Slider
            label="Thermal photons per mode n_th"
            value={logThermal}
            displayValue={n_th.toExponential(2)}
            min={-9}
            max={2}
            step={0.1}
            onChange={setLogThermal}
            minLabel="10⁻⁹ (deep cryo)"
            maxLabel="10² (warm)"
          />
          <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600 leading-relaxed">
            In the main panel's default setup λ²/κ gives nₚ ≈{" "}
            {(defaultPairNumber).toExponential(1)} and the 20 mK mode carries
            n_th ≈ {defaultThermal.toExponential(1)} — start from reality,
            then break it.
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="g₁₂(0)" value={r.g12.toFixed(3)} sub="cross-mode" />
            <MetricCard label="g₁₁(0)" value={r.g11.toFixed(2)} sub="auto-correlation" />
            <MetricCard
              label="C-S ratio"
              value={r.csRatio.toFixed(3)}
              sub="g₁₂² / g₁₁·g₂₂"
              color={
                r.violation
                  ? "dark-mode:text-emerald-400 light-mode:text-emerald-600 coffee-mode:text-emerald-400"
                  : "dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-600"
              }
            />
          </div>
          <div>
            <div className="text-[10px] dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-700 mb-1">
              classical bound at 1.0 — right of it: nonclassical pairs
            </div>
            <div className="h-4 rounded-full dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 relative overflow-hidden">
              <div
                className={`h-full ${r.violation ? "bg-emerald-500" : "bg-slate-500"}`}
                style={{ width: `${barFrac * 100}%` }}
              />
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-amber-400" />
            </div>
            <div className="flex justify-between text-[10px] font-mono dark-mode:text-slate-600 light-mode:text-slate-500 coffee-mode:text-amber-700 mt-0.5">
              <span>0.1</span>
              <span>1</span>
              <span>10</span>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`rounded-xl border p-4 ${
          r.violation
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-amber-500/40 bg-amber-500/10 text-amber-300"
        }`}
      >
        <div className="font-semibold text-sm">{r.label}</div>
        <p className="text-xs mt-1 leading-relaxed opacity-90">{r.description}</p>
      </div>
    </div>
  );
}
