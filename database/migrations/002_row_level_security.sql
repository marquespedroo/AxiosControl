-- ===================================
-- MIGRATION 002: Row Level Security (RLS)
-- Multi-tenant isolation at database level
-- ===================================

-- ===================================
-- ENABLE RLS ON TABLES
-- ===================================

ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE psicologos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE testes_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabelas_normativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE testes_aplicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_manuais ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- ===================================
-- HELPER FUNCTIONS FOR RLS
-- ===================================

-- Get current user's clinic ID
CREATE OR REPLACE FUNCTION public.user_clinica_id()
RETURNS UUID AS $$
  SELECT clinica_id
  FROM public.psicologos
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.user_clinica_id IS 'Retorna clinica_id do psicólogo autenticado';

-- Check if user is clinic admin
CREATE OR REPLACE FUNCTION public.is_clinic_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.psicologos
    WHERE id = auth.uid()
      AND 'admin' = ANY(especialidades)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user owns a patient
CREATE OR REPLACE FUNCTION public.owns_patient(patient_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pacientes
    WHERE id = patient_id
      AND (
        psicologo_responsavel_id = auth.uid() OR
        clinica_id = public.user_clinica_id()
      )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===================================
-- CLINICAS POLICIES
-- ===================================

-- Psicólogo pode ver apenas sua própria clínica
CREATE POLICY "Psicólogos veem própria clínica"
  ON clinicas FOR SELECT
  TO authenticated
  USING (id = public.user_clinica_id());

-- Apenas admins podem atualizar clínica
CREATE POLICY "Admins editam clínica"
  ON clinicas FOR UPDATE
  TO authenticated
  USING (id = public.user_clinica_id() AND public.is_clinic_admin())
  WITH CHECK (id = public.user_clinica_id() AND public.is_clinic_admin());

-- Ninguém pode deletar clínicas via app (apenas superadmin direto)
CREATE POLICY "Deletar clínica bloqueado"
  ON clinicas FOR DELETE
  TO authenticated
  USING (false);

-- ===================================
-- PSICOLOGOS POLICIES
-- ===================================

-- Psicólogos veem colegas da mesma clínica
CREATE POLICY "Ver psicólogos da clínica"
  ON psicologos FOR SELECT
  TO authenticated
  USING (clinica_id = public.user_clinica_id());

-- Psicólogo pode atualizar próprio perfil
CREATE POLICY "Atualizar próprio perfil"
  ON psicologos FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Apenas admins podem criar novos psicólogos
CREATE POLICY "Admin cria psicólogos"
  ON psicologos FOR INSERT
  TO authenticated
  WITH CHECK (
    clinica_id = public.user_clinica_id() AND
    public.is_clinic_admin()
  );

-- Apenas admins podem desativar psicólogos
CREATE POLICY "Admin desativa psicólogos"
  ON psicologos FOR DELETE
  TO authenticated
  USING (
    clinica_id = public.user_clinica_id() AND
    public.is_clinic_admin() AND
    id != auth.uid() -- Não pode deletar a si mesmo
  );

-- ===================================
-- PACIENTES POLICIES
-- ===================================

-- Psicólogo vê pacientes da sua clínica
CREATE POLICY "Ver pacientes da clínica"
  ON pacientes FOR SELECT
  TO authenticated
  USING (clinica_id = public.user_clinica_id());

-- Psicólogo pode criar pacientes na sua clínica
CREATE POLICY "Criar pacientes na clínica"
  ON pacientes FOR INSERT
  TO authenticated
  WITH CHECK (clinica_id = public.user_clinica_id());

-- Psicólogo pode atualizar pacientes da clínica
CREATE POLICY "Atualizar pacientes da clínica"
  ON pacientes FOR UPDATE
  TO authenticated
  USING (clinica_id = public.user_clinica_id())
  WITH CHECK (clinica_id = public.user_clinica_id());

-- Apenas admin ou psicólogo responsável pode deletar paciente
CREATE POLICY "Deletar pacientes (admin ou responsável)"
  ON pacientes FOR DELETE
  TO authenticated
  USING (
    clinica_id = public.user_clinica_id() AND
    (public.is_clinic_admin() OR psicologo_responsavel_id = auth.uid())
  );

-- ===================================
-- TESTES TEMPLATES POLICIES
-- ===================================

-- Todos veem testes públicos ou da própria clínica
CREATE POLICY "Ver testes disponíveis"
  ON testes_templates FOR SELECT
  TO authenticated
  USING (
    publico = true OR
    criado_por IN (
      SELECT id FROM psicologos WHERE clinica_id = public.user_clinica_id()
    )
  );

-- Psicólogo pode criar testes privados para clínica
CREATE POLICY "Criar testes privados"
  ON testes_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    criado_por = auth.uid() AND
    publico = false
  );

-- Apenas criador pode atualizar teste privado
CREATE POLICY "Atualizar próprios testes"
  ON testes_templates FOR UPDATE
  TO authenticated
  USING (criado_por = auth.uid() AND publico = false)
  WITH CHECK (criado_por = auth.uid() AND publico = false);

-- Apenas criador pode deletar teste privado
CREATE POLICY "Deletar próprios testes"
  ON testes_templates FOR DELETE
  TO authenticated
  USING (criado_por = auth.uid() AND publico = false);

-- ===================================
-- TABELAS NORMATIVAS POLICIES
-- ===================================

-- Todos veem normas de testes que podem acessar
CREATE POLICY "Ver normas de testes acessíveis"
  ON tabelas_normativas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM testes_templates tt
      WHERE tt.id = teste_template_id
        AND (
          tt.publico = true OR
          tt.criado_por IN (
            SELECT id FROM psicologos WHERE clinica_id = public.user_clinica_id()
          )
        )
    )
  );

-- Psicólogo pode criar normas para testes que acessa
CREATE POLICY "Criar normas para testes acessíveis"
  ON tabelas_normativas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM testes_templates tt
      WHERE tt.id = teste_template_id
        AND (
          tt.publico = true OR
          tt.criado_por IN (
            SELECT id FROM psicologos WHERE clinica_id = public.user_clinica_id()
          )
        )
    )
  );

-- Psicólogo pode atualizar normas que criou
CREATE POLICY "Atualizar próprias normas"
  ON tabelas_normativas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM testes_templates tt
      WHERE tt.id = teste_template_id
        AND tt.criado_por = auth.uid()
    )
  );

-- ===================================
-- TESTES APLICADOS POLICIES
-- ===================================

-- Psicólogo vê testes da própria clínica
CREATE POLICY "Ver testes aplicados da clínica"
  ON testes_aplicados FOR SELECT
  TO authenticated
  USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE clinica_id = public.user_clinica_id()
    )
  );

-- Psicólogo pode aplicar testes em pacientes da clínica
CREATE POLICY "Aplicar testes em pacientes da clínica"
  ON testes_aplicados FOR INSERT
  TO authenticated
  WITH CHECK (
    psicologo_id = auth.uid() AND
    paciente_id IN (
      SELECT id FROM pacientes WHERE clinica_id = public.user_clinica_id()
    )
  );

-- Psicólogo aplicador pode atualizar teste
CREATE POLICY "Atualizar testes aplicados"
  ON testes_aplicados FOR UPDATE
  TO authenticated
  USING (psicologo_id = auth.uid())
  WITH CHECK (psicologo_id = auth.uid());

-- Apenas psicólogo aplicador pode deletar teste
CREATE POLICY "Deletar testes aplicados"
  ON testes_aplicados FOR DELETE
  TO authenticated
  USING (psicologo_id = auth.uid());

-- Política especial para acesso via link remoto (anônimo)
CREATE POLICY "Acesso anônimo via link remoto"
  ON testes_aplicados FOR SELECT
  TO anon
  USING (
    tipo_aplicacao = 'remota' AND
    status IN ('aguardando', 'em_andamento', 'reaberto')
  );

CREATE POLICY "Paciente responde via link"
  ON testes_aplicados FOR UPDATE
  TO anon
  USING (
    tipo_aplicacao = 'remota' AND
    status IN ('aguardando', 'em_andamento', 'reaberto')
  )
  WITH CHECK (
    tipo_aplicacao = 'remota' AND
    status IN ('em_andamento', 'reaberto', 'completo')
  );

-- ===================================
-- REGISTROS MANUAIS POLICIES
-- ===================================

-- Psicólogo vê registros da clínica
CREATE POLICY "Ver registros manuais da clínica"
  ON registros_manuais FOR SELECT
  TO authenticated
  USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE clinica_id = public.user_clinica_id()
    )
  );

-- Psicólogo cria registros para pacientes da clínica
CREATE POLICY "Criar registros manuais"
  ON registros_manuais FOR INSERT
  TO authenticated
  WITH CHECK (
    psicologo_id = auth.uid() AND
    paciente_id IN (
      SELECT id FROM pacientes WHERE clinica_id = public.user_clinica_id()
    )
  );

-- Apenas criador pode atualizar registro
CREATE POLICY "Atualizar próprios registros"
  ON registros_manuais FOR UPDATE
  TO authenticated
  USING (psicologo_id = auth.uid())
  WITH CHECK (psicologo_id = auth.uid());

-- Apenas criador pode deletar registro
CREATE POLICY "Deletar próprios registros"
  ON registros_manuais FOR DELETE
  TO authenticated
  USING (psicologo_id = auth.uid());

-- ===================================
-- LOGS AUDITORIA POLICIES
-- ===================================

-- Psicólogo vê logs da própria clínica
CREATE POLICY "Ver logs da clínica"
  ON logs_auditoria FOR SELECT
  TO authenticated
  USING (
    usuario_id IN (
      SELECT id FROM psicologos WHERE clinica_id = public.user_clinica_id()
    )
  );

-- Sistema insere logs (via trigger)
CREATE POLICY "Sistema insere logs"
  ON logs_auditoria FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Permitir inserção via trigger

-- Ninguém pode atualizar ou deletar logs (imutável)
CREATE POLICY "Logs são imutáveis"
  ON logs_auditoria FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Logs não podem ser deletados"
  ON logs_auditoria FOR DELETE
  TO authenticated
  USING (false);

-- ===================================
-- SECURITY DEFINER FUNCTIONS
-- ===================================

-- Função segura para autenticar link remoto
CREATE OR REPLACE FUNCTION autenticar_link_remoto(
  p_link_token VARCHAR(50),
  p_codigo_acesso VARCHAR(6)
)
RETURNS TABLE (
  autenticado BOOLEAN,
  teste_aplicado_id UUID,
  mensagem TEXT
) AS $$
DECLARE
  v_teste_aplicado testes_aplicados%ROWTYPE;
BEGIN
  -- Buscar teste
  SELECT * INTO v_teste_aplicado
  FROM testes_aplicados
  WHERE link_token = p_link_token
    AND tipo_aplicacao = 'remota';

  -- Validações
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Link inválido';
    RETURN;
  END IF;

  IF v_teste_aplicado.status = 'bloqueado' THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Link bloqueado por segurança';
    RETURN;
  END IF;

  IF v_teste_aplicado.status = 'expirado' THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Link expirado';
    RETURN;
  END IF;

  IF v_teste_aplicado.data_expiracao < NOW() THEN
    UPDATE testes_aplicados SET status = 'expirado' WHERE id = v_teste_aplicado.id;
    RETURN QUERY SELECT false, NULL::UUID, 'Link expirado';
    RETURN;
  END IF;

  -- Verificar código
  IF v_teste_aplicado.codigo_acesso != p_codigo_acesso THEN
    -- Incrementar tentativas
    UPDATE testes_aplicados
    SET tentativas_codigo = tentativas_codigo + 1,
        status = CASE WHEN tentativas_codigo + 1 >= 3 THEN 'bloqueado' ELSE status END
    WHERE id = v_teste_aplicado.id;

    IF v_teste_aplicado.tentativas_codigo + 1 >= 3 THEN
      RETURN QUERY SELECT false, NULL::UUID, 'Link bloqueado após 3 tentativas incorretas';
    ELSE
      RETURN QUERY SELECT false, NULL::UUID, 'Código incorreto. Tentativas restantes: ' || (3 - v_teste_aplicado.tentativas_codigo - 1)::TEXT;
    END IF;
    RETURN;
  END IF;

  -- Sucesso
  UPDATE testes_aplicados
  SET status = CASE WHEN status = 'aguardando' THEN 'em_andamento' ELSE status END,
      data_primeiro_acesso = COALESCE(data_primeiro_acesso, NOW())
  WHERE id = v_teste_aplicado.id;

  RETURN QUERY SELECT true, v_teste_aplicado.id, 'Autenticado com sucesso';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION autenticar_link_remoto IS 'Autentica paciente via link remoto com controle de tentativas';

-- ===================================
-- GRANTS
-- ===================================

-- Revogar acesso público padrão
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

-- Conceder acesso apenas para roles autenticados
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON testes_aplicados TO anon; -- Apenas para links remotos
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===================================
-- COMENTÁRIOS FINAIS
-- ===================================

COMMENT ON SCHEMA public IS 'NeuroTest Platform - RLS habilitado para isolamento multi-tenant';
