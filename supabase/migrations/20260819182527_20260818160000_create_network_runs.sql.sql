CREATE TABLE IF NOT EXISTS network_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign text NOT NULL DEFAULT 'census-001' CHECK (campaign IN ('census-001')),
  device_label text NOT NULL DEFAULT '' CHECK (char_length(device_label) <= 40),
  source text NOT NULL CHECK (source IN ('phone-accelerometer', 'csv-paste')),
  sample_rate_hz numeric NOT NULL CHECK (sample_rate_hz > 0 AND sample_rate_hz < 2000),
  duration_s numeric NOT NULL CHECK (duration_s > 0 AND duration_s <= 3600),
  noise_rms numeric NOT NULL CHECK (noise_rms >= 0 AND noise_rms < 1e6),
  top_peak_hz numeric NOT NULL DEFAULT 0 CHECK (top_peak_hz >= 0 AND top_peak_hz <= 1000),
  top_peak_g numeric NOT NULL DEFAULT 0 CHECK (top_peak_g >= 0 AND top_peak_g < 1e6),
  mains_hz numeric NOT NULL DEFAULT 0 CHECK (mains_hz IN (0, 50, 60)),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS network_runs_campaign_idx
  ON network_runs (campaign, created_at DESC);

ALTER TABLE network_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "network_runs_public_read" ON network_runs;
CREATE POLICY "network_runs_public_read"
  ON network_runs FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "network_runs_open_insert" ON network_runs;
CREATE POLICY "network_runs_open_insert"
  ON network_runs FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    campaign IN ('census-001')
    AND char_length(device_label) <= 40
    AND source IN ('phone-accelerometer', 'csv-paste')
    AND sample_rate_hz > 0 AND sample_rate_hz < 2000
    AND duration_s > 0 AND duration_s <= 3600
    AND noise_rms >= 0 AND noise_rms < 1e6
    AND top_peak_hz >= 0 AND top_peak_hz <= 1000
    AND top_peak_g >= 0 AND top_peak_g < 1e6
    AND mains_hz IN (0, 50, 60)
  );

GRANT SELECT, INSERT ON TABLE network_runs TO anon, authenticated;
