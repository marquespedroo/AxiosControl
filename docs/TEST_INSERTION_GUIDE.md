# Guia de Inserção de Testes - NeuroTest Platform

Este documento descreve como inserir novos testes no sistema NeuroTest.

---

## TODO: Documentar Formatos Adicionais

> **Formatos documentados:**
> - [x] `secoes` (CAT-Q) - Seção 6a
> - [x] `gabarito_binario` (BHS) - Seção 6b
> - [x] `quadrantes` (AASP) - Ver [QUADRANT_TESTS_GUIDE.md](./QUADRANT_TESTS_GUIDE.md)
> - [x] `diferencial_semantico` / Bipolar (EBADEP-A) - Seção 6c
> - [x] Exibição de Instruções Antes do Teste - Seção 7
> - [ ] Pontuação ponderada complexa (MCMI-IV) - Pendente

---

## 1. Visão Geral

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `testes_templates` | Definições dos testes |
| `tabelas_normativas` | Tabelas de normas |
| `tags` | Categorias para classificação |
| `testes_templates_tags` | Associação teste-tags |

### Tipos de Teste (`tipo`)

- `escala_likert` - Escala de Likert
- `multipla_escolha` - Múltipla escolha / Verdadeiro-Falso

---

## 2. Estrutura do Campo `questoes`

Array JSONB com objetos de questão:

```json
{
  "numero": 1,
  "texto": "Texto da questão",
  "secao": "nome_da_secao",
  "tipo_resposta": "likert_1_7",
  "invertida": false,
  "obrigatoria": true,
  "peso": 1,
  "ordem": 1
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `numero` | int | Número sequencial |
| `texto` | string | Texto da questão (uso geral) |
| `texto_esquerda` | string | Texto esquerdo em questões bipolares (positivo/saudável) |
| `texto_direita` | string | Texto direito em questões bipolares (negativo/sintomático) |
| `secao` | string | Seção/subescala |
| `tipo_resposta` | string | Referência à escala |
| `invertida` | bool | Se pontuação invertida |
| `obrigatoria` | bool | Se obrigatória |
| `peso` | number | Peso no cálculo |
| `ordem` | int | Ordem de exibição |

**Nota para questões bipolares/diferencial semântico**: Use `texto_esquerda` e `texto_direita` em vez de `texto` para testes como EBADEP-A.

---

## 3. Estrutura do Campo `escalas_resposta`

```json
{
  "likert_1_7": [
    {"valor": 1, "texto": "Discordo totalmente"},
    {"valor": 2, "texto": "Discordo"},
    {"valor": 3, "texto": "Discordo parcialmente"},
    {"valor": 4, "texto": "Nem concordo nem discordo"},
    {"valor": 5, "texto": "Concordo parcialmente"},
    {"valor": 6, "texto": "Concordo"},
    {"valor": 7, "texto": "Concordo totalmente"}
  ]
}
```

---

## 4. Estrutura do Campo `regras_calculo`

### Tipo: `secoes`

```json
{
  "tipo": "secoes",
  "secoes": {
    "nome_secao": {
      "nome": "Nome de Exibição",
      "descricao": "O que esta seção mede",
      "questoes": [1, 4, 7, 10],
      "invertidas": [3, 6],
      "peso": 1
    }
  },
  "score_total": "soma_secoes",
  "ponto_corte": 100
}
```

### Tipo: `gabarito_binario`

Para testes Certo/Errado (Verdadeiro/Falso). Pontuação = match com gabarito.

```json
{
  "tipo": "gabarito_binario",
  "gabarito": {
    "0": "E",
    "1": "C",
    "2": "E"
  },
  "interpretacao_ranges": [
    {"min": 0, "max": 3, "nivel": "Normal", "descricao": "..."},
    {"min": 4, "max": 8, "nivel": "Leve", "descricao": "..."}
  ]
}
```

**Nota**: No `gabarito_binario`, as faixas de interpretação ficam DENTRO de `regras_calculo`, não em `interpretacao`.

### Tipo: `quadrantes`

Para testes com agrupamento por quadrantes (ex: AASP - Perfil Sensorial).

Ver documentação completa em [QUADRANT_TESTS_GUIDE.md](./QUADRANT_TESTS_GUIDE.md)

```json
{
  "tipo": "quadrantes",
  "quadrantes": {
    "baixo_registro": {
      "nome": "Baixo Registro",
      "questoes": [3, 6, 12, 15],
      "peso": 1
    }
  },
  "max_por_quadrante": 75
}
```

### Tipo: `percentil_lookup`

Para testes com tabela de percentis baseada em amostra normativa (ex: EBADEP-A).

Pontuação bruta é convertida em percentil via lookup direto, depois classificada em faixas.

```json
{
  "tipo": "percentil_lookup",
  "score_total": "soma_simples",
  "range_score": {"min": 0, "max": 135},
  "tabela_percentil": {
    "0": 1, "1": 1, "2": 1, "3": 2,
    "...": "...",
    "135": 99
  },
  "interpretacao_por_score": [
    {"min": 0, "max": 59, "classificacao": "SINTOMATOLOGIA DEPRESSIVA", "percentil_range": "1-71"},
    {"min": 60, "max": 76, "classificacao": "SINTOMATOLOGIA DEPRESSIVA LEVE", "percentil_range": "72-87"}
  ]
}
```

**Nota**: A tabela de percentis deve mapear cada score possível (0 até max) para seu percentil correspondente.

---

## 5. Estrutura do Campo `interpretacao`

```json
{
  "notas": "Descrição geral do que o teste mede",
  "faixas": [
    {
      "pontuacao_min": 25,
      "pontuacao_max": 99,
      "classificacao": "Abaixo do ponto de corte",
      "descricao": "Descrição desta faixa"
    },
    {
      "pontuacao_min": 100,
      "pontuacao_max": 175,
      "classificacao": "Acima do ponto de corte",
      "descricao": "Descrição desta faixa"
    }
  ],
  "subescalas": {
    "nome_secao": {
      "descricao": "O que esta subescala mede",
      "max_pontos": 42
    }
  }
}
```

---

## 6. Exemplo Completo: CAT-Q (Escala Likert com Seções)

```sql
INSERT INTO testes_templates (
  nome, sigla, tipo,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'CAT-Q', 'CAT-Q', 'escala_likert',
  16, 65, 10,

  -- QUESTOES (25 itens, 3 seções)
  $$[
    {"numero": 1, "texto": "Quando estou interagindo...", "secao": "compensation", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "texto": "Monitoro minha linguagem...", "secao": "masking", "tipo_resposta": "likert_1_7", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "texto": "Raramente sinto necessidade...", "secao": "assimilation", "tipo_resposta": "likert_1_7", "invertida": true, "obrigatoria": true, "peso": 1, "ordem": 3}
    -- ... demais questões
  ]$$::jsonb,

  -- ESCALAS_RESPOSTA
  $${
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

  -- REGRAS_CALCULO
  $${
    "tipo": "secoes",
    "secoes": {
      "masking": {
        "nome": "Mascaramento",
        "descricao": "Estratégias para esconder características autísticas",
        "questoes": [2, 5, 8, 11, 14, 18],
        "invertidas": [],
        "peso": 1
      },
      "assimilation": {
        "nome": "Assimilação",
        "descricao": "Estratégias para se encaixar em situações sociais",
        "questoes": [3, 6, 9, 12, 15, 19, 20, 21, 25],
        "invertidas": [3, 6, 15, 21, 25],
        "peso": 1
      },
      "compensation": {
        "nome": "Compensação",
        "descricao": "Estratégias para compensar dificuldades sociais",
        "questoes": [1, 4, 7, 10, 13, 16, 17, 22, 23, 24],
        "invertidas": [],
        "peso": 1
      }
    },
    "score_total": "soma_secoes",
    "ponto_corte": 100,
    "nota_inversao": "Itens 3, 6, 15, 21, 25 têm pontuação invertida (8 - resposta)"
  }$$::jsonb,

  -- INTERPRETACAO
  $${
    "notas": "O CAT-Q mede a camuflagem social em contexto de autismo.",
    "faixas": [
      {"pontuacao_min": 25, "pontuacao_max": 99, "classificacao": "Abaixo do ponto de corte", "descricao": "Níveis mais baixos de camuflagem"},
      {"pontuacao_min": 100, "pontuacao_max": 175, "classificacao": "Acima do ponto de corte", "descricao": "Comportamentos significativos de camuflagem"}
    ],
    "subescalas": {
      "masking": {"descricao": "Esconder características autísticas", "max_pontos": 42},
      "assimilation": {"descricao": "Necessidade de se encaixar", "max_pontos": 63},
      "compensation": {"descricao": "Estratégias ativas de compensação", "max_pontos": 70}
    }
  }$$::jsonb,

  true, true
);
```

---

## 6b. Exemplo: BHS (Múltipla Escolha com Gabarito Binário)

```sql
INSERT INTO testes_templates (
  nome, sigla, tipo,
  questoes, escalas_resposta, regras_calculo,
  publico, ativo
) VALUES (
  'BHS', 'BHS', 'multipla_escolha',

  -- QUESTOES (sem secao, com tipo "likert")
  $$[
    {"numero": 1, "texto": "Penso no futuro com esperança...", "tipo": "likert", "invertida": false},
    {"numero": 2, "texto": "Seria melhor desistir...", "tipo": "likert", "invertida": false}
  ]$$::jsonb,

  -- ESCALAS_RESPOSTA (binário C/E)
  $${
    "binario": [
      {"valor": "C", "texto": "Certo"},
      {"valor": "E", "texto": "Errado"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO (gabarito + interpretação)
  $${
    "tipo": "gabarito_binario",
    "gabarito": {
      "0": "E", "1": "C", "2": "E", "3": "C", "4": "E",
      "5": "E", "6": "C", "7": "E", "8": "C", "9": "E",
      "10": "C", "11": "C", "12": "E", "13": "C", "14": "E",
      "15": "C", "16": "C", "17": "C", "18": "E", "19": "C"
    },
    "interpretacao_ranges": [
      {"min": 0, "max": 3, "nivel": "Normal", "descricao": "Desesperança normal"},
      {"min": 4, "max": 8, "nivel": "Leve", "descricao": "Desesperança leve"},
      {"min": 9, "max": 14, "nivel": "Moderado", "descricao": "Desesperança moderada"},
      {"min": 15, "max": 20, "nivel": "Grave", "descricao": "Desesperança grave"}
    ]
  }$$::jsonb,

  true, true
);
```

**Nota**: No BHS, `interpretacao` é `null` - as faixas ficam em `regras_calculo.interpretacao_ranges`.

---

## 6c. Exemplo: EBADEP-A (Diferencial Semântico/Bipolar com Percentis)

Para testes com formato de **diferencial semântico** (duas afirmações opostas na mesma linha).

### Características do Formato Bipolar

- Cada questão apresenta **duas afirmações opostas** (positiva/negativa)
- **4 opções de resposta** entre elas (0 a 3)
- Resposta indica concordância com qual lado e intensidade
- Comum em escalas de depressão, humor, bem-estar

### Estrutura da Questão Bipolar

```json
{
  "numero": 1,
  "secao": "EBADEP-A",
  "texto_esquerda": "Não tenho vontade de chorar",
  "texto_direita": "Tenho sentido vontade de chorar",
  "tipo_resposta": "diferencial_0_3",
  "invertida": false,
  "obrigatoria": true,
  "peso": 1,
  "ordem": 1
}
```

**Visual no teste:**
```
Não tenho vontade de chorar  ( ) ( ) ( ) ( )  Tenho sentido vontade de chorar
                              ↑   ↑   ↑   ↑
                              0   1   2   3
```

### Exemplo Completo de Inserção

```sql
INSERT INTO testes_templates (
  nome, sigla, tipo,
  descricao,
  faixa_etaria_min, faixa_etaria_max,
  tempo_medio_aplicacao,
  questoes, escalas_resposta, regras_calculo, interpretacao,
  publico, ativo
) VALUES (
  'Escala Baptista de Depressão - Versão Adulto',
  'EBADEP-A',
  'escala_likert',
  'Escala de avaliação de sintomas depressivos em adultos utilizando formato de diferencial semântico.',
  18, NULL, 15,

  -- QUESTOES (45 itens bipolares)
  $$[
    {"numero": 1, "secao": "EBADEP-A", "texto_esquerda": "Não tenho vontade de chorar", "texto_direita": "Tenho sentido vontade de chorar", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 1},
    {"numero": 2, "secao": "EBADEP-A", "texto_esquerda": "Tenho me sentido muito bem", "texto_direita": "Tenho estado mais angustiado", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 2},
    {"numero": 3, "secao": "EBADEP-A", "texto_esquerda": "Consigo realizar tarefas", "texto_direita": "Sinto-me mais impotente para realizar tarefas", "tipo_resposta": "diferencial_0_3", "invertida": false, "obrigatoria": true, "peso": 1, "ordem": 3}
    -- ... demais 42 questões
  ]$$::jsonb,

  -- ESCALAS_RESPOSTA (diferencial 0-3)
  $${
    "diferencial_0_3": [
      {"valor": 0, "texto": "Primeira opção (forte)", "descricao": "Concordo fortemente com a afirmação positiva/saudável"},
      {"valor": 1, "texto": "Segunda opção (moderada)", "descricao": "Concordo moderadamente com a afirmação positiva/saudável"},
      {"valor": 2, "texto": "Terceira opção (moderada)", "descricao": "Concordo moderadamente com a afirmação negativa/depressiva"},
      {"valor": 3, "texto": "Quarta opção (forte)", "descricao": "Concordo fortemente com a afirmação negativa/depressiva"}
    ]
  }$$::jsonb,

  -- REGRAS_CALCULO (percentil lookup)
  $${
    "tipo": "percentil_lookup",
    "score_total": "soma_simples",
    "range_score": {"min": 0, "max": 135},
    "tabela_percentil": {
      "0": 1, "1": 1, "2": 1, "3": 2, "4": 2, "5": 2,
      "6": 3, "7": 3, "8": 4, "9": 5, "10": 6,
      "...": "... (mapeamento completo de 0-135)",
      "135": 99
    },
    "interpretacao_por_score": [
      {"min": 0, "max": 59, "classificacao": "SINTOMATOLOGIA DEPRESSIVA", "percentil_range": "1-71"},
      {"min": 60, "max": 76, "classificacao": "SINTOMATOLOGIA DEPRESSIVA LEVE", "percentil_range": "72-87"},
      {"min": 77, "max": 110, "classificacao": "SINTOMATOLOGIA DEPRESSIVA MODERADA", "percentil_range": "88-99"},
      {"min": 111, "max": 135, "classificacao": "SINTOMATOLOGIA DEPRESSIVA SEVERA", "percentil_range": "99"}
    ]
  }$$::jsonb,

  -- INTERPRETACAO (com instruções de aplicação)
  $${
    "notas": "A EBADEP-A avalia sintomas depressivos em adultos através de 45 itens em formato de diferencial semântico.",
    "instrucoes_aplicacao": "Leia atentamente as duas frases opostas em cada linha e clique no círculo que melhor representa como você vem se sentindo em um período de duas semanas, inclusive hoje. O círculo que você escolher deve estar mais próximo da frase que melhor descreve seu estado.",
    "faixas": [
      {
        "pontuacao_min": 0,
        "pontuacao_max": 59,
        "classificacao": "SINTOMATOLOGIA DEPRESSIVA",
        "descricao": "Sintomas depressivos dentro da faixa esperada para população geral.",
        "recomendacao": "Monitoramento de rotina."
      },
      {
        "pontuacao_min": 60,
        "pontuacao_max": 76,
        "classificacao": "SINTOMATOLOGIA DEPRESSIVA LEVE",
        "descricao": "Presença de sintomas depressivos em nível leve.",
        "recomendacao": "Avaliação clínica mais aprofundada."
      },
      {
        "pontuacao_min": 77,
        "pontuacao_max": 110,
        "classificacao": "SINTOMATOLOGIA DEPRESSIVA MODERADA",
        "descricao": "Sintomas depressivos significativos que requerem atenção clínica.",
        "recomendacao": "Acompanhamento psicológico e/ou psiquiátrico."
      },
      {
        "pontuacao_min": 111,
        "pontuacao_max": 135,
        "classificacao": "SINTOMATOLOGIA DEPRESSIVA SEVERA",
        "descricao": "Sintomas depressivos graves que requerem intervenção imediata.",
        "recomendacao": "Intervenção clínica urgente. Encaminhamento para avaliação psiquiátrica."
      }
    ],
    "alertas_clinicos": [
      {
        "item": 29,
        "conteudo": "Ideação suicida",
        "acao": "Se pontuação 2 ou 3: avaliar risco de suicídio imediatamente."
      }
    ]
  }$$::jsonb,

  true, true
);
```

### Pontos-Chave para Testes Bipolares

1. **Campos de questão:**
   - Use `texto_esquerda` (afirmação positiva/saudável)
   - Use `texto_direita` (afirmação negativa/sintomática)
   - NÃO use campo `texto` único

2. **Tipo de resposta:**
   - `tipo_resposta: "diferencial_0_3"` para escala 0-3
   - Pode ser adaptado para outras escalas (0-4, 0-5, etc.)

3. **Escalas de resposta:**
   - Defina escala correspondente em `escalas_resposta`
   - Valores numéricos (0, 1, 2, 3)
   - Incluir descrições claras de cada ponto

4. **Instruções:**
   - CRÍTICO: Incluir `instrucoes_aplicacao` em `interpretacao` (ver Seção 7 para detalhes)
   - Explicar o formato bipolar claramente
   - Indicar período de referência (ex: "últimas duas semanas")
   - Recomendado: incluir `exemplos_resposta` com 4 exemplos visuais (ver Seção 7.3)

5. **Visualização:**
   - Sistema renderiza automaticamente em formato horizontal
   - Layout: [Texto Esquerda] ( ) ( ) ( ) ( ) [Texto Direita]
   - Valores aparecem abaixo das opções

6. **Tabela de percentis:**
   - Incluir mapeamento completo (score → percentil)
   - Baseado em amostra normativa do teste
   - Cada score de 0 até max deve ter percentil

---

## 7. Exibição de Instruções Antes do Teste

### 7.1 Visão Geral

O sistema possui um componente **TestInstructions** que exibe instruções e exemplos visuais ANTES do teste começar. Isso é especialmente útil para testes com formatos especiais (bipolar, diferencial semântico, etc.) onde o usuário precisa entender como responder.

**Componente**: `/components/test/TestInstructions.tsx`
**Integração**: Automática no modo handoff (`/app/aplicar/[testeId]/handoff/page.tsx`)

### 7.2 Como Funciona

1. **Teste é aberto** no modo handoff (aplicação ao paciente)
2. **Sistema verifica** se existe `interpretacao.instrucoes_aplicacao` no teste_template
3. **Se existe**: Exibe tela de instruções com exemplos visuais
4. **Usuário lê** instruções e exemplos
5. **Usuário clica** "Iniciar Teste"
6. **Sistema exibe** primeira questão

### 7.3 Campos Necessários no `interpretacao`

#### Campo Obrigatório: `instrucoes_aplicacao`

```json
{
  "interpretacao": {
    "instrucoes_aplicacao": "Texto explicativo sobre como responder o teste. Exemplo: 'Leia atentamente as duas frases opostas em cada linha e marque a opção que melhor representa como você vem se sentindo nas últimas duas semanas.'"
  }
}
```

**Quando usar:**
- Testes com formato especial (bipolar, diferencial semântico)
- Testes que requerem período de referência específico ("últimas duas semanas")
- Testes com instruções complexas de preenchimento

#### Campo Opcional: `exemplos_resposta`

Array de exemplos visuais mostrando como marcar as respostas:

```json
{
  "interpretacao": {
    "instrucoes_aplicacao": "...",
    "exemplos_resposta": [
      {
        "texto_esquerda": "Estou me sentindo alegre",
        "texto_direita": "Estou me sentindo triste",
        "marcacao": 0,
        "descricao": "Se você está se sentindo muito alegre, marque a primeira opção"
      },
      {
        "texto_esquerda": "Estou me sentindo alegre",
        "texto_direita": "Estou me sentindo triste",
        "marcacao": 1,
        "descricao": "Se você está se sentindo alegre, marque a segunda opção"
      },
      {
        "texto_esquerda": "Estou me sentindo alegre",
        "texto_direita": "Estou me sentindo triste",
        "marcacao": 2,
        "descricao": "Se você está se sentindo triste, marque a terceira opção"
      },
      {
        "texto_esquerda": "Estou me sentindo alegre",
        "texto_direita": "Estou me sentindo triste",
        "marcacao": 3,
        "descricao": "Se você está se sentindo muito triste, marque a quarta opção"
      }
    ]
  }
}
```

**Estrutura de cada exemplo:**
- `texto_esquerda`: Texto do lado esquerdo (statement positivo/saudável)
- `texto_direita`: Texto do lado direito (statement negativo/sintomático)
- `marcacao`: Qual opção está marcada (0, 1, 2, ou 3)
- `descricao`: Explicação de quando usar essa opção

**Quando usar:**
- **Obrigatório** para testes bipolares/diferenciais semânticos
- Recomendado quando o formato de resposta não é intuitivo
- Use exemplos que representem bem a escala de respostas

**Quando NÃO usar:**
- Testes Likert padrão (formato já é familiar)
- Múltipla escolha simples
- Se o formato for autoexplicativo

### 7.4 Exemplo Completo: EBADEP-A

```sql
INSERT INTO testes_templates (
  nome,
  sigla,
  interpretacao
) VALUES (
  'Escala Baptista de Depressão - Versão Adulto',
  'EBADEP-A',
  $${
    "notas": "Avalia sintomas depressivos através de 45 itens bipolares.",
    "instrucoes_aplicacao": "Leia atentamente as duas frases opostas em cada linha e clique no círculo que melhor representa como você vem se sentindo em um período de duas semanas, inclusive hoje. O círculo que você escolher deve estar mais próximo da frase que melhor descreve seu estado.",
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
    "faixas": [...]
  }$$::jsonb
);
```

### 7.5 Fallback Automático

Se você **não incluir** `exemplos_resposta`, o sistema usa exemplos padrão genéricos:

```typescript
// Exemplos padrão (fallback)
[
  {
    texto_esquerda: "Estou me sentindo alegre",
    texto_direita: "Estou me sentindo triste",
    marcacao: 0,
    descricao: "Se você tem se sentido muito alegre, marque a primeira opção"
  },
  // ... (mais 3 exemplos)
]
```

**Quando aceitar o fallback:**
- Testes em desenvolvimento/teste rápido
- Quando os exemplos genéricos são suficientes

**Quando criar exemplos customizados:**
- Testes para produção
- Quando o conteúdo específico do teste ajuda na compreensão
- Quando os exemplos devem usar a mesma linguagem/terminologia do teste

### 7.6 Verificação Visual

Após inserir o teste, teste a exibição:

1. Crie um teste aplicado para um paciente
2. Abra no modo handoff
3. Verifique se a tela de instruções aparece
4. Verifique se os exemplos visuais estão corretos:
   - Layout bipolar (texto esquerda | círculos | texto direita)
   - Círculo correto está marcado conforme `marcacao`
   - Descrição está clara
5. Clique "Iniciar Teste"
6. Verifique se a primeira questão aparece no mesmo formato

### 7.7 Documentos de Referência

- **Implementação completa**: `/tests/EBADEP_A_IMPLEMENTATION_COMPLETE.md`
- **Instruções de integração**: `/tests/INSTRUCTIONS_INTEGRATION_TODO.md`
- **Componente TestInstructions**: `/components/test/TestInstructions.tsx`
- **Exemplo de teste bipolar**: `/tests/ebadep_a_insert.sql`

---

## 8. Checklist de Inserção

### Antes
- [ ] Verificar se teste já existe: `SELECT * FROM testes_templates WHERE sigla = 'XXX'`
- [ ] Preparar JSON das questões com todos os campos obrigatórios
- [ ] Definir escalas de resposta
- [ ] Definir regras de cálculo e seções
- [ ] Definir faixas de interpretação
- [ ] Se formato especial: incluir `instrucoes_aplicacao` e `exemplos_resposta` em `interpretacao`

### Após
- [ ] Executar migration
- [ ] Verificar: `SELECT sigla, jsonb_array_length(questoes) FROM testes_templates WHERE sigla = 'XXX'`
- [ ] Testar aplicação do teste no sistema
- [ ] Verificar cálculo de pontuações
- [ ] Se tem instruções: verificar exibição no modo handoff

---

## 9. Testes Existentes no Sistema

| Sigla | Tipo | Questões | Formato Especial |
|-------|------|----------|------------------|
| EAE | escala_likert | 10 | - |
| PSA | escala_likert | 60 | - |
| AQ | multipla_escolha | 50 | - |
| ETDAH-AD | escala_likert | 69 | - |
| SRS-2 | escala_likert | 65 | - |
| EPF-TDAH | escala_likert | 66 | - |
| BDEFS | escala_likert | 77 | - |
| BDI-II | multipla_escolha | 21 | Gravidade 0-3 |
| MCMI-IV | multipla_escolha | 195 | - |
| BHS | multipla_escolha | 20 | Gabarito binário |
| MASC | escala_likert | 39 | - |
| CDI | escala_likert | 20 | - |
| AQ-50 | escala_likert | 50 | - |
| CAT-Q | escala_likert | 25 | Seções |
| RBQ-2A | escala_likert | 20 | - |
| AASP | escala_likert | 60 | Quadrantes |
| SP2-C | escala_likert | 86 | - |
| **EBADEP-A** | **escala_likert** | **45** | **Bipolar/Diferencial** |

---

**Versão**: 1.1
**Última Atualização**: Dezembro 2024
