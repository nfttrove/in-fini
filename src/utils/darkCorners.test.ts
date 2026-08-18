import { describe, it, expect } from "vitest";
import {
  qftVacuumDensityJ,
  vacuumOvershoot,
  casimirDensityJ,
  darkMatterFlux,
  darkEnergyTide,
  accelerationVerdict,
  RHO_DARK_ENERGY_J,
} from "./darkCorners";

describe("the 10^120 problem", () => {
  it("overshoots by ~10¹²¹ at the Planck cutoff, ~10⁴² at QCD", () => {
    const planck = vacuumOvershoot(1.22e19);
    const qcd = vacuumOvershoot(0.2);
    expect(Math.log10(planck)).toBeGreaterThan(120);
    expect(Math.log10(planck)).toBeLessThan(124);
    expect(Math.log10(qcd)).toBeGreaterThan(41);
    expect(Math.log10(qcd)).toBeLessThan(45);
  });

  it("shrinks with the cutoff, but never remotely closes", () => {
    const a = vacuumOvershoot(1e3);
    const b = vacuumOvershoot(0.2);
    expect(b).toBeLessThan(a);
    expect(b).toBeGreaterThan(1e40); // even the most conservative cutoff fails
  });

  it("matches the canonical Planck-scale magnitude", () => {
    // ρ_Planck ≈ 4.6e113 J/m³ is the textbook figure
    const rho = qftVacuumDensityJ(1.22e19);
    expect(Math.log10(rho)).toBeGreaterThan(110);
    expect(Math.log10(rho)).toBeLessThan(116);
  });

  it("a 100 nm Casimir gap rewrites the vacuum ~10⁹× harder than the cosmos", () => {
    const local = casimirDensityJ(100);
    expect(local).toBeGreaterThan(0.1); // ~0.43 J/m³
    const ratio = local / RHO_DARK_ENERGY_J;
    expect(Math.log10(ratio)).toBeGreaterThan(8);
    expect(Math.log10(ratio)).toBeLessThan(10);
  });

  it("Casimir density follows the 1/d⁴ scaling", () => {
    expect(casimirDensityJ(200)).toBeCloseTo(casimirDensityJ(100) / 16, 10);
  });
});

describe("dark matter through the desk", () => {
  const f = darkMatterFlux();

  it("gives the coffee-cup number density (~3 per litre)", () => {
    expect(f.numberDensity).toBeGreaterThan(1000); // per m³
    expect(f.numberDensity).toBeLessThan(6000);
  });

  it("drifts through at ~10 nanograms per m² per day", () => {
    expect(f.kgPerDayPerM2).toBeGreaterThan(5e-12);
    expect(f.kgPerDayPerM2).toBeLessThan(2e-11);
  });

  it("would still be unfelt even if it interacted perfectly", () => {
    // ρ·v² ≈ 2.6e-11 Pa — below the threshold of hearing by ~10⁶,
    // and real dark matter does not interact even that much.
    expect(f.hypotheticalPressurePa).toBeGreaterThan(1e-12);
    expect(f.hypotheticalPressurePa).toBeLessThan(1e-10);
  });
});

describe("dark energy's tide across the desk", () => {
  it("is ~10⁻³⁶ m/s² across a metre", () => {
    const a = darkEnergyTide(1);
    expect(a).toBeGreaterThan(1e-37);
    expect(a).toBeLessThan(1e-35);
  });

  it("scales linearly with separation", () => {
    expect(darkEnergyTide(2)).toBeCloseTo(2 * darkEnergyTide(1), 20);
  });

  it("is unwitnessable by matter, by many orders", () => {
    const v = accelerationVerdict(darkEnergyTide(1));
    expect(v.key).toBe("thermal-floored");
    expect(v.description).toContain("telescopes");
  });
});
