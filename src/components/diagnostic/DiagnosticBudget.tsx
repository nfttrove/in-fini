import Panel from "../ui/Panel";
import { LeakageBudget, formatPower } from "../../utils/leakage";

interface Props {
  budget: LeakageBudget;
}

const CHANNEL_COLORS: Record<string, string> = {
  joule: "bg-amber-500",
  rf: "bg-cyan-500",
  blackbody: "bg-rose-500",
  mechanical: "bg-emerald-500",
  tribo: "bg-slate-500",
};

export default function DiagnosticBudget({ budget }: Props) {
  const denom = Math.max(
    budget.totalLeakageW,
    Math.abs(budget.claimedW),
    1e-30
  );

  return (
    <Panel title="Leakage Budget">
      <div className="space-y-4">
        <div className="dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 uppercase tracking-wider">
              Total leakage
            </span>
            <span className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500">
              {((budget.totalLeakageW / denom) * 100).toFixed(1)}% of envelope
            </span>
          </div>
          <div className="text-2xl font-mono font-semibold text-cyan-400">
            {formatPower(budget.totalLeakageW)}
          </div>
        </div>

        <div className="h-6 w-full dark-mode:bg-slate-900 light-mode:bg-slate-200 coffee-mode:bg-slate-900 rounded-md overflow-hidden flex">
          {budget.channels.map((c) => {
            const w = denom > 0 ? (c.valueW / denom) * 100 : 0;
            if (w < 0.05) return null;
            return (
              <div
                key={c.key}
                className={`${CHANNEL_COLORS[c.key]} h-full`}
                style={{ width: `${Math.min(100, w)}%` }}
                title={`${c.label}: ${formatPower(c.valueW)}`}
              />
            );
          })}
        </div>

        <ul className="space-y-2">
          {budget.channels.map((c) => {
            const frac = denom > 0 ? (c.valueW / denom) * 100 : 0;
            return (
              <li
                key={c.key}
                className="flex items-center gap-3 dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg px-3 py-2"
              >
                <span
                  className={`${CHANNEL_COLORS[c.key]} w-2 h-8 rounded-sm flex-shrink-0`}
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
                    {formatPower(c.valueW)}
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
