export interface LeakageParams {
  pClaimW: number;
  vDriveV: number;
  rDriveOhm: number;
  shieldDb: number;
  iBiasA: number;
  rResOhm: number;
  tHotK: number;
  tColdK: number;
  aRadM2: number;
  emissivity: number;
  rotorMassKg: number;
  rotorAmpNm: number;
  fmHz: number;
  mechQ: number;
}

export interface LeakageChannel {
  key: "joule" | "rf" | "blackbody" | "mechanical" | "tribo";
  label: string;
  valueW: number;
  formula: string;
}

export interface LeakageBudget {
  channels: LeakageChannel[];
  totalLeakageW: number;
  claimedW: number;
  residualW: number;
  residualFrac: number;
  verdict: Verdict;
}

export type VerdictKey =
  | "consistent"
  | "explained"
  | "partial"
  | "excess"
  | "gross-excess";

export interface Verdict {
  key: VerdictKey;
  label: string;
  description: string;
  tone: "emerald" | "amber" | "orange" | "red" | "sky";
}

const SIGMA_SB = 5.670374419e-8;

export function jouleW(iBiasA: number, rResOhm: number): number {
  return Math.max(0, iBiasA * iBiasA * rResOhm);
}

export function rfLeakageW(
  vDriveV: number,
  rDriveOhm: number,
  shieldDb: number
): number {
  if (rDriveOhm <= 0) return 0;
  const pDrive = 0.5 * (vDriveV * vDriveV) / rDriveOhm;
  return pDrive * Math.pow(10, -shieldDb / 10);
}

export function blackbodyW(
  emissivity: number,
  aRadM2: number,
  tHotK: number,
  tColdK: number
): number {
  const dT4 = Math.pow(tHotK, 4) - Math.pow(tColdK, 4);
  return Math.max(0, emissivity * SIGMA_SB * aRadM2 * dT4);
}

export function mechanicalW(
  rotorMassKg: number,
  rotorAmpNm: number,
  fmHz: number,
  mechQ: number
): number {
  if (mechQ <= 0) return 0;
  const x = rotorAmpNm * 1e-9;
  const omega = 2 * Math.PI * fmHz;
  // Stored energy of a harmonic oscillator E = ½m(ωx)²; the drive power
  // needed to sustain it is P = ωE/Q (Q ≡ ω·E/P_dissipated).
  const storedE = 0.5 * rotorMassKg * Math.pow(omega * x, 2);
  return (storedE * omega) / mechQ;
}

export function triboBaselineW(): number {
  return 1e-12;
}

export function computeBudget(p: LeakageParams): LeakageBudget {
  const channels: LeakageChannel[] = [
    {
      key: "joule",
      label: "Ohmic / Joule heating",
      valueW: jouleW(p.iBiasA, p.rResOhm),
      formula: "I² · R",
    },
    {
      key: "rf",
      label: "RF pickup through shielding",
      valueW: rfLeakageW(p.vDriveV, p.rDriveOhm, p.shieldDb),
      formula: "½ V²/R · 10^(−S/10)",
    },
    {
      key: "blackbody",
      label: "Blackbody differential",
      valueW: blackbodyW(p.emissivity, p.aRadM2, p.tHotK, p.tColdK),
      formula: "ε σ A (T_h⁴ − T_c⁴)",
    },
    {
      key: "mechanical",
      label: "Mechanical bleed-through",
      valueW: mechanicalW(p.rotorMassKg, p.rotorAmpNm, p.fmHz, p.mechQ),
      formula: "½ m (ω x)² · ω / Q",
    },
    {
      key: "tribo",
      label: "Triboelectric / thermal baseline",
      valueW: triboBaselineW(),
      formula: "≈ 1 pW floor",
    },
  ];

  const totalLeakageW = channels.reduce((s, c) => s + c.valueW, 0);
  const residualW = p.pClaimW - totalLeakageW;
  const residualFrac =
    p.pClaimW > 0 ? residualW / p.pClaimW : residualW === 0 ? 0 : 1;

  const verdict = classifyVerdict(p.pClaimW, totalLeakageW, residualW);

  return {
    channels,
    totalLeakageW,
    claimedW: p.pClaimW,
    residualW,
    residualFrac,
    verdict,
  };
}

function classifyVerdict(
  claim: number,
  leak: number,
  residual: number
): Verdict {
  const absClaim = Math.abs(claim);
  const absResidual = Math.abs(residual);

  if (absClaim < 1e-18 && leak < 1e-10) {
    return {
      key: "consistent",
      label: "Consistent with vacuum floor",
      description:
        "No claimed output and no detectable leakage — the setup is quiet enough to look for new physics.",
      tone: "sky",
    };
  }

  if (absClaim > 0 && absClaim < 1e-9 && absResidual < 10 * leak + 1e-15) {
    return {
      key: "consistent",
      label: "Consistent with known physics (DCE regime)",
      description:
        "Claim is at or below the nanowatt scale and matches the expected dynamical Casimir / thermal budget — no unexplained excess.",
      tone: "sky",
    };
  }

  if (absClaim === 0) {
    return {
      key: "explained",
      label: "No claim — budget shown for reference",
      description:
        "Enter a non-zero claimed output to compute a residual verdict.",
      tone: "amber",
    };
  }

  const frac = residual / absClaim;

  if (frac < 0.05 && frac > -0.05) {
    return {
      key: "explained",
      label: "Fully explained by mundane leakage",
      description:
        "The summed leakage channels account for essentially the entire claimed output. No residual signal remains.",
      tone: "emerald",
    };
  }

  if (frac >= 0.05 && frac < 0.5) {
    return {
      key: "partial",
      label: "Partially explained",
      description:
        "A significant fraction of the claimed output is consistent with mundane leakage, but a residual remains. Tighten shielding / thermal isolation before claiming new physics.",
      tone: "amber",
    };
  }

  if (frac >= 0.5 && absClaim / Math.max(leak, 1e-30) < 1e6) {
    return {
      key: "excess",
      label: "Unexplained excess",
      description:
        "Leakage cannot account for the claimed output. Either the claim is wrong by many orders of magnitude, or an unidentified power source is present.",
      tone: "orange",
    };
  }

  return {
    key: "gross-excess",
    label: "Unexplained excess",
    description:
      "Claimed output exceeds every plausible leakage channel by many orders of magnitude. This is the signature of either a measurement artifact, an unaccounted drive coupling, or unknown physics.",
    tone: "red",
  };
}

export function residualVsShield(
  base: LeakageParams,
  dbMin = 0,
  dbMax = 140,
  steps = 40
): { shieldDb: number; residualW: number; totalLeakageW: number }[] {
  const out: { shieldDb: number; residualW: number; totalLeakageW: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const shieldDb = dbMin + ((dbMax - dbMin) * i) / steps;
    const budget = computeBudget({ ...base, shieldDb });
    out.push({
      shieldDb,
      residualW: budget.residualW,
      totalLeakageW: budget.totalLeakageW,
    });
  }
  return out;
}

export function residualVsTemperature(
  base: LeakageParams,
  tMin = 4,
  tMax = 500,
  steps = 40
): { tHotK: number; residualW: number; totalLeakageW: number }[] {
  const out: { tHotK: number; residualW: number; totalLeakageW: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const tHotK = tMin + ((tMax - tMin) * i) / steps;
    const budget = computeBudget({ ...base, tHotK });
    out.push({
      tHotK,
      residualW: budget.residualW,
      totalLeakageW: budget.totalLeakageW,
    });
  }
  return out;
}

export function formatPower(w: number): string {
  const a = Math.abs(w);
  if (a === 0) return "0 W";
  if (a < 1e-18) return `${(w * 1e21).toExponential(2)} zW`;
  if (a < 1e-15) return `${(w * 1e18).toExponential(2)} aW`;
  if (a < 1e-12) return `${(w * 1e15).toExponential(2)} fW`;
  if (a < 1e-9) return `${(w * 1e12).toExponential(2)} pW`;
  if (a < 1e-6) return `${(w * 1e9).toExponential(2)} nW`;
  if (a < 1e-3) return `${(w * 1e6).toExponential(2)} µW`;
  if (a < 1) return `${(w * 1e3).toExponential(2)} mW`;
  if (a < 1e3) return `${w.toFixed(3)} W`;
  if (a < 1e6) return `${(w / 1e3).toFixed(3)} kW`;
  return `${w.toExponential(2)} W`;
}

export const TONE_CLASSES: Record<Verdict["tone"], { text: string; bg: string; border: string }> = {
  emerald: { text: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-700/40" },
  sky: { text: "text-sky-400", bg: "bg-sky-900/20", border: "border-sky-700/40" },
  amber: { text: "text-amber-400", bg: "bg-amber-900/20", border: "border-amber-700/40" },
  orange: { text: "text-orange-400", bg: "bg-orange-900/20", border: "border-orange-700/40" },
  red: { text: "text-red-400", bg: "bg-red-900/20", border: "border-red-700/40" },
};
