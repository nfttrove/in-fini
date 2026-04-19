import Panel from "../ui/Panel";
import MetricCard from "../ui/MetricCard";

interface RotatingMetricsProps {
  omega: number;
  k: number;
  simTimeUs: number;
}

export default function RotatingMetrics({ omega, k, simTimeUs }: RotatingMetricsProps) {
  const wavelengthMm = ((2 * Math.PI) / k) * 1000;

  return (
    <Panel title="Field Properties">
      <div className="space-y-3">
        <MetricCard
          label="Angular Frequency (ω)"
          value={`${(omega / 1e6).toFixed(2)} × 10⁶ rad/s`}
          color="text-blue-400"
        />
        <MetricCard
          label="Wavenumber (k = ω/c)"
          value={`${(k * 1e-3).toFixed(4)} × 10³ m⁻¹`}
          color="text-cyan-400"
        />
        <MetricCard
          label="Wavelength (λ = 2π/k)"
          value={`${wavelengthMm.toFixed(2)} mm`}
          color="text-teal-400"
        />
        <MetricCard
          label="Sim Time"
          value={`${simTimeUs} μs`}
          color="text-amber-400"
        />
      </div>
    </Panel>
  );
}
