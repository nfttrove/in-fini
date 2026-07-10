import { describe, it, expect } from "vitest";
import { besselJ1, dceThrustLimitG, type ThrustParams } from "./thrustLeakage";

const base: ThrustParams = {
  claimedDeltaG: 0,
  driveVoltageV: 0,
  ambientPressurePa: 0,
  electrodeGapM: 1e-3,
  deviceMassKg: 0.1,
  vibrationAmpNm: 0,
  vibrationFreqHz: 0,
  tempGradientKPerM: 0,
  deviceHeightM: 0.05,
  plateAreaM2: 1e-4,
  electrostaticFieldVPerM: 0,
  cavityGap_nm: 100,
  rotorRadius_um: 10,
  modulationDepth_beta: 0.1,
  cavityQ: 1000,
  activeArea_cm2: 1,
  driveFrequency_Hz: 1e9,
};

describe("besselJ1 (cylindrical Bessel J₁)", () => {
  // Reference values from standard tables / numerical integration of
  // J₁(x) = (1/π) ∫₀^π cos(x sin t − t) dt.
  it.each([
    [0, 0],
    [0.1, 0.049937526],
    [1, 0.440050586],
    [2, 0.576724808],
    [3, 0.339058959],
    [5, -0.327579138],
    [10, 0.043472746],
  ])("matches the reference at x=%f", (x, expected) => {
    expect(besselJ1(x)).toBeCloseTo(expected, 6);
  });

  it("is odd: J₁(−x) = −J₁(x)", () => {
    expect(besselJ1(-2.7)).toBeCloseTo(-besselJ1(2.7), 12);
  });

  it("is continuous across the x=3 approximation seam", () => {
    const jump = Math.abs(besselJ1(3 + 1e-6) - besselJ1(3 - 1e-6));
    expect(jump).toBeLessThan(1e-5);
  });

  it("is continuous at x=0.1 (the old code jumped ~30× here)", () => {
    const jump = Math.abs(besselJ1(0.1 + 1e-6) - besselJ1(0.1 - 1e-6));
    expect(jump).toBeLessThan(1e-5);
  });
});

describe("dceThrustLimitG — no spurious step at β=0.1", () => {
  it("varies smoothly as β crosses 0.1", () => {
    const below = dceThrustLimitG({ ...base, modulationDepth_beta: 0.0999 });
    const above = dceThrustLimitG({ ...base, modulationDepth_beta: 0.1001 });
    // Old code produced a ~900× cliff here; the two sides must now be close.
    const ratio = below === 0 ? 1 : above / below;
    expect(ratio).toBeGreaterThan(0.9);
    expect(ratio).toBeLessThan(1.1);
  });
});

describe("dceThrustLimitG — the ceiling is watts-scale, not watts×c", () => {
  it("is astronomically small at the reference parameters", () => {
    // With the dimensionally consistent ceiling P ≤ ħc²/d⁴ · (v/c)² · A the
    // limit at these parameters lands near 1.8e-16 mg. A stray factor of c
    // (the ħc³ variant this gate was added against) returns ~5.3e-8 mg —
    // four orders of magnitude above this threshold.
    const limit = dceThrustLimitG(base);
    expect(limit).toBeGreaterThan(0);
    expect(limit).toBeLessThan(1e-12);
  });

  it("scales as rotor radius squared (r enters only through (v/c)²)", () => {
    const one = dceThrustLimitG({ ...base, rotorRadius_um: 10 });
    const two = dceThrustLimitG({ ...base, rotorRadius_um: 20 });
    expect(two / one).toBeCloseTo(4, 9);
  });

  it("is linear in active area", () => {
    const one = dceThrustLimitG({ ...base, activeArea_cm2: 1 });
    const three = dceThrustLimitG({ ...base, activeArea_cm2: 3 });
    expect(three / one).toBeCloseTo(3, 9);
  });

  it("returns 0 for non-positive gap, frequency, or area", () => {
    expect(dceThrustLimitG({ ...base, cavityGap_nm: 0 })).toBe(0);
    expect(dceThrustLimitG({ ...base, driveFrequency_Hz: 0 })).toBe(0);
    expect(dceThrustLimitG({ ...base, activeArea_cm2: 0 })).toBe(0);
  });
});
