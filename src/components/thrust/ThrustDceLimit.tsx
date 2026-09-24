import { ThrustBudget, formatForceG } from "../../utils/thrustLeakage";
import type { Grams } from "../../utils/units";

// Claim ÷ ceiling routinely runs to 10³⁰ %; print that as an exponent.
function formatPercent(x: number): string {
  return x >= 1e4 ? x.toExponential(1) : x.toFixed(1);
}

function formatRatio(x: number): string {
  return x >= 100 ? x.toExponential(1) : x.toFixed(1);
}

interface Props {
  /** dceThrustLimitG's output: grams-equivalent, like every thrust channel. */
  dceThrustLimitG: Grams;
  budget: ThrustBudget;
}

export default function ThrustDceLimit({ dceThrustLimitG, budget }: Props) {
  const claimG = Math.abs(budget.claimedG);
  const canExplain = dceThrustLimitG > claimG;

  return (
    <div className="bg-teal-900/20 border border-teal-700/40 p-4 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-teal-400">Theoretical DCE Thrust Limit</span>
        <span className="text-xs text-teal-600 uppercase tracking-wide">Generous ceiling</span>
      </div>
      <div className="text-xl font-mono font-semibold text-teal-300">
        {formatForceG(dceThrustLimitG)}
      </div>
      <div className="text-xs text-teal-300/80 leading-relaxed">
        Order-of-magnitude ceiling from the ideal dynamical Casimir effect + sidebands at these cavity parameters; its prefactor may be off by one or two orders.
      </div>
      {dceThrustLimitG > 0 && (
        <div className="pt-2 border-t border-teal-700/30">
          <div className="text-xs text-teal-400 font-semibold mb-1">vs. Claim</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={canExplain ? "h-full bg-teal-500" : "h-full bg-red-500"}
                style={{
                  width: `${Math.min(100, (claimG / dceThrustLimitG) * 100)}%`,
                }}
              />
            </div>
            <div className="text-xs text-slate-400 whitespace-nowrap">
              {formatPercent((claimG / dceThrustLimitG) * 100)}%
            </div>
          </div>
          {!canExplain && (
            <div className="text-xs text-red-400 mt-1.5 font-semibold">
              The claim is {formatRatio(claimG / dceThrustLimitG)}× this ceiling
              {claimG / dceThrustLimitG > 100
                ? " — more than its prefactor could be off."
                : " — within the ceiling's own uncertainty, so this alone does not rule the DCE out."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
