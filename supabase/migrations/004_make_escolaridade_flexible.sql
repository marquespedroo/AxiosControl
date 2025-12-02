-- Make escolaridade_anos nullable and add constraint to require at least one
ALTER TABLE pacientes
  ALTER COLUMN escolaridade_anos DROP NOT NULL;

-- Add check constraint: must have at least one of escolaridade_anos or escolaridade_nivel
ALTER TABLE pacientes
  ADD CONSTRAINT pacientes_escolaridade_required
  CHECK (
    escolaridade_anos IS NOT NULL OR
    escolaridade_nivel IS NOT NULL
  );

-- Add helper function to convert escolaridade_nivel to approximate years
CREATE OR REPLACE FUNCTION escolaridade_nivel_to_anos(nivel VARCHAR(50))
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN nivel ILIKE '%fundamental incompleto%' OR nivel = 'fundamental_incompleto' THEN 4
    WHEN nivel ILIKE '%fundamental%' OR nivel = 'fundamental_completo' THEN 9
    WHEN nivel ILIKE '%médio incompleto%' OR nivel = 'medio_incompleto' THEN 10
    WHEN nivel ILIKE '%médio%' OR nivel ILIKE '%medio%' OR nivel = 'medio_completo' THEN 12
    WHEN nivel ILIKE '%superior incompleto%' OR nivel = 'superior_incompleto' THEN 14
    WHEN nivel ILIKE '%superior%' OR nivel = 'superior_completo' THEN 16
    WHEN nivel ILIKE '%pós%' OR nivel ILIKE '%pos%' OR nivel = 'pos_graduacao' THEN 18
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION escolaridade_nivel_to_anos IS 'Converte nível de escolaridade brasileiro para anos aproximados de estudo';

-- Add computed column helper view for easier queries
CREATE OR REPLACE VIEW pacientes_com_escolaridade AS
SELECT
  p.*,
  COALESCE(p.escolaridade_anos, escolaridade_nivel_to_anos(p.escolaridade_nivel)) as anos_estudo_efetivos
FROM pacientes p;

COMMENT ON VIEW pacientes_com_escolaridade IS 'View dos pacientes com anos de estudo calculados (usando escolaridade_anos ou convertendo escolaridade_nivel)';
