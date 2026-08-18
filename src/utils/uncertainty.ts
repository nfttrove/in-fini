/**
 * Uncertainty propagation for the artifact budgets.
 *
 * Every channel value in the leakage budgets is itself an estimate — the
 * resistance isn't known exactly, the shielding factor is a datasheet
 * promise, the "vibration amplitude" is a guess. A verdict that ignores
 * that overclaims. This module attaches a worst-case-adjacent uncertainty
 * to each budget: all channels share one relative uncertainty u (default
 * 25%, deliberately crude and stated), combined in quadrature.
 *
 * The assessment then refuses to call a residual a discovery unless it
 * exceeds kσ (default 2σ). A residual inside the band is reported as
 * ambiguous — which is the honest statement, not a hedged one.
 */

export const DEFAULT_CHANNEL_SIGMA = 0.25;

/** RSS combination of per-channel uncertainties, each = |value| · relSigma. */
export function combinedSigma(
  values: number[],
  relSigma: number = DEFAULT_CHANNEL_SIGMA
): number {
  return Math.sqrt(
    values.reduce((s, v) => s + Math.pow(Math.abs(v) * relSigma, 2), 0)
  );
}

export interface SigmaAssessment {
  key: "excess-survives" | "ambiguous" | "explained";
  label: string;
  description: string;
}

/**
 * Classify a residual against its uncertainty.
 *   residual > k·σ  → the excess survives the error band
 *   0 < residual ≤ k·σ → present but not yet distinguishable from the budget
 *   residual ≤ 0 → the budget already accounts for the claim
 */
export function assessResidual(
  residual: number,
  sigma: number,
  k: number = 2
): SigmaAssessment {
  if (residual > 0 && sigma > 0 && residual > k * sigma) {
    return {
      key: "excess-survives",
      label: `Excess survives ${k}σ`,
      description: `The unexplained residual is more than ${k}× the combined channel uncertainty. That does not make it anomalous — but it earns a harder look: tighten each channel's measurement before believing anything.`,
    };
  }
  if (residual > 0) {
    return {
      key: "ambiguous",
      label: "Ambiguous within error bars",
      description:
        "A residual exists, but it is inside the combined uncertainty of the mundane channels. It is not yet distinguishable from measurement error. Tighten the inputs (or their uncertainties) before claiming anything.",
    };
  }
  return {
    key: "explained",
    label: "Within budget, uncertainties included",
    description:
      "Even after allowing each channel its uncertainty, the mundane budget accounts for the claim. Nothing is left to explain.",
  };
}
