import { describe, it, expect } from "vitest";
import { fleetStats, collectiveBoundStatement, analysisToProfile, normalizeRunUnits, M_S2_TO_MILLIG } from "./networkCensus";
import { analyzeSeries } from "./residuals";

const RUNS = [
  { noise_rms: 1, mains_hz: 50 },
  { noise_rms: 2, mains_hz: 50 },
  { noise_rms: 3, mains_hz: 60 },
  { noise_rms: 4, mains_hz: 0 },
  { noise_rms: 100, mains_hz: 60 },
  { noise_rms: 6, mains_hz: 50 },
  { noise_rms: 7, mains_hz: 60 },
  { noise_rms: 8, mains_hz: 0 },
  { noise_rms: 9, mains_hz: 50 },
  { noise_rms: 10, mains_hz: 60 },
];

describe("fleetStats", () => {
  const s = fleetStats(RUNS);

  it("computes the median over sorted noise", () => {
    // sorted: [1,2,3,4,6,7,8,9,10,100] → upper-middle = 7
    expect(s.n).toBe(10);
    expect(s.medianNoise).toBe(7);
    expect(s.quietestNoise).toBe(1);
    expect(s.noisiestNoise).toBe(100);
  });

  it("collective floor is median/√n", () => {
    expect(s.collectiveFloor).toBeCloseTo(7 / Math.sqrt(10), 10);
  });

  it("counts the mains split", () => {
    expect(s.mains50).toBe(4);
    expect(s.mains60).toBe(4);
    expect(s.mainsNone).toBe(2);
  });

  it("percentile ranks a rig against the fleet", () => {
    expect(s.percentileOf(1)).toBeCloseTo(0, 10); // quietest possible
    expect(s.percentileOf(6.5)).toBeCloseTo(0.5, 10); // values < 6.5: 1,2,3,4,6
    expect(s.percentileOf(101)).toBeCloseTo(1, 10);
  });

  it("handles the empty fleet", () => {
    const e = fleetStats([]);
    expect(e.n).toBe(0);
    expect(e.collectiveFloor).toBe(0);
  });
});

describe("collectiveBoundStatement", () => {
  it("asks for eyes when empty", () => {
    expect(collectiveBoundStatement(fleetStats([]))).toContain("No runs filed");
  });

  it("demands a dozen before claiming meaning", () => {
    expect(collectiveBoundStatement(fleetStats(RUNS.slice(0, 3)))).toContain(
      "one rig's floor"
    );
  });

  it("states the bound once the fleet is real", () => {
    const text = collectiveBoundStatement(fleetStats(RUNS));
    // Runs are not deduplicated by rig, so N counts filed runs; the √N
    // bound is what that many independent rigs could reach.
    expect(text).toContain("10 filed runs");
    expect(text).toContain("that many independent rigs");
    expect(text).not.toContain("mΔg"); // acceleration, not grams-equivalent weight
    expect(text).toContain("2.2e+0"); // 7/√10 ≈ 2.214
    // median/√N is a best case for a coordinated round, not what one run
    // sees — the old text said larger effects "should already have shown
    // up in a single careful run", but one run's floor is the median.
    expect(text).toContain("best case");
    expect(text).toContain("7.0e+0");
    expect(text).not.toContain("single careful run");
  });
});

describe("census units — one conversion, m/s² in, milli-g out", () => {
  // 0.1 m/s² amplitude at 7 Hz for 60 s at 100 Hz: rms 0.0707 m/s².
  const t = Array.from({ length: 6000 }, (_, i) => i / 100);
  const y = t.map((s) => 0.1 * Math.sin(2 * Math.PI * 7 * s));

  it("turns an m/s² trace into milli-g once", () => {
    const p = analysisToProfile(analyzeSeries(t, y, { mainsHz: 50, topPeaks: 3 }), "test");
    const expectedRms = (0.1 / Math.SQRT2) * M_S2_TO_MILLIG; // ≈ 7.2 milli-g
    // The residual strips drift, not a 7 Hz line: the rms is the sine's.
    // (The old phone path converted twice: ≈ 102× this.)
    expect(p.noiseRms / expectedRms).toBeGreaterThan(0.95);
    expect(p.noiseRms / expectedRms).toBeLessThan(1.05);
  });

  it("rescales legacy phone rows on read, and nothing else", () => {
    const legacy = { source: "phone-accelerometer", units: "legacy", noise_rms: 102, top_peak_g: 51 };
    const fixed = normalizeRunUnits(legacy);
    expect(fixed.noise_rms).toBeCloseTo(102 / M_S2_TO_MILLIG, 10);
    expect(fixed.top_peak_g).toBeCloseTo(51 / M_S2_TO_MILLIG, 10);
    expect(fixed.units).toBe("milli-g");
    expect(normalizeRunUnits(fixed)).toEqual(fixed); // idempotent
    const csv = { source: "csv-paste", units: "legacy", noise_rms: 3, top_peak_g: 1 };
    expect(normalizeRunUnits(csv)).toBe(csv);
    const current = { source: "phone-accelerometer", units: "milli-g", noise_rms: 1, top_peak_g: 1 };
    expect(normalizeRunUnits(current)).toBe(current);
  });
});
