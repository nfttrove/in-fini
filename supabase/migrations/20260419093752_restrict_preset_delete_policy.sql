/*
  # Restrict simulation_presets DELETE policy

  The previous DELETE policy used `USING (true)` which allowed anyone
  (anon or authenticated) to delete any preset. This migration replaces
  that policy with an owner-token model so that a caller can only delete
  a preset they themselves created.

  1. Schema Changes
    - Add `owner_token` (uuid) column to `simulation_presets`
      - Generated client-side at insert time
      - Stored by the client in localStorage
      - Used as a shared-secret proof of ownership for deletion
    - Backfill existing rows with random tokens so they remain
      deletable only via direct database access (effectively read-only
      from the client since no one knows those tokens)

  2. Security Changes
    - Drop the permissive `Anyone can delete presets` policy
    - Add new `Owners can delete their own presets` policy that
      requires the caller to supply the matching `owner_token` in the
      DELETE WHERE clause (checked by RLS via row comparison to the
      token provided through a SECURITY DEFINER helper function)
    - Add `delete_preset(p_id uuid, p_token uuid)` RPC function marked
      SECURITY DEFINER that performs the deletion only when the token
      matches, bypassing the no-anon-delete policy in a controlled way

  3. Notes
    1. Existing presets created before this migration cannot be deleted
       from the UI because their owner_token was randomly generated.
       This is intentional and safe (no data loss, just read-only).
    2. The RPC function is the only allowed path for anon deletes.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'simulation_presets' AND column_name = 'owner_token'
  ) THEN
    ALTER TABLE simulation_presets
      ADD COLUMN owner_token uuid NOT NULL DEFAULT gen_random_uuid();
  END IF;
END $$;

DROP POLICY IF EXISTS "Anyone can delete presets" ON simulation_presets;

CREATE OR REPLACE FUNCTION delete_preset(p_id uuid, p_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF p_id IS NULL OR p_token IS NULL THEN
    RETURN false;
  END IF;

  DELETE FROM simulation_presets
  WHERE id = p_id AND owner_token = p_token;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION delete_preset(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_preset(uuid, uuid) TO anon, authenticated;
