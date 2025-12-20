-- ============================================================================
-- EBADEP-A - Escala Baptista de Depressão - Versão Adulto
-- ============================================================================
-- Teste: 45 itens com formato de diferencial semântico (bipolar)
-- Pontuação: 0-3 por item (0 = positivo forte, 3 = negativo forte)
-- Score total: 0-135
-- Classificação: Baseada em percentis da amostra normativa
-- ============================================================================

INSERT INTO testes_templates (
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
  'EBADEP-A',
  'Escala Baptista de Depressão - Versão Adulto',
  'EBADEP-A',
  '1.0',
  'Makilim Nunes Baptista',
  'escala_likert',
  18,
  NULL,
  15,
  ARRAY['presencial', 'remota']::text[],

  -- ========================================================================
  -- QUESTOES (45 itens)
  -- ========================================================================
  $$[
    {"numero": 1, "secao": "EBADEP-A", "texto_esquerda": "Não tenho vontade de chorar", "texto_direita": "Tenho sentido vontade de chorar", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "secao": "EBADEP-A", "texto_esquerda": "Tenho me sentido muito bem", "texto_direita": "Tenho estado mais angustiado", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "secao": "EBADEP-A", "texto_esquerda": "Consigo realizar tarefas", "texto_direita": "Sinto-me mais impotente para realizar tarefas", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "secao": "EBADEP-A", "texto_esquerda": "Resolvo meus problemas", "texto_direita": "Sinto-me menos capaz para enfrentar meus problemas", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "secao": "EBADEP-A", "texto_esquerda": "Faço coisas que gosto", "texto_direita": "Não tenho mais vontade de fazer coisas que gostava", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "secao": "EBADEP-A", "texto_esquerda": "Não tenho chorado", "texto_direita": "Tenho chorado", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "secao": "EBADEP-A", "texto_esquerda": "Não sinto solidão", "texto_direita": "Sinto-me cada vez mais sozinho", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "secao": "EBADEP-A", "texto_esquerda": "Sei me comportar nas situações", "texto_direita": "Não sei como agir", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "secao": "EBADEP-A", "texto_esquerda": "Consigo me virar sozinho", "texto_direita": "Não consigo mais me virar sozinho", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "secao": "EBADEP-A", "texto_esquerda": "O futuro será melhor", "texto_direita": "Não acredito que as coisas melhorem", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "secao": "EBADEP-A", "texto_esquerda": "Minhas atitudes me parecem normais", "texto_direita": "Acho minhas atitudes menos adequadas do que antes", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "secao": "EBADEP-A", "texto_esquerda": "Faço planos para o futuro", "texto_direita": "Não consigo planejar meu futuro", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "secao": "EBADEP-A", "texto_esquerda": "Acredito em mim", "texto_direita": "Estou acreditando menos em mim", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "secao": "EBADEP-A", "texto_esquerda": "Não tenho problemas para decidir", "texto_direita": "Está mais difícil decidir", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "secao": "EBADEP-A", "texto_esquerda": "Escolho com facilidade", "texto_direita": "Não consigo mais escolher sozinho", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "secao": "EBADEP-A", "texto_esquerda": "Consigo fazer minhas tarefas sem ajuda", "texto_direita": "Estou precisando de ajuda para realizar meus trabalhos", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "secao": "EBADEP-A", "texto_esquerda": "Sinto prazer em realizar minhas atividades", "texto_direita": "As coisas não me agradam como antigamente", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "secao": "EBADEP-A", "texto_esquerda": "Sinto-me feliz com a minha vida", "texto_direita": "Antes eu era mais feliz", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "secao": "EBADEP-A", "texto_esquerda": "Acredito que as coisas estão indo bem na minha vida", "texto_direita": "Acredito que atualmente nada vai bem", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "secao": "EBADEP-A", "texto_esquerda": "Faço coisas que ajudam os outros", "texto_direita": "As coisas que faço não ajudam a mais ninguém", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "secao": "EBADEP-A", "texto_esquerda": "Estar com pessoas é bom", "texto_direita": "Comecei a inventar desculpas para não me encontrar com as pessoas", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "secao": "EBADEP-A", "texto_esquerda": "Compareço a festas e reuniões quando sou convidado", "texto_direita": "Tenho evitado festas e reuniões, mesmo convidado", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "secao": "EBADEP-A", "texto_esquerda": "Consigo me concentrar nas minhas atividades", "texto_direita": "Não consigo mais me concentrar", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "secao": "EBADEP-A", "texto_esquerda": "Tenho realizado minhas tarefas normalmente", "texto_direita": "Estou mais lento para realizar minhas tarefas", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "secao": "EBADEP-A", "texto_esquerda": "Tenho realizado minhas tarefas normalmente", "texto_direita": "Estou me sentindo mais agitado do que antes", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25},
    {"numero": 26, "secao": "EBADEP-A", "texto_esquerda": "Sempre achei minha vida boa", "texto_direita": "Hoje acho que meu passado não foi bom", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26},
    {"numero": 27, "secao": "EBADEP-A", "texto_esquerda": "Sinto-me disposto", "texto_direita": "Logo pela manhã me sinto esgotado", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 27},
    {"numero": 28, "secao": "EBADEP-A", "texto_esquerda": "Minha vida é boa", "texto_direita": "Minha vida está cada vez pior", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 28},
    {"numero": 29, "secao": "EBADEP-A", "texto_esquerda": "Morrer não é a solução para problemas", "texto_direita": "Tenho pensado que seria melhor estar morto", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29},
    {"numero": 30, "secao": "EBADEP-A", "texto_esquerda": "Acredito em mim", "texto_direita": "Não acredito mais em mim", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30},
    {"numero": 31, "secao": "EBADEP-A", "texto_esquerda": "Durmo bem", "texto_direita": "Não consigo mais dormir a noite inteira", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31},
    {"numero": 32, "secao": "EBADEP-A", "texto_esquerda": "Faço normalmente o que é necessário", "texto_direita": "Não consigo mais fazer o necessário", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32},
    {"numero": 33, "secao": "EBADEP-A", "texto_esquerda": "Gosto muito da minha vida", "texto_direita": "Não dou mais valor à minha vida", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33},
    {"numero": 34, "secao": "EBADEP-A", "texto_esquerda": "Gosto de mim", "texto_direita": "Não gosto mais de mim", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 34},
    {"numero": 35, "secao": "EBADEP-A", "texto_esquerda": "Termino minhas tarefas", "texto_direita": "Não termino mais minhas tarefas", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35},
    {"numero": 36, "secao": "EBADEP-A", "texto_esquerda": "Estou tranquilo", "texto_direita": "Perco a paciência por muito pouco", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 36},
    {"numero": 37, "secao": "EBADEP-A", "texto_esquerda": "Não venho me sentindo nervoso", "texto_direita": "Qualquer coisa me deixa nervoso", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 37},
    {"numero": 38, "secao": "EBADEP-A", "texto_esquerda": "Sinto-me com disposição", "texto_direita": "Ando mais cansado", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 38},
    {"numero": 39, "secao": "EBADEP-A", "texto_esquerda": "Sinto-me disposto", "texto_direita": "Não tenho mais vontade de fazer as coisas", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39},
    {"numero": 40, "secao": "EBADEP-A", "texto_esquerda": "Durmo normalmente", "texto_direita": "Tenho dormido muito", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 40},
    {"numero": 41, "secao": "EBADEP-A", "texto_esquerda": "Minha fome continua como sempre", "texto_direita": "Tenho comido menos", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41},
    {"numero": 42, "secao": "EBADEP-A", "texto_esquerda": "Tenho desejo sexual como antes", "texto_direita": "Meu desejo sexual vem diminuindo muito", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42},
    {"numero": 43, "secao": "EBADEP-A", "texto_esquerda": "Meu peso continua o mesmo", "texto_direita": "Tenho emagrecido sem fazer regime", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43},
    {"numero": 44, "secao": "EBADEP-A", "texto_esquerda": "Tomo remédio apenas quando preciso", "texto_direita": "Gosto de tomar remédio por precaução", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 44},
    {"numero": 45, "secao": "EBADEP-A", "texto_esquerda": "Não costumo sentir culpa", "texto_direita": "Venho me sentindo culpado pelos problemas", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45}
  ]$$::jsonb,

  -- ========================================================================
  -- ESCALAS_RESPOSTA
  -- ========================================================================
  $${
    "diferencial_0_3": [
      {"valor": 0, "texto": "Primeira opção (forte)", "descricao": "Concordo fortemente com a afirmação positiva/saudável"},
      {"valor": 1, "texto": "Segunda opção (moderada)", "descricao": "Concordo moderadamente com a afirmação positiva/saudável"},
      {"valor": 2, "texto": "Terceira opção (moderada)", "descricao": "Concordo moderadamente com a afirmação negativa/depressiva"},
      {"valor": 3, "texto": "Quarta opção (forte)", "descricao": "Concordo fortemente com a afirmação negativa/depressiva"}
    ]
  }$$::jsonb,

  -- ========================================================================
  -- REGRAS_CALCULO
  -- ========================================================================
  $${
    "tipo": "percentil_lookup",
    "score_total": "soma_simples",
    "range_score": {"min": 0, "max": 135},
    "tabela_percentil": {
      "0": 1, "1": 1, "2": 1, "3": 2, "4": 2, "5": 2, "6": 3, "7": 3, "8": 4, "9": 5,
      "10": 6, "11": 7, "12": 8, "13": 8, "14": 9, "15": 10, "16": 12, "17": 13, "18": 14, "19": 16,
      "20": 17, "21": 19, "22": 20, "23": 22, "24": 24, "25": 25, "26": 25, "27": 27, "28": 28, "29": 29,
      "30": 31, "31": 32, "32": 33, "33": 34, "34": 36, "35": 38, "36": 39, "37": 40, "38": 42, "39": 43,
      "40": 45, "41": 47, "42": 48, "43": 50, "44": 51, "45": 52, "46": 54, "47": 55, "48": 57, "49": 59,
      "50": 60, "51": 61, "52": 63, "53": 64, "54": 65, "55": 66, "56": 67, "57": 69, "58": 70, "59": 71,
      "60": 72, "61": 73, "62": 74, "63": 75, "64": 76, "65": 77, "66": 78, "67": 79, "68": 80, "69": 81,
      "70": 82, "71": 83, "72": 84, "73": 85, "74": 86, "75": 86, "76": 87, "77": 88, "78": 88, "79": 89,
      "80": 90, "81": 90, "82": 91, "83": 91, "84": 92, "85": 92, "86": 92, "87": 93, "88": 93, "89": 94,
      "90": 94, "91": 95, "92": 95, "93": 96, "94": 96, "95": 96, "96": 97, "97": 97, "98": 97, "99": 97,
      "100": 97, "101": 98, "102": 98, "103": 98, "104": 98, "105": 98, "106": 98, "107": 98, "108": 98, "109": 99,
      "110": 99, "111": 99, "112": 99, "113": 99, "114": 99, "115": 99, "116": 99, "117": 99, "118": 99, "119": 99,
      "120": 99, "121": 99, "122": 99, "123": 99, "124": 99, "125": 99, "126": 99, "127": 99, "128": 99, "129": 99,
      "130": 99, "131": 99, "132": 99, "133": 99, "134": 99, "135": 99
    },
    "interpretacao_por_score": [
      {"min": 0, "max": 59, "classificacao": "SINTOMATOLOGIA DEPRESSIVA", "percentil_range": "1-71"},
      {"min": 60, "max": 76, "classificacao": "SINTOMATOLOGIA DEPRESSIVA LEVE", "percentil_range": "72-87"},
      {"min": 77, "max": 110, "classificacao": "SINTOMATOLOGIA DEPRESSIVA MODERADA", "percentil_range": "88-99"},
      {"min": 111, "max": 135, "classificacao": "SINTOMATOLOGIA DEPRESSIVA SEVERA", "percentil_range": "99"}
    ]
  }$$::jsonb,

  -- ========================================================================
  -- INTERPRETACAO
  -- ========================================================================
  $${
    "notas": "A EBADEP-A avalia sintomas depressivos em adultos através de 45 itens em formato de diferencial semântico (bipolar). O avaliado deve indicar como tem se sentido nas últimas duas semanas, inclusive hoje. Pontuações mais altas indicam maior sintomatologia depressiva.",
    "instrucoes_aplicacao": "Leia atentamente as duas frases opostas em cada linha e marque com um X a opção que melhor representa como você vem se sentindo em um período de duas semanas, inclusive hoje. O parêntese que você escolher deve estar mais próximo do que a frase significar.",
    "exemplos_resposta": [
      {
        "texto_esquerda": "Não tenho vontade de chorar",
        "texto_direita": "Tenho sentido vontade de chorar",
        "marcacao": 0,
        "descricao": "Se você não tem vontade de chorar, marque a primeira opção (mais próxima da frase da esquerda)"
      },
      {
        "texto_esquerda": "Não tenho vontade de chorar",
        "texto_direita": "Tenho sentido vontade de chorar",
        "marcacao": 1,
        "descricao": "Se você tem pouca vontade de chorar, marque a segunda opção"
      },
      {
        "texto_esquerda": "Não tenho vontade de chorar",
        "texto_direita": "Tenho sentido vontade de chorar",
        "marcacao": 2,
        "descricao": "Se você tem sentido vontade de chorar, marque a terceira opção"
      },
      {
        "texto_esquerda": "Não tenho vontade de chorar",
        "texto_direita": "Tenho sentido vontade de chorar",
        "marcacao": 3,
        "descricao": "Se você tem sentido muita vontade de chorar, marque a quarta opção (mais próxima da frase da direita)"
      }
    ],
    "faixas": [
      {
        "pontuacao_min": 0,
        "pontuacao_max": 59,
        "classificacao": "SINTOMATOLOGIA DEPRESSIVA",
        "descricao": "Sintomas depressivos dentro da faixa esperada para população geral. Níveis normais de sintomatologia depressiva que não indicam necessariamente quadro clínico.",
        "recomendacao": "Monitoramento de rotina. Sem indicação de intervenção específica neste momento."
      },
      {
        "pontuacao_min": 60,
        "pontuacao_max": 76,
        "classificacao": "SINTOMATOLOGIA DEPRESSIVA LEVE",
        "descricao": "Presença de sintomas depressivos em nível leve. Sintomas podem estar começando a afetar o funcionamento diário, mas ainda de forma limitada.",
        "recomendacao": "Recomenda-se avaliação clínica mais aprofundada. Monitoramento próximo e possível intervenção psicoterapêutica preventiva."
      },
      {
        "pontuacao_min": 77,
        "pontuacao_max": 110,
        "classificacao": "SINTOMATOLOGIA DEPRESSIVA MODERADA",
        "descricao": "Sintomas depressivos significativos que provavelmente estão impactando o funcionamento social, ocupacional ou outras áreas importantes da vida. Requer atenção clínica.",
        "recomendacao": "Avaliação clínica necessária. Indicação de acompanhamento psicológico e/ou psiquiátrico. Considerar intervenções terapêuticas estruturadas."
      },
      {
        "pontuacao_min": 111,
        "pontuacao_max": 135,
        "classificacao": "SINTOMATOLOGIA DEPRESSIVA SEVERA",
        "descricao": "Sintomas depressivos graves que estão causando prejuízo significativo no funcionamento diário. Quadro clínico importante que requer intervenção imediata.",
        "recomendacao": "Intervenção clínica urgente necessária. Encaminhamento imediato para avaliação psiquiátrica. Acompanhamento multiprofissional intensivo. Considerar possibilidade de ideação suicida (especialmente item 29)."
      }
    ],
    "alertas_clinicos": [
      {
        "item": 29,
        "conteudo": "Ideação suicida",
        "acao": "Se pontuação 2 ou 3: avaliar risco de suicídio imediatamente. Não deixar o paciente sozinho. Encaminhamento urgente para serviço de emergência psiquiátrica."
      },
      {
        "item": 33,
        "conteudo": "Desvalorização da vida",
        "acao": "Se pontuação 2 ou 3: explorar cuidadosamente pensamentos sobre morte e intenção suicida."
      }
    ],
    "referencias": "Baptista, M. N. (2012). Escala Baptista de Depressão (Versão Adulto) - EBADEP-A. São Paulo: Vetor Editora."
  }$$::jsonb,

  true,
  true
);

-- ============================================================================
-- TAGS PARA CLASSIFICAÇÃO
-- ============================================================================

-- Inserir tags se não existirem
INSERT INTO tags (nome, slug, descricao, categoria, cor, icone, ordem)
VALUES
  ('Depressão', 'depressao', 'Avaliação de sintomas depressivos', 'dominio_clinico', '#2563eb', 'brain', 20),
  ('Humor', 'humor', 'Avaliação de transtornos de humor', 'dominio_clinico', '#7c3aed', 'heart', 21),
  ('Adultos', 'adultos', 'Testes para população adulta', 'populacao', '#059669', 'users', 10),
  ('Triagem', 'triagem', 'Instrumentos de triagem e rastreamento', 'instrumento', '#ea580c', 'search', 30)
ON CONFLICT (slug) DO NOTHING;

-- Associar teste às tags (usando o mais recente se houver duplicatas)
INSERT INTO testes_templates_tags (teste_template_id, tag_id)
SELECT
  (SELECT id FROM testes_templates WHERE sigla = 'EBADEP-A' ORDER BY created_at DESC LIMIT 1),
  t.id
FROM tags t
WHERE t.slug IN ('depressao', 'humor', 'adultos', 'triagem')
ON CONFLICT (teste_template_id, tag_id) DO NOTHING;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar inserção
SELECT
  sigla,
  nome,
  tipo,
  jsonb_array_length(questoes) as total_questoes,
  faixa_etaria_min,
  tempo_medio_aplicacao,
  ativo
FROM testes_templates
WHERE sigla = 'EBADEP-A';

-- Verificar tags associadas
SELECT
  tt.sigla,
  tt.nome,
  array_agg(t.nome) as tags
FROM testes_templates tt
JOIN testes_templates_tags ttt ON tt.id = ttt.teste_template_id
JOIN tags t ON t.id = ttt.tag_id
WHERE tt.sigla = 'EBADEP-A'
GROUP BY tt.sigla, tt.nome;
