/*
  # The 1.3 W device claim is illustrative

  No published source for "1.3 W at 50 nm, 500 kHz" has been found; the
  figure dates from the site's first build. The app now labels it
  illustrative, and this renames the two seeded rows that carry it: the
  Leakage preset and its claim_registry seed (matched on exact title and
  params; public filings are untouched). The Lifter preset's tagline is
  updated to the repo's copy, which the app already prefers by name.
  Idempotent; deletes nothing.
*/

UPDATE simulation_presets
   SET name = 'Illustrative 1.3 W rotor device'
 WHERE panel = 'diagnostic' AND name = 'Claimed 1.3 W rotor device';

UPDATE claim_registry
   SET title = 'Desktop Casimir generator, 1.3 W (illustrative) [seed]'
 WHERE title = 'Desktop Casimir generator, 1.3 W claim [seed]'
   AND params = '{"pClaimW":1.3,"vDriveV":10,"rDriveOhm":50,"shieldDb":40,"iBiasA":0.1,"rResOhm":0.1,"tHotK":350,"tColdK":300,"aRadM2":0.0001,"emissivity":0.9,"rotorMassKg":1e-9,"rotorAmpNm":1,"fmHz":500000,"mechQ":10000}'::jsonb;

UPDATE thrust_presets
   SET tagline = 'It flies, but not by antigravity: known forces cover the claim. Real lifters ride ion wind; at this budget''s default 10 cm² discharge area the electrostatic allowance does the covering.'
 WHERE name = 'Lifter (Ionocraft) Classic';
