/**
 * Real-data residual analysis: the honest anomaly hunt on actual
 * measurements. Given a pasted time series (e.g. balance reading vs. time),
 * this module:
 *   1. parses robustly (CSV/TSV/space/semicolon, optional header, junk rows
 *      skipped and reported, not silently dropped),
 *   2. removes a linear drift (the thermal-settling signature),
 *   3. computes the amplitude spectrum with an in-place radix-2 FFT,
 *   4. identifies mains pickup (50/60 Hz + harmonics) and the strongest
 *      remaining peaks (vibration, structural resonances, or signal),
 *   5. reports the residual RMS after removing drift + mains + the top
 *      spikes — the number that either hides or reveals a discovery.
 *
 * No black boxes: every step is a pure function, unit-tested, and the UI
 * shows the spectrum so the user makes the call.
 */

export interface ParsedSeries {
  t: number[];
  y: number[];
  skipped: number;
}

const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

export function parseSeries(text: string): ParsedSeries {
  const t: number[] = [];
  const y: number[] = [];
  let skipped = 0;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || /^[A-Za-z#].*$/.test(line)) {
      if (line) skipped++;
      continue;
    }
    const cells = line.split(/[,;\t]+|\s+/).filter((c) => c.length > 0);
    if (cells.length < 2) {
      skipped++;
      continue;
    }
    // First two numeric cells are t and y; extra columns ignored.
    const a = parseFloat(cells[0]);
    const b = parseFloat(cells[1]);
    if (NUMBER.test(cells[0]) && NUMBER.test(cells[1]) && isFinite(a) && isFinite(b)) {
      t.push(a);
      y.push(b);
    } else {
      skipped++;
    }
  }
  return { t, y, skipped };
}

export interface DetrendResult {
  slope: number;
  intercept: number;
  detrended: number[];
}

/** Least-squares linear fit; returns residuals and the fit coefficients. */
export function linearDetrend(t: number[], y: number[]): DetrendResult {
  const n = t.length;
  if (n < 2) return { slope: 0, intercept: y[0] ?? 0, detrended: [...y] };
  const mt = t.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (t[i] - mt) * (y[i] - my);
    den += (t[i] - mt) * (t[i] - mt);
  }
  const slope = den > 0 ? num / den : 0;
  const intercept = my - slope * mt;
  const detrended = t.map((ti, i) => y[i] - (slope * ti + intercept));
  return { slope, intercept, detrended };
}

/**
 * Iterative radix-2 FFT. Input length must be a power of two (pad or
 * truncate with nextPow2). Returns magnitudes |X_k|/n for k = 0..n/2.
 */
export function fftMagnitudes(samples: number[]): number[] {
  const n = samples.length;
  if (n === 0) return [];
  if ((n & (n - 1)) !== 0) throw new Error("fftMagnitudes: length must be a power of two");

  const re = Float64Array.from(samples);
  const im = new Float64Array(n);

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  // Butterflies
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k];
        const ai = im[i + k];
        const br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ar + br;
        im[i + k] = ai + bi;
        re[i + k + len / 2] = ar - br;
        im[i + k + len / 2] = ai - bi;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = ncr;
      }
    }
  }

  const half = n >> 1;
  const mags = new Array<number>(half + 1);
  for (let k = 0; k <= half; k++) {
    mags[k] = Math.hypot(re[k], im[k]) / n;
  }
  return mags;
}

export function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

export interface SpectrumPeak {
  freqHz: number;
  magnitude: number;
  label: "mains" | "harmonic" | "dc" | "peak";
}

export interface SeriesAnalysis {
  n: number;
  durationS: number;
  sampleRateHz: number;
  driftSlopePerMin: number;
  /** Fraction of raw variance explained by the linear drift. */
  driftFraction: number;
  mainsHz: number;
  /** Fraction of detrended variance at the mains fundamental (and harmonics). */
  mainsFraction: number;
  harmonicsFound: number[];
  topPeaks: SpectrumPeak[];
  /** RMS of the detrended series after zeroing mains-family bins. */
  residualRms: number;
  rawRms: number;
  spectrumFreqHz: number[];
  spectrumMag: number[];
}

export interface AnalyzeOptions {
  /** Mains fundamental to target: 50 (default) or 60. */
  mainsHz?: 50 | 60;
  /** How many non-mains peaks to report. */
  topPeaks?: number;
}

export function analyzeSeries(
  t: number[],
  yRaw: number[],
  opts: AnalyzeOptions = {}
): SeriesAnalysis {
  const mainsHz = opts.mainsHz ?? 50;
  const topCount = opts.topPeaks ?? 3;

  const n = t.length;
  const dtMedian = medianDiff(t);
  const sampleRate = dtMedian > 0 ? 1 / dtMedian : 0;
  const duration = n > 1 ? t[n - 1] - t[0] : 0;

  const rawMean = yRaw.reduce((s, v) => s + v, 0) / Math.max(n, 1);
  const rawRms = Math.sqrt(
    yRaw.reduce((s, v) => s + (v - rawMean) * (v - rawMean), 0) / Math.max(n, 1)
  );

  const { slope, detrended } = linearDetrend(t, yRaw);
  const detrendRms = rms(detrended);
  const driftFraction = rawRms > 0 ? 1 - (detrended.reduce((s, v) => s + v * v, 0) / Math.max(n, 1)) / (rawRms * rawRms) : 0;

  // Zero-padded FFT of the detrended series (padding to pow2 interpolates
  // the spectrum; peak frequencies are still resolved to ~1/duration).
  const nfft = Math.min(Math.max(nextPow2(n), 2), 65536);
  const padded = new Array<number>(nfft).fill(0);
  for (let i = 0; i < n; i++) padded[i] = detrended[i];
  const mags = fftMagnitudes(padded);

  const freqs = mags.map((_, k) => (k * sampleRate) / nfft);
  const binHz = sampleRate / nfft;

  const isMainsFamily = (f: number) => {
    for (let h = 1; h <= 5; h++) {
      if (Math.abs(f - mainsHz * h) < Math.max(binHz, mainsHz / 20)) return h;
    }
    return 0;
  };

  // Mains energy: power at mains bins / total spectral power (carrying
  // amplitude²; Parseval-ish comparison on the detrended series).
  let mainsPower = 0;
  let totalPower = 0;
  const harmonicsFound: number[] = [];
  for (let k = 1; k < mags.length; k++) {
    const p = 2 * mags[k] * mags[k];
    totalPower += p;
    const h = isMainsFamily(freqs[k]);
    if (h) {
      mainsPower += p;
      if (p > totalPower * 0.001) harmonicsFound.push(h);
    }
  }
  const mainsFraction = totalPower > 0 ? mainsPower / totalPower : 0;

  // Top non-mains, non-DC peaks.
  const candidates: { k: number; f: number; m: number }[] = [];
  for (let k = 2; k < mags.length - 1; k++) {
    const f = freqs[k];
    if (isMainsFamily(f)) continue;
    // local maximum
    if (mags[k] > mags[k - 1] && mags[k] >= mags[k + 1]) {
      candidates.push({ k, f, m: mags[k] });
    }
  }
  candidates.sort((a, b) => b.m - a.m);
  const topPeaks: SpectrumPeak[] = candidates
    .slice(0, topCount)
    .map((c) => ({ freqHz: c.f, magnitude: c.m, label: "peak" as const }));

  // Residual RMS after removing mains-family bins from the spectrum.
  // Zero-padding to nfft dilutes bin MAGNITUDES by n/nfft, but power summed
  // over a leakage lobe dilutes by (n/nfft)¹ — Parseval carries one factor
  // of the FFT length. Rescale accordingly before comparing with the
  // time-domain RMS².
  let removedPower = 0;
  for (let k = 1; k < mags.length; k++) {
    if (isMainsFamily(freqs[k])) removedPower += 2 * mags[k] * mags[k];
  }
  removedPower *= nfft / Math.max(n, 1);
  const residualRms = Math.sqrt(
    Math.max(0, detrendRms * detrendRms - removedPower)
  );

  const uniqHarmonics = [...new Set(harmonicsFound)].sort((a, b) => a - b);

  return {
    n,
    durationS: duration,
    sampleRateHz: sampleRate,
    driftSlopePerMin: slope * 60,
    driftFraction: Math.max(0, Math.min(1, driftFraction)),
    mainsHz,
    mainsFraction,
    harmonicsFound: uniqHarmonics,
    topPeaks,
    residualRms,
    rawRms,
    spectrumFreqHz: freqs,
    spectrumMag: mags,
  };
}

// ---------------------------------------------------------------------------
// Synthetic-data generation (seeded) — used by the "artifact or anomaly?"
// blind challenge and useful for teaching.
// ---------------------------------------------------------------------------

/** Deterministic PRNG (mulberry32) so challenges are reproducible. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ChallengeSeries {
  t: number[];
  y: number[];
  /** True answer: was an anomaly injected? */
  hasAnomaly: boolean;
  composition: string[];
}

/** One blind round: a synthetic balance trace, artifact soup ± anomaly. */
export function makeChallenge(seed: number): ChallengeSeries {
  const rnd = seededRandom(seed);
  const durationS = 60;
  const fs = 200;
  const t: number[] = [];
  const y: number[] = [];
  const composition: string[] = [];

  const drift = (rnd() - 0.3) * 0.02; // per second
  const driftAmp = Math.abs(drift * durationS);
  if (driftAmp > 0.3) composition.push(`thermal drift (${driftAmp.toFixed(2)} over the run)`);

  const mainsAmp = rnd() * 0.8;
  if (mainsAmp > 0.25)
    composition.push(`50 Hz mains pickup (${mainsAmp.toFixed(2)} amplitude)`);
  const vibrationAmp = rnd() * 0.6;
  const vibrationHz = 8 + Math.floor(rnd() * 40);
  if (vibrationAmp > 0.25)
    composition.push(`floor vibration at ${vibrationHz} Hz (${vibrationAmp.toFixed(2)} amplitude)`);

  const hasAnomaly = rnd() < 0.5;
  const anomalyAmp = 0.3 + rnd() * 0.7;
  if (hasAnomaly)
    composition.push(`steady anomalous offset (${anomalyAmp.toFixed(2)})`);

  const noiseSigma = 0.05 + rnd() * 0.1;
  composition.push(`sensor noise (σ = ${noiseSigma.toFixed(2)})`);

  const gaussian = () => {
    // Box–Muller on the seeded stream
    const u = Math.max(rnd(), 1e-12);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
  };

  for (let i = 0; i < durationS * fs; i++) {
    const time = i / fs;
    const mid = durationS / 2;
    let v = 10 + drift * time + mainsAmp * Math.sin(2 * Math.PI * 50 * time);
    v += vibrationAmp * Math.sin(2 * Math.PI * vibrationHz * time);
    if (hasAnomaly) v += anomalyAmp * (time > mid ? 1 : 0); // step at midpoint
    v += gaussian() * noiseSigma;
    t.push(+(time.toFixed(4)));
    y.push(v);
  }
  return { t, y, hasAnomaly, composition };
}

// ---------------------------------------------------------------------------
function rms(v: number[]): number {
  if (v.length === 0) return 0;
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0) / v.length);
}

function medianDiff(t: number[]): number {
  if (t.length < 2) return 0;
  const d: number[] = [];
  for (let i = 1; i < t.length && d.length < 1000; i++) {
    if (t[i] - t[i - 1] > 0) d.push(t[i] - t[i - 1]);
  }
  if (d.length === 0) return 0;
  d.sort((a, b) => a - b);
  return d[Math.floor(d.length / 2)];
}
