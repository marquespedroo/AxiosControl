-- ===================================
-- MIGRATION 003: Add Super Admin Support
-- ===================================

-- Add is_super_admin column to psicologos table
ALTER TABLE psicologos
ADD COLUMN is_super_admin BOOLEAN DEFAULT false NOT NULL;

-- Create index for super admin queries
CREATE INDEX idx_psicologos_super_admin ON psicologos(is_super_admin) WHERE is_super_admin = true;

-- Add comment
COMMENT ON COLUMN psicologos.is_super_admin IS 'Super admin can manage clinics and system-wide settings';

-- Note: Super admins are still associated with a clinic but have elevated privileges
-- To create the first super admin, manually update after creating a psicologo:
-- UPDATE psicologos SET is_super_admin = true WHERE email = 'admin@example.com';
