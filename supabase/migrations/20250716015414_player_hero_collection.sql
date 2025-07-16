-- Create player_hero table for tracking user's hero collection
CREATE TABLE player_hero (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hero_slug TEXT NOT NULL REFERENCES hero(slug) ON DELETE CASCADE,
    stars SMALLINT NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 6),
    equipment_level SMALLINT NOT NULL DEFAULT 1 CHECK (equipment_level >= 1 AND equipment_level <= 16),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, hero_slug)
);

-- Create player_event table for event sourcing
CREATE TABLE player_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('CLAIM_HERO', 'UNCLAIM_HERO', 'UPDATE_HERO_STARS', 'UPDATE_HERO_EQUIPMENT')),
    hero_slug TEXT NOT NULL REFERENCES hero(slug) ON DELETE CASCADE,
    event_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_player_hero_user_id ON player_hero(user_id);
CREATE INDEX idx_player_hero_hero_slug ON player_hero(hero_slug);
CREATE INDEX idx_player_event_user_id ON player_event(user_id);
CREATE INDEX idx_player_event_type ON player_event(event_type);
CREATE INDEX idx_player_event_hero_slug ON player_event(hero_slug);
CREATE INDEX idx_player_event_created_at ON player_event(created_at);

-- Enable RLS
ALTER TABLE player_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_event ENABLE ROW LEVEL SECURITY;

-- RLS policies for player_hero table
CREATE POLICY "Users can view their own hero collection" ON player_hero
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own heroes" ON player_hero
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own heroes" ON player_hero
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own heroes" ON player_hero
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for player_event table
CREATE POLICY "Users can view their own events" ON player_event
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON player_event
    FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() = created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_player_hero_updated_at 
    BEFORE UPDATE ON player_hero 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();