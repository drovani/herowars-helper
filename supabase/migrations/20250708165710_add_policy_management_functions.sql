CREATE
OR REPLACE FUNCTION public.has_editorial_role () RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL
        AND (
            auth.jwt() ->> 'app_metadata' IS NOT NULL
            AND (
                auth.jwt() -> 'app_metadata' -> 'roles' ? 'editor'
                OR auth.jwt() -> 'app_metadata' -> 'roles' ? 'admin'
            )
        );
END;
$$;

CREATE
OR REPLACE FUNCTION update_policies_with_summary (
    table_names text[],
    operations text[] DEFAULT ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']
) RETURNS TABLE (action text, count integer) LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
DECLARE
    table_name text;
    operation text;
    policy_name text;
    policies_deleted integer := 0;
    policies_created integer := 0;
BEGIN
    -- Security check: Only allow admin users to run this function
    IF NOT public.has_editorial_role() THEN
        RAISE EXCEPTION 'Permission denied. Only admin users can manage RLS policies.';
    END IF;

    -- Drop existing policies
    FOREACH table_name IN ARRAY table_names
    LOOP
        FOR policy_name IN
            SELECT policyname
            FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = table_name
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON "public".%I;', policy_name, table_name);
            policies_deleted := policies_deleted + 1;
        END LOOP;
    END LOOP;

    -- Create new policies
    FOREACH table_name IN ARRAY table_names
    LOOP
        FOREACH operation IN ARRAY operations
        LOOP
            IF operation = 'SELECT' THEN
                EXECUTE format('
                    CREATE POLICY "Enable read for all users"
                    ON "public".%I
                    FOR SELECT
                    TO public
                    USING (true);
                ', table_name);
                policies_created := policies_created + 1;
            ELSIF operation = 'INSERT' THEN
                EXECUTE format('
                    CREATE POLICY "Editors and Admins can %s %I"
                    ON "public".%I
                    FOR %s
                    TO authenticated
                    WITH CHECK (has_editorial_role());
                ', lower(operation), table_name, table_name, operation);
                policies_created := policies_created + 1;
            ELSIF operation = 'DELETE' THEN
                EXECUTE format('
                    CREATE POLICY "Editors and Admins can %s %I"
                    ON "public".%I
                    FOR %s
                    TO authenticated
                    USING (has_editorial_role());
                ', lower(operation), table_name, table_name, operation);
                policies_created := policies_created + 1;
            ELSIF operation = 'UPDATE' THEN
                EXECUTE format('
                    CREATE POLICY "Editors and Admins can %s %I"
                    ON "public".%I
                    FOR %s
                    TO authenticated
                    USING (has_editorial_role())
                    WITH CHECK (has_editorial_role());
                ', lower(operation), table_name, table_name, operation);
                policies_created := policies_created + 1;
            END IF;
        END LOOP;
    END LOOP;

    -- Return the summary
    RETURN QUERY VALUES
        ('Policies deleted', policies_deleted),
        ('Policies created', policies_created);
END $$;

-- Restrict function access to service_role only
-- Regular users cannot execute this dangerous function
REVOKE ALL ON FUNCTION update_policies_with_summary (text[], text[])
FROM
    PUBLIC;

REVOKE ALL ON FUNCTION update_policies_with_summary (text[], text[])
FROM
    anon;

REVOKE ALL ON FUNCTION update_policies_with_summary (text[], text[])
FROM
    authenticated;

GRANT
EXECUTE ON FUNCTION update_policies_with_summary (text[], text[]) TO service_role;

-- Optionally, run this query to update policies for specific tables
-- Combined query that shows both policy summary and tables without policies
-- SELECT * FROM (
--     WITH policy_summary AS (
--         SELECT
--             1 as sort_order,
--             action as info_type,
--             count::text as value
--         FROM update_policies_with_summary(
--             ARRAY['chapter', 'equipment', 'equipment_required_item', 'equipment_stat', 'mission']
--         )
--     ),
--     tables_without_policies AS (
--         SELECT
--             2 as sort_order,
--             'Tables without policies' as info_type,
--             t.table_name as value
--         FROM information_schema.tables t
--         LEFT JOIN pg_policies p ON (
--             p.schemaname = t.table_schema
--             AND p.tablename = t.table_name
--         )
--         WHERE t.table_schema = 'public'
--             AND t.table_type = 'BASE TABLE'
--             AND p.policyname IS NULL
--             AND t.table_name NOT LIKE 'auth_%'
--             AND t.table_name NOT LIKE 'storage_%'
--             AND t.table_name NOT LIKE 'supabase_%'
--     )
--     SELECT sort_order, info_type, value FROM policy_summary
--     UNION ALL
--     SELECT sort_order, info_type, value FROM tables_without_policies
-- ) combined_results
-- ORDER BY sort_order, info_type;