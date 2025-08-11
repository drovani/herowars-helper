-- Add level and talisman_level fields to player_hero table
-- These fields support the new hero detail management features

ALTER TABLE player_hero 
ADD COLUMN level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 120),
ADD COLUMN talisman_level INTEGER DEFAULT 0 CHECK (talisman_level >= 0 AND talisman_level <= 50);

-- Update existing player_event event types to include new level events
ALTER TABLE player_event 
DROP CONSTRAINT player_event_event_type_check;

ALTER TABLE player_event 
ADD CONSTRAINT player_event_event_type_check 
CHECK (event_type IN ('CLAIM_HERO', 'UNCLAIM_HERO', 'UPDATE_HERO_STARS', 'UPDATE_HERO_EQUIPMENT', 'UPDATE_HERO_LEVEL', 'UPDATE_HERO_TALISMAN'));

-- Create indexes for the new fields to support filtering/sorting
CREATE INDEX idx_player_hero_level ON player_hero(level);
CREATE INDEX idx_player_hero_talisman_level ON player_hero(talisman_level);