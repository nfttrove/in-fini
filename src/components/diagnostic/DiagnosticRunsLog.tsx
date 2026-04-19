import { useEffect, useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import Panel from "../ui/Panel";
import {
  DiagnosticRun,
  listDiagnosticRuns,
  saveDiagnosticRun,
} from "../../lib/supabase";
import { LeakageBudget, formatPower, TONE_CLASSES } from "../../utils/leakage";

interface Props {
  params: Record<string, number>;
  budget: LeakageBudget;
}

export default function DiagnosticRunsLog({ params, budget }: Props) {
  const [runs, setRuns] = useState<DiagnosticRun[]>([]);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setBusy(true);
      setError(null);
      const list = await listDiagnosticRuns();
      setRuns(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSave() {
    try {
      setBusy(true);
      setError(null);
      await saveDiagnosticRun(label.trim() || "(untitled run)", params, {
        totalLeakageW: budget.totalLeakageW,
        residualW: budget.residualW,
        verdictKey: budget.verdict.key,
        verdictLabel: budget.verdict.label,
      });
      setLabel("");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Diagnostic Runs Log">
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label this run..."
            maxLength={120}
            className="flex-1 dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100 dark-mode:placeholder-slate-600 light-mode:placeholder-slate-500 coffee-mode:placeholder-slate-600 rounded-lg px-3 py-2 text-sm border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={busy}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            Log run
          </button>
          <button
            onClick={refresh}
            disabled={busy}
            className="dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 dark-mode:hover:text-slate-300 light-mode:hover:text-slate-700 coffee-mode:hover:text-slate-300 transition-colors px-2"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-900/20 rounded px-3 py-2">
            {error}
          </div>
        )}

        {runs.length === 0 ? (
          <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 italic">
            No runs logged yet. Save the current diagnostic to start a log.
          </p>
        ) : (
          <ul className="space-y-1.5 max-h-56 overflow-y-auto">
            {runs.map((r) => {
              const toneKey = (r.results.verdictKey || "") as string;
              const tone =
                toneKey === "excess" || toneKey === "gross-excess"
                  ? TONE_CLASSES.orange
                  : toneKey === "partial"
                  ? TONE_CLASSES.amber
                  : toneKey === "explained"
                  ? TONE_CLASSES.emerald
                  : TONE_CLASSES.sky;
              return (
                <li
                  key={r.id}
                  className="dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg px-3 py-2 text-sm flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200 truncate">{r.label}</div>
                    <div className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 font-mono">
                      residual {formatPower(r.results.residualW)} • leak{" "}
                      {formatPower(r.results.totalLeakageW)}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium ${tone.text} whitespace-nowrap`}
                  >
                    {r.results.verdictLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Panel>
  );
}
