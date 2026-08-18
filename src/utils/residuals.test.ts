import { describe, it, expect } from "vitest";
import {
  parseSeries,
  linearDetrend,
  fftMagnitudes,
  analyzeSeries,
  makeChallenge,
  seededRandom,
  nextPow2,
} from "./residuals";

describe("parseSeries", () => {
  it("parses CSV, TSV, space and semicolon formats", () => {
    expect(parseSeries("0,1\n1,2\n").y).toEqual([1, 2]);
    expect(parseSeries("0\t1\n1\t2\n").y).toEqual([1, 2]);
    expect(parseSeries("0 1\n1 2\n").y).toEqual([1, 2]);
    expect(parseSeries("0;1\n1;2\n").y).toEqual([1, 2]);
  });

  it("skips headers and junk rows, and says how many", () => {
    const p = parseSeries("time,value\n0,1\njunk\n1.5,2.5\n,,\n2,3\n");
    expect(p.y).toEqual([1, 2.5, 3]);
    expect(p.skipped).toBe(3);
  });

  it("handles scientific notation and signs", () => {
    const p = parseSeries("0,-1e-3\n1,+2.5E2\n");
    expect(p.y[0]).toBeCloseTo(-0.001, 10);
    expect(p.y[1]).toBeCloseTo(250, 10);
  });
});

describe("linearDetrend", () => {
  it("recovers slope and intercept of a perfect line", () => {
    const t = [0, 1, 2, 3, 4];
    const y = t.map((x) => 2 * x + 1);
    const d = linearDetrend(t, y);
    expect(d.slope).toBeCloseTo(2, 10);
    expect(d.intercept).toBeCloseTo(1, 10);
    d.detrended.forEach((v) => expect(Math.abs(v)).toBeLessThan(1e-10));
  });

  it("leaves a constant series untouched in the residuals", () => {
    const d = linearDetrend([0, 1, 2], [5, 5, 5]);
    expect(d.slope).toBeCloseTo(0, 10);
    expect(d.detrended.every((v) => Math.abs(v) < 1e-10)).toBe(true);
  });
});

describe("fftMagnitudes", () => {
  it("finds a pure sinusoid's frequency and amplitude", () => {
    const fs = 1024; // makes 50 Hz exactly bin-aligned at n = 4096
    const n = 4096;
    const f0 = 50;
    const amp = 0.8;
    const samples: number[] = [];
    for (let i = 0; i < n; i++) {
      samples.push(amp * Math.sin((2 * Math.PI * f0 * i) / fs));
    }
    const mags = fftMagnitudes(samples);
    let best = 0;
    for (let k = 1; k < mags.length; k++) if (mags[k] > mags[best]) best = k;
    const freq = (best * fs) / n;
    expect(freq).toBeCloseTo(f0, 1);
    expect(mags[best]).toBeCloseTo(amp / 2, 2); // single-sided amplitude
  });

  it("throws on non-power-of-two input", () => {
    expect(() => fftMagnitudes([1, 2, 3])).toThrow();
  });

  it("nextPow2 rounds up", () => {
    expect(nextPow2(1)).toBe(1);
    expect(nextPow2(1000)).toBe(1024);
  });
});

describe("analyzeSeries on a synthetic rig trace", () => {
  const fs = 1000;
  const duration = 20;
  const rnd = seededRandom(42);
  const t: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < fs * duration; i++) {
    const time = i / fs;
    // drift 0.01/s + strong 50 Hz + weak 17 Hz vibration + small noise
    let v = 10 + 0.01 * time + 0.6 * Math.sin(2 * Math.PI * 50 * time);
    v += 0.2 * Math.sin(2 * Math.PI * 17 * time);
    v += (rnd() - 0.5) * 0.02;
    t.push(+(time.toFixed(4)));
    y.push(v);
  }
  const a = analyzeSeries(t, y, { mainsHz: 50, topPeaks: 3 });

  it("recovers the sampling rate and duration", () => {
    expect(a.sampleRateHz).toBeCloseTo(fs, 5);
    expect(a.durationS).toBeCloseTo(duration, 2);
  });

  it("recovers the drift rate", () => {
    expect(a.driftSlopePerMin).toBeCloseTo(0.6, 1); // 0.01/s × 60 (noise-biased)
  });

  it("attributes most detrended power to the mains family", () => {
    expect(a.mainsFraction).toBeGreaterThan(0.8);
  });

  it("finds the 17 Hz vibration among the top peaks", () => {
    expect(a.topPeaks.some((p) => Math.abs(p.freqHz - 17) < 1)).toBe(true);
  });

  it("residual after mains removal is the vibration, not the mains", () => {
    // Mains (0.6²/2 = 0.18 power) removed; the 0.2-amplitude 17 Hz
    // vibration remains: RMS ≈ 0.2/√2 = 0.1414.
    expect(a.residualRms).toBeCloseTo(0.1414, 1);
    expect(a.residualRms).toBeLessThan(a.rawRms / 3);
  });
});

describe("makeChallenge (blind 'artifact or anomaly?' rounds)", () => {
  it("is deterministic per seed", () => {
    const a = makeChallenge(7);
    const b = makeChallenge(7);
    expect(a.y).toEqual(b.y);
    expect(a.hasAnomaly).toBe(b.hasAnomaly);
  });

  it("produces the same number of samples and honest composition notes", () => {
    const c = makeChallenge(123);
    expect(c.t.length).toBe(60 * 200);
    expect(c.composition.length).toBeGreaterThanOrEqual(2);
  });

  it("anomaly injection produces a visible step the analyzer can smell", () => {
    let anomalySeed = -1;
    for (let s = 1; s < 60 && anomalySeed < 0; s++) {
      if (makeChallenge(s).hasAnomaly) anomalySeed = s;
    }
    expect(anomalySeed).toBeGreaterThan(0);
    const c = makeChallenge(anomalySeed);
    const firstHalf = c.y.slice(0, c.y.length / 2);
    const secondHalf = c.y.slice(c.y.length / 2);
    const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;
    // Drift is small by construction; the step dominates the halves' difference.
    expect(mean(secondHalf) - mean(firstHalf)).toBeGreaterThan(0.15);
  });
});
