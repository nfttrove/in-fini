import { describe, it, expect } from "vitest";
import {
  thermalOccupation,
  parametricCouplingHz,
  predictCqed,
  CircuitQEDParams,
} from "./circuitQED";

const BASE: CircuitQEDParams = {
  f0GHz: 10,
  Q: 1e5,
  deltaXnm: 1,
  fmGHz: 20, // on the 2·f0 resonance
  tempmK: 20,
  lengthMm: 10,
  integrationS: 100,
};

describe("thermalOccupation", () => {
  it("is zero at zero temperature", () => {
    expect(thermalOccupation(1e10, 0)).toBe(0);
  });

  it("approaches kT/hf (classical) at high temperature", () => {
    // hf/kT = 0.048 at 100 GHz, 100 K → n̄ = 1/(e^x − 1) ≈ 20.3
    const n = thermalOccupation(1e11, 100);
    expect(n).toBeCloseTo(20.3, 0);
  });

  it("is negligible for 10 GHz at 20 mK", () => {
    const n = thermalOccupation(1e10, 0.02);
    expect(n).toBeLessThan(1e-9);
    expect(n).toBeGreaterThan(1e-12);
  });

  it("never overflows at extreme cold", () => {
    expect(thermalOccupation(1e10, 1e-9)).toBe(0);
  });
});

describe("parametricCouplingHz", () => {
  it("peaks on the 2·f0 resonance", () => {
    const on = parametricCouplingHz(BASE);
    const off = parametricCouplingHz({ ...BASE, fmGHz: 21 });
    expect(on).toBeGreaterThan(off);
    expect(off).toBeLessThan(on / 2); // 1 GHz off a 100 kHz linewidth
  });

  it("scales linearly with boundary displacement", () => {
    const a = parametricCouplingHz(BASE);
    const b = parametricCouplingHz({ ...BASE, deltaXnm: 2 });
    expect(b).toBeCloseTo(2 * a, 6);
  });
});

describe("predictCqed (Wilson-2011-style defaults)", () => {
  const pred = predictCqed(BASE);

  it("computes a sensible linewidth", () => {
    expect(pred.kappaHz).toBeCloseTo(1e5, -1); // f0/Q = 10 GHz / 1e5
  });

  it("stays below the parametric threshold", () => {
    expect(pred.aboveThreshold).toBe(false);
    expect(pred.thresholdRatio).toBeLessThan(1);
  });

  it("produces pairs at an experimentally realistic rate", () => {
    // (δx/L)·f0 = (1e-9/1e-2)·1e10 = 1e3 Hz; λ²/κ = 1e6/1e5 = 10 pairs/s.
    // Order 1–100 pairs/s is the league the real experiments play in.
    expect(pred.pairRateHz).toBeGreaterThan(0.1);
    expect(pred.pairRateHz).toBeLessThan(1e4);
  });

  it("finds a clean vacuum-pair verdict in the cold, resonant regime", () => {
    expect(pred.verdict.key).toBe("clean");
    expect(pred.snr).toBeGreaterThan(3);
  });

  it("effective boundary velocity is honest (and modest!)", () => {
    // 2π·fm·δx = 2π·2e10·1e-9 ≈ 126 m/s — far slower than a jet, yet the
    // resonance + Q + cryogenics make it measurable. The GHz trick is not
    // about speed.
    expect(pred.vEff).toBeCloseTo(125.66, 1);
  });

  it("drowns in thermal photons at room temperature", () => {
    const warm = predictCqed({ ...BASE, tempmK: 300000 });
    expect(warm.verdict.key).toBe("thermal-limited");
    expect(warm.thermalFluxHz).toBeGreaterThan(warm.pairRateHz * 100);
  });

  it("crosses into parametric oscillation with a hard pump", () => {
    // δx big enough that 2λ ≥ κ: λ = (δx/L)f0 ≥ 5e4 → δx ≥ 50 nm.
    const osc = predictCqed({ ...BASE, deltaXnm: 100 });
    expect(osc.aboveThreshold).toBe(true);
    expect(osc.verdict.key).toBe("oscillation");
  });

  it("reports no signal when far off resonance", () => {
    const lost = predictCqed({ ...BASE, fmGHz: 15 });
    expect(lost.verdict.key).toBe("no-signal");
  });
});
