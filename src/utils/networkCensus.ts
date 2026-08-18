/**
 * Fleet statistics for the Replication Network's calibration census.
 *
 * The point of the census: N independent rigs, each with its own noise
 * floor, together define what the network could collectively detect.
 * Averaging N independent measurements improves sensitivity as 1/√N —
 * the same √N that sets the per-channel allowance in the design
 * inverter — so the fleet's collective floor is the median rig noise
 * divided by √N. That number is the honest answer to "what could this
 * crowd ever see?" before any replication round is run.
 */

export interface RunProfile {
  noise_rms: number; // milli-g
  mains_hz: number; // 0 | 50 | 60
}

export interface FleetStats {
  n: number;
  medianNoise: number;
  quietestNoise: number;
  noisiestNoise: number;
  /** median / √n — what pooled averaging could in principle reach. */
  collectiveFloor: number;
  mains50: number;
  mains60: number;
  mainsNone: number;
  /** Fraction of rigs quieter than the given percentile boundary. */
  percentileOf: (noise: number) => number;
}

export function fleetStats(runs: RunProfile[]): FleetStats {
  const n = runs.length;
  const sorted = runs.map((r) => r.noise_rms).sort((a, b) => a - b);
  const median = n > 0 ? sorted[Math.floor(n / 2)] : 0;
  return {
    n,
    medianNoise: median,
    quietestNoise: n > 0 ? sorted[0] : 0,
    noisiestNoise: n > 0 ? sorted[n - 1] : 0,
    collectiveFloor: n > 0 ? median / Math.sqrt(n) : 0,
    mains50: runs.filter((r) => r.mains_hz === 50).length,
    mains60: runs.filter((r) => r.mains_hz === 60).length,
    mainsNone: runs.filter((r) => r.mains_hz === 0).length,
    percentileOf: (noise: number) =>
      n === 0
        ? 0
        : sorted.filter((v) => v < noise).length / n,
  };
}

/**
 * The network's first citable sentence: the collective bound a census of
 * N rigs places on any effect the fleet could have seen.
 */
export function collectiveBoundStatement(stats: FleetStats): string {
  if (stats.n === 0) {
    return "No runs filed yet — the fleet has no eyes. File the first 60-second census run.";
  }
  if (stats.n < 5) {
    return `Only ${stats.n} run${stats.n === 1 ? "" : "s"} filed — the floor is still one rig's floor. The census starts meaning something around a dozen independent rigs.`;
  }
  return `Across ${stats.n} independent rigs (median noise ${stats.medianNoise.toExponential(1)} mΔg), pooled averaging could in principle reach ${stats.collectiveFloor.toExponential(1)} mΔg. Any claimed effect smaller than that is invisible to this fleet — any effect larger should already have shown up in a single careful run.`;
}
