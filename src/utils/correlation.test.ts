import { describe, it, expect } from "vitest";
import { g2Correlations } from "./correlation";

describe("g2Correlations", () => {
  it("reproduces the ideal two-mode squeezed result g₁₂ = 2 + 1/n̄", () => {
    for (const n of [0.05, 0.5, 2, 10]) {
      const r = g2Correlations(n, 0);
      expect(r.g12).toBeCloseTo(2 + 1 / n, 10);
    }
  });

  it("violates the classical bound for any pure pair number", () => {
    for (const n of [0.01, 1, 100]) {
      const r = g2Correlations(n, 0);
      expect(r.violation).toBe(true);
      expect(r.csRatio).toBeGreaterThan(1);
    }
  });

  it("is safely classical for pure thermal light", () => {
    const r = g2Correlations(0, 5);
    expect(r.g12).toBeCloseTo(1, 12);
    expect(r.csRatio).toBeCloseTo(0.25, 12);
    expect(r.violation).toBe(false);
  });

  it("thermal contamination pulls a pair state back under the bound", () => {
    const clean = g2Correlations(0.5, 0);
    expect(clean.violation).toBe(true);
    const dirty = g2Correlations(0.5, 50);
    expect(dirty.violation).toBe(false);
    expect(dirty.label).toContain("masked");
  });

  it("handles the empty-everything edge case", () => {
    const r = g2Correlations(0, 0);
    expect(r.g12).toBe(1);
    expect(r.violation).toBe(false);
  });
});
