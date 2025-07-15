SET
    statement_timeout = 0;

SET
    lock_timeout = 0;

SET
    idle_in_transaction_session_timeout = 0;

SET
    client_encoding = 'UTF8';

SET
    standard_conforming_strings = on;

SELECT
    pg_catalog.set_config ('search_path', '', false);

SET
    check_function_bodies = false;

SET
    xmloption = content;

SET
    client_min_messages = warning;

SET
    row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql"
WITH
    SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"
WITH
    SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto"
WITH
    SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt"
WITH
    SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault"
WITH
    SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
WITH
    SCHEMA "extensions";

CREATE TYPE "public"."equipment_quality" AS ENUM('gray', 'green', 'blue', 'violet', 'orange');

ALTER TYPE "public"."equipment_quality" OWNER TO "postgres";

CREATE TYPE "public"."equipment_type" AS ENUM('equipable', 'fragment', 'recipe');

ALTER TYPE "public"."equipment_type" OWNER TO "postgres";

CREATE
OR REPLACE FUNCTION "public"."get_equipment_with_neighbors" ("slug_input" "text") RETURNS TABLE ("quality" "text", "slug" "text", "name" "text") LANGUAGE "plpgsql"
SET
    "search_path" = '' AS $$
BEGIN
    RETURN QUERY
    WITH RankedRows AS (
        SELECT public.equipment.quality::text, public.equipment.slug, public.equipment.name,
               LAG(public.equipment.slug) OVER (ORDER BY public.equipment.quality, public.equipment.slug) AS previous_slug,
               LEAD(public.equipment.slug) OVER (ORDER BY public.equipment.quality, public.equipment.slug) AS next_slug
        FROM public.equipment
    )
    SELECT rr.quality, rr.slug, rr.name
    FROM RankedRows rr
    WHERE rr.slug = slug_input OR
      rr.previous_slug = slug_input OR
      rr.next_slug = slug_input;
END;
$$;

ALTER FUNCTION "public"."get_equipment_with_neighbors" ("slug_input" "text") OWNER TO "postgres";

SET
    default_tablespace = '';

SET
    default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS
    "public"."chapter" ("id" smallint NOT NULL, "title" "text" NOT NULL);

ALTER TABLE "public"."chapter" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS
    "public"."equipment" (
        "slug" "text" NOT NULL,
        "name" "text" NOT NULL,
        "quality" "public"."equipment_quality" NOT NULL,
        "buy_value_gold" integer,
        "buy_value_coin" integer,
        "sell_value" integer NOT NULL,
        "guild_activity_points" integer NOT NULL,
        "crafting_gold_cost" integer,
        "hero_level_required" smallint,
        "type" "public"."equipment_type" NOT NULL,
        "campaign_sources" "text" []
    );

ALTER TABLE "public"."equipment" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS
    "public"."equipment_required_item" (
        "base_slug" "text" NOT NULL,
        "required_slug" "text" NOT NULL,
        "quantity" smallint NOT NULL
    );

ALTER TABLE "public"."equipment_required_item" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS
    "public"."equipment_stat" (
        "equipment_slug" "text" NOT NULL,
        "stat" "text" NOT NULL,
        "value" smallint NOT NULL
    );

ALTER TABLE "public"."equipment_stat" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS
    "public"."mission" (
        "slug" "text" NOT NULL,
        "chapter_id" smallint NOT NULL,
        "name" "text" NOT NULL,
        "hero_slug" "text",
        "energy_cost" smallint,
        "level" smallint,
        CONSTRAINT "mission_energy_cost_check" CHECK (("energy_cost" > 0))
    );

ALTER TABLE "public"."mission" OWNER TO "postgres";

ALTER TABLE ONLY "public"."chapter"
ADD CONSTRAINT "chapter_chapter_title_key" UNIQUE ("title");

ALTER TABLE ONLY "public"."chapter"
ADD CONSTRAINT "chapter_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."equipment"
ADD CONSTRAINT "equipment_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."equipment"
ADD CONSTRAINT "equipment_pkey" PRIMARY KEY ("slug");

ALTER TABLE ONLY "public"."equipment_required_item"
ADD CONSTRAINT "equipment_required_item_pkey" PRIMARY KEY ("base_slug", "required_slug");

ALTER TABLE ONLY "public"."equipment_stat"
ADD CONSTRAINT "equipment_stat_pkey" PRIMARY KEY ("equipment_slug", "stat");

ALTER TABLE ONLY "public"."mission"
ADD CONSTRAINT "mission_pkey" PRIMARY KEY ("slug");

CREATE INDEX "equipment_campaign_sources_idx" ON "public"."equipment" USING "btree" ("campaign_sources");

ALTER TABLE ONLY "public"."equipment_required_item"
ADD CONSTRAINT "equipment_required_item_base_slug_fkey" FOREIGN KEY ("base_slug") REFERENCES "public"."equipment" ("slug");

ALTER TABLE ONLY "public"."equipment_required_item"
ADD CONSTRAINT "equipment_required_item_required_slug_fkey" FOREIGN KEY ("required_slug") REFERENCES "public"."equipment" ("slug") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."equipment_stat"
ADD CONSTRAINT "equipment_stat_equipment_slug_fkey" FOREIGN KEY ("equipment_slug") REFERENCES "public"."equipment" ("slug") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mission"
ADD CONSTRAINT "mission_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapter" ("id");

ALTER TABLE "public"."chapter" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."equipment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."equipment_required_item" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."equipment_stat" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mission" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_equipment_with_neighbors" ("slug_input" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."get_equipment_with_neighbors" ("slug_input" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_equipment_with_neighbors" ("slug_input" "text") TO "service_role";

GRANT ALL ON TABLE "public"."chapter" TO "anon";

GRANT ALL ON TABLE "public"."chapter" TO "authenticated";

GRANT ALL ON TABLE "public"."chapter" TO "service_role";

GRANT ALL ON TABLE "public"."equipment" TO "anon";

GRANT ALL ON TABLE "public"."equipment" TO "authenticated";

GRANT ALL ON TABLE "public"."equipment" TO "service_role";

GRANT ALL ON TABLE "public"."equipment_required_item" TO "anon";

GRANT ALL ON TABLE "public"."equipment_required_item" TO "authenticated";

GRANT ALL ON TABLE "public"."equipment_required_item" TO "service_role";

GRANT ALL ON TABLE "public"."equipment_stat" TO "anon";

GRANT ALL ON TABLE "public"."equipment_stat" TO "authenticated";

GRANT ALL ON TABLE "public"."equipment_stat" TO "service_role";

GRANT ALL ON TABLE "public"."mission" TO "anon";

GRANT ALL ON TABLE "public"."mission" TO "authenticated";

GRANT ALL ON TABLE "public"."mission" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "service_role";

RESET ALL;