/**
 * Microwave dynamic Casimir effect in a circuit-QED setup — the regime where
 * vacuum photon production has actually been measured (Wilson et al.,
 * Nature 479, 376 (2011)).
 *
 * The physical picture:
 *   A half-wave transmission-line resonator (fundamental f0, linewidth
 *   κ = f0/Q) is terminated by a SQUID. Its flux-tunable inductance behaves
 *   as an "effective mirror" whose electrical position oscillates,
 *   x_eff(t) = x0 + δx·sin(2π fm·t). Modulating at fm ≈ 2·f0 drives degenerate
 *   parametric down-conversion of vacuum into photon PAIRS — the DCE.
 *
 * Why this works when spinning rotors never can:
 *   1. Parametric resonance at 2ω₀ needs fm = 2·f0. For a 100 nm optical
 *      cavity f0 ~ 10¹⁵ Hz — unmodulatable. For a 10 GHz microwave resonator
 *      it is just electronics.
 *   2. The pair rate scales with the loaded Q (rate ≈ (δx/L)²·f0·Q on
 *      resonance), so a high-Q resonator multiplies a nanometre wiggle.
 *   3. At millikelvin temperatures the thermal photon occupation of a
 *      microwave mode is ~0, so a handful of pairs per second is signal.
 *
 * Precision policy (same convention as device.ts): order-of-magnitude
 * formulas with O(1) prefactors dropped, assumptions stated, so the numbers
 * are generous ceilings / clean scales rather than first-principles rates.
 */

export const HBAR = 1.054571817e-34;
export const H = 6.62607015e-34;
export const KB = 1.380649e-23;
export const C = 2.99792458e8;

export interface CircuitQEDParams {
  /** Resonator fundamental frequency, GHz (typical 4–12). */
  f0GHz: number;
  /** Loaded quality factor (coplanar-waveguide resonators: 1e4–1e6). */
  Q: number;
  /** Effective boundary displacement amplitude, nanometres. */
  deltaXnm: number;
  /** Modulation (pump) frequency, GHz. */
  fmGHz: number;
  /** Mixing-chamber temperature, millikelvin. */
  tempmK: number;
  /** Resonator electrical length, millimetres. */
  lengthMm: number;
  /** Detection integration time, seconds. */
  integrationS: number;
}

export type CqedVerdictKey =
  | "no-signal"
  | "thermal-limited"
  | "clean"
  | "oscillation";

export interface CqedVerdict {
  key: CqedVerdictKey;
  label: string;
  description: string;
  tone: "emerald" | "amber" | "orange" | "red";
}

export interface CqedPrediction {
  f0Hz: number;
  kappaHz: number;
  thermalOccupation: number;
  thermalFluxHz: number;
  lambdaHz: number;
  detuningHz: number;
  resonanceFactor: number;
  pairRateHz: number;
  photonRateHz: number;
  /** 2λ/κ — at ≥ 1 the pump overcomes damping: parametric oscillation. */
  thresholdRatio: number;
  aboveThreshold: boolean;
  /** Peak velocity of the effective boundary, m/s. */
  vEff: number;
  vEffOverC: number;
  /** Counting-statistics signal-to-noise for vacuum pairs vs thermal noise. */
  snr: number;
  expectedPairs: number;
  verdict: CqedVerdict;
}

/** Bose–Einstein occupation of one mode at frequency f and temperature T. */
export function thermalOccupation(fHz: number, tK: number): number {
  if (tK <= 0) return 0;
  const x = (H * fHz) / (KB * tK);
  if (x > 700) return 0; // exp overflow guard; e^-700 is already zero
  return 1 / (Math.exp(x) - 1);
}

/**
 * Parametric coupling strength for a boundary displaced by δx inside a
 * resonator of electrical length L, pumped at fm, referenced to the
 * two-photon resonance 2·f0 with the same Lorentzian response the Cavity
 * Coupling panel uses (γ = κ):
 *   λ = (δx/L)·f0 / √(1 + (2·δ/κ)²)
 */
export function parametricCouplingHz(p: CircuitQEDParams): number {
  const f0Hz = p.f0GHz * 1e9;
  const kappaHz = f0Hz / p.Q;
  const detuning = p.fmGHz * 1e9 - 2 * f0Hz;
  const resonance =
    1 / Math.sqrt(1 + Math.pow((2 * detuning) / kappaHz, 2));
  return (p.deltaXnm * 1e-9) / (p.lengthMm * 1e-3) * f0Hz * resonance;
}

export function predictCqed(p: CircuitQEDParams): CqedPrediction {
  const f0Hz = p.f0GHz * 1e9;
  const kappaHz = f0Hz / p.Q;
  const tK = p.tempmK * 1e-3;

  const nBar = thermalOccupation(f0Hz, tK);
  const thermalFluxHz = nBar * kappaHz;

  const lambdaHz = parametricCouplingHz(p);
  const detuningHz = p.fmGHz * 1e9 - 2 * f0Hz;
  const resonanceFactor =
    1 / Math.sqrt(1 + Math.pow((2 * detuningHz) / kappaHz, 2));

  const thresholdRatio = (2 * lambdaHz) / kappaHz;
  const aboveThreshold = thresholdRatio >= 1;

  // Below threshold (λ < κ/2): spontaneous vacuum pair flux ~ λ²/κ.
  // Above threshold the mode builds up coherently (parametric oscillation);
  // the vacuum-pair attribution no longer holds, so we do not extrapolate.
  const pairRateHz = aboveThreshold ? 0 : (lambdaHz * lambdaHz) / kappaHz;
  const photonRateHz = 2 * pairRateHz;

  const vEff = 2 * Math.PI * p.fmGHz * 1e9 * p.deltaXnm * 1e-9;

  const expectedPairs = pairRateHz * p.integrationS;
  const noise = Math.sqrt(
    (pairRateHz + thermalFluxHz) * Math.max(p.integrationS, 0)
  );
  const snr = noise > 0 ? (pairRateHz * p.integrationS) / noise : 0;

  return {
    f0Hz,
    kappaHz,
    thermalOccupation: nBar,
    thermalFluxHz,
    lambdaHz,
    detuningHz,
    resonanceFactor,
    pairRateHz,
    photonRateHz,
    thresholdRatio,
    aboveThreshold,
    vEff,
    vEffOverC: vEff / C,
    snr,
    expectedPairs,
    verdict: classifyVerdict(p, pairRateHz, thermalFluxHz, aboveThreshold, snr),
  };
}

function classifyVerdict(
  p: CircuitQEDParams,
  pairRateHz: number,
  thermalFluxHz: number,
  aboveThreshold: boolean,
  snr: number
): CqedVerdict {
  if (aboveThreshold) {
    return {
      key: "oscillation",
      label: "Above parametric threshold",
      description:
        "The pump overcomes cavity damping (2λ ≥ κ). Output is dominated by stimulated parametric oscillation — a useful amplifier, but photons can no longer be attributed to the vacuum.",
      tone: "orange",
    };
  }
  if (pairRateHz < 1e-6) {
    return {
      key: "no-signal",
      label: "No measurable pair production",
      description:
        "The coupling is too weak or too far off the 2·f0 resonance to produce pairs at any measurable rate. Move fm to 2·f0, increase δx, or raise Q.",
      tone: "amber",
    };
  }
  if (thermalFluxHz > pairRateHz) {
    return {
      key: "thermal-limited",
      label: "Thermal photons dominate",
      description: `The mode carries ~${thermalFluxHz.toExponential(1)} thermal photons/s against ${pairRateHz.toExponential(1)} vacuum pairs/s. Cool the resonator further (at ${p.f0GHz.toFixed(1)} GHz you need tens of mK) — this is why the real experiment lives in a dilution refrigerator.`,
      tone: "red",
    };
  }
  if (snr < 3) {
    return {
      key: "thermal-limited",
      label: "Pairs produced but statistics-limited",
      description:
        "Vacuum pairs dominate the rates but the integration time is too short for a significant count. Integrate longer (SNR grows as √t).",
      tone: "amber",
    };
  }
  return {
    key: "clean",
    label: "Vacuum pairs measurable",
    description:
      "Pair production exceeds thermal noise with counting significance ≥ 3σ — the regime of the 2011 microwave DCE measurements. Correlation spectroscopy (g² coincidence of the pair photons) is what seals the vacuum origin in a real experiment.",
    tone: "emerald",
  };
}
