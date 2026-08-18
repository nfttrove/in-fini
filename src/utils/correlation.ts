/**
 * Photon-correlation spectroscopy for the microwave DCE: the measurement
 * that distinguishes vacuum photon PAIRS from a mundane hot resistor.
 *
 * For a zero-mean Gaussian two-mode field (thermal bath + two-mode squeezed
 * vacuum from the parametric pump), the normally-ordered correlations are
 * exact Gaussian-moment results:
 *
 *   g₁₂(0) = ⟨a₁†a₂†a₂a₁⟩ / (n̄₁ n̄₂)
 *          = 1 + |⟨a₁a₂⟩|² / (n̄₁ n̄₂)
 *          = 1 + n_p(n_p+1) / (n_p + n_th)²
 *
 *   g₁₁(0) = 2   (the marginal of a two-mode squeezed state is thermal;
 *                 adding a thermal bath keeps it thermal — Bose statistics)
 *
 * with n_p the intracavity pair number (n_p = (λ/κ)² on resonance) and
 * n_th the thermal occupation of each mode.
 *
 * The classical Cauchy–Schwarz bound says g₁₂² ≤ g₁₁·g₂₂ for ANY classical
 * (positive-P) light. Vacuum pairs violate it:
 *   pure pairs (n_th = 0):  g₁₂ = 2 + 1/n_p  →  R = g₁₂²/4 > 1 for all n_p
 *   pure thermal (n_p = 0): g₁₂ = 1          →  R = 1/4, safely classical
 *
 * This is the actual criterion the microwave-DCE experiments leaned on
 * (Löfnäs et al. / Wilson et al. lineage): rates alone never prove vacuum
 * origin; coincidences do.
 */

export interface CorrelationResult {
  /** Pair number per mode from the pump. */
  pairNumber: number;
  /** Thermal occupation per mode. */
  thermalNumber: number;
  g12: number;
  g11: number;
  /** Cauchy–Schwarz ratio R = g₁₂² / (g₁₁·g₂₂). R > 1 violates the
   * classical bound — nonclassical pair correlations. */
  csRatio: number;
  violation: boolean;
  label: string;
  description: string;
}

export function g2Correlations(
  pairNumber: number,
  thermalNumber: number
): CorrelationResult {
  const n_p = Math.max(0, pairNumber);
  const n_th = Math.max(0, thermalNumber);
  const nTot = n_p + n_th;

  let g12: number;
  if (nTot <= 0) {
    g12 = 1; // vacuum in both modes: undefined formally, classical limit
  } else {
    g12 = 1 + (n_p * (n_p + 1)) / (nTot * nTot);
  }
  const g11 = nTot > 0 ? 2 : 1;
  const csRatio = (g12 * g12) / (g11 * g11);

  const violation = csRatio > 1;

  let label: string;
  let description: string;
  if (nTot <= 0) {
    label = "No light at all";
    description =
      "Both modes empty: no correlations to measure. Turn up the pump (pairs) or the temperature (thermal photons).";
  } else if (violation) {
    label = "Nonclassical pairs (Cauchy–Schwarz violated)";
    description = `g₁₂² = ${(g12 * g12).toFixed(2)} exceeds the classical bound g₁₁·g₂₂ = ${(g11 * g11).toFixed(2)}. Coincidences between the two output modes exceed anything a hot resistor can produce — the pair signature of the dynamical Casimir effect.`;
  } else if (n_p > 0) {
    label = "Pairs present but thermally masked";
    description = `Vacuum pairs exist (${n_p.toExponential(1)} per mode) but thermal photons (${n_th.toExponential(1)} per mode) wash out the correlations below the classical bound. This trace would be indistinguishable from noise heating. Cool the experiment or pump harder.`;
  } else {
    label = "Purely classical light";
    description =
      "Thermal light only: g₁₂ = 1, well inside the classical bound. Exactly what a hot resistor looks like — and why count rates alone never prove anything.";
  }

  return { pairNumber: n_p, thermalNumber: n_th, g12, g11, csRatio, violation, label, description };
}
