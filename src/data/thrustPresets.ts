import { ThrustParams, computeThrustBudget } from "../utils/thrustLeakage";

export interface ThrustPreset {
  params: ThrustParams;
  tagline: string;
  /**
   * Where the claim comes from, verified against the primary literature
   * (2026-09) — or a plain statement that the preset is illustrative.
   */
  source: string;
  // No stored verdict: cards and copy show computeThrustBudget's own label.
  // Hand-written verdicts drifted (Podkletnov read "Fully explained" while
  // the engine said "Partially explained").
}

/**
 * Names the cloud table may still carry from before a rename, mapped to the
 * current name, so a card reads correctly even before the renaming
 * migration (20260924140000) has been applied.
 */
export const LEGACY_PRESET_NAMES: Record<string, string> = {
  "Manchester Sphere (2000)": "Charged-sphere levitation (illustrative)",
  "Podkletnov Effect (1992)": "Podkletnov Effect (1997 claim)",
};

export const THRUST_PRESETS: Record<string, ThrustPreset> = {
  // Formerly "Manchester Sphere (2000)": no documented claim by that name
  // could be found, so it is presented as the illustration it is.
  "Charged-sphere levitation (illustrative)": {
    params: {
      claimedDeltaG: 0.18,
      driveVoltageV: 50000,
      ambientPressurePa: 101325,
      electrodeGapM: 0.05,
      deviceMassKg: 0.5,
      vibrationAmpNm: 500,
      vibrationFreqHz: 30,
      tempGradientKPerM: 0.2,
      deviceHeightM: 0.15,
      plateAreaM2: 0.02,
      electrostaticFieldVPerM: 50000,
      cavityGap_nm: 100,
      rotorRadius_um: 50,
      modulationDepth_beta: 0.5,
      cavityQ: 10000,
      activeArea_cm2: 1,
      driveFrequency_Hz: 1e6,
    },
    tagline: "A charged sphere on a scale: corona wind and shaking can fake this much.",
    source:
      "Illustrative scenario. Earlier versions called it \"Manchester Sphere (2000)\"; no documented claim by that name could be found.",
  },

  "Lifter (Ionocraft) Classic": {
    params: {
      claimedDeltaG: 30,
      driveVoltageV: 30000,
      ambientPressurePa: 101325,
      electrodeGapM: 0.02,
      deviceMassKg: 0.003,
      vibrationAmpNm: 1,
      vibrationFreqHz: 60,
      tempGradientKPerM: 0.0,
      deviceHeightM: 0.03,
      plateAreaM2: 0.06,
      electrostaticFieldVPerM: 1500000,
      cavityGap_nm: 100,
      rotorRadius_um: 50,
      modulationDepth_beta: 0.5,
      cavityQ: 10000,
      activeArea_cm2: 1,
      driveFrequency_Hz: 1e6,
    },
    tagline: "It flies, but not by antigravity: known forces cover the claim. Real lifters ride ion wind; at this budget's default 10 cm² discharge area the electrostatic allowance does the covering.",
    source:
      "Bahder & Fazi, \"Force on an Asymmetric Capacitor\", ARL-TR-3005 (2003); Tajmar, AIAA J. 42, 315 (2004): lifter thrust is corona (ion) wind.",
  },

  "Shaken, Not Stirred": {
    params: {
      claimedDeltaG: 10,
      driveVoltageV: 0,
      ambientPressurePa: 101325,
      electrodeGapM: 0.01,
      deviceMassKg: 5.0,
      vibrationAmpNm: 2000,
      vibrationFreqHz: 50,
      tempGradientKPerM: 0.0,
      deviceHeightM: 0.1,
      plateAreaM2: 0.01,
      electrostaticFieldVPerM: 1,
      cavityGap_nm: 100,
      rotorRadius_um: 50,
      modulationDepth_beta: 0.5,
      cavityQ: 10000,
      activeArea_cm2: 1,
      driveFrequency_Hz: 1e6,
    },
    tagline: "Your scale is shaking, not your device levitating.",
    source: "Illustrative scenario, not a historical claim.",
  },

  "Hot Air Balloon Mode": {
    params: {
      claimedDeltaG: 5,
      driveVoltageV: 0,
      ambientPressurePa: 101325,
      electrodeGapM: 0.01,
      deviceMassKg: 0.2,
      vibrationAmpNm: 0,
      vibrationFreqHz: 1,
      tempGradientKPerM: 10,
      deviceHeightM: 0.3,
      plateAreaM2: 0.04,
      electrostaticFieldVPerM: 1,
      cavityGap_nm: 100,
      rotorRadius_um: 50,
      modulationDepth_beta: 0.5,
      cavityQ: 10000,
      activeArea_cm2: 1,
      driveFrequency_Hz: 1e6,
    },
    tagline: "Warm air does lift, but at this gradient it covers only a sliver of the claim — heat alone can't explain it.",
    source: "Illustrative scenario, not a historical claim.",
  },

  "Electrostatic Levitation (Tiny)": {
    params: {
      claimedDeltaG: 0.5,
      driveVoltageV: 100,
      ambientPressurePa: 101325,
      electrodeGapM: 0.01,
      deviceMassKg: 0.05,
      vibrationAmpNm: 0,
      vibrationFreqHz: 1,
      tempGradientKPerM: 0.0,
      deviceHeightM: 0.02,
      plateAreaM2: 0.02,
      electrostaticFieldVPerM: 500000,
      cavityGap_nm: 100,
      rotorRadius_um: 50,
      modulationDepth_beta: 0.5,
      cavityQ: 10000,
      activeArea_cm2: 1,
      driveFrequency_Hz: 1e6,
    },
    tagline: "You're sticking to the ceiling like a balloon, not defying gravity.",
    source: "Illustrative scenario, not a historical claim.",
  },

  "Cryogenic Ideal (Antigravity Dream)": {
    params: {
      claimedDeltaG: 1.0,
      driveVoltageV: 1000,
      ambientPressurePa: 1e-6,
      electrodeGapM: 0.01,
      deviceMassKg: 0.1,
      vibrationAmpNm: 0.1,
      vibrationFreqHz: 1000,
      tempGradientKPerM: 0.0,
      deviceHeightM: 0.1,
      plateAreaM2: 0.01,
      electrostaticFieldVPerM: 1,
      cavityGap_nm: 100,
      rotorRadius_um: 50,
      modulationDepth_beta: 0.5,
      cavityQ: 10000,
      activeArea_cm2: 1,
      driveFrequency_Hz: 1e6,
    },
    tagline:
      "If you actually achieve these conditions and still see thrust, call a physicist.",
    source: "Illustrative scenario, not a historical claim.",
  },

  // Formerly "Podkletnov Effect (1992)": the 2% claim is from 1997; the
  // 1992 paper reported 0.05–0.3%.
  "Podkletnov Effect (1997 claim)": {
    params: {
      claimedDeltaG: 2.0,
      driveVoltageV: 10000,
      ambientPressurePa: 101325,
      electrodeGapM: 0.03,
      deviceMassKg: 0.1,
      vibrationAmpNm: 1000,
      vibrationFreqHz: 50,
      tempGradientKPerM: 1.0,
      deviceHeightM: 0.15,
      plateAreaM2: 0.03,
      electrostaticFieldVPerM: 10000,
      cavityGap_nm: 100,
      rotorRadius_um: 50,
      modulationDepth_beta: 0.5,
      cavityQ: 10000,
      activeArea_cm2: 1,
      driveFrequency_Hz: 1e6,
    },
    tagline: "Vibration covers much of this claim; what's left needs better isolation, not new physics.",
    source:
      "Podkletnov & Nieminen, Physica C 203, 441 (1992): 0.05% over a stationary levitating disk, up to 0.3% rotating. The preset's 2% is Podkletnov's later peak claim (1.9–2.1% while braking; arXiv:cond-mat/9701074, 1997). Nulls: Li et al., Physica C 281, 260 (1997, NASA MSFC); Hathaway, Cleveland & Bao, Physica C 385, 488 (2003).",
  },

  "Searl Effect Generator (SEG)": {
    params: {
      claimedDeltaG: 100,
      driveVoltageV: 5000,
      ambientPressurePa: 101325,
      electrodeGapM: 0.005,
      deviceMassKg: 10.0,
      vibrationAmpNm: 10000,
      vibrationFreqHz: 400,
      tempGradientKPerM: 2.0,
      deviceHeightM: 0.25,
      plateAreaM2: 0.1,
      electrostaticFieldVPerM: 200000,
      cavityGap_nm: 100,
      rotorRadius_um: 50,
      modulationDepth_beta: 0.5,
      cavityQ: 10000,
      activeArea_cm2: 1,
      driveFrequency_Hz: 1e6,
    },
    tagline: "The SEG 'levitates' because it shakes itself apart.",
    source:
      "Roshchin & Godin, Tech. Phys. Lett. 26, 1105 (2000), reported weight changes of up to about 35% in a Searl-type magnetic rig; no independent replication. The preset scales the claim down to 1%.",
  },

  "Biefeld-Brown Capacitor": {
    params: {
      claimedDeltaG: 0.5,
      driveVoltageV: 50000,
      ambientPressurePa: 101325,
      electrodeGapM: 0.01,
      deviceMassKg: 0.02,
      vibrationAmpNm: 10,
      vibrationFreqHz: 120,
      tempGradientKPerM: 0.0,
      deviceHeightM: 0.02,
      plateAreaM2: 0.01,
      electrostaticFieldVPerM: 5000000,
      cavityGap_nm: 100,
      rotorRadius_um: 50,
      modulationDepth_beta: 0.5,
      cavityQ: 10000,
      activeArea_cm2: 1,
      driveFrequency_Hz: 1e6,
    },
    tagline: "It works, but not because of gravity modification.",
    source:
      "T. T. Brown, GB patent 300,311 (1928). Bahder & Fazi, ARL-TR-3005 (2003) measured the force; Tajmar, AIAA J. 42, 315 (2004) traces it to corona wind.",
  },

  "The Lazy Scientist": {
    params: {
      claimedDeltaG: 100,
      driveVoltageV: 0,
      ambientPressurePa: 101325,
      electrodeGapM: 0.01,
      deviceMassKg: 0.001,
      vibrationAmpNm: 0,
      vibrationFreqHz: 1,
      tempGradientKPerM: 0.0,
      deviceHeightM: 0.01,
      plateAreaM2: 0.001,
      electrostaticFieldVPerM: 1,
      cavityGap_nm: 100,
      rotorRadius_um: 50,
      modulationDepth_beta: 0.5,
      cavityQ: 10000,
      activeArea_cm2: 1,
      driveFrequency_Hz: 1e6,
    },
    tagline: "Garbage in, garbage out. Measure something first.",
    source: "Illustrative scenario, not a historical claim.",
  },
};

/**
 * What the Thrust & Weight Diagnostic shows for a preset, computed by the
 * same engine. The Lab Worksheet and Teacher's Guide quote this instead of
 * hand-typed numbers, which had drifted from the panel.
 */
export function summarizePreset(name: string): {
  claimPercent: number;
  largestChannel: string;
  verdict: string;
} {
  const { params } = THRUST_PRESETS[name];
  const budget = computeThrustBudget(params);
  const largest = budget.channels.reduce((a, c) => (c.valueG > a.valueG ? c : a));
  return {
    claimPercent: (100 * params.claimedDeltaG) / (params.deviceMassKg * 1000),
    largestChannel: largest.label,
    verdict: budget.verdict.label,
  };
}
