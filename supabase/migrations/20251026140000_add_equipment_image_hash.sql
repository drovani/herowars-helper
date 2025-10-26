-- Add image_hash column to equipment table
-- This column stores perceptual hashes (pHash) of equipment icon images
-- for similarity matching in the Equipment Image Matching MCP Server

-- Add the image_hash column
ALTER TABLE equipment
ADD COLUMN image_hash TEXT;

-- Add comment to the column
COMMENT ON COLUMN equipment.image_hash IS 'Perceptual hash (pHash) of the equipment icon image for similarity matching';

-- Create index for efficient hash-based lookups
CREATE INDEX idx_equipment_image_hash ON equipment(image_hash);

-- Rollback instructions (if needed):
-- DROP INDEX idx_equipment_image_hash;
-- ALTER TABLE equipment DROP COLUMN image_hash;
