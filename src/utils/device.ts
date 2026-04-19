import { besselJ } from "./bessel";

export const HBAR = 1.054571817e-34;
export const C = 2.99792458e8;
export const KB = 1.380649e-23;

export interface DeviceParams {
  dNm: number;
  fmHz: number;
  beta: number;
  rotorRadiusNm: number;
  Q: number;
  areaMm2: number;
}

export interface DevicePrediction {
  f0Hz: number;
  v: number;
  vOverC: number;
  P_DCE_raw: number;
  P_upconverted: number;
  P_lorentz: number;
  P_output: number;
  P_DCE_limit: number;
  ordersInsideLinewidth: number;
  gammaHz: number;
  j1: number;
  claimedW: number;
  shortfall: number;
}

/**
 * DCE power density scaling used in this model:
 *   P_DCE ∝ (ħ c³ / d⁴) · (v/c)² · A
 * (user-supplied ansatz; dimensionful prefactor uses the cavity volume
 *  ħc³/d⁴ per unit area, multiplied by (v/c)²)
 *
 * Note: the true DCE photon-production rate from a boundary oscillating at
 * ω_m with amplitude δ is of order (ω_m / c)³ · (δ·c)² per unit area, which
 * numerically matches the same order of magnitude as the ansatz below.
 */
export function predictDevice(p: DeviceParams): DevicePrediction {
  const d = p.dNm * 1e-9;
  const r = p.rotorRadiusNm * 1e-9;
  const A = p.areaMm2 * 1e-6;
  const f0Hz = C / (2 * d);
  const gammaHz = f0Hz / p.Q;

  const omega_m = 2 * Math.PI * p.fmHz;
  const v = omega_m * r;
  const vOverC = v / C;

  const P_DCE_raw = (HBAR * Math.pow(C, 3) / Math.pow(d, 4)) * vOverC * vOverC * A;

  const j1 = besselJ(1, p.beta);
  const P_upconverted = 2 * j1 * j1 * P_DCE_raw;

  const lor = 1 / (1 + Math.pow((2 * p.fmHz) / gammaHz, 2));
  const P_lorentz = lor;
  const P_output = P_upconverted * lor;

  let ordersInsideLinewidth = 0;
  for (let n = -10; n <= 10; n++) {
    if (Math.abs(n * p.fmHz) < gammaHz / 2) ordersInsideLinewidth++;
  }

  const P_DCE_limit = P_upconverted;

  const claimedW = 1.3;
  const shortfall = P_output > 0 ? claimedW / P_output : Infinity;

  return {
    f0Hz,
    v,
    vOverC,
    P_DCE_raw,
    P_upconverted,
    P_lorentz,
    P_output,
    P_DCE_limit,
    ordersInsideLinewidth,
    gammaHz,
    j1,
    claimedW,
    shortfall,
  };
}

export function formatPower(w: number): string {
  if (!isFinite(w) || w === 0) return "0 W";
  const abs = Math.abs(w);
  if (abs >= 1e3) return `${(w / 1e3).toExponential(2)} kW`;
  if (abs >= 1) return `${w.toFixed(3)} W`;
  if (abs >= 1e-3) return `${(w * 1e3).toFixed(3)} mW`;
  if (abs >= 1e-6) return `${(w * 1e6).toFixed(3)} µW`;
  if (abs >= 1e-9) return `${(w * 1e9).toFixed(3)} nW`;
  if (abs >= 1e-12) return `${(w * 1e12).toFixed(3)} pW`;
  if (abs >= 1e-15) return `${(w * 1e15).toFixed(3)} fW`;
  return `${w.toExponential(2)} W`;
}

export function formatFreq(hz: number): string {
  if (hz >= 1e15) return `${(hz / 1e15).toFixed(2)} PHz`;
  if (hz >= 1e12) return `${(hz / 1e12).toFixed(2)} THz`;
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(2)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(2)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(2)} kHz`;
  return `${hz.toFixed(2)} Hz`;
}

export function formatVOverC(v: number): string {
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e-3) return v.toExponential(3);
  return v.toExponential(3);
}
