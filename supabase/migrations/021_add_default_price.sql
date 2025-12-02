-- Add default_price column to professional_details
ALTER TABLE professional_details
ADD COLUMN default_price DECIMAL(10, 2) DEFAULT NULL;

-- Update comments
COMMENT ON COLUMN professional_details.default_price IS 'Default price for private sessions';
