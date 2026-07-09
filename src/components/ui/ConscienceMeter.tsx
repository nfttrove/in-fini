import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

/**
 * IN FINI — CONSCIENCE METER ("Halve dt")
 * ---------------------------------------
 * The definitive test for numerical artifacts.
 *
 * Real physics doesn't care about your timestep.
 * If a "discovery" changes when you halve dt, it was never real.
 *
 * Usage:
 *   <ConscienceMeter
 *     dt={currentTimestep}
 *     onHalve={() => setDt(d => d / 2)}
 *     onDouble={() => setDt(d => d * 2)}
 *     discovery={hasDiscovery}
 *   />
 */

interface ConscienceMeterProps {
  dt: number;
  onHalve: () => void;
  onDouble?: () => void;
  baselineValue?: number;
  currentValue?: number;
  label?: string;
  className?: string;
}

export default function ConscienceMeter({
  dt,
  onHalve,
  onDouble,
  baselineValue,
  currentValue,
  label = "signal",
  className = "",
}: ConscienceMeterProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Calculate deviation if baseline and current values provided
  const hasDeviation =
    baselineValue !== undefined &&
    currentValue !== undefined &&
    baselineValue !== 0 &&
    isFinite(baselineValue) &&
    isFinite(currentValue);

  const deviation = hasDeviation
    ? Math.abs((currentValue! - baselineValue!) / baselineValue!) * 100
    : 0;

  // If deviation exceeds 1%, this is likely a numerical artifact
  const isArtifact = hasDeviation && deviation > 1;

  // Format timestep for display
  const formatDt = (seconds: number) => {
    if (seconds >= 1) return `${seconds.toFixed(2)} s`;
    if (seconds >= 1e-3) return `${(seconds * 1e3).toFixed(2)} ms`;
    if (seconds >= 1e-6) return `${(seconds * 1e6).toFixed(2)} µs`;
    if (seconds >= 1e-9) return `${(seconds * 1e9).toFixed(2)} ns`;
    return `${(seconds * 1e12).toFixed(2)} ps`;
  };

  return (
    <div
      className={`dark-mode:bg-slate-800/80 light-mode:bg-slate-100 coffee-mode:bg-amber-900/40
        rounded-lg border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-amber-700
        p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-amber-200">
              Conscience Meter
            </h4>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-slate-500 hover:text-slate-400 transition-colors"
              aria-label="Toggle explanation"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {showInfo && (
            <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-400 mb-3 leading-relaxed">
              Real physics doesn&apos;t care about your timestep. If a &quot;discovery&quot; changes
              when you halve dt, it was never real—it was discretisation error.
              This is the simulator&apos;s equivalent of a shuffled-drift null: one cheap
              control that mirages cannot survive.
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-500">
                dt =
              </label>
              <span className="font-mono text-sm dark-mode:text-cyan-400 light-mode:text-cyan-600 coffee-mode:text-amber-300">
                {formatDt(dt)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onHalve}
                className="px-3 py-1.5 rounded text-xs font-semibold
                  dark-mode:bg-cyan-600/20 dark-mode:text-cyan-400 dark-mode:border-cyan-500/50
                  light-mode:bg-cyan-100 light-mode:text-cyan-700 light-mode:border-cyan-300
                  coffee-mode:bg-amber-600/30 coffee-mode:text-amber-300 coffee-mode:border-amber-500/50
                  border hover:scale-105 transition-transform"
                title="Halve the timestep — if the signal changes, it's fake"
              >
                Halve dt
              </button>

              {onDouble && (
                <button
                  onClick={onDouble}
                  className="px-3 py-1.5 rounded text-xs font-semibold
                    dark-mode:bg-slate-700/50 dark-mode:text-slate-400 dark-mode:border-slate-600
                    light-mode:bg-slate-200 light-mode:text-slate-600 light-mode:border-slate-300
                    coffee-mode:bg-amber-800/50 coffee-mode:text-amber-400 coffee-mode:border-amber-600
                    border hover:scale-105 transition-transform"
                  title="Double the timestep (coarser, faster)"
                >
                  Double dt
                </button>
              )}
            </div>
          </div>

          {/* Deviation indicator */}
          {hasDeviation && (
            <div
              className={`mt-3 flex items-center gap-2 px-3 py-2 rounded
                ${
                  isArtifact
                    ? "dark-mode:bg-red-900/30 dark-mode:border-red-500/50 light-mode:bg-red-100 light-mode:border-red-300 coffee-mode:bg-red-900/40 coffee-mode:border-red-600/50"
                    : "dark-mode:bg-emerald-900/30 dark-mode:border-emerald-500/50 light-mode:bg-emerald-100 light-mode:border-emerald-300 coffee-mode:bg-emerald-900/40 coffee-mode:border-emerald-600/50"
                }
                border`}
            >
              {isArtifact ? (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-xs dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-200">
                {label}:{" "}
                <span className="font-mono font-semibold">
                  {currentValue!.toExponential(3)}
                </span>
                {isArtifact ? (
                  <span className="ml-2 text-red-400">
                    ({deviation.toFixed(1)}% deviation — likely numerical
                    artifact)
                  </span>
                ) : (
                  <span className="ml-2 dark-mode:text-emerald-400 light-mode:text-emerald-600 coffee-mode:text-amber-400">
                    (stable across dt change)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
