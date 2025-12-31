-- Add slug field to player_team table and UPDATE_TEAM_NAME event type
-- This migration enables slug-based routing for team management

-- Add slug column to player_team table
ALTER TABLE public.player_team
ADD COLUMN slug TEXT;

-- Create unique index on slug per user (a user cannot have two teams with same slug)
CREATE UNIQUE INDEX idx_player_team_user_slug ON public.player_team(user_id, slug);

-- Create index for slug lookups
CREATE INDEX idx_player_team_slug ON public.player_team(slug);

-- Add UPDATE_TEAM_NAME to player_event event types
ALTER TABLE player_event
DROP CONSTRAINT player_event_event_type_check;

ALTER TABLE player_event
ADD CONSTRAINT player_event_event_type_check
CHECK (event_type IN (
  'CLAIM_HERO',
  'UNCLAIM_HERO',
  'UPDATE_HERO_STARS',
  'UPDATE_HERO_EQUIPMENT',
  'UPDATE_HERO_LEVEL',
  'UPDATE_HERO_TALISMAN',
  'UPDATE_TEAM_NAME'
));

-- Populate slug for existing teams (slugify the name)
-- This handles migration of existing data
UPDATE public.player_team
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug NOT NULL after backfilling
ALTER TABLE public.player_team
ALTER COLUMN slug SET NOT NULL;
