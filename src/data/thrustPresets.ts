import { ThrustParams } from "../utils/thrustLeakage";

export interface ThrustPreset {
  params: ThrustParams;
  tagline: string;
  verdict: string;
}

export const THRUST_PRESETS: Record<string, ThrustPreset> = {
  "Manchester Sphere (2000)": {
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
    },
    tagline: "Sorry, the spheres were likely just corona discharge and shaking.",
    verdict: "Fully explained by ion wind + vibration",
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
    },
    tagline: "It flies, but it's not antigravity -- it's just pushing air.",
    verdict: "Fully explained (ion wind)",
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
    },
    tagline: "Your scale is shaking, not your device levitating.",
    verdict: "Fully explained (vibration)",
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
    },
    tagline: "You've just built a tiny heater, not an antigravity drive.",
    verdict: "Fully explained (thermal convection)",
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
    },
    tagline: "You're sticking to the ceiling like a balloon, not defying gravity.",
    verdict: "Fully explained (electrostatic image force)",
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
    },
    tagline:
      "If you actually achieve these conditions and still see thrust, call a physicist.",
    verdict: "Unexplained excess",
  },

  "Podkletnov Effect (1992)": {
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
    },
    tagline: "Podkletnov's result is likely just vibration and corona discharge.",
    verdict: "Fully explained (vibration + ion wind)",
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
    },
    tagline: "The SEG 'levitates' because it shakes itself apart.",
    verdict: "Fully explained (vibration dominates)",
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
    },
    tagline: "It works, but not because of gravity modification.",
    verdict: "Fully explained (ion wind + vibration)",
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
    },
    tagline: "Garbage in, garbage out. Measure something first.",
    verdict: "Unexplained excess (no data entered)",
  },
};
