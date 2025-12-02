-- ===================================
-- MIGRATION 023: Fix Security Lints
-- Fixes: security_definer_view, rls_disabled_in_public
-- ===================================

-- 1. Fix security_definer_view on pacientes_com_escolaridade
-- We recreate the view. By default, views are SECURITY INVOKER in Postgres,
-- which is what we want (RLS of the querying user should apply).

DROP VIEW IF EXISTS pacientes_com_escolaridade;

CREATE VIEW pacientes_com_escolaridade AS
SELECT
  p.*,
  COALESCE(p.escolaridade_anos, escolaridade_nivel_to_anos(p.escolaridade_nivel)) as anos_estudo_efetivos
FROM pacientes p;

COMMENT ON VIEW pacientes_com_escolaridade IS 'View dos pacientes com anos de estudo calculados (usando escolaridade_anos ou convertendo escolaridade_nivel)';

-- 2. Fix rls_disabled_in_public on tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all tags (they are system-wide resources)
CREATE POLICY "Authenticated users can view tags"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only super admins can manage tags (create, update, delete)
CREATE POLICY "Super admins can manage tags"
  ON tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM psicologos
      WHERE id = auth.uid() AND is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM psicologos
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- 3. Fix rls_disabled_in_public on testes_templates_tags
ALTER TABLE testes_templates_tags ENABLE ROW LEVEL SECURITY;

-- Policy: View tags for accessible tests
-- Users can see tags if they can see the test template (public or same clinic)
CREATE POLICY "View tags for accessible tests"
  ON testes_templates_tags FOR SELECT
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

-- Policy: Manage tags for own private tests
-- Users can add/remove tags only for their own private tests
CREATE POLICY "Manage tags for own private tests"
  ON testes_templates_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM testes_templates tt
      WHERE tt.id = teste_template_id
        AND tt.criado_por = auth.uid()
        AND tt.publico = false
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM testes_templates tt
      WHERE tt.id = teste_template_id
        AND tt.criado_por = auth.uid()
        AND tt.publico = false
    )
  );
