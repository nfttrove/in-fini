/**
 * The acoustic Casimir: radiation pressure from sound, side by side with
 * the vacuum Casimir force it mirrors.
 *
 * A sound wave carries momentum. The pressure it exerts on a surface is
 * the acoustic energy density
 *
 *   u = p²/(ρ c²)      [Pa]
 *
 * with p the RMS acoustic pressure and ρc² the air's stiffness — the
 * exact structural analogue of the electromagnetic energy density whose
 * imbalance between two plates IS the vacuum Casimir effect. A perfect
 * absorber feels u; a reflector feels 2u (momentum reversal). Larraza &
 * Puttermann (1998) showed the deeper version: two plates in a diffuse
 * acoustic field attract by excluding sound modes between them — a
 * laboratory-scale Casimir effect you can build for the price of a
 * speaker.
 *
 * The teaching point this panel exists to make: a speaker at the
 * threshold of pain pushes about as hard on a plate as empty space does
 * across a 100-nanometre gap.
 */

import { casimirForce } from "./physics";

export const RHO_AIR = 1.204; // kg/m³ at 20 °C
export const C_SOUND = 343; // m/s at 20 °C
export const G = 9.80665;

/** RMS acoustic pressure from an SPL in dB (re 20 µPa). */
export function splToPressurePa(splDb: number): number {
  return 2e-5 * Math.pow(10, splDb / 20);
}

/** Traveling-wave intensity [W/m²]. */
export function intensityWPerM2(pRmsPa: number): number {
  return (pRmsPa * pRmsPa) / (RHO_AIR * C_SOUND);
}

/** Radiation pressure on the plate [Pa]. */
export function radiationPressurePa(splDb: number, reflecting: boolean): number {
  const p = splToPressurePa(splDb);
  return ((reflecting ? 2 : 1) * p * p) / (RHO_AIR * C_SOUND * C_SOUND);
}

/** Force on the plate [N]. */
export function soundForceN(
  splDb: number,
  areaM2: number,
  reflecting: boolean
): number {
  return radiationPressurePa(splDb, reflecting) * areaM2;
}

/** Vacuum Casimir force magnitude on the same area at a given gap [N]. */
export function vacuumForceN(gapNm: number, areaM2: number): number {
  return Math.abs(casimirForce(gapNm * 1e-9, areaM2));
}

/** Gap [nm] at which the vacuum Casimir force equals the given force. */
export function equivalentVacuumGapNm(forceN: number, areaM2: number): number {
  if (forceN <= 0 || areaM2 <= 0) return Infinity;
  // F = (π²ħc/240)·A/d⁴  →  d = ((π²ħc/240)·A/F)^(1/4)
  const coeff = (Math.PI * Math.PI * 1.054571817e-34 * 299792458) / 240;
  return Math.pow((coeff * areaM2) / forceN, 0.25) * 1e9;
}

export interface ScaleVerdict {
  key: "invisible" | "jewelry" | "kitchen" | "hefty";
  label: string;
  description: string;
  tone: "amber" | "emerald" | "cyan";
}

/** What bathroom of instrumentation can see this force? */
export function scaleVerdict(forceN: number): ScaleVerdict {
  const mg = (forceN / G) * 1e6;
  if (mg < 1) {
    return {
      key: "invisible",
      label: "Below any household scale",
      description: `Equivalent to ${mg < 0.001 ? mg.toExponential(1) : mg.toFixed(2)} mg. Real, but you will need a laboratory balance or a clever null setup to see it.`,
      tone: "amber",
    };
  }
  if (mg < 100) {
    return {
      key: "jewelry",
      label: "Visible on a jewelry scale (0.001 g)",
      description: `About ${mg.toFixed(1)} mg of push. A €15 0.001 g scale next to the speaker will watch the needle move. This is a genuine kitchen-table field-fluctuation measurement.`,
      tone: "emerald",
    };
  }
  if (mg < 10000) {
    return {
      key: "kitchen",
      label: "Visible on a kitchen scale (0.1 g)",
      description: `About ${(mg / 1000).toFixed(2)} g of push — plainly visible. You are well into "hurt your ears" territory to get here; wear protection.`,
      tone: "cyan",
    };
  }
  return {
    key: "hefty",
    label: "Plainly physical",
    description: `About ${(mg / 1000).toFixed(1)} g of push. At this SPL the neighbors are the artifact channel.`,
    tone: "cyan",
  };
}
