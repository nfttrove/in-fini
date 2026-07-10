import { describe, it, expect } from "vitest";
import {
  casimirPressure,
  casimirForce,
  cavityResonantFrequency,
  cavityQualityFactor,
} from "./physics";

describe("casimirPressure", () => {
  it("matches the textbook benchmark: |P| ≈ 1.3 mPa at d = 1 µm", () => {
    const P = casimirPressure(1e-6);
    expect(P).toBeLessThan(0); // attractive
    expect(Math.abs(P) * 1e3).toBeCloseTo(1.3, 2);
  });

  it("scales as 1/d⁴", () => {
    const ratio = casimirPressure(1e-6) / casimirPressure(2e-6);
    expect(ratio).toBeCloseTo(16, 9);
  });

  it("casimirForce = pressure × area", () => {
    expect(casimirForce(1e-6, 1e-4)).toBeCloseTo(casimirPressure(1e-6) * 1e-4, 12);
  });
});

describe("cavityResonantFrequency — f_n = nc/(2L), in Hz", () => {
  it("gives ~500 MHz for the fundamental of a 0.3 m cavity", () => {
    // c/(2·0.3 m) = 499.65 MHz. The pre-fix nπc/L returned the angular
    // frequency (2π× this) while every consumer displayed it as Hz.
    expect(cavityResonantFrequency(0.3, 1) / 1e6).toBeCloseTo(499.654, 2);
  });

  it("is linear in mode number", () => {
    const f1 = cavityResonantFrequency(0.5, 1);
    const f3 = cavityResonantFrequency(0.5, 3);
    expect(f3 / f1).toBeCloseTo(3, 9);
  });
});

describe("cavityQualityFactor (normalized Lorentzian response)", () => {
  it("is 1 exactly on resonance", () => {
    expect(cavityQualityFactor(5e8, 5e8, 1000)).toBe(1);
  });

  it("falls to 1/√2 at half a linewidth of detuning", () => {
    const f0 = 5e8;
    const Q = 1000;
    const gamma = f0 / Q;
    expect(cavityQualityFactor(f0 + gamma / 2, f0, Q)).toBeCloseTo(1 / Math.SQRT2, 9);
  });
});
