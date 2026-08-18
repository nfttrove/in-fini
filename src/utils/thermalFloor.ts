/**
 * The thermal floor: the measurability limit imposed by matter itself.
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
 * (effective bandwidth ~ 1/τ), the smallest force any matter-based
 * instrument can resolve at temperature T is
 *
 *   F_min ≈ sqrt(4 k_B T m ω₀ / (Q τ))    [N]
 *
 * and the rms thermal position jitter of the mass is, by equipartition,
 *
 *   x_th = sqrt(k_B T / (m ω₀²))          [m]
 *
 * Together these give a claim a third possible status beyond true/false:
 * SUB-THERMAL — smaller than what any arrangement of atoms at that
 * temperature could ever distinguish from noise. Cooling helps as √T,
 * which is brutally slow: each 100× in sensitivity costs 10⁴× in
 * temperature.
 *
 * For power claims the analogous bound is the matched-filter energy
 * floor, P_min ≈ k_B T / τ (one kT of energy per measurement).
 */

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

/** The same floor expressed in the app's Δg (milli-g) units. */
export function thermalFloorDeltaG(p: ThermalFloorParams): number {
  return (thermalForceFloorN(p) / (p.massKg * G)) * 1000;
}

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

  if (ratio >= 100) {
    return {
      floorG,
      ratio,
      verdict: {
        key: "comfortable",
        label: "Decidable in principle",
        description: `The claim sits ${ratio.toExponential(1)}× above the thermal noise of its own test mass. Matter can arbitrate this one — the only question is whether your artifacts (see the requirements above) let it.`,
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
        description: `Only ${ratio.toFixed(1)}× above the thermal noise of the test mass. Cryogenic operation buys headroom (as √T), and long integration buys √τ — but you are now fighting the apparatus itself, not just artifacts.`,
        tone: "amber",
        requiredTempK: null,
      },
    };
  }

  const requiredTempK = p.tempK * ratio * ratio;
  const belowCMB = requiredTempK < 2.7;
  return {
    floorG,
    ratio,
    verdict: {
      key: "sub-thermal",
      label: "Sub-thermal: undecidable by matter at this temperature",
      description: `The claim is ${(1 / ratio).toExponential(1)}× SMALLER than the Brownian jitter of its own test mass at ${p.tempK.toFixed(0)} K. No shielding, vacuum, or budget fixes this — the rig is made of atoms. Decidability would demand cooling to ≈ ${requiredTempK.toExponential(1)} K${belowCMB ? ", below the cosmic microwave background: effectively colder than the universe allows" : ""}. The claim is not wrong; it is unwitnessable.`,
      tone: "red",
      requiredTempK,
    },
  };
}
