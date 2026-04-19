export const HBAR = 1.0545718e-34;
export const C = 2.99792458e8;
export const PI = Math.PI;
export const EPSILON_0 = 8.854187817e-12;

export function casimirPressure(d: number): number {
  return -(PI * PI * HBAR * C) / (240 * Math.pow(d, 4));
}

export function casimirForce(d: number, area: number): number {
  return casimirPressure(d) * area;
}

export function casimirEnergy(d: number, area: number): number {
  return -(PI * PI * HBAR * C * area) / (720 * Math.pow(d, 3));
}

export function cavityResonantFrequency(L: number, n: number): number {
  return (n * PI * C) / L;
}

export function cavityQualityFactor(
  drivingFreq: number,
  resonantFreq: number,
  Q: number
): number {
  const delta = drivingFreq - resonantFreq;
  const gamma = resonantFreq / Q;
  return 1 / Math.sqrt(1 + Math.pow((2 * delta) / gamma, 2));
}

export function rotatingFieldEx(
  x: number,
  t: number,
  omega: number,
  amplitude: number,
  k: number
): number {
  return amplitude * Math.cos(k * x - omega * t);
}

export function rotatingFieldEy(
  x: number,
  t: number,
  omega: number,
  amplitude: number,
  k: number
): number {
  return amplitude * Math.sin(k * x - omega * t);
}

export function couplingStrength(
  drivingFreq: number,
  resonantFreq: number,
  Q: number = 1000
): number {
  const response = cavityQualityFactor(drivingFreq, resonantFreq, Q);
  return response;
}

export function formatScientific(value: number, digits: number = 3): string {
  if (value === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exp);
  return `${mantissa.toFixed(digits)} × 10^${exp}`;
}

export function formatForce(forceN: number): string {
  const abs = Math.abs(forceN);
  if (abs >= 1) return `${forceN.toFixed(4)} N`;
  if (abs >= 1e-3) return `${(forceN * 1e3).toFixed(4)} mN`;
  if (abs >= 1e-6) return `${(forceN * 1e6).toFixed(4)} μN`;
  if (abs >= 1e-9) return `${(forceN * 1e9).toFixed(4)} nN`;
  if (abs >= 1e-12) return `${(forceN * 1e12).toFixed(4)} pN`;
  return `${formatScientific(forceN)} N`;
}
