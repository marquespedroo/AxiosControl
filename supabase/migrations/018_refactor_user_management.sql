-- ===================================
-- MIGRATION 018: Refactor User Management
-- Rename psicologos -> users
-- Extract professional details
-- Add Role Based Access Control
-- ===================================

-- 1. Rename Table
ALTER TABLE psicologos RENAME TO users;
ALTER INDEX psicologos_pkey RENAME TO users_pkey;
ALTER INDEX idx_psicologos_clinica RENAME TO users_clinica_id_idx;
ALTER INDEX idx_psicologos_email RENAME TO users_email_idx;
ALTER INDEX idx_psicologos_ativo RENAME TO users_ativo_idx;

-- 2. Create Roles Enum and Table
CREATE TYPE user_role AS ENUM ('super_admin', 'clinic_admin', 'psychologist', 'secretary');

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

COMMENT ON TABLE user_roles IS 'Roles assigned to users (Many-to-Many)';

-- 3. Create Professional Details Table
CREATE TABLE professional_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crp VARCHAR(20),
  crp_estado VARCHAR(2),
  especialidades TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT professional_details_user_unique UNIQUE (user_id),
  CONSTRAINT professional_details_crp_format CHECK (crp IS NULL OR crp ~* '^\d{2}/\d{4,6}$'),
  CONSTRAINT professional_details_crp_estado_format CHECK (crp_estado IS NULL OR crp_estado ~* '^[A-Z]{2}$')
);

CREATE INDEX idx_professional_details_user ON professional_details(user_id);

COMMENT ON TABLE professional_details IS 'Details specific to professional users (Psychologists)';

-- 4. Migrate Data
-- Move CRP/Specialties
INSERT INTO professional_details (user_id, crp, crp_estado, especialidades)
SELECT id, crp, crp_estado, especialidades
FROM users;

-- Assign 'psychologist' role to all existing users (formerly psicologos)
INSERT INTO user_roles (user_id, role)
SELECT id, 'psychologist'::user_role FROM users;

-- Assign 'super_admin' role
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'::user_role FROM users WHERE is_super_admin = true;

-- Assign 'clinic_admin' role
INSERT INTO user_roles (user_id, role)
SELECT id, 'clinic_admin'::user_role FROM users WHERE 'admin' = ANY(especialidades);

-- 5. Cleanup Users Table
ALTER TABLE users DROP COLUMN crp;
ALTER TABLE users DROP COLUMN crp_estado;
ALTER TABLE users DROP COLUMN especialidades;
ALTER TABLE users DROP COLUMN is_super_admin;

-- 6. Update RLS Policies
-- We need to drop old policies on 'psicologos' (now 'users') and recreate them using the new structure.
-- Also update policies on other tables that referenced 'psicologos' implicitly via helper functions.

-- Drop old policies on users
DROP POLICY IF EXISTS "Ver psicólogos da clínica" ON users;
DROP POLICY IF EXISTS "Atualizar próprio perfil" ON users;
DROP POLICY IF EXISTS "Admin cria psicólogos" ON users;
DROP POLICY IF EXISTS "Admin desativa psicólogos" ON users;

-- Update Helper Functions
CREATE OR REPLACE FUNCTION public.user_clinica_id()
RETURNS UUID AS $$
  SELECT clinica_id
  FROM public.users
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_clinic_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'clinic_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_details ENABLE ROW LEVEL SECURITY;

-- New Policies for Users
-- Users see colleagues in the same clinic
CREATE POLICY "Ver usuários da clínica"
  ON users FOR SELECT
  TO authenticated
  USING (clinica_id = public.user_clinica_id());

-- Users can update own profile
CREATE POLICY "Atualizar próprio perfil"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Clinic Admins can create users
CREATE POLICY "Admin cria usuários"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    clinica_id = public.user_clinica_id() AND
    public.is_clinic_admin()
  );

-- Clinic Admins can delete/disable users
CREATE POLICY "Admin gerencia usuários"
  ON users FOR DELETE
  TO authenticated
  USING (
    clinica_id = public.user_clinica_id() AND
    public.is_clinic_admin() AND
    id != auth.uid()
  );

-- Policies for User Roles
-- Everyone can read their own roles
CREATE POLICY "Ver próprios roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Clinic Admins can view roles of users in their clinic
CREATE POLICY "Admin vê roles da clínica"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_roles.user_id
        AND users.clinica_id = public.user_clinica_id()
    ) AND public.is_clinic_admin()
  );

-- Clinic Admins can assign roles (except super_admin)
CREATE POLICY "Admin gerencia roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_roles.user_id
        AND users.clinica_id = public.user_clinica_id()
    ) AND 
    public.is_clinic_admin() AND
    role != 'super_admin'
  );

CREATE POLICY "Admin remove roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_roles.user_id
        AND users.clinica_id = public.user_clinica_id()
    ) AND 
    public.is_clinic_admin() AND
    role != 'super_admin'
  );

-- Policies for Professional Details
-- Public read (within clinic) - needed for listing psychologists
CREATE POLICY "Ver detalhes profissionais da clínica"
  ON professional_details FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = professional_details.user_id
        AND users.clinica_id = public.user_clinica_id()
    )
  );

-- User updates own details
CREATE POLICY "Atualizar próprios detalhes"
  ON professional_details FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin creates details (when creating user)
CREATE POLICY "Admin cria detalhes"
  ON professional_details FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = professional_details.user_id
        AND users.clinica_id = public.user_clinica_id()
    ) AND public.is_clinic_admin()
  );

-- Update Foreign Key References in other tables?
-- No need, they referenced 'psicologos.id', which is now 'users.id'. 
-- Postgres handles the table rename for FK constraints automatically in most cases, 
-- but let's verify if we need to rename constraints or if they just point to the OID.
-- Usually renaming the table is enough.

-- Update current_clinica_id function from Migration 015 to use 'users' table
CREATE OR REPLACE FUNCTION public.current_clinica_id()
RETURNS UUID AS $$
DECLARE
  v_clinica_id UUID;
  v_custom_clinica TEXT;
BEGIN
  -- First, try to get from custom auth context
  v_custom_clinica := current_setting('app.current_clinica_id', true);
  IF v_custom_clinica IS NOT NULL AND v_custom_clinica != '' THEN
    RETURN v_custom_clinica::UUID;
  END IF;

  -- Fallback to Supabase Auth (auth.uid())
  SELECT clinica_id INTO v_clinica_id
  FROM public.users
  WHERE id = auth.uid();

  RETURN v_clinica_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_details_updated_at BEFORE UPDATE ON professional_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Drop old trigger on psicologos (it might have been renamed or dropped automatically, but safe to ensure)
DROP TRIGGER IF EXISTS update_psicologos_updated_at ON users;
