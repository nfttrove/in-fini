import Panel from "../ui/Panel";
import MetricCard from "../ui/MetricCard";

interface NmCavityMetricsProps {
  f0THz: number;
  lambda0Nm: number;
  driveTHz: number;
  detuningPct: number;
  coupling: number;
  ratio500kHz: number;
  bandLabel: string;
}

function fmtRatio(r: number): string {
  if (r === 0) return "0";
  const exp = Math.floor(Math.log10(r));
  const mant = r / Math.pow(10, exp);
  return `${mant.toFixed(2)} × 10^${exp}`;
}

export default function NmCavityMetrics({
  f0THz,
  lambda0Nm,
  driveTHz,
  detuningPct,
  coupling,
  ratio500kHz,
  bandLabel,
}: NmCavityMetricsProps) {
  const detColor =
    Math.abs(detuningPct) < 1
      ? "text-emerald-400"
      : Math.abs(detuningPct) < 10
      ? "text-amber-400"
      : "text-rose-400";

  return (
    <Panel title="Resonance Metrics">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Fundamental f₀"
          value={
            f0THz >= 1000
              ? `${(f0THz / 1000).toFixed(2)} PHz`
              : `${f0THz.toFixed(1)} THz`
          }
          sub={bandLabel}
        />
        <MetricCard
          label="Resonant λ₀"
          value={
            lambda0Nm < 1
              ? `${(lambda0Nm * 1000).toFixed(1)} pm`
              : `${lambda0Nm.toFixed(1)} nm`
          }
          sub="λ₀ = c / f₀"
        />
        <MetricCard
          label="Drive frequency"
          value={`${driveTHz.toFixed(1)} THz`}
          sub={`= ${(driveTHz * 1e12).toExponential(2)} Hz`}
        />
        <MetricCard
          label="Detuning"
          value={`${detuningPct.toFixed(2)} %`}
          color={detColor}
          sub="(f − f₀) / f₀"
        />
        <MetricCard
          label="Coupling η"
          value={`${(coupling * 100).toFixed(3)} %`}
          color="text-blue-400"
          sub="Lorentzian amplitude"
        />
        <MetricCard
          label="500 kHz / f₀"
          value={fmtRatio(ratio500kHz)}
          color="text-rose-400"
          sub="ratio of RF drive to cavity resonance"
        />
      </div>
    </Panel>
  );
}
