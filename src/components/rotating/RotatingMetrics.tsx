import Panel from "../ui/Panel";
import MetricCard from "../ui/MetricCard";

interface RotatingMetricsProps {
  omega: number;
  k: number;
  simTimeUs: number;
}

/** A wavelength in the unit a person would say: mm, m or km. */
function formatWavelength(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  if (m >= 1) return `${m.toFixed(1)} m`;
  return `${(m * 1000).toFixed(2)} mm`;
}

export default function RotatingMetrics({ omega, k, simTimeUs }: RotatingMetricsProps) {
  const wavelengthM = (2 * Math.PI) / k;

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
          value={`${k.toPrecision(4)} m⁻¹`}
          color="text-cyan-400"
        />
        <MetricCard
          label="Wavelength (λ = 2π/k)"
          value={formatWavelength(wavelengthM)}
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
