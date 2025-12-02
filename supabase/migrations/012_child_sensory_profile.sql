-- ===================================
-- MIGRATION 011: Perfil Sensorial 2 - Criança (3-14 anos)
-- NeuroTest Platform Database
-- 86 itens, 4 quadrantes sensoriais
-- Questionário do Cuidador
-- ===================================

-- ===================================
-- ADD CHILD SENSORY PROCESSING TAG
-- ===================================

INSERT INTO tags (nome, slug, descricao, categoria, cor, icone, ordem) VALUES
('Crianças 3-14 anos', 'criancas-3-14', 'Validado para crianças de 3 a 14 anos', 'faixa_etaria', '#22c55e', 'baby', 4)
ON CONFLICT (slug) DO NOTHING;

-- ===================================
-- CHILD SENSORY PROFILE 2
-- 86 items, Likert 1-5, 4 quadrantes
-- Caregiver questionnaire
-- ===================================

-- Delete if exists (from partial migration)
DELETE FROM testes_templates WHERE id = '550e8400-e29b-41d4-a716-446655440302';

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
  '550e8400-e29b-41d4-a716-446655440302',
  'Perfil Sensorial 2 - Criança',
  'Perfil Sensorial 2 - Questionário do Cuidador (3-14 anos)',
  'SP2-C',
  '2.0',
  'Winnie Dunn, PhD, OTR, FAOTA',
  'escala_likert',
  3,
  14,
  25,
  ARRAY['presencial', 'remota'],
  $$[
    {"numero": 1, "texto": "reage intensamente a sons inesperados ou barulhentos (por exemplo, sirenes, cachorro latindo, secador de cabelo).", "secao": "processamento_auditivo", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "coloca as mãos sobre os ouvidos para protegê-los do som.", "secao": "processamento_auditivo", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "tem dificuldade em concluir tarefas quando há música tocando ou a TV está ligada.", "secao": "processamento_auditivo", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3},
    {"numero": 4, "texto": "se distrai quando há muito barulho ao redor.", "secao": "processamento_auditivo", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 4},
    {"numero": 5, "texto": "torna-se improdutivo(a) com ruídos de fundo (por exemplo, ventilador, geladeira).", "secao": "processamento_auditivo", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 5},
    {"numero": 6, "texto": "para de prestar atenção em mim ou parece que me ignora.", "secao": "processamento_auditivo", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 6},
    {"numero": 7, "texto": "parece não ouvir quando eu o(a) chamo por seu nome (mesmo com sua audição sendo normal).", "secao": "processamento_auditivo", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 7},
    {"numero": 8, "texto": "gosta de barulhos estranhos ou faz barulho(s) para se divertir.", "secao": "processamento_auditivo", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 8},
    {"numero": 9, "texto": "prefere brincar ou fazer tarefas em condições de pouca luz.", "secao": "processamento_visual", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 9},
    {"numero": 10, "texto": "prefere vestir-se com roupas de cores brilhantes ou estampadas.", "secao": "processamento_visual", "quadrante": "sem_quadrante", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 10},
    {"numero": 11, "texto": "se diverte ao olhar para detalhes visuais em objetos.", "secao": "processamento_visual", "quadrante": "sem_quadrante", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 11},
    {"numero": 12, "texto": "precisa de ajuda para encontrar objetos que são óbvios para outros.", "secao": "processamento_visual", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 12},
    {"numero": 13, "texto": "se incomoda mais com luzes brilhantes do que outras crianças da mesma idade.", "secao": "processamento_visual", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 13},
    {"numero": 14, "texto": "observa as pessoas conforme elas se movem ao redor da sala.", "secao": "processamento_visual", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 14},
    {"numero": 15, "texto": "se incomoda com luzes brilhantes (por exemplo, se esconde da luz solar que reluz através da janela do carro).", "secao": "processamento_visual", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 15, "nota": "Este item não faz parte da Pontuação bruta VISUAL"},
    {"numero": 16, "texto": "mostra desconforto durante momentos de cuidado pessoal (por exemplo, briga ou chora durante o corte de cabelo, lavagem do rosto, corte das unhas das mãos).", "secao": "processamento_tato", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 16},
    {"numero": 17, "texto": "se irrita com o uso de sapatos ou meias.", "secao": "processamento_tato", "quadrante": "sem_quadrante", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 17},
    {"numero": 18, "texto": "mostra uma resposta emocional ou agressiva ao ser tocado(a).", "secao": "processamento_tato", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 18},
    {"numero": 19, "texto": "fica ansioso(a) quando fica de pé em proximidade a outros (por exemplo, em uma fila).", "secao": "processamento_tato", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 19},
    {"numero": 20, "texto": "esfrega ou coça uma parte do corpo que foi tocada.", "secao": "processamento_tato", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 20},
    {"numero": 21, "texto": "toca as pessoas ou objetos a ponto de incomodar outros.", "secao": "processamento_tato", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 21},
    {"numero": 22, "texto": "exibe a necessidade de tocar brinquedos, superfícies ou texturas (por exemplo, quer obter a sensação de tudo ao redor).", "secao": "processamento_tato", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 22},
    {"numero": 23, "texto": "parece não ter consciência quanto à dor.", "secao": "processamento_tato", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 23},
    {"numero": 24, "texto": "parece não ter consciência quanto a mudanças de temperatura.", "secao": "processamento_tato", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 24},
    {"numero": 25, "texto": "toca pessoas e objetos mais do que crianças da mesma idade.", "secao": "processamento_tato", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 25},
    {"numero": 26, "texto": "parece alheio(a) quanto ao fato de suas mãos ou face estarem sujas.", "secao": "processamento_tato", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 26},
    {"numero": 27, "texto": "busca movimentar-se até o ponto que interfere com rotinas diárias (por exemplo, não consegue ficar quieto, demonstra inquietude).", "secao": "processamento_movimentos", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 27},
    {"numero": 28, "texto": "faz movimento de balançar na cadeira, no chão ou enquanto está em pé.", "secao": "processamento_movimentos", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 28},
    {"numero": 29, "texto": "hesita subir ou descer calçadas ou degraus (por exemplo, é cauteloso, para antes de se movimentar).", "secao": "processamento_movimentos", "quadrante": "sem_quadrante", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 29},
    {"numero": 30, "texto": "fica animado(a) durante tarefas que envolvem movimento.", "secao": "processamento_movimentos", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 30},
    {"numero": 31, "texto": "se arrisca ao se movimentar ou escalar de modo perigoso.", "secao": "processamento_movimentos", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 31},
    {"numero": 32, "texto": "procura oportunidades para cair sem se importar com a própria segurança (por exemplo, cai de propósito).", "secao": "processamento_movimentos", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 32},
    {"numero": 33, "texto": "perde o equilíbrio inesperadamente ao caminhar sobre uma superfície irregular.", "secao": "processamento_movimentos", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 33},
    {"numero": 34, "texto": "esbarra em coisas, sem conseguir notar objetos ou pessoas no caminho.", "secao": "processamento_movimentos", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 34},
    {"numero": 35, "texto": "move-se de modo rígido.", "secao": "processamento_posicao_corpo", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 35},
    {"numero": 36, "texto": "fica cansado(a) facilmente, principalmente quando está em pé ou mantendo o corpo em uma posição.", "secao": "processamento_posicao_corpo", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 36},
    {"numero": 37, "texto": "parece ter músculos fracos.", "secao": "processamento_posicao_corpo", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 37},
    {"numero": 38, "texto": "se apoia para se sustentar (por exemplo, segura a cabeça com as mãos, apoia-se em uma parede).", "secao": "processamento_posicao_corpo", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 38},
    {"numero": 39, "texto": "se segura a objetos, paredes ou corrimões mais do que as crianças da mesma idade.", "secao": "processamento_posicao_corpo", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 39},
    {"numero": 40, "texto": "ao andar, faz barulho, como se os pés fossem pesados.", "secao": "processamento_posicao_corpo", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 40},
    {"numero": 41, "texto": "se inclina para se apoiar em móveis ou em outras pessoas.", "secao": "processamento_posicao_corpo", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 41},
    {"numero": 42, "texto": "precisa de cobertores pesados para dormir.", "secao": "processamento_posicao_corpo", "quadrante": "sem_quadrante", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 42},
    {"numero": 43, "texto": "fica com ânsia de vômito facilmente com certas texturas de alimentos ou utensílios alimentares na boca.", "secao": "processamento_oral", "quadrante": "sem_quadrante", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 43},
    {"numero": 44, "texto": "rejeita certos gostos ou cheiros de comida que são, normalmente, parte de dietas de crianças.", "secao": "processamento_oral", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 44},
    {"numero": 45, "texto": "se alimenta somente de certos sabores (por exemplo, doce, salgado).", "secao": "processamento_oral", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 45},
    {"numero": 46, "texto": "limita-se quanto a certas texturas de alimentos.", "secao": "processamento_oral", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 46},
    {"numero": 47, "texto": "é exigente para comer, principalmente com relação às texturas de alimentos.", "secao": "processamento_oral", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 47},
    {"numero": 48, "texto": "cheira objetos não comestíveis.", "secao": "processamento_oral", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 48},
    {"numero": 49, "texto": "mostra uma forte preferência por certos sabores.", "secao": "processamento_oral", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 49},
    {"numero": 50, "texto": "deseja intensamente certos alimentos, gostos ou cheiros.", "secao": "processamento_oral", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 50},
    {"numero": 51, "texto": "coloca objetos na boca (por exemplo, lápis, mãos).", "secao": "processamento_oral", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 51},
    {"numero": 52, "texto": "morde a língua ou lábios mais do que as crianças da mesma idade.", "secao": "processamento_oral", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 52},
    {"numero": 53, "texto": "parece propenso(a) a acidentes.", "secao": "conduta", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 53},
    {"numero": 54, "texto": "se apressa em atividades de colorir, escrever ou desenhar.", "secao": "conduta", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 54},
    {"numero": 55, "texto": "se expõe a riscos excessivos (por exemplo, sobe alto em uma árvore, salta de móveis altos) que comprometem sua própria segurança.", "secao": "conduta", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 55},
    {"numero": 56, "texto": "parece ser mais ativo(a) do que crianças da mesma idade.", "secao": "conduta", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 56},
    {"numero": 57, "texto": "faz as coisas de uma maneira mais difícil do que necessário (por exemplo, perde tempo, move-se lentamente).", "secao": "conduta", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 57},
    {"numero": 58, "texto": "pode ser teimoso(a) e não cooperativo(a).", "secao": "conduta", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 58},
    {"numero": 59, "texto": "faz birra.", "secao": "conduta", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 59},
    {"numero": 60, "texto": "parece se divertir quando cai.", "secao": "conduta", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 60},
    {"numero": 61, "texto": "resiste ao contato visual comigo ou com outros.", "secao": "conduta", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 61},
    {"numero": 62, "texto": "parece ter baixa autoestima (por exemplo, dificuldade de gostar de si mesmo(a)).", "secao": "socioemocional", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 62},
    {"numero": 63, "texto": "precisa de apoio positivo para enfrentar situações desafiadoras.", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 63},
    {"numero": 64, "texto": "é sensível às críticas.", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 64},
    {"numero": 65, "texto": "possui medos definidos e previsíveis.", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 65},
    {"numero": 66, "texto": "se expressa sentindo-se como um fracasso.", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 66},
    {"numero": 67, "texto": "é demasiadamente sério(a).", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 67},
    {"numero": 68, "texto": "tem fortes explosões emocionais quando não consegue concluir uma tarefa.", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 68},
    {"numero": 69, "texto": "tem dificuldade de interpretar linguagem corporal ou expressões faciais.", "secao": "socioemocional", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 69},
    {"numero": 70, "texto": "fica frustrado(a) facilmente.", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 70},
    {"numero": 71, "texto": "possui medos que interferem nas rotinas diárias.", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 71},
    {"numero": 72, "texto": "fica angustiado(a) com mudanças nos planos, rotinas ou expectativas.", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 72},
    {"numero": 73, "texto": "precisa de mais proteção contra acontecimentos da vida do que crianças da mesma idade (por exemplo, é indefeso(a) física ou emocionalmente).", "secao": "socioemocional", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 73},
    {"numero": 74, "texto": "interage ou participa em grupos menos que crianças da mesma idade.", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 74},
    {"numero": 75, "texto": "tem dificuldade com amizades (por exemplo, fazer ou manter amigos).", "secao": "socioemocional", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 75},
    {"numero": 76, "texto": "não faz contato visual comigo durante interações no dia a dia.", "secao": "atencao", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 76},
    {"numero": 77, "texto": "tem dificuldade para prestar atenção.", "secao": "atencao", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 77},
    {"numero": 78, "texto": "se desvia de tarefas para observar todas as ações na sala.", "secao": "atencao", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 78},
    {"numero": 79, "texto": "parece alheio(a) dentro de um ambiente ativo (por exemplo, não tem consciência quanto à atividade).", "secao": "atencao", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 79},
    {"numero": 80, "texto": "olha fixamente, de maneira intensa, para objetos.", "secao": "atencao", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 80},
    {"numero": 81, "texto": "olha fixamente, de maneira intensa, para as pessoas.", "secao": "atencao", "quadrante": "esquiva", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 81},
    {"numero": 82, "texto": "observa a todos conforme se movem ao redor da sala.", "secao": "atencao", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 82},
    {"numero": 83, "texto": "muda de uma coisa para outra de modo a interferir com as atividades.", "secao": "atencao", "quadrante": "exploracao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 83},
    {"numero": 84, "texto": "se perde facilmente.", "secao": "atencao", "quadrante": "sensibilidade", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 84},
    {"numero": 85, "texto": "tem dificuldade para encontrar objetos em espaços cheios de coisas (por exemplo, sapatos em um quarto bagunçado, lápis na \"gaveta de bagunças\").", "secao": "atencao", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 85},
    {"numero": 86, "texto": "parece não se dar conta quando pessoas entram na sala.", "secao": "atencao", "quadrante": "observacao", "tipo_resposta": "likert_1_5_freq", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 86, "nota": "Este item não faz parte da Pontuação bruta de ATENÇÃO"}
  ]$$::jsonb,
  $${
    "likert_1_5_freq": [
      {"valor": 5, "texto": "Quase sempre (90% ou mais do tempo)"},
      {"valor": 4, "texto": "Frequentemente (75% do tempo)"},
      {"valor": 3, "texto": "Metade do tempo (50% do tempo)"},
      {"valor": 2, "texto": "Ocasionalmente (25% do tempo)"},
      {"valor": 1, "texto": "Quase nunca (10% ou menos do tempo)"},
      {"valor": 0, "texto": "Não se aplica"}
    ]
  }$$::jsonb,
  $${
    "tipo": "quadrantes_secoes",
    "quadrantes": {
      "exploracao": {
        "nome": "Exploração",
        "nome_crianca": "Criança exploradora",
        "descricao": "O grau em que uma criança obtém estímulo sensorial. Uma criança com uma pontuação de Muito mais que outros(as) neste padrão busca estímulos sensoriais em uma taxa mais elevada que outros(as).",
        "questoes": [14, 21, 22, 25, 27, 28, 30, 31, 32, 41, 48, 49, 50, 51, 55, 56, 60, 82, 83],
        "peso": 1,
        "max_score": 95
      },
      "esquiva": {
        "nome": "Esquiva",
        "nome_crianca": "Criança que se esquiva",
        "descricao": "O grau em que uma criança fica incomodada por estímulos sensoriais. Uma criança com uma pontuação de Muito mais que outros(as) neste padrão se afasta de estímulos sensoriais em uma taxa mais elevada que outros(as).",
        "questoes": [1, 2, 5, 15, 18, 58, 59, 61, 63, 64, 65, 66, 67, 68, 70, 71, 72, 74, 75, 81],
        "peso": 1,
        "max_score": 100
      },
      "sensibilidade": {
        "nome": "Sensibilidade",
        "nome_crianca": "Criança sensível",
        "descricao": "O grau em que uma criança detecta estímulos sensoriais. Uma criança com uma pontuação de Muito mais que outros(as) neste padrão percebe estímulos sensoriais em uma taxa mais elevada que outros(as).",
        "questoes": [3, 4, 6, 7, 9, 13, 16, 19, 20, 44, 45, 46, 47, 52, 69, 73, 77, 78, 84],
        "peso": 1,
        "max_score": 95
      },
      "observacao": {
        "nome": "Observação",
        "nome_crianca": "Criança observadora",
        "descricao": "O grau em que uma criança não percebe estímulos sensoriais. Uma criança com uma pontuação de Muito mais que outros(as) neste padrão não percebe estímulos sensoriais em uma taxa mais elevada que outros(as).",
        "questoes": [8, 12, 23, 24, 26, 33, 34, 35, 36, 37, 38, 39, 40, 53, 54, 57, 62, 76, 79, 80, 85, 86],
        "peso": 1,
        "max_score": 110
      }
    },
    "secoes_sensoriais": {
      "processamento_auditivo": {
        "nome": "Auditivo",
        "questoes": [1, 2, 3, 4, 5, 6, 7, 8],
        "max_score": 40
      },
      "processamento_visual": {
        "nome": "Visual",
        "questoes": [9, 10, 11, 12, 13, 14],
        "max_score": 30,
        "nota": "Item 15 não faz parte da pontuação"
      },
      "processamento_tato": {
        "nome": "Tato",
        "questoes": [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
        "max_score": 55
      },
      "processamento_movimentos": {
        "nome": "Movimentos",
        "questoes": [27, 28, 29, 30, 31, 32, 33, 34],
        "max_score": 40
      },
      "processamento_posicao_corpo": {
        "nome": "Posição do corpo",
        "questoes": [35, 36, 37, 38, 39, 40, 41, 42],
        "max_score": 40
      },
      "processamento_oral": {
        "nome": "Oral",
        "questoes": [43, 44, 45, 46, 47, 48, 49, 50, 51, 52],
        "max_score": 50
      }
    },
    "secoes_comportamentais": {
      "conduta": {
        "nome": "Conduta",
        "questoes": [53, 54, 55, 56, 57, 58, 59, 60, 61],
        "max_score": 45
      },
      "socioemocional": {
        "nome": "Socioemocional",
        "questoes": [62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
        "max_score": 70
      },
      "atencao": {
        "nome": "Atenção",
        "questoes": [76, 77, 78, 79, 80, 81, 82, 83, 84, 85],
        "max_score": 50,
        "nota": "Item 86 não faz parte da pontuação"
      }
    }
  }$$::jsonb,
  $${
    "quadrantes": {
      "exploracao": {
        "muito_menos": {"min": 0, "max": 6},
        "menos": {"min": 7, "max": 19},
        "semelhante": {"min": 20, "max": 47},
        "mais": {"min": 48, "max": 60},
        "muito_mais": {"min": 61, "max": 95}
      },
      "esquiva": {
        "muito_menos": {"min": 0, "max": 7},
        "menos": {"min": 8, "max": 20},
        "semelhante": {"min": 21, "max": 46},
        "mais": {"min": 47, "max": 59},
        "muito_mais": {"min": 60, "max": 100}
      },
      "sensibilidade": {
        "muito_menos": {"min": 0, "max": 6},
        "menos": {"min": 7, "max": 17},
        "semelhante": {"min": 18, "max": 42},
        "mais": {"min": 43, "max": 53},
        "muito_mais": {"min": 54, "max": 95}
      },
      "observacao": {
        "muito_menos": {"min": 0, "max": 6},
        "menos": {"min": 7, "max": 18},
        "semelhante": {"min": 19, "max": 43},
        "mais": {"min": 44, "max": 55},
        "muito_mais": {"min": 56, "max": 110}
      }
    },
    "secoes_sensoriais": {
      "processamento_auditivo": {
        "muito_menos": {"min": 0, "max": 2},
        "menos": {"min": 3, "max": 9},
        "semelhante": {"min": 10, "max": 24},
        "mais": {"min": 25, "max": 31},
        "muito_mais": {"min": 32, "max": 40}
      },
      "processamento_visual": {
        "muito_menos": {"min": 0, "max": 4},
        "menos": {"min": 5, "max": 8},
        "semelhante": {"min": 9, "max": 17},
        "mais": {"min": 18, "max": 21},
        "muito_mais": {"min": 22, "max": 30}
      },
      "processamento_tato": {
        "muito_menos": {"min": 0, "max": 0},
        "menos": {"min": 1, "max": 7},
        "semelhante": {"min": 8, "max": 21},
        "mais": {"min": 22, "max": 28},
        "muito_mais": {"min": 29, "max": 55}
      },
      "processamento_movimentos": {
        "muito_menos": {"min": 0, "max": 1},
        "menos": {"min": 2, "max": 6},
        "semelhante": {"min": 7, "max": 18},
        "mais": {"min": 19, "max": 24},
        "muito_mais": {"min": 25, "max": 40}
      },
      "processamento_posicao_corpo": {
        "muito_menos": {"min": 0, "max": 0},
        "menos": {"min": 1, "max": 4},
        "semelhante": {"min": 5, "max": 15},
        "mais": {"min": 16, "max": 19},
        "muito_mais": {"min": 20, "max": 40}
      },
      "processamento_oral": {
        "muito_menos": {"min": 0, "max": 0},
        "menos": {"min": 0, "max": 7},
        "semelhante": {"min": 8, "max": 24},
        "mais": {"min": 25, "max": 32},
        "muito_mais": {"min": 33, "max": 50}
      }
    },
    "secoes_comportamentais": {
      "conduta": {
        "muito_menos": {"min": 0, "max": 1},
        "menos": {"min": 2, "max": 8},
        "semelhante": {"min": 9, "max": 22},
        "mais": {"min": 23, "max": 29},
        "muito_mais": {"min": 30, "max": 45}
      },
      "socioemocional": {
        "muito_menos": {"min": 0, "max": 2},
        "menos": {"min": 3, "max": 12},
        "semelhante": {"min": 13, "max": 31},
        "mais": {"min": 32, "max": 41},
        "muito_mais": {"min": 42, "max": 70}
      },
      "atencao": {
        "muito_menos": {"min": 0, "max": 0},
        "menos": {"min": 1, "max": 8},
        "semelhante": {"min": 9, "max": 24},
        "mais": {"min": 25, "max": 31},
        "muito_mais": {"min": 32, "max": 50}
      }
    },
    "classificacoes": {
      "muito_menos": {
        "nome": "Muito menos que outros(as)",
        "simbolo": "--",
        "descricao": "Pontuação significativamente abaixo da média para crianças da mesma faixa etária."
      },
      "menos": {
        "nome": "Menos que outros(as)",
        "simbolo": "-",
        "descricao": "Pontuação abaixo da média para crianças da mesma faixa etária."
      },
      "semelhante": {
        "nome": "Exatamente como a maioria dos(as) outros(as)",
        "simbolo": "=",
        "descricao": "Pontuação dentro da faixa típica para crianças da mesma faixa etária."
      },
      "mais": {
        "nome": "Mais que outros(as)",
        "simbolo": "+",
        "descricao": "Pontuação acima da média para crianças da mesma faixa etária."
      },
      "muito_mais": {
        "nome": "Muito mais que outros(as)",
        "simbolo": "++",
        "descricao": "Pontuação significativamente acima da média para crianças da mesma faixa etária."
      }
    },
    "notas": "O Perfil Sensorial 2 - Criança avalia padrões de processamento sensorial em crianças de 3 a 14 anos através do relato do cuidador. Os resultados ajudam a compreender como a criança responde a experiências sensoriais do dia a dia e podem informar estratégias de adaptação ambiental, escolar e terapêutica."
  }$$::jsonb,
  true,
  true
);

-- ===================================
-- ASSOCIATE TEST WITH TAGS
-- ===================================

DO $$
DECLARE
  tag_criancas_id UUID;
  tag_sensorial_id UUID;
  tag_escala_id UUID;
  tag_criancas_3_14_id UUID;
BEGIN
  SELECT id INTO tag_criancas_id FROM tags WHERE slug = 'criancas';
  SELECT id INTO tag_sensorial_id FROM tags WHERE slug = 'processamento-sensorial';
  SELECT id INTO tag_escala_id FROM tags WHERE slug = 'escala-autorelato';
  SELECT id INTO tag_criancas_3_14_id FROM tags WHERE slug = 'criancas-3-14';

  -- SP2-C tags
  INSERT INTO testes_templates_tags (teste_template_id, tag_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440302', tag_criancas_id),
    ('550e8400-e29b-41d4-a716-446655440302', tag_sensorial_id),
    ('550e8400-e29b-41d4-a716-446655440302', tag_escala_id),
    ('550e8400-e29b-41d4-a716-446655440302', tag_criancas_3_14_id)
  ON CONFLICT DO NOTHING;
END $$;
