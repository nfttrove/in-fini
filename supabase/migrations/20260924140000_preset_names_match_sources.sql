/*
  # Preset names and copy that match the verified sources

  A citation check (2026-09) found no documented claim called "Manchester
  Sphere (2000)", and that the Podkletnov preset's 2% is his 1997 claim
  (the 1992 paper reported 0.05–0.3%). Both presets are renamed to match,
  in thrust_presets and in their seeded claim_registry rows (matched on
  exact title and params; public filings are untouched). The app also maps
  the old names to the new ones, so cards read correctly before this runs.
  Three taglines that contradicted the engine's own verdict are updated to
  match the repo's copy. The app already prefers the repo's taglines by
  name, so this only keeps the table consistent. Idempotent.
*/

UPDATE thrust_presets
   SET name = 'Charged-sphere levitation (illustrative)',
       tagline = 'A charged sphere on a scale: corona wind and shaking can fake this much.'
 WHERE name = 'Manchester Sphere (2000)';

UPDATE thrust_presets
   SET name = 'Podkletnov Effect (1997 claim)',
       tagline = 'Vibration covers much of this claim; what''s left needs better isolation, not new physics.'
 WHERE name = 'Podkletnov Effect (1992)';

UPDATE thrust_presets
   SET tagline = 'Warm air does lift, but at this gradient it covers only a sliver of the claim — heat alone can''t explain it.'
 WHERE name = 'Hot Air Balloon Mode';

UPDATE claim_registry
   SET title = 'Charged-sphere levitation (illustrative) [seed]'
 WHERE title = 'Manchester Sphere (2000) [seed]'
   AND params = '{"claimedDeltaG":0.18,"driveVoltageV":50000,"ambientPressurePa":101325,"electrodeGapM":0.05,"deviceMassKg":0.5,"vibrationAmpNm":500,"vibrationFreqHz":30,"tempGradientKPerM":0.2,"deviceHeightM":0.15,"plateAreaM2":0.02,"electrostaticFieldVPerM":50000,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET title = 'Podkletnov Effect (1997 claim) [seed]'
 WHERE title = 'Podkletnov Effect (1992) [seed]'
   AND params = '{"claimedDeltaG":2,"driveVoltageV":10000,"ambientPressurePa":101325,"electrodeGapM":0.03,"deviceMassKg":0.1,"vibrationAmpNm":1000,"vibrationFreqHz":50,"tempGradientKPerM":1,"deviceHeightM":0.15,"plateAreaM2":0.03,"electrostaticFieldVPerM":10000,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;
