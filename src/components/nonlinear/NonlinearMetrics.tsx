import Panel from "../ui/Panel";
import MetricCard from "../ui/MetricCard";

interface NonlinearMetricsProps {
  j0: number;
  j1: number;
  carrierPower: number;
  n1Power: number;
  overlapN1: number;
  totalComb: number;
  ordersWithinLinewidth: number;
}

export default function NonlinearMetrics({
  j0,
  j1,
  carrierPower,
  n1Power,
  overlapN1,
  totalComb,
  ordersWithinLinewidth,
}: NonlinearMetricsProps) {
  return (
    <Panel title="Sideband Metrics">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="|J₀(β)|  carrier"
          value={j0.toFixed(4)}
          sub="amplitude at f₀"
        />
        <MetricCard
          label="|J₁(β)|  n=1"
          value={j1.toFixed(4)}
          color="text-cyan-400"
          sub="amplitude at f₀ ± fₘ"
        />
        <MetricCard
          label="Carrier power"
          value={`${(carrierPower * 100).toFixed(2)} %`}
          sub="J₀² (fraction of drive)"
        />
        <MetricCard
          label="1st-order power"
          value={`${(n1Power * 100).toFixed(2)} %`}
          color="text-cyan-400"
          sub="2·J₁² (both sidebands)"
        />
        <MetricCard
          label="η: n=1 into cavity"
          value={`${(overlapN1 * 100).toFixed(3)} %`}
          color="text-blue-400"
          sub="J₁² · Lorentz(f₀+fₘ)"
        />
        <MetricCard
          label="Comb sum ΣJₙ²"
          value={totalComb.toFixed(4)}
          sub={`${ordersWithinLinewidth} order(s) inside γ`}
        />
      </div>
    </Panel>
  );
}
