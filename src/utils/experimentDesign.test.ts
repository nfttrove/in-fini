import { describe, it, expect } from "vitest";
import {
  thrustRequirements,
  powerRequirements,
  ThrustDesignContext,
  PowerDesignContext,
} from "./experimentDesign";
import {
  ionWindForceG,
  vibrationForceG,
  electrostaticForceG,
  thermalConvectionG,
} from "./thrustLeakage";
import { jouleW, rfLeakageW, blackbodyW } from "./leakage";

const TCTX: ThrustDesignContext = {
  claimedDeltaG: 0.5,
  k: 2,
  driveVoltageV: 10000,
  electrodeGapM: 0.01,
  deviceMassKg: 0.1,
  deviceHeightM: 0.1,
  vibrationFreqHz: 100,
  vibrationAmpNm: 100,
  plateAreaM2: 0.01,
  ambientPressurePa: 101325,
  tempGradKPerM: 2,
};

const PCTX: PowerDesignContext = {
  claimedW: 1.3,
  k: 2,
  vDriveV: 10,
  rDriveOhm: 50,
  shieldDb: 40,
  iBiasA: 0.1,
  rResOhm: 0.1,
  tColdK: 300,
  aRadM2: 1e-4,
  emissivity: 0.9,
  tHotK: 350,
};

describe("thrustRequirements (round-trip against the real channels)", () => {
  const res = thrustRequirements(TCTX);
  const byKey = Object.fromEntries(res.requirements.map((r) => [r.key, r]));

  it("splits the claim across channels in quadrature", () => {
    expect(res.sigmaPerChannel).toBeCloseTo(
      TCTX.claimedDeltaG / (2 * Math.sqrt(5)),
      10
    );
  });

  it("vibration limit feeds back to exactly the allowance", () => {
    const v = vibrationForceG(
      TCTX.deviceMassKg,
      byKey.vibration.value,
      TCTX.vibrationFreqHz
    );
    expect(v).toBeCloseTo(res.sigmaPerChannel, 6);
  });

  it("ion-wind voltage limit feeds back to exactly the allowance", () => {
    const v = ionWindForceG(
      byKey["ion-wind"].value,
      TCTX.ambientPressurePa,
      TCTX.electrodeGapM
    );
    expect(v).toBeCloseTo(res.sigmaPerChannel, 6);
  });

  it("electrostatic field limit feeds back to exactly the allowance", () => {
    const v = electrostaticForceG(byKey.electrostatic.value, TCTX.plateAreaM2);
    expect(v).toBeCloseTo(res.sigmaPerChannel, 6);
  });

  it("thermal gradient limit feeds back to exactly the allowance", () => {
    const v = thermalConvectionG(
      byKey.thermal.value,
      TCTX.deviceHeightM,
      TCTX.plateAreaM2
    );
    expect(v).toBeCloseTo(res.sigmaPerChannel, 6);
  });

  it("tightens requirements when the claim shrinks", () => {
    const tighter = thrustRequirements({ ...TCTX, claimedDeltaG: 0.05 });
    expect(tighter.requirements[0].value).toBeLessThan(byKey.vibration.value);
  });
});

describe("powerRequirements (round-trip against the real channels)", () => {
  const res = powerRequirements(PCTX);
  const byKey = Object.fromEntries(res.requirements.map((r) => [r.key, r]));

  it("bias current limit feeds back to exactly the allowance", () => {
    const p = jouleW(byKey.joule.value, PCTX.rResOhm);
    expect(p).toBeCloseTo(res.sigmaPerChannel, 6);
  });

  it("shielding minimum feeds back to exactly the allowance", () => {
    const p = rfLeakageW(PCTX.vDriveV, PCTX.rDriveOhm, byKey.rf.value);
    expect(p).toBeCloseTo(res.sigmaPerChannel, 6);
  });

  it("hot-side temperature limit feeds back to exactly the allowance", () => {
    const p = blackbodyW(
      PCTX.emissivity,
      PCTX.aRadM2,
      byKey.blackbody.value,
      PCTX.tColdK
    );
    expect(p).toBeCloseTo(res.sigmaPerChannel, 6);
  });

  it("demands more shielding for a smaller claim", () => {
    const tighter = powerRequirements({ ...PCTX, claimedW: 0.013 });
    expect(tighter.requirements.find((r) => r.key === "rf")!.value).toBeGreaterThan(
      byKey.rf.value
    );
  });
});
