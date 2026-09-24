/*
  # Stamp and throttle anonymous inserts into the public record

  claim_registry, preregistrations and network_runs accept anonymous
  inserts (bounded payloads, no update or delete). Two gaps:

  1. The insert policies constrain the payload but not created_at or id,
     and the table grants cover every column. A client could post a
     pre-registration dated before the experiment it "predicts". A
     pre-registration is only worth its timestamp, so for API roles the
     server now stamps created_at := now() and a fresh id, whatever the
     client sent.
  2. Nothing limited the rate, so a script could flood a record that by
     design cannot be cleaned up from the app. Each table now takes at most
     a fixed number of new rows per rolling hour from API roles, counted
     under a per-table advisory lock so parallel requests cannot race it.

  Only API roles (anon, authenticated) are affected. Migrations and the
  dashboard run as other roles. The caps are global: no IPs or client
  identifiers are stored (the census promises no location, ever). The
  trade-off is that a flood can use up an hour's quota for everyone:
  a bounded nuisance rather than an unbounded record. Idempotent.
*/

CREATE OR REPLACE FUNCTION public.stamp_and_throttle_public_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  cap integer := TG_ARGV[0]::integer;
  recent integer;
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  NEW.created_at := now();
  NEW.id := gen_random_uuid();

  -- Serialise the count per table. Without this, parallel requests each
  -- see only committed rows and all pass (12 concurrent 59-row inserts put
  -- 236 rows past a cap of 60 in review). The lock is held to the end of
  -- the inserting transaction, so the next one counts after it commits.
  PERFORM pg_advisory_xact_lock(hashtext('in-fini:throttle:' || TG_TABLE_NAME));

  EXECUTE format(
    'SELECT count(*) FROM %I.%I WHERE created_at > now() - interval ''1 hour''',
    TG_TABLE_SCHEMA, TG_TABLE_NAME
  ) INTO recent;

  IF recent >= cap THEN
    RAISE EXCEPTION
      'The public record is taking a breather: it accepts at most % new entries an hour here, and this hour is full. Please try again later.',
      cap
      USING HINT = 'rate limit';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stamp_and_throttle_public_insert ON claim_registry;
CREATE TRIGGER stamp_and_throttle_public_insert
  BEFORE INSERT ON claim_registry
  FOR EACH ROW EXECUTE FUNCTION public.stamp_and_throttle_public_insert('30');

DROP TRIGGER IF EXISTS stamp_and_throttle_public_insert ON preregistrations;
CREATE TRIGGER stamp_and_throttle_public_insert
  BEFORE INSERT ON preregistrations
  FOR EACH ROW EXECUTE FUNCTION public.stamp_and_throttle_public_insert('30');

DROP TRIGGER IF EXISTS stamp_and_throttle_public_insert ON network_runs;
CREATE TRIGGER stamp_and_throttle_public_insert
  BEFORE INSERT ON network_runs
  FOR EACH ROW EXECUTE FUNCTION public.stamp_and_throttle_public_insert('60');
