-- ===================================
-- MIGRATION 016: Fix ALL RLS Policies for Custom Auth
-- Replace auth.uid() with public.current_user_id() across all tables
-- This is required for medical-grade security with custom JWT auth
-- ===================================

-- ===================================
-- 1. DROP AND RECREATE testes_aplicados POLICIES
-- ===================================

-- Drop existing policies
DROP POLICY IF EXISTS "Ver testes aplicados da clínica" ON testes_aplicados;
DROP POLICY IF EXISTS "Aplicar testes em pacientes da clínica" ON testes_aplicados;
DROP POLICY IF EXISTS "Atualizar testes aplicados" ON testes_aplicados;
DROP POLICY IF EXISTS "Deletar testes aplicados" ON testes_aplicados;

-- Recreate with custom auth support
CREATE POLICY "Ver testes aplicados da clínica"
  ON testes_aplicados FOR SELECT
  TO authenticated
  USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE clinica_id = public.current_clinica_id()
    )
  );

CREATE POLICY "Aplicar testes em pacientes da clínica"
  ON testes_aplicados FOR INSERT
  TO authenticated
  WITH CHECK (
    psicologo_id = public.current_user_id() AND
    paciente_id IN (
      SELECT id FROM pacientes WHERE clinica_id = public.current_clinica_id()
    )
  );

CREATE POLICY "Atualizar testes aplicados"
  ON testes_aplicados FOR UPDATE
  TO authenticated
  USING (psicologo_id = public.current_user_id())
  WITH CHECK (psicologo_id = public.current_user_id());

CREATE POLICY "Deletar testes aplicados"
  ON testes_aplicados FOR DELETE
  TO authenticated
  USING (psicologo_id = public.current_user_id());

-- Keep anonymous policies for remote patient access (unchanged)
DROP POLICY IF EXISTS "Acesso anônimo via link remoto" ON testes_aplicados;
DROP POLICY IF EXISTS "Paciente responde via link" ON testes_aplicados;

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
-- 2. DROP AND RECREATE psicologos POLICIES
-- ===================================

DROP POLICY IF EXISTS "Atualizar próprio perfil" ON psicologos;

CREATE POLICY "Atualizar próprio perfil"
  ON psicologos FOR UPDATE
  TO authenticated
  USING (id = public.current_user_id())
  WITH CHECK (id = public.current_user_id());

-- ===================================
-- 3. DROP AND RECREATE pacientes POLICIES
-- ===================================

DROP POLICY IF EXISTS "Deletar pacientes (admin ou responsável)" ON pacientes;

CREATE POLICY "Deletar pacientes (admin ou responsável)"
  ON pacientes FOR DELETE
  TO authenticated
  USING (
    clinica_id = public.current_clinica_id() AND
    (public.is_clinic_admin() OR psicologo_responsavel_id = public.current_user_id())
  );

-- ===================================
-- 4. DROP AND RECREATE registros_manuais POLICIES
-- ===================================

DROP POLICY IF EXISTS "Criar registros manuais" ON registros_manuais;
DROP POLICY IF EXISTS "Atualizar próprios registros" ON registros_manuais;
DROP POLICY IF EXISTS "Deletar próprios registros" ON registros_manuais;

CREATE POLICY "Criar registros manuais"
  ON registros_manuais FOR INSERT
  TO authenticated
  WITH CHECK (
    psicologo_id = public.current_user_id() AND
    paciente_id IN (
      SELECT id FROM pacientes WHERE clinica_id = public.current_clinica_id()
    )
  );

CREATE POLICY "Atualizar próprios registros"
  ON registros_manuais FOR UPDATE
  TO authenticated
  USING (psicologo_id = public.current_user_id())
  WITH CHECK (psicologo_id = public.current_user_id());

CREATE POLICY "Deletar próprios registros"
  ON registros_manuais FOR DELETE
  TO authenticated
  USING (psicologo_id = public.current_user_id());

-- ===================================
-- 5. UPDATE is_clinic_admin FUNCTION
-- ===================================

CREATE OR REPLACE FUNCTION public.is_clinic_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.psicologos
    WHERE id = public.current_user_id()
      AND 'admin' = ANY(especialidades)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===================================
-- 6. UPDATE owns_patient FUNCTION
-- ===================================

CREATE OR REPLACE FUNCTION public.owns_patient(patient_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pacientes
    WHERE id = patient_id
      AND (
        psicologo_responsavel_id = public.current_user_id() OR
        clinica_id = public.current_clinica_id()
      )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===================================
-- 7. ADD SERVICE ROLE BYPASS COMMENT
-- ===================================

COMMENT ON FUNCTION public.set_rls_context IS
  'Set RLS context for custom JWT auth. Must be called before any RLS-protected operation.
   This function sets app.current_user_id and app.current_clinica_id which are used by
   all RLS policies instead of auth.uid().';

COMMENT ON FUNCTION public.current_user_id IS
  'Returns current user ID from custom auth context (app.current_user_id) or falls back to auth.uid()';

COMMENT ON FUNCTION public.current_clinica_id IS
  'Returns current clinica ID from custom auth context (app.current_clinica_id) or falls back to user_clinica_id()';

-- ===================================
-- END OF MIGRATION
-- ===================================
