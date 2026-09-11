-- Allow users to target more than one work arrangement.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_remote_preference_check;

ALTER TABLE public.profiles
  ALTER COLUMN remote_preference TYPE text[]
  USING CASE
    WHEN remote_preference IS NULL THEN NULL
    ELSE ARRAY[remote_preference]
  END;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_remote_preference_check CHECK (
    remote_preference IS NULL
    OR (
      remote_preference <@ ARRAY['remote', 'onsite', 'hybrid', 'any']::text[]
      AND NOT ('any' = ANY(remote_preference) AND cardinality(remote_preference) > 1)
    )
  );
