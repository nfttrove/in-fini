import Panel from "../ui/Panel";
import MetricCard from "../ui/MetricCard";
import {
  casimirForce,
  casimirPressure,
  casimirEnergy,
  formatForce,
  formatScientific,
} from "../../utils/physics";

interface CasimirMetricsProps {
  sepM: number;
  areaM2: number;
}

export default function CasimirMetrics({ sepM, areaM2 }: CasimirMetricsProps) {
  const force = casimirForce(sepM, areaM2);
  const pressure = casimirPressure(sepM);
  const energy = casimirEnergy(sepM, areaM2);

  return (
    <Panel title="Computed Values">
      <div className="space-y-3">
        <MetricCard
          label="Casimir Force"
          value={formatForce(Math.abs(force))}
          sub="attractive (toward each other)"
          color="text-cyan-400"
        />
        <MetricCard
          label="Casimir Pressure"
          value={formatScientific(Math.abs(pressure)) + " Pa"}
          sub="F = −π²ℏc/(240 d⁴) × A"
          color="text-blue-400"
        />
        <MetricCard
          label="Interaction Energy"
          value={formatScientific(Math.abs(energy)) + " J"}
          sub="U = −π²ℏc/(720 d³) × A"
          color="text-teal-400"
        />
      </div>
    </Panel>
  );
}
