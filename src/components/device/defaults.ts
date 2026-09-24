import type { DeviceParams } from "../../utils/device";

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

/** The four knobs the worksheet and guide push to their slider limits. */
export const DEVICE_PUSHED: DeviceParams = {
  ...DEVICE_DEFAULTS,
  dNm: 10,
  fmHz: 10e6,
  Q: 1e6,
  areaMm2: 100,
};
