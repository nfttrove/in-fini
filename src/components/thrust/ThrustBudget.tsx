import Panel from "../ui/Panel";
import { ThrustBudget as ThrustBudgetType, formatForceG } from "../../utils/thrustLeakage";

interface Props {
  budget: ThrustBudgetType;
}

const CHANNEL_COLORS: Record<string, string> = {
  ionWind: "bg-cyan-500",
  vibration: "bg-amber-500",
  electrostatic: "bg-rose-500",
  convection: "bg-emerald-500",
  buoyancy: "bg-sky-500",
};

export default function ThrustBudgetPanel({ budget }: Props) {
  const denom = Math.max(
    budget.totalLeakageG,
    Math.abs(budget.claimedG),
    1e-30
  );

  return (
    <Panel title="Force Artifact Budget">
      <div className="space-y-4">
        <div className="dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 uppercase tracking-wider">
              Total artifact force
            </span>
            <span className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500">
              {((budget.totalLeakageG / denom) * 100).toFixed(1)}% of envelope
            </span>
          </div>
          <div className="text-2xl font-mono font-semibold text-cyan-400">
            {formatForceG(budget.totalLeakageG)}
          </div>
        </div>

        <div className="h-6 w-full dark-mode:bg-slate-900 light-mode:bg-slate-200 coffee-mode:bg-slate-900 rounded-md overflow-hidden flex">
          {budget.channels.map((c) => {
            const w = denom > 0 ? (c.valueG / denom) * 100 : 0;
            if (w < 0.05) return null;
            return (
              <div
                key={c.key}
                className={`${CHANNEL_COLORS[c.key] || "bg-slate-500"} h-full`}
                style={{ width: `${Math.min(100, w)}%` }}
                title={`${c.label}: ${formatForceG(c.valueG)}`}
              />
            );
          })}
        </div>

        <ul className="space-y-2">
          {budget.channels.map((c) => {
            const frac = denom > 0 ? (c.valueG / denom) * 100 : 0;
            return (
              <li
                key={c.key}
                className="flex items-center gap-3 dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg px-3 py-2"
              >
                <span
                  className={`${CHANNEL_COLORS[c.key] || "bg-slate-500"} w-2 h-8 rounded-sm flex-shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200 truncate">
                    {c.label}
                  </div>
                  <div className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 font-mono">
                    {c.formula}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-cyan-400">
                    {formatForceG(c.valueG)}
                  </div>
                  <div className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500">
                    {frac < 0.01 ? "<0.01" : frac.toFixed(2)}%
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}
