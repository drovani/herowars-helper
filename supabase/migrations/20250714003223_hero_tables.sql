-- ABOUTME: Migration to create hero database tables for Hero Wars Helper application
-- ABOUTME: Creates main hero table and related tables for artifacts, skins, glyphs, and equipment

-- Create main hero table
CREATE TABLE IF NOT EXISTS "public"."hero" (
  "slug" "text" NOT NULL,
  "name" "text" NOT NULL,
  "class" "text" NOT NULL,
  "faction" "text" NOT NULL,
  "main_stat" "text" NOT NULL,
  "attack_type" "text"[] NOT NULL,
  "stone_source" "text"[] NOT NULL,
  "order_rank" NUMERIC(3,1) NOT NULL,
  "updated_on" "timestamptz" DEFAULT NOW(),
  CONSTRAINT "hero_pkey" PRIMARY KEY ("slug"),
  CONSTRAINT "hero_name_key" UNIQUE ("name"),
  CONSTRAINT "hero_order_rank_positive" CHECK ("order_rank" > 0)
);

-- Create hero artifacts table
CREATE TABLE IF NOT EXISTS "public"."hero_artifact" (
  "id" "uuid" PRIMARY KEY DEFAULT gen_random_uuid(),
  "hero_slug" "text" NOT NULL,
  "artifact_type" "text" NOT NULL, -- 'weapon', 'book', 'ring'
  "name" "text",
  "team_buff" "text", -- for weapon only
  "team_buff_secondary" "text", -- secondary team buff for weapon
  "created_at" "timestamptz" DEFAULT NOW(),
  CONSTRAINT "hero_artifact_hero_slug_fkey" FOREIGN KEY ("hero_slug") REFERENCES "public"."hero" ("slug") ON DELETE CASCADE,
  CONSTRAINT "hero_artifact_unique" UNIQUE ("hero_slug", "artifact_type"),
  CONSTRAINT "hero_artifact_type_check" CHECK ("artifact_type" IN ('weapon', 'book', 'ring'))
);

-- Create hero skins table
CREATE TABLE IF NOT EXISTS "public"."hero_skin" (
  "id" "uuid" PRIMARY KEY DEFAULT gen_random_uuid(),
  "hero_slug" "text" NOT NULL,
  "name" "text" NOT NULL,
  "stat_type" "text" NOT NULL,
  "stat_value" smallint NOT NULL,
  "has_plus" "bool" DEFAULT FALSE,
  "source" "text",
  "created_at" "timestamptz" DEFAULT NOW(),
  CONSTRAINT "hero_skin_hero_slug_fkey" FOREIGN KEY ("hero_slug") REFERENCES "public"."hero" ("slug") ON DELETE CASCADE,
  CONSTRAINT "hero_skin_unique" UNIQUE ("hero_slug", "name")
);

-- Create hero glyphs table
CREATE TABLE IF NOT EXISTS "public"."hero_glyph" (
  "id" "uuid" PRIMARY KEY DEFAULT gen_random_uuid(),
  "hero_slug" "text" NOT NULL,
  "position" smallint NOT NULL,
  "stat_type" "text" NOT NULL,
  "stat_value" smallint NOT NULL,
  "created_at" "timestamptz" DEFAULT NOW(),
  CONSTRAINT "hero_glyph_hero_slug_fkey" FOREIGN KEY ("hero_slug") REFERENCES "public"."hero" ("slug") ON DELETE CASCADE,
  CONSTRAINT "hero_glyph_unique" UNIQUE ("hero_slug", "position"),
  CONSTRAINT "hero_glyph_position_check" CHECK ("position" >= 1 AND "position" <= 5)
);

-- Create hero equipment slots table
CREATE TABLE IF NOT EXISTS "public"."hero_equipment_slot" (
  "id" "uuid" PRIMARY KEY DEFAULT gen_random_uuid(),
  "hero_slug" "text" NOT NULL,
  "quality" "text" NOT NULL,
  "slot_position" smallint NOT NULL,
  "equipment_slug" "text",
  "created_at" "timestamptz" DEFAULT NOW(),
  CONSTRAINT "hero_equipment_slot_hero_slug_fkey" FOREIGN KEY ("hero_slug") REFERENCES "public"."hero" ("slug") ON DELETE CASCADE,
  CONSTRAINT "hero_equipment_slot_equipment_slug_fkey" FOREIGN KEY ("equipment_slug") REFERENCES "public"."equipment" ("slug"),
  CONSTRAINT "hero_equipment_slot_unique" UNIQUE ("hero_slug", "quality", "slot_position"),
  CONSTRAINT "hero_equipment_slot_position_check" CHECK ("slot_position" >= 1 AND "slot_position" <= 6)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "hero_class_idx" ON "public"."hero" USING "btree" ("class");
CREATE INDEX IF NOT EXISTS "hero_faction_idx" ON "public"."hero" USING "btree" ("faction");
CREATE INDEX IF NOT EXISTS "hero_main_stat_idx" ON "public"."hero" USING "btree" ("main_stat");
CREATE INDEX IF NOT EXISTS "hero_attack_type_idx" ON "public"."hero" USING "gin" ("attack_type");
CREATE INDEX IF NOT EXISTS "hero_order_rank_idx" ON "public"."hero" USING "btree" ("order_rank");

CREATE INDEX IF NOT EXISTS "hero_artifact_hero_slug_idx" ON "public"."hero_artifact" USING "btree" ("hero_slug");
CREATE INDEX IF NOT EXISTS "hero_artifact_type_idx" ON "public"."hero_artifact" USING "btree" ("artifact_type");

CREATE INDEX IF NOT EXISTS "hero_skin_hero_slug_idx" ON "public"."hero_skin" USING "btree" ("hero_slug");

CREATE INDEX IF NOT EXISTS "hero_glyph_hero_slug_idx" ON "public"."hero_glyph" USING "btree" ("hero_slug");
CREATE INDEX IF NOT EXISTS "hero_glyph_position_idx" ON "public"."hero_glyph" USING "btree" ("position");

CREATE INDEX IF NOT EXISTS "hero_equipment_slot_hero_slug_idx" ON "public"."hero_equipment_slot" USING "btree" ("hero_slug");
CREATE INDEX IF NOT EXISTS "hero_equipment_slot_quality_idx" ON "public"."hero_equipment_slot" USING "btree" ("quality");
CREATE INDEX IF NOT EXISTS "hero_equipment_slot_equipment_slug_idx" ON "public"."hero_equipment_slot" USING "btree" ("equipment_slug");

-- Enable Row Level Security on all hero tables
ALTER TABLE "public"."hero" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hero_artifact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hero_skin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hero_glyph" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hero_equipment_slot" ENABLE ROW LEVEL SECURITY;

-- Grant permissions to all roles (following existing pattern)
GRANT ALL ON TABLE "public"."hero" TO "anon";
GRANT ALL ON TABLE "public"."hero" TO "authenticated";
GRANT ALL ON TABLE "public"."hero" TO "service_role";

GRANT ALL ON TABLE "public"."hero_artifact" TO "anon";
GRANT ALL ON TABLE "public"."hero_artifact" TO "authenticated";
GRANT ALL ON TABLE "public"."hero_artifact" TO "service_role";

GRANT ALL ON TABLE "public"."hero_skin" TO "anon";
GRANT ALL ON TABLE "public"."hero_skin" TO "authenticated";
GRANT ALL ON TABLE "public"."hero_skin" TO "service_role";

GRANT ALL ON TABLE "public"."hero_glyph" TO "anon";
GRANT ALL ON TABLE "public"."hero_glyph" TO "authenticated";
GRANT ALL ON TABLE "public"."hero_glyph" TO "service_role";

GRANT ALL ON TABLE "public"."hero_equipment_slot" TO "anon";
GRANT ALL ON TABLE "public"."hero_equipment_slot" TO "authenticated";
GRANT ALL ON TABLE "public"."hero_equipment_slot" TO "service_role";

-- Create RLS policies for hero table
drop policy if exists "Editors and Admins can delete hero" on "public"."hero";
create policy "Editors and Admins can delete hero" on "public"."hero" as permissive for delete to authenticated using (has_editorial_role ());

drop policy if exists "Editors and Admins can insert hero" on "public"."hero";
create policy "Editors and Admins can insert hero" on "public"."hero" as permissive for insert to authenticated
with
    check (has_editorial_role ());

drop policy if exists "Editors and Admins can update hero" on "public"."hero";
create policy "Editors and Admins can update hero" on "public"."hero" as permissive for
update to authenticated using (has_editorial_role ())
with
    check (has_editorial_role ());

drop policy if exists "Enable read for all users" on "public"."hero";
create policy "Enable read for all users" on "public"."hero" as permissive for
select
    to public using (true);

-- Create RLS policies for hero_artifact table
drop policy if exists "Editors and Admins can delete hero_artifact" on "public"."hero_artifact";
create policy "Editors and Admins can delete hero_artifact" on "public"."hero_artifact" as permissive for delete to authenticated using (has_editorial_role ());

drop policy if exists "Editors and Admins can insert hero_artifact" on "public"."hero_artifact";
create policy "Editors and Admins can insert hero_artifact" on "public"."hero_artifact" as permissive for insert to authenticated
with
    check (has_editorial_role ());

drop policy if exists "Editors and Admins can update hero_artifact" on "public"."hero_artifact";
create policy "Editors and Admins can update hero_artifact" on "public"."hero_artifact" as permissive for
update to authenticated using (has_editorial_role ())
with
    check (has_editorial_role ());

drop policy if exists "Enable read for all users" on "public"."hero_artifact";
create policy "Enable read for all users" on "public"."hero_artifact" as permissive for
select
    to public using (true);

-- Create RLS policies for hero_skin table
drop policy if exists "Editors and Admins can delete hero_skin" on "public"."hero_skin";
create policy "Editors and Admins can delete hero_skin" on "public"."hero_skin" as permissive for delete to authenticated using (has_editorial_role ());

drop policy if exists "Editors and Admins can insert hero_skin" on "public"."hero_skin";
create policy "Editors and Admins can insert hero_skin" on "public"."hero_skin" as permissive for insert to authenticated
with
    check (has_editorial_role ());

drop policy if exists "Editors and Admins can update hero_skin" on "public"."hero_skin";
create policy "Editors and Admins can update hero_skin" on "public"."hero_skin" as permissive for
update to authenticated using (has_editorial_role ())
with
    check (has_editorial_role ());

drop policy if exists "Enable read for all users" on "public"."hero_skin";
create policy "Enable read for all users" on "public"."hero_skin" as permissive for
select
    to public using (true);

-- Create RLS policies for hero_glyph table
drop policy if exists "Editors and Admins can delete hero_glyph" on "public"."hero_glyph";
create policy "Editors and Admins can delete hero_glyph" on "public"."hero_glyph" as permissive for delete to authenticated using (has_editorial_role ());

drop policy if exists "Editors and Admins can insert hero_glyph" on "public"."hero_glyph";
create policy "Editors and Admins can insert hero_glyph" on "public"."hero_glyph" as permissive for insert to authenticated
with
    check (has_editorial_role ());

drop policy if exists "Editors and Admins can update hero_glyph" on "public"."hero_glyph";
create policy "Editors and Admins can update hero_glyph" on "public"."hero_glyph" as permissive for
update to authenticated using (has_editorial_role ())
with
    check (has_editorial_role ());

drop policy if exists "Enable read for all users" on "public"."hero_glyph";
create policy "Enable read for all users" on "public"."hero_glyph" as permissive for
select
    to public using (true);

-- Create RLS policies for hero_equipment_slot table
drop policy if exists "Editors and Admins can delete hero_equipment_slot" on "public"."hero_equipment_slot";
create policy "Editors and Admins can delete hero_equipment_slot" on "public"."hero_equipment_slot" as permissive for delete to authenticated using (has_editorial_role ());

drop policy if exists "Editors and Admins can insert hero_equipment_slot" on "public"."hero_equipment_slot";
create policy "Editors and Admins can insert hero_equipment_slot" on "public"."hero_equipment_slot" as permissive for insert to authenticated
with
    check (has_editorial_role ());

drop policy if exists "Editors and Admins can update hero_equipment_slot" on "public"."hero_equipment_slot";
create policy "Editors and Admins can update hero_equipment_slot" on "public"."hero_equipment_slot" as permissive for
update to authenticated using (has_editorial_role ())
with
    check (has_editorial_role ());

drop policy if exists "Enable read for all users" on "public"."hero_equipment_slot";
create policy "Enable read for all users" on "public"."hero_equipment_slot" as permissive for
select
    to public using (true);