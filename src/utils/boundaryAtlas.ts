/**
 * The Boundary Atlas: where the app's verdicts flip.
 *
 * Born from the permutation sweeps — random sampling found the surprises
 * (the double-counted channel, the plausibility corner, Podkletnov's
 * fragility); these maps turn those points into terrain. Each map is a
 * 2-D slice through one engine at documented fixed parameters, computed
 * live from the same tested functions the panels use — the atlas can
 * never disagree with the app because it IS the app.
 *
 * Reading a map: filled cells are the verdict at that (x, y); dark lines
 * are verdict boundaries — cross one and the conclusion changes. The
 * σ-boundary (where a residual stops surviving its own error bars) is
 * drawn separately, because that is the boundary a careful experimenter
 * actually cares about.
 */

import { ThrustParams, computeThrustBudget } from "./thrustLeakage";
import { predictDevice } from "./device";
import { predictCqed } from "./circuitQED";
import { assessDecidability } from "./thermalFloor";

export interface AtlasMap {
  key: string;
  title: string;
  xLabel: string;
  yLabel: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  /** Log-scaled axes. */
  log: boolean;
  width: number;
  height: number;
  /** Verdict code per cell, row-major from top (yMax) to bottom (yMin). */
  cells: number[];
  /** Fixed-parameter footnote for honesty. */
  fixed: string;
  /** code -> legend label (order matters for the legend row). */
  legend: { code: number; label: string; color: string }[];
}

const W = 96;
const H = 72;

function xAt(i: number, m: { xMin: number; xMax: number; log: boolean; width: number }) {
  const t = i / (m.width - 1);
  return m.log
    ? Math.exp(Math.log(m.xMin) + t * (Math.log(m.xMax) - Math.log(m.xMin)))
    : m.xMin + t * (m.xMax - m.xMin);
}
function yAt(j: number, m: { yMin: number; yMax: number; log: boolean; height: number }) {
  const t = 1 - j / (m.height - 1); // j=0 is top = yMax
  return m.log
    ? Math.exp(Math.log(m.yMin) + t * (Math.log(m.yMax) - Math.log(m.yMin)))
    : m.yMin + t * (m.yMax - m.yMin);
}

// ---------------------------------------------------------------------------
// A. Thrust verdicts: claim × drive voltage
// ---------------------------------------------------------------------------

const THRUST_BASE: ThrustParams = {
  claimedDeltaG: 0.1,
  driveVoltageV: 10000,
  ambientPressurePa: 101325,
  electrodeGapM: 0.01,
  deviceMassKg: 0.1,
  vibrationAmpNm: 100,
  vibrationFreqHz: 100,
  tempGradientKPerM: 2,
  deviceHeightM: 0.1,
  plateAreaM2: 0.01,
  electrostaticFieldVPerM: 10000,
  cavityGap_nm: 50,
  rotorRadius_um: 0.05,
  modulationDepth_beta: 0.3,
  cavityQ: 10000,
  activeArea_cm2: 1,
  driveFrequency_Hz: 500000,
};

const THRUST_CODE: Record<string, number> = {
  explained: 0,
  partial: 1,
  excess: 2,
  "gross-excess": 3,
};

export function atlasThrust(): AtlasMap {
  const meta = {
    xLabel: "claimed Δg (milli-g)",
    yLabel: "drive voltage (V)",
    xMin: 0.001, xMax: 100, yMin: 1, yMax: 5e4,
    log: true, width: W, height: H,
  };
  const cells: number[] = [];
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const p: ThrustParams = {
        ...THRUST_BASE,
        claimedDeltaG: xAt(i, meta),
        driveVoltageV: yAt(j, meta),
      };
      const b = computeThrustBudget(p);
      // Where the verdict says excess but σ says ambiguous, mark code 4 —
      // the "fragile excess" band the permutation sweep found.
      let code = THRUST_CODE[b.verdict.key] ?? 0;
      if (
        (code === 2 || code === 3) &&
        b.sigmaAssessment.key !== "excess-survives"
      ) {
        code = 4;
      }
      cells.push(code);
    }
  }
  return {
    key: "thrust",
    title: "Thrust verdicts — claim × drive voltage",
    ...meta,
    cells,
    fixed:
      "Fixed: 0.1 kg mass, 100 nm vibration at 100 Hz, 2 K/m gradient, 1 atm, 0.01 m² plates, 10 kV/m stray field.",
    legend: [
      { code: 0, label: "explained", color: "#10b981" },
      { code: 1, label: "partial", color: "#f59e0b" },
      { code: 2, label: "excess", color: "#ef4444" },
      { code: 3, label: "gross-excess", color: "#7f1d1d" },
      { code: 4, label: "excess failing 2σ (fragile)", color: "#a855f7" },
    ],
  };
}

// ---------------------------------------------------------------------------
// B. Device model: plausibility frontier — gap × area
// ---------------------------------------------------------------------------

export function atlasDevice(): AtlasMap {
  const meta = {
    xLabel: "Casimir gap (nm)",
    yLabel: "active area (mm²)",
    xMin: 5, xMax: 500, yMin: 0.1, yMax: 1e4,
    log: true, width: W, height: H,
  };
  const cells: number[] = [];
  const CLAIM_W = 1.3;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const dNm = xAt(i, meta);
      const areaMm2 = yAt(j, meta);
      const p = predictDevice({
        dNm,
        fmHz: 1e6,
        beta: 1.88,
        rotorRadiusNm: 71000,
        Q: 7442,
        areaMm2,
      });
      // 0: far below ceiling; 1: within 10× of claim; 2: ceiling ≥ claim
      // (the "plausible under the generous bound" corner); 3: ditto AND the
      // rotor would already be beyond demonstrated material limits.
      const ratio = CLAIM_W / Math.max(p.P_output, 1e-300);
      let code = 0;
      if (ratio <= 10) code = 1;
      if (ratio <= 1) code = 2;
      if (code === 2 && p.rimAccelerationG > 1e6) code = 3;
      cells.push(code);
    }
  }
  return {
    key: "device",
    title: "Device model — where the 1.3 W claim meets its ceiling",
    ...meta,
    cells,
    fixed:
      "Fixed: 1 MHz drive, β = 1.88, 71 µm rotor (458 m/s rim — see the material veto), Q ≈ 7.4k. Ceiling deliberately generous (π²/720 dropped).",
    legend: [
      { code: 0, label: "claim ≫ ceiling", color: "#1e3a5f" },
      { code: 1, label: "within 10× of ceiling", color: "#f59e0b" },
      { code: 2, label: "ceiling ≥ claim", color: "#ef4444" },
      { code: 3, label: "ceiling ≥ claim, but rotor shatters", color: "#7f1d1d" },
    ],
  };
}

// ---------------------------------------------------------------------------
// C. Circuit QED regimes — boundary wiggle × temperature
// ---------------------------------------------------------------------------

export function atlasCqed(): AtlasMap {
  const meta = {
    xLabel: "boundary wiggle δx (nm)",
    yLabel: "temperature (mK)",
    xMin: 0.1, xMax: 100, yMin: 10, yMax: 3e5,
    log: true, width: W, height: H,
  };
  const cells: number[] = [];
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const p = predictCqed({
        f0GHz: 10,
        Q: 1e5,
        deltaXnm: xAt(i, meta),
        fmGHz: 20,
        tempmK: yAt(j, meta),
        lengthMm: 10,
        integrationS: 100,
      });
      const map: Record<string, number> = {
        "no-signal": 0,
        "thermal-limited": 1,
        clean: 2,
        oscillation: 3,
      };
      cells.push(map[p.verdict.key] ?? 0);
    }
  }
  return {
    key: "cqed",
    title: "Circuit QED — the DCE regime map",
    ...meta,
    cells,
    fixed:
      "Fixed: f₀ = 10 GHz pumped at 2f₀, Q = 10⁵, L = 10 mm, 100 s integration. The vertical edge near δx ≈ 50 nm is the 2Qδx/L threshold.",
    legend: [
      { code: 0, label: "no signal", color: "#1e3a5f" },
      { code: 1, label: "thermal-limited", color: "#f59e0b" },
      { code: 2, label: "pairs measurable", color: "#10b981" },
      { code: 3, label: "above threshold (amplifier)", color: "#ef4444" },
    ],
  };
}

// ---------------------------------------------------------------------------
// D. Decidability — claim size × rig temperature
// ---------------------------------------------------------------------------

export function atlasDecidability(): AtlasMap {
  const meta = {
    xLabel: "claimed Δg (milli-g)",
    yLabel: "rig temperature (K)",
    xMin: 1e-13, xMax: 10, yMin: 0.01, yMax: 400,
    log: true, width: W, height: H,
  };
  const cells: number[] = [];
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const r = assessDecidability(xAt(i, meta), {
        massKg: 0.1,
        freqHz: 100,
        qualityFactor: 100,
        tempK: yAt(j, meta),
        integrationS: 100,
      });
      const map: Record<string, number> = {
        comfortable: 2,
        marginal: 1,
        "sub-thermal": 0,
      };
      cells.push(map[r.verdict.key] ?? 0);
    }
  }
  return {
    key: "decide",
    title: "Decidability — can matter itself arbitrate the claim?",
    ...meta,
    cells,
    fixed:
      "Fixed: 100 g test mass, 100 Hz mode, Q = 100, 100 s integration. The red region's floor is the Brownian jitter of the rig's own atoms.",
    legend: [
      { code: 0, label: "unwitnessable by matter", color: "#7f1d1d" },
      { code: 1, label: "marginal", color: "#f59e0b" },
      { code: 2, label: "decidable", color: "#10b981" },
    ],
  };
}

export function allAtlases(): AtlasMap[] {
  return [atlasThrust(), atlasDevice(), atlasCqed(), atlasDecidability()];
}

/** For canvas rendering: cell code at grid position. */
export function cellAt(map: AtlasMap, i: number, j: number): number {
  return map.cells[j * map.width + i];
}
