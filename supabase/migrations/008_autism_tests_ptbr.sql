-- ===================================
-- MIGRATION 008: Atualização para Português BR
-- Testes de Avaliação do Autismo
-- CAT-Q, RBQ-2A, AQ-50
-- ===================================

-- Atualizar os testes existentes para português

-- ===================================
-- CAT-Q - Questionário de Camuflagem de Traços Autísticos
-- ===================================

UPDATE testes_templates SET
  nome = 'CAT-Q',
  nome_completo = 'Questionário de Camuflagem de Traços Autísticos',
  questoes = $$[
    {"numero": 1, "texto": "Quando estou interagindo com alguém, copio deliberadamente sua linguagem corporal ou expressões faciais", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Monitoro minha linguagem corporal ou expressões faciais para parecer relaxado(a)", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Raramente sinto necessidade de atuar para conseguir passar por uma situação social", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "Desenvolvi um roteiro a seguir em situações sociais (por exemplo, uma lista de perguntas ou tópicos de conversa)", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "Ajusto minha linguagem corporal ou expressões faciais para parecer interessado(a) pela pessoa com quem estou interagindo", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Não preciso esconder o fato de que tenho dificuldade em entender pistas sociais dos outros", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "Tentei melhorar minha compreensão de habilidades sociais observando outras pessoas", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "Sempre penso na impressão que causo nas outras pessoas", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "Em situações sociais, sinto que estou fingindo ser normal", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Pratico minhas expressões faciais e linguagem corporal para ter certeza de que parecem naturais", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "Monitoro minha linguagem corporal ou expressões faciais para parecer que entendi o que alguém está me dizendo", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "Preciso de apoio para desempenhar um papel em situações sociais", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "Dediquei tempo aprendendo as regras de interação social (por exemplo, em livros de psicologia ou assistindo programas de televisão) para aprender como me comportar com outras pessoas", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "Estou sempre consciente da impressão que causo nas outras pessoas", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "Sinto-me livre para ser eu mesmo(a) quando estou com outras pessoas", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "Aprendo como as pessoas usam seus corpos e rostos para interagir assistindo televisão, filmes ou lendo ficção", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "Repito frases que ouvi outras pessoas dizerem exatamente da mesma forma que ouvi pela primeira vez em minhas próprias conversas", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "Sempre penso na forma como pareço quando estou com outras pessoas", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "Em situações sociais, tento encontrar formas de evitar interagir com os outros", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "Tenho que me forçar a interagir com pessoas quando estou em situações sociais", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "Na minha própria casa, frequentemente me sinto livre para ser eu mesmo(a)", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "Pesquiso as regras de interação social (por exemplo, usando a internet) para ter mais conhecimento sobre como interagir com outras pessoas", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "Uso comportamentos que aprendi observando outras pessoas interagindo em minhas próprias interações sociais", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "Observo os outros antes de tentar interagir com eles", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "Em interações sociais, não finjo ser diferente do que sou", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 25}
  ]$$::jsonb,
  escalas_resposta = $${
    "likert_1_7": [
      {"valor": 1, "texto": "Discordo totalmente"},
      {"valor": 2, "texto": "Discordo"},
      {"valor": 3, "texto": "Discordo parcialmente"},
      {"valor": 4, "texto": "Nem concordo nem discordo"},
      {"valor": 5, "texto": "Concordo parcialmente"},
      {"valor": 6, "texto": "Concordo"},
      {"valor": 7, "texto": "Concordo totalmente"}
    ]
  }$$::jsonb,
  regras_calculo = $${
    "tipo": "secoes",
    "secoes": {
      "compensation": {
        "nome": "Compensação",
        "descricao": "Estratégias usadas para compensar ativamente dificuldades em situações sociais",
        "questoes": [1, 4, 7, 10, 13, 16, 17, 22, 23, 24],
        "invertidas": [],
        "peso": 1
      },
      "masking": {
        "nome": "Mascaramento",
        "descricao": "Estratégias para esconder características autísticas em situações sociais",
        "questoes": [2, 5, 8, 11, 14, 18],
        "invertidas": [],
        "peso": 1
      },
      "assimilation": {
        "nome": "Assimilação",
        "descricao": "Estratégias para tentar se encaixar com os outros em situações sociais",
        "questoes": [3, 6, 9, 12, 15, 19, 20, 21, 25],
        "invertidas": [3, 6, 15, 21, 25],
        "peso": 1
      }
    },
    "score_total": "soma_secoes",
    "ponto_corte": 100,
    "nota_inversao": "Itens 3, 6, 15, 21, 25 têm pontuação invertida (8 - resposta)"
  }$$::jsonb,
  interpretacao = $${
    "faixas": [
      {
        "pontuacao_min": 25,
        "pontuacao_max": 99,
        "classificacao": "Abaixo do ponto de corte clínico",
        "descricao": "Pontuação abaixo do ponto de corte indica níveis mais baixos de comportamentos de camuflagem."
      },
      {
        "pontuacao_min": 100,
        "pontuacao_max": 175,
        "classificacao": "Acima do ponto de corte clínico",
        "descricao": "Pontuação igual ou acima do ponto de corte (100) sugere comportamentos significativos de camuflagem frequentemente associados ao autismo. Pontuações mais altas indicam camuflagem mais extensiva."
      }
    ],
    "subescalas": {
      "compensation": {
        "descricao": "Mede estratégias ativas usadas para compensar dificuldades sociais, como aprender regras sociais em livros ou mídia.",
        "max_pontos": 70
      },
      "masking": {
        "descricao": "Mede comportamentos destinados a esconder características autísticas, como monitorar a linguagem corporal para parecer normal.",
        "max_pontos": 42
      },
      "assimilation": {
        "descricao": "Mede a necessidade de se encaixar e sentimentos de estar atuando em situações sociais.",
        "max_pontos": 63
      }
    },
    "notas": "O CAT-Q mede a camuflagem social, que se refere a estratégias usadas para mascarar ou compensar traços autísticos. Pontuações altas indicam uso extensivo de estratégias de camuflagem."
  }$$::jsonb
WHERE sigla = 'CAT-Q';

-- ===================================
-- RBQ-2A - Questionário de Comportamentos Repetitivos para Adultos
-- ===================================

UPDATE testes_templates SET
  nome = 'RBQ-2A',
  nome_completo = 'Questionário de Comportamentos Repetitivos para Adultos',
  questoes = $$[
    {"numero": 1, "texto": "Você gosta de organizar itens em fileiras ou padrões?", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Você mexe repetitivamente em objetos? (ex: girar, torcer, bater, tocar, virar ou sacudir coisas repetidamente?)", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Você gira em torno de si mesmo(a)?", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "Você balança para frente e para trás, ou de um lado para o outro, seja sentado(a) ou em pé?", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "Você anda ou se move repetitivamente (ex: andar de um lado para o outro em uma sala, ou pelo mesmo caminho várias vezes)?", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Você faz movimentos repetitivos com as mãos e/ou dedos? (ex: torcer os dedos, agitar as mãos ou outros maneirismos com mãos ou dedos)", "secao": "repetitive_motor", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "Você tem fascínio ou interesse forte por objetos específicos ou partes de objetos, além daqueles que usa para hobbies ou trabalho? (ex: trens, placas de trânsito ou brinquedos específicos)", "secao": "restricted_interests", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "Você tem interesse forte ou fascínio por números, letras ou símbolos? (ex: placas de carro, mapas, datas)", "secao": "restricted_interests", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "Você tem interesses especiais ou tópicos que podem parecer incomuns para os outros em termos de foco ou intensidade? (ex: colecionar certos itens ou aprender tudo sobre um tópico específico)", "secao": "restricted_interests", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Você gosta de fazer tarefas do dia a dia sempre da mesma forma, seguindo exatamente a mesma rotina ou passos cada vez?", "secao": "insistence_sameness", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "Você perceberia se algo fosse movido de sua posição habitual, ou ficaria chateado(a) por ter que mudar onde as coisas são guardadas?", "secao": "insistence_sameness", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "Você insiste em manter a mesma rotina diária e fica chateado(a) com mudanças na sua rotina?", "secao": "insistence_sameness", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "Você tem interesses sensoriais, incluindo olhar coisas de perto, cheirar pessoas, objetos ou comida, ou ouvir sons específicos?", "secao": "sensory_interests", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "Você tem forte apego (ou necessidade de carregar) itens específicos (além daqueles necessários para trabalho ou hobbies)? (ex: um livro ou brinquedo pequeno)", "secao": "restricted_interests", "tipo_resposta": "likert_never_always", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "O quanto você fica chateado(a) se impedido(a) de realizar, ou interrompido(a) durante, rotinas ou tarefas do dia a dia?", "secao": "insistence_sameness", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "O quanto você fica chateado(a) se seu ambiente é mudado, ou se há mudanças na posição das coisas?", "secao": "insistence_sameness", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "Quão difícil seria para você ter que mudar sua rotina diária (ex: ter que fazer coisas em horário diferente ou em ordem diferente)?", "secao": "insistence_sameness", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "Quando você fica muito interessado(a) ou focado(a) em algo, quão difícil é parar e fazer outra coisa?", "secao": "restricted_interests", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "Quão difícil é mudar de uma atividade para outra?", "secao": "insistence_sameness", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "Quão difícil você acha quando algo inesperado acontece?", "secao": "insistence_sameness", "tipo_resposta": "likert_not_extremely", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20}
  ]$$::jsonb,
  escalas_resposta = $${
    "likert_never_always": [
      {"valor": 0, "texto": "Nunca ou raramente"},
      {"valor": 1, "texto": "Leve ou ocasional"},
      {"valor": 2, "texto": "Marcante ou notável"},
      {"valor": 3, "texto": "Muito marcante"}
    ],
    "likert_not_extremely": [
      {"valor": 0, "texto": "Nada"},
      {"valor": 1, "texto": "Levemente"},
      {"valor": 2, "texto": "Moderadamente"},
      {"valor": 3, "texto": "Extremamente"}
    ]
  }$$::jsonb,
  regras_calculo = $${
    "tipo": "secoes",
    "secoes": {
      "repetitive_motor": {
        "nome": "Comportamentos Motores Repetitivos",
        "descricao": "Movimentos motores estereotipados e repetitivos",
        "questoes": [1, 2, 3, 4, 5, 6],
        "invertidas": [],
        "peso": 1
      },
      "restricted_interests": {
        "nome": "Interesses Restritos",
        "descricao": "Interesses altamente focados e preocupações",
        "questoes": [7, 8, 9, 14, 18],
        "invertidas": [],
        "peso": 1
      },
      "insistence_sameness": {
        "nome": "Insistência na Mesmice",
        "descricao": "Necessidade de rotina e resistência a mudanças",
        "questoes": [10, 11, 12, 15, 16, 17, 19, 20],
        "invertidas": [],
        "peso": 1
      },
      "sensory_interests": {
        "nome": "Interesses Sensoriais",
        "descricao": "Comportamentos incomuns de busca sensorial",
        "questoes": [13],
        "invertidas": [],
        "peso": 1
      }
    },
    "score_total": "soma_secoes",
    "ponto_corte": 36
  }$$::jsonb,
  interpretacao = $${
    "faixas": [
      {
        "pontuacao_min": 0,
        "pontuacao_max": 35,
        "classificacao": "Abaixo do ponto de corte clínico",
        "descricao": "Pontuação abaixo do ponto de corte indica níveis mais baixos de comportamentos repetitivos."
      },
      {
        "pontuacao_min": 36,
        "pontuacao_max": 60,
        "classificacao": "Acima do ponto de corte clínico",
        "descricao": "Pontuação igual ou acima do ponto de corte (36) sugere níveis clinicamente significativos de comportamentos repetitivos frequentemente associados a condições do espectro autista."
      }
    ],
    "subescalas": {
      "repetitive_motor": {
        "descricao": "Avalia movimentos motores estereotipados e repetitivos como agitar as mãos, balançar e manipulação repetitiva de objetos.",
        "max_pontos": 18
      },
      "restricted_interests": {
        "descricao": "Avalia interesses circunscritos, fascinações e apego a objetos.",
        "max_pontos": 15
      },
      "insistence_sameness": {
        "descricao": "Avalia necessidade de rotina, resistência a mudanças e dificuldade com transições.",
        "max_pontos": 24
      },
      "sensory_interests": {
        "descricao": "Avalia comportamentos incomuns de busca sensorial incluindo cheirar, olhar de perto ou ouvir sons específicos.",
        "max_pontos": 3
      }
    },
    "notas": "O RBQ-2A mede comportamentos restritos e repetitivos que são uma característica central das condições do espectro autista."
  }$$::jsonb
WHERE sigla = 'RBQ-2A';

-- ===================================
-- AQ-50 - Quociente do Espectro Autista
-- ===================================

UPDATE testes_templates SET
  nome = 'AQ-50',
  nome_completo = 'Quociente do Espectro Autista (50 itens)',
  questoes = $$[
    {"numero": 1, "texto": "Prefiro fazer coisas com outras pessoas do que sozinho(a)", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Prefiro fazer as coisas sempre da mesma forma, repetidamente", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Se tento imaginar algo, acho muito fácil criar uma imagem na minha mente", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "Frequentemente fico tão absorvido(a) em uma coisa que perco de vista outras coisas", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "Frequentemente noto pequenos sons quando outros não notam", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "Geralmente noto placas de carro ou sequências similares de informação", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "Outras pessoas frequentemente me dizem que o que eu disse é indelicado, mesmo que eu ache que é educado", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "Quando leio uma história, consigo imaginar facilmente como os personagens se parecem", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "Sou fascinado(a) por datas", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "Em um grupo social, consigo facilmente acompanhar várias conversas diferentes de pessoas", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "Acho situações sociais fáceis", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "Tendo a notar detalhes que outros não notam", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "Prefiro ir a uma biblioteca do que a uma festa", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "Acho fácil inventar histórias", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "Sinto-me mais atraído(a) por pessoas do que por coisas", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 15},
    {"numero": 16, "texto": "Tendo a ter interesses muito fortes, que me chateio se não posso seguir", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "Gosto de conversa social casual", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "Quando falo, nem sempre é fácil para os outros conseguirem falar", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "Sou fascinado(a) por números", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "Quando leio uma história, acho difícil entender as intenções dos personagens", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "Não gosto particularmente de ler ficção", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "Acho difícil fazer novos amigos", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "Noto padrões nas coisas o tempo todo", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "Prefiro ir ao teatro do que a um museu", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "Não me incomoda se minha rotina diária é perturbada", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 25},
    {"numero": 26, "texto": "Frequentemente descubro que não sei como manter uma conversa", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26},
    {"numero": 27, "texto": "Acho fácil ler nas entrelinhas quando alguém está falando comigo", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 27},
    {"numero": 28, "texto": "Geralmente me concentro mais no quadro geral do que nos pequenos detalhes", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 28},
    {"numero": 29, "texto": "Não sou muito bom em lembrar números de telefone", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 29},
    {"numero": 30, "texto": "Geralmente não noto pequenas mudanças em uma situação ou na aparência de uma pessoa", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 30},
    {"numero": 31, "texto": "Sei como perceber se alguém que está me ouvindo está ficando entediado", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 31},
    {"numero": 32, "texto": "Acho fácil fazer mais de uma coisa ao mesmo tempo", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 32},
    {"numero": 33, "texto": "Quando falo ao telefone, não tenho certeza de quando é minha vez de falar", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33},
    {"numero": 34, "texto": "Gosto de fazer coisas espontaneamente", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 34},
    {"numero": 35, "texto": "Frequentemente sou o(a) último(a) a entender a graça de uma piada", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35},
    {"numero": 36, "texto": "Acho fácil descobrir o que alguém está pensando ou sentindo apenas olhando para seu rosto", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 36},
    {"numero": 37, "texto": "Se houver uma interrupção, consigo voltar ao que estava fazendo muito rapidamente", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 37},
    {"numero": 38, "texto": "Sou bom(boa) em conversa social casual", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 38},
    {"numero": 39, "texto": "As pessoas frequentemente me dizem que fico falando sobre a mesma coisa", "secao": "communication", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39},
    {"numero": 40, "texto": "Quando era jovem, costumava gostar de brincar de faz de conta com outras crianças", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 40},
    {"numero": 41, "texto": "Gosto de colecionar informações sobre categorias de coisas (ex: tipos de carro, tipos de pássaro, tipos de trem, tipos de planta, etc.)", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41},
    {"numero": 42, "texto": "Acho difícil imaginar como seria ser outra pessoa", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42},
    {"numero": 43, "texto": "Gosto de planejar cuidadosamente qualquer atividade em que participo", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43},
    {"numero": 44, "texto": "Gosto de ocasiões sociais", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 44},
    {"numero": 45, "texto": "Acho difícil entender as intenções das pessoas", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45},
    {"numero": 46, "texto": "Situações novas me deixam ansioso(a)", "secao": "attention_switching", "tipo_resposta": "likert_agree_4", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 46},
    {"numero": 47, "texto": "Gosto de conhecer pessoas novas", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 47},
    {"numero": 48, "texto": "Sou um bom diplomata", "secao": "social_skill", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 48},
    {"numero": 49, "texto": "Não sou muito bom em lembrar datas de aniversário das pessoas", "secao": "attention_to_detail", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 49},
    {"numero": 50, "texto": "Acho muito fácil brincar de faz de conta com crianças", "secao": "imagination", "tipo_resposta": "likert_agree_4", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 50}
  ]$$::jsonb,
  escalas_resposta = $${
    "likert_agree_4": [
      {"valor": 0, "texto": "Concordo totalmente"},
      {"valor": 1, "texto": "Concordo parcialmente"},
      {"valor": 2, "texto": "Discordo parcialmente"},
      {"valor": 3, "texto": "Discordo totalmente"}
    ]
  }$$::jsonb,
  regras_calculo = $${
    "tipo": "secoes",
    "secoes": {
      "social_skill": {
        "nome": "Habilidade Social",
        "descricao": "Dificuldade com interações sociais e preferência por atividades solitárias",
        "questoes": [1, 11, 13, 15, 22, 38, 44, 45, 47, 48],
        "invertidas": [1, 11, 15, 38, 44, 47, 48],
        "peso": 1
      },
      "attention_switching": {
        "nome": "Mudança de Atenção",
        "descricao": "Dificuldade em mudar a atenção e preferência por rotina",
        "questoes": [2, 4, 10, 16, 25, 32, 34, 37, 43, 46],
        "invertidas": [10, 25, 32, 34, 37],
        "peso": 1
      },
      "attention_to_detail": {
        "nome": "Atenção aos Detalhes",
        "descricao": "Atenção elevada a detalhes, padrões e informações",
        "questoes": [5, 6, 9, 12, 19, 23, 28, 29, 30, 41, 49],
        "invertidas": [28, 29, 30, 49],
        "peso": 1
      },
      "communication": {
        "nome": "Comunicação",
        "descricao": "Dificuldades com comunicação e conversação",
        "questoes": [7, 17, 18, 26, 27, 31, 33, 35, 39],
        "invertidas": [17, 27, 31],
        "peso": 1
      },
      "imagination": {
        "nome": "Imaginação",
        "descricao": "Dificuldades com imaginação e compreensão das perspectivas dos outros",
        "questoes": [3, 8, 14, 20, 21, 24, 36, 40, 42, 50],
        "invertidas": [3, 8, 14, 24, 36, 40, 50],
        "peso": 1
      }
    },
    "score_total": "soma_binaria",
    "ponto_corte": 32,
    "nota_pontuacao": "Pontuação: Para itens não invertidos, 1 ponto para Concordo parcialmente ou Concordo totalmente. Para itens invertidos, 1 ponto para Discordo parcialmente ou Discordo totalmente. Cada item pontua 0 ou 1, máximo total = 50."
  }$$::jsonb,
  interpretacao = $${
    "faixas": [
      {
        "pontuacao_min": 0,
        "pontuacao_max": 25,
        "classificacao": "Baixo",
        "descricao": "Pontuação indica níveis mais baixos de traços autísticos, típicos da população geral."
      },
      {
        "pontuacao_min": 26,
        "pontuacao_max": 31,
        "classificacao": "Limítrofe",
        "descricao": "Pontuação indica níveis acima da média de traços autísticos. Pode justificar investigação adicional se combinado com outras preocupações."
      },
      {
        "pontuacao_min": 32,
        "pontuacao_max": 50,
        "classificacao": "Acima do ponto de corte clínico",
        "descricao": "Pontuação igual ou acima do ponto de corte (32) indica níveis clinicamente significativos de traços autísticos. 80% dos adultos diagnosticados com autismo pontuam 32 ou mais."
      }
    ],
    "subescalas": {
      "social_skill": {
        "descricao": "Avalia habilidades de interação social e consciência social.",
        "max_pontos": 10
      },
      "attention_switching": {
        "descricao": "Avalia flexibilidade de atenção e preferência por mesmice.",
        "max_pontos": 10
      },
      "attention_to_detail": {
        "descricao": "Avalia atenção a detalhes, padrões, números e datas.",
        "max_pontos": 11
      },
      "communication": {
        "descricao": "Avalia habilidades de conversação e comunicação.",
        "max_pontos": 9
      },
      "imagination": {
        "descricao": "Avalia imaginação e capacidade de compreender perspectivas dos outros.",
        "max_pontos": 10
      }
    },
    "notas": "O AQ-50 é um instrumento de rastreamento para traços autísticos em adultos. Uma pontuação de 32 ou mais sugere que um encaminhamento para avaliação diagnóstica pode ser apropriado. 80% das pessoas diagnosticadas com autismo pontuam 32+, enquanto apenas 2% da população geral pontua neste nível."
  }$$::jsonb
WHERE sigla = 'AQ-50';
