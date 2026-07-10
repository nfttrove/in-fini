import { useState } from "react";
import { FileText, Copy, Check, X } from "lucide-react";
import Panel from "../ui/Panel";
import { ThrustBudget, ThrustParams, formatForceG, dceThrustLimitG } from "../../utils/thrustLeakage";

interface Props {
  budget: ThrustBudget;
  params: ThrustParams;
}

function buildReport(budget: ThrustBudget, params: ThrustParams): string {
  const lines: string[] = [];
  const pct =
    budget.claimedG !== 0
      ? ((budget.residualG / Math.abs(budget.claimedG)) * 100).toFixed(1)
      : "N/A";

  lines.push("THRUST & WEIGHT DIAGNOSTIC REPORT");
  lines.push("=".repeat(40));
  lines.push("");

  lines.push(`Claimed weight change:  ${formatForceG(budget.claimedG)}`);
  lines.push(`Total artifact forces:  ${formatForceG(budget.totalLeakageG)}`);
  lines.push(
    `Residual (unexplained): ${formatForceG(budget.residualG)} (${pct}% of claim)`
  );
  lines.push("");

  lines.push("FORCE ARTIFACT BREAKDOWN");
  lines.push("-".repeat(40));
  for (const ch of budget.channels) {
    const padded = ch.label.padEnd(36, " ");
    lines.push(`  ${padded} ${formatForceG(ch.valueG)}`);
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
      "If the measured weight change is correct and all artifact forces are " +
        "accounted for, the residual represents a force that cannot be " +
        "attributed to known mundane effects -- suggesting either an " +
        "unknown systematic error or a genuine anomalous thrust source."
    );
  } else if (budget.verdict.key === "explained") {
    lines.push(
      "The claimed weight change is fully explained by the sum of mundane " +
        "artifact forces. No anomalous thrust is required, and the " +
        "measurement is consistent with known physics."
    );
  } else if (budget.verdict.key === "partial") {
    lines.push(
      "The residual is within the uncertainty of the artifact estimate. " +
        "The data does not clearly indicate anomalous thrust nor rule it " +
        "out -- further refinement of the measurement is needed."
    );
  } else {
    lines.push(
      "The diagnostic cannot determine a clear verdict. Please verify " +
        "all input parameters and re-run."
    );
  }
  lines.push("");

  const dceThrustLimit_mg = dceThrustLimitG(params);

  lines.push("KEY PARAMETERS");
  lines.push("-".repeat(40));
  lines.push(`  Drive voltage:       ${params.driveVoltageV} V`);
  lines.push(`  Electrode gap:       ${(params.electrodeGapM * 1000).toFixed(1)} mm`);
  lines.push(`  Ambient pressure:    ${params.ambientPressurePa.toExponential(2)} Pa`);
  lines.push(`  Device mass:         ${(params.deviceMassKg * 1000).toFixed(1)} g`);
  lines.push(`  Vibration amplitude: ${params.vibrationAmpNm} nm`);
  lines.push(`  Vibration frequency: ${params.vibrationFreqHz} Hz`);
  lines.push(`  Temp gradient:       ${params.tempGradientKPerM} K/m`);
  lines.push(`  Device height:       ${(params.deviceHeightM * 100).toFixed(1)} cm`);
  lines.push(`  Plate area:          ${(params.plateAreaM2 * 1e4).toFixed(2)} cm^2`);
  lines.push(`  E-field:             ${params.electrostaticFieldVPerM} V/m`);
  lines.push("");

  lines.push("GOVERNING EQUATION");
  lines.push("-".repeat(40));
  lines.push(`  F_DCE = (ħc/d⁴) · (v/c)² · A · 2J₁²(β) · ℒ(f_m; Q)`);
  lines.push(`  Where: ħ = reduced Planck constant`);
  lines.push(`         c = speed of light`);
  lines.push(`         d = cavity gap`);
  lines.push(`         v = 2πf_m·r = tangential velocity`);
  lines.push(`         A = active area`);
  lines.push(`         J₁(β) = first Bessel function of modulation depth`);
  lines.push(`         ℒ = Lorentzian cavity response`);
  lines.push("");

  lines.push("THEORETICAL DCE LIMIT");
  lines.push("-".repeat(40));
  lines.push(`  Cavity gap:          ${params.cavityGap_nm} nm`);
  lines.push(`  Rotor radius:        ${params.rotorRadius_um.toFixed(3)} µm`);
  lines.push(`  Modulation depth β:  ${params.modulationDepth_beta.toFixed(2)}`);
  lines.push(`  Cavity Q:            ${params.cavityQ.toExponential(2)}`);
  lines.push(`  Active area:         ${params.activeArea_cm2.toFixed(2)} cm²`);
  lines.push(`  Drive frequency:     ${(params.driveFrequency_Hz / 1e3).toFixed(0)} kHz`);
  lines.push(`  Maximum DCE thrust:  ${formatForceG(dceThrustLimit_mg / 1000)}`);
  lines.push("");

  if (
    budget.verdict.key === "excess" ||
    budget.verdict.key === "gross-excess"
  ) {
    lines.push("SUGGESTED NEXT STEPS");
    lines.push("-".repeat(40));
    lines.push(
      "1. Run the experiment in hard vacuum to eliminate ion wind and convection."
    );
    lines.push(
      "2. Place the device on a torsion balance to separate real thrust from vibration."
    );
    lines.push(
      "3. Enclose the device in a Faraday cage to rule out electrostatic image forces."
    );
    lines.push(
      "4. Repeat with the drive off but all other conditions identical (null test)."
    );
  } else if (budget.verdict.key === "explained") {
    lines.push("CONCLUSION");
    lines.push("-".repeat(40));
    lines.push(
      "The claimed weight change is quantitatively accounted for by mundane artifact forces."
    );
    lines.push("No anomalous thrust or weight reduction is required to explain these readings.");
  } else if (budget.verdict.key === "partial") {
    lines.push("SUGGESTED NEXT STEPS");
    lines.push("-".repeat(40));
    lines.push(
      "1. Reduce ambient pressure to suppress ion wind and thermal convection."
    );
    lines.push(
      "2. Improve vibration isolation and re-measure to see if the residual disappears."
    );
  }

  lines.push("");
  lines.push(`Report generated: ${new Date().toISOString()}`);

  return lines.join("\n");
}

export default function ThrustReport({ budget, params }: Props) {
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
