-- ===================================
-- SEED DATA FOR MASC AND CDI TESTS
-- NeuroTest Platform
-- ===================================

-- ===================================
-- MASC - Escala Multidimensional de Ansiedade para Crianças
-- 39 items, cut score: 56 points
-- ===================================

INSERT INTO testes_templates (
  id,
  nome,
  nome_completo,
  sigla,
  versao,
  autor,
  tipo,
  faixa_etaria_min,
  faixa_etaria_max,
  tempo_medio_aplicacao,
  aplicacao_permitida,
  questoes,
  escalas_resposta,
  regras_calculo,
  interpretacao,
  publico,
  ativo
) VALUES (
  '550e8400-e29b-41d4-a716-446655440100',
  'MASC',
  'Escala Multidimensional de Ansiedade para Crianças',
  'MASC',
  '1.0',
  'March, J. S.',
  'escala_likert',
  8,
  18,
  15,
  ARRAY['presencial', 'remota'],
  '[
    {"numero": 1, "texto": "Eu me sinto tenso ou nervoso", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Eu costumo pedir permissão para fazer as coisas", "secao": "perfeccionismo", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Eu me preocupo que as outras pessoas dêem risada de mim", "secao": "ansiedade_social", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "Eu fico com medo quando os meus pais saem", "secao": "ansiedade_separacao", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "Sinto falta de ar", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Eu fico atento se há algum perigo", "secao": "evitacao_dano", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "A idéia de ficar longe de casa me assusta", "secao": "ansiedade_separacao", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "Eu fico tremendo ou inquieto", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "Eu me esforço para obedecer meus pais e professores", "secao": "perfeccionismo", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Eu tenho medo que os outros meninos (ou meninas) gozem de mim", "secao": "ansiedade_social", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "Eu tento ficar perto da minha mãe ou meu pai", "secao": "ansiedade_separacao", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "Eu tenho tontura ou sensação de desmaio", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "Eu verifico as coisas antes de fazê-las", "secao": "perfeccionismo", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "Eu me preocupo em ser chamado na classe", "secao": "ansiedade_social", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "Eu me sinto desassossegado (sobressaltado)", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "Eu tenho medo que os outros achem que eu sou bobo", "secao": "ansiedade_social", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "Eu deixo as luzes acesas à noite", "secao": "evitacao_dano", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "Eu sinto dores no peito", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "Eu evito sair sem minha família", "secao": "ansiedade_separacao", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "Eu me sinto estranho, esquisito, ou fora da realidade", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "Eu tento fazer coisas que vão agradar aos outros", "secao": "perfeccionismo", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "Eu me preocupo com o que os outros pensam de mim", "secao": "ansiedade_social", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "Eu evito assistir filmes ou programas de TV que assustam", "secao": "evitacao_dano", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "Meu coração dispara ou falha", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "Eu evito as coisas que me aborrecem", "secao": "evitacao_dano", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25},
    {"numero": 26, "texto": "Eu durmo junto de alguém da minha família", "secao": "ansiedade_separacao", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26},
    {"numero": 27, "texto": "Eu me sinto inquieto e nervoso", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 27},
    {"numero": 28, "texto": "Eu tento fazer tudo exatamente do jeito certo", "secao": "perfeccionismo", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 28},
    {"numero": 29, "texto": "Eu me preocupo em fazer alguma coisa boba ou que me deixe sem graça", "secao": "ansiedade_social", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29},
    {"numero": 30, "texto": "Eu fico com medo quando ando de carro ou de ônibus", "secao": "evitacao_dano", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30},
    {"numero": 31, "texto": "Eu sinto mal estar no estômago", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31},
    {"numero": 32, "texto": "Se eu fico aborrecido ou com medo, eu conto logo para alguém", "secao": "evitacao_dano", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32},
    {"numero": 33, "texto": "Eu fico nervoso se eu tenho que fazer alguma coisa em público", "secao": "ansiedade_social", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33},
    {"numero": 34, "texto": "Tenho medo de tempo ruim, escuridão, altura, animais ou insetos", "secao": "evitacao_dano", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 34},
    {"numero": 35, "texto": "Minhas mãos tremem", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35},
    {"numero": 36, "texto": "Eu preciso ter certeza que as coisas estão seguras", "secao": "perfeccionismo", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 36},
    {"numero": 37, "texto": "Eu tenho dificuldade em chamar outros meninos (ou meninas) para brincar comigo", "secao": "ansiedade_social", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 37},
    {"numero": 38, "texto": "Minhas mãos ficam suadas ou frias", "secao": "ansiedade_fisica", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 38},
    {"numero": 39, "texto": "Eu sinto vergonha", "secao": "ansiedade_social", "tipo_resposta": "likert_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39}
  ]'::jsonb,
  '{
    "likert_0_3": [
      {"valor": 0, "texto": "Nunca é verdade sobre mim"},
      {"valor": 1, "texto": "Raramente é verdade sobre mim"},
      {"valor": 2, "texto": "Às vezes é verdade sobre mim"},
      {"valor": 3, "texto": "Frequentemente é verdade sobre mim"}
    ]
  }'::jsonb,
  '{
    "tipo": "secoes",
    "secoes": {
      "ansiedade_fisica": {
        "nome": "Sintomas Físicos de Ansiedade",
        "questoes": [1, 5, 8, 12, 15, 18, 20, 24, 27, 31, 35, 38],
        "invertidas": [],
        "peso": 1
      },
      "ansiedade_social": {
        "nome": "Ansiedade Social",
        "questoes": [3, 10, 14, 16, 22, 29, 33, 37, 39],
        "invertidas": [],
        "peso": 1
      },
      "ansiedade_separacao": {
        "nome": "Ansiedade de Separação",
        "questoes": [4, 7, 11, 19, 26],
        "invertidas": [],
        "peso": 1
      },
      "evitacao_dano": {
        "nome": "Evitação de Dano",
        "questoes": [6, 17, 23, 25, 30, 32, 34],
        "invertidas": [],
        "peso": 1
      },
      "perfeccionismo": {
        "nome": "Perfeccionismo",
        "questoes": [2, 9, 13, 21, 28, 36],
        "invertidas": [],
        "peso": 1
      }
    },
    "score_total": "soma_secoes",
    "ponto_corte": 56
  }'::jsonb,
  '{
    "faixas": [
      {
        "pontuacao_min": 0,
        "pontuacao_max": 55,
        "classificacao": "Sem indicação de ansiedade clínica",
        "descricao": "Pontuação abaixo do ponto de corte indica níveis normais de ansiedade para a faixa etária."
      },
      {
        "pontuacao_min": 56,
        "pontuacao_max": 117,
        "classificacao": "Indicação de ansiedade clínica",
        "descricao": "Pontuação igual ou acima do ponto de corte (56) sugere presença de sintomas ansiosos clinicamente significativos. Recomenda-se avaliação clínica aprofundada."
      }
    ],
    "subescalas": {
      "ansiedade_fisica": {
        "descricao": "Avalia sintomas somáticos de ansiedade como tremores, tontura, palpitações, falta de ar e tensão muscular.",
        "max_pontos": 36
      },
      "ansiedade_social": {
        "descricao": "Avalia medo de avaliação negativa pelos outros, preocupação com humilhação e vergonha em situações sociais.",
        "max_pontos": 27
      },
      "ansiedade_separacao": {
        "descricao": "Avalia medo de separação das figuras de apego, preocupação com eventos adversos aos pais.",
        "max_pontos": 15
      },
      "evitacao_dano": {
        "descricao": "Avalia comportamentos de evitação de situações potencialmente perigosas ou assustadoras.",
        "max_pontos": 21
      },
      "perfeccionismo": {
        "descricao": "Avalia comportamentos perfeccionistas, necessidade de aprovação e verificação.",
        "max_pontos": 18
      }
    }
  }'::jsonb,
  true,
  true
);

-- ===================================
-- CDI - Children''s Depression Inventory (Inventário de Depressão Infantil)
-- 20 items, cut score: 17 points
-- ===================================

INSERT INTO testes_templates (
  id,
  nome,
  nome_completo,
  sigla,
  versao,
  autor,
  tipo,
  faixa_etaria_min,
  faixa_etaria_max,
  tempo_medio_aplicacao,
  aplicacao_permitida,
  questoes,
  escalas_resposta,
  regras_calculo,
  interpretacao,
  publico,
  ativo
) VALUES (
  '550e8400-e29b-41d4-a716-446655440101',
  'CDI',
  'Children''s Depression Inventory - Inventário de Depressão Infantil',
  'CDI',
  '1.0',
  'Kovacs, M.',
  'escala_likert',
  7,
  17,
  10,
  ARRAY['presencial', 'remota'],
  '[
    {"numero": 1, "texto": "Tristeza", "subtexto": "0 = Não me sinto triste de vez em quando | 1 = Eu me sinto triste muitas vezes | 2 = Estou sempre triste", "secao": "humor_negativo", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1, "opcoes": ["Não me sinto triste de vez em quando", "Eu me sinto triste muitas vezes", "Estou sempre triste"]},
    {"numero": 2, "texto": "Pessimismo", "subtexto": "0 = Para mim, tudo se resolverá bem | 1 = Eu não tenho certeza se as coisas darão certo para mim | 2 = Nada vai dar certo para mim", "secao": "humor_negativo", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2, "opcoes": ["Para mim, tudo se resolverá bem", "Eu não tenho certeza se as coisas darão certo para mim", "Nada vai dar certo para mim"]},
    {"numero": 3, "texto": "Autoavaliação", "subtexto": "0 = Eu faço bem a maioria das coisas | 1 = Eu faço errado a maioria das coisas | 2 = Eu faço tudo errado", "secao": "autoestima", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3, "opcoes": ["Eu faço bem a maioria das coisas", "Eu faço errado a maioria das coisas", "Eu faço tudo errado"]},
    {"numero": 4, "texto": "Anedonia", "subtexto": "0 = Eu me divirto com muitas coisas | 1 = Eu me divirto com algumas coisas | 2 = Nada é divertido para mim", "secao": "anedonia", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4, "opcoes": ["Eu me divirto com muitas coisas", "Eu me divirto com algumas coisas", "Nada é divertido para mim"]},
    {"numero": 5, "texto": "Comportamento", "subtexto": "0 = Eu sou mau (má) de vez em quando | 1 = Eu sou mau (má) com frequência | 2 = Eu sou sempre mau (má)", "secao": "comportamento", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5, "opcoes": ["Eu sou mau (má) de vez em quando", "Eu sou mau (má) com frequência", "Eu sou sempre mau (má)"]},
    {"numero": 6, "texto": "Preocupação", "subtexto": "0 = De vez em quando, eu penso que coisas ruins vão me acontecer | 1 = Eu temo que coisas ruins aconteçam | 2 = Eu tenho certeza que coisas terríveis vão me acontecer", "secao": "humor_negativo", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6, "opcoes": ["De vez em quando, eu penso que coisas ruins vão me acontecer", "Eu temo que coisas ruins aconteçam", "Eu tenho certeza que coisas terríveis vão me acontecer"]},
    {"numero": 7, "texto": "Autoimagem", "subtexto": "0 = Eu gosto de mim mesmo | 1 = Eu não gosto de mim | 2 = Eu me odeio", "secao": "autoestima", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7, "opcoes": ["Eu gosto de mim mesmo", "Eu não gosto de mim", "Eu me odeio"]},
    {"numero": 8, "texto": "Culpa", "subtexto": "0 = Normalmente, eu não me sinto culpado pelas coisas ruins que acontecem | 1 = Muitas coisas ruins que acontecem são minha culpa | 2 = Tudo de mau que acontece é por minha culpa", "secao": "humor_negativo", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8, "opcoes": ["Normalmente, eu não me sinto culpado pelas coisas ruins que acontecem", "Muitas coisas ruins que acontecem são minha culpa", "Tudo de mau que acontece é por minha culpa"]},
    {"numero": 9, "texto": "Ideação suicida", "subtexto": "0 = Eu não penso em me matar | 1 = Eu penso em me matar, mas não faria | 2 = Eu quero me matar", "secao": "ideacao_suicida", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9, "opcoes": ["Eu não penso em me matar", "Eu penso em me matar, mas não faria", "Eu quero me matar"]},
    {"numero": 10, "texto": "Choro", "subtexto": "0 = Eu sinto vontade de chorar de vez em quando | 1 = Eu sinto vontade de chorar frequentemente | 2 = Eu sinto vontade de chorar diariamente", "secao": "humor_negativo", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10, "opcoes": ["Eu sinto vontade de chorar de vez em quando", "Eu sinto vontade de chorar frequentemente", "Eu sinto vontade de chorar diariamente"]},
    {"numero": 11, "texto": "Irritabilidade", "subtexto": "0 = Eu me sinto preocupado de vez em quando | 1 = Eu me sinto preocupado frequentemente | 2 = Eu me sinto preocupado", "secao": "humor_negativo", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11, "opcoes": ["Eu me sinto preocupado de vez em quando", "Eu me sinto preocupado frequentemente", "Eu me sinto preocupado"]},
    {"numero": 12, "texto": "Interesse social", "subtexto": "0 = Eu gosto de estar com pessoas | 1 = Frequentemente, eu não gosto de estar com pessoas | 2 = Eu não gosto de estar com pessoas", "secao": "relacionamento", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12, "opcoes": ["Eu gosto de estar com pessoas", "Frequentemente, eu não gosto de estar com pessoas", "Eu não gosto de estar com pessoas"]},
    {"numero": 13, "texto": "Aparência", "subtexto": "0 = Eu tenho boa aparência | 1 = Minha aparência tem alguns aspectos negativos | 2 = Eu sou feio", "secao": "autoestima", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13, "opcoes": ["Eu tenho boa aparência", "Minha aparência tem alguns aspectos negativos", "Eu sou feio"]},
    {"numero": 14, "texto": "Sono", "subtexto": "0 = Eu durmo a noite | 1 = Eu tenho dificuldades para dormir algumas noites | 2 = Eu tenho sempre dificuldades para dormir à noite", "secao": "sintomas_fisicos", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14, "opcoes": ["Eu durmo a noite", "Eu tenho dificuldades para dormir algumas noites", "Eu tenho sempre dificuldades para dormir à noite"]},
    {"numero": 15, "texto": "Fadiga", "subtexto": "0 = Eu me canso de vez em quando | 1 = Eu me canso frequentemente | 2 = Estou sempre cansado", "secao": "sintomas_fisicos", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15, "opcoes": ["Eu me canso de vez em quando", "Eu me canso frequentemente", "Estou sempre cansado"]},
    {"numero": 16, "texto": "Solidão", "subtexto": "0 = Eu não me sinto sozinho | 1 = Eu me sinto sozinho muitas vezes | 2 = Estou sempre me sinto sozinho", "secao": "relacionamento", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16, "opcoes": ["Eu não me sinto sozinho", "Eu me sinto sozinho muitas vezes", "Estou sempre me sinto sozinho"]},
    {"numero": 17, "texto": "Escola", "subtexto": "0 = Eu me divirto na escola frequentemente | 1 = Eu me divirto na escola de vez em quando | 2 = Eu nunca me divirto na escola", "secao": "funcionamento", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17, "opcoes": ["Eu me divirto na escola frequentemente", "Eu me divirto na escola de vez em quando", "Eu nunca me divirto na escola"]},
    {"numero": 18, "texto": "Comparação social", "subtexto": "0 = Sou tão bom quanto outras crianças | 1 = Se eu quiser, sou tão bom quanto outras crianças | 2 = Não posso ser tão bom quanto outras crianças", "secao": "autoestima", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18, "opcoes": ["Sou tão bom quanto outras crianças", "Se eu quiser, sou tão bom quanto outras crianças", "Não posso ser tão bom quanto outras crianças"]},
    {"numero": 19, "texto": "Amor/afeto", "subtexto": "0 = Eu tenho certeza de que sou amado por alguém | 1 = Eu não tenho certeza se alguém me ama | 2 = Ninguém gosta de mim realmente", "secao": "relacionamento", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19, "opcoes": ["Eu tenho certeza de que sou amado por alguém", "Eu não tenho certeza se alguém me ama", "Ninguém gosta de mim realmente"]},
    {"numero": 20, "texto": "Obediência", "subtexto": "0 = Eu sempre faço o que me mandam | 1 = Eu não faço o que me mandam com frequência | 2 = Eu nunca faço o que me mandam", "secao": "comportamento", "tipo_resposta": "likert_0_2", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20, "opcoes": ["Eu sempre faço o que me mandam", "Eu não faço o que me mandam com frequência", "Eu nunca faço o que me mandam"]}
  ]'::jsonb,
  '{
    "likert_0_2": [
      {"valor": 0, "texto": "Opção A (ausência/normalidade)"},
      {"valor": 1, "texto": "Opção B (presença leve/moderada)"},
      {"valor": 2, "texto": "Opção C (presença intensa)"}
    ]
  }'::jsonb,
  '{
    "tipo": "secoes",
    "secoes": {
      "humor_negativo": {
        "nome": "Humor Negativo",
        "questoes": [1, 2, 6, 8, 10, 11],
        "invertidas": [],
        "peso": 1
      },
      "autoestima": {
        "nome": "Autoestima Negativa",
        "questoes": [3, 7, 13, 18],
        "invertidas": [],
        "peso": 1
      },
      "anedonia": {
        "nome": "Anedonia",
        "questoes": [4],
        "invertidas": [],
        "peso": 1
      },
      "comportamento": {
        "nome": "Problemas de Comportamento",
        "questoes": [5, 20],
        "invertidas": [],
        "peso": 1
      },
      "ideacao_suicida": {
        "nome": "Ideação Suicida",
        "questoes": [9],
        "invertidas": [],
        "peso": 1
      },
      "relacionamento": {
        "nome": "Problemas de Relacionamento",
        "questoes": [12, 16, 19],
        "invertidas": [],
        "peso": 1
      },
      "sintomas_fisicos": {
        "nome": "Sintomas Físicos",
        "questoes": [14, 15],
        "invertidas": [],
        "peso": 1
      },
      "funcionamento": {
        "nome": "Funcionamento Escolar",
        "questoes": [17],
        "invertidas": [],
        "peso": 1
      }
    },
    "score_total": "soma_secoes",
    "ponto_corte": 17
  }'::jsonb,
  '{
    "faixas": [
      {
        "pontuacao_min": 0,
        "pontuacao_max": 16,
        "classificacao": "Sem indicação de depressão clínica",
        "descricao": "Pontuação abaixo do ponto de corte indica níveis normais de sintomas depressivos para a faixa etária."
      },
      {
        "pontuacao_min": 17,
        "pontuacao_max": 40,
        "classificacao": "Indicação de depressão clínica",
        "descricao": "Pontuação igual ou acima do ponto de corte (17) sugere presença de sintomas depressivos clinicamente significativos. Recomenda-se avaliação clínica aprofundada."
      }
    ],
    "alertas": {
      "ideacao_suicida": {
        "questao": 9,
        "valores_alerta": [1, 2],
        "mensagem": "ALERTA: Presença de ideação suicida identificada. Necessária avaliação de risco imediata."
      }
    },
    "subescalas": {
      "humor_negativo": {
        "descricao": "Avalia sintomas relacionados a tristeza, pessimismo, culpa, choro e irritabilidade.",
        "max_pontos": 12
      },
      "autoestima": {
        "descricao": "Avalia percepção negativa de si mesmo, competência e aparência.",
        "max_pontos": 8
      },
      "anedonia": {
        "descricao": "Avalia perda de prazer e interesse em atividades.",
        "max_pontos": 2
      },
      "comportamento": {
        "descricao": "Avalia problemas de conduta e desobediência.",
        "max_pontos": 4
      },
      "ideacao_suicida": {
        "descricao": "Avalia pensamentos de morte e autolesão. Item crítico que requer atenção especial.",
        "max_pontos": 2
      },
      "relacionamento": {
        "descricao": "Avalia isolamento social, solidão e percepção de não ser amado.",
        "max_pontos": 6
      },
      "sintomas_fisicos": {
        "descricao": "Avalia alterações de sono e fadiga.",
        "max_pontos": 4
      },
      "funcionamento": {
        "descricao": "Avalia problemas de funcionamento escolar.",
        "max_pontos": 2
      }
    }
  }'::jsonb,
  true,
  true
);

-- ===================================
-- ASSOCIATE TAGS WITH TESTS
-- ===================================

-- Get tag IDs (these are from the 003_tagging_system.sql migration)
-- We'll use the slugs to find and associate

-- Tags for MASC (Anxiety scale for children)
INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440100', id FROM tags WHERE slug = 'criancas'
ON CONFLICT DO NOTHING;

INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440100', id FROM tags WHERE slug = 'adolescentes'
ON CONFLICT DO NOTHING;

INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440100', id FROM tags WHERE slug = 'ansiedade'
ON CONFLICT DO NOTHING;

INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440100', id FROM tags WHERE slug = 'escala-autorelato'
ON CONFLICT DO NOTHING;

INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440100', id FROM tags WHERE slug = '8-18-anos'
ON CONFLICT DO NOTHING;

-- Tags for CDI (Depression inventory for children)
INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440101', id FROM tags WHERE slug = 'criancas'
ON CONFLICT DO NOTHING;

INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440101', id FROM tags WHERE slug = 'adolescentes'
ON CONFLICT DO NOTHING;

INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440101', id FROM tags WHERE slug = 'depressao'
ON CONFLICT DO NOTHING;

INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440101', id FROM tags WHERE slug = 'inventario'
ON CONFLICT DO NOTHING;

INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440101', id FROM tags WHERE slug = 'screening'
ON CONFLICT DO NOTHING;

INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT '550e8400-e29b-41d4-a716-446655440101', id FROM tags WHERE slug = '7-17-anos'
ON CONFLICT DO NOTHING;

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Verify MASC was inserted correctly:
-- SELECT id, nome, sigla, faixa_etaria_min, faixa_etaria_max,
--        jsonb_array_length(questoes) as num_questoes,
--        regras_calculo->>'ponto_corte' as ponto_corte
-- FROM testes_templates WHERE sigla = 'MASC';

-- Verify CDI was inserted correctly:
-- SELECT id, nome, sigla, faixa_etaria_min, faixa_etaria_max,
--        jsonb_array_length(questoes) as num_questoes,
--        regras_calculo->>'ponto_corte' as ponto_corte
-- FROM testes_templates WHERE sigla = 'CDI';

-- Verify tags were associated:
-- SELECT t.nome as teste, array_agg(tg.nome) as tags
-- FROM testes_templates t
-- JOIN testes_templates_tags ttt ON t.id = ttt.teste_template_id
-- JOIN tags tg ON ttt.tag_id = tg.id
-- WHERE t.sigla IN ('MASC', 'CDI')
-- GROUP BY t.nome;
