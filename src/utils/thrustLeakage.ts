export interface ThrustParams {
  claimedDeltaG: number;
  driveVoltageV: number;
  ambientPressurePa: number;
  electrodeGapM: number;
  deviceMassKg: number;
  vibrationAmpNm: number;
  vibrationFreqHz: number;
  tempGradientKPerM: number;
  deviceHeightM: number;
  plateAreaM2: number;
  electrostaticFieldVPerM: number;
  cavityGap_nm: number;
  rotorRadius_um: number;
  modulationDepth_beta: number;
  cavityQ: number;
  activeArea_cm2: number;
  driveFrequency_Hz: number;
  /**
   * Ion-wind discharge cross-section, m². Optional so presets, permalinks
   * and filed claims made before it existed keep their values: absent means
   * DEFAULT_DISCHARGE_AREA_M2.
   */
  dischargeAreaM2?: number;
  /**
   * Share of the peak vibration force that reads as a steady weight change,
   * 0–1. 1 is the upper bound (and the value when absent); 0 is a perfectly
   * linear balance, which averages a steady shake to nothing.
   */
  vibrationRectification?: number;
}

import { SigmaAssessment, assessResidual, combinedSigma } from "./uncertainty";
import { seededRandom } from "./residuals";
import { Grams, grams } from "./units";

export interface ThrustChannel {
  key: string;
  label: string;
  valueG: Grams;
  formula: string;
}

export type ThrustVerdictKey =
  | "explained"
  | "partial"
  | "excess"
  | "gross-excess";

export interface ThrustVerdict {
  key: ThrustVerdictKey;
  label: string;
  description: string;
  tone: "emerald" | "amber" | "orange" | "red";
}

export interface ThrustBudget {
  channels: ThrustChannel[];
  totalLeakageG: Grams;
  claimedG: Grams;
  residualG: Grams;
  residualFrac: number;
  verdict: ThrustVerdict;
  /** Combined 1σ uncertainty of the summed channels (25% per channel, RSS). */
  sigmaG: Grams;
  sigmaAssessment: SigmaAssessment;
}

const EPS0 = 8.854187817e-12;
export const G = 9.80665;
const RHO_AIR_STP = 1.225;
const BETA_AIR = 1 / 293;

/**
 * Cylindrical Bessel function of the first kind, order 1 — J₁(x).
 *
 * This is the correct function for the phase-modulation sideband weight
 * 2·J₁(β)² used in the DCE thrust limit: a carrier modulated at depth β
 * puts J_n(β) into each n-th sideband, so the first pair carries 2·J₁(β)².
 *
 * Implementation: Abramowitz & Stegun 9.4.4 / 9.4.6 minimax approximations,
 * validated against numerical integration of J₁'s integral representation to
 * a max absolute error of ~2.4e-8 over x ∈ [0, 12], and continuous across the
 * x = 3 seam. (The previous inline version mixed a spherical-Bessel form with
 * a cylindrical small-x limit and jumped ~30× at its x = 0.1 branch cut,
 * producing a spurious ~900× step in the thrust curve at β = 0.1.)
 */
export function besselJ1(x: number): number {
  const ax = Math.abs(x);
  let result: number;
  if (ax < 3) {
    const y = (x * x) / 9;
    result =
      ax *
      (0.5 +
        y *
          (-0.56249985 +
            y *
              (0.21093573 +
                y *
                  (-0.03954289 +
                    y * (0.00443319 + y * (-0.00031761 + y * 0.00001109))))));
  } else {
    const z = 3 / ax;
    const f =
      0.79788456 +
      z *
        (0.00000156 +
          z *
            (0.01659667 +
              z *
                (0.00017105 +
                  z * (-0.00249511 + z * (0.00113653 + z * -0.00020033)))));
    const theta =
      ax -
      2.35619449 +
      z *
        (0.12499612 +
          z *
            (0.0000565 +
              z *
                (-0.00637879 +
                  z * (0.00074348 + z * (0.00079824 + z * -0.00029166)))));
    result = (f * Math.cos(theta)) / Math.sqrt(ax);
  }
  return x < 0 ? -result : result;
}

const P_ATM = 101325;
/** Ion–neutral mean free path in air at 1 atm, 293 K (≈ N₂ kinetic value). */
const ION_MFP_ATM_M = 6.6e-8;
/** Emitter–collector cross-section of a desktop corona rig (10 cm²). */
export const DEFAULT_DISCHARGE_AREA_M2 = 1e-3;

/**
 * Ion wind in the collisional limit, grams-equivalent. Thrust is T = I·d/μ
 * (ions drift across the gap and hand their momentum to the air). With a
 * space-charge-limited current, J = 9/8·ε₀μV²/d³, the mobility cancels:
 * T = 9/8·ε₀·(V/d)²·A over the discharge area A (default 10 cm², a desktop
 * corona rig, which sits below this bound). A heuristic: the area is the
 * user's to set, and a large-electrode rig can push much harder.
 */
export function ionWindCollisionalG(
  voltageV: number,
  gapM: number,
  areaM2: number = DEFAULT_DISCHARGE_AREA_M2
): Grams {
  if (gapM <= 0 || !(areaM2 > 0)) return grams(0);
  const E = voltageV / gapM;
  const thrustN = (9 / 8) * EPS0 * E * E * areaM2;
  return grams((thrustN / G) * 1000);
}

/**
 * Ion wind at a given pressure. Ions only push air they collide with: an ion
 * crossing the gap meets ~d/λ neutrals (λ ∝ 1/p), so the share of its
 * momentum that reaches the gas is taken as d/(d+λ). At 1 atm λ ≈ 66 nm and
 * the share is 1; in hard vacuum ions fly straight into the collector, the
 * force stays inside the device, and the wind vanishes.
 *
 * The previous form, ε₀·μ·E²·d·0.001, had units of amperes and grew as the
 * pressure fell (μ ∝ 1/p) — 10⁵× stronger at 1 Pa than at 1 atm.
 */
export function ionWindForceG(
  voltageV: number,
  pressurePa: number,
  gapM: number,
  areaM2: number = DEFAULT_DISCHARGE_AREA_M2
): Grams {
  if (gapM <= 0 || !(pressurePa > 0)) return grams(0);
  const mfpM = ION_MFP_ATM_M * (P_ATM / pressurePa);
  return grams(ionWindCollisionalG(voltageV, gapM, areaM2) * (gapM / (gapM + mfpM)));
}

/**
 * The pressure below which the ion-wind channel stays under `allowG` —
 * the inverse of ionWindForceG in pressure. Infinity when the collisional
 * limit is already within the allowance (no pumping needed).
 */
export function ionWindPressureLimitPa(
  allowG: number,
  voltageV: number,
  gapM: number,
  areaM2: number = DEFAULT_DISCHARGE_AREA_M2
): number {
  const collisional = ionWindCollisionalG(voltageV, gapM, areaM2);
  if (!(collisional > allowG)) return Infinity;
  const share = allowG / collisional;
  const mfpM = (gapM * (1 - share)) / share;
  return (ION_MFP_ATM_M * P_ATM) / mfpM;
}

/**
 * Vibration: the peak inertial force m·ω²·x, times the share of it that
 * reads as a steady weight change (clamped to 0–1; 1 is the upper bound).
 */
export function vibrationForceG(
  massKg: number,
  ampNm: number,
  freqHz: number,
  rectification: number = 1
): Grams {
  const omega = 2 * Math.PI * freqHz;
  const acc = omega * omega * (ampNm * 1e-9);
  const share = Math.min(1, Math.max(0, rectification));
  return grams(share * (massKg * acc / G) * 1000);
}

export function electrostaticForceG(
  fieldVPerM: number,
  areaM2: number
): Grams {
  const forceN = 0.5 * EPS0 * fieldVPerM * fieldVPerM * areaM2;
  return grams((forceN / G) * 1000);
}

export function thermalConvectionG(
  tempGradKPerM: number,
  heightM: number,
  areaM2: number,
  pressurePa: number = P_ATM
): Grams {
  // Buoyancy of heated air scales with the air's density, ∝ pressure:
  // in hard vacuum there is no air to heat.
  const deltaT = tempGradKPerM * heightM;
  const rhoAir = RHO_AIR_STP * (Math.max(pressurePa, 0) / P_ATM);
  const deltaRho = rhoAir * BETA_AIR * deltaT;
  const buoyancyN = deltaRho * areaM2 * heightM * G;
  return grams((buoyancyN / G) * 1000);
}

export function dceThrustLimitG(p: ThrustParams): Grams {
  const hbar = 1.0545718e-34;
  const c = 299792458;
  const d_m = p.cavityGap_nm * 1e-9;
  const f_m_Hz = p.driveFrequency_Hz;
  const rotorRadius_m = p.rotorRadius_um * 1e-6;
  const v = 2 * Math.PI * f_m_Hz * rotorRadius_m;
  const A_m2 = p.activeArea_cm2 * 1e-4;

  if (d_m <= 0 || f_m_Hz <= 0 || A_m2 <= 0) return grams(0);

  const sidebandEfficiency = 2 * Math.pow(besselJ1(p.modulationDepth_beta), 2);
  const f0_Hz = c / (2 * d_m);
  const detuning = (f_m_Hz - f0_Hz) / f0_Hz;
  const Lorentzian = 1 / (1 + 4 * p.cavityQ * p.cavityQ * detuning * detuning);
  // Generous order-of-magnitude ceiling, not a derived result: Casimir-scale
  // energy density ħc/d⁴ (the π²/720 ≈ 0.014 prefactor is deliberately
  // dropped to keep this an upper bound), × plate area, × c as the fastest
  // conceivable out-coupling, × (v/c)² perturbative suppression for slow
  // boundary motion. Yields watts: ħc²/d⁴ · (v/c)² · A. A claim exceeding
  // even this bound is excluded; a claim under it is not thereby explained.
  const pDCE_W = (hbar * Math.pow(c, 2) / Math.pow(d_m, 4)) * Math.pow(v / c, 2) * A_m2;
  const power_W = pDCE_W * sidebandEfficiency * Lorentzian;
  const force_N = power_W / c;
  const force_g = (force_N / G) * 1000; // grams-equivalent, like every channel

  return grams(force_g);
}

/**
 * Verdict robustness: jitter every parameter ±`jitter` fraction and recount
 * the verdicts. A preset whose verdict flips on plausible measurement
 * uncertainty is boundary-sensitive — a fact worth showing next to the
 * verdict itself. Deterministic via seededRandom.
 */
export function verdictStability(
  p: ThrustParams,
  opts: { trials?: number; jitter?: number; seed?: number } = {}
): { dominant: string; dominantShare: number; boundary: boolean; tally: Record<string, number> } {
  const trials = opts.trials ?? 120;
  const jitter = opts.jitter ?? 0.2;
  const rnd = seededRandom(opts.seed ?? 1234);
  const tally: Record<string, number> = {};
  for (let i = 0; i < trials; i++) {
    const q: ThrustParams = { ...p };
    for (const k of Object.keys(q) as (keyof ThrustParams)[]) {
      q[k] = (q[k] as number) * (1 + 2 * jitter * (rnd() - 0.5));
    }
    const v = computeThrustBudget(q).verdict.key;
    tally[v] = (tally[v] ?? 0) + 1;
  }
  const [dominant, count] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  const share = count / trials;
  return { dominant, dominantShare: share, boundary: share < 0.95, tally };
}

export function computeThrustBudget(p: ThrustParams): ThrustBudget {
  // One thermal channel, once. The budget previously listed "convection"
  // and "buoyancy" separately, but both reduce to the same Δρ·A·h term —
  // the same physics counted twice (found by the permutation sweep,
  // regression-tested below).
  const rectification = Math.min(1, Math.max(0, p.vibrationRectification ?? 1));
  const channels: ThrustChannel[] = [
    {
      key: "ionWind",
      label: "Ion wind / corona thrust",
      valueG: ionWindForceG(
        p.driveVoltageV,
        p.ambientPressurePa,
        p.electrodeGapM,
        p.dischargeAreaM2 ?? DEFAULT_DISCHARGE_AREA_M2
      ),
      formula: "⁹⁄₈ ε₀ E² A_d · d/(d+λ) (heuristic)",
    },
    {
      key: "vibration",
      // The peak inertial force. A linear balance averages a sinusoidal
      // shake to zero; it only reads as a steady weight change through a
      // nonlinearity (bouncing contact, saturating or filtering readout).
      // At the default rectification of 1 this channel is the upper bound.
      label:
        rectification >= 1
          ? "Vibration (peak inertial force, upper bound)"
          : "Vibration (rectified share of the peak force)",
      valueG: vibrationForceG(
        p.deviceMassKg,
        p.vibrationAmpNm,
        p.vibrationFreqHz,
        rectification
      ),
      formula: rectification >= 1 ? "m ω² x / g (peak)" : `${rectification.toFixed(2)} × m ω² x / g`,
    },
    {
      key: "electrostatic",
      label: "Electrostatic image force",
      valueG: electrostaticForceG(p.electrostaticFieldVPerM, p.plateAreaM2),
      formula: "½ ε₀ E² A / g",
    },
    {
      key: "thermal",
      label: "Thermal buoyancy (heated air)",
      valueG: thermalConvectionG(
        p.tempGradientKPerM,
        p.deviceHeightM,
        p.plateAreaM2,
        p.ambientPressurePa
      ),
      formula: "Δρ · A · h (Δρ ∝ p)",
    },
  ];

  const totalLeakageG = grams(channels.reduce((s, c) => s + c.valueG, 0));
  const residualG = grams(p.claimedDeltaG - totalLeakageG);
  const residualFrac =
    p.claimedDeltaG > 0 ? residualG / p.claimedDeltaG : residualG === 0 ? 0 : 1;

  const verdict = classifyThrustVerdict(p.claimedDeltaG, totalLeakageG, residualG);
  const sigmaG = grams(combinedSigma(channels.map((c) => c.valueG)));
  const sigmaAssessment = assessResidual(residualG, sigmaG);

  return { channels, totalLeakageG, claimedG: grams(p.claimedDeltaG), residualG, residualFrac, verdict, sigmaG, sigmaAssessment };
}

function classifyThrustVerdict(
  claim: number,
  leak: number,
  residual: number
): ThrustVerdict {
  if (claim <= 0) {
    return {
      key: "explained",
      label: "No claim entered",
      description: "Enter a non-zero weight change to compute a residual verdict.",
      tone: "amber",
    };
  }

  const frac = residual / claim;

  if (frac < 0.05) {
    return {
      key: "explained",
      label: "Fully explained by mundane forces",
      description:
        "The summed artifact channels account for the entire claimed weight change. No anomalous thrust is required.",
      tone: "emerald",
    };
  }

  if (frac < 0.5) {
    return {
      key: "partial",
      label: "Partially explained",
      description:
        "A significant fraction of the claimed weight change is consistent with mundane forces, but a residual remains. Improve isolation before claiming anomalous thrust.",
      tone: "amber",
    };
  }

  if (claim / Math.max(leak, 1e-30) < 1e6) {
    return {
      key: "excess",
      label: "Unexplained excess",
      description:
        "Known artifact forces cannot account for the claimed weight change. Either the measurement is flawed, or an unidentified force is present.",
      tone: "orange",
    };
  }

  return {
    key: "gross-excess",
    label: "Unexplained excess",
    description:
      "Claimed weight change exceeds every plausible artifact force by many orders of magnitude. This strongly suggests a measurement error, systematic bias, or unknown physics.",
    tone: "red",
  };
}

export function formatForceG(g: Grams): string {
  const a = Math.abs(g);
  if (a === 0) return "0 g";
  // Below 0.01 pg a fixed-point pg reading rounds to "0.00 pg".
  if (a < 1e-14) return `${g.toExponential(2)} g`;
  if (a < 1e-9) return `${(g * 1e12).toFixed(2)} pg`;
  if (a < 1e-6) return `${(g * 1e9).toFixed(2)} ng`;
  if (a < 1e-3) return `${(g * 1e6).toFixed(2)} ug`;
  if (a < 1) return `${(g * 1e3).toFixed(3)} mg`;
  return `${g.toFixed(4)} g`;
}

export function residualVsVoltage(
  base: ThrustParams,
  vMin = 0,
  vMax = 1000,
  steps = 40
): { voltageV: number; residualG: number; totalLeakageG: number }[] {
  const out: { voltageV: number; residualG: number; totalLeakageG: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const voltageV = vMin + ((vMax - vMin) * i) / steps;
    const budget = computeThrustBudget({ ...base, driveVoltageV: voltageV });
    out.push({ voltageV, residualG: budget.residualG, totalLeakageG: budget.totalLeakageG });
  }
  return out;
}

export function residualVsPressure(
  base: ThrustParams,
  pMin = 1e-6,
  pMax = 101325,
  steps = 40
): { pressurePa: number; residualG: number; totalLeakageG: number }[] {
  // Log-spaced: the ion-wind channel only moves once the mean free path
  // approaches the gap, many decades below 1 atm.
  const out: { pressurePa: number; residualG: number; totalLeakageG: number }[] = [];
  const lo = Math.log10(pMin);
  const hi = Math.log10(pMax);
  for (let i = 0; i <= steps; i++) {
    const pressurePa = Math.pow(10, lo + ((hi - lo) * i) / steps);
    const budget = computeThrustBudget({ ...base, ambientPressurePa: pressurePa });
    out.push({ pressurePa, residualG: budget.residualG, totalLeakageG: budget.totalLeakageG });
  }
  return out;
}

export const THRUST_TONE_CLASSES: Record<
  ThrustVerdict["tone"],
  { text: string; bg: string; border: string }
> = {
  emerald: { text: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-700/40" },
  amber: { text: "text-amber-400", bg: "bg-amber-900/20", border: "border-amber-700/40" },
  orange: { text: "text-orange-400", bg: "bg-orange-900/20", border: "border-orange-700/40" },
  red: { text: "text-red-400", bg: "bg-red-900/20", border: "border-red-700/40" },
};
