/*
  # Hide owner_token from the public API

  ## Problem (confirmed against the live database)
  `owner_token` on `simulation_presets` is the shared secret that authorizes
  deletion through the `delete_preset` RPC (added in 20260419093752). Because
  `anon` and `authenticated` held *table-level* SELECT, PostgREST exposed the
  column: a single request

      GET /rest/v1/simulation_presets?select=id,owner_token

  returned every row's token. Any visitor could harvest all tokens and then
  call delete_preset for each id, deleting every preset. This defeated the
  ownership model entirely — it was strictly worse than the USING(true) delete
  policy it replaced, because it looked protected.

  ## Fix
  Replace the table-wide SELECT grant with a column-level grant that omits
  `owner_token`. Nothing else changes:
    - Row visibility is untouched (the RLS SELECT policy USING(true) still
      applies); only the secret column becomes unreadable through the API.
    - INSERT is untouched, so the client can still write owner_token when
      saving a preset.
    - delete_preset is SECURITY DEFINER and reads owner_token internally as the
      table owner, so legitimate deletes still work.
  The client only ever selects (id, panel, name, params, created_at), so there
  is no application-visible change.

  ## Note
  The SECURITY DEFINER + EXECUTE-to-anon warnings from the platform advisor are
  intentional and MUST NOT be "fixed": delete_preset is SECURITY DEFINER on
  purpose so it can enforce the token check while anon has no direct DELETE
  privilege. Switching it to SECURITY INVOKER, or revoking EXECUTE, would break
  preset deletion.
*/

REVOKE SELECT ON simulation_presets FROM anon, authenticated;

GRANT SELECT (id, panel, name, params, created_at)
  ON simulation_presets TO anon, authenticated;
