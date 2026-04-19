export function fmtPower(w: number): string {
  const a = Math.abs(w);
  if (a === 0) return "0 W";
  if (a < 1e-12) return `${(w * 1e15).toExponential(1)} fW`;
  if (a < 1e-9) return `${(w * 1e12).toExponential(1)} pW`;
  if (a < 1e-6) return `${(w * 1e9).toExponential(1)} nW`;
  if (a < 1e-3) return `${(w * 1e6).toExponential(1)} µW`;
  if (a < 1) return `${(w * 1e3).toExponential(1)} mW`;
  return `${w.toFixed(3)} W`;
}

export function fmtFreq(hz: number): string {
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(3)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(3)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(3)} kHz`;
  return `${hz.toFixed(1)} Hz`;
}
