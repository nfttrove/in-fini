/*
  # Claim Registry — public artifact-budget filings

  Purpose: a public ledger where anyone can file an anomalous
  power/thrust claim together with the artifact budget the app computes
  for it. The scientific value is the *record*: claim + parameters +
  verdict, reproducible by anyone running the same app version.

  Access model:
    - SELECT: public (anon + authenticated), RLS USING(true) — a registry
      nobody can read is pointless.
    - INSERT: open to anon, but bounded (title 3–80 chars, known claim
      types, finite positive value, jsonb payloads capped at 4 KB,
      matching the conventions of 20260710003928).
    - DELETE: intentionally none in v1. Registry entries are a public
      record; a delete path would need moderation semantics (owner
      tokens like simulation_presets, or admin review) that don't exist
      yet. Don't file secrets; don't file anything you'll want back.

  If spam becomes a problem, the next migration should add per-source
  rate limiting or moderation, not loosen these bounds.
*/

CREATE TABLE IF NOT EXISTS claim_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_type text NOT NULL CHECK (claim_type IN ('power', 'thrust')),
  title text NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 80),
  claimed_value numeric NOT NULL CHECK (claimed_value > 0 AND claimed_value < 1e12),
  claimed_unit text NOT NULL DEFAULT '',
  verdict_key text NOT NULL DEFAULT '',
  verdict_label text NOT NULL DEFAULT '',
  residual_fraction numeric NOT NULL DEFAULT 0,
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS claim_registry_created_idx
  ON claim_registry (created_at DESC);

ALTER TABLE claim_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "claim_registry_public_read" ON claim_registry;
CREATE POLICY "claim_registry_public_read"
  ON claim_registry FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "claim_registry_open_insert" ON claim_registry;
CREATE POLICY "claim_registry_open_insert"
  ON claim_registry FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(title) >= 3
    AND char_length(title) <= 80
    AND claim_type IN ('power', 'thrust')
    AND claimed_value > 0
    AND claimed_value < 1e12
    AND length(params::text) <= 4096
  );

GRANT SELECT, INSERT ON TABLE claim_registry TO anon, authenticated;
