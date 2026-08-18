/**
 * Dark Corners: the 95% of the universe your desk cannot see — computed
 * next to the parts it can.
 *
 * Everything here uses measured, published values (Planck 2018 cosmology,
 * standard halo model) with the assumptions stated in comments. No
 * speculation is arithmetic: the speculation is clearly labeled as such
 * and lives in the panel's prose, not in these numbers.
 */

export const HBAR = 1.054571817e-34;
export const C = 2.99792458e8;
export const G_ACC = 9.80665;
export const EV_J = 1.602176634e-19;

/** Observed dark-energy density [J/m³] (Planck 2018: Ω_Λ ≈ 0.69 of ρ_crit). */
export const RHO_DARK_ENERGY_J = 5.4e-10;

/** Local dark-matter density, standard halo model [kg/m³] (0.3 GeV/cm³). */
export const RHO_DM = 0.3 * EV_J * 1e9 / (C * C) * 1e6;

/** Galactic circular speed [m/s] (local halo velocity scale). */
export const V_HALO = 2.2e5;

/** Cosmological constant [m⁻²] (Planck 2018). */
export const LAMBDA = 1.1056e-52;

// ---------------------------------------------------------------------------
// 1. The 10^120 problem: QFT vacuum density vs the observed one
// ---------------------------------------------------------------------------

export interface CutoffOption {
  key: string;
  label: string;
  energyGeV: number;
  note: string;
}

export const CUTOFFS: CutoffOption[] = [
  { key: "planck", label: "Planck scale", energyGeV: 1.22e19, note: "where gravity quantizes — the theory's honest endpoint" },
  { key: "gut", label: "GUT scale", energyGeV: 1e16, note: "grand unification territory" },
  { key: "ew", label: "Electroweak", energyGeV: 1e3, note: "the last scale we have actually probed" },
  { key: "qcd", label: "QCD scale", energyGeV: 0.2, note: "hadron physics — the most conservative cutoff imaginable" },
];

/**
 * Zero-point energy density below a cutoff, ρ = E⁴/(16π²ħ³c³) — the
 * textbook sum-over-modes integral. This is the infamous prediction that
 * overshoots the observed vacuum density by 40–120 orders of magnitude
 * depending on where you stop believing the theory.
 */
export function qftVacuumDensityJ(energyGeV: number): number {
  const E = energyGeV * EV_J * 1e9;
  return Math.pow(E, 4) / (16 * Math.PI * Math.PI * Math.pow(HBAR * C, 3));
}

/** The overshoot factor for a given cutoff. */
export function vacuumOvershoot(energyGeV: number): number {
  return qftVacuumDensityJ(energyGeV) / RHO_DARK_ENERGY_J;
}

/**
 * Casimir energy density between plates at gap d [J/m³]:
 * ρ = π²ħc/(720 d⁴) — the same zero-point sum, this time *measured*.
 */
export function casimirDensityJ(gapNm: number): number {
  const d = gapNm * 1e-9;
  return (Math.PI * Math.PI * HBAR * C) / (720 * Math.pow(d, 4));
}

// ---------------------------------------------------------------------------
// 2. Dark matter through your desk
// ---------------------------------------------------------------------------

export interface DarkMatterFlux {
  /** kg per m² per day drifting through. */
  kgPerDayPerM2: number;
  /** particles per second per m², assuming ~100 GeV per particle. */
  particlesPerSecondPerM2: number;
  /** number density [1/m³] at ~100 GeV each. */
  numberDensity: number;
  /** Momentum flux ρ·v² [Pa] the stream WOULD exert if fully absorbed.
   *   ≈ 2.6e-11 Pa — a million times fainter than the quietest audible
   *   sound, and it does not even do that. */
  hypotheticalPressurePa: number;
}

export function darkMatterFlux(): DarkMatterFlux {
  const massPerParticle = 100 * EV_J * 1e9 / (C * C); // ≈ 1.78e-25 kg
  const numberDensity = RHO_DM / massPerParticle;
  const massFlux = RHO_DM * V_HALO; // kg/(m²·s)
  return {
    kgPerDayPerM2: massFlux * 86400,
    particlesPerSecondPerM2: numberDensity * V_HALO,
    numberDensity,
    hypotheticalPressurePa: massFlux * V_HALO, // momentum flux if fully absorbed
  };
}

// ---------------------------------------------------------------------------
// 3. Dark energy's tidal pull across your desk
// ---------------------------------------------------------------------------

/**
 * The differential acceleration dark energy induces between two points
 * separated by r: a = Λc²r/3. This is the universe's expansion acting on
 * desk scales — and it is the smallest number this app computes.
 */
export function darkEnergyTide(rMeters: number): number {
  return (LAMBDA * C * C * rMeters) / 3;
}

export interface DeskVerdict {
  key: "thermal-floored" | "jewelry" | "kitchen";
  label: string;
  description: string;
}

/** Compare an acceleration to what instruments can do. */
export function accelerationVerdict(a: number): DeskVerdict {
  const mg = a / G_ACC * 1e6;
  if (mg < 1e-9) {
    return {
      key: "thermal-floored",
      label: "Unwitnessable by matter",
      description: `${a.toExponential(1)} m/s² — ${(1 / (a / 1e-9)).toExponential(0)}× below the Brownian floor of the quietest rig the Experiment Design tab can imagine. Only the universe as a whole can run this experiment; telescopes are the instrument.`,
    };
  }
  if (mg < 1) {
    return { key: "thermal-floored", label: "Below household scales", description: `Equivalent to ${mg.toExponential(1)} mg — real, but laboratory-balance territory.` };
  }
  return { key: "kitchen", label: "Desk-measurable", description: `About ${mg.toFixed(1)} mg-equivalent — your desk can see this.` };
}
