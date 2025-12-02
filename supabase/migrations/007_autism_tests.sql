-- ===================================
-- MIGRATION 007: Autism Assessment Tests
-- NeuroTest Platform Database
-- CAT-Q, RBQ-2A, AQ-50
-- ===================================

-- ===================================
-- ADD AUTISM TAG
-- ===================================

INSERT INTO tags (nome, slug, descricao, categoria, cor, icone, ordem) VALUES
('Autismo', 'autismo', 'Avaliação do espectro do autismo e características autísticas', 'dominio_clinico', '#7c3aed', 'puzzle', 11)
ON CONFLICT (slug) DO NOTHING;

-- ===================================
-- CAT-Q - Camouflaging Autistic Traits Questionnaire
-- 25 items, Likert 1-7 scale, cut score: 100 points
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
  '550e8400-e29b-41d4-a716-446655440201',
  'CAT-Q',
  'Camouflaging Autistic Traits Questionnaire',
  'CAT-Q',
  '1.0',
  'Hull, L., Mandy, W., Lai, M. C., Baron-Cohen, S., Allison, C., Smith, P., & Petrides, K. V.',
  'escala_likert',
  16,
  99,
  10,
  ARRAY['presencial', 'remota'],
  $$[
    {"numero": 1, "texto": "When I am interacting with someone, I deliberately copy their body language or facial expressions", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "I monitor my body language or facial expressions so that I appear relaxed", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "I rarely feel the need to put on an act in order to get through a social situation", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "I have developed a script to follow in social situations (for example, a list of questions or topics of conversation)", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "I adjust my body language or facial expressions so that I appear interested by the person I am interacting with", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "I do not need to hide the fact that I have difficulty making sense of social cues from others", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "I have tried to improve my understanding of social skills by watching other people", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "I always think about the impression I make on other people", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "In social situations, I feel like I am pretending to be normal", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "I practice my facial expressions and body language to make sure they look natural", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "I monitor my body language or facial expressions so that I appear to have understood what someone is saying to me", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "I need support to play a role in social situations", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "I have spent time learning the rules of social interaction (for example, from psychology books, or through watching television programs) in order to learn how to behave with other people", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "I am always aware of the impression I make on other people", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "I feel free to be myself when I am with other people", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "I learn how people use their bodies and faces to interact by watching television or films, or by reading fiction", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "I will repeat phrases that I have heard others say in the exact same way that I first heard them in my own conversations", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "I always think about the way that I look when I am with others", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "When in social situations, I try to find ways to avoid interacting with others", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "I have to force myself to interact with people when I am in social situations", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "In my own home I often feel free to be myself", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "I research the rules of social interaction (for example, by using the internet) in order to be more knowledgeable in how to interact with other people", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "I use behaviors that I have learned from watching other people interacting in my own social interactions", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "I watch and observe others before attempting to interact with them", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "In social interactions, I do not put on an act", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 25}
  ]$$::jsonb,
  $${
    "likert_1_7": [
      {"valor": 1, "texto": "Strongly Disagree"},
      {"valor": 2, "texto": "Disagree"},
      {"valor": 3, "texto": "Somewhat Disagree"},
      {"valor": 4, "texto": "Neither Agree nor Disagree"},
      {"valor": 5, "texto": "Somewhat Agree"},
      {"valor": 6, "texto": "Agree"},
      {"valor": 7, "texto": "Strongly Agree"}
    ]
  }$$::jsonb,
  $${
    "tipo": "secoes",
    "secoes": {
      "compensation": {
        "nome": "Compensation",
        "descricao": "Strategies used to actively compensate for difficulties in social situations",
        "questoes": [1, 4, 7, 10, 13, 16, 17, 22, 23, 24],
        "invertidas": [],
        "peso": 1
      },
      "masking": {
        "nome": "Masking",
        "descricao": "Strategies to hide autistic characteristics in social situations",
        "questoes": [2, 5, 8, 11, 14, 18],
        "invertidas": [],
        "peso": 1
      },
      "assimilation": {
        "nome": "Assimilation",
        "descricao": "Strategies to try to fit in with others in social situations",
        "questoes": [3, 6, 9, 12, 15, 19, 20, 21, 25],
        "invertidas": [3, 6, 15, 21, 25],
        "peso": 1
      }
    },
    "score_total": "soma_secoes",
    "ponto_corte": 100,
    "nota_inversao": "Items 3, 6, 15, 21, 25 are reverse scored (8 - response)"
  }$$::jsonb,
  $${
    "faixas": [
      {
        "pontuacao_min": 25,
        "pontuacao_max": 99,
        "classificacao": "Below clinical threshold",
        "descricao": "Score below the cut-off indicates lower levels of camouflaging behaviors."
      },
      {
        "pontuacao_min": 100,
        "pontuacao_max": 175,
        "classificacao": "Above clinical threshold",
        "descricao": "Score at or above cut-off (100) suggests significant camouflaging behaviors often associated with autism. Higher scores indicate more extensive camouflaging."
      }
    ],
    "subescalas": {
      "compensation": {
        "descricao": "Measures active strategies used to compensate for social difficulties, such as learning social rules from books or media.",
        "max_pontos": 70
      },
      "masking": {
        "descricao": "Measures behaviors aimed at hiding autistic characteristics, like monitoring body language to appear normal.",
        "max_pontos": 42
      },
      "assimilation": {
        "descricao": "Measures the need to fit in and feelings of performing in social situations.",
        "max_pontos": 63
      }
    },
    "notas": "The CAT-Q measures social camouflaging, which refers to strategies used to mask or compensate for autistic traits. High scores indicate extensive use of camouflaging strategies."
  }$$::jsonb,
  true,
  true
);

-- ===================================
-- RBQ-2A - Adult Repetitive Behaviours Questionnaire
-- 20 items, mixed scales, cut score: 36 points
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
  '550e8400-e29b-41d4-a716-446655440202',
  'RBQ-2A',
  'Adult Repetitive Behaviours Questionnaire',
  'RBQ-2A',
  '2.0',
  'Barrett, S. L., Uljarevic, M., Baker, E. K., Richdale, A. L., Jones, C. R., & Leekam, S. R.',
  'escala_likert',
  18,
  99,
  10,
  ARRAY['presencial', 'remota'],
  $$[
    {"numero": 1, "texto": "Do you like to arrange items in rows or patterns?", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Do you repetitively fiddle with items? (e.g. spin, twiddle, bang, tap, twist, or flick anything repeatedly?)", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Do you spin yourself around and around?", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "Do you rock backwards and forwards, or side to side, either when sitting or when standing?", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "Do you pace or move around repetitively (e.g. walk to and fro across a room, or along the same path over and over)?", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Do you make repetitive hand and/or finger movements? (e.g. finger twisting, hand flapping or other hand or finger mannerisms)", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "Have you had a fascination, or a strong interest for specific objects or parts of objects, other than those you might use for your hobbies or work? (e.g. trains, road signs, or specific toys or objects)", "secao": "restricted_interests", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "Do you have a strong interest, or fascination with numbers, letters, or symbols? (e.g. number plates, maps, dates)", "secao": "restricted_interests", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "Do you have any special interests or topics that might appear unusual to others in terms of their focus or intensity? (e.g. collecting certain items or learning everything you can about a specific topic)", "secao": "restricted_interests", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Do you like to do everyday tasks the same way every time you do them, following exactly the same routine, or steps, each time?", "secao": "insistence_sameness", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "Would you notice if something had been moved from its usual position, or become upset about having to change where things are kept?", "secao": "insistence_sameness", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "Do you insist on keeping to the same everyday schedule and become upset about changes to your daily routine?", "secao": "insistence_sameness", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "Do you have any sensory interests, including looking at things closely, sniffing people, objects or food, or listening to specific sounds?", "secao": "sensory_interests", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "Do you have any strong attachment to (or need to carry around) specific items (other than ones that are necessary for work or hobbies)? (e.g. a book or small toy)", "secao": "restricted_interests", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "How upset do you become if prevented from, or interrupted while performing, everyday routines or tasks?", "secao": "insistence_sameness", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "How upset do you become if your surroundings are changed, or if there are changes to the position of things?", "secao": "insistence_sameness", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "How difficult would you find it if you had to change your everyday routine (e.g. having to do things at a different time, or do things in a different order)?", "secao": "insistence_sameness", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "When you become overly interested, or focused on something, how difficult is it for you to stop and do something else?", "secao": "restricted_interests", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "How difficult is it to change from one activity to another?", "secao": "insistence_sameness", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "How difficult do you find it when something unexpected happens?", "secao": "insistence_sameness", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20}
  ]$$::jsonb,
  $${
    "likert_never_always": [
      {"valor": 0, "texto": "Never or rarely"},
      {"valor": 1, "texto": "Mild or occasional"},
      {"valor": 2, "texto": "Marked or notable"},
      {"valor": 3, "texto": "Very marked"}
    ],
    "likert_not_extremely": [
      {"valor": 0, "texto": "Not at all"},
      {"valor": 1, "texto": "Mildly"},
      {"valor": 2, "texto": "Moderately"},
      {"valor": 3, "texto": "Extremely"}
    ]
  }$$::jsonb,
  $${
    "tipo": "secoes",
    "secoes": {
      "repetitive_motor": {
        "nome": "Repetitive Motor Behaviours",
        "descricao": "Stereotyped and repetitive motor movements",
        "questoes": [1, 2, 3, 4, 5, 6],
        "invertidas": [],
        "peso": 1
      },
      "restricted_interests": {
        "nome": "Restricted Interests",
        "descricao": "Highly focused interests and preoccupations",
        "questoes": [7, 8, 9, 14, 18],
        "invertidas": [],
        "peso": 1
      },
      "insistence_sameness": {
        "nome": "Insistence on Sameness",
        "descricao": "Need for routine and resistance to change",
        "questoes": [10, 11, 12, 15, 16, 17, 19, 20],
        "invertidas": [],
        "peso": 1
      },
      "sensory_interests": {
        "nome": "Sensory Interests",
        "descricao": "Unusual sensory-seeking behaviors",
        "questoes": [13],
        "invertidas": [],
        "peso": 1
      }
    },
    "score_total": "soma_secoes",
    "ponto_corte": 36
  }$$::jsonb,
  $${
    "faixas": [
      {
        "pontuacao_min": 0,
        "pontuacao_max": 35,
        "classificacao": "Below clinical threshold",
        "descricao": "Score below cut-off indicates lower levels of repetitive behaviors."
      },
      {
        "pontuacao_min": 36,
        "pontuacao_max": 60,
        "classificacao": "Above clinical threshold",
        "descricao": "Score at or above cut-off (36) suggests clinically significant levels of repetitive behaviors often associated with autism spectrum conditions."
      }
    ],
    "subescalas": {
      "repetitive_motor": {
        "descricao": "Assesses stereotyped and repetitive motor movements such as hand flapping, rocking, and repetitive manipulation of objects.",
        "max_pontos": 18
      },
      "restricted_interests": {
        "descricao": "Assesses circumscribed interests, fascinations, and attachment to objects.",
        "max_pontos": 15
      },
      "insistence_sameness": {
        "descricao": "Assesses need for routine, resistance to change, and difficulty with transitions.",
        "max_pontos": 24
      },
      "sensory_interests": {
        "descricao": "Assesses unusual sensory-seeking behaviors including sniffing, looking closely, or listening to specific sounds.",
        "max_pontos": 3
      }
    },
    "notas": "The RBQ-2A measures restricted and repetitive behaviors which are a core feature of autism spectrum conditions."
  }$$::jsonb,
  true,
  true
);

-- ===================================
-- AQ-50 - Autism Spectrum Quotient
-- 50 items, agree/disagree scale, cut score: 32 points
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
  '550e8400-e29b-41d4-a716-446655440203',
  'AQ-50',
  'Autism Spectrum Quotient (50 items)',
  'AQ-50',
  '1.0',
  'Baron-Cohen, S., Wheelwright, S., Skinner, R., Martin, J., & Clubley, E.',
  'escala_likert',
  16,
  99,
  15,
  ARRAY['presencial', 'remota'],
  $$[
    {"numero": 1, "texto": "I prefer to do things with others rather than on my own", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "I prefer to do things the same way over and over again", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "If I try to imagine something, I find it very easy to create a picture in my mind", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "I frequently get so strongly absorbed in one thing that I lose sight of other things", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "I often notice small sounds when others do not", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "I usually notice car number plates or similar strings of information", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "Other people frequently tell me that what I have said is impolite, even though I think it is polite", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "When I am reading a story, I can easily imagine what the characters might look like", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "I am fascinated by dates", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "In a social group, I can easily keep track of several different peoples conversations", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "I find social situations easy", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "I tend to notice details that others do not", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "I would rather go to a library than a party", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "I find making up stories easy", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "I find myself drawn more strongly to people than to things", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "I tend to have very strong interests, which I get upset about if I cannot pursue", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "I enjoy social chit-chat", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "When I talk, it is not always easy for others to get a word in edgeways", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "I am fascinated by numbers", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "When I am reading a story, I find it difficult to work out the characters intentions", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "I do not particularly enjoy reading fiction", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "I find it hard to make new friends", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "I notice patterns in things all the time", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "I would rather go to the theatre than a museum", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "It does not upset me if my daily routine is disturbed", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 25},
    {"numero": 26, "texto": "I frequently find that I do not know how to keep a conversation going", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26},
    {"numero": 27, "texto": "I find it easy to read between the lines when someone is talking to me", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 27},
    {"numero": 28, "texto": "I usually concentrate more on the whole picture, rather than the small details", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 28},
    {"numero": 29, "texto": "I am not very good at remembering phone numbers", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 29},
    {"numero": 30, "texto": "I do not usually notice small changes in a situation, or a persons appearance", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 30},
    {"numero": 31, "texto": "I know how to tell if someone listening to me is getting bored", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 31},
    {"numero": 32, "texto": "I find it easy to do more than one thing at once", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 32},
    {"numero": 33, "texto": "When I talk on the phone, I am not sure when it is my turn to speak", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33},
    {"numero": 34, "texto": "I enjoy doing things spontaneously", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 34},
    {"numero": 35, "texto": "I am often the last to understand the point of a joke", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35},
    {"numero": 36, "texto": "I find it easy to work out what someone is thinking or feeling just by looking at their face", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 36},
    {"numero": 37, "texto": "If there is an interruption, I can switch back to what I was doing very quickly", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 37},
    {"numero": 38, "texto": "I am good at social chit-chat", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 38},
    {"numero": 39, "texto": "People often tell me that I keep going on and on about the same thing", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39},
    {"numero": 40, "texto": "When I was young, I used to enjoy playing games involving pretending with other children", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 40},
    {"numero": 41, "texto": "I like to collect information about categories of things (e.g. types of car, types of bird, types of train, types of plant, etc.)", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41},
    {"numero": 42, "texto": "I find it difficult to imagine what it would be like to be someone else", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42},
    {"numero": 43, "texto": "I like to plan any activities I participate in carefully", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43},
    {"numero": 44, "texto": "I enjoy social occasions", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 44},
    {"numero": 45, "texto": "I find it difficult to work out peoples intentions", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45},
    {"numero": 46, "texto": "New situations make me anxious", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 46},
    {"numero": 47, "texto": "I enjoy meeting new people", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 47},
    {"numero": 48, "texto": "I am a good diplomat", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 48},
    {"numero": 49, "texto": "I am not very good at remembering peoples date of birth", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 49},
    {"numero": 50, "texto": "I find it very easy to play games with children that involve pretending", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 50}
  ]$$::jsonb,
  $${
    "likert_agree_4": [
      {"valor": 0, "texto": "Definitely Agree"},
      {"valor": 1, "texto": "Slightly Agree"},
      {"valor": 2, "texto": "Slightly Disagree"},
      {"valor": 3, "texto": "Definitely Disagree"}
    ]
  }$$::jsonb,
  $${
    "tipo": "secoes",
    "secoes": {
      "social_skill": {
        "nome": "Social Skill",
        "descricao": "Difficulty with social interactions and preference for solitary activities",
        "questoes": [1, 11, 13, 15, 22, 38, 44, 45, 47, 48],
        "invertidas": [1, 11, 15, 38, 44, 47, 48],
        "peso": 1
      },
      "attention_switching": {
        "nome": "Attention Switching",
        "descricao": "Difficulty switching attention and preference for routine",
        "questoes": [2, 4, 10, 16, 25, 32, 34, 37, 43, 46],
        "invertidas": [10, 25, 32, 34, 37],
        "peso": 1
      },
      "attention_to_detail": {
        "nome": "Attention to Detail",
        "descricao": "Heightened attention to details, patterns, and information",
        "questoes": [5, 6, 9, 12, 19, 23, 28, 29, 30, 41, 49],
        "invertidas": [28, 29, 30, 49],
        "peso": 1
      },
      "communication": {
        "nome": "Communication",
        "descricao": "Difficulties with communication and conversation",
        "questoes": [7, 17, 18, 26, 27, 31, 33, 35, 39],
        "invertidas": [17, 27, 31],
        "peso": 1
      },
      "imagination": {
        "nome": "Imagination",
        "descricao": "Difficulties with imagination and understanding others perspectives",
        "questoes": [3, 8, 14, 20, 21, 24, 36, 40, 42, 50],
        "invertidas": [3, 8, 14, 24, 36, 40, 50],
        "peso": 1
      }
    },
    "score_total": "soma_binaria",
    "ponto_corte": 32,
    "nota_pontuacao": "Scoring: For non-reversed items, 1 point for Slightly Agree or Definitely Agree. For reversed items, 1 point for Slightly Disagree or Definitely Disagree. Each item scores 0 or 1, maximum total = 50."
  }$$::jsonb,
  $${
    "faixas": [
      {
        "pontuacao_min": 0,
        "pontuacao_max": 25,
        "classificacao": "Low",
        "descricao": "Score indicates lower levels of autistic traits, typical of the general population."
      },
      {
        "pontuacao_min": 26,
        "pontuacao_max": 31,
        "classificacao": "Borderline",
        "descricao": "Score indicates above average levels of autistic traits. May warrant further investigation if combined with other concerns."
      },
      {
        "pontuacao_min": 32,
        "pontuacao_max": 50,
        "classificacao": "Above clinical threshold",
        "descricao": "Score at or above cut-off (32) indicates clinically significant levels of autistic traits. 80% of adults diagnosed with autism score 32 or higher."
      }
    ],
    "subescalas": {
      "social_skill": {
        "descricao": "Assesses social interaction skills and social awareness.",
        "max_pontos": 10
      },
      "attention_switching": {
        "descricao": "Assesses flexibility of attention and preference for sameness.",
        "max_pontos": 10
      },
      "attention_to_detail": {
        "descricao": "Assesses attention to details, patterns, numbers and dates.",
        "max_pontos": 11
      },
      "communication": {
        "descricao": "Assesses conversational and communication skills.",
        "max_pontos": 9
      },
      "imagination": {
        "descricao": "Assesses imagination and ability to understand others perspectives.",
        "max_pontos": 10
      }
    },
    "notas": "The AQ-50 is a screening instrument for autistic traits in adults. A score of 32 or higher suggests a referral for diagnostic evaluation may be appropriate. 80% of people diagnosed with autism score 32+, while only 2% of the general population score at this level."
  }$$::jsonb,
  true,
  true
);

-- ===================================
-- ASSOCIATE TESTS WITH TAGS
-- ===================================

-- Get tag IDs
DO $$
DECLARE
  tag_adultos_id UUID;
  tag_autismo_id UUID;
  tag_escala_id UUID;
  tag_screening_id UUID;
BEGIN
  SELECT id INTO tag_adultos_id FROM tags WHERE slug = 'adultos';
  SELECT id INTO tag_autismo_id FROM tags WHERE slug = 'autismo';
  SELECT id INTO tag_escala_id FROM tags WHERE slug = 'escala-autorelato';
  SELECT id INTO tag_screening_id FROM tags WHERE slug = 'screening';

  -- CAT-Q tags
  INSERT INTO testes_templates_tags (teste_template_id, tag_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440201', tag_adultos_id),
    ('550e8400-e29b-41d4-a716-446655440201', tag_autismo_id),
    ('550e8400-e29b-41d4-a716-446655440201', tag_escala_id)
  ON CONFLICT DO NOTHING;

  -- RBQ-2A tags
  INSERT INTO testes_templates_tags (teste_template_id, tag_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440202', tag_adultos_id),
    ('550e8400-e29b-41d4-a716-446655440202', tag_autismo_id),
    ('550e8400-e29b-41d4-a716-446655440202', tag_escala_id)
  ON CONFLICT DO NOTHING;

  -- AQ-50 tags
  INSERT INTO testes_templates_tags (teste_template_id, tag_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440203', tag_adultos_id),
    ('550e8400-e29b-41d4-a716-446655440203', tag_autismo_id),
    ('550e8400-e29b-41d4-a716-446655440203', tag_escala_id),
    ('550e8400-e29b-41d4-a716-446655440203', tag_screening_id)
  ON CONFLICT DO NOTHING;
END $$;

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Verify tests were created
-- SELECT sigla, nome, tipo FROM testes_templates WHERE sigla IN ('CAT-Q', 'RBQ-2A', 'AQ-50');

-- Verify tags associations
-- SELECT tt.sigla, array_agg(t.nome) as tags
-- FROM testes_templates tt
-- JOIN testes_templates_tags ttt ON tt.id = ttt.teste_template_id
-- JOIN tags t ON ttt.tag_id = t.id
-- WHERE tt.sigla IN ('CAT-Q', 'RBQ-2A', 'AQ-50')
-- GROUP BY tt.sigla;
