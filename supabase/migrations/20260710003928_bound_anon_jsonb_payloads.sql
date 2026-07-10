/*
  # Bound anonymous jsonb payload sizes

  ## Problem
  anon can INSERT into `simulation_presets` and `diagnostic_runs`. The INSERT
  policies bound only the text labels (name <= 80, label <= 120); the jsonb
  payloads are unbounded, so one anonymous request can store a multi-megabyte
  blob — and `diagnostic_runs` has no delete path to clean it up afterwards.
  This is a storage / abuse vector, not a data breach.

  ## Fix
  Cap each anon-writable jsonb column at 4 KB of serialized text (~10x the
  largest real payload — a preset bag is a few hundred bytes). Constraints are
  added NOT VALID so the migration cannot fail on a pre-existing oversized row
  and does not rewrite existing data; they are enforced on every INSERT and
  UPDATE from this point forward.

  Per-source rate limiting (row count) is a platform concern, not expressible
  as a column constraint, and is intentionally out of scope here. 4096 is a
  round, generous cap — tighten it if you ever want less headroom.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'simulation_presets_params_size'
  ) THEN
    ALTER TABLE simulation_presets
      ADD CONSTRAINT simulation_presets_params_size
      CHECK (length(params::text) <= 4096) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'diagnostic_runs_params_size'
  ) THEN
    ALTER TABLE diagnostic_runs
      ADD CONSTRAINT diagnostic_runs_params_size
      CHECK (length(params::text) <= 4096) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'diagnostic_runs_results_size'
  ) THEN
    ALTER TABLE diagnostic_runs
      ADD CONSTRAINT diagnostic_runs_results_size
      CHECK (length(results::text) <= 4096) NOT VALID;
  END IF;
END $$;
