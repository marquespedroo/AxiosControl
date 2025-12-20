-- ============================================================================
-- CLEANUP: Remove old/incorrect EBADEP-A tests and keep only the correct one
-- ============================================================================

-- Step 1: Identify the correct EBADEP-A test (the one with bipolar format)
-- The correct test has texto_esquerda and texto_direita in questions
DO $$
DECLARE
  correct_test_id UUID;
  test_record RECORD;
BEGIN
  -- Find the test with bipolar questions (has texto_esquerda field)
  FOR test_record IN
    SELECT id, questoes
    FROM testes_templates
    WHERE sigla = 'EBADEP-A'
    ORDER BY created_at DESC
  LOOP
    -- Check if first question has texto_esquerda field (bipolar format)
    IF test_record.questoes->0 ? 'texto_esquerda' THEN
      correct_test_id := test_record.id;
      RAISE NOTICE 'Found correct EBADEP-A test: %', correct_test_id;
      EXIT; -- Exit loop once we find it
    END IF;
  END LOOP;

  -- If we found the correct test, delete all others
  IF correct_test_id IS NOT NULL THEN
    -- Delete tag associations for old tests
    DELETE FROM testes_templates_tags
    WHERE teste_template_id IN (
      SELECT id FROM testes_templates
      WHERE sigla = 'EBADEP-A' AND id != correct_test_id
    );

    -- Delete old EBADEP-A tests
    DELETE FROM testes_templates
    WHERE sigla = 'EBADEP-A' AND id != correct_test_id;

    RAISE NOTICE 'Deleted old EBADEP-A tests, kept only: %', correct_test_id;
  ELSE
    RAISE EXCEPTION 'No correct EBADEP-A test found with bipolar format!';
  END IF;
END $$;

-- Step 2: Verify only one EBADEP-A test remains
DO $$
DECLARE
  test_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO test_count
  FROM testes_templates
  WHERE sigla = 'EBADEP-A';

  IF test_count != 1 THEN
    RAISE EXCEPTION 'Expected 1 EBADEP-A test, found: %', test_count;
  END IF;

  RAISE NOTICE 'Cleanup successful - 1 EBADEP-A test remains';
END $$;

-- Step 3: Verify the remaining test has correct structure
DO $$
DECLARE
  test_check RECORD;
BEGIN
  SELECT
    id,
    nome,
    jsonb_array_length(questoes) as total_questoes,
    questoes->0 as primeira_questao,
    (questoes->0 ? 'texto_esquerda') as tem_texto_esquerda,
    (questoes->0 ? 'texto_direita') as tem_texto_direita,
    (questoes->0->>'tipo_resposta') as tipo_resposta,
    (interpretacao ? 'instrucoes_aplicacao') as tem_instrucoes,
    (interpretacao ? 'exemplos_resposta') as tem_exemplos
  INTO test_check
  FROM testes_templates
  WHERE sigla = 'EBADEP-A';

  RAISE NOTICE 'EBADEP-A Test Verification:';
  RAISE NOTICE '  ID: %', test_check.id;
  RAISE NOTICE '  Nome: %', test_check.nome;
  RAISE NOTICE '  Total questões: %', test_check.total_questoes;
  RAISE NOTICE '  Tipo resposta: %', test_check.tipo_resposta;
  RAISE NOTICE '  Tem texto_esquerda: %', test_check.tem_texto_esquerda;
  RAISE NOTICE '  Tem texto_direita: %', test_check.tem_texto_direita;
  RAISE NOTICE '  Tem instruções: %', test_check.tem_instrucoes;
  RAISE NOTICE '  Tem exemplos: %', test_check.tem_exemplos;

  -- Validate structure
  IF NOT test_check.tem_texto_esquerda THEN
    RAISE EXCEPTION 'EBADEP-A missing texto_esquerda!';
  END IF;

  IF NOT test_check.tem_texto_direita THEN
    RAISE EXCEPTION 'EBADEP-A missing texto_direita!';
  END IF;

  IF test_check.tipo_resposta != 'diferencial_0_3' THEN
    RAISE EXCEPTION 'EBADEP-A has wrong tipo_resposta: %', test_check.tipo_resposta;
  END IF;

  IF test_check.total_questoes != 45 THEN
    RAISE EXCEPTION 'EBADEP-A should have 45 questions, has: %', test_check.total_questoes;
  END IF;

  RAISE NOTICE 'All validations passed!';
END $$;
