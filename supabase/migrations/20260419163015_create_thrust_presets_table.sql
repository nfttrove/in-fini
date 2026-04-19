/*
  # Create Thrust Presets Table

  1. New Tables
    - `thrust_presets`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Preset name (e.g., "Podkletnov Effect (1992)")
      - `tagline` (text) - Short description of the claim
      - `verdict` (text) - Expected result when preset is loaded
      
      - Force artifact parameters:
        - `claimed_delta_g` (numeric)
        - `drive_voltage_v` (numeric)
        - `ambient_pressure_pa` (numeric)
        - `electrode_gap_m` (numeric)
        - `device_mass_kg` (numeric)
        - `vibration_amp_nm` (numeric)
        - `vibration_freq_hz` (numeric)
        - `temp_gradient_k_per_m` (numeric)
        - `device_height_m` (numeric)
        - `plate_area_m2` (numeric)
        - `electrostatic_field_v_per_m` (numeric)
      
      - DCE cavity parameters:
        - `cavity_gap_nm` (numeric)
        - `rotor_radius_um` (numeric)
        - `modulation_depth_beta` (numeric)
        - `cavity_q` (numeric)
        - `active_area_cm2` (numeric)
        - `drive_frequency_hz` (numeric)
      
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `thrust_presets` table
    - Add policy for anonymous users to read all presets (public data)
    - Presets are read-only for users (admin-managed)

  3. Notes
    - All presets are public reference data
    - Famous claims include: Podkletnov, Searl, Biefeld-Brown, Manchester spheres, Lifter/Ionocraft
    - Each preset includes complete cavity parameters to avoid NaN freezes
*/

CREATE TABLE IF NOT EXISTS thrust_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  tagline text NOT NULL,
  verdict text NOT NULL,
  
  claimed_delta_g numeric NOT NULL,
  drive_voltage_v numeric NOT NULL,
  ambient_pressure_pa numeric NOT NULL,
  electrode_gap_m numeric NOT NULL,
  device_mass_kg numeric NOT NULL,
  vibration_amp_nm numeric NOT NULL,
  vibration_freq_hz numeric NOT NULL,
  temp_gradient_k_per_m numeric NOT NULL,
  device_height_m numeric NOT NULL,
  plate_area_m2 numeric NOT NULL,
  electrostatic_field_v_per_m numeric NOT NULL,
  
  cavity_gap_nm numeric NOT NULL DEFAULT 50,
  rotor_radius_um numeric NOT NULL DEFAULT 50,
  modulation_depth_beta numeric NOT NULL DEFAULT 0.3,
  cavity_q numeric NOT NULL DEFAULT 10000,
  active_area_cm2 numeric NOT NULL DEFAULT 1,
  drive_frequency_hz numeric NOT NULL DEFAULT 500000,
  
  created_at timestamptz DEFAULT now()
);

ALTER TABLE thrust_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read thrust presets"
  ON thrust_presets
  FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO thrust_presets (
  name, tagline, verdict,
  claimed_delta_g, drive_voltage_v, ambient_pressure_pa, electrode_gap_m,
  device_mass_kg, vibration_amp_nm, vibration_freq_hz, temp_gradient_k_per_m,
  device_height_m, plate_area_m2, electrostatic_field_v_per_m,
  cavity_gap_nm, rotor_radius_um, modulation_depth_beta, cavity_q, active_area_cm2, drive_frequency_hz
) VALUES
  ('Manchester Sphere (2000)', 'Sorry, the spheres were likely just corona discharge and shaking.', 'Fully explained by ion wind + vibration',
   0.18, 50000, 101325, 0.05, 0.5, 500, 30, 0.2, 0.15, 0.02, 50000, 50, 50, 0.3, 10000, 1, 500000),
  
  ('Lifter (Ionocraft) Classic', 'It flies, but it''s not antigravity -- it''s just pushing air.', 'Fully explained (ion wind)',
   30, 30000, 101325, 0.02, 0.003, 1, 60, 0.0, 0.03, 0.06, 1500000, 50, 50, 0.3, 10000, 1, 500000),
  
  ('Shaken, Not Stirred', 'Your scale is shaking, not your device levitating.', 'Fully explained (vibration)',
   10, 0, 101325, 0.01, 5.0, 2000, 50, 0.0, 0.1, 0.01, 1, 50, 50, 0.3, 10000, 1, 500000),
  
  ('Hot Air Balloon Mode', 'You''ve just built a tiny heater, not an antigravity drive.', 'Fully explained (thermal convection)',
   5, 0, 101325, 0.01, 0.2, 0, 1, 10, 0.3, 0.04, 1, 50, 50, 0.3, 10000, 1, 500000),
  
  ('Electrostatic Levitation (Tiny)', 'You''re sticking to the ceiling like a balloon, not defying gravity.', 'Fully explained (electrostatic image force)',
   0.5, 100, 101325, 0.01, 0.05, 0, 1, 0.0, 0.02, 0.02, 500000, 50, 50, 0.3, 10000, 1, 500000),
  
  ('Cryogenic Ideal (Antigravity Dream)', 'If you actually achieve these conditions and still see thrust, call a physicist.', 'Unexplained excess',
   1.0, 1000, 0.000001, 0.01, 0.1, 0.1, 1000, 0.0, 0.1, 0.01, 1, 50, 50, 0.3, 10000, 1, 500000),
  
  ('Podkletnov Effect (1992)', 'Podkletnov''s result is likely just vibration and corona discharge.', 'Fully explained (vibration + ion wind)',
   2.0, 10000, 101325, 0.03, 0.1, 1000, 50, 1.0, 0.15, 0.03, 10000, 50, 50, 0.3, 10000, 1, 500000),
  
  ('Searl Effect Generator (SEG)', 'The SEG ''levitates'' because it shakes itself apart.', 'Fully explained (vibration dominates)',
   100, 5000, 101325, 0.005, 10.0, 10000, 400, 2.0, 0.25, 0.1, 200000, 50, 50, 0.3, 10000, 1, 500000),
  
  ('Biefeld-Brown Capacitor', 'It works, but not because of gravity modification.', 'Fully explained (ion wind + vibration)',
   0.5, 50000, 101325, 0.01, 0.02, 10, 120, 0.0, 0.02, 0.01, 5000000, 50, 50, 0.3, 10000, 1, 500000),
  
  ('The Lazy Scientist', 'Garbage in, garbage out. Measure something first.', 'Unexplained excess (no data entered)',
   100, 0, 101325, 0.01, 0.001, 0, 1, 0.0, 0.01, 0.001, 1, 50, 50, 0.3, 10000, 1, 500000)
ON CONFLICT (name) DO NOTHING;
