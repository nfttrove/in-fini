/*
  # Create diagnostic_runs table and seed diagnostic presets

  This migration supports the new "Leakage & Artifact Diagnostic" tab, which
  lets experimenters quantify how much of a claimed anomalous power output
  can be explained by mundane leakage channels (ohmic, RF pickup, blackbody,
  mechanical bleed-through) versus a true unexplained residual.

  1. New Tables
    - `diagnostic_runs`
      - `id` (uuid, primary key)
      - `label` (text) — optional user label
      - `params` (jsonb) — input parameter bag
      - `results` (jsonb) — computed budget + residual + verdict
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `diagnostic_runs`
    - Anonymous users can read all runs (public log)
    - Anonymous users can insert runs
    - No update / no delete

  3. Seed Data
    - Inserts three canonical preset scenarios into `simulation_presets`
      under the new panel slug `diagnostic`:
        * "Wilson 2011 SQUID experiment"
        * "Claimed 1.3 W rotor device"
        * "Shielded cryogenic ideal"
      (only if they do not already exist, matched by name)
*/

CREATE TABLE IF NOT EXISTS diagnostic_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT '',
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  results jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_runs_created
  ON diagnostic_runs (created_at DESC);

ALTER TABLE diagnostic_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'diagnostic_runs' AND policyname = 'Anyone can read diagnostic runs'
  ) THEN
    CREATE POLICY "Anyone can read diagnostic runs"
      ON diagnostic_runs FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'diagnostic_runs' AND policyname = 'Anyone can insert diagnostic runs'
  ) THEN
    CREATE POLICY "Anyone can insert diagnostic runs"
      ON diagnostic_runs FOR INSERT
      TO anon, authenticated
      WITH CHECK (char_length(label) <= 120);
  END IF;
END $$;

INSERT INTO simulation_presets (panel, name, params)
SELECT 'diagnostic', 'Wilson 2011 SQUID experiment', jsonb_build_object(
  'pClaimW',       1.0e-15,
  'vDriveV',       0.05,
  'rDriveOhm',     50,
  'shieldDb',      100,
  'iBiasA',        0,
  'rResOhm',       0,
  'tHotK',         0.05,
  'tColdK',        0.02,
  'aRadM2',        1e-6,
  'emissivity',    0.01,
  'rotorMassKg',   0,
  'rotorAmpNm',    0,
  'fmHz',          5e9,
  'mechQ',         1e6
)
WHERE NOT EXISTS (
  SELECT 1 FROM simulation_presets
  WHERE panel = 'diagnostic' AND name = 'Wilson 2011 SQUID experiment'
);

INSERT INTO simulation_presets (panel, name, params)
SELECT 'diagnostic', 'Claimed 1.3 W rotor device', jsonb_build_object(
  'pClaimW',       1.3,
  'vDriveV',       10,
  'rDriveOhm',     50,
  'shieldDb',      40,
  'iBiasA',        0.1,
  'rResOhm',       0.1,
  'tHotK',         350,
  'tColdK',        300,
  'aRadM2',        1e-4,
  'emissivity',    0.9,
  'rotorMassKg',   1e-9,
  'rotorAmpNm',    1,
  'fmHz',          5e5,
  'mechQ',         1e4
)
WHERE NOT EXISTS (
  SELECT 1 FROM simulation_presets
  WHERE panel = 'diagnostic' AND name = 'Claimed 1.3 W rotor device'
);

INSERT INTO simulation_presets (panel, name, params)
SELECT 'diagnostic', 'Shielded cryogenic ideal', jsonb_build_object(
  'pClaimW',       0,
  'vDriveV',       0.01,
  'rDriveOhm',     50,
  'shieldDb',      120,
  'iBiasA',        0,
  'rResOhm',       0,
  'tHotK',         0.1,
  'tColdK',        0.05,
  'aRadM2',        1e-6,
  'emissivity',    0.005,
  'rotorMassKg',   0,
  'rotorAmpNm',    0,
  'fmHz',          1e9,
  'mechQ',         1e6
)
WHERE NOT EXISTS (
  SELECT 1 FROM simulation_presets
  WHERE panel = 'diagnostic' AND name = 'Shielded cryogenic ideal'
);
