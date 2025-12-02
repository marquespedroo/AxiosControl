-- Migration: Add metadata field to testes_aplicados for handoff mode
-- This field stores the PIN hash and handoff session state

ALTER TABLE testes_aplicados
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add comment explaining the field
COMMENT ON COLUMN testes_aplicados.metadata IS 'Stores additional metadata including handoff session info (PIN hash, attempts, blocked status)';

-- Create index for faster queries on handoff status
CREATE INDEX IF NOT EXISTS idx_testes_aplicados_metadata_handoff
ON testes_aplicados USING gin (metadata jsonb_path_ops);
