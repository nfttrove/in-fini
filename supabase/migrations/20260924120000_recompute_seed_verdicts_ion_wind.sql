/*
  # Recompute seed verdicts after the ion-wind correction

  The ion-wind channel was ε₀·μ·E²·d·0.001 with μ ∝ 1/p: dimensionally a
  current, microgram-scale at 1 atm, and 10⁵× stronger at 1 Pa than at
  1 atm — backwards, since ions only push air they collide with. It is now
  the space-charge-limited collisional thrust 9/8·ε₀·(V/d)²·A scaled by the
  collision share d/(d+λ). No seed changes verdict; the stored residual
  fractions of the high-voltage seeds move, so they are refreshed here.

  UPDATE, not delete-then-insert: rows are matched on exact title AND
  params, so any row touched gets exactly the values the engine computes
  for its own params. Public filings are never deleted (the earlier
  pattern, DELETE ... LIKE '%[seed]', would also remove a public filing
  whose title happens to end in "[seed]"). Idempotent.
*/

UPDATE claim_registry
   SET verdict_key = 'explained', verdict_label = 'Fully explained by mundane forces', residual_fraction = -9.802554529042414
 WHERE title = 'Manchester Sphere (2000) [seed]' AND params = '{"claimedDeltaG":0.18,"driveVoltageV":50000,"ambientPressurePa":101325,"electrodeGapM":0.05,"deviceMassKg":0.5,"vibrationAmpNm":500,"vibrationFreqHz":30,"tempGradientKPerM":0.2,"deviceHeightM":0.15,"plateAreaM2":0.02,"electrostaticFieldVPerM":50000,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET verdict_key = 'explained', verdict_label = 'Fully explained by mundane forces', residual_fraction = -1.1076520965069545
 WHERE title = 'Lifter (Ionocraft) Classic [seed]' AND params = '{"claimedDeltaG":30,"driveVoltageV":30000,"ambientPressurePa":101325,"electrodeGapM":0.02,"deviceMassKg":0.003,"vibrationAmpNm":1,"vibrationFreqHz":60,"tempGradientKPerM":0,"deviceHeightM":0.03,"plateAreaM2":0.06,"electrostaticFieldVPerM":1500000,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET verdict_key = 'explained', verdict_label = 'Fully explained by mundane forces', residual_fraction = -9.064195623469589
 WHERE title = 'Shaken, Not Stirred [seed]' AND params = '{"claimedDeltaG":10,"driveVoltageV":0,"ambientPressurePa":101325,"electrodeGapM":0.01,"deviceMassKg":5,"vibrationAmpNm":2000,"vibrationFreqHz":50,"tempGradientKPerM":0,"deviceHeightM":0.1,"plateAreaM2":0.01,"electrostaticFieldVPerM":1,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET verdict_key = 'excess', verdict_label = 'Unexplained excess', residual_fraction = 0.9698976109178903
 WHERE title = 'Hot Air Balloon Mode [seed]' AND params = '{"claimedDeltaG":5,"driveVoltageV":0,"ambientPressurePa":101325,"electrodeGapM":0.01,"deviceMassKg":0.2,"vibrationAmpNm":0,"vibrationFreqHz":1,"tempGradientKPerM":10,"deviceHeightM":0.3,"plateAreaM2":0.04,"electrostaticFieldVPerM":1,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET verdict_key = 'explained', verdict_label = 'Fully explained by mundane forces', residual_fraction = -3.5145825806070823
 WHERE title = 'Electrostatic Levitation (Tiny) [seed]' AND params = '{"claimedDeltaG":0.5,"driveVoltageV":100,"ambientPressurePa":101325,"electrodeGapM":0.01,"deviceMassKg":0.05,"vibrationAmpNm":0,"vibrationFreqHz":1,"tempGradientKPerM":0,"deviceHeightM":0.02,"plateAreaM2":0.02,"electrostaticFieldVPerM":500000,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET verdict_key = 'excess', verdict_label = 'Unexplained excess', residual_fraction = 0.959743202312952
 WHERE title = 'Cryogenic Ideal (Antigravity Dream) [seed]' AND params = '{"claimedDeltaG":1,"driveVoltageV":1000,"ambientPressurePa":0.000001,"electrodeGapM":0.01,"deviceMassKg":0.1,"vibrationAmpNm":0.1,"vibrationFreqHz":1000,"tempGradientKPerM":0,"deviceHeightM":0.1,"plateAreaM2":0.01,"electrostaticFieldVPerM":1,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET verdict_key = 'partial', verdict_label = 'Partially explained', residual_fraction = 0.43827239363250303
 WHERE title = 'Podkletnov Effect (1992) [seed]' AND params = '{"claimedDeltaG":2,"driveVoltageV":10000,"ambientPressurePa":101325,"electrodeGapM":0.03,"deviceMassKg":0.1,"vibrationAmpNm":1000,"vibrationFreqHz":50,"tempGradientKPerM":1,"deviceHeightM":0.15,"plateAreaM2":0.03,"electrostaticFieldVPerM":10000,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET verdict_key = 'explained', verdict_label = 'Fully explained by mundane forces', residual_fraction = -643.1372572503388
 WHERE title = 'Searl Effect Generator (SEG) [seed]' AND params = '{"claimedDeltaG":100,"driveVoltageV":5000,"ambientPressurePa":101325,"electrodeGapM":0.005,"deviceMassKg":10,"vibrationAmpNm":10000,"vibrationFreqHz":400,"tempGradientKPerM":2,"deviceHeightM":0.25,"plateAreaM2":0.1,"electrostaticFieldVPerM":200000,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET verdict_key = 'explained', verdict_label = 'Fully explained by mundane forces', residual_fraction = -275.5285931022438
 WHERE title = 'Biefeld-Brown Capacitor [seed]' AND params = '{"claimedDeltaG":0.5,"driveVoltageV":50000,"ambientPressurePa":101325,"electrodeGapM":0.01,"deviceMassKg":0.02,"vibrationAmpNm":10,"vibrationFreqHz":120,"tempGradientKPerM":0,"deviceHeightM":0.02,"plateAreaM2":0.01,"electrostaticFieldVPerM":5000000,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET verdict_key = 'gross-excess', verdict_label = 'Unexplained excess', residual_fraction = 0.9999999999999954
 WHERE title = 'The Lazy Scientist [seed]' AND params = '{"claimedDeltaG":100,"driveVoltageV":0,"ambientPressurePa":101325,"electrodeGapM":0.01,"deviceMassKg":0.001,"vibrationAmpNm":0,"vibrationFreqHz":1,"tempGradientKPerM":0,"deviceHeightM":0.01,"plateAreaM2":0.001,"electrostaticFieldVPerM":1,"cavityGap_nm":100,"rotorRadius_um":50,"modulationDepth_beta":0.5,"cavityQ":10000,"activeArea_cm2":1,"driveFrequency_Hz":1000000}'::jsonb;

UPDATE claim_registry
   SET verdict_key = 'excess', verdict_label = 'Unexplained excess', residual_fraction = 0.9720423684610406
 WHERE title = 'Desktop Casimir generator, 1.3 W claim [seed]' AND params = '{"pClaimW":1.3,"vDriveV":10,"rDriveOhm":50,"shieldDb":40,"iBiasA":0.1,"rResOhm":0.1,"tHotK":350,"tColdK":300,"aRadM2":0.0001,"emissivity":0.9,"rotorMassKg":1e-9,"rotorAmpNm":1,"fmHz":500000,"mechQ":10000}'::jsonb;
