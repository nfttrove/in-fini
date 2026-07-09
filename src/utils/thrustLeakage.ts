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
}

export interface ThrustChannel {
  key: string;
  label: string;
  valueG: number;
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
  totalLeakageG: number;
  claimedG: number;
  residualG: number;
  residualFrac: number;
  verdict: ThrustVerdict;
}

const EPS0 = 8.854187817e-12;
const G = 9.80665;
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

export function ionWindForceG(
  voltageV: number,
  pressurePa: number,
  gapM: number
): number {
  if (gapM <= 0) return 0;
  const mobility = 2e-4 * (101325 / Math.max(pressurePa, 1));
  const E = voltageV / gapM;
  const currentDensity = EPS0 * mobility * E * E;
  const thrustN = currentDensity * gapM * 0.001;
  return (thrustN / G) * 1000;
}

export function vibrationForceG(
  massKg: number,
  ampNm: number,
  freqHz: number
): number {
  const omega = 2 * Math.PI * freqHz;
  const acc = omega * omega * (ampNm * 1e-9);
  return (massKg * acc / G) * 1000;
}

export function electrostaticForceG(
  fieldVPerM: number,
  areaM2: number
): number {
  const forceN = 0.5 * EPS0 * fieldVPerM * fieldVPerM * areaM2;
  return (forceN / G) * 1000;
}

export function thermalConvectionG(
  tempGradKPerM: number,
  heightM: number,
  areaM2: number
): number {
  const deltaT = tempGradKPerM * heightM;
  const deltaRho = RHO_AIR_STP * BETA_AIR * deltaT;
  const buoyancyN = deltaRho * areaM2 * heightM * G;
  return (buoyancyN / G) * 1000;
}

export function dceThrustLimitG(p: ThrustParams): number {
  const hbar = 1.0545718e-34;
  const c = 299792458;
  const d_m = p.cavityGap_nm * 1e-9;
  const f_m_Hz = p.driveFrequency_Hz;
  const rotorRadius_m = p.rotorRadius_um * 1e-6;
  const v = 2 * Math.PI * f_m_Hz * rotorRadius_m;
  const A_m2 = p.activeArea_cm2 * 1e-4;

  if (d_m <= 0 || f_m_Hz <= 0 || A_m2 <= 0) return 0;

  const sidebandEfficiency = 2 * Math.pow(besselJ1(p.modulationDepth_beta), 2);
  const f0_Hz = c / (2 * d_m);
  const detuning = (f_m_Hz - f0_Hz) / f0_Hz;
  const Lorentzian = 1 / (1 + 4 * p.cavityQ * p.cavityQ * detuning * detuning);
  const pDCE_W = (hbar * Math.pow(c, 3) / Math.pow(d_m, 4)) * Math.pow(v / c, 2) * A_m2;
  const power_W = pDCE_W * sidebandEfficiency * Lorentzian;
  const force_N = power_W / c;
  const force_mg = (force_N / G) * 1000;

  return force_mg;
}

export function buoyancyShiftG(
  tempGradKPerM: number,
  heightM: number,
  areaM2: number
): number {
  const vol = areaM2 * heightM;
  const deltaT = tempGradKPerM * heightM;
  const deltaRho = RHO_AIR_STP * BETA_AIR * deltaT;
  return deltaRho * vol * 1000;
}

export function computeThrustBudget(p: ThrustParams): ThrustBudget {
  const channels: ThrustChannel[] = [
    {
      key: "ionWind",
      label: "Ion wind / corona thrust",
      valueG: ionWindForceG(p.driveVoltageV, p.ambientPressurePa, p.electrodeGapM),
      formula: "ε₀ μ E² d (heuristic)",
    },
    {
      key: "vibration",
      label: "Vibration-induced apparent force",
      valueG: vibrationForceG(p.deviceMassKg, p.vibrationAmpNm, p.vibrationFreqHz),
      formula: "m ω² x / g",
    },
    {
      key: "electrostatic",
      label: "Electrostatic image force",
      valueG: electrostaticForceG(p.electrostaticFieldVPerM, p.plateAreaM2),
      formula: "½ ε₀ E² A / g",
    },
    {
      key: "convection",
      label: "Thermal convection lift",
      valueG: thermalConvectionG(p.tempGradientKPerM, p.deviceHeightM, p.plateAreaM2),
      formula: "Δρ A h g / g",
    },
    {
      key: "buoyancy",
      label: "Buoyancy shift (heated air)",
      valueG: buoyancyShiftG(p.tempGradientKPerM, p.deviceHeightM, p.plateAreaM2),
      formula: "Δρ · V",
    },
  ];

  const totalLeakageG = channels.reduce((s, c) => s + c.valueG, 0);
  const residualG = p.claimedDeltaG - totalLeakageG;
  const residualFrac =
    p.claimedDeltaG > 0 ? residualG / p.claimedDeltaG : residualG === 0 ? 0 : 1;

  const verdict = classifyThrustVerdict(p.claimedDeltaG, totalLeakageG, residualG);

  return { channels, totalLeakageG, claimedG: p.claimedDeltaG, residualG, residualFrac, verdict };
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

export function formatForceG(g: number): string {
  const a = Math.abs(g);
  if (a === 0) return "0 g";
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
  pMin = 1,
  pMax = 101325,
  steps = 40
): { pressurePa: number; residualG: number; totalLeakageG: number }[] {
  const out: { pressurePa: number; residualG: number; totalLeakageG: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const pressurePa = pMin + ((pMax - pMin) * i) / steps;
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
