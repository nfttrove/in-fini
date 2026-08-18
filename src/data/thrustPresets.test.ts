import { describe, it, expect } from "vitest";
import { THRUST_PRESETS } from "./thrustPresets";
import { ThrustParams } from "../utils/thrustLeakage";

const PARAM_KEYS: (keyof ThrustParams)[] = [
  "claimedDeltaG",
  "driveVoltageV",
  "ambientPressurePa",
  "electrodeGapM",
  "deviceMassKg",
  "vibrationAmpNm",
  "vibrationFreqHz",
  "tempGradientKPerM",
  "deviceHeightM",
  "plateAreaM2",
  "electrostaticFieldVPerM",
  "cavityGap_nm",
  "rotorRadius_um",
  "modulationDepth_beta",
  "cavityQ",
  "activeArea_cm2",
  "driveFrequency_Hz",
];

describe("built-in thrust presets (offline fallback data)", () => {
  it("are present", () => {
    expect(Object.keys(THRUST_PRESETS).length).toBeGreaterThanOrEqual(10);
  });

  it("each carry a complete, finite parameter set", () => {
    for (const [name, preset] of Object.entries(THRUST_PRESETS)) {
      for (const key of PARAM_KEYS) {
        const value = preset.params[key];
        expect(
          Number.isFinite(value),
          `${name}: ${key} is finite`
        ).toBe(true);
      }
      expect(preset.tagline.length, `${name}: tagline`).toBeGreaterThan(0);
      expect(preset.verdict.length, `${name}: verdict`).toBeGreaterThan(0);
    }
  });

  it("includes the famous claims referenced by the UI copy", () => {
    const names = Object.keys(THRUST_PRESETS).join(" ");
    expect(names).toContain("Podkletnov");
    expect(names).toContain("Searl");
    expect(names).toContain("Biefeld");
    expect(names).toContain("Manchester");
  });
});
