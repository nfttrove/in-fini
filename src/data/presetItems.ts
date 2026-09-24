import { ThrustParams, computeThrustBudget, verdictStability } from "../utils/thrustLeakage";
import { LEGACY_PRESET_NAMES, THRUST_PRESETS } from "./thrustPresets";

/**
 * The preset picker's data layer, kept free of React so it can be tested:
 * cloud rows -> cards (name, copy, engine verdict) and the per-card
 * robustness badge.
 */

export interface ThrustPresetRow {
  name: string;
  tagline: string;
  verdict: string;
  claimed_delta_g: number;
  drive_voltage_v: number;
  ambient_pressure_pa: number;
  electrode_gap_m: number;
  device_mass_kg: number;
  vibration_amp_nm: number;
  vibration_freq_hz: number;
  temp_gradient_k_per_m: number;
  device_height_m: number;
  plate_area_m2: number;
  electrostatic_field_v_per_m: number;
  cavity_gap_nm: number;
  rotor_radius_um: number;
  modulation_depth_beta: number;
  cavity_q: number;
  active_area_cm2: number;
  drive_frequency_hz: number;
}


export interface PresetItem {
  name: string;
  tagline: string;
  verdict: string;
  source?: string;
  params: ThrustParams;
}

export function rowToParams(row: ThrustPresetRow): ThrustParams {
  return {
    claimedDeltaG: row.claimed_delta_g,
    driveVoltageV: row.drive_voltage_v,
    ambientPressurePa: row.ambient_pressure_pa,
    electrodeGapM: row.electrode_gap_m,
    deviceMassKg: row.device_mass_kg,
    vibrationAmpNm: row.vibration_amp_nm,
    vibrationFreqHz: row.vibration_freq_hz,
    tempGradientKPerM: row.temp_gradient_k_per_m,
    deviceHeightM: row.device_height_m,
    plateAreaM2: row.plate_area_m2,
    electrostaticFieldVPerM: row.electrostatic_field_v_per_m,
    cavityGap_nm: row.cavity_gap_nm,
    rotorRadius_um: row.rotor_radius_um,
    modulationDepth_beta: row.modulation_depth_beta,
    cavityQ: row.cavity_q,
    activeArea_cm2: row.active_area_cm2,
    driveFrequency_Hz: row.drive_frequency_hz,
  };
}

// The card shows the engine's verdict, not the stored string: the stored
// ones were written by hand and drifted (Podkletnov read "Fully explained"
// while the budget said "Partially explained").
export function rowToItem(row: ThrustPresetRow): PresetItem {
  const params = rowToParams(row);
  // The repo's copy of a preset (name, tagline, verified source) wins over
  // the cloud row's text, so corrections reach the cards without waiting
  // for a database migration; renamed rows are recognised by their old
  // name. Params come from the row.
  const name = LEGACY_PRESET_NAMES[row.name] ?? row.name;
  const local = THRUST_PRESETS[name];
  return {
    name,
    tagline: local?.tagline ?? row.tagline,
    verdict: computeThrustBudget(params).verdict.label,
    source: local?.source,
    params,
  };
}

export function builtInPresets(): PresetItem[] {
  return Object.entries(THRUST_PRESETS).map(([name, preset]) => ({
    name,
    tagline: preset.tagline,
    verdict: computeThrustBudget(preset.params).verdict.label,
    source: preset.source,
    params: preset.params,
  }));
}

/**
 * Verdict robustness per card, keyed by name. The cloud list builds fresh
 * params objects, so a map keyed by object identity against the built-in
 * presets never matched and the badge only ever showed offline.
 */
export function presetStabilities(
  items: PresetItem[]
): Map<string, { dominantShare: number; tally: Record<string, number> }> {
  const map = new Map<string, { dominantShare: number; tally: Record<string, number> }>();
  for (const item of items) {
    map.set(item.name, verdictStability(item.params, { trials: 120 }));
  }
  return map;
}
