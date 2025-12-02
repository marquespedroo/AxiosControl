-- ===================================
-- MIGRATION 009: Test Template Versioning
-- Biblioteca de Testes Enhancement
-- ===================================

-- ===================================
-- ADD VERSIONING COLUMNS
-- ===================================

-- Self-reference for version chain (points to original test)
ALTER TABLE testes_templates
ADD COLUMN IF NOT EXISTS versao_origem_id UUID REFERENCES testes_templates(id) ON DELETE SET NULL;

-- Sequential version number (1, 2, 3...)
ALTER TABLE testes_templates
ADD COLUMN IF NOT EXISTS versao_numero INTEGER DEFAULT 1;

-- Reason for creating this version
ALTER TABLE testes_templates
ADD COLUMN IF NOT EXISTS motivo_alteracao TEXT;

-- Who created this version
ALTER TABLE testes_templates
ADD COLUMN IF NOT EXISTS alterado_por UUID REFERENCES psicologos(id) ON DELETE SET NULL;

-- When this version was created
ALTER TABLE testes_templates
ADD COLUMN IF NOT EXISTS alterado_em TIMESTAMP WITH TIME ZONE;

-- ===================================
-- INDEXES
-- ===================================

-- Index for finding all versions of a test
CREATE INDEX IF NOT EXISTS idx_testes_versao_origem
ON testes_templates(versao_origem_id)
WHERE versao_origem_id IS NOT NULL;

-- Index for finding active version of original test
CREATE INDEX IF NOT EXISTS idx_testes_versao_ativo
ON testes_templates(versao_origem_id, ativo)
WHERE ativo = true;

-- ===================================
-- AUDIT TRIGGER
-- ===================================

-- Add audit trigger for testes_templates (was missing in original schema)
-- First check if trigger exists to avoid error
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_audit_testes_templates'
  ) THEN
    CREATE TRIGGER trigger_audit_testes_templates
      AFTER INSERT OR UPDATE OR DELETE ON testes_templates
      FOR EACH ROW EXECUTE FUNCTION log_auditoria();
  END IF;
END
$$;

-- ===================================
-- HELPER FUNCTIONS
-- ===================================

-- Function to get all versions of a test
CREATE OR REPLACE FUNCTION get_teste_versions(p_teste_id UUID)
RETURNS TABLE (
  id UUID,
  versao VARCHAR(20),
  versao_numero INTEGER,
  motivo_alteracao TEXT,
  alterado_por UUID,
  alterado_por_nome VARCHAR(255),
  alterado_em TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_origem_id UUID;
BEGIN
  -- Get the original test ID (either this test or its origin)
  SELECT COALESCE(tt.versao_origem_id, tt.id) INTO v_origem_id
  FROM testes_templates tt
  WHERE tt.id = p_teste_id;

  RETURN QUERY
  SELECT
    tt.id,
    tt.versao,
    tt.versao_numero,
    tt.motivo_alteracao,
    tt.alterado_por,
    p.nome_completo as alterado_por_nome,
    tt.alterado_em,
    tt.ativo,
    tt.created_at
  FROM testes_templates tt
  LEFT JOIN psicologos p ON tt.alterado_por = p.id
  WHERE tt.id = v_origem_id
     OR tt.versao_origem_id = v_origem_id
  ORDER BY tt.versao_numero DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_teste_versions IS 'Retorna todas as versões de um teste, incluindo a original';

-- Function to get the active version of a test
CREATE OR REPLACE FUNCTION get_teste_active_version(p_teste_id UUID)
RETURNS UUID AS $$
DECLARE
  v_origem_id UUID;
  v_active_id UUID;
BEGIN
  -- Get the original test ID
  SELECT COALESCE(tt.versao_origem_id, tt.id) INTO v_origem_id
  FROM testes_templates tt
  WHERE tt.id = p_teste_id;

  -- Find active version
  SELECT tt.id INTO v_active_id
  FROM testes_templates tt
  WHERE (tt.id = v_origem_id OR tt.versao_origem_id = v_origem_id)
    AND tt.ativo = true
  ORDER BY tt.versao_numero DESC
  LIMIT 1;

  RETURN v_active_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_teste_active_version IS 'Retorna o ID da versão ativa de um teste';

-- Function to get next version number
CREATE OR REPLACE FUNCTION get_next_versao_numero(p_teste_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_origem_id UUID;
  v_max_versao INTEGER;
BEGIN
  -- Get the original test ID
  SELECT COALESCE(tt.versao_origem_id, tt.id) INTO v_origem_id
  FROM testes_templates tt
  WHERE tt.id = p_teste_id;

  -- Get max version number
  SELECT COALESCE(MAX(tt.versao_numero), 0) INTO v_max_versao
  FROM testes_templates tt
  WHERE tt.id = v_origem_id OR tt.versao_origem_id = v_origem_id;

  RETURN v_max_versao + 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_next_versao_numero IS 'Retorna o próximo número de versão para um teste';

-- ===================================
-- COMMENTS
-- ===================================

COMMENT ON COLUMN testes_templates.versao_origem_id IS 'UUID do teste original (auto-referência para cadeia de versões). NULL se for o teste original.';
COMMENT ON COLUMN testes_templates.versao_numero IS 'Número sequencial da versão (1, 2, 3...). Incrementado a cada edição.';
COMMENT ON COLUMN testes_templates.motivo_alteracao IS 'Motivo/justificativa para criação desta versão.';
COMMENT ON COLUMN testes_templates.alterado_por IS 'UUID do psicólogo que criou esta versão.';
COMMENT ON COLUMN testes_templates.alterado_em IS 'Data/hora de criação desta versão.';

-- ===================================
-- UPDATE EXISTING RECORDS
-- ===================================

-- Set versao_numero = 1 for existing records that don't have it
UPDATE testes_templates
SET versao_numero = 1
WHERE versao_numero IS NULL;
