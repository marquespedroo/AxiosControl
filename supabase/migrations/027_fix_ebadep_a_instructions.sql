-- ============================================================================
-- FIX: Update EBADEP-A instructions to mention circles instead of parenthesis
-- ============================================================================

-- Update the instructions text to match the actual UI implementation
UPDATE testes_templates
SET interpretacao = jsonb_set(
  interpretacao,
  '{instrucoes_aplicacao}',
  '"Leia atentamente as duas frases opostas em cada linha e clique no círculo que melhor representa como você vem se sentindo em um período de duas semanas, inclusive hoje. O círculo que você escolher deve estar mais próximo da frase que melhor descreve seu estado."'::jsonb
)
WHERE sigla = 'EBADEP-A';

-- Verify the update
DO $$
DECLARE
  updated_instructions TEXT;
BEGIN
  SELECT interpretacao->>'instrucoes_aplicacao' INTO updated_instructions
  FROM testes_templates
  WHERE sigla = 'EBADEP-A';

  RAISE NOTICE 'Updated EBADEP-A instructions: %', updated_instructions;

  -- Validate that the word "círculo" is present and "parêntese" is not
  IF updated_instructions NOT LIKE '%círculo%' THEN
    RAISE EXCEPTION 'Instructions should mention "círculo"';
  END IF;

  IF updated_instructions LIKE '%parêntese%' OR updated_instructions LIKE '%X%' THEN
    RAISE EXCEPTION 'Instructions should not mention "parêntese" or "X"';
  END IF;

  RAISE NOTICE 'Instructions validation passed!';
END $$;
