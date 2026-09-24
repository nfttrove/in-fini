import { describe, it, expect } from "vitest";
import {
  requirementStatus,
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
      TCTX.claimedDeltaG / (2 * Math.sqrt(4)),
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
      TCTX.plateAreaM2,
      TCTX.ambientPressurePa
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

describe("requirement ratio — compare the number, not its rounded label", () => {
  it("a limit 0.13% short of today's value is unmet even though the label rounds to 1.0e+0", () => {
    // Reachable slider state found by review: claim 10^-1.1 g, 1.4 kV.
    const res = thrustRequirements({ ...TCTX, claimedDeltaG: 10 ** -1.1, driveVoltageV: 1400 });
    const ion = res.requirements.find((r) => r.key === "ion-wind")!;
    expect(ion.asFractionOfReference).toBe("1.0e+0× current");
    expect(ion.ratio).not.toBeNull();
    expect(ion.ratio!).toBeLessThan(1);
    expect(ion.ratio!).toBeCloseTo(ion.value / 1400, 12);
  });

  it("the panel's status text calls it unmet, with enough digits to show why", () => {
    const res = thrustRequirements({ ...TCTX, claimedDeltaG: 10 ** -1.1, driveVoltageV: 1400 });
    const st = requirementStatus(res.requirements.find((r) => r.key === "ion-wind")!);
    expect(st.met).toBe(false);
    expect(st.text).toMatch(/^need 9\.9\d\de-1× today's value$/);
  });

  it("met limits show headroom; absolute limits say so", () => {
    const res = thrustRequirements(TCTX);
    const thermal = requirementStatus(res.requirements.find((r) => r.key === "thermal")!);
    expect(thermal.met).toBe(true);
    expect(thermal.text).toMatch(/already satisfies this \([\d.]+e[+-]\d+× headroom\)/);
    expect(requirementStatus(res.requirements.find((r) => r.key === "electrostatic")!).text).toBe("absolute requirement");
  });

  it("is null only for absolute limits", () => {
    for (const r of thrustRequirements(TCTX).requirements) {
      expect(r.ratio === null).toBe(r.key === "electrostatic");
    }
  });
});
