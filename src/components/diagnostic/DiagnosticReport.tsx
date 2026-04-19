import { useState } from "react";
import { FileText, Copy, Check, X } from "lucide-react";
import Panel from "../ui/Panel";
import { LeakageBudget, LeakageParams, formatPower } from "../../utils/leakage";

interface Props {
  budget: LeakageBudget;
  params: LeakageParams;
}

function buildReport(budget: LeakageBudget, params: LeakageParams): string {
  const lines: string[] = [];
  const pct =
    budget.claimedW !== 0
      ? ((budget.residualW / Math.abs(budget.claimedW)) * 100).toFixed(1)
      : "N/A";

  lines.push("DIAGNOSTIC REPORT");
  lines.push("=".repeat(40));
  lines.push("");

  lines.push(`Claimed output:       ${formatPower(budget.claimedW)}`);
  lines.push(`Total mundane leakage: ${formatPower(budget.totalLeakageW)}`);
  lines.push(
    `Residual (unexplained): ${formatPower(budget.residualW)} (${pct}% of claim)`
  );
  lines.push("");

  lines.push("LEAKAGE BREAKDOWN");
  lines.push("-".repeat(40));
  for (const ch of budget.channels) {
    const padded = ch.label.padEnd(36, " ");
    lines.push(`  ${padded} ${formatPower(ch.valueW)}`);
  }
  lines.push("");

  lines.push(`VERDICT: ${budget.verdict.label.toUpperCase()}`);
  lines.push("-".repeat(40));
  lines.push(budget.verdict.description);
  lines.push("");

  lines.push(">>> HYPOTHETICAL INTERPRETATION");
  lines.push("-".repeat(40));
  if (
    budget.verdict.key === "excess" ||
    budget.verdict.key === "gross-excess"
  ) {
    lines.push(
      "If the measured value is correct and all leakage channels are " +
        "accounted for, the residual represents power that cannot be " +
        "attributed to known mundane effects -- suggesting either an " +
        "unknown systematic error or a genuine anomalous source."
    );
  } else if (budget.verdict.key === "explained") {
    lines.push(
      "The claimed output is fully explained by the sum of mundane " +
        "leakage channels. No anomalous source is required, and the " +
        "measurement is consistent with known physics."
    );
  } else if (budget.verdict.key === "partial") {
    lines.push(
      "The residual is within the uncertainty of the leakage estimate. " +
        "The data does not clearly indicate an anomaly nor rule it out " +
        "-- further refinement of the measurement is needed."
    );
  } else {
    lines.push(
      "The diagnostic cannot determine a clear verdict. Please verify " +
        "all input parameters and re-run."
    );
  }
  lines.push("");

  lines.push("KEY PARAMETERS");
  lines.push("-".repeat(40));
  lines.push(`  Drive voltage:    ${params.vDriveV} V`);
  lines.push(`  Drive impedance:  ${params.rDriveOhm} Ohm`);
  lines.push(`  Shield attenuation: ${params.shieldDb} dB`);
  lines.push(`  Bias current:     ${params.iBiasA} A`);
  lines.push(`  T_hot / T_cold:   ${params.tHotK} K / ${params.tColdK} K`);
  lines.push(`  Radiating area:   ${params.aRadM2} m^2`);
  lines.push(`  Mech Q:           ${params.mechQ}`);
  lines.push("");

  if (
    budget.verdict.key === "excess" ||
    budget.verdict.key === "gross-excess"
  ) {
    lines.push("SUGGESTED NEXT STEPS");
    lines.push("-".repeat(40));
    lines.push(
      "1. Increase shielding attenuation and re-measure to rule out RF pickup."
    );
    lines.push(
      "2. Run a control experiment with the drive off but all other conditions identical."
    );
    lines.push(
      "3. Swap the sensor for an independent instrument to check for measurement artifacts."
    );
    lines.push(
      "4. Log the output over time -- a genuine signal should be repeatable and stable."
    );
  } else if (budget.verdict.key === "explained") {
    lines.push("CONCLUSION");
    lines.push("-".repeat(40));
    lines.push(
      "The claimed output is quantitatively accounted for by mundane leakage."
    );
    lines.push("No new physics is required to explain these readings.");
  } else if (budget.verdict.key === "partial") {
    lines.push("SUGGESTED NEXT STEPS");
    lines.push("-".repeat(40));
    lines.push(
      "1. Tighten shielding and thermal isolation to reduce leakage channels."
    );
    lines.push(
      "2. Re-run with improved parameters to see if the residual disappears."
    );
  }

  lines.push("");
  lines.push(`Report generated: ${new Date().toISOString()}`);

  return lines.join("\n");
}

export default function DiagnosticReport({ budget, params }: Props) {
  const [report, setReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setReport(buildReport(budget, params));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const handleClose = () => {
    setReport(null);
    setCopied(false);
  };

  return (
    <Panel title="Report">
      <div className="space-y-4">
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors w-full justify-center"
        >
          <FileText className="w-4 h-4" />
          Generate Report (Cliff Notes)
        </button>

        {report && (
          <div className="relative">
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:hover:bg-slate-600 light-mode:hover:bg-slate-300 coffee-mode:hover:bg-slate-600 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:hover:bg-slate-600 light-mode:hover:bg-slate-300 coffee-mode:hover:bg-slate-600 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <pre className="dark-mode:bg-slate-900 light-mode:bg-slate-50 coffee-mode:bg-slate-900 border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700 rounded-lg p-4 pr-20 text-xs font-mono dark-mode:text-slate-300 light-mode:text-slate-900 coffee-mode:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {report}
            </pre>
            {copied && (
              <div className="text-xs text-emerald-400 mt-1.5">
                Copied to clipboard
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
