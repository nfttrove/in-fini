import { predictDevice, type DeviceParams } from "../../utils/device";

/**
 * Device Model panel defaults. The Lab Worksheet and Teacher's Guide quote
 * predictions computed from these, so their numbers cannot drift from the
 * panel again (they once promised ~5 µW where the panel shows 18 fW).
 */
export const DEVICE_DEFAULTS: DeviceParams = {
  dNm: 50,
  fmHz: 500e3,
  beta: 0.3,
  rotorRadiusNm: 50,
  Q: 10000,
  areaMm2: 1,
};

/**
 * The four knobs the worksheet and guide push hard. Frequency, Q and area sit
 * at their slider limits; the gap stops at 10 nm (the slider goes to 1 nm).
 */
export const DEVICE_PUSHED: DeviceParams = {
  ...DEVICE_DEFAULTS,
  dNm: 10,
  fmHz: 10e6,
  Q: 1e6,
  areaMm2: 100,
};

/** Rim acceleration beyond which no demonstrated micro-rotor survives (g). */
export const MATERIAL_VETO_G = 1e6;

// Every slider at its limit. The generous ceiling does pass the claim here;
// what stops it is materials, not the formula.
export const CORNER = predictDevice({
  dNm: 1,
  fmHz: 10e6,
  beta: 1,
  rotorRadiusNm: 100_000,
  Q: 1e6,
  areaMm2: 100,
});

// At the claim's own 50 nm and 500 kHz, the largest rotor that survives the
// veto (a = (2πf)²·r) with every other knob at its limit.
export const CLAIM_FM_HZ = 500e3;
// Floored: at the exact radius the rim sits on the veto (and rounding up
// would put it past it, failing the panel's own sanity check).
export const SURVIVABLE_R_NM = Math.floor(
  ((MATERIAL_VETO_G * 9.80665) / (2 * Math.PI * CLAIM_FM_HZ) ** 2) * 1e9
);
export const AT_CLAIM = predictDevice({
  dNm: 50,
  fmHz: CLAIM_FM_HZ,
  beta: 1,
  rotorRadiusNm: SURVIVABLE_R_NM,
  Q: 1e6,
  areaMm2: 100,
});
