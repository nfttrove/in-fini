import { describe, it, expect } from "vitest";
import { jouleW, rfLeakageW, blackbodyW, mechanicalW, energyBalance, computeBudget, type LeakageParams } from "./leakage";

describe("jouleW", () => {
  it("is I²R", () => {
    expect(jouleW(0.1, 0.1)).toBeCloseTo(1e-3, 12);
    expect(jouleW(0, 100)).toBe(0);
  });
});

describe("rfLeakageW", () => {
  it("attenuates drive power by 10^(−S/10)", () => {
    // ½·10²/50 = 1 W of drive, 40 dB shielding → 1e-4 W leaks.
    expect(rfLeakageW(10, 50, 40)).toBeCloseTo(1e-4, 10);
  });

  it("returns 0 for non-positive source impedance", () => {
    expect(rfLeakageW(10, 0, 40)).toBe(0);
  });
});

describe("blackbodyW", () => {
  it("matches σ(T_h⁴ − T_c⁴): ~680 W for 1 m², ε=1, 373 K vs 293 K", () => {
    const w = blackbodyW(1, 1, 373, 293);
    expect(Math.abs(w / 679.7 - 1)).toBeLessThan(0.01);
  });

  it("clamps to zero when the cold side is hotter", () => {
    expect(blackbodyW(1, 1, 293, 373)).toBe(0);
  });
});

describe("mechanicalW — sustaining power of a driven resonator", () => {
  it("satisfies the Q definition: P = ω·E_stored/Q", () => {
    const m = 1e-9,
      ampNm = 1,
      f = 5e5,
      Q = 1e4;
    const omega = 2 * Math.PI * f;
    const storedE = 0.5 * m * Math.pow(omega * ampNm * 1e-9, 2);
    const P = mechanicalW(m, ampNm, f, Q);
    // The pre-fix ω/(2πQ) denominator understated this by 2π.
    expect((P * Q) / omega).toBeCloseTo(storedE, 20);
    expect(P).toBeCloseTo(1.55e-12, 13);
  });

  it("returns 0 for non-positive Q", () => {
    expect(mechanicalW(1e-9, 1, 5e5, 0)).toBe(0);
  });
});

describe("energyBalance — does the output even exceed the input?", () => {
  const P: LeakageParams = {
    pClaimW: 1.3, vDriveV: 10, rDriveOhm: 50, shieldDb: 40, iBiasA: 0.1, rResOhm: 0.1,
    tHotK: 350, tColdK: 300, aRadM2: 1e-4, emissivity: 0.9,
    rotorMassKg: 1e-9, rotorAmpNm: 1, fmHz: 5e5, mechQ: 1e4,
  };

  it("counts the drive ½V²/R and the bias I²R as known input", () => {
    // The panel defaults: 10 V into 50 Ω is 1 W before anything leaks.
    const b = energyBalance(P);
    expect(b.inputW).toBeCloseTo(1 + 1e-3, 12);
    expect(b.ratio).toBeCloseTo(1.3 / 1.001, 12);
    expect(b.netExcessW).toBeCloseTo(0.299, 12);
    expect(b.key).toBe("exceeds-input");
  });

  it("calls a claim at or below the known input not over-unity", () => {
    expect(energyBalance({ ...P, pClaimW: 0.9 }).key).toBe("within-input");
    expect(energyBalance({ ...P, pClaimW: 1.001 }).key).toBe("within-input");
  });

  it("has no drive term without a drive resistance, and an infinite ratio with no input", () => {
    const b = energyBalance({ ...P, rDriveOhm: 0, iBiasA: 0 });
    expect(b.inputW).toBe(0);
    expect(b.ratio).toBe(Infinity);
    expect(b.key).toBe("exceeds-input");
  });
});

describe("classifyVerdict — leakage above the claim", () => {
  // 10 V into 50 Ω with no shield leaks 1 W of RF; every other channel off.
  const over: LeakageParams = {
    pClaimW: 0.5, vDriveV: 10, rDriveOhm: 50, shieldDb: 0, iBiasA: 0, rResOhm: 0,
    tHotK: 300, tColdK: 300, emissivity: 0.1, aRadM2: 1e-4,
    rotorMassKg: 0, rotorAmpNm: 0, fmHz: 5e5, mechQ: 1e4,
  };

  it("is explained, not a red 'gross excess', when leakage exceeds the claim", () => {
    // It once fell through every branch to "exceeds every plausible leakage
    // channel by many orders of magnitude" while the σ line said "Within budget".
    const b = computeBudget(over);
    expect(b.totalLeakageW).toBeGreaterThan(2 * b.claimedW - 1e-9);
    expect(b.verdict.key).toBe("explained");
    expect(b.sigmaAssessment.key).toBe("explained");
  });

  it("still calls a claim far above leakage a gross excess", () => {
    expect(computeBudget({ ...over, pClaimW: 1e7 }).verdict.key).toBe("gross-excess");
  });
});

describe("classifyVerdict — sub-nanowatt claims", () => {
  const quiet: LeakageParams = {
    pClaimW: 1e-10, vDriveV: 1, rDriveOhm: 50, shieldDb: 60, iBiasA: 0, rResOhm: 0,
    tHotK: 300, tColdK: 300, emissivity: 0.1, aRadM2: 1e-4,
    rotorMassKg: 0, rotorAmpNm: 0, fmHz: 5e5, mechQ: 1e4,
  };

  it("reads explained when leakage buries a tiny claim, not 'near the leakage floor'", () => {
    const b = computeBudget(quiet);
    expect(b.totalLeakageW).toBeGreaterThan(100 * b.claimedW);
    expect(b.verdict.key).toBe("explained");
  });

  it("keeps the sub-nanowatt verdict for a claim just above the leakage", () => {
    // 120 dB of shielding leaves the ~1 pW baseline.
    const leak = computeBudget({ ...quiet, shieldDb: 120 }).totalLeakageW;
    expect(leak).toBeLessThan(1e-11);
    const b = computeBudget({ ...quiet, shieldDb: 120, pClaimW: 3 * leak });
    expect(b.verdict.label).toBe("Sub-nanowatt, near the leakage floor");
  });
});
