-- ===================================
-- MIGRATION 017: Custom JWT RLS Support
-- Update RLS to work with custom JWT authentication
-- ===================================

-- ===================================
-- POSTGRESQL SESSION VARIABLE SETTER
-- ===================================

-- Function to set session variables from custom JWT
-- This is called by the application layer before making queries
CREATE OR REPLACE FUNCTION public.set_session_variables(
  user_id UUID,
  clinica_id UUID,
  is_super_admin BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  -- Set session variables that RLS policies can access
  PERFORM set_config('app.user_id', user_id::TEXT, false);
  PERFORM set_config('app.clinica_id', clinica_id::TEXT, false);
  PERFORM set_config('app.is_super_admin', is_super_admin::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.set_session_variables IS 'Sets PostgreSQL session variables from custom JWT for RLS';

-- ===================================
-- NEW RLS HELPER FUNCTIONS
-- ===================================

-- Get current user ID from session variable (custom JWT)
CREATE OR REPLACE FUNCTION public.custom_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.user_id', true)::UUID,
    NULL
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.custom_user_id IS 'Returns user_id from custom JWT session variable';

-- Get current user's clinic ID from session variable (custom JWT)
CREATE OR REPLACE FUNCTION public.custom_user_clinica_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.clinica_id', true)::UUID,
    NULL
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.custom_user_clinica_id IS 'Returns clinica_id from custom JWT session variable';

-- Check if current user is super admin from session variable (custom JWT)
CREATE OR REPLACE FUNCTION public.custom_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.is_super_admin', true)::BOOLEAN,
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.custom_is_super_admin IS 'Returns is_super_admin from custom JWT session variable';

-- ===================================
-- UPDATE EXISTING RLS POLICIES
-- ===================================

-- Drop old clinicas policies
DROP POLICY IF EXISTS "Psicólogos veem própria clínica" ON clinicas;
DROP POLICY IF EXISTS "Admins editam clínica" ON clinicas;
DROP POLICY IF EXISTS "Deletar clínica bloqueado" ON clinicas;

-- New clinicas policies with custom JWT support
CREATE POLICY "Psicólogos veem própria clínica (custom JWT)"
  ON clinicas FOR SELECT
  TO authenticated
  USING (
    -- Super admins see all clinics
    public.custom_is_super_admin() = true OR
    -- Regular users see only their clinic
    id = public.custom_user_clinica_id()
  );

CREATE POLICY "Super admins editam qualquer clínica"
  ON clinicas FOR UPDATE
  TO authenticated
  USING (public.custom_is_super_admin() = true)
  WITH CHECK (public.custom_is_super_admin() = true);

CREATE POLICY "Super admins criam clínicas"
  ON clinicas FOR INSERT
  TO authenticated
  WITH CHECK (public.custom_is_super_admin() = true);

CREATE POLICY "Super admins deletam clínicas"
  ON clinicas FOR DELETE
  TO authenticated
  USING (public.custom_is_super_admin() = true);

-- ===================================
-- UPDATE PSICOLOGOS POLICIES
-- ===================================

-- Drop old policies
DROP POLICY IF EXISTS "Ver psicólogos da clínica" ON psicologos;
DROP POLICY IF EXISTS "Atualizar próprio perfil" ON psicologos;
DROP POLICY IF EXISTS "Admin cria psicólogos" ON psicologos;
DROP POLICY IF EXISTS "Admin desativa psicólogos" ON psicologos;

-- New policies with custom JWT support
CREATE POLICY "Ver psicólogos da clínica (custom JWT)"
  ON psicologos FOR SELECT
  TO authenticated
  USING (
    public.custom_is_super_admin() = true OR
    clinica_id = public.custom_user_clinica_id()
  );

CREATE POLICY "Atualizar próprio perfil (custom JWT)"
  ON psicologos FOR UPDATE
  TO authenticated
  USING (
    public.custom_is_super_admin() = true OR
    id = public.custom_user_id()
  )
  WITH CHECK (
    public.custom_is_super_admin() = true OR
    id = public.custom_user_id()
  );

CREATE POLICY "Admin cria psicólogos (custom JWT)"
  ON psicologos FOR INSERT
  TO authenticated
  WITH CHECK (
    public.custom_is_super_admin() = true OR
    (clinica_id = public.custom_user_clinica_id() AND public.is_clinic_admin())
  );

CREATE POLICY "Admin desativa psicólogos (custom JWT)"
  ON psicologos FOR DELETE
  TO authenticated
  USING (
    public.custom_is_super_admin() = true OR
    (clinica_id = public.custom_user_clinica_id() AND 
     public.is_clinic_admin() AND 
     id != public.custom_user_id())
  );

-- ===================================
-- UPDATE PACIENTES POLICIES
-- ===================================

-- Drop old policies
DROP POLICY IF EXISTS "Ver pacientes da clínica" ON pacientes;
DROP POLICY IF EXISTS "Criar pacientes na clínica" ON pacientes;
DROP POLICY IF EXISTS "Atualizar pacientes da clínica" ON pacientes;
DROP POLICY IF EXISTS "Deletar pacientes (admin ou responsável)" ON pacientes;

-- New policies with custom JWT support
CREATE POLICY "Ver pacientes da clínica (custom JWT)"
  ON pacientes FOR SELECT
  TO authenticated
  USING (
    public.custom_is_super_admin() = true OR
    clinica_id = public.custom_user_clinica_id()
  );

CREATE POLICY "Criar pacientes na clínica (custom JWT)"
  ON pacientes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.custom_is_super_admin() = true OR
    clinica_id = public.custom_user_clinica_id()
  );

CREATE POLICY "Atualizar pacientes da clínica (custom JWT)"
  ON pacientes FOR UPDATE
  TO authenticated
  USING (
    public.custom_is_super_admin() = true OR
    clinica_id = public.custom_user_clinica_id()
  )
  WITH CHECK (
    public.custom_is_super_admin() = true OR
    clinica_id = public.custom_user_clinica_id()
  );

CREATE POLICY "Deletar pacientes (custom JWT)"
  ON pacientes FOR DELETE
  TO authenticated
  USING (
    public.custom_is_super_admin() = true OR
    (clinica_id = public.custom_user_clinica_id() AND
     (public.is_clinic_admin() OR psicologo_responsavel_id = public.custom_user_id()))
  );

-- ===================================
-- GRANT EXECUTE PERMISSIONS
-- ===================================

GRANT EXECUTE ON FUNCTION public.set_session_variables TO authenticated;
GRANT EXECUTE ON FUNCTION public.custom_user_id TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.custom_user_clinica_id TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.custom_is_super_admin TO authenticated, anon;

-- ===================================
-- COMMENTS
-- ===================================

COMMENT ON SCHEMA public IS 'NeuroTest Platform - Custom JWT RLS enabled';
