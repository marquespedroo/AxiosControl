-- Migration: Add new psychological tests
-- Tests: AQ-10-C (Child), ETDAH-Professores, ETDAH-Pais
-- Date: 2024-12

-- =====================================================
-- AQ-10 Child Version (4-11 years)
-- Autism Quotient - Child Version
-- =====================================================

INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'Quociente de Espectro do Autismo - Versão Criança (4-11 anos)',
  'AQ-10-C',
  'escala_likert',
  4, 11, 5,

  -- QUESTOES (10 itens)
  $$[
    {"numero": 1, "texto": "Ele/a nota muitas vezes pequenos ruídos que passam despercebidos às outras pessoas", "secao": "geral", "tipo_resposta": "likert_aq10", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Habitualmente, ele/a concentra-se mais na imagem ou situação no seu todo, do que em pequenos detalhes", "secao": "geral", "tipo_resposta": "likert_aq10", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Quando está num grupo social, ele/a consegue facilmente seguir conversas de várias pessoas ao mesmo tempo", "secao": "geral", "tipo_resposta": "likert_aq10", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "Ele/a consegue facilmente fazer mais do que uma coisa ao mesmo tempo", "secao": "geral", "tipo_resposta": "likert_aq10", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "Ele/a não sabe como manter uma conversa com os seus pares", "secao": "geral", "tipo_resposta": "likert_aq10", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Socialmente, ele/a é bom/boa conversador/a", "secao": "geral", "tipo_resposta": "likert_aq10", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "Durante a leitura de uma história, ele/a tem dificuldades em perceber as intenções ou sentimentos das personagens", "secao": "geral", "tipo_resposta": "likert_aq10", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "No pré-escolar, ele/a gostava de brincar a jogos de faz-de-conta com as outras crianças", "secao": "geral", "tipo_resposta": "likert_aq10", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "Ele/a percebe facilmente o que alguém está a pensar ou a sentir, só de olhar para a sua cara", "secao": "geral", "tipo_resposta": "likert_aq10", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Ele/a tem dificuldades em fazer novos amigos", "secao": "geral", "tipo_resposta": "likert_aq10", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 10}
  ]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
    "likert_aq10": [
      {"valor": 1, "texto": "Concordo Totalmente"},
      {"valor": 2, "texto": "Concordo em Parte"},
      {"valor": 3, "texto": "Discordo em Parte"},
      {"valor": 4, "texto": "Discordo Totalmente"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO
  $${
    "tipo": "soma_simples",
    "pontuacao": {
      "itens_invertidos": [1, 5, 7, 10],
      "itens_normais": [2, 3, 4, 6, 8, 9],
      "regra_invertidos": "Pontua 1 se Concordo Totalmente ou Concordo em Parte",
      "regra_normais": "Pontua 1 se Discordo em Parte ou Discordo Totalmente"
    },
    "ponto_corte": 6,
    "max_pontos": 10
  }$$::jsonb,

  -- INTERPRETACAO
  $${
    "notas": "O AQ-10 Criança é uma ferramenta de triagem para identificar sinais de autismo em crianças de 4 a 11 anos. Deve ser preenchido por pais ou cuidadores.",
    "faixas": [
      {"min": 0, "max": 5, "nivel": "Abaixo do ponto de corte", "descricao": "Pontuação abaixo do ponto de corte. Baixa probabilidade de TEA, mas não exclui diagnóstico."},
      {"min": 6, "max": 10, "nivel": "Acima do ponto de corte", "descricao": "Pontuação igual ou acima do ponto de corte. Recomenda-se avaliação especializada para TEA."}
    ],
    "referencia": "Allison et al., 2012"
  }$$::jsonb,

  true, true
);

-- =====================================================
-- ETDAH - Versão para Professores
-- Escala de TDAH para ambiente escolar
-- =====================================================

INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'ETDAH - Versão para Professores',
  'ETDAH-PROF',
  'escala_likert',
  6, 17, 15,

  -- QUESTOES (49 itens, 4 seções)
  $$[
    {"numero": 1, "texto": "É organizado em suas lições de classe", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Dá respostas claras e coerentes ao professor", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Segue o ritmo da classe", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "É atento nas lições do caderno", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "É responsável com o seu material escolar", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Sabe trabalhar independentemente", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "É meticuloso nas atividades (detalhista)", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "Fica atento durante às explicações do professor", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "É atento com as lições do caderno", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Consegue prestar atenção à uma mesma coisa durante muito tempo", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "Perde e esquece objetos (livros, lápis, borracha, etc.)", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "Distrai-se facilmente por barulhos em sala da aula", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "Nunca termina o que começa", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "Passa de uma atividade incompleta para outra", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "Tem dificuldade para concentrar-se", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "Esquece muito rápido o que acabou de ser dito", "secao": "deficit_atencao", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "Mexe-se e contorce-se na cadeira", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "Age sem pensar (é impulsivo)", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "Parece estar sempre 'a todo vapor' ou 'ligado como um motor'", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "Mexe mãos e pés constantemente (é inquieto)", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "Levanta-se frequentemente da carteira", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "Atrapalha o professor com barulhos diferentes", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "Age imprudentemente", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "Tem sempre muita pressa", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "Muda muito de lugar e de postura", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25},
    {"numero": 26, "texto": "Fala pouco", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 26},
    {"numero": 27, "texto": "É paciente (sabe aguardar a sua vez)", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 27},
    {"numero": 28, "texto": "Parece ser uma criança tranquila e sossegada", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 28},
    {"numero": 29, "texto": "Não rende de acordo com o esperado em Português", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29},
    {"numero": 30, "texto": "Tem dificuldade para entender problemas de matemática", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30},
    {"numero": 31, "texto": "Dificuldade para expressar verbalmente seus pensamentos", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31},
    {"numero": 32, "texto": "Seu raciocínio lógico é lento", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32},
    {"numero": 33, "texto": "Troca letras ao escrever", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33},
    {"numero": 34, "texto": "Sua caligrafia é desleixada", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 34},
    {"numero": 35, "texto": "Gosta de fazer exercícios de matemática", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 35},
    {"numero": 36, "texto": "Escreve sem erros", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 36},
    {"numero": 37, "texto": "Lê perfeitamente", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 37},
    {"numero": 38, "texto": "É rápido para fazer cálculos", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 38},
    {"numero": 39, "texto": "Compreende textos corretamente", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 39},
    {"numero": 40, "texto": "Domina soma, subtração, multiplicação e divisão", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 40},
    {"numero": 41, "texto": "Segue normas e regras da classe", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 41},
    {"numero": 42, "texto": "Fala com perfeição", "secao": "problemas_aprendizagem", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 42},
    {"numero": 43, "texto": "Os colegas da classe o evitam", "secao": "comportamento_antissocial", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43},
    {"numero": 44, "texto": "Irrita outras crianças com suas palhaçadas", "secao": "comportamento_antissocial", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 44},
    {"numero": 45, "texto": "É briguento", "secao": "comportamento_antissocial", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45},
    {"numero": 46, "texto": "Causa confusão em sala de aula", "secao": "comportamento_antissocial", "tipo_resposta": "likert_etdah", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 46},
    {"numero": 47, "texto": "É bem aceito pelos colegas da classe", "secao": "comportamento_antissocial", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 47},
    {"numero": 48, "texto": "Sabe respeitar professores", "secao": "comportamento_antissocial", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 48},
    {"numero": 49, "texto": "Possui muitos amigos", "secao": "comportamento_antissocial", "tipo_resposta": "likert_etdah", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 49}
  ]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
    "likert_etdah": [
      {"valor": 1, "texto": "Discordo Totalmente"},
      {"valor": 2, "texto": "Discordo"},
      {"valor": 3, "texto": "Discordo Parcialmente"},
      {"valor": 4, "texto": "Concordo Parcialmente"},
      {"valor": 5, "texto": "Concordo"},
      {"valor": 6, "texto": "Concordo Totalmente"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO
  $${
    "tipo": "secoes",
    "secoes": {
      "deficit_atencao": {
        "nome": "Déficit de Atenção",
        "descricao": "Avalia sintomas de desatenção no ambiente escolar",
        "questoes": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        "invertidas": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "peso": 1
      },
      "hiperatividade_impulsividade": {
        "nome": "Hiperatividade/Impulsividade",
        "descricao": "Avalia sintomas de hiperatividade e impulsividade",
        "questoes": [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
        "invertidas": [26, 27, 28],
        "peso": 1
      },
      "problemas_aprendizagem": {
        "nome": "Problemas de Aprendizagem",
        "descricao": "Avalia dificuldades acadêmicas e de aprendizagem",
        "questoes": [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42],
        "invertidas": [34, 35, 36, 37, 38, 39, 40, 41, 42],
        "peso": 1
      },
      "comportamento_antissocial": {
        "nome": "Comportamento Anti-Social",
        "descricao": "Avalia comportamentos sociais inadequados",
        "questoes": [43, 44, 45, 46, 47, 48, 49],
        "invertidas": [47, 48, 49],
        "peso": 1
      }
    },
    "score_total": "soma_secoes",
    "nota_inversao": "Itens invertidos: a pontuação é invertida (7 - resposta)"
  }$$::jsonb,

  -- INTERPRETACAO
  $${
    "notas": "O ETDAH - Versão Professores avalia comportamentos relacionados ao TDAH no ambiente escolar. Deve ser preenchido por professores que conhecem bem a criança.",
    "subescalas": {
      "deficit_atencao": {
        "descricao": "Avalia sintomas de desatenção",
        "max_pontos": 96
      },
      "hiperatividade_impulsividade": {
        "descricao": "Avalia hiperatividade e impulsividade",
        "max_pontos": 72
      },
      "problemas_aprendizagem": {
        "descricao": "Avalia dificuldades de aprendizagem",
        "max_pontos": 84
      },
      "comportamento_antissocial": {
        "descricao": "Avalia comportamento social",
        "max_pontos": 42
      }
    },
    "referencia": "Benczik, E. B. P. - Escala de TDAH"
  }$$::jsonb,

  true, true
);

-- =====================================================
-- ETDAH - Versão para Pais
-- Escala de TDAH para ambiente familiar
-- =====================================================

INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'ETDAH - Versão para Pais',
  'ETDAH-PAIS',
  'escala_likert',
  6, 17, 15,

  -- QUESTOES (58 itens, 4 fatores)
  $$[
    {"numero": 1, "texto": "Faz amizade, mas não consegue mantê-la", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Implica com tudo", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Tem fortes reações emocionais (explosões de raiva)", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "É irritadiço (tudo o incomoda)", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "Muda facilmente de humor", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Explode com facilidade (é do tipo 'pavio curto')", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "Dá a impressão de estar sempre insatisfeito (nada o agrada)", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "É rebelde (não aceita nada)", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "É agressivo", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Sente-se infeliz", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "Faz birra quando quer algo", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "Mostra-se tenso e rígido", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "Implica com os irmãos", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "As atividades e reuniões são desagradáveis", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "Todos têm que fazer o que ele quer", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "A hora de acordar e das refeições é desagradável", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "Exige mais tempo e atenção dos pais do que os outros filhos", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "Tem dificuldades para se adaptar às mudanças", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "É sensível", "secao": "regulacao_emocional", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "Movimenta-se muito (parece estar ligado com um motor ou a todo vapor)", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "É inquieto e agitado", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "Mexe-se e contorce-se durante as refeições e para realizar as tarefas de casa", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "Tem sempre muita pressa", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "Age sem pensar (é impulsivo)", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "É inconsequente (não considera os perigos da situação)", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25},
    {"numero": 26, "texto": "Intromete-se em assuntos que não lhe dizem respeito", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26},
    {"numero": 27, "texto": "Responde antes de ouvir a pergunta inteira", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 27},
    {"numero": 28, "texto": "É imprudente", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 28},
    {"numero": 29, "texto": "Irrita os outros com suas palhaçadas", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29},
    {"numero": 30, "texto": "Tende a discordar com as regras e normas de jogos", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30},
    {"numero": 31, "texto": "É persistente e insiste diante de uma ideia", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31},
    {"numero": 32, "texto": "Faz os deveres escolares rápido demais", "secao": "hiperatividade_impulsividade", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32},
    {"numero": 33, "texto": "Aceita facilmente regras, normas e limites", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33},
    {"numero": 34, "texto": "Parece ser uma criança tranquila e sossegada", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 34},
    {"numero": 35, "texto": "É tolerante, quando preciso", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35},
    {"numero": 36, "texto": "Respeita normas e regras", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 36},
    {"numero": 37, "texto": "É obediente", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 37},
    {"numero": 38, "texto": "Obedece aos pais e as normas da casa", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 38},
    {"numero": 39, "texto": "Sabe aguardar sua vez (é paciente)", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39},
    {"numero": 40, "texto": "Faz suas tarefas e almoça com bastante tranquilidade", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 40},
    {"numero": 41, "texto": "Faz as coisas com muito cuidado, provendo todos os riscos de suas ações", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41},
    {"numero": 42, "texto": "Seu comportamento é adequado socialmente", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42},
    {"numero": 43, "texto": "Fala pouco", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43},
    {"numero": 44, "texto": "A criança permite que o ambiente familiar seja tranquilo e harmonioso", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 44},
    {"numero": 45, "texto": "Consegue expressar claramente os seus pensamentos", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45},
    {"numero": 46, "texto": "É atento quando conversa com alguém", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 46},
    {"numero": 47, "texto": "É independente para realizar as suas tarefas de casa", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 47},
    {"numero": 48, "texto": "É distraído com quase tudo", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 48},
    {"numero": 49, "texto": "Evita atividades que exigem esforço mental constante (deveres escolares, jogos)", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 49},
    {"numero": 50, "texto": "Esquece rápido o que acabou de ser dito", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 50},
    {"numero": 51, "texto": "Inicia uma atividade com entusiasmo e dificilmente chega ao final (é do tipo fogo de palha)", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 51},
    {"numero": 52, "texto": "Tem dificuldade para realizar as coisas importantes (lição, por exemplo)", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 52},
    {"numero": 53, "texto": "Não termina o que começa", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 53},
    {"numero": 54, "texto": "Parece sonhar acordado (estar no mundo da lua)", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 54},
    {"numero": 55, "texto": "Mostra-se concentrado apenas em atividades de seu interesse", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 55},
    {"numero": 56, "texto": "Dá a impressão de que não ouve bem (só escuta o que quer)", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 56},
    {"numero": 57, "texto": "Dificilmente observa detalhes", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 57},
    {"numero": 58, "texto": "Ocorrem discussões entre os pais e a criança, em função da falta de responsabilidade e da falta de senso de dever", "secao": "atencao", "tipo_resposta": "likert_etdah_pais", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 58}
  ]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
    "likert_etdah_pais": [
      {"valor": 1, "texto": "Nunca"},
      {"valor": 2, "texto": "Muito Pouco"},
      {"valor": 3, "texto": "Pouco"},
      {"valor": 4, "texto": "Geralmente"},
      {"valor": 5, "texto": "Frequentemente"},
      {"valor": 6, "texto": "Muito Frequentemente"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO
  $${
    "tipo": "secoes",
    "secoes": {
      "regulacao_emocional": {
        "nome": "Regulação Emocional (RE)",
        "descricao": "Avalia a capacidade de regular emoções e comportamentos",
        "questoes": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        "invertidas": [],
        "peso": 1
      },
      "hiperatividade_impulsividade": {
        "nome": "Hiperatividade/Impulsividade (HI)",
        "descricao": "Avalia sintomas de hiperatividade e impulsividade no ambiente familiar",
        "questoes": [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
        "invertidas": [],
        "peso": 1
      },
      "comportamento_adaptativo": {
        "nome": "Comportamento Adaptativo (CA)",
        "descricao": "Avalia comportamentos adaptativos e sociais",
        "questoes": [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
        "invertidas": [],
        "peso": 1
      },
      "atencao": {
        "nome": "Atenção (A)",
        "descricao": "Avalia sintomas de desatenção no ambiente familiar",
        "questoes": [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
        "invertidas": [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
        "peso": 1
      }
    },
    "score_total": "soma_secoes"
  }$$::jsonb,

  -- INTERPRETACAO
  $${
    "notas": "O ETDAH - Versão Pais avalia comportamentos relacionados ao TDAH no ambiente familiar. Deve ser preenchido por pais ou responsáveis que convivem com a criança.",
    "subescalas": {
      "regulacao_emocional": {
        "descricao": "Regulação emocional e comportamental",
        "max_pontos": 114
      },
      "hiperatividade_impulsividade": {
        "descricao": "Hiperatividade e impulsividade",
        "max_pontos": 78
      },
      "comportamento_adaptativo": {
        "descricao": "Comportamentos adaptativos (pontuação alta = melhor adaptação)",
        "max_pontos": 84
      },
      "atencao": {
        "descricao": "Atenção e concentração",
        "max_pontos": 72
      }
    },
    "referencia": "Benczik, E. B. P. - ETDAH-PAIS"
  }$$::jsonb,

  true, true
);

-- =====================================================
-- Verify insertions
-- =====================================================

-- =====================================================
-- EBADEP-A (Escala Baptista de Depressão - Adulto)
-- 45 itens para avaliação de sintomas depressivos
-- =====================================================

INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'Escala Baptista de Depressão - Versão Adulto',
  'EBADEP-A',
  'escala_likert',
  18, 99, 15,

  -- QUESTOES (45 itens - estrutura para preenchimento posterior)
  $$[
    {"numero": 1, "texto": "Item 1 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Item 2 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Item 3 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "Item 4 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "Item 5 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Item 6 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "Item 7 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "Item 8 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "Item 9 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Item 10 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "Item 11 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "Item 12 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "Item 13 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "Item 14 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "Item 15 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "Item 16 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "Item 17 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "Item 18 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "Item 19 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "Item 20 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "Item 21 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "Item 22 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "Item 23 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "Item 24 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "Item 25 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25},
    {"numero": 26, "texto": "Item 26 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26},
    {"numero": 27, "texto": "Item 27 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 27},
    {"numero": 28, "texto": "Item 28 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 28},
    {"numero": 29, "texto": "Item 29 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29},
    {"numero": 30, "texto": "Item 30 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30},
    {"numero": 31, "texto": "Item 31 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31},
    {"numero": 32, "texto": "Item 32 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32},
    {"numero": 33, "texto": "Item 33 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33},
    {"numero": 34, "texto": "Item 34 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 34},
    {"numero": 35, "texto": "Item 35 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35},
    {"numero": 36, "texto": "Item 36 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 36},
    {"numero": 37, "texto": "Item 37 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 37},
    {"numero": 38, "texto": "Item 38 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 38},
    {"numero": 39, "texto": "Item 39 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39},
    {"numero": 40, "texto": "Item 40 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 40},
    {"numero": 41, "texto": "Item 41 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41},
    {"numero": 42, "texto": "Item 42 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42},
    {"numero": 43, "texto": "Item 43 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43},
    {"numero": 44, "texto": "Item 44 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 44},
    {"numero": 45, "texto": "Item 45 - [Aguardando texto oficial]", "secao": "geral", "tipo_resposta": "likert_ebadep", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45}
  ]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
    "likert_ebadep": [
      {"valor": 0, "texto": "Nenhum pouco"},
      {"valor": 1, "texto": "Pouco"},
      {"valor": 2, "texto": "Moderadamente"},
      {"valor": 3, "texto": "Muito"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO
  $${
    "tipo": "soma_simples",
    "pontuacao": {
      "min": 0,
      "max": 135,
      "formula": "soma_total"
    },
    "conversao": {
      "tipo": "tabela_normativa",
      "saidas": ["percentil", "escore_t", "estanino"]
    }
  }$$::jsonb,

  -- INTERPRETACAO
  $${
    "notas": "A EBADEP-A é uma escala de rastreio de sintomas depressivos para adultos. Fornece informações sobre a intensidade de sintomas, não diagnóstico.",
    "faixas": [
      {"estanino_min": 1, "estanino_max": 2, "nivel": "Muito Baixo", "descricao": "Sintomas depressivos muito baixos ou ausentes"},
      {"estanino_min": 3, "estanino_max": 3, "nivel": "Baixo", "descricao": "Poucos sintomas depressivos"},
      {"estanino_min": 4, "estanino_max": 6, "nivel": "Médio", "descricao": "Nível médio de sintomas depressivos"},
      {"estanino_min": 7, "estanino_max": 7, "nivel": "Alto", "descricao": "Sintomas depressivos elevados - recomenda-se avaliação"},
      {"estanino_min": 8, "estanino_max": 9, "nivel": "Muito Alto", "descricao": "Sintomas depressivos muito elevados - avaliação clínica necessária"}
    ],
    "referencia": "Baptista, M. N. (2012). EBADEP-A: Escala Baptista de Depressão - Adulto. Vetor Editora."
  }$$::jsonb,

  true, true
);

-- =====================================================
-- BFP - Bateria Fatorial de Personalidade
-- 126 itens, 5 fatores, 17 subfatores
-- =====================================================

INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'Bateria Fatorial de Personalidade',
  'BFP',
  'escala_likert',
  18, 99, 30,

  -- QUESTOES (126 itens distribuídos em 5 fatores)
  -- Os itens reais precisam ser preenchidos com o texto oficial do manual
  $$[{"numero": 1, "texto": "Item 1 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1}, {"numero": 2, "texto": "Item 2 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2}, {"numero": 3, "texto": "Item 3 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3}, {"numero": 4, "texto": "Item 4 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4}, {"numero": 5, "texto": "Item 5 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5}, {"numero": 6, "texto": "Item 6 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6}, {"numero": 7, "texto": "Item 7 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7}, {"numero": 8, "texto": "Item 8 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8}, {"numero": 9, "texto": "Item 9 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9}, {"numero": 10, "texto": "Item 10 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10}, {"numero": 11, "texto": "Item 11 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11}, {"numero": 12, "texto": "Item 12 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12}, {"numero": 13, "texto": "Item 13 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13}, {"numero": 14, "texto": "Item 14 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14}, {"numero": 15, "texto": "Item 15 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15}, {"numero": 16, "texto": "Item 16 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16}, {"numero": 17, "texto": "Item 17 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17}, {"numero": 18, "texto": "Item 18 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18}, {"numero": 19, "texto": "Item 19 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19}, {"numero": 20, "texto": "Item 20 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20}, {"numero": 21, "texto": "Item 21 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21}, {"numero": 22, "texto": "Item 22 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22}, {"numero": 23, "texto": "Item 23 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23}, {"numero": 24, "texto": "Item 24 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24}, {"numero": 25, "texto": "Item 25 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25}, {"numero": 26, "texto": "Item 26 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26}, {"numero": 27, "texto": "Item 27 - [Aguardando texto oficial]", "secao": "neuroticismo", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 27}, {"numero": 28, "texto": "Item 28 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 28}, {"numero": 29, "texto": "Item 29 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29}, {"numero": 30, "texto": "Item 30 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30}, {"numero": 31, "texto": "Item 31 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31}, {"numero": 32, "texto": "Item 32 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32}, {"numero": 33, "texto": "Item 33 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33}, {"numero": 34, "texto": "Item 34 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 34}, {"numero": 35, "texto": "Item 35 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35}, {"numero": 36, "texto": "Item 36 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 36}, {"numero": 37, "texto": "Item 37 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 37}, {"numero": 38, "texto": "Item 38 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 38}, {"numero": 39, "texto": "Item 39 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39}, {"numero": 40, "texto": "Item 40 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 40}, {"numero": 41, "texto": "Item 41 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41}, {"numero": 42, "texto": "Item 42 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42}, {"numero": 43, "texto": "Item 43 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43}, {"numero": 44, "texto": "Item 44 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 44}, {"numero": 45, "texto": "Item 45 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45}, {"numero": 46, "texto": "Item 46 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 46}, {"numero": 47, "texto": "Item 47 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 47}, {"numero": 48, "texto": "Item 48 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 48}, {"numero": 49, "texto": "Item 49 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 49}, {"numero": 50, "texto": "Item 50 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 50}, {"numero": 51, "texto": "Item 51 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 51}, {"numero": 52, "texto": "Item 52 - [Aguardando texto oficial]", "secao": "extroversao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 52}, {"numero": 53, "texto": "Item 53 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 53}, {"numero": 54, "texto": "Item 54 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 54}, {"numero": 55, "texto": "Item 55 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 55}, {"numero": 56, "texto": "Item 56 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 56}, {"numero": 57, "texto": "Item 57 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 57}, {"numero": 58, "texto": "Item 58 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 58}, {"numero": 59, "texto": "Item 59 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 59}, {"numero": 60, "texto": "Item 60 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 60}, {"numero": 61, "texto": "Item 61 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 61}, {"numero": 62, "texto": "Item 62 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 62}, {"numero": 63, "texto": "Item 63 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 63}, {"numero": 64, "texto": "Item 64 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 64}, {"numero": 65, "texto": "Item 65 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 65}, {"numero": 66, "texto": "Item 66 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 66}, {"numero": 67, "texto": "Item 67 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 67}, {"numero": 68, "texto": "Item 68 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 68}, {"numero": 69, "texto": "Item 69 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 69}, {"numero": 70, "texto": "Item 70 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 70}, {"numero": 71, "texto": "Item 71 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 71}, {"numero": 72, "texto": "Item 72 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 72}, {"numero": 73, "texto": "Item 73 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 73}, {"numero": 74, "texto": "Item 74 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 74}, {"numero": 75, "texto": "Item 75 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 75}, {"numero": 76, "texto": "Item 76 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 76}, {"numero": 77, "texto": "Item 77 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 77}, {"numero": 78, "texto": "Item 78 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 78}, {"numero": 79, "texto": "Item 79 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 79}, {"numero": 80, "texto": "Item 80 - [Aguardando texto oficial]", "secao": "socializacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 80}, {"numero": 81, "texto": "Item 81 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 81}, {"numero": 82, "texto": "Item 82 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 82}, {"numero": 83, "texto": "Item 83 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 83}, {"numero": 84, "texto": "Item 84 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 84}, {"numero": 85, "texto": "Item 85 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 85}, {"numero": 86, "texto": "Item 86 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 86}, {"numero": 87, "texto": "Item 87 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 87}, {"numero": 88, "texto": "Item 88 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 88}, {"numero": 89, "texto": "Item 89 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 89}, {"numero": 90, "texto": "Item 90 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 90}, {"numero": 91, "texto": "Item 91 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 91}, {"numero": 92, "texto": "Item 92 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 92}, {"numero": 93, "texto": "Item 93 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 93}, {"numero": 94, "texto": "Item 94 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 94}, {"numero": 95, "texto": "Item 95 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 95}, {"numero": 96, "texto": "Item 96 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 96}, {"numero": 97, "texto": "Item 97 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 97}, {"numero": 98, "texto": "Item 98 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 98}, {"numero": 99, "texto": "Item 99 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 99}, {"numero": 100, "texto": "Item 100 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 100}, {"numero": 101, "texto": "Item 101 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 101}, {"numero": 102, "texto": "Item 102 - [Aguardando texto oficial]", "secao": "realizacao", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 102}, {"numero": 103, "texto": "Item 103 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 103}, {"numero": 104, "texto": "Item 104 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 104}, {"numero": 105, "texto": "Item 105 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 105}, {"numero": 106, "texto": "Item 106 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 106}, {"numero": 107, "texto": "Item 107 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 107}, {"numero": 108, "texto": "Item 108 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 108}, {"numero": 109, "texto": "Item 109 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 109}, {"numero": 110, "texto": "Item 110 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 110}, {"numero": 111, "texto": "Item 111 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 111}, {"numero": 112, "texto": "Item 112 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 112}, {"numero": 113, "texto": "Item 113 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 113}, {"numero": 114, "texto": "Item 114 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 114}, {"numero": 115, "texto": "Item 115 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 115}, {"numero": 116, "texto": "Item 116 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 116}, {"numero": 117, "texto": "Item 117 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 117}, {"numero": 118, "texto": "Item 118 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 118}, {"numero": 119, "texto": "Item 119 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 119}, {"numero": 120, "texto": "Item 120 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 120}, {"numero": 121, "texto": "Item 121 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 121}, {"numero": 122, "texto": "Item 122 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 122}, {"numero": 123, "texto": "Item 123 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 123}, {"numero": 124, "texto": "Item 124 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 124}, {"numero": 125, "texto": "Item 125 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 125}, {"numero": 126, "texto": "Item 126 - [Aguardando texto oficial]", "secao": "abertura", "tipo_resposta": "likert_bfp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 126}]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
    "likert_bfp": [
      {"valor": 1, "texto": "Absolutamente não me identifico com a frase"},
      {"valor": 2, "texto": "Não me identifico com a frase"},
      {"valor": 3, "texto": "Não sei se me identifico ou não com a frase"},
      {"valor": 4, "texto": "Identifico-me um pouco com a frase"},
      {"valor": 5, "texto": "Identifico-me com a frase"},
      {"valor": 6, "texto": "Identifico-me muito com a frase"},
      {"valor": 7, "texto": "Identifico-me totalmente com a frase"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO
  $${
    "tipo": "secoes",
    "secoes": {
      "neuroticismo": {
        "nome": "Neuroticismo (N)",
        "descricao": "Avalia instabilidade emocional e vulnerabilidade",
        "subfatores": {
          "N1": {"nome": "Vulnerabilidade", "questoes": [1, 2, 3, 4, 5, 6, 7, 8, 9]},
          "N2": {"nome": "Instabilidade Emocional", "questoes": [10, 11, 12, 13, 14, 15]},
          "N3": {"nome": "Passividade / Falta de Energia", "questoes": [16, 17, 18, 19, 20, 21]},
          "N4": {"nome": "Depressão", "questoes": [22, 23, 24, 25, 26, 27]}
        }
      },
      "extroversao": {
        "nome": "Extroversão (E)",
        "descricao": "Avalia nível de comunicação e interação social",
        "subfatores": {
          "E1": {"nome": "Comunicação", "questoes": [28, 29, 30, 31, 32, 33]},
          "E2": {"nome": "Altivez", "questoes": [34, 35, 36, 37, 38]},
          "E3": {"nome": "Dinamismo", "questoes": [39, 40, 41, 42, 43, 44]},
          "E4": {"nome": "Interações Sociais", "questoes": [45, 46, 47, 48, 49, 50, 51, 52]}
        }
      },
      "socializacao": {
        "nome": "Socialização (S)",
        "descricao": "Avalia qualidade das relações interpessoais",
        "subfatores": {
          "S1": {"nome": "Amabilidade", "questoes": [53, 54, 55, 56, 57, 58, 59]},
          "S2": {"nome": "Pró-Sociabilidade", "questoes": [60, 61, 62, 63, 64, 65, 66]},
          "S3": {"nome": "Confiança nas Pessoas", "questoes": [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80]}
        }
      },
      "realizacao": {
        "nome": "Realização (R)",
        "descricao": "Avalia organização, persistência e motivação",
        "subfatores": {
          "R1": {"nome": "Competência", "questoes": [81, 82, 83, 84, 85, 86]},
          "R2": {"nome": "Ponderação / Prudência", "questoes": [87, 88, 89, 90, 91, 92]},
          "R3": {"nome": "Empenho / Comprometimento", "questoes": [93, 94, 95, 96, 97, 98, 99, 100, 101, 102]}
        }
      },
      "abertura": {
        "nome": "Abertura (A)",
        "descricao": "Avalia abertura a novas experiências e ideias",
        "subfatores": {
          "A1": {"nome": "Abertura a Ideias", "questoes": [103, 104, 105, 106, 107, 108, 109]},
          "A2": {"nome": "Liberalismo", "questoes": [110, 111, 112, 113, 114, 115]},
          "A3": {"nome": "Busca por Novidades", "questoes": [116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126]}
        }
      }
    },
    "conversao": {
      "tipo": "escore_bruto_percentil",
      "saidas": ["percentil", "classificacao"]
    }
  }$$::jsonb,

  -- INTERPRETACAO
  $${
    "notas": "O BFP avalia personalidade segundo o modelo dos Cinco Grandes Fatores. Cada fator e subfator deve ser interpretado em conjunto para uma compreensão global da personalidade.",
    "classificacoes": {
      "muito_baixo": {"min": 1, "max": 15, "descricao": "Muito Baixo"},
      "baixo": {"min": 16, "max": 30, "descricao": "Baixo"},
      "medio_baixo": {"min": 31, "max": 40, "descricao": "Médio Baixo"},
      "medio": {"min": 41, "max": 60, "descricao": "Médio"},
      "medio_alto": {"min": 61, "max": 70, "descricao": "Médio Alto"},
      "alto": {"min": 71, "max": 85, "descricao": "Alto"},
      "muito_alto": {"min": 86, "max": 100, "descricao": "Muito Alto"}
    },
    "fatores": {
      "neuroticismo": "Níveis elevados indicam maior vulnerabilidade emocional e instabilidade. Níveis baixos indicam estabilidade emocional.",
      "extroversao": "Níveis elevados indicam pessoa comunicativa, sociável e assertiva. Níveis baixos indicam pessoa mais reservada.",
      "socializacao": "Níveis elevados indicam pessoa amável, confiante e cooperativa. Níveis baixos indicam pessoa mais competitiva ou cética.",
      "realizacao": "Níveis elevados indicam pessoa organizada, persistente e responsável. Níveis baixos indicam pessoa mais flexível ou menos metódica.",
      "abertura": "Níveis elevados indicam pessoa criativa, curiosa e aberta a experiências. Níveis baixos indicam pessoa mais conservadora."
    },
    "referencia": "Nunes, C. H. S. S., Hutz, C. S., & Nunes, M. F. O. (2010). BFP: Bateria Fatorial de Personalidade. Casa do Psicólogo."
  }$$::jsonb,

  true, true
);

-- =====================================================
-- BDEFS - Barkley Deficits in Executive Functioning Scale
-- Versão Longa - 89 itens, 5 seções
-- =====================================================

INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'BDEFS - Escala de Déficits em Funções Executivas (Versão Longa)',
  'BDEFS-L',
  'escala_likert',
  18, 70, 20,

  -- QUESTOES (89 itens em 5 seções)
  $$[{"numero": 1, "texto": "Com que frequência você passa por cada um destes problemas? Item 1", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1}, {"numero": 2, "texto": "Com que frequência você passa por cada um destes problemas? Item 2", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2}, {"numero": 3, "texto": "Com que frequência você passa por cada um destes problemas? Item 3", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3}, {"numero": 4, "texto": "Com que frequência você passa por cada um destes problemas? Item 4", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4}, {"numero": 5, "texto": "Com que frequência você passa por cada um destes problemas? Item 5", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5}, {"numero": 6, "texto": "Com que frequência você passa por cada um destes problemas? Item 6", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6}, {"numero": 7, "texto": "Com que frequência você passa por cada um destes problemas? Item 7", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7}, {"numero": 8, "texto": "Com que frequência você passa por cada um destes problemas? Item 8", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8}, {"numero": 9, "texto": "Com que frequência você passa por cada um destes problemas? Item 9", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9}, {"numero": 10, "texto": "Com que frequência você passa por cada um destes problemas? Item 10", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10}, {"numero": 11, "texto": "Com que frequência você passa por cada um destes problemas? Item 11", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11}, {"numero": 12, "texto": "Com que frequência você passa por cada um destes problemas? Item 12", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12}, {"numero": 13, "texto": "Com que frequência você passa por cada um destes problemas? Item 13", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13}, {"numero": 14, "texto": "Com que frequência você passa por cada um destes problemas? Item 14", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14}, {"numero": 15, "texto": "Com que frequência você passa por cada um destes problemas? Item 15", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15}, {"numero": 16, "texto": "Com que frequência você passa por cada um destes problemas? Item 16", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16}, {"numero": 17, "texto": "Com que frequência você passa por cada um destes problemas? Item 17", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17}, {"numero": 18, "texto": "Com que frequência você passa por cada um destes problemas? Item 18", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18}, {"numero": 19, "texto": "Com que frequência você passa por cada um destes problemas? Item 19", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19}, {"numero": 20, "texto": "Com que frequência você passa por cada um destes problemas? Item 20", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20}, {"numero": 21, "texto": "Com que frequência você passa por cada um destes problemas? Item 21", "secao": "gerenciamento_tempo", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21}, {"numero": 22, "texto": "Com que frequência você passa por cada um destes problemas? Item 22", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22}, {"numero": 23, "texto": "Com que frequência você passa por cada um destes problemas? Item 23", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23}, {"numero": 24, "texto": "Com que frequência você passa por cada um destes problemas? Item 24", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24}, {"numero": 25, "texto": "Com que frequência você passa por cada um destes problemas? Item 25", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25}, {"numero": 26, "texto": "Com que frequência você passa por cada um destes problemas? Item 26", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26}, {"numero": 27, "texto": "Com que frequência você passa por cada um destes problemas? Item 27", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 27}, {"numero": 28, "texto": "Com que frequência você passa por cada um destes problemas? Item 28", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 28}, {"numero": 29, "texto": "Com que frequência você passa por cada um destes problemas? Item 29", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29}, {"numero": 30, "texto": "Com que frequência você passa por cada um destes problemas? Item 30", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30}, {"numero": 31, "texto": "Com que frequência você passa por cada um destes problemas? Item 31", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31}, {"numero": 32, "texto": "Com que frequência você passa por cada um destes problemas? Item 32", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32}, {"numero": 33, "texto": "Com que frequência você passa por cada um destes problemas? Item 33", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33}, {"numero": 34, "texto": "Com que frequência você passa por cada um destes problemas? Item 34", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 34}, {"numero": 35, "texto": "Com que frequência você passa por cada um destes problemas? Item 35", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35}, {"numero": 36, "texto": "Com que frequência você passa por cada um destes problemas? Item 36", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 36}, {"numero": 37, "texto": "Com que frequência você passa por cada um destes problemas? Item 37", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 37}, {"numero": 38, "texto": "Com que frequência você passa por cada um destes problemas? Item 38", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 38}, {"numero": 39, "texto": "Com que frequência você passa por cada um destes problemas? Item 39", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39}, {"numero": 40, "texto": "Com que frequência você passa por cada um destes problemas? Item 40", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 40}, {"numero": 41, "texto": "Com que frequência você passa por cada um destes problemas? Item 41", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41}, {"numero": 42, "texto": "Com que frequência você passa por cada um destes problemas? Item 42", "secao": "organizacao_resolucao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42}, {"numero": 43, "texto": "Com que frequência você passa por cada um destes problemas? Item 43", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43}, {"numero": 44, "texto": "Com que frequência você passa por cada um destes problemas? Item 44", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 44}, {"numero": 45, "texto": "Com que frequência você passa por cada um destes problemas? Item 45", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45}, {"numero": 46, "texto": "Com que frequência você passa por cada um destes problemas? Item 46", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 46}, {"numero": 47, "texto": "Com que frequência você passa por cada um destes problemas? Item 47", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 47}, {"numero": 48, "texto": "Com que frequência você passa por cada um destes problemas? Item 48", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 48}, {"numero": 49, "texto": "Com que frequência você passa por cada um destes problemas? Item 49", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 49}, {"numero": 50, "texto": "Com que frequência você passa por cada um destes problemas? Item 50", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 50}, {"numero": 51, "texto": "Com que frequência você passa por cada um destes problemas? Item 51", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 51}, {"numero": 52, "texto": "Com que frequência você passa por cada um destes problemas? Item 52", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 52}, {"numero": 53, "texto": "Com que frequência você passa por cada um destes problemas? Item 53", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 53}, {"numero": 54, "texto": "Com que frequência você passa por cada um destes problemas? Item 54", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 54}, {"numero": 55, "texto": "Com que frequência você passa por cada um destes problemas? Item 55", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 55}, {"numero": 56, "texto": "Com que frequência você passa por cada um destes problemas? Item 56", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 56}, {"numero": 57, "texto": "Com que frequência você passa por cada um destes problemas? Item 57", "secao": "autocontrole", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 57}, {"numero": 58, "texto": "Com que frequência você passa por cada um destes problemas? Item 58", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 58}, {"numero": 59, "texto": "Com que frequência você passa por cada um destes problemas? Item 59", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 59}, {"numero": 60, "texto": "Com que frequência você passa por cada um destes problemas? Item 60", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 60}, {"numero": 61, "texto": "Com que frequência você passa por cada um destes problemas? Item 61", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 61}, {"numero": 62, "texto": "Com que frequência você passa por cada um destes problemas? Item 62", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 62}, {"numero": 63, "texto": "Com que frequência você passa por cada um destes problemas? Item 63", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 63}, {"numero": 64, "texto": "Com que frequência você passa por cada um destes problemas? Item 64", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 64}, {"numero": 65, "texto": "Com que frequência você passa por cada um destes problemas? Item 65", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 65}, {"numero": 66, "texto": "Com que frequência você passa por cada um destes problemas? Item 66", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 66}, {"numero": 67, "texto": "Com que frequência você passa por cada um destes problemas? Item 67", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 67}, {"numero": 68, "texto": "Com que frequência você passa por cada um destes problemas? Item 68", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 68}, {"numero": 69, "texto": "Com que frequência você passa por cada um destes problemas? Item 69", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 69}, {"numero": 70, "texto": "Com que frequência você passa por cada um destes problemas? Item 70", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 70}, {"numero": 71, "texto": "Com que frequência você passa por cada um destes problemas? Item 71", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 71}, {"numero": 72, "texto": "Com que frequência você passa por cada um destes problemas? Item 72", "secao": "motivacao", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 72}, {"numero": 73, "texto": "Com que frequência você passa por cada um destes problemas? Item 73", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 73}, {"numero": 74, "texto": "Com que frequência você passa por cada um destes problemas? Item 74", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 74}, {"numero": 75, "texto": "Com que frequência você passa por cada um destes problemas? Item 75", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 75}, {"numero": 76, "texto": "Com que frequência você passa por cada um destes problemas? Item 76", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 76}, {"numero": 77, "texto": "Com que frequência você passa por cada um destes problemas? Item 77", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 77}, {"numero": 78, "texto": "Com que frequência você passa por cada um destes problemas? Item 78", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 78}, {"numero": 79, "texto": "Com que frequência você passa por cada um destes problemas? Item 79", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 79}, {"numero": 80, "texto": "Com que frequência você passa por cada um destes problemas? Item 80", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 80}, {"numero": 81, "texto": "Com que frequência você passa por cada um destes problemas? Item 81", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 81}, {"numero": 82, "texto": "Com que frequência você passa por cada um destes problemas? Item 82", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 82}, {"numero": 83, "texto": "Com que frequência você passa por cada um destes problemas? Item 83", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 83}, {"numero": 84, "texto": "Com que frequência você passa por cada um destes problemas? Item 84", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 84}, {"numero": 85, "texto": "Com que frequência você passa por cada um destes problemas? Item 85", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 85}, {"numero": 86, "texto": "Com que frequência você passa por cada um destes problemas? Item 86", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 86}, {"numero": 87, "texto": "Com que frequência você passa por cada um destes problemas? Item 87", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 87}, {"numero": 88, "texto": "Com que frequência você passa por cada um destes problemas? Item 88", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 88}, {"numero": 89, "texto": "Com que frequência você passa por cada um destes problemas? Item 89", "secao": "regulacao_emocional", "tipo_resposta": "likert_bdefs", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 89}]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
    "likert_bdefs": [
      {"valor": 1, "texto": "Nunca ou raramente"},
      {"valor": 2, "texto": "Às vezes"},
      {"valor": 3, "texto": "Frequentemente"},
      {"valor": 4, "texto": "Muito frequentemente"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO
  $${
    "tipo": "secoes",
    "secoes": {
      "gerenciamento_tempo": {
        "nome": "Seção 1 - Gerenciamento de Tempo",
        "descricao": "Avalia a capacidade de gerenciar o tempo e cumprir prazos",
        "questoes_range": [1, 21],
        "peso": 1
      },
      "organizacao_resolucao": {
        "nome": "Seção 2 - Organização/Resolução de Problemas",
        "descricao": "Avalia habilidades de organização e solução de problemas",
        "questoes_range": [22, 42],
        "peso": 1
      },
      "autocontrole": {
        "nome": "Seção 3 - Autocontrole",
        "descricao": "Avalia a capacidade de inibir impulsos e comportamentos",
        "questoes_range": [43, 57],
        "peso": 1
      },
      "motivacao": {
        "nome": "Seção 4 - Motivação",
        "descricao": "Avalia a motivação e persistência em tarefas",
        "questoes_range": [58, 72],
        "peso": 1
      },
      "regulacao_emocional": {
        "nome": "Seção 5 - Regulação Emocional",
        "descricao": "Avalia a capacidade de regular emoções",
        "questoes_range": [73, 89],
        "peso": 1
      }
    },
    "indices": {
      "indice_fe_tdah": {
        "nome": "Índice FE-TDAH",
        "descricao": "Índice específico para sintomas de TDAH relacionados às funções executivas"
      },
      "total": {
        "nome": "Escore Total",
        "descricao": "Soma de todas as seções"
      }
    },
    "conversao": {
      "tipo": "percentil_por_faixa",
      "estratificacao": ["idade", "escolaridade"]
    }
  }$$::jsonb,

  -- INTERPRETACAO
  $${
    "notas": "O BDEFS avalia déficits em funções executivas. Escores mais altos indicam maior dificuldade. A interpretação considera idade e escolaridade.",
    "classificacoes": {
      "sem_significancia": {"percentil_max": 75, "descricao": "Sem Significância Clínica"},
      "significancia_minima": {"percentil_min": 76, "percentil_max": 84, "descricao": "Significância Clínica Mínima"},
      "limitrofe": {"percentil_min": 85, "percentil_max": 92, "descricao": "Limítrofe"},
      "deficiencia_leve": {"percentil_min": 93, "percentil_max": 95, "descricao": "Deficiência Leve"},
      "deficiencia_moderada": {"percentil_min": 96, "percentil_max": 98, "descricao": "Deficiência Moderada"},
      "deficiencia_severa": {"percentil_min": 99, "percentil_max": 100, "descricao": "Deficiência Severa"}
    },
    "referencia": "Barkley, R. A. (2011). Barkley Deficits in Executive Functioning Scale. Guilford Press. Adaptação brasileira."
  }$$::jsonb,

  true, true
);

-- =====================================================
-- IFP-II - Inventário Fatorial de Personalidade
-- 100 itens, 14 escalas de necessidades psicológicas
-- =====================================================

INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'Inventário Fatorial de Personalidade - II',
  'IFP-II',
  'escala_likert',
  18, 99, 25,

  -- QUESTOES (100 itens em 14 escalas)
  $$[{"numero": 1, "texto": "Gosto de fazer coisas que outras pessoas consideram fora do comum", "secao": "autonomia", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1}, {"numero": 2, "texto": "Gostaria de realizar um grande feito ou grande obra na minha vida", "secao": "desempenho", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2}, {"numero": 3, "texto": "Gostaria de experimentar novidades e mudanças em meu dia a dia", "secao": "mudança", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3}, {"numero": 4, "texto": "Não gosto de situações em que se exige que eu me comporte de determinada maneira", "secao": "autonomia", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4}, {"numero": 5, "texto": "Gosto de dizer o que eu penso a respeito das coisas", "secao": "autonomia", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5}, {"numero": 6, "texto": "Gosto de saber o que grandes personalidades disseram sobre os problemas pelos quais eu me interesso", "secao": "deferência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6}, {"numero": 7, "texto": "Gosto de ser capaz de fazer as coisas melhor do que as outras pessoas", "secao": "desempenho", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7}, {"numero": 8, "texto": "Gosto de concluir qualquer trabalho ou tarefa que tenha começado", "secao": "desempenho", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8}, {"numero": 9, "texto": "Gosto de ajudar meus amigos quando eles estão com problemas", "secao": "assistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9}, {"numero": 10, "texto": "Não costumo abandonar um quebra-cabeça ou problema antes que consiga resolvê-lo", "secao": "persistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10}, {"numero": 11, "texto": "Gosto de dizer aos outros como fazer seus trabalhos", "secao": "dominância", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11}, {"numero": 12, "texto": "Gostaria de ser considerado uma autoridade em algum trabalho, profissão ou campo de especialização", "secao": "desempenho", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12}, {"numero": 13, "texto": "Gostaria de experimentar e provar coisas novas", "secao": "mudança", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13}, {"numero": 14, "texto": "Quando tenho alguma tarefa para fazer, gosto de começar logo e permanecer trabalhando até completá-la", "secao": "persistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14}, {"numero": 15, "texto": "Aceito com prazer a liderança das pessoas que admiro", "secao": "deferência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15}, {"numero": 16, "texto": "Gosto de trabalhar horas a fio sem ser interrompido", "secao": "persistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16}, {"numero": 17, "texto": "Gosto que meus amigos me dêem muita atenção quando estou sofrendo ou doente", "secao": "afago", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17}, {"numero": 18, "texto": "Costumo analisar minhas intenções e sentimentos", "secao": "intracepção", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18}, {"numero": 19, "texto": "Gosto de fazer com carinho pequenos favores a meus amigos", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19}, {"numero": 20, "texto": "Gosto de ficar acordado até tarde para terminar um trabalho", "secao": "persistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20}, {"numero": 21, "texto": "Gosto de andar pelo pais  e viver em lugares diferentes", "secao": "mudança", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21}, {"numero": 22, "texto": "Gosto de analisar os sentimentos e intenções dos outros", "secao": "intracepção", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22}, {"numero": 23, "texto": "Gosto de fazer gozação com pessoas que fazem coisas que eu considero estúpidas", "secao": "agressividade", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23}, {"numero": 24, "texto": "Tenho vontade de me vingar quando alguém me insulta", "secao": "agressividade", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24}, {"numero": 25, "texto": "Gosto de pensar sobre o caráter dos meus amigos e tentar descobrir o que os faz serem como são", "secao": "intracepção", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25}, {"numero": 26, "texto": "Sou leal aos meus amigos", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26}, {"numero": 27, "texto": "Gosto de levar trabalho ou tarefa até o fim antes de começar outro", "secao": "persistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 27}, {"numero": 28, "texto": "Gosto de dizer aos meus superiores que eles fizeram um bom trabalho, quando acredito nisso", "secao": "deferência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 28}, {"numero": 29, "texto": "Gosto que meus amigos sejam solidários comigo e me animem quando estou deprimido", "secao": "afago", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29}, {"numero": 30, "texto": "Antes de começa um trabalho, gosto de organizá-lo e planejá-lo", "secao": "ordem", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30}, {"numero": 31, "texto": "Gosto que meus amigos demonstrem muito afeto por mim", "secao": "afago", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31}, {"numero": 32, "texto": "Gosto de realizar tarefas que, na opinião dos outros, exigem habilidade e esforço", "secao": "desempenho", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32}, {"numero": 33, "texto": "Gosto de ser bem sucedido nas coisas que faço", "secao": "desempenho", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33}, {"numero": 34, "texto": "Gosto de fazer amizades", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 34}, {"numero": 35, "texto": "Gosto de ser considerado um líder pelos outros", "secao": "dominância", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35}, {"numero": 36, "texto": "Gosto de realizar com afinco (sem descanso) qualquer trabalho que faço", "secao": "persistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 36}, {"numero": 37, "texto": "Gosto de participar de grupos cujos membros se tratem com afeto e amizade", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 37}, {"numero": 38, "texto": "Sinto-me satisfeito quando realizo bem um trabalho difícil", "secao": "desempenho", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 38}, {"numero": 39, "texto": "Tenho vontade de mandar os outros calarem a boca quando discordo deles", "secao": "agressividade", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39}, {"numero": 40, "texto": "Gosto de fazer coisas do meu jeito sem me importar com o que os outros possam pensar", "secao": "autonomia", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 40}, {"numero": 41, "texto": "Gosto de viajar e conhecer o país", "secao": "mudança", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41}, {"numero": 42, "texto": "Gosto de me fixar em um trabalho ou problema mesmo quando a solução pareça extremamente difícil", "secao": "persistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42}, {"numero": 43, "texto": "Gosto de conhecer pessoas novas", "secao": "mudança", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43}, {"numero": 44, "texto": "Gosto de dividir coisas com os outros", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 44}, {"numero": 45, "texto": "Sinto-me satisfeito quando consigo convencer e influenciar os outros", "secao": "dominância", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45}, {"numero": 46, "texto": "Gosto de demonstrar muita afeição por meus amigos", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 46}, {"numero": 47, "texto": "Gosto de prestar favores aos outros", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 47}, {"numero": 48, "texto": "Gosto de seguir instruções e fazer o que é esperado de mim", "secao": "deferência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 48}, {"numero": 49, "texto": "Gosto de elogiar alguém que admiro", "secao": "deferência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 49}, {"numero": 50, "texto": "Quando planejo alguma coisa, procuro sugestões de pessoas que respeito", "secao": "deferência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 50}, {"numero": 51, "texto": "Gosto de manter minhas coisas limpas e ordenadas em minha escrivaninha ou em meu local de trabalho", "secao": "ordem", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 51}, {"numero": 52, "texto": "Gosto de manter fortes laços de amizade", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 52}, {"numero": 53, "texto": "Gosto que meus amigos me ajudem quando estou com problema", "secao": "afago", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 53}, {"numero": 54, "texto": "Gosto que meus amigos mostrem boa vontade em me prestar pequenos favores", "secao": "afago", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 54}, {"numero": 55, "texto": "Gosto de manter minhas cartas, contas e outros papéis bem arrumados e arquivados de acordo com algum sistema", "secao": "ordem", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 55}, {"numero": 56, "texto": "Gosto que meus amigos sejam solidários e compreensivos quando tenho problemas", "secao": "afago", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 56}, {"numero": 57, "texto": "Prefiro fazer coisas com meus amigos a fazer sozinho", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 57}, {"numero": 58, "texto": "Gosto de tratar outras pessoas com bondade e compaixão", "secao": "assistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 58}, {"numero": 59, "texto": "Gosto de comer em restaurantes novo e exóticos (diferentes)", "secao": "mudança", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 59}, {"numero": 60, "texto": "Procuro entender como meus amigos se sentem a respeito de problemas que eles enfrentam", "secao": "intracepção", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 60}, {"numero": 61, "texto": "Gosto de ser o centro das atenções em um grupo", "secao": "exibição", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 61}, {"numero": 62, "texto": "Gosto de ser um dos líderes nas organizações e grupos aos quais pertenço", "secao": "exibição", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 62}, {"numero": 63, "texto": "Gosto de ser independente dos outros para decidir o que quero fazer", "secao": "autonomia", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 63}, {"numero": 64, "texto": "Gosto de me manter em contato com meus amigos", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 64}, {"numero": 65, "texto": "Quando participo de uma comissão (reunião), gosto de ser indicado ou eleito presidente", "secao": "dominância", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 65}, {"numero": 66, "texto": "Gosto de fazer tantos amigos quanto possível", "secao": "afiliação", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 66}, {"numero": 67, "texto": "Gosto de observar como uma pessoa se sente numa determinada situação", "secao": "intracepção", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 67}, {"numero": 68, "texto": "Quando estou em um grupo, aceito com prazer a liderança de outra pessoa para decidir o que o grupo fará", "secao": "deferência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 68}, {"numero": 69, "texto": "Não gosto de me sentir pressionado por responsabilidades e deveres", "secao": "autonomia", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 69}, {"numero": 70, "texto": "Às vezes, fico tão irritado que sinto vontade de jogar e quebrar coisas", "secao": "agressividade", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 70}, {"numero": 71, "texto": "Gosto de fazer perguntas que ninguém será capaz de responder", "secao": "exibição", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 71}, {"numero": 72, "texto": "Às vezes, gosto de fazer coisas simplesmente para ver o efeito que terão sobre os outros", "secao": "exibição", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 72}, {"numero": 73, "texto": "Sou solidário com meus amigos quando machucados ou doentes", "secao": "assistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 73}, {"numero": 74, "texto": "Não tenho medo de criticar pessoas que ocupam posições de autoridade", "secao": "autonomia", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 74}, {"numero": 75, "texto": "Gosto de fiscalizar e dirigir os atos dos outros sempre que posso", "secao": "dominância", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 75}, {"numero": 76, "texto": "Culpo os outros quando as coisas dão errado comigo", "secao": "agressividade", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 76}, {"numero": 77, "texto": "Gosto de ajudar pessoas que têm menos sorte do que eu", "secao": "assistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 77}, {"numero": 78, "texto": "Gosto de planejar e organizar, em todos os detalhes, qualquer trabalho que eu faço", "secao": "ordem", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 78}, {"numero": 79, "texto": "Gosto de fazer coisas novas e diferentes", "secao": "mudança", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 79}, {"numero": 80, "texto": "Gostaria de realizar com sucesso alguma coisa de grande importância", "secao": "desempenho", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 80}, {"numero": 81, "texto": "Quando estou com um grupo de pessoas, gosto de decidir sobre o que vamos fazer", "secao": "dominância", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 81}, {"numero": 82, "texto": "Interesso-me em conhecer a vida de grandes personalidades", "secao": "deferência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 82}, {"numero": 83, "texto": "Procuro me adaptar ao modo de ser das pessoas que admiro", "secao": "deferência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 83}, {"numero": 84, "texto": "Gosto de resolver quebra-cabeças e problemas com os quais outras pessoas têm dificuldades", "secao": "desempenho", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 84}, {"numero": 85, "texto": "Gosto de falar sobre os meus sucessos", "secao": "exibição", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 85}, {"numero": 86, "texto": "Gosto de dar o melhor de mim em tudo que faço", "secao": "desempenho", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 86}, {"numero": 87, "texto": "Gosto de estudar e analisar o comportamento dos outros", "secao": "intracepção", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 87}, {"numero": 88, "texto": "Gosto de contar aos outros aventuras e coisas estranhas que acontecem comigo", "secao": "exibição", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 88}, {"numero": 89, "texto": "Perdôo as pessoas que às vezes possam me magoar", "secao": "assistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 89}, {"numero": 90, "texto": "Gosto de prever (entender) como meus amigos irão agir em diferentes situações", "secao": "intracepção", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 90}, {"numero": 91, "texto": "Gosto de me sentir livre para fazer o que quero", "secao": "autonomia", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 91}, {"numero": 92, "texto": "Gosto de me sentir livre para ir e vir quando quiser", "secao": "autonomia", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 92}, {"numero": 93, "texto": "Gosto de usar palavras cujo significado as outras pessoas desconhecem", "secao": "exibição", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 93}, {"numero": 94, "texto": "Gosto de planejar antes de iniciar algo difícil", "secao": "ordem", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 94}, {"numero": 95, "texto": "Qualquer trabalho escrito que faço, gosto que seja preciso, limpo e bem organizado", "secao": "ordem", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 95}, {"numero": 96, "texto": "Gosto que as pessoas notem e comentem a minha aparência quando estou em público", "secao": "exibição", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 96}, {"numero": 97, "texto": "Gosto que meus amigos me tratem com delicadeza", "secao": "afago", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 97}, {"numero": 98, "texto": "Gosto de ser generoso com os outros", "secao": "assistência", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 98}, {"numero": 99, "texto": "Gosto de contar estórias e piadas engraçadas em festas", "secao": "exibição", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 99}, {"numero": 100, "texto": "Gosto de dizer coisas que os outros consideram engraçadas e inteligentes", "secao": "exibição", "tipo_resposta": "likert_ifp", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 100}]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
    "likert_ifp": [
      {"valor": 1, "texto": "Nada característico"},
      {"valor": 2, "texto": "Pouco característico"},
      {"valor": 3, "texto": "Mais ou menos característico"},
      {"valor": 4, "texto": "Muito característico"},
      {"valor": 5, "texto": "Totalmente característico"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO
  $${
    "tipo": "secoes",
    "secoes": {
      "assistencia": {
        "nome": "Assistência (As)",
        "descricao": "Necessidade de auxiliar e apoiar os outros",
        "questoes_count": 9
      },
      "intracepecao": {
        "nome": "Intracepção (In)",
        "descricao": "Tendência a se guiar por sentimentos e intuições",
        "questoes_count": 10
      },
      "afago": {
        "nome": "Afago (Af)",
        "descricao": "Necessidade de receber apoio e proteção",
        "questoes_count": 9
      },
      "deferencia": {
        "nome": "Deferência (De)",
        "descricao": "Necessidade de admirar e seguir um líder",
        "questoes_count": 10
      },
      "afiliacao": {
        "nome": "Afiliação (Afl)",
        "descricao": "Necessidade de formar amizades e participar de grupos",
        "questoes_count": 9
      },
      "dominancia": {
        "nome": "Dominância (Do)",
        "descricao": "Necessidade de controlar e influenciar os outros",
        "questoes_count": 10
      },
      "denegacao": {
        "nome": "Denegação (Dn)",
        "descricao": "Tendência a se submeter e aceitar punições",
        "questoes_count": 9
      },
      "desempenho": {
        "nome": "Desempenho (Ds)",
        "descricao": "Necessidade de realizar coisas difíceis e superar obstáculos",
        "questoes_count": 10
      },
      "exibicao": {
        "nome": "Exibição (Ex)",
        "descricao": "Necessidade de chamar atenção e ser o centro das atenções",
        "questoes_count": 9
      },
      "agressao": {
        "nome": "Agressão (Ag)",
        "descricao": "Necessidade de superar oposição e lutar",
        "questoes_count": 10
      },
      "ordem": {
        "nome": "Ordem (Or)",
        "descricao": "Necessidade de organização e planejamento",
        "questoes_count": 9
      },
      "persistencia": {
        "nome": "Persistência (Pe)",
        "descricao": "Tendência a terminar tarefas iniciadas",
        "questoes_count": 10
      },
      "mudanca": {
        "nome": "Mudança (Mu)",
        "descricao": "Necessidade de fazer coisas novas e diferentes",
        "questoes_count": 9
      },
      "autonomia": {
        "nome": "Autonomia (Au)",
        "descricao": "Necessidade de agir independentemente",
        "questoes_count": 7
      }
    },
    "conversao": {
      "tipo": "escore_bruto_percentil",
      "saidas": ["percentil", "classificacao"]
    }
  }$$::jsonb,

  -- INTERPRETACAO
  $${
    "notas": "O IFP-II avalia 14 necessidades psicológicas básicas. Perfil deve ser interpretado de forma integrada considerando combinações de necessidades.",
    "classificacoes": {
      "muito_baixo": {"min": 1, "max": 15, "descricao": "Muito Baixo"},
      "baixo": {"min": 16, "max": 30, "descricao": "Baixo"},
      "medio_baixo": {"min": 31, "max": 40, "descricao": "Médio Baixo"},
      "medio": {"min": 41, "max": 60, "descricao": "Médio"},
      "medio_alto": {"min": 61, "max": 70, "descricao": "Médio Alto"},
      "alto": {"min": 71, "max": 85, "descricao": "Alto"},
      "muito_alto": {"min": 86, "max": 100, "descricao": "Muito Alto"}
    },
    "referencia": "Leme, I. F. A. S., Rabelo, I. S., & Alves, G. A. S. (2013). IFP-II: Inventário Fatorial de Personalidade. Casa do Psicólogo."
  }$$::jsonb,

  true, true
);

-- =====================================================
-- BSI - Brief Symptom Inventory
-- 53 itens, 9 dimensões sintomáticas + 3 índices globais
-- =====================================================

INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'Brief Symptom Inventory (Inventário Breve de Sintomas)',
  'BSI',
  'escala_likert',
  13, 99, 10,

  -- QUESTOES (53 itens em 9 dimensões)
  $$[
    {"numero": 1, "texto": "Nervosismo ou tremores interiores", "secao": "ansiedade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Desmaios ou tonturas", "secao": "somatizacao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "A impressão que as outras pessoas podem controlar seus pensamentos", "secao": "psicoticismo", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "Sentir que os outros são culpados pela maioria dos seus problemas", "secao": "ideacao_paranoide", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "Dificuldade de se lembrar das coisas", "secao": "obsessivo_compulsivo", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Ficar aborrecido ou irritado facilmente", "secao": "hostilidade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "Dores no coração ou no peito", "secao": "somatizacao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "Medo de lugares abertos ou de ruas", "secao": "ansiedade_fobica", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "Pensamentos de acabar com a própria vida", "secao": "depressao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Sentir que não pode confiar na maioria das pessoas", "secao": "ideacao_paranoide", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "Falta de apetite", "secao": "adicional", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "Assustar-se de repente sem razão", "secao": "ansiedade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "Acessos de raiva ou fúria incontroláveis", "secao": "hostilidade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "Sentir-se sozinho mesmo estando com outras pessoas", "secao": "depressao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "Sentir-se bloqueado para terminar as coisas", "secao": "obsessivo_compulsivo", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "Sentir-se sozinho", "secao": "depressao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "Sentir-se triste", "secao": "depressao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "Não ter interesse por nada", "secao": "depressao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "Sentir-se amedrontado", "secao": "ansiedade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "Sentimentos facilmente feridos", "secao": "sensibilidade_interpessoal", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "Sentir que as pessoas não são amigáveis ou não gostam de você", "secao": "sensibilidade_interpessoal", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "Sentir-se inferior aos outros", "secao": "sensibilidade_interpessoal", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "Náuseas ou problemas no estômago", "secao": "somatizacao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "Sentir que está sendo observado ou que falam de você", "secao": "ideacao_paranoide", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "Dificuldade para adormecer", "secao": "adicional", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25},
    {"numero": 26, "texto": "Verificar repetidas vezes o que faz", "secao": "obsessivo_compulsivo", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26},
    {"numero": 27, "texto": "Dificuldade em tomar decisões", "secao": "obsessivo_compulsivo", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 27},
    {"numero": 28, "texto": "Medo de viajar de ônibus, metrô ou trem", "secao": "ansiedade_fobica", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 28},
    {"numero": 29, "texto": "Falta de ar", "secao": "somatizacao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29},
    {"numero": 30, "texto": "Calafrios ou ondas de calor", "secao": "somatizacao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30},
    {"numero": 31, "texto": "Ter que evitar certas coisas, lugares ou atividades porque lhe causam medo", "secao": "ansiedade_fobica", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31},
    {"numero": 32, "texto": "Sensação de vazio na cabeça", "secao": "obsessivo_compulsivo", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32},
    {"numero": 33, "texto": "Dormência ou formigamento em partes do corpo", "secao": "somatizacao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33},
    {"numero": 34, "texto": "A ideia de que você deveria ser castigado pelos seus pecados", "secao": "adicional", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 34},
    {"numero": 35, "texto": "Sentir-se sem esperança quanto ao futuro", "secao": "depressao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35},
    {"numero": 36, "texto": "Dificuldade de se concentrar", "secao": "obsessivo_compulsivo", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 36},
    {"numero": 37, "texto": "Sentir fraqueza em partes do corpo", "secao": "somatizacao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 37},
    {"numero": 38, "texto": "Sentir-se tenso ou nervoso", "secao": "ansiedade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 38},
    {"numero": 39, "texto": "Pensamentos de morte ou de morrer", "secao": "adicional", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39},
    {"numero": 40, "texto": "Ter impulsos de bater, ferir ou fazer mal a alguém", "secao": "hostilidade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 40},
    {"numero": 41, "texto": "Ter vontade de quebrar coisas", "secao": "hostilidade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41},
    {"numero": 42, "texto": "Sentir-se muito acanhado na presença de outras pessoas", "secao": "sensibilidade_interpessoal", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42},
    {"numero": 43, "texto": "Sentir-se desconfortável em multidões, como em lojas ou cinema", "secao": "ansiedade_fobica", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43},
    {"numero": 44, "texto": "Nunca se sentir próximo de outra pessoa", "secao": "psicoticismo", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 44},
    {"numero": 45, "texto": "Ataques de terror ou pânico", "secao": "ansiedade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45},
    {"numero": 46, "texto": "Entrar em discussões frequentes", "secao": "hostilidade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 46},
    {"numero": 47, "texto": "Sentir-se nervoso quando está sozinho", "secao": "ansiedade_fobica", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 47},
    {"numero": 48, "texto": "Outras pessoas não dão o devido valor às suas realizações", "secao": "ideacao_paranoide", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 48},
    {"numero": 49, "texto": "Sentir-se tão inquieto que não pode ficar sentado", "secao": "ansiedade", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 49},
    {"numero": 50, "texto": "Sentimentos de inutilidade", "secao": "depressao", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 50},
    {"numero": 51, "texto": "A sensação de que as pessoas se aproveitarão de você se você deixar", "secao": "ideacao_paranoide", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 51},
    {"numero": 52, "texto": "Sentimentos de culpa", "secao": "psicoticismo", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 52},
    {"numero": 53, "texto": "A ideia de que alguma coisa está errada com a sua mente", "secao": "psicoticismo", "tipo_resposta": "likert_bsi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 53}
  ]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
    "likert_bsi": [
      {"valor": 0, "texto": "Nem um pouco"},
      {"valor": 1, "texto": "Um pouco"},
      {"valor": 2, "texto": "Moderadamente"},
      {"valor": 3, "texto": "Bastante"},
      {"valor": 4, "texto": "Extremamente"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO
  $${
    "tipo": "secoes",
    "secoes": {
      "somatizacao": {
        "nome": "Somatização (SOM)",
        "descricao": "Desconforto decorrente da percepção de disfunções corporais",
        "questoes": [2, 7, 23, 29, 30, 33, 37],
        "peso": 1
      },
      "obsessivo_compulsivo": {
        "nome": "Obsessivo-Compulsivo (O-C)",
        "descricao": "Pensamentos, impulsos e ações percebidos como irresistíveis",
        "questoes": [5, 15, 26, 27, 32, 36],
        "peso": 1
      },
      "sensibilidade_interpessoal": {
        "nome": "Sensibilidade Interpessoal (S-I)",
        "descricao": "Sentimentos de inadequação pessoal e inferioridade",
        "questoes": [20, 21, 22, 42],
        "peso": 1
      },
      "depressao": {
        "nome": "Depressão (DEP)",
        "descricao": "Sintomas de afeto e humor disfórico",
        "questoes": [9, 14, 16, 17, 18, 35, 50],
        "peso": 1
      },
      "ansiedade": {
        "nome": "Ansiedade (ANS)",
        "descricao": "Nervosismo, tensão e ataques de pânico",
        "questoes": [1, 12, 19, 38, 45, 49],
        "peso": 1
      },
      "hostilidade": {
        "nome": "Hostilidade (HOS)",
        "descricao": "Pensamentos, sentimentos ou ações de raiva",
        "questoes": [6, 13, 40, 41, 46],
        "peso": 1
      },
      "ansiedade_fobica": {
        "nome": "Ansiedade Fóbica (FOB)",
        "descricao": "Resposta de medo persistente e irracional",
        "questoes": [8, 28, 31, 43, 47],
        "peso": 1
      },
      "ideacao_paranoide": {
        "nome": "Ideação Paranóide (PAR)",
        "descricao": "Pensamento projetivo, hostilidade e suspeição",
        "questoes": [4, 10, 24, 48, 51],
        "peso": 1
      },
      "psicoticismo": {
        "nome": "Psicoticismo (PSI)",
        "descricao": "Estilo de vida isolado e sintomas de esquizofrenia",
        "questoes": [3, 44, 52, 53],
        "peso": 1
      },
      "adicional": {
        "nome": "Itens Adicionais",
        "descricao": "Itens que contribuem para os índices globais",
        "questoes": [11, 25, 34, 39],
        "peso": 1
      }
    },
    "indices_globais": {
      "gsi": {
        "nome": "GSI (Global Severity Index)",
        "descricao": "Índice de severidade global - melhor indicador único do nível de sofrimento",
        "formula": "soma_total / 53"
      },
      "pst": {
        "nome": "PST (Positive Symptom Total)",
        "descricao": "Total de sintomas positivos - número de sintomas reportados",
        "formula": "contagem_itens_maior_zero"
      },
      "psdi": {
        "nome": "PSDI (Positive Symptom Distress Index)",
        "descricao": "Índice de intensidade de sintomas positivos",
        "formula": "soma_total / pst"
      }
    },
    "conversao": {
      "tipo": "escore_t",
      "estratificacao": ["sexo", "idade", "tipo_paciente"]
    }
  }$$::jsonb,

  -- INTERPRETACAO
  $${
    "notas": "O BSI é uma versão reduzida do SCL-90-R que avalia sintomas psicopatológicos. Os escores T permitem comparação com normas populacionais.",
    "classificacoes_t": {
      "normal": {"t_max": 62, "descricao": "Dentro da normalidade"},
      "elevado": {"t_min": 63, "t_max": 100, "descricao": "Clinicamente significativo - avaliação adicional recomendada"}
    },
    "interpretacao_indices": {
      "gsi": "Valores ≥ 63 indicam nível de sofrimento psicológico clinicamente significativo",
      "pst": "Valores elevados indicam amplitude de sintomatologia",
      "psdi": "Valores elevados indicam intensidade de sofrimento por sintoma reportado"
    },
    "referencia": "Derogatis, L. R. (1993). BSI: Brief Symptom Inventory. Adaptação brasileira."
  }$$::jsonb,

  true, true
);

-- =====================================================
-- IDADI - Inventário Dimensional de Avaliação do
-- Desenvolvimento Infantil (versão 4-35 meses)
-- =====================================================

INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'IDADI - Inventário Dimensional de Avaliação do Desenvolvimento Infantil (4-35 meses)',
  'IDADI-4-35',
  'escala_likert',
  0, 3, 30,

  -- QUESTOES (estrutura para os 7 domínios de desenvolvimento)
  -- Os itens específicos variam por faixa etária
  $$[
    {"numero": 1, "texto": "[Item de Cognição - Aguardando texto oficial]", "secao": "cognicao", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1, "dominio": "COG"},
    {"numero": 2, "texto": "[Item de Linguagem Receptiva - Aguardando texto oficial]", "secao": "linguagem_receptiva", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2, "dominio": "LR"},
    {"numero": 3, "texto": "[Item de Linguagem Expressiva - Aguardando texto oficial]", "secao": "linguagem_expressiva", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3, "dominio": "LE"},
    {"numero": 4, "texto": "[Item de Motricidade Fina - Aguardando texto oficial]", "secao": "motricidade_fina", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4, "dominio": "MF"},
    {"numero": 5, "texto": "[Item de Motricidade Ampla - Aguardando texto oficial]", "secao": "motricidade_ampla", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5, "dominio": "MA"},
    {"numero": 6, "texto": "[Item de Comportamento Socioemocional - Aguardando texto oficial]", "secao": "socioemocional", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6, "dominio": "CSE"},
    {"numero": 7, "texto": "[Item de Comportamento Adaptativo - Aguardando texto oficial]", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7, "dominio": "CA"}
  ]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
    "likert_idadi": [
      {"valor": 0, "texto": "Ainda não faz"},
      {"valor": 1, "texto": "Está começando a fazer"},
      {"valor": 2, "texto": "Faz bem, mas não sempre"},
      {"valor": 3, "texto": "Faz bem, sempre que necessário"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO
  $${
    "tipo": "secoes",
    "secoes": {
      "cognicao": {
        "nome": "Cognição (COG)",
        "descricao": "Avalia habilidades cognitivas como raciocínio, memória e solução de problemas",
        "dominio": "COG"
      },
      "linguagem_receptiva": {
        "nome": "Linguagem Receptiva (LR)",
        "descricao": "Avalia a compreensão da linguagem",
        "dominio": "LR"
      },
      "linguagem_expressiva": {
        "nome": "Linguagem Expressiva (LE)",
        "descricao": "Avalia a produção verbal e comunicação",
        "dominio": "LE"
      },
      "motricidade_fina": {
        "nome": "Motricidade Fina (MF)",
        "descricao": "Avalia habilidades motoras finas e coordenação olho-mão",
        "dominio": "MF"
      },
      "motricidade_ampla": {
        "nome": "Motricidade Ampla (MA)",
        "descricao": "Avalia habilidades motoras grossas e equilíbrio",
        "dominio": "MA"
      },
      "socioemocional": {
        "nome": "Comportamento Socioemocional (CSE)",
        "descricao": "Avalia habilidades sociais e regulação emocional",
        "dominio": "CSE"
      },
      "comportamento_adaptativo": {
        "nome": "Comportamento Adaptativo (CA)",
        "descricao": "Avalia autonomia e habilidades de autocuidado",
        "dominio": "CA"
      }
    },
    "conversao": {
      "tipo": "idade_desenvolvimento",
      "saidas": ["escore_bruto", "percentil", "classificacao", "idade_equivalente", "intervalo_confianca"]
    },
    "idade_em_meses": true
  }$$::jsonb,

  -- INTERPRETACAO
  $${
    "notas": "O IDADI avalia o desenvolvimento infantil em 7 domínios. Os resultados são comparados com normas por idade em meses. Sempre considerar intervalos de confiança na interpretação.",
    "classificacoes": {
      "muito_superior": {"percentil_min": 98, "descricao": "Muito Superior"},
      "superior": {"percentil_min": 91, "percentil_max": 97, "descricao": "Superior"},
      "medio_superior": {"percentil_min": 75, "percentil_max": 90, "descricao": "Médio Superior"},
      "medio": {"percentil_min": 25, "percentil_max": 74, "descricao": "Médio"},
      "medio_inferior": {"percentil_min": 9, "percentil_max": 24, "descricao": "Médio Inferior"},
      "limítrofe": {"percentil_min": 2, "percentil_max": 8, "descricao": "Limítrofe"},
      "extremamente_baixo": {"percentil_max": 1, "descricao": "Extremamente Baixo"}
    },
    "dominios": {
      "COG": "Cognição - habilidades de pensamento, raciocínio e aprendizagem",
      "LR": "Linguagem Receptiva - compreensão verbal",
      "LE": "Linguagem Expressiva - comunicação e expressão verbal",
      "MF": "Motricidade Fina - coordenação de pequenos movimentos",
      "MA": "Motricidade Ampla - coordenação de grandes movimentos",
      "CSE": "Socioemocional - interação social e regulação emocional",
      "CA": "Comportamento Adaptativo - independência e autocuidado"
    },
    "referencia": "Silva, M. A. et al. (2017). IDADI: Inventário Dimensional de Avaliação do Desenvolvimento Infantil. Vetor Editora."
  }$$::jsonb,

  true, true
);

-- =====================================================
-- IDADI - versão 36-72 meses
-- =====================================================

INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'IDADI - Inventário Dimensional de Avaliação do Desenvolvimento Infantil (36-72 meses)',
  'IDADI-36-72',
  'escala_likert',
  3, 6, 30,

  -- QUESTOES (mesma estrutura, mas itens adequados para idade)
  $$[
    {"numero": 1, "texto": "[Item de Cognição - Aguardando texto oficial]", "secao": "cognicao", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1, "dominio": "COG"},
    {"numero": 2, "texto": "[Item de Linguagem Receptiva - Aguardando texto oficial]", "secao": "linguagem_receptiva", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2, "dominio": "LR"},
    {"numero": 3, "texto": "[Item de Linguagem Expressiva - Aguardando texto oficial]", "secao": "linguagem_expressiva", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3, "dominio": "LE"},
    {"numero": 4, "texto": "[Item de Motricidade Fina - Aguardando texto oficial]", "secao": "motricidade_fina", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4, "dominio": "MF"},
    {"numero": 5, "texto": "[Item de Motricidade Ampla - Aguardando texto oficial]", "secao": "motricidade_ampla", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5, "dominio": "MA"},
    {"numero": 6, "texto": "[Item de Comportamento Socioemocional - Aguardando texto oficial]", "secao": "socioemocional", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6, "dominio": "CSE"},
    {"numero": 7, "texto": "[Item de Comportamento Adaptativo - Aguardando texto oficial]", "secao": "comportamento_adaptativo", "tipo_resposta": "likert_idadi", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7, "dominio": "CA"}
  ]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
    "likert_idadi": [
      {"valor": 0, "texto": "Ainda não faz"},
      {"valor": 1, "texto": "Está começando a fazer"},
      {"valor": 2, "texto": "Faz bem, mas não sempre"},
      {"valor": 3, "texto": "Faz bem, sempre que necessário"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO (mesma estrutura da versão 4-35 meses)
  $${
    "tipo": "secoes",
    "secoes": {
      "cognicao": {
        "nome": "Cognição (COG)",
        "descricao": "Avalia habilidades cognitivas como raciocínio, memória e solução de problemas",
        "dominio": "COG"
      },
      "linguagem_receptiva": {
        "nome": "Linguagem Receptiva (LR)",
        "descricao": "Avalia a compreensão da linguagem",
        "dominio": "LR"
      },
      "linguagem_expressiva": {
        "nome": "Linguagem Expressiva (LE)",
        "descricao": "Avalia a produção verbal e comunicação",
        "dominio": "LE"
      },
      "motricidade_fina": {
        "nome": "Motricidade Fina (MF)",
        "descricao": "Avalia habilidades motoras finas e coordenação olho-mão",
        "dominio": "MF"
      },
      "motricidade_ampla": {
        "nome": "Motricidade Ampla (MA)",
        "descricao": "Avalia habilidades motoras grossas e equilíbrio",
        "dominio": "MA"
      },
      "socioemocional": {
        "nome": "Comportamento Socioemocional (CSE)",
        "descricao": "Avalia habilidades sociais e regulação emocional",
        "dominio": "CSE"
      },
      "comportamento_adaptativo": {
        "nome": "Comportamento Adaptativo (CA)",
        "descricao": "Avalia autonomia e habilidades de autocuidado",
        "dominio": "CA"
      }
    },
    "conversao": {
      "tipo": "idade_desenvolvimento",
      "saidas": ["escore_bruto", "percentil", "classificacao", "idade_equivalente", "intervalo_confianca"]
    },
    "idade_em_meses": true
  }$$::jsonb,

  -- INTERPRETACAO (mesma da versão 4-35 meses)
  $${
    "notas": "O IDADI avalia o desenvolvimento infantil em 7 domínios. Os resultados são comparados com normas por idade em meses. Sempre considerar intervalos de confiança na interpretação.",
    "classificacoes": {
      "muito_superior": {"percentil_min": 98, "descricao": "Muito Superior"},
      "superior": {"percentil_min": 91, "percentil_max": 97, "descricao": "Superior"},
      "medio_superior": {"percentil_min": 75, "percentil_max": 90, "descricao": "Médio Superior"},
      "medio": {"percentil_min": 25, "percentil_max": 74, "descricao": "Médio"},
      "medio_inferior": {"percentil_min": 9, "percentil_max": 24, "descricao": "Médio Inferior"},
      "limítrofe": {"percentil_min": 2, "percentil_max": 8, "descricao": "Limítrofe"},
      "extremamente_baixo": {"percentil_max": 1, "descricao": "Extremamente Baixo"}
    },
    "dominios": {
      "COG": "Cognição - habilidades de pensamento, raciocínio e aprendizagem",
      "LR": "Linguagem Receptiva - compreensão verbal",
      "LE": "Linguagem Expressiva - comunicação e expressão verbal",
      "MF": "Motricidade Fina - coordenação de pequenos movimentos",
      "MA": "Motricidade Ampla - coordenação de grandes movimentos",
      "CSE": "Socioemocional - interação social e regulação emocional",
      "CA": "Comportamento Adaptativo - independência e autocuidado"
    },
    "referencia": "Silva, M. A. et al. (2017). IDADI: Inventário Dimensional de Avaliação do Desenvolvimento Infantil. Vetor Editora."
  }$$::jsonb,

  true, true
);

-- =====================================================
-- Verify all insertions
-- =====================================================

SELECT sigla, nome, jsonb_array_length(questoes) as num_questoes
FROM testes_templates
WHERE sigla IN ('AQ-10-C', 'ETDAH-PROF', 'ETDAH-PAIS', 'EBADEP-A', 'BFP', 'BDEFS-L', 'IFP-II', 'BSI', 'IDADI-4-35', 'IDADI-36-72')
ORDER BY sigla;
