import { describe, it, expect } from "vitest";
import { fleetStats, collectiveBoundStatement } from "./networkCensus";

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
    expect(text).toContain("10 independent rigs");
    expect(text).toContain("2.2e+0"); // 7/√10 ≈ 2.214
  });
});
