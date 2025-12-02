-- Drop existing policy
DROP POLICY IF EXISTS "Ver testes disponíveis" ON testes_templates;

-- Create new policy that allows unauthenticated users to see public tests
CREATE POLICY "Ver testes disponíveis"
  ON testes_templates FOR SELECT
  USING (
    publico = true OR
    (auth.uid() IS NOT NULL AND criado_por IN (
      SELECT id FROM psicologos WHERE clinica_id = (
        SELECT clinica_id FROM psicologos WHERE id = auth.uid()
      )
    ))
  );
