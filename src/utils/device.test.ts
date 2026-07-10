import { describe, it, expect } from "vitest";
import { predictDevice, type DeviceParams } from "./device";

// The panel's default settings — also the parameters of the "1.3 W at
// 50 nm, 500 kHz" claim the device tab is built to test.
const base: DeviceParams = {
  dNm: 50,
  fmHz: 5e5,
  beta: 0.3,
  rotorRadiusNm: 50,
  Q: 10000,
  areaMm2: 1,
};

describe("predictDevice — the DCE ceiling is watts-scale, not watts×c", () => {
  it("predicts a sub-nanowatt output at the claim's own parameters", () => {
    // With P_DCE = ħc²/d⁴ · (v/c)² · A the prediction at the defaults is
    // ~1.8e-14 W (shortfall ~7e13 vs the 1.3 W claim — matching the ≳10¹⁰
    // narrative in DeviceNotes). The ħc³ variant returned ~5.5e-6 W and a
    // shortfall of only ~2e5, contradicting the panel's own copy.
    const p = predictDevice(base);
    expect(p.P_output).toBeGreaterThan(0);
    expect(p.P_output).toBeLessThan(1e-9);
    expect(p.shortfall).toBeGreaterThan(1e10);
  });

  it("keeps shortfall consistent with claimed/predicted", () => {
    const p = predictDevice(base);
    expect(p.shortfall * p.P_output).toBeCloseTo(p.claimedW, 9);
  });

  it("computes the cavity fundamental f0 = c/2d", () => {
    const p = predictDevice({ ...base, dNm: 100 });
    expect(p.f0Hz / 1e15).toBeCloseTo(1.49896, 4);
  });

  it("scales as rotor radius squared (r enters only through v)", () => {
    const one = predictDevice({ ...base, rotorRadiusNm: 50 });
    const two = predictDevice({ ...base, rotorRadiusNm: 100 });
    expect(two.P_output / one.P_output).toBeCloseTo(4, 9);
  });

  it("is linear in area", () => {
    const one = predictDevice({ ...base, areaMm2: 1 });
    const three = predictDevice({ ...base, areaMm2: 3 });
    expect(three.P_output / one.P_output).toBeCloseTo(3, 9);
  });
});
