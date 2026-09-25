/**
 * Which filed claims count as pre-registered: a pre-registration with the
 * same canonical hash must have been filed strictly *before* the claim.
 * Matching on the hash alone (as the registry once did) let a prediction
 * filed after the result earn the badge. The comparison needs timestamps
 * the client cannot set: migration 20260924130000 made the database stamp
 * them, but it was never applied (the database was shut down first).
 */
export function preregisteredClaimIds(
  claims: { id: string; created_at: string; hash: string }[],
  preregs: { param_hash: string; created_at: string }[]
): Set<string> {
  const earliest = new Map<string, number>();
  for (const p of preregs) {
    const t = Date.parse(p.created_at);
    if (!isFinite(t)) continue;
    const seen = earliest.get(p.param_hash);
    if (seen === undefined || t < seen) earliest.set(p.param_hash, t);
  }
  const out = new Set<string>();
  for (const c of claims) {
    const filed = Date.parse(c.created_at);
    const predicted = earliest.get(c.hash);
    if (predicted !== undefined && isFinite(filed) && predicted < filed) out.add(c.id);
  }
  return out;
}
