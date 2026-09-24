import { RIM_SPEED_LIMIT_M_S, predictDevice, type DeviceParams } from "../../utils/device";

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

/** The rotor-radius slider's upper limit. */
export const ROTOR_R_MAX_NM = 100_000;

// Every slider at its limit. The generous ceiling does pass the claim here;
// what stops it is the rotor (its rim passes the burst speed) and the gap
// (a few atoms, far below where the d⁻⁴ law holds), not the formula.
export const CORNER = predictDevice({
  dNm: 1,
  fmHz: 10e6,
  beta: 1,
  rotorRadiusNm: ROTOR_R_MAX_NM,
  Q: 1e6,
  areaMm2: 100,
});

/** Largest rotor that survives at drive fₘ: rim speed at the burst limit, capped by the slider. */
export function survivableRadiusNm(fmHz: number): number {
  // Floored, so the rim never sits past the limit through rounding.
  return Math.min(
    ROTOR_R_MAX_NM,
    Math.floor((RIM_SPEED_LIMIT_M_S / (2 * Math.PI * fmHz)) * 1e9)
  );
}

// At the claim's own 50 nm and 500 kHz, the largest rotor that survives,
// with every other knob at its limit. (At 500 kHz the slider's 100 µm is
// the binding limit: its rim moves at about 314 m/s.)
export const CLAIM_GAP_NM = 50;
export const CLAIM_FM_HZ = 500e3;
export const SURVIVABLE_R_NM = survivableRadiusNm(CLAIM_FM_HZ);
export const AT_CLAIM = predictDevice({
  dNm: CLAIM_GAP_NM,
  fmHz: CLAIM_FM_HZ,
  beta: 1,
  rotorRadiusNm: SURVIVABLE_R_NM,
  Q: 1e6,
  areaMm2: 100,
});

/**
 * The largest gap at which the ceiling reaches the claim with a rotor that
 * survives and every other knob at its limit, searched over the drive
 * frequency slider (1 kHz–10 MHz). The ceiling falls monotonically with
 * the gap, so each frequency is a bisection.
 */
export const CLAIM_REACH_GAP_NM = (() => {
  let best = 0;
  for (let i = 0; i <= 120; i++) {
    const fmHz = 1e3 * Math.pow(10, (4 * i) / 120);
    const at = (dNm: number) =>
      predictDevice({ dNm, fmHz, beta: 1, rotorRadiusNm: survivableRadiusNm(fmHz), Q: 1e6, areaMm2: 100 });
    if (at(1).P_output < at(1).claimedW) continue;
    let lo = 1, hi = 500;
    // The slider stops at 500 nm; if even that meets the claim, say so.
    if (at(hi).P_output >= at(hi).claimedW) return hi;
    for (let k = 0; k < 60; k++) {
      const mid = Math.sqrt(lo * hi);
      if (at(mid).P_output >= at(mid).claimedW) lo = mid; else hi = mid;
    }
    best = Math.max(best, lo);
  }
  return best;
})();
