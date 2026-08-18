import { describe, it, expect } from "vitest";
import { predictDevice } from "./device";
import { predictCqed, parametricCouplingHz } from "./circuitQED";
import { computeThrustBudget, ThrustParams } from "./thrustLeakage";
import { computeBudget, LeakageParams } from "./leakage";
import { g2Correlations } from "./correlation";
import { seededRandom } from "./residuals";
import { assessDecidability } from "./thermalFloor";

/**
 * The self-hunting engines: deterministic fuzz over every physics module.
 * Born from the permutation sweep that found the double-counted thermal
 * channel — every assertion here is a surprise we already had once and
 * refuse to have again. Runs in CI on every push.
 */

function log(rnd: () => number, lo: number, hi: number) {
  return Math.exp(Math.log(lo) + rnd() * (Math.log(hi) - Math.log(lo)));
}
function lin(rnd: () => number, lo: number, hi: number) {
  return lo + rnd() * (hi - lo);
}

describe("engine fuzz — no invalid outputs anywhere", () => {
  const rnd = seededRandom(4242);

  it("device model stays finite over 20k wild samples", () => {
    for (let i = 0; i < 20000; i++) {
      const p = predictDevice({
        dNm: log(rnd, 1, 1000),
        fmHz: log(rnd, 1e2, 1e8),
        beta: lin(rnd, 0, 6),
        rotorRadiusNm: log(rnd, 1, 1e6),
        Q: log(rnd, 1, 1e7),
        areaMm2: log(rnd, 0.001, 1e4),
      });
      expect(isFinite(p.P_output)).toBe(true);
      expect(isFinite(p.rimAccelerationG)).toBe(true);
    }
  });

  it("circuit QED stays finite and its threshold invariant holds", () => {
    for (let i = 0; i < 20000; i++) {
      const s = {
        f0GHz: lin(rnd, 4, 12),
        Q: log(rnd, 1e4, 1e6),
        deltaXnm: log(rnd, 0.1, 100),
        fmGHz: 0,
        tempmK: lin(rnd, 10, 300),
        lengthMm: log(rnd, 5, 20),
        integrationS: 100,
      };
      s.fmGHz = 2 * s.f0GHz;
      const p = predictCqed(s);
      expect(isFinite(p.pairRateHz)).toBe(true);
      // On resonance the threshold ratio must equal 2Qδx/L exactly.
      const predicted = (2 * s.Q * s.deltaXnm * 1e-9) / (s.lengthMm * 1e-3);
      expect(Math.abs(p.thresholdRatio - predicted) / predicted).toBeLessThan(1e-9);
    }
  });

  it("no two budget channels are duplicates (double-count regression)", () => {
    for (let i = 0; i < 500; i++) {
      const p: ThrustParams = {
        claimedDeltaG: log(rnd, 0.001, 100),
        driveVoltageV: log(rnd, 100, 5e4),
        ambientPressurePa: lin(rnd, 100, 101325),
        electrodeGapM: log(rnd, 1e-3, 0.1),
        deviceMassKg: log(rnd, 0.01, 5),
        vibrationAmpNm: log(rnd, 10, 5000),
        vibrationFreqHz: lin(rnd, 5, 900),
        tempGradientKPerM: lin(rnd, 0.1, 20),
        deviceHeightM: log(rnd, 0.005, 2),
        plateAreaM2: log(rnd, 1e-4, 1),
        electrostaticFieldVPerM: log(rnd, 100, 1e6),
        cavityGap_nm: lin(rnd, 10, 500),
        rotorRadius_um: log(rnd, 0.01, 1e3),
        modulationDepth_beta: lin(rnd, 0, 2),
        cavityQ: log(rnd, 1e2, 1e6),
        activeArea_cm2: log(rnd, 0.01, 1e2),
        driveFrequency_Hz: log(rnd, 1e3, 1e8),
      };
      const ch = computeThrustBudget(p).channels;
      expect(ch).toHaveLength(4);
      for (let a = 0; a < ch.length; a++) {
        for (let b = a + 1; b < ch.length; b++) {
          const rel =
            Math.abs(ch[a].valueG - ch[b].valueG) /
            Math.max(Math.abs(ch[a].valueG), Math.abs(ch[b].valueG), 1e-30);
          expect(rel).toBeGreaterThan(1e-6);
        }
      }
      expect(isFinite(computeThrustBudget(p).sigmaG)).toBe(true);
    }
  });

  it("power budget and correlations stay finite", () => {
    for (let i = 0; i < 5000; i++) {
      const p: LeakageParams = {
        pClaimW: log(rnd, 1e-3, 1e4),
        vDriveV: log(rnd, 1, 1e3),
        rDriveOhm: log(rnd, 1, 1e3),
        shieldDb: lin(rnd, 0, 120),
        iBiasA: log(rnd, 1e-3, 5),
        rResOhm: log(rnd, 0.01, 100),
        tHotK: lin(rnd, 300, 1000),
        tColdK: lin(rnd, 77, 300),
        aRadM2: log(rnd, 1e-5, 0.01),
        emissivity: lin(rnd, 0.02, 1),
        rotorMassKg: log(rnd, 1e-9, 1),
        rotorAmpNm: log(rnd, 0.1, 1e4),
        fmHz: log(rnd, 1e2, 1e7),
        mechQ: log(rnd, 1, 1e6),
      };
      const b = computeBudget(p);
      expect(isFinite(b.totalLeakageW) && isFinite(b.sigmaW)).toBe(true);

      const r = g2Correlations(log(rnd, 1e-4, 1e2), log(rnd, 1e-9, 1e3));
      expect(isFinite(r.g12) && isFinite(r.csRatio)).toBe(true);
      expect(r.csRatio).toBeLessThanOrEqual((2 + 1 / 1e-4) ** 2 / 4 + 1e-6);
    }
  });

  it("decidability always returns a usable verdict", () => {
    for (let i = 0; i < 2000; i++) {
      const v = assessDecidability(log(rnd, 1e-13, 10), {
        massKg: log(rnd, 0.01, 5),
        freqHz: lin(rnd, 10, 500),
        qualityFactor: 100,
        tempK: log(rnd, 0.01, 400),
        integrationS: log(rnd, 1, 1e5),
      });
      expect(["comfortable", "marginal", "sub-thermal"]).toContain(v.verdict.key);
    }
  });

  it("parametric coupling is monotone in displacement", () => {
    const base = {
      f0GHz: 10, Q: 1e5, deltaXnm: 1, fmGHz: 20,
      tempmK: 20, lengthMm: 10, integrationS: 100,
    };
    const a = parametricCouplingHz(base);
    const b = parametricCouplingHz({ ...base, deltaXnm: 2 });
    expect(b).toBeCloseTo(2 * a, 8);
  });
});
