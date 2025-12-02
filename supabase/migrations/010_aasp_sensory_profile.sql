-- ===================================
-- MIGRATION 010: Perfil Sensorial do Adulto/Adolescente (AASP)
-- NeuroTest Platform Database
-- 60 itens, 4 quadrantes sensoriais
-- ===================================

-- ===================================
-- ADD SENSORY PROCESSING TAG
-- ===================================

INSERT INTO tags (nome, slug, descricao, categoria, cor, icone, ordem) VALUES
('Processamento Sensorial', 'processamento-sensorial', 'Avaliação do processamento e perfil sensorial', 'dominio_clinico', '#06b6d4', 'eye', 12)
ON CONFLICT (slug) DO NOTHING;

-- ===================================
-- AASP - Perfil Sensorial do Adulto/Adolescente
-- 60 items, Likert 1-5, 4 quadrantes
-- ===================================

-- Delete if exists (from partial migration)
DELETE FROM testes_templates WHERE id = '550e8400-e29b-41d4-a716-446655440301';

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
  '550e8400-e29b-41d4-a716-446655440301',
  'Perfil Sensorial',
  'Perfil Sensorial do Adulto/Adolescente',
  'AASP',
  '1.0',
  'Catana Brown, Ph.D, OTR, FAOTA & Winnie Dunn, PhD, OTR, FAOTA',
  'escala_likert',
  11,
  99,
  20,
  ARRAY['presencial', 'remota'],
  $$[
    {"numero": 1, "texto": "Saio ou mudo para outra parte da loja (por ex., produtos para banho, velas, perfumes)", "secao": "processamento_tatil_olfativo", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Acrescento temperos na minha comida", "secao": "processamento_tatil_olfativo", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Não sinto cheiros que outras pessoas sentem", "secao": "processamento_tatil_olfativo", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "Gosto de estar próximo(a) a pessoas usando perfume", "secao": "processamento_tatil_olfativo", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "Só como comidas familiares", "secao": "processamento_tatil_olfativo", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Muitas comidas parecem sem sabor para mim (em outras palavras, parece sem graça ou não tem muito sabor)", "secao": "processamento_tatil_olfativo", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "Não gosto de balas de sabor muito forte (por ex., canela forte ou azedas)", "secao": "processamento_tatil_olfativo", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "Vou cheirar flores frescas quando as vejo", "secao": "processamento_tatil_olfativo", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "Tenho medo de alturas", "secao": "processamento_movimento", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Gosto da sensação de movimento (dançar, correr, por ex.)", "secao": "processamento_movimento", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "Evito elevadores e escadas rolantes porque não gosto de movimento", "secao": "processamento_movimento", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "Tropeço nas coisas", "secao": "processamento_movimento", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "Não gosto do movimento de andar de carro", "secao": "processamento_movimento", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "Escolho me envolver em atividades físicas", "secao": "processamento_movimento", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "Não me sinto muito seguro(a) quando descendo ou subindo escadas (por ex., tropeço, perco o equilíbrio, seguro no corrimão)", "secao": "processamento_movimento", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "Fico tonto(a) facilmente (por ex., após me curvar ou levantar muito rapidamente)", "secao": "processamento_movimento", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "Gosto de ir a lugares com iluminação brilhante e que são coloridos", "secao": "processamento_visual", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "Mantenho as persianas fechadas durante o dia", "secao": "processamento_visual", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "Gosto de usar roupa muito colorida", "secao": "processamento_visual", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "Fico frustrado(a) quando tento encontrar alguma coisa em uma gaveta cheia ou sala bagunçada", "secao": "processamento_visual", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "Não vejo a rua, prédio, ou placas de salas quando tento ir a um lugar novo", "secao": "processamento_visual", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "Imagens visuais que se movem rapidamente no cinema ou TV me incomodam", "secao": "processamento_visual", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "Não noto quando pessoas entram na sala", "secao": "processamento_visual", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "Escolho fazer compras em lojas menores porque me desoriento em lojas grandes", "secao": "processamento_visual", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "Incomoda-me quando há muito movimento ao meu redor (por ex., shopping cheio, desfile, parquinho)", "secao": "processamento_visual", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25},
    {"numero": 26, "texto": "Limito as distrações enquanto trabalho (por ex., fecho a porta ou desligo a TV)", "secao": "processamento_visual", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26},
    {"numero": 27, "texto": "Não gosto que me esfreguem as costas", "secao": "processamento_tatil", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 27},
    {"numero": 28, "texto": "Gosto da sensação quando corto o cabelo", "secao": "processamento_tatil", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 28},
    {"numero": 29, "texto": "Evito ou uso luvas em atividades que vão sujar as minhas mãos", "secao": "processamento_tatil", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29},
    {"numero": 30, "texto": "Toco outros enquanto falo (por ex., ponho minha mão em seus ombros ou sacudo suas mãos)", "secao": "processamento_tatil", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30},
    {"numero": 31, "texto": "Incomoda-me o modo que sinto minha boca quando acordo", "secao": "processamento_tatil", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31},
    {"numero": 32, "texto": "Gosto de andar descalço(a)", "secao": "processamento_tatil", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32},
    {"numero": 33, "texto": "Sinto-me mal usando alguns tecidos (por ex., lã, seda, veludo cotelê, etiquetas em roupas)", "secao": "processamento_tatil", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33},
    {"numero": 34, "texto": "Não gosto de certas texturas de alimentos (por ex., pêssegos com casca, purê de maçã, queijo cottage, pasta de amendoim crocante)", "secao": "processamento_tatil", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 34},
    {"numero": 35, "texto": "Afasto-me quando chegam muito perto de mim", "secao": "processamento_tatil", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35},
    {"numero": 36, "texto": "Não pareço notar quando meu rosto e mãos estão sujos", "secao": "processamento_tatil", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 36},
    {"numero": 37, "texto": "Arranho-me ou tenho marcas roxas mas não me lembro como os fiz", "secao": "processamento_tatil", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 37},
    {"numero": 38, "texto": "Evito ficar em filas ou ficar próximo(a) a outras pessoas porque não gosto de ficar próximo(a) demais dos outros", "secao": "processamento_tatil", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 38},
    {"numero": 39, "texto": "Não pareço notar quando alguém toca meu braço ou costas", "secao": "processamento_tatil", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39},
    {"numero": 40, "texto": "Trabalho em duas ou mais tarefas ao mesmo tempo", "secao": "nivel_atividade", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 40},
    {"numero": 41, "texto": "Levo mais tempo que outras pessoas para acordar de manhã", "secao": "nivel_atividade", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41},
    {"numero": 42, "texto": "Faço as coisas de improviso (em outras palavras, faço coisas sem planejar antes)", "secao": "nivel_atividade", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42},
    {"numero": 43, "texto": "Acho tempo para me afastar da minha vida ocupada e passar tempo sozinho(a)", "secao": "nivel_atividade", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43},
    {"numero": 44, "texto": "Pareço mais lento(a) que outros quando tento seguir uma atividade ou tarefa", "secao": "nivel_atividade", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 44},
    {"numero": 45, "texto": "Não pego piadas tão rapidamente quanto outros", "secao": "nivel_atividade", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45},
    {"numero": 46, "texto": "Afasto-me de multidões", "secao": "nivel_atividade", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 46},
    {"numero": 47, "texto": "Acho atividades para fazer em frente a outros (por ex., música, esportes, falar em público e responder perguntas em aula)", "secao": "nivel_atividade", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 47},
    {"numero": 48, "texto": "Acho difícil me concentrar por todo o tempo em uma aula ou reunião longos", "secao": "nivel_atividade", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 48},
    {"numero": 49, "texto": "Evito situações em que possam acontecer coisas inesperadas (por ex., ir a lugares não familiares ou estar perto de pessoas que não conheço)", "secao": "nivel_atividade", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 49},
    {"numero": 50, "texto": "Cantarolo, assobio, canto ou faço outros barulhos", "secao": "processamento_auditivo", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 50},
    {"numero": 51, "texto": "Assusto-me facilmente com sons altos ou inesperados (por ex., aspirador de pó, cachorro latindo, telefone tocando)", "secao": "processamento_auditivo", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 51},
    {"numero": 52, "texto": "Tenho dificuldade em seguir o que as pessoas estão falando quando falam rapidamente ou sobre assuntos não familiares", "secao": "processamento_auditivo", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 52},
    {"numero": 53, "texto": "Saio da sala quando outros assistem TV ou peço a eles que desliguem", "secao": "processamento_auditivo", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 53},
    {"numero": 54, "texto": "Distraio-me se há muito barulho em volta", "secao": "processamento_auditivo", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 54},
    {"numero": 55, "texto": "Não noto quando meu nome é chamado", "secao": "processamento_auditivo", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 55},
    {"numero": 56, "texto": "Uso estratégias para abafar sons (por ex., fecho a porta, cubro os ouvidos, uso protetores de ouvido)", "secao": "processamento_auditivo", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 56},
    {"numero": 57, "texto": "Fico longe de ambientes barulhentos", "secao": "processamento_auditivo", "quadrante": "evita_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 57},
    {"numero": 58, "texto": "Gosto de ir a lugares com muita música", "secao": "processamento_auditivo", "quadrante": "procura_sensacao", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 58},
    {"numero": 59, "texto": "Tenho que pedir a pessoas que repitam coisas", "secao": "processamento_auditivo", "quadrante": "baixo_registro", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 59},
    {"numero": 60, "texto": "Acho difícil trabalhar com barulho de fundo (por ex., ventilador, rádio)", "secao": "processamento_auditivo", "quadrante": "sensitividade_sensorial", "tipo_resposta": "likert_1_5", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 60}
  ]$$::jsonb,
  $${
    "likert_1_5": [
      {"valor": 1, "texto": "Quase nunca"},
      {"valor": 2, "texto": "Raramente"},
      {"valor": 3, "texto": "Ocasionalmente"},
      {"valor": 4, "texto": "Frequentemente"},
      {"valor": 5, "texto": "Quase sempre"}
    ]
  }$$::jsonb,
  $${
    "tipo": "quadrantes",
    "quadrantes": {
      "baixo_registro": {
        "nome": "Baixo Registro",
        "descricao": "Indica dificuldade em perceber estímulos sensoriais. Pessoas com alto escore neste quadrante podem parecer desatentas ou não reagir a estímulos do ambiente.",
        "questoes": [3, 6, 12, 15, 21, 23, 36, 37, 39, 41, 44, 45, 52, 55, 59],
        "peso": 1
      },
      "procura_sensacao": {
        "nome": "Procura Sensação",
        "descricao": "Indica busca ativa por experiências sensoriais. Pessoas com alto escore neste quadrante procuram ativamente estímulos sensoriais intensos.",
        "questoes": [2, 4, 8, 10, 14, 17, 19, 28, 30, 32, 40, 42, 47, 50, 58],
        "peso": 1
      },
      "sensitividade_sensorial": {
        "nome": "Sensitividade Sensorial",
        "descricao": "Indica alta percepção de estímulos sensoriais. Pessoas com alto escore neste quadrante detectam mais estímulos que a maioria e podem se sentir sobrecarregadas.",
        "questoes": [7, 9, 13, 16, 20, 22, 25, 27, 31, 33, 34, 48, 51, 54, 60],
        "peso": 1
      },
      "evita_sensacao": {
        "nome": "Evita Sensação",
        "descricao": "Indica comportamentos de evitação de estímulos sensoriais. Pessoas com alto escore neste quadrante ativamente evitam ou limitam sua exposição a estímulos sensoriais.",
        "questoes": [1, 5, 11, 18, 24, 26, 29, 35, 38, 43, 46, 49, 53, 56, 57],
        "peso": 1
      }
    },
    "secoes_sensoriais": {
      "processamento_tatil_olfativo": {
        "nome": "Processamento Tátil/Olfativo",
        "questoes": [1, 2, 3, 4, 5, 6, 7, 8]
      },
      "processamento_movimento": {
        "nome": "Processamento de Movimento",
        "questoes": [9, 10, 11, 12, 13, 14, 15, 16]
      },
      "processamento_visual": {
        "nome": "Processamento Visual",
        "questoes": [17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
      },
      "processamento_tatil": {
        "nome": "Processamento Tátil",
        "questoes": [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]
      },
      "nivel_atividade": {
        "nome": "Nível de Atividade",
        "questoes": [40, 41, 42, 43, 44, 45, 46, 47, 48, 49]
      },
      "processamento_auditivo": {
        "nome": "Processamento Auditivo",
        "questoes": [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
      }
    },
    "score_total": "soma_quadrantes",
    "max_por_quadrante": 75
  }$$::jsonb,
  $${
    "faixas_etarias": {
      "adolescente": {
        "idade_min": 11,
        "idade_max": 17,
        "quadrantes": {
          "baixo_registro": {
            "muito_menos": {"min": 15, "max": 18},
            "menos": {"min": 19, "max": 26},
            "semelhante": {"min": 27, "max": 40},
            "mais": {"min": 41, "max": 51},
            "muito_mais": {"min": 52, "max": 75}
          },
          "procura_sensacao": {
            "muito_menos": {"min": 15, "max": 27},
            "menos": {"min": 28, "max": 41},
            "semelhante": {"min": 42, "max": 58},
            "mais": {"min": 59, "max": 65},
            "muito_mais": {"min": 66, "max": 75}
          },
          "sensitividade_sensorial": {
            "muito_menos": {"min": 15, "max": 19},
            "menos": {"min": 20, "max": 25},
            "semelhante": {"min": 26, "max": 40},
            "mais": {"min": 41, "max": 48},
            "muito_mais": {"min": 49, "max": 75}
          },
          "evita_sensacao": {
            "muito_menos": {"min": 15, "max": 18},
            "menos": {"min": 19, "max": 25},
            "semelhante": {"min": 26, "max": 40},
            "mais": {"min": 41, "max": 48},
            "muito_mais": {"min": 49, "max": 75}
          }
        }
      },
      "adulto": {
        "idade_min": 18,
        "idade_max": 64,
        "quadrantes": {
          "baixo_registro": {
            "muito_menos": {"min": 15, "max": 18},
            "menos": {"min": 19, "max": 23},
            "semelhante": {"min": 24, "max": 35},
            "mais": {"min": 36, "max": 44},
            "muito_mais": {"min": 45, "max": 75}
          },
          "procura_sensacao": {
            "muito_menos": {"min": 15, "max": 35},
            "menos": {"min": 36, "max": 42},
            "semelhante": {"min": 43, "max": 56},
            "mais": {"min": 57, "max": 62},
            "muito_mais": {"min": 63, "max": 75}
          },
          "sensitividade_sensorial": {
            "muito_menos": {"min": 15, "max": 18},
            "menos": {"min": 19, "max": 25},
            "semelhante": {"min": 26, "max": 41},
            "mais": {"min": 42, "max": 48},
            "muito_mais": {"min": 49, "max": 75}
          },
          "evita_sensacao": {
            "muito_menos": {"min": 15, "max": 19},
            "menos": {"min": 20, "max": 26},
            "semelhante": {"min": 27, "max": 41},
            "mais": {"min": 42, "max": 49},
            "muito_mais": {"min": 50, "max": 75}
          }
        }
      },
      "idoso": {
        "idade_min": 65,
        "idade_max": 99,
        "quadrantes": {
          "baixo_registro": {
            "muito_menos": {"min": 15, "max": 19},
            "menos": {"min": 20, "max": 26},
            "semelhante": {"min": 27, "max": 40},
            "mais": {"min": 41, "max": 51},
            "muito_mais": {"min": 52, "max": 75}
          },
          "procura_sensacao": {
            "muito_menos": {"min": 15, "max": 28},
            "menos": {"min": 29, "max": 39},
            "semelhante": {"min": 40, "max": 52},
            "mais": {"min": 53, "max": 63},
            "muito_mais": {"min": 64, "max": 75}
          },
          "sensitividade_sensorial": {
            "muito_menos": {"min": 15, "max": 18},
            "menos": {"min": 19, "max": 25},
            "semelhante": {"min": 26, "max": 41},
            "mais": {"min": 42, "max": 48},
            "muito_mais": {"min": 49, "max": 75}
          },
          "evita_sensacao": {
            "muito_menos": {"min": 15, "max": 18},
            "menos": {"min": 19, "max": 25},
            "semelhante": {"min": 26, "max": 42},
            "mais": {"min": 43, "max": 49},
            "muito_mais": {"min": 50, "max": 75}
          }
        }
      }
    },
    "classificacoes": {
      "muito_menos": {
        "nome": "Muito menos que a maioria das pessoas",
        "simbolo": "--",
        "descricao": "Pontuação significativamente abaixo da média populacional para este quadrante."
      },
      "menos": {
        "nome": "Menos que a maioria das pessoas",
        "simbolo": "-",
        "descricao": "Pontuação abaixo da média populacional para este quadrante."
      },
      "semelhante": {
        "nome": "Semelhante à maioria das pessoas",
        "simbolo": "=",
        "descricao": "Pontuação dentro da faixa típica da população para este quadrante."
      },
      "mais": {
        "nome": "Mais que a maioria das pessoas",
        "simbolo": "+",
        "descricao": "Pontuação acima da média populacional para este quadrante."
      },
      "muito_mais": {
        "nome": "Muito mais que a maioria das pessoas",
        "simbolo": "++",
        "descricao": "Pontuação significativamente acima da média populacional para este quadrante."
      }
    },
    "notas": "O Perfil Sensorial do Adulto/Adolescente (AASP) avalia padrões de processamento sensorial em quatro quadrantes baseados no Modelo de Processamento Sensorial de Dunn. Os resultados ajudam a compreender como a pessoa responde a experiências sensoriais do dia a dia e podem informar estratégias de adaptação ambiental e ocupacional."
  }$$::jsonb,
  true,
  true
);

-- ===================================
-- ASSOCIATE TEST WITH TAGS
-- ===================================

DO $$
DECLARE
  tag_adultos_id UUID;
  tag_adolescentes_id UUID;
  tag_sensorial_id UUID;
  tag_escala_id UUID;
BEGIN
  SELECT id INTO tag_adultos_id FROM tags WHERE slug = 'adultos';
  SELECT id INTO tag_adolescentes_id FROM tags WHERE slug = 'adolescentes';
  SELECT id INTO tag_sensorial_id FROM tags WHERE slug = 'processamento-sensorial';
  SELECT id INTO tag_escala_id FROM tags WHERE slug = 'escala-autorelato';

  -- AASP tags
  INSERT INTO testes_templates_tags (teste_template_id, tag_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440301', tag_adultos_id),
    ('550e8400-e29b-41d4-a716-446655440301', tag_adolescentes_id),
    ('550e8400-e29b-41d4-a716-446655440301', tag_sensorial_id),
    ('550e8400-e29b-41d4-a716-446655440301', tag_escala_id)
  ON CONFLICT DO NOTHING;
END $$;
