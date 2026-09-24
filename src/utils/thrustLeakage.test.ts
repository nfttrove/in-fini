import { describe, it, expect } from "vitest";
import {
  besselJ1,
  dceThrustLimitG,
  computeThrustBudget,
  verdictStability,
  ionWindForceG,
  ionWindCollisionalG,
  ionWindPressureLimitPa,
  thermalConvectionG,
  formatForceG,
  vibrationForceG,
  DEFAULT_DISCHARGE_AREA_M2,
  G,
  type ThrustParams,
} from "./thrustLeakage";
import { grams } from "./units";

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
    // limit at these parameters lands near 1.8e-16 g. A stray factor of c
    // (the ħc³ variant this gate was added against) returns ~5.3e-8 g —
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

describe("no duplicate channels (double-count regression)", () => {
  // The budget once listed "convection" and "buoyancy" as separate channels
  // with algebraically identical formulas — the same physics counted twice.
  // Found by the permutation sweep; this test keeps it dead.
  it("every channel is distinct across randomized parameters", () => {
    const ref = computeThrustBudget(base).channels;
    expect(ref.map((c) => c.key)).toEqual([
      "ionWind",
      "vibration",
      "electrostatic",
      "thermal",
    ]);
    for (let i = 0; i < 200; i++) {
      const jittered: ThrustParams = {
        ...base,
        driveVoltageV: 100 + Math.random() * 49000,
        ambientPressurePa: 100 + Math.random() * 101325,
        electrodeGapM: 1e-3 + Math.random() * 0.1,
        deviceMassKg: 0.01 + Math.random() * 5,
        vibrationAmpNm: 10 + Math.random() * 5000,
        vibrationFreqHz: 5 + Math.random() * 900,
        tempGradientKPerM: Math.random() * 20,
        deviceHeightM: 0.005 + Math.random() * 2,
        plateAreaM2: 0.0001 + Math.random(),
        electrostaticFieldVPerM: 100 + Math.random() * 1e6,
      };
      const ch = computeThrustBudget(jittered).channels;
      for (let a = 0; a < ch.length; a++) {
        for (let b = a + 1; b < ch.length; b++) {
          const rel =
            Math.abs(ch[a].valueG - ch[b].valueG) /
            Math.max(Math.abs(ch[a].valueG), Math.abs(ch[b].valueG), 1e-30);
          expect(rel).toBeGreaterThan(1e-6);
        }
      }
    }
  });
});

describe("verdictStability", () => {
  it("flags Podkletnov as boundary-sensitive under ±20% jitter", () => {
    // Parameters from the famous preset:
    const s = verdictStability(
      {
        claimedDeltaG: 2, driveVoltageV: 10000, ambientPressurePa: 101325,
        electrodeGapM: 0.03, deviceMassKg: 0.1, vibrationAmpNm: 1000,
        vibrationFreqHz: 50, tempGradientKPerM: 1, deviceHeightM: 0.15,
        plateAreaM2: 0.03, electrostaticFieldVPerM: 10000, cavityGap_nm: 100,
        rotorRadius_um: 50, modulationDepth_beta: 0.5, cavityQ: 10000,
        activeArea_cm2: 1, driveFrequency_Hz: 1e6,
      },
      { trials: 400 }
    );
    expect(s.boundary).toBe(true);
    expect(Object.keys(s.tally).length).toBeGreaterThan(1);
  });

  it("finds the charged-sphere preset rock-stable", () => {
    const s = verdictStability(
      {
        claimedDeltaG: 0.18, driveVoltageV: 50000, ambientPressurePa: 101325,
        electrodeGapM: 0.05, deviceMassKg: 0.5, vibrationAmpNm: 500,
        vibrationFreqHz: 30, tempGradientKPerM: 0.2, deviceHeightM: 0.15,
        plateAreaM2: 0.02, electrostaticFieldVPerM: 50000, cavityGap_nm: 100,
        rotorRadius_um: 50, modulationDepth_beta: 0.5, cavityQ: 10000,
        activeArea_cm2: 1, driveFrequency_Hz: 1e6,
      },
      { trials: 200 }
    );
    expect(s.boundary).toBe(false);
    expect(s.dominant).toBe("explained");
  });

  it("is deterministic per seed", () => {
    const p = {
      claimedDeltaG: 2, driveVoltageV: 10000, ambientPressurePa: 101325,
      electrodeGapM: 0.03, deviceMassKg: 0.1, vibrationAmpNm: 1000,
      vibrationFreqHz: 50, tempGradientKPerM: 1, deviceHeightM: 0.15,
      plateAreaM2: 0.03, electrostaticFieldVPerM: 10000, cavityGap_nm: 100,
      rotorRadius_um: 50, modulationDepth_beta: 0.5, cavityQ: 10000,
      activeArea_cm2: 1, driveFrequency_Hz: 1e6,
    };
    expect(verdictStability(p)).toEqual(verdictStability(p));
  });
});

describe("ionWindForceG — ions push air, so no air means no wind", () => {
  const V = 10_000;
  const d = 0.01;
  const atm = ionWindForceG(V, 101325, d);

  it("matches the space-charge-limited closed form 9/8·ε₀·(V/d)²·A at 1 atm", () => {
    const EPS0 = 8.854187817e-12;
    const expectedG = (((9 / 8) * EPS0 * (V / d) ** 2 * 1e-3) / G) * 1000;
    expect(atm / expectedG).toBeCloseTo(1, 4);
    // ~1 g at the panel defaults — the size real desktop corona rigs reach.
    expect(atm).toBeGreaterThan(0.5);
    expect(atm).toBeLessThan(2);
  });

  it("never grows as the pressure falls (the old μ ∝ 1/p form did, 10⁵× by 1 Pa)", () => {
    let prev = atm;
    for (let logP = 5; logP >= -6; logP -= 0.25) {
      const f = ionWindForceG(V, 10 ** logP, d);
      expect(f).toBeLessThanOrEqual(prev * (1 + 1e-12));
      prev = f;
    }
    expect(ionWindForceG(V, 1, d)).toBeLessThan(atm);
  });

  it("vanishes in hard vacuum and at zero pressure", () => {
    expect(ionWindForceG(V, 1e-6, d) / atm).toBeLessThan(1e-5);
    expect(ionWindForceG(V, 0, d)).toBe(0);
  });

  it("scales as V² at fixed pressure", () => {
    expect(ionWindForceG(2 * V, 50, d) / ionWindForceG(V, 50, d)).toBeCloseTo(4, 9);
  });

  it("the pressure limit feeds back to exactly the allowance", () => {
    const allow = atm / 40;
    const pMax = ionWindPressureLimitPa(allow, V, d);
    expect(pMax).toBeGreaterThan(0);
    expect(pMax).toBeLessThan(101325);
    expect(ionWindForceG(V, pMax, d)).toBeCloseTo(allow, 9);
  });

  it("needs no pumping when the collisional limit is already within the allowance", () => {
    expect(ionWindPressureLimitPa(2 * ionWindCollisionalG(V, d), V, d)).toBe(Infinity);
  });

  it("drops out of the thrust budget in hard vacuum", () => {
    const p: ThrustParams = { ...base, driveVoltageV: V, electrodeGapM: d };
    const ion = (pa: number) =>
      computeThrustBudget({ ...p, ambientPressurePa: pa }).channels.find((c) => c.key === "ionWind")!.valueG;
    expect(ion(101325)).toBeCloseTo(atm, 12);
    expect(ion(1e-6)).toBeLessThan(atm * 1e-5);
  });
});

describe("thermalConvectionG — buoyancy needs air", () => {
  it("is unchanged at 1 atm and scales with pressure (air density)", () => {
    const atm = thermalConvectionG(2, 0.1, 0.01);
    expect(thermalConvectionG(2, 0.1, 0.01, 101325)).toBe(atm);
    expect(thermalConvectionG(2, 0.1, 0.01, 101325 / 10) / atm).toBeCloseTo(0.1, 12);
    expect(thermalConvectionG(2, 0.1, 0.01, 1e-6) / atm).toBeLessThan(1e-10);
  });
});

describe("formatForceG", () => {
  it("never rounds a real sub-picogram force to zero", () => {
    // The DCE thrust ceiling (~1e-20 g) used to print as "0.00 pg".
    expect(formatForceG(grams(1.2e-20))).toBe("1.20e-20 g");
    expect(formatForceG(grams(5e-12))).toBe("5.00 pg");
  });
});

describe("user-set model knobs: discharge area and rectified share", () => {
  const p: ThrustParams = {
    ...base,
    driveVoltageV: 10_000,
    electrodeGapM: 0.01,
    ambientPressurePa: 101325,
    deviceMassKg: 0.1,
    vibrationAmpNm: 100,
    vibrationFreqHz: 100,
  };
  const ch = (q: ThrustParams, key: string) =>
    computeThrustBudget(q).channels.find((c) => c.key === key)!.valueG;

  it("absent knobs reproduce the explicit defaults exactly (presets, permalinks, filings)", () => {
    const explicit = { ...p, dischargeAreaM2: DEFAULT_DISCHARGE_AREA_M2, vibrationRectification: 1 };
    expect(computeThrustBudget(p)).toEqual(computeThrustBudget(explicit));
  });

  it("ion wind scales linearly with the discharge area", () => {
    expect(ch({ ...p, dischargeAreaM2: 1e-2 }, "ionWind") / ch(p, "ionWind")).toBeCloseTo(10, 9);
    expect(ionWindForceG(1e4, 101325, 0.01, 0)).toBe(0);
  });

  it("vibration scales with the rectified share, clamped to 0–1", () => {
    const full = ch(p, "vibration");
    expect(ch({ ...p, vibrationRectification: 0.25 }, "vibration") / full).toBeCloseTo(0.25, 12);
    expect(ch({ ...p, vibrationRectification: 0 }, "vibration")).toBe(0);
    expect(vibrationForceG(0.1, 100, 100, 1.7)).toBe(vibrationForceG(0.1, 100, 100, 1));
    expect(vibrationForceG(0.1, 100, 100, -1)).toBe(0);
  });

  it("labels the vibration channel as the upper bound only at share 1", () => {
    const label = (r: number) =>
      computeThrustBudget({ ...p, vibrationRectification: r }).channels.find((c) => c.key === "vibration")!.label;
    expect(label(1)).toContain("upper bound");
    expect(label(0.5)).not.toContain("upper bound");
  });
});
