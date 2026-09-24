import { useState } from "react";
import { Beaker, ChevronDown, ChevronUp } from "lucide-react";
import { computeThrustBudget } from "../../utils/thrustLeakage";
import type { PresetItem } from "../../data/presetItems";

export default function PresetCard({
  item,
  onLoad,
  stability,
  initiallyExpanded = false,
}: {
  item: PresetItem;
  onLoad: () => void;
  stability?: { dominantShare: number; tally: Record<string, number> };
  initiallyExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <div className="dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg overflow-hidden border dark-mode:border-slate-700/50 light-mode:border-slate-300/50 coffee-mode:border-slate-700/50 dark-mode:hover:border-slate-600/70 light-mode:hover:border-slate-400/70 coffee-mode:hover:border-slate-600/70 transition-colors">
      <button
        onClick={onLoad}
        className="w-full text-left px-3.5 py-3 group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
              {item.name}
            </div>
            <div className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 mt-0.5">
              {item.verdict}
              {stability && stability.dominantShare < 0.95 && (
                <span
                  className="ml-1.5 text-amber-400"
                  title={`Verdict flips under ±20% parameter jitter: ${Object.entries(
                    stability.tally
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => `${k} ${(100 * v / 120).toFixed(0)}%`)
                    .join(" / ")}`}
                >
                  ⚠ boundary-sensitive
                </span>
              )}
            </div>
          </div>
          <Beaker className="w-4 h-4 dark-mode:text-slate-600 light-mode:text-slate-400 coffee-mode:text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0 mt-0.5" />
        </div>
      </button>

      <div className="px-3.5 pb-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 dark-mode:hover:text-slate-300 light-mode:hover:text-slate-700 coffee-mode:hover:text-slate-300 transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          {expanded ? "Hide" : "Details"}
        </button>

        {expanded && (
          <>
            <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 italic mt-2 leading-relaxed pb-1">
              "{item.tagline}"
            </p>
            {item.source && (
              <p className="text-[11px] dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-700 mt-1 leading-relaxed">
                <span className="font-semibold">Source:</span> {item.source}
              </p>
            )}
            <p className="text-[10px] dark-mode:text-slate-500 light-mode:text-slate-500 coffee-mode:text-amber-700 mt-1 font-mono">
              distance to legitimacy:{" "}
              {(() => {
                const b = computeThrustBudget(item.params);
                const d = b.sigmaG > 0 ? b.residualG / b.sigmaG : Infinity;
                return isFinite(d)
                  ? `${d.toFixed(1)}σ of artifact uncertainty`
                  : "claim exceeds the budget outright";
              })()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
