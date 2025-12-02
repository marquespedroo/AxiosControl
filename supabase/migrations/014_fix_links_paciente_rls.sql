-- ===================================
-- MIGRATION 014: Fix Links Paciente RLS Policies
-- Update to use user_clinica_id() instead of current_setting
-- ===================================

-- ===================================
-- 1. DROP EXISTING POLICIES
-- ===================================

-- Drop configuracoes_sistema policies
DROP POLICY IF EXISTS configuracoes_sistema_select ON configuracoes_sistema;
DROP POLICY IF EXISTS configuracoes_sistema_insert ON configuracoes_sistema;
DROP POLICY IF EXISTS configuracoes_sistema_update ON configuracoes_sistema;

-- Drop links_paciente policies
DROP POLICY IF EXISTS links_paciente_select ON links_paciente;
DROP POLICY IF EXISTS links_paciente_insert ON links_paciente;
DROP POLICY IF EXISTS links_paciente_update ON links_paciente;
DROP POLICY IF EXISTS links_paciente_delete ON links_paciente;

-- Drop link_testes policies
DROP POLICY IF EXISTS link_testes_select ON link_testes;
DROP POLICY IF EXISTS link_testes_insert ON link_testes;
DROP POLICY IF EXISTS link_testes_delete ON link_testes;

-- ===================================
-- 2. CREATE NEW POLICIES FOR configuracoes_sistema
-- ===================================

-- Psicólogo vê configs globais e da própria clínica
CREATE POLICY "Ver configs sistema"
  ON configuracoes_sistema FOR SELECT
  TO authenticated
  USING (
    clinica_id IS NULL OR
    clinica_id = public.user_clinica_id()
  );

-- Psicólogo pode criar configs para sua clínica
CREATE POLICY "Criar configs clínica"
  ON configuracoes_sistema FOR INSERT
  TO authenticated
  WITH CHECK (
    clinica_id = public.user_clinica_id()
  );

-- Psicólogo pode atualizar configs da sua clínica
CREATE POLICY "Atualizar configs clínica"
  ON configuracoes_sistema FOR UPDATE
  TO authenticated
  USING (
    clinica_id = public.user_clinica_id()
  );

-- ===================================
-- 3. CREATE NEW POLICIES FOR links_paciente
-- ===================================

-- Psicólogo vê links da própria clínica
CREATE POLICY "Ver links da clínica"
  ON links_paciente FOR SELECT
  TO authenticated
  USING (
    clinica_id = public.user_clinica_id()
  );

-- Psicólogo pode criar links na sua clínica
CREATE POLICY "Criar links na clínica"
  ON links_paciente FOR INSERT
  TO authenticated
  WITH CHECK (
    clinica_id = public.user_clinica_id()
  );

-- Psicólogo pode atualizar links da clínica
CREATE POLICY "Atualizar links da clínica"
  ON links_paciente FOR UPDATE
  TO authenticated
  USING (
    clinica_id = public.user_clinica_id()
  );

-- Psicólogo pode deletar links da clínica
CREATE POLICY "Deletar links da clínica"
  ON links_paciente FOR DELETE
  TO authenticated
  USING (
    clinica_id = public.user_clinica_id()
  );

-- Acesso anônimo para pacientes via link remoto (apenas leitura para validação)
CREATE POLICY "Acesso anônimo via link token"
  ON links_paciente FOR SELECT
  TO anon
  USING (
    status = 'ativo' AND
    data_expiracao > NOW() AND
    bloqueado = false
  );

-- Paciente pode atualizar via link (tentativas, acesso)
CREATE POLICY "Paciente atualiza via link"
  ON links_paciente FOR UPDATE
  TO anon
  USING (
    status = 'ativo' AND
    bloqueado = false
  )
  WITH CHECK (
    status IN ('ativo', 'completo')
  );

-- ===================================
-- 4. CREATE NEW POLICIES FOR link_testes
-- ===================================

-- Psicólogo vê testes dos links da clínica
CREATE POLICY "Ver testes dos links"
  ON link_testes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links_paciente lp
      WHERE lp.id = link_testes.link_id
      AND lp.clinica_id = public.user_clinica_id()
    )
  );

-- Psicólogo pode adicionar testes aos links da clínica
CREATE POLICY "Adicionar testes aos links"
  ON link_testes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM links_paciente lp
      WHERE lp.id = link_testes.link_id
      AND lp.clinica_id = public.user_clinica_id()
    )
  );

-- Psicólogo pode deletar testes dos links da clínica
CREATE POLICY "Deletar testes dos links"
  ON link_testes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links_paciente lp
      WHERE lp.id = link_testes.link_id
      AND lp.clinica_id = public.user_clinica_id()
    )
  );

-- Acesso anônimo para pacientes via link (visualizar testes do link)
CREATE POLICY "Paciente vê testes do link"
  ON link_testes FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM links_paciente lp
      WHERE lp.id = link_testes.link_id
      AND lp.status = 'ativo'
      AND lp.data_expiracao > NOW()
      AND lp.bloqueado = false
    )
  );

-- ===================================
-- 5. GRANT PERMISSIONS
-- ===================================

-- Grant anon access to new tables for remote links
GRANT SELECT, UPDATE ON links_paciente TO anon;
GRANT SELECT ON link_testes TO anon;
GRANT SELECT ON configuracoes_sistema TO anon;

-- ===================================
-- END OF MIGRATION
-- ===================================
