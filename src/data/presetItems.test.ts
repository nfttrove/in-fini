import { describe, it, expect } from "vitest";
import { ThrustPresetRow, builtInPresets, presetStabilities, rowToItem } from "./presetItems";
import { THRUST_PRESETS } from "./thrustPresets";
import { computeThrustBudget, type ThrustParams } from "../utils/thrustLeakage";

// A cloud row as Supabase returns it: a fresh object, possibly under a
// name from before a rename, with the table's own (stale) text.
function cloudRow(name: string, p: ThrustParams): ThrustPresetRow {
  return {
    name,
    tagline: "stale tagline from the table",
    verdict: "Fully explained (stale)",
    claimed_delta_g: p.claimedDeltaG,
    drive_voltage_v: p.driveVoltageV,
    ambient_pressure_pa: p.ambientPressurePa,
    electrode_gap_m: p.electrodeGapM,
    device_mass_kg: p.deviceMassKg,
    vibration_amp_nm: p.vibrationAmpNm,
    vibration_freq_hz: p.vibrationFreqHz,
    temp_gradient_k_per_m: p.tempGradientKPerM,
    device_height_m: p.deviceHeightM,
    plate_area_m2: p.plateAreaM2,
    electrostatic_field_v_per_m: p.electrostaticFieldVPerM,
    cavity_gap_nm: p.cavityGap_nm,
    rotor_radius_um: p.rotorRadius_um,
    modulation_depth_beta: p.modulationDepth_beta,
    cavity_q: p.cavityQ,
    active_area_cm2: p.activeArea_cm2,
    drive_frequency_hz: p.driveFrequency_Hz,
  };
}

const POD = "Podkletnov Effect (1997 claim)";

describe("rowToItem — cloud rows become cards", () => {
  it("recognises a pre-rename name and shows the repo's name, copy and source", () => {
    const item = rowToItem(cloudRow("Podkletnov Effect (1992)", THRUST_PRESETS[POD].params));
    expect(item.name).toBe(POD);
    expect(item.tagline).toBe(THRUST_PRESETS[POD].tagline);
    expect(item.source).toContain("Physica C 203, 441 (1992)");
    const sphere = rowToItem(cloudRow("Manchester Sphere (2000)", THRUST_PRESETS["Charged-sphere levitation (illustrative)"].params));
    expect(sphere.name).toBe("Charged-sphere levitation (illustrative)");
    expect(sphere.source).toMatch(/illustrative/i);
  });

  it("shows the engine's verdict, never the table's stored string", () => {
    const item = rowToItem(cloudRow(POD, THRUST_PRESETS[POD].params));
    expect(item.verdict).toBe(computeThrustBudget(THRUST_PRESETS[POD].params).verdict.label);
    expect(item.verdict).toBe("Partially explained");
    for (const b of builtInPresets()) {
      expect(b.verdict).toBe(computeThrustBudget(b.params).verdict.label);
    }
  });
});

describe("presetStabilities — the boundary badge", () => {
  it("covers cards built from cloud rows (fresh objects), not just the built-ins", () => {
    // The old map was keyed by object identity against the built-ins, so
    // cloud cards never found an entry and the badge never showed live.
    const items = Object.entries(THRUST_PRESETS).map(([name, p]) => rowToItem(cloudRow(name, { ...p.params })));
    const map = presetStabilities(items);
    for (const item of items) expect(map.has(item.name)).toBe(true);
    expect(map.get(POD)!.dominantShare).toBeLessThan(0.95);
  });
});
