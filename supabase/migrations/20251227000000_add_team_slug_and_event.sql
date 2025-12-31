-- ABOUTME: Migration to add slug field to player_team table for URL-friendly team identifiers
-- ABOUTME: Enables slug-based routing for team management with 301 redirect support via event logging

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
-- Note: This regex approach approximates the app's slugify behavior. Edge cases may differ.
-- Fallback to 'team-{id}' if name contains only special characters resulting in empty slug
UPDATE public.player_team
SET slug = COALESCE(
  NULLIF(LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')), ''),
  'team-' || SUBSTRING(id::text, 1, 8)
)
WHERE slug IS NULL;

-- Make slug NOT NULL after backfilling
ALTER TABLE public.player_team
ALTER COLUMN slug SET NOT NULL;
