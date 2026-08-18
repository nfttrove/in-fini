/*
  # Pre-registrations — commit to a prediction before the experiment

  Registry v2. A pre-registration binds (title, claim type, magnitude) to a
  timestamp BEFORE data is taken. When a claim is later filed, the client
  recomputes the canonical hash and matches it against these rows: a filed
  claim that matches a prior pre-registration is flagged "pre-registered",
  which is the cheapest scientific-integrity upgrade a web app can offer —
  discoveries get believed when predicted in advance.

  The hash is computed client-side (Web Crypto SHA-256) over a canonical
  string with the claimed value at 6 significant digits, so float noise in
  the UI does not break matching. It is a commitment device, not a secret:
  the pre-registered row itself is public, so anyone can verify the match
  by recomputing the same canonical string from the filed claim.

  Access model mirrors claim_registry: public read, bounded anonymous
  insert, no delete (a pre-registration you could delete would be worth
  nothing). Param payloads capped at 4 KB per the 20260710003928 convention.
*/

CREATE TABLE IF NOT EXISTS preregistrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_type text NOT NULL CHECK (claim_type IN ('power', 'thrust')),
  title text NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 80),
  claimed_value numeric NOT NULL CHECK (claimed_value > 0 AND claimed_value < 1e12),
  claimed_unit text NOT NULL DEFAULT '',
  param_hash text NOT NULL CHECK (char_length(param_hash) = 64),
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS preregistrations_param_hash_idx
  ON preregistrations (param_hash);

CREATE INDEX IF NOT EXISTS preregistrations_created_idx
  ON preregistrations (created_at DESC);

ALTER TABLE preregistrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "preregistrations_public_read" ON preregistrations;
CREATE POLICY "preregistrations_public_read"
  ON preregistrations FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "preregistrations_open_insert" ON preregistrations;
CREATE POLICY "preregistrations_open_insert"
  ON preregistrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(title) >= 3
    AND char_length(title) <= 80
    AND claim_type IN ('power', 'thrust')
    AND claimed_value > 0
    AND claimed_value < 1e12
    AND char_length(param_hash) = 64
    AND length(params::text) <= 4096
  );

GRANT SELECT, INSERT ON TABLE preregistrations TO anon, authenticated;
