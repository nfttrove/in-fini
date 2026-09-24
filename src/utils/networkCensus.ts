/**
 * Fleet statistics for the Replication Network's calibration census.
 *
 * The point of the census: measure what the fleet's tables actually look
 * like before anyone plans a replication round. Averaging N independent
 * measurements of the *same* effect improves sensitivity as 1/√N, so if
 * every rig measured one effect at the same time with independent noise,
 * the pooled floor would be about the median rig noise divided by √N.
 * That is a best case for a coordinated round, not something the census
 * measures: census runs are different tables at different times, and on
 * its own each rig sees roughly the median noise.
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
  /** median / √n — best case for a coordinated round (same effect, same time). */
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
  return `Across ${stats.n} filed runs (median noise ${stats.medianNoise.toExponential(1)} milli-g), a coordinated round of that many independent rigs — every rig measuring the same effect at the same time, with independent noise — could in principle average down to about ${stats.collectiveFloor.toExponential(1)} milli-g. That is the best case to plan a replication round against, not something this census measured: on its own, a typical rig here sees about ${stats.medianNoise.toExponential(1)} milli-g.`;
}
