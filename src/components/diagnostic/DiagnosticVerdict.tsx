import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import Panel from "../ui/Panel";
import { LeakageBudget, TONE_CLASSES, formatPower } from "../../utils/leakage";

interface Props {
  budget: LeakageBudget;
}

export default function DiagnosticVerdict({ budget }: Props) {
  const tone = TONE_CLASSES[budget.verdict.tone];
  const Icon =
    budget.verdict.key === "explained"
      ? CheckCircle2
      : budget.verdict.key === "consistent"
      ? Sparkles
      : budget.verdict.key === "partial"
      ? ShieldAlert
      : AlertTriangle;

  const pct = Math.max(
    -100,
    Math.min(
      100,
      budget.claimedW !== 0 ? (budget.residualW / Math.abs(budget.claimedW)) * 100 : 0
    )
  );

  return (
    <Panel title="Diagnostic Verdict">
      <div className="space-y-4">
        <div
          className={`rounded-lg p-4 border ${tone.bg} ${tone.border} space-y-2`}
        >
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${tone.text}`} />
            <h3 className={`text-lg font-semibold ${tone.text}`}>
              {budget.verdict.label}
            </h3>
          </div>
          <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-900 coffee-mode:text-slate-300 leading-relaxed">
            {budget.verdict.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg p-3">
            <div className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 mb-1">Claimed</div>
            <div className="font-mono text-base font-semibold text-amber-300">
              {formatPower(budget.claimedW)}
            </div>
          </div>
          <div className="dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg p-3">
            <div className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 mb-1">Summed leakage</div>
            <div className="font-mono text-base font-semibold text-cyan-400">
              {formatPower(budget.totalLeakageW)}
            </div>
          </div>
          <div className="dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg p-3 col-span-2 border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 uppercase tracking-wider">
                Residual (Claim − Leakage)
              </span>
              <span className={`text-xs font-mono ${tone.text}`}>
                {budget.claimedW !== 0
                  ? `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`
                  : "—"}
              </span>
            </div>
            <div className={`font-mono text-2xl font-semibold ${tone.text}`}>
              {formatPower(budget.residualW)}
            </div>
            <div className="mt-2 h-2 rounded dark-mode:bg-slate-800 light-mode:bg-slate-300 coffee-mode:bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${
                  pct >= 0 ? "bg-orange-500" : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(100, Math.abs(pct))}%`,
                  marginLeft: pct < 0 ? `${100 - Math.abs(pct)}%` : "0",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
