REVOKE SELECT ON simulation_presets FROM anon, authenticated;

GRANT SELECT (id, panel, name, params, created_at)
  ON simulation_presets TO anon, authenticated;
