import { describe, it, expect } from "vitest";
import {
  thermalForceFloorN,
  thermalFloorDeltaG,
  thermalPositionNoiseM,
  thermalPowerFloorW,
  assessDecidability,
  ThermalFloorParams,
} from "./thermalFloor";

const BASE: ThermalFloorParams = {
  massKg: 0.1,
  freqHz: 100,
  qualityFactor: 100,
  tempK: 300,
  integrationS: 100,
};

describe("thermal floor scaling", () => {
  it("improves as √τ with longer integration", () => {
    const a = thermalForceFloorN(BASE);
    const b = thermalForceFloorN({ ...BASE, integrationS: 400 });
    expect(b).toBeCloseTo(a / 2, 10);
  });

  it("improves as √T with cooling", () => {
    const a = thermalForceFloorN(BASE);
    const b = thermalForceFloorN({ ...BASE, tempK: 3 });
    expect(b).toBeCloseTo(a / 10, 10);
  });

  it("position noise matches equipartition", () => {
    const x = thermalPositionNoiseM(BASE);
    // sqrt(kT/(mω²)) = sqrt(4.14e-21 / (0.1·(2π·100)²)) ≈ 3.24e-13 m
    expect(x).toBeCloseTo(3.24e-13, 14);
  });

  it("power floor is one kT per measurement", () => {
    expect(thermalPowerFloorW(300, 1)).toBeCloseTo(4.14e-21, 2);
  });
});

describe("assessDecidability", () => {
  it("calls ordinary claims decidable with a big margin", () => {
    const r = assessDecidability(0.1, BASE); // 0.1 milli-g vs ~1e-9 floor
    expect(r.verdict.key).toBe("comfortable");
    expect(r.ratio).toBeGreaterThan(1e4);
  });

  it("finds the sub-thermal wall for tiny claims", () => {
    const r = assessDecidability(1e-12, BASE);
    expect(r.verdict.key).toBe("sub-thermal");
    expect(r.verdict.requiredTempK).not.toBeNull();
    // Cooling needed scales as ratio² — here below the CMB.
    expect(r.verdict.requiredTempK!).toBeLessThan(2.7);
  });

  it("has a marginal band between 1× and 100× of the floor", () => {
    const floorG = thermalFloorDeltaG(BASE);
    const r = assessDecidability(floorG * 10, BASE);
    expect(r.verdict.key).toBe("marginal");
  });

  it("required temperature really would restore decidability", () => {
    const r = assessDecidability(1e-12, BASE);
    const cooled = assessDecidability(1e-12, { ...BASE, tempK: r.verdict.requiredTempK! });
    expect(cooled.ratio).toBeCloseTo(1, 1);
  });
});
