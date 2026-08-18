import { describe, it, expect } from "vitest";
import {
  splToPressurePa,
  equivalentVacuumGapNm,
  intensityWPerM2,
  radiationPressurePa,
  soundForceN,
  vacuumForceN,
  scaleVerdict,
} from "./acousticCasimir";

describe("acoustic quantities", () => {
  it("converts SPL to pressure with the 20 µPa reference", () => {
    expect(splToPressurePa(0)).toBeCloseTo(2e-5, 20);
    expect(splToPressurePa(94)).toBeCloseTo(1, 1); // 1 Pa
    expect(splToPressurePa(120)).toBeCloseTo(20, 1);
    expect(splToPressurePa(140)).toBeCloseTo(200, 0);
  });

  it("gives 1 W/m² at 120 dB (the textbook value)", () => {
    expect(intensityWPerM2(splToPressurePa(120))).toBeCloseTo(1, 1);
  });

  it("radiation pressure matches energy density, doubled for reflectors", () => {
    const absorb = radiationPressurePa(120, false);
    const reflect = radiationPressurePa(120, true);
    expect(absorb).toBeCloseTo(2.8e-3, 1); // Pa — the textbook ~3 mPa
    expect(reflect).toBeCloseTo(2 * absorb, 12);
  });

  it("force scales linearly with area", () => {
    const a = soundForceN(120, 0.01, true);
    const b = soundForceN(120, 0.03, true);
    expect(b).toBeCloseTo(3 * a, 10);
  });
});

describe("the headline comparison", () => {
  it("a speaker at 120 dB over 100 cm² pushes in the milligram range", () => {
    const f = soundForceN(120, 0.01, true);
    const mg = (f / 9.80665) * 1e6;
    expect(mg).toBeGreaterThan(3);
    expect(mg).toBeLessThan(10);
    expect(scaleVerdict(f).key).toBe("jewelry");
  });

  it("…as hard as the vacuum Casimir at ≈700 nm on the same area", () => {
    const sound = soundForceN(120, 0.01, true);
    const gapNm = equivalentVacuumGapNm(sound, 0.01);
    expect(gapNm).toBeGreaterThan(600);
    expect(gapNm).toBeLessThan(800);
    // and the round trip: vacuum at that gap reproduces the sound force
    expect(vacuumForceN(gapNm, 0.01) / sound).toBeCloseTo(1, 6);
    // (the vacuum is stronger per unit anything: at 100 nm it dwarfs the speaker)
    expect(vacuumForceN(100, 0.01)).toBeGreaterThan(sound * 1000);
  });

  it("conversation levels are hopeless, as they should be", () => {
    const f = soundForceN(60, 0.01, true);
    expect(scaleVerdict(f).key).toBe("invisible");
    expect(f).toBeLessThan(1e-9);
  });

  it("kitchen-scale forces need hearing-damage SPLs", () => {
    expect(scaleVerdict(soundForceN(150, 0.03, true)).key).not.toBe("invisible");
  });
});
