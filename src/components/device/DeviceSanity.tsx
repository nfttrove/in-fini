import Panel from "../ui/Panel";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import {
  DevicePrediction,
  IDEAL_MIRROR_MIN_NM,
  RIM_SPEED_LIMIT_M_S,
  SILICON_DENSITY_KG_M3,
  formatFreq,
} from "../../utils/device";

const C = 299_792_458;

interface Props {
  p: DevicePrediction;
  Q: number;
  beta: number;
  fmHz: number;
}

type Status = "pass" | "warn" | "fail";

interface Check {
  key: string;
  label: string;
  detail: string;
  status: Status;
}

export default function DeviceSanity({ p, Q, beta, fmHz }: Props) {
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
    label: "Achievable Q  (≲ 10⁴ generous for a nm-gap metal cavity; 10⁶ is dielectric-resonator territory)",
    detail: `Q = ${Q.toLocaleString()}  ·  γ = f₀/Q = ${formatFreq(p.gammaHz)}`,
    status: Q <= 1e4 ? "pass" : Q <= Q_phys_limit ? "warn" : "fail",
  });

  checks.push({
    key: "side",
    label: "Sideband fits inside cavity linewidth",
    detail: `fₘ = ${formatFreq(fmHz)} vs γ/2 = ${formatFreq(p.gammaHz / 2)} — first sideband ${
      p.gammaHz / 2 > fmHz ? "inside" : "outside"
    } the linewidth`,
    status: p.gammaHz / 2 > fmHz ? "pass" : "warn",
  });

  checks.push({
    key: "energy",
    label: "Model vs claim  (predicted ÷ 1.3 W)",
    detail: `predicted ${p.P_output.toExponential(2)} W  vs  claimed 1.3 W  →  shortfall ${p.shortfall.toExponential(
      2
    )}×`,
    status: p.shortfall < 10 ? "pass" : "fail",
  });

  // Hoop stress ρv² sets the burst speed, whatever the rotor's size.
  const hoopGPa = (SILICON_DENSITY_KG_M3 * p.v * p.v) / 1e9;
  checks.push({
    key: "material",
    label: `Rotor survives its own spin  (rim speed; bursts near ${RIM_SPEED_LIMIT_M_S.toFixed(0)} m/s)`,
    detail: `v = ${p.v < 10 ? p.v.toFixed(2) : p.v.toFixed(0)} m/s  ·  hoop stress ρv² ≈ ${hoopGPa.toExponential(1)} GPa in silicon  ·  ${
      p.v > RIM_SPEED_LIMIT_M_S
        ? "past even generously strong silicon — it bursts"
        : p.v > RIM_SPEED_LIMIT_M_S / 2
          ? "near silicon's strength"
          : "within material limits"
    }`,
    status:
      p.v > RIM_SPEED_LIMIT_M_S ? "fail" : p.v > RIM_SPEED_LIMIT_M_S / 2 ? "warn" : "pass",
  });

  const dNm = (C / (2 * p.f0Hz)) * 1e9;
  checks.push({
    key: "gap",
    label: `Ideal-mirror regime  (d⁻⁴ holds for d ≳ ${IDEAL_MIRROR_MIN_NM} nm)`,
    detail: `d = ${dNm.toFixed(0)} nm  ·  ${
      dNm < IDEAL_MIRROR_MIN_NM
        ? "real metals give much less than the ideal-mirror ceiling here"
        : "ideal-mirror scaling is a fair ceiling"
    }`,
    status: dNm < 10 ? "fail" : dNm < IDEAL_MIRROR_MIN_NM ? "warn" : "pass",
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
