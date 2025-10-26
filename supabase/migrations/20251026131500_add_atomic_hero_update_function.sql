-- ABOUTME: Atomic hero update function with transaction support
-- ABOUTME: Ensures data consistency when updating hero and all related tables

-- Create the function that performs atomic hero updates
-- This function updates hero base data and all related tables (artifacts, skins, glyphs, equipment)
-- in a single transaction, ensuring that either all updates succeed or all rollback
CREATE OR REPLACE FUNCTION update_hero_with_relations(
  p_hero_slug TEXT,
  p_hero_data JSONB,
  p_artifacts JSONB,
  p_skins JSONB,
  p_glyphs JSONB,
  p_equipment JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_updated_hero hero%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Update hero base data
  UPDATE hero
  SET
    name = COALESCE((p_hero_data->>'name'), name),
    class = COALESCE((p_hero_data->>'class'), class),
    faction = COALESCE((p_hero_data->>'faction'), faction),
    main_stat = COALESCE((p_hero_data->>'main_stat'), main_stat),
    attack_type = COALESCE((p_hero_data->>'attack_type'), attack_type),
    artifact_team_buff = COALESCE((p_hero_data->>'artifact_team_buff'), artifact_team_buff),
    updated_on = NOW()
  WHERE slug = p_hero_slug
  RETURNING * INTO v_updated_hero;

  IF v_updated_hero.slug IS NULL THEN
    RAISE EXCEPTION 'Hero with slug % not found', p_hero_slug;
  END IF;

  -- Update artifacts (delete old, insert new)
  IF p_artifacts IS NOT NULL THEN
    DELETE FROM hero_artifact WHERE hero_slug = p_hero_slug;

    INSERT INTO hero_artifact (hero_slug, artifact_type, name, team_buff, team_buff_secondary)
    SELECT
      p_hero_slug,
      value->>'artifact_type',
      value->>'name',
      value->>'team_buff',
      value->>'team_buff_secondary'
    FROM jsonb_array_elements(p_artifacts) AS value
    WHERE value->>'artifact_type' IS NOT NULL;
  END IF;

  -- Update skins (delete old, insert new)
  IF p_skins IS NOT NULL THEN
    DELETE FROM hero_skin WHERE hero_slug = p_hero_slug;

    INSERT INTO hero_skin (hero_slug, name, stat_type, stat_value, has_plus, source)
    SELECT
      p_hero_slug,
      value->>'name',
      value->>'stat_type',
      COALESCE((value->>'stat_value')::INTEGER, 0),
      COALESCE((value->>'has_plus')::BOOLEAN, FALSE),
      value->>'source'
    FROM jsonb_array_elements(p_skins) AS value
    WHERE value->>'name' IS NOT NULL;
  END IF;

  -- Update glyphs (delete old, insert new)
  IF p_glyphs IS NOT NULL THEN
    DELETE FROM hero_glyph WHERE hero_slug = p_hero_slug;

    INSERT INTO hero_glyph (hero_slug, position, stat_type, stat_value)
    SELECT
      p_hero_slug,
      (value->>'position')::INTEGER,
      value->>'stat_type',
      COALESCE((value->>'stat_value')::INTEGER, 0)
    FROM jsonb_array_elements(p_glyphs) AS value
    WHERE value->>'stat_type' IS NOT NULL;
  END IF;

  -- Update equipment slots (delete old, insert new)
  IF p_equipment IS NOT NULL THEN
    DELETE FROM hero_equipment_slot WHERE hero_slug = p_hero_slug;

    INSERT INTO hero_equipment_slot (hero_slug, quality, slot_position, equipment_slug)
    SELECT
      p_hero_slug,
      value->>'quality',
      (value->>'slot_position')::INTEGER,
      value->>'equipment_slug'
    FROM jsonb_array_elements(p_equipment) AS value
    WHERE value->>'quality' IS NOT NULL AND (value->>'slot_position')::INTEGER IS NOT NULL;
  END IF;

  -- Return the updated hero record
  v_result := jsonb_build_object(
    'slug', v_updated_hero.slug,
    'name', v_updated_hero.name,
    'class', v_updated_hero.class,
    'faction', v_updated_hero.faction,
    'main_stat', v_updated_hero.main_stat,
    'attack_type', v_updated_hero.attack_type,
    'artifact_team_buff', v_updated_hero.artifact_team_buff,
    'updated_on', v_updated_hero.updated_on
  );

  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  -- Re-raise the exception to trigger rollback
  RAISE EXCEPTION 'Failed to update hero %: %', p_hero_slug, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users and anon users
GRANT EXECUTE ON FUNCTION update_hero_with_relations(TEXT, JSONB, JSONB, JSONB, JSONB, JSONB) TO authenticated, anon;
