-- ===================================
-- MIGRATION 004: Link Hub System
-- Multi-mode test application with hub model
-- ===================================

-- ===================================
-- 1. CONFIGURAÇÕES DO SISTEMA
-- ===================================

CREATE TABLE IF NOT EXISTS configuracoes_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  chave VARCHAR(100) NOT NULL,
  valor JSONB NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Clinic-specific configs have unique key per clinic
  CONSTRAINT configuracoes_sistema_clinica_unique UNIQUE (clinica_id, chave)
);

-- Global configs have clinica_id = NULL, must be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_configuracoes_global
  ON configuracoes_sistema(chave) WHERE clinica_id IS NULL;

-- Index for clinic lookups
CREATE INDEX IF NOT EXISTS idx_configuracoes_clinica
  ON configuracoes_sistema(clinica_id) WHERE clinica_id IS NOT NULL;

COMMENT ON TABLE configuracoes_sistema IS 'Configurações do sistema por clínica ou globais';
COMMENT ON COLUMN configuracoes_sistema.clinica_id IS 'NULL para configurações globais';

-- Insert default configurations
INSERT INTO configuracoes_sistema (clinica_id, chave, valor, descricao) VALUES
  (NULL, 'link_expiracao_dias_padrao', '7', 'Dias padrão para expiração de links de teste'),
  (NULL, 'link_max_tentativas_codigo', '5', 'Máximo de tentativas de código antes de bloquear'),
  (NULL, 'handoff_max_tentativas_pin', '3', 'Máximo de tentativas de PIN antes de bloquear modo entrega')
ON CONFLICT DO NOTHING;

-- ===================================
-- 2. LINKS PACIENTE (HUB)
-- ===================================

CREATE TABLE IF NOT EXISTS links_paciente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  psicologo_id UUID NOT NULL REFERENCES psicologos(id),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),

  -- Access credentials
  link_token VARCHAR(64) UNIQUE NOT NULL,
  codigo_acesso_hash VARCHAR(255) NOT NULL,
  -- Stored temporarily for display, cleared after patient's first access
  codigo_acesso_plain VARCHAR(6),

  -- Expiration
  data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Status: ativo, expirado, revogado, completo
  status VARCHAR(20) DEFAULT 'ativo' NOT NULL,

  -- Tracking
  primeiro_acesso TIMESTAMP WITH TIME ZONE,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  tentativas_falhas INTEGER DEFAULT 0 NOT NULL,
  bloqueado BOOLEAN DEFAULT false NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT links_paciente_status_valido
    CHECK (status IN ('ativo', 'expirado', 'revogado', 'completo'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_links_paciente_paciente
  ON links_paciente(paciente_id);

CREATE INDEX IF NOT EXISTS idx_links_paciente_clinica
  ON links_paciente(clinica_id);

CREATE INDEX IF NOT EXISTS idx_links_paciente_psicologo
  ON links_paciente(psicologo_id);

CREATE INDEX IF NOT EXISTS idx_links_paciente_token
  ON links_paciente(link_token);

CREATE INDEX IF NOT EXISTS idx_links_paciente_status_ativo
  ON links_paciente(status) WHERE status = 'ativo';

CREATE INDEX IF NOT EXISTS idx_links_paciente_expiracao
  ON links_paciente(data_expiracao) WHERE status = 'ativo';

-- CRITICAL: Only one active link per patient per clinic
CREATE UNIQUE INDEX IF NOT EXISTS idx_links_paciente_ativo_unico
  ON links_paciente(paciente_id, clinica_id) WHERE status = 'ativo';

COMMENT ON TABLE links_paciente IS 'Hub de links para pacientes - um link ativo por paciente';
COMMENT ON COLUMN links_paciente.link_token IS 'Token único de 64 caracteres para acesso';
COMMENT ON COLUMN links_paciente.codigo_acesso_hash IS 'Hash bcrypt do código de 6 dígitos';
COMMENT ON COLUMN links_paciente.codigo_acesso_plain IS 'Código em texto, limpo após primeiro acesso';
COMMENT ON COLUMN links_paciente.status IS 'ativo, expirado, revogado, completo';

-- ===================================
-- 3. LINK TESTES (JUNCTION TABLE)
-- ===================================

CREATE TABLE IF NOT EXISTS link_testes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links_paciente(id) ON DELETE CASCADE,
  teste_aplicado_id UUID NOT NULL REFERENCES testes_aplicados(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Each test can only be in one link
  CONSTRAINT link_testes_teste_unique UNIQUE (teste_aplicado_id),
  -- Each test appears only once per link
  CONSTRAINT link_testes_link_teste_unique UNIQUE (link_id, teste_aplicado_id)
);

CREATE INDEX IF NOT EXISTS idx_link_testes_link
  ON link_testes(link_id);

CREATE INDEX IF NOT EXISTS idx_link_testes_teste
  ON link_testes(teste_aplicado_id);

CREATE INDEX IF NOT EXISTS idx_link_testes_ordem
  ON link_testes(link_id, ordem);

COMMENT ON TABLE link_testes IS 'Relação entre links e testes aplicados';
COMMENT ON COLUMN link_testes.ordem IS 'Ordem de exibição do teste no link';

-- ===================================
-- 4. UPDATE TESTES_APLICADOS STATUS
-- ===================================

-- Add 'abandonado' status to existing constraint
ALTER TABLE testes_aplicados
  DROP CONSTRAINT IF EXISTS testes_aplicados_status_valido;

ALTER TABLE testes_aplicados
  ADD CONSTRAINT testes_aplicados_status_valido
  CHECK (status IN ('aguardando', 'em_andamento', 'completo', 'reaberto', 'bloqueado', 'expirado', 'abandonado'));

-- Add tipo_aplicacao 'entrega' for handoff mode
ALTER TABLE testes_aplicados
  DROP CONSTRAINT IF EXISTS testes_aplicados_tipo_valido;

ALTER TABLE testes_aplicados
  ADD CONSTRAINT testes_aplicados_tipo_valido
  CHECK (tipo_aplicacao IN ('presencial', 'remota', 'manual', 'entrega'));

COMMENT ON COLUMN testes_aplicados.status IS 'aguardando, em_andamento, completo, reaberto, bloqueado, expirado, abandonado';
COMMENT ON COLUMN testes_aplicados.tipo_aplicacao IS 'presencial, remota, manual, entrega';

-- ===================================
-- 5. TRIGGERS
-- ===================================

-- Trigger to update updated_at on links_paciente
CREATE TRIGGER update_links_paciente_updated_at
  BEFORE UPDATE ON links_paciente
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on configuracoes_sistema
CREATE TRIGGER update_configuracoes_sistema_updated_at
  BEFORE UPDATE ON configuracoes_sistema
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 6. FUNCTIONS
-- ===================================

-- Function to check and update link expiration
CREATE OR REPLACE FUNCTION check_link_paciente_expiracao()
RETURNS TRIGGER AS $$
BEGIN
  -- If link is active and expired, update status
  IF NEW.status = 'ativo' AND NEW.data_expiracao < NOW() THEN
    NEW.status := 'expirado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_link_paciente_expiracao
  BEFORE UPDATE ON links_paciente
  FOR EACH ROW
  EXECUTE FUNCTION check_link_paciente_expiracao();

-- Function to mark tests as abandoned when link is revoked
CREATE OR REPLACE FUNCTION mark_tests_abandoned_on_revoke()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'revogado', mark incomplete tests as 'abandonado'
  IF NEW.status = 'revogado' AND OLD.status != 'revogado' THEN
    UPDATE testes_aplicados
    SET status = 'abandonado', updated_at = NOW()
    WHERE id IN (
      SELECT teste_aplicado_id
      FROM link_testes
      WHERE link_id = NEW.id
    )
    AND status NOT IN ('completo', 'abandonado');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_tests_abandoned
  AFTER UPDATE ON links_paciente
  FOR EACH ROW
  EXECUTE FUNCTION mark_tests_abandoned_on_revoke();

-- Function to update link status when all tests are complete
CREATE OR REPLACE FUNCTION check_link_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_link_id UUID;
  v_total_tests INTEGER;
  v_completed_tests INTEGER;
BEGIN
  -- Get link_id for this test
  SELECT link_id INTO v_link_id
  FROM link_testes
  WHERE teste_aplicado_id = NEW.id;

  -- If test is in a link and was marked complete
  IF v_link_id IS NOT NULL AND NEW.status = 'completo' THEN
    -- Count total and completed tests in this link
    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE ta.status = 'completo')
    INTO v_total_tests, v_completed_tests
    FROM link_testes lt
    JOIN testes_aplicados ta ON ta.id = lt.teste_aplicado_id
    WHERE lt.link_id = v_link_id;

    -- If all tests are complete, mark link as complete
    IF v_total_tests = v_completed_tests AND v_total_tests > 0 THEN
      UPDATE links_paciente
      SET status = 'completo', updated_at = NOW()
      WHERE id = v_link_id AND status = 'ativo';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_link_completion
  AFTER UPDATE ON testes_aplicados
  FOR EACH ROW
  EXECUTE FUNCTION check_link_completion();

-- Function to clear plain code after first access
CREATE OR REPLACE FUNCTION clear_plain_code_on_first_access()
RETURNS TRIGGER AS $$
BEGIN
  -- If primeiro_acesso was just set (was NULL, now has value)
  IF OLD.primeiro_acesso IS NULL AND NEW.primeiro_acesso IS NOT NULL THEN
    NEW.codigo_acesso_plain := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clear_plain_code
  BEFORE UPDATE ON links_paciente
  FOR EACH ROW
  EXECUTE FUNCTION clear_plain_code_on_first_access();

-- ===================================
-- 7. ROW LEVEL SECURITY
-- ===================================

-- Enable RLS on new tables
ALTER TABLE configuracoes_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE links_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_testes ENABLE ROW LEVEL SECURITY;

-- Policies for configuracoes_sistema
CREATE POLICY configuracoes_sistema_select ON configuracoes_sistema
  FOR SELECT USING (
    clinica_id IS NULL OR
    clinica_id = current_setting('app.current_clinica_id', true)::UUID
  );

CREATE POLICY configuracoes_sistema_insert ON configuracoes_sistema
  FOR INSERT WITH CHECK (
    clinica_id = current_setting('app.current_clinica_id', true)::UUID
  );

CREATE POLICY configuracoes_sistema_update ON configuracoes_sistema
  FOR UPDATE USING (
    clinica_id = current_setting('app.current_clinica_id', true)::UUID
  );

-- Policies for links_paciente
CREATE POLICY links_paciente_select ON links_paciente
  FOR SELECT USING (
    clinica_id = current_setting('app.current_clinica_id', true)::UUID
  );

CREATE POLICY links_paciente_insert ON links_paciente
  FOR INSERT WITH CHECK (
    clinica_id = current_setting('app.current_clinica_id', true)::UUID
  );

CREATE POLICY links_paciente_update ON links_paciente
  FOR UPDATE USING (
    clinica_id = current_setting('app.current_clinica_id', true)::UUID
  );

CREATE POLICY links_paciente_delete ON links_paciente
  FOR DELETE USING (
    clinica_id = current_setting('app.current_clinica_id', true)::UUID
  );

-- Policies for link_testes (inherit from links_paciente)
CREATE POLICY link_testes_select ON link_testes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM links_paciente lp
      WHERE lp.id = link_testes.link_id
      AND lp.clinica_id = current_setting('app.current_clinica_id', true)::UUID
    )
  );

CREATE POLICY link_testes_insert ON link_testes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM links_paciente lp
      WHERE lp.id = link_testes.link_id
      AND lp.clinica_id = current_setting('app.current_clinica_id', true)::UUID
    )
  );

CREATE POLICY link_testes_delete ON link_testes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM links_paciente lp
      WHERE lp.id = link_testes.link_id
      AND lp.clinica_id = current_setting('app.current_clinica_id', true)::UUID
    )
  );

-- ===================================
-- 8. AUDIT TRIGGERS
-- ===================================

-- Apply audit logging to new tables
CREATE TRIGGER trigger_audit_links_paciente
  AFTER INSERT OR UPDATE OR DELETE ON links_paciente
  FOR EACH ROW EXECUTE FUNCTION log_auditoria();

CREATE TRIGGER trigger_audit_link_testes
  AFTER INSERT OR UPDATE OR DELETE ON link_testes
  FOR EACH ROW EXECUTE FUNCTION log_auditoria();

-- ===================================
-- 9. HELPER FUNCTIONS
-- ===================================

-- Function to get active link for a patient
CREATE OR REPLACE FUNCTION get_active_link_for_patient(
  p_paciente_id UUID,
  p_clinica_id UUID
) RETURNS UUID AS $$
DECLARE
  v_link_id UUID;
BEGIN
  SELECT id INTO v_link_id
  FROM links_paciente
  WHERE paciente_id = p_paciente_id
    AND clinica_id = p_clinica_id
    AND status = 'ativo'
    AND data_expiracao > NOW()
  LIMIT 1;

  RETURN v_link_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get configuration value
CREATE OR REPLACE FUNCTION get_config(
  p_chave VARCHAR,
  p_clinica_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_valor JSONB;
BEGIN
  -- First try clinic-specific config
  IF p_clinica_id IS NOT NULL THEN
    SELECT valor INTO v_valor
    FROM configuracoes_sistema
    WHERE chave = p_chave AND clinica_id = p_clinica_id;
  END IF;

  -- Fall back to global config
  IF v_valor IS NULL THEN
    SELECT valor INTO v_valor
    FROM configuracoes_sistema
    WHERE chave = p_chave AND clinica_id IS NULL;
  END IF;

  RETURN v_valor;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_active_link_for_patient IS 'Retorna o link ativo para um paciente';
COMMENT ON FUNCTION get_config IS 'Retorna configuração por clínica ou global';

-- ===================================
-- END OF MIGRATION
-- ===================================
