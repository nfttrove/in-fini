import Panel from "../ui/Panel";
import MetricCard from "../ui/MetricCard";
import { newtons } from "../../utils/units";
import {
  casimirForce,
  casimirPressure,
  casimirEnergy,
  formatForce,
  formatScientific,
} from "../../utils/physics";

/** Below this gap the ideal-conductor formula is an upper bound, not a prediction. */
const IDEAL_MIRROR_MIN_M = 100e-9;

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
          value={formatForce(newtons(Math.abs(force)))}
          sub={
            sepM < IDEAL_MIRROR_MIN_M
              ? "attractive · ideal-mirror bound: real metals give much less below ~100 nm"
              : "attractive (toward each other)"
          }
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
