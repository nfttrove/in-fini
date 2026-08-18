/**
 * The experiment-design inverter.
 *
 * The diagnostic panels answer "here is a claim — what explains it?".
 * This module answers the constructive question: "I want to detect an
 * effect of size S at kσ — what must my rig actually achieve?"
 *
 * Method (stated plainly, because the answer depends on it):
 *   For a detection at kσ, the combined artifact noise σ must satisfy
 *   k·σ ≤ S. We split the allowance equally across N independent channels
 *   in quadrature: each channel may contribute at most
 *   σ_i = S / (k·√N) of *uncertainty*. We then invert each channel's own
 *   formula for its physical parameter. The existing budget engines use
 *   the same formulas, so plugging the derived limits back into the real
 *   channel functions reproduces σ_i — the round-trip is unit-tested.
 *
 * These are necessary conditions on the artifacts, not a detection
 * guarantee: real experiments also need sensor calibration, thermal
 * stability of the *sensor*, and blind analysis. The panel says so.
 */

import { G, ionWindForceG, thermalConvectionG } from "./thrustLeakage";
import { rfLeakageW } from "./leakage";

const EPS0 = 8.854187817e-12;
const SIGMA_SB = 5.670374419e-8;

export interface Requirement {
  key: string;
  label: string;
  /** The achievable limit the rig must beat, in the channel's own units. */
  value: number;
  unit: string;
  /** The same limit expressed relative to the current (reference) setup. */
  asFractionOfReference: string;
}

export interface DesignResult {
  claim: number;
  unit: string;
  k: number;
  channels: number;
  /** Per-channel artifact allowance in claim units (milli-g or W). */
  sigmaPerChannel: number;
  requirements: Requirement[];
}

function frac(reference: number, limit: number): string {
  if (!(reference > 0) || !isFinite(limit)) return "—";
  return `${(limit / reference).toExponential(1)}× current`;
}

// ---------------------------------------------------------------------------
// Thrust / weight-change experiments
// ---------------------------------------------------------------------------

export interface ThrustDesignContext {
  claimedDeltaG: number;
  k?: number;
  driveVoltageV: number;
  electrodeGapM: number;
  deviceMassKg: number;
  deviceHeightM: number;
  vibrationFreqHz: number;
  vibrationAmpNm: number;
  plateAreaM2: number;
  ambientPressurePa: number;
  tempGradKPerM: number;
}

export function thrustRequirements(ctx: ThrustDesignContext): DesignResult {
  const k = ctx.k ?? 2;
  const N = 4; // ion wind, vibration, electrostatic, thermal buoyancy
  const allow = ctx.claimedDeltaG / (k * Math.sqrt(N));

  // vibration: value_mG = m ω² x / g × 1000 → x_max
  const omega = 2 * Math.PI * ctx.vibrationFreqHz;
  const vibMaxM = (allow * G) / (1000 * ctx.deviceMassKg * omega * omega);
  const vibNowM = ctx.vibrationAmpNm * 1e-9;

  // ion wind: value ∝ 1/P (mobility) and ∝ V². Both limits are useful:
  // raising pressure suppresses it (until the heuristic breaks in vacuum,
  // where there is no gas to push); lowering the voltage quadratically helps.
  const ionNow = ionWindForceG(
    ctx.driveVoltageV,
    ctx.ambientPressurePa,
    ctx.electrodeGapM
  );
  const pMax =
    ionNow > 0 ? (ctx.ambientPressurePa * ionNow) / allow : Infinity;
  const vMaxIon =
    ionNow > 0 ? ctx.driveVoltageV * Math.sqrt(allow / ionNow) : Infinity;

  // electrostatic: value_mG = ½ ε₀ E² A / g × 1000 → E_max
  const eMax = Math.sqrt((2 * allow * G) / (1000 * EPS0 * ctx.plateAreaM2));

  // The thermal channel is linear in the temperature gradient.
  const convNow = thermalConvectionG(
    ctx.tempGradKPerM,
    ctx.deviceHeightM,
    ctx.plateAreaM2
  );
  const gradMax =
    convNow > 0 ? (allow * ctx.tempGradKPerM) / convNow : Infinity;

  return {
    claim: ctx.claimedDeltaG,
    unit: "Δg (milli-g)",
    k,
    channels: N,
    sigmaPerChannel: allow,
    requirements: [
      {
        key: "vibration",
        label: `Vibration amplitude below ${ctx.vibrationFreqHz.toFixed(0)} Hz`,
        value: vibMaxM * 1e9,
        unit: "nm",
        asFractionOfReference: frac(vibNowM, vibMaxM),
      },
      {
        key: "ion-wind",
        label: `Drive voltage at ${ctx.ambientPressurePa.toFixed(0)} Pa (ion wind ∝ V²; pressure alone cannot fix it — p_max would be ${isFinite(pMax) ? (pMax / 101325).toFixed(1) : "∞"} atm)`,
        value: vMaxIon,
        unit: "V",
        asFractionOfReference: frac(ctx.driveVoltageV, vMaxIon),
      },
      {
        key: "electrostatic",
        label: "Stray electrostatic field",
        value: eMax,
        unit: "V/m",
        asFractionOfReference: "absolute limit",
      },
      {
        key: "thermal",
        label: "Vertical temperature gradient (thermal buoyancy channel)",
        value: gradMax,
        unit: "K/m",
        asFractionOfReference: frac(ctx.tempGradKPerM, gradMax),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Power / over-unity experiments
// ---------------------------------------------------------------------------

export interface PowerDesignContext {
  claimedW: number;
  k?: number;
  vDriveV: number;
  rDriveOhm: number;
  shieldDb: number;
  iBiasA: number;
  rResOhm: number;
  tColdK: number;
  aRadM2: number;
  emissivity: number;
  tHotK: number;
}

export function powerRequirements(ctx: PowerDesignContext): DesignResult {
  const k = ctx.k ?? 2;
  const N = 4; // joule, RF pickup, blackbody, mechanical
  const allow = ctx.claimedW / (k * Math.sqrt(N));

  // joule: I² R ≤ allow → I_max at fixed R
  const iMax = ctx.rResOhm > 0 ? Math.sqrt(allow / ctx.rResOhm) : Infinity;

  // RF pickup: ½V²/R · 10^(−S/10) ≤ allow → S_min at fixed V, R
  const rfNow = rfLeakageW(ctx.vDriveV, ctx.rDriveOhm, ctx.shieldDb);
  const sMin = rfNow > 0 ? ctx.shieldDb + 10 * Math.log10(rfNow / allow) : 0;

  // blackbody: ε σ A (T_h⁴ − T_c⁴) ≤ allow → T_h_max
  const t4 =
    Math.pow(ctx.tColdK, 4) +
    allow / (ctx.emissivity * SIGMA_SB * ctx.aRadM2);
  const tHotMax = Math.pow(Math.max(t4, 0), 0.25);

  // mechanical bleed-through is quadratic in amplitude (P ∝ (ωx)²): the
  // required amplitude scales as √(allow/current); the diagnostic tab owns
  // the full expression, so the panel states the allowance itself.
  return {
    claim: ctx.claimedW,
    unit: "W",
    k,
    channels: N,
    sigmaPerChannel: allow,
    requirements: [
      {
        key: "joule",
        label: `Bias current at R = ${ctx.rResOhm.toFixed(2)} Ω`,
        value: iMax,
        unit: "A",
        asFractionOfReference: frac(ctx.iBiasA, iMax),
      },
      {
        key: "rf",
        label: `Shielding at ${ctx.vDriveV.toFixed(1)} V drive`,
        value: sMin,
        unit: "dB",
        asFractionOfReference: "absolute minimum",
      },
      {
        key: "blackbody",
        label: `Hot-side temperature (cold side ${ctx.tColdK.toFixed(0)} K, ε = ${ctx.emissivity.toFixed(2)}, A = ${(ctx.aRadM2 * 1e4).toFixed(1)} cm²)`,
        value: tHotMax,
        unit: "K",
        asFractionOfReference: frac(ctx.tHotK, tHotMax),
      },
      {
        key: "mechanical",
        label: "Mechanical channel allowance (amplitude limit scales as √allowance; see Leakage tab)",
        value: allow,
        unit: "W",
        asFractionOfReference: "per-channel allowance",
      },
    ],
  };
}
