/**
 * The thermal floor: the Brownian noise of the test mass itself.
 *
 * Any test mass at temperature T jiggles — Brownian motion, via the
 * fluctuation–dissipation theorem. For a measurement mode modelled as a
 * damped harmonic oscillator (mass m, resonance ω₀, quality factor Q),
 * the thermal Langevin force noise spectral density is
 *
 *   S_F = 4 k_B T m ω₀ / Q      [N²/Hz]
 *
 * (structural damping, Saulson-style; the house convention of dropping
 * O(1) prefactors applies). Integrated over a measurement of duration τ
 * (effective bandwidth ~ 1/τ), the smallest force THIS oscillator can
 * resolve against its own thermal noise is
 *
 *   F_min ≈ sqrt(4 k_B T m ω₀ / (Q τ))    [N]
 *
 * and the rms thermal position jitter of the mass is, by equipartition,
 *
 *   x_th = sqrt(k_B T / (m ω₀²))          [m]
 *
 * This is a floor for the rig as modelled, not for every instrument that
 * could exist: F_min falls with lighter masses, higher Q (real resonators
 * reach 10⁶–10⁹), lower T and longer τ, and quantum-limited or
 * back-action-evading readouts change the accounting again. It does give
 * a claim a third status beyond true/false for a given rig: SUB-THERMAL —
 * below what this test mass at this temperature can distinguish from its
 * own noise. Cooling alone helps only as √T: each 100× in sensitivity
 * costs 10⁴× in temperature.
 *
 * For power claims the analogous bound is the matched-filter energy
 * floor, P_min ≈ k_B T / τ (one kT of energy per measurement).
 */

import { Grams, newtons, newtonsToGrams } from "./units";

export const KB = 1.380649e-23;
export const G = 9.80665;

export interface ThermalFloorParams {
  massKg: number;
  /** Measurement-mode resonance, Hz. */
  freqHz: number;
  qualityFactor: number;
  tempK: number;
  integrationS: number;
}

/** Smallest resolvable force [N] for the rig, thermal limit only. */
export function thermalForceFloorN(p: ThermalFloorParams): number {
  const omega = 2 * Math.PI * p.freqHz;
  return Math.sqrt((4 * KB * p.tempK * p.massKg * omega) / (p.qualityFactor * p.integrationS));
}

/**
 * The same floor in the app's Δg units: grams-equivalent weight change,
 * F/g × 1000 — the unit every thrust channel and claim uses. (It once
 * divided by the test mass too, giving milli-g of acceleration, which put
 * the claim ÷ floor ratio off by the mass in kg — 10× at 100 g.)
 */
export function thermalFloorDeltaG(p: ThermalFloorParams): Grams {
  return newtonsToGrams(newtons(thermalForceFloorN(p)));
}

/** The same floor as an acceleration of the test mass, F_min / m [m/s²]. */
export function thermalAccelerationFloor(p: ThermalFloorParams): number {
  return thermalForceFloorN(p) / p.massKg;
}

/**
 * The Experiment Design tab's rig: its slider ranges and its fixed Q.
 * Other tabs quote "the quietest rig the tab can set", so the numbers
 * live here once rather than being retyped as a guess.
 */
export const ED_QUALITY_FACTOR = 100;
export const ED_RIG_RANGE = {
  massKg: { min: 0.01, max: 5 },
  freqHz: { min: 10, max: 500 },
  tempK: { min: 0.01, max: 400 },
  integrationS: { min: 1, max: 1e6 },
} as const;

/** Lowest acceleration floor the tab can reach: heaviest, slowest, coldest, longest. */
export const QUIETEST_ED_RIG: ThermalFloorParams = {
  massKg: ED_RIG_RANGE.massKg.max,
  freqHz: ED_RIG_RANGE.freqHz.min,
  qualityFactor: ED_QUALITY_FACTOR,
  tempK: ED_RIG_RANGE.tempK.min,
  integrationS: ED_RIG_RANGE.integrationS.max,
};

/** rms thermal position jitter of the test mass [m] (equipartition). */
export function thermalPositionNoiseM(p: ThermalFloorParams): number {
  const omega = 2 * Math.PI * p.freqHz;
  return Math.sqrt((KB * p.tempK) / (p.massKg * omega * omega));
}

/** Matched-filter energy floor for a power measurement [W]. */
export function thermalPowerFloorW(tempK: number, integrationS: number): number {
  return (KB * tempK) / integrationS;
}

export interface DecidabilityVerdict {
  key: "comfortable" | "marginal" | "sub-thermal";
  label: string;
  description: string;
  tone: "emerald" | "amber" | "red";
  /** Temperature the rig would need to reach for a sub-thermal claim. */
  requiredTempK: number | null;
}

export function assessDecidability(
  claimDeltaG: number,
  p: ThermalFloorParams
): { floorG: number; ratio: number; verdict: DecidabilityVerdict } {
  const floorG = thermalFloorDeltaG(p);
  const ratio = floorG > 0 ? claimDeltaG / floorG : Infinity;

  if (ratio >= 10) {
    return {
      floorG,
      ratio,
      verdict: {
        key: "comfortable",
        label: "Decidable in principle",
        description: `The claim sits ${ratio.toExponential(1)}× above the thermal noise of its own test mass. Thermal noise is not what stops this rig — the question is whether your artifacts (see the requirements above) let it. (Working ~10× above a fundamental noise floor is routine metrology.)`,
        tone: "emerald",
        requiredTempK: null,
      },
    };
  }

  if (ratio >= 1) {
    return {
      floorG,
      ratio,
      verdict: {
        key: "marginal",
        label: "Marginal against the thermal floor",
        description: `Only ${ratio.toFixed(1)}× above the thermal noise of the test mass — genuinely fighting the apparatus itself, not just artifacts. Cryogenic operation buys headroom (as √T), long integration buys √τ.`,
        tone: "amber",
        requiredTempK: null,
      },
    };
  }

  const requiredTempK = p.tempK * ratio * ratio;
  // A dilution refrigerator bottoms out near 10 mK.
  const beyondFridge = requiredTempK < 0.01;
  return {
    floorG,
    ratio,
    verdict: {
      key: "sub-thermal",
      label: "Sub-thermal: below this rig's Brownian floor",
      description: `The claim is ${(1 / ratio).toExponential(1)}× SMALLER than the Brownian jitter of this test mass at ${p.tempK.toFixed(p.tempK < 1 ? 2 : 0)} K (Q = ${p.qualityFactor}). Shielding does not help — the noise is the mass's own — and better vacuum helps only by raising Q. Cooling alone would have to reach ≈ ${requiredTempK.toExponential(1)} K${beyondFridge ? ", colder than a dilution refrigerator's ~10 mK" : ""}; the other levers are a lighter mass, a higher-Q resonator (real ones reach 10⁶–10⁹), longer integration or a quantum-limited readout — a different instrument. The claim is not wrong; this rig cannot witness it.`,
      tone: "red",
      requiredTempK,
    },
  };
}
