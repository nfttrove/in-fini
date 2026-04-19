import Panel from "../ui/Panel";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { DevicePrediction, formatFreq } from "../../utils/device";

interface Props {
  p: DevicePrediction;
  Q: number;
  beta: number;
}

type Status = "pass" | "warn" | "fail";

interface Check {
  key: string;
  label: string;
  detail: string;
  status: Status;
}

export default function DeviceSanity({ p, Q, beta }: Props) {
  const checks: Check[] = [];

  checks.push({
    key: "vc",
    label: "Non-relativistic rotor  (v ≪ c)",
    detail: `v/c = ${p.vOverC.toExponential(2)} → ${
      p.vOverC < 1e-6 ? "deeply non-relativistic (DCE rate is tiny)" : "still < c"
    }`,
    status: p.vOverC < 1e-3 ? "pass" : p.vOverC < 0.1 ? "warn" : "fail",
  });

  checks.push({
    key: "beta",
    label: "Moderate non-linearity  (β ≤ 1)",
    detail: `β = ${beta.toFixed(3)}, 2J₁² = ${(2 * p.j1 * p.j1).toFixed(4)} (fraction of drive into ±1)`,
    status: beta < 0.8 ? "pass" : beta <= 1 ? "warn" : "fail",
  });

  const Q_phys_limit = 1e6;
  checks.push({
    key: "Q",
    label: "Physically achievable Q  (plasmonic ≲ 10⁴, dielectric ≲ 10⁶)",
    detail: `Q = ${Q.toLocaleString()}  ·  γ = f₀/Q = ${formatFreq(p.gammaHz)}`,
    status: Q <= 1e4 ? "pass" : Q <= Q_phys_limit ? "warn" : "fail",
  });

  checks.push({
    key: "side",
    label: "Sideband fits inside cavity linewidth",
    detail: `fₘ vs γ/2 — first sideband ${
      p.gammaHz / 2 > 500e3 ? "comfortably inside" : "outside"
    } linewidth`,
    status: p.gammaHz / 2 > 500e3 ? "pass" : "warn",
  });

  checks.push({
    key: "energy",
    label: "Energy conservation  (no over-unity)",
    detail: `predicted ${p.P_output.toExponential(2)} W  vs  claimed 1.3 W  →  shortfall ${p.shortfall.toExponential(
      2
    )}×`,
    status: p.shortfall < 10 ? "pass" : "fail",
  });

  const Icon = (s: Status) =>
    s === "pass" ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
    ) : s === "warn" ? (
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
    ) : (
      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
    );

  return (
    <Panel title="Sanity Checks">
      <ul className="space-y-2.5">
        {checks.map((c) => (
          <li
            key={c.key}
            className="flex gap-3 dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg px-3 py-2.5"
          >
            {Icon(c.status)}
            <div className="flex-1 min-w-0">
              <div className="text-sm dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200 font-medium">
                {c.label}
              </div>
              <div className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 mt-0.5 font-mono truncate">
                {c.detail}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
