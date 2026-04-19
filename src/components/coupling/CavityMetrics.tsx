import Panel from "../ui/Panel";
import MetricCard from "../ui/MetricCard";

interface CavityMetricsProps {
  resonantFreqKHz: number;
  drivingFreqKHz: number;
  detuning: number;
  coupling: number;
  modeNumber: number;
}

export default function CavityMetrics({
  resonantFreqKHz,
  drivingFreqKHz,
  detuning,
  coupling,
  modeNumber,
}: CavityMetricsProps) {
  return (
    <Panel title="Coupling Diagnostics">
      <div className="space-y-3">
        <MetricCard
          label="Resonant Frequency (f₀)"
          value={`${resonantFreqKHz.toFixed(1)} kHz`}
          sub={`f₀ = nc/(2L), n=${modeNumber}`}
          color="text-cyan-400"
        />
        <MetricCard
          label="Driving Frequency (f_drive)"
          value={`${drivingFreqKHz} kHz`}
          sub="User-controlled"
          color="text-amber-400"
        />
        <MetricCard
          label="Detuning"
          value={`${detuning > 0 ? "+" : ""}${detuning.toFixed(2)} %`}
          sub="(f_drive − f₀) / f₀"
          color={Math.abs(detuning) < 5 ? "text-green-400" : "text-red-400"}
        />
        <MetricCard
          label="Normalized Coupling"
          value={`${(coupling * 100).toFixed(2)} %`}
          sub="Lorentzian response at f_drive"
          color="text-blue-400"
        />
      </div>
    </Panel>
  );
}
