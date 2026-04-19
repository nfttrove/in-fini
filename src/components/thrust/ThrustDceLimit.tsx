import { ThrustBudget, formatForceG } from "../../utils/thrustLeakage";

interface Props {
  dceThrustLimit_mg: number;
  budget: ThrustBudget;
}

export default function ThrustDceLimit({ dceThrustLimit_mg, budget }: Props) {
  const canExplain = dceThrustLimit_mg > Math.abs(budget.claimedG) * 1000;

  return (
    <div className="bg-teal-900/20 border border-teal-700/40 p-4 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-teal-400">Theoretical DCE Thrust Limit</span>
        <span className="text-xs text-teal-600 uppercase tracking-wide">Maximum possible</span>
      </div>
      <div className="text-xl font-mono font-semibold text-teal-300">
        {formatForceG(dceThrustLimit_mg / 1000)}
      </div>
      <div className="text-xs text-teal-300/80 leading-relaxed">
        Maximum force from ideal dynamical Casimir effect + sidebands, given cavity parameters.
      </div>
      {dceThrustLimit_mg > 0 && (
        <div className="pt-2 border-t border-teal-700/30">
          <div className="text-xs text-teal-400 font-semibold mb-1">vs. Claim</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={canExplain ? "h-full bg-teal-500" : "h-full bg-red-500"}
                style={{
                  width: `${Math.min(100, (Math.abs(budget.claimedG) * 1000 / Math.max(dceThrustLimit_mg, 1e-30)) * 100)}%`,
                }}
              />
            </div>
            <div className="text-xs text-slate-400 whitespace-nowrap">
              {dceThrustLimit_mg > 0 ? (Math.abs(budget.claimedG) * 1000 / dceThrustLimit_mg * 100).toFixed(1) : "∞"}%
            </div>
          </div>
          {!canExplain && (
            <div className="text-xs text-red-400 mt-1.5 font-semibold">
              DCE cannot explain the claim by orders of magnitude.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
