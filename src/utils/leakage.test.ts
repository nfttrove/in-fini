import { describe, it, expect } from "vitest";
import { jouleW, rfLeakageW, blackbodyW, mechanicalW } from "./leakage";

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
