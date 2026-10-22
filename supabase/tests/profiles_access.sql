-- Read-only regression checks; a failed rule raises division by zero.
SELECT 'Profiles enforce row-level security' AS rule,
  1 / (EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles' AND c.relrowsecurity))::int AS passed
UNION ALL
SELECT 'Visitors without sessions cannot access profiles',
  1 / (NOT has_table_privilege('anon', 'public.profiles', 'SELECT, INSERT, UPDATE, DELETE'))::int
UNION ALL
SELECT 'Session users retain profile reading, creation and editing',
  1 / (has_table_privilege('authenticated', 'public.profiles', 'SELECT')
    AND has_table_privilege('authenticated', 'public.profiles', 'INSERT')
    AND has_table_privilege('authenticated', 'public.profiles', 'UPDATE')
    AND NOT has_table_privilege('authenticated', 'public.profiles', 'DELETE'))::int
UNION ALL
SELECT 'All profile policies are session-only and owner-scoped',
  1 / ((SELECT count(*) = 3 AND bool_and(
    roles = ARRAY['authenticated']::name[]
    AND CASE WHEN cmd IN ('SELECT', 'UPDATE') THEN qual LIKE '%auth.uid()% = user_id)%' ELSE true END
    AND CASE WHEN cmd IN ('INSERT', 'UPDATE') THEN with_check LIKE '%auth.uid()% = user_id)%' ELSE true END
  ) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'))::int;