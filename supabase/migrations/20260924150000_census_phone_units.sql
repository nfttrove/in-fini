/*
  # Census: phone runs were filed about 102× too high

  The Replication Network's phone path converted each accelerometer sample
  from m/s² to milli-g, then converted the analysed noise and peak to
  milli-g again, so phone runs carry noise_rms and top_peak_g 1000/9.80665
  ≈ 102× too large. CSV runs were converted once and are correct.

  1. A units marker: existing rows default to 'legacy'; the fixed client
     files 'milli-g'.
  2. Legacy phone rows are rescaled in place and marked 'milli-g'; legacy
     CSV rows are only marked.

  Apply before publishing the fixed client (it reads and writes the new
  column). Idempotent: re-running rescales only phone rows still marked
  'legacy' — for example one filed by a cached old page — and the client
  also rescales any such row on read. Deletes nothing.
*/

ALTER TABLE network_runs
  ADD COLUMN IF NOT EXISTS units text NOT NULL DEFAULT 'legacy'
  CHECK (units IN ('legacy', 'milli-g'));

UPDATE network_runs
SET noise_rms = noise_rms * 9.80665 / 1000,
    top_peak_g = top_peak_g * 9.80665 / 1000,
    units = 'milli-g'
WHERE source = 'phone-accelerometer' AND units = 'legacy';

UPDATE network_runs
SET units = 'milli-g'
WHERE source = 'csv-paste' AND units = 'legacy';
