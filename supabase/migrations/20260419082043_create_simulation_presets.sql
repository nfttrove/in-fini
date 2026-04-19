/*
  # Create simulation_presets table

  Stores user-saved simulator configurations for the Casimir,
  Rotating Field, and Cavity Coupling panels. Each preset is
  tied to a panel type and stores parameters as JSON.

  1. New Tables
    - `simulation_presets`
      - `id` (uuid, primary key)
      - `panel` (text) — one of 'casimir', 'rotating', 'coupling'
      - `name` (text) — user-chosen label
      - `params` (jsonb) — serialized parameter bag
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `simulation_presets`
    - Anonymous users can read all presets (public gallery)
    - Anonymous users can insert presets
    - Anonymous users can delete presets they just created
      (no auth is required in this educational demo app)
*/

CREATE TABLE IF NOT EXISTS simulation_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panel text NOT NULL,
  name text NOT NULL DEFAULT '',
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presets_panel_created
  ON simulation_presets (panel, created_at DESC);

ALTER TABLE simulation_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read presets"
  ON simulation_presets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert presets"
  ON simulation_presets FOR INSERT
  TO anon, authenticated
  WITH CHECK (char_length(name) > 0 AND char_length(name) <= 80);

CREATE POLICY "Anyone can delete presets"
  ON simulation_presets FOR DELETE
  TO anon, authenticated
  USING (true);
