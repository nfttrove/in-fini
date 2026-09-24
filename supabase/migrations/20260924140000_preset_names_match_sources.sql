/*
  # Preset names and copy that match the verified sources

  A citation check (2026-09) found no documented claim called "Manchester
  Sphere (2000)". The preset is kept as the illustration it is, under an
  honest name, both in thrust_presets and in its seeded claim_registry row
  (matched on exact title and params; public filings are untouched).
  Three taglines that contradicted the engine's own verdict are updated to
  match the repo's copy. The app already prefers the repo's taglines by
  name, so this only keeps the table consistent. Idempotent.
*/

UPDATE thrust_presets
   SET name = 'Charged-sphere levitation (illustrative)',
       tagline = 'A charged sphere on a scale: corona wind and shaking can fake this much.'
 WHERE name = 'Manchester Sphere (2000)';

UPDATE thrust_presets
   SET tagline = 'Vibration covers much of this claim; what''s left needs better isolation, not new physics.'
 WHERE name = 'Podkletnov Effect (1992)';

UPDATE thrust_presets
   SET tagline = 'Warm air does lift, but at this gradient it covers only a sliver of the claim — heat alone can''t explain it.'
 WHERE name = 'Hot Air Balloon Mode';

UPDATE claim_registry
   SET title = 'Charged-sphere levitation (illustrative) [seed]'
 WHERE title = 'Manchester Sphere (2000) [seed]'
   AND params = '{"claimedDeltaG":0.18,"driveVoltageV":50000,"ambientPressurePa":101325,"electrodeGapM":0.05,"deviceMassKg":0.5,"vibrationAmpNm":500,"vibrationFreqHz":30,"tempGradientKPerM":0.2,"deviceHeightM":0.15,"plateAreaM2":0.02,"electrostaticFieldVPerM":50000,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;
