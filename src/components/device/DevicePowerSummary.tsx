import Panel from "../ui/Panel";
import MetricCard from "../ui/MetricCard";
import { DevicePrediction, formatPower, formatFreq } from "../../utils/device";

interface Props {
  p: DevicePrediction;
}

export default function DevicePowerSummary({ p }: Props) {
  const order = p.shortfall > 1 ? Math.log10(p.shortfall) : 0;
  const verdict =
    p.shortfall > 1e6
      ? "inconsistent by many orders of magnitude"
      : p.shortfall > 1e3
      ? "inconsistent by 3+ orders of magnitude"
      : p.shortfall > 10
      ? "inconsistent"
      : p.shortfall > 1
      ? "below claim"
      : "above claim";

  const verdictColor =
    p.shortfall > 1e6
      ? "text-red-400"
      : p.shortfall > 10
      ? "text-orange-400"
      : p.shortfall > 1
      ? "text-amber-400"
      : "text-emerald-400";

  return (
    <Panel title="Predicted vs. Claimed Output">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Virtual rotor carrier f₀ = c/2d"
          value={formatFreq(p.f0Hz)}
          color="text-amber-400"
        />
        <MetricCard
          label="Rotor tip speed v"
          value={
            p.v > 1e3
              ? `${(p.v / 1e3).toFixed(3)} km/s`
              : p.v > 1
              ? `${p.v.toFixed(3)} m/s`
              : `${(p.v * 1e3).toFixed(3)} mm/s`
          }
          sub={`v/c = ${p.vOverC.toExponential(2)}`}
        />
        <MetricCard
          label="DCE power (pre-modulation)"
          value={formatPower(p.P_DCE_raw)}
          sub="∝ (ħc³/d⁴)·(v/c)²·A"
        />
        <MetricCard
          label="After sideband (×2J₁²)"
          value={formatPower(p.P_upconverted)}
          sub={`J₁(β)=${p.j1.toExponential(2)}`}
        />
        <MetricCard
          label="Cavity Lorentzian factor"
          value={p.P_lorentz.toExponential(3)}
          sub={`γ = ${formatFreq(p.gammaHz)}`}
        />
        <MetricCard
          label="Predicted output"
          value={formatPower(p.P_output)}
          color="text-cyan-400"
          sub="this model, this design"
        />

        <div className="col-span-2 dark-mode:bg-slate-900/80 light-mode:bg-slate-100/80 coffee-mode:bg-slate-900/80 rounded-lg p-4 border border-teal-800/40">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-xs text-teal-300 uppercase tracking-wider font-semibold">
              Theoretical DCE Limit (ideal)
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-mono font-semibold text-teal-300">
              {formatPower(p.P_DCE_limit)}
            </span>
            <span className="text-xs text-slate-500">
              DCE + first sideband, on-resonance (Lorentzian = 1)
            </span>
          </div>
          {p.P_output > 0 && p.P_DCE_limit > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full dark-mode:bg-slate-700 light-mode:bg-slate-300 coffee-mode:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500/70"
                    style={{
                      width: `${Math.min(100, (p.P_output / p.P_DCE_limit) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 min-w-[80px] text-right">
                  {(p.P_output / p.P_DCE_limit * 100).toExponential(2)}%
                </span>
              </div>
              <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 leading-relaxed">
                {p.P_output < p.P_DCE_limit
                  ? "Model output is below the DCE ceiling. The Lorentzian detuning accounts for the gap."
                  : "Model output exceeds the DCE ceiling -- the excess must invoke a non-DCE mechanism (parametric resonance, vacuum friction, etc.)."}
              </p>
            </div>
          )}
        </div>

        <div className="col-span-2 dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg p-4 border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 uppercase tracking-wider">
              Experimental claim
            </span>
            <span className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500">1.3 W @ 50 nm, 500 kHz</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-2xl font-mono font-semibold text-amber-300">
              {formatPower(p.claimedW)}
            </span>
            <span className="dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500">/</span>
            <span className="text-2xl font-mono font-semibold text-cyan-400">
              {formatPower(p.P_output)}
            </span>
          </div>
          <div className="mt-3 text-sm">
            <span className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">Shortfall: </span>
            <span className={`font-mono font-semibold ${verdictColor}`}>
              {p.shortfall.toExponential(2)}×
              {order > 0 && ` (10^${order.toFixed(1)})`}
            </span>
            <span className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400"> — model is </span>
            <span className={`font-semibold ${verdictColor}`}>{verdict}</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
