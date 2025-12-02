# Guia: Inserindo Testes de Quadrantes no Sistema

Este documento explica como inserir testes psicológicos que utilizam o sistema de **quadrantes** (como o AASP - Perfil Sensorial do Adulto/Adolescente).

## Estrutura Básica

Testes de quadrantes agrupam questões em categorias (quadrantes) e calculam pontuações separadas para cada um. O sistema suporta:

- Escala Likert (1-5 ou outras)
- Múltiplos quadrantes com questões específicas
- Normas por faixa etária
- Classificações comparativas (muito menos, menos, semelhante, mais, muito mais)

---

## 1. Estrutura do Template

### 1.1 Campos Principais

```sql
INSERT INTO testes_templates (
  id,                      -- UUID único
  nome,                    -- Nome curto (ex: "Perfil Sensorial")
  nome_completo,           -- Nome completo do teste
  sigla,                   -- Sigla (ex: "AASP")
  versao,                  -- Versão do teste
  autor,                   -- Autor(es)
  tipo,                    -- Usar 'escala_likert'
  faixa_etaria_min,        -- Idade mínima
  faixa_etaria_max,        -- Idade máxima
  tempo_medio_aplicacao,   -- Tempo em minutos
  aplicacao_permitida,     -- ARRAY['presencial', 'remota']
  questoes,                -- JSON com todas as questões
  escalas_resposta,        -- JSON com a escala de respostas
  regras_calculo,          -- JSON com regras de cálculo por quadrantes
  interpretacao,           -- JSON com normas e classificações
  publico,                 -- true/false
  ativo                    -- true/false
)
```

---

## 2. Definindo as Questões

Cada questão deve conter o campo `quadrante` indicando a qual quadrante pertence:

```json
{
  "numero": 1,
  "texto": "Texto da questão aqui",
  "secao": "nome_da_secao",
  "quadrante": "nome_do_quadrante",
  "tipo_resposta": "likert_1_5",
  "invertida": false,
  "obrigatoria": true,
  "peso": 1,
  "ordem": 1
}
```

### Campos Importantes:
- **numero**: Número sequencial da questão (1, 2, 3...)
- **quadrante**: Identificador do quadrante (ex: `baixo_registro`, `procura_sensacao`)
- **secao**: Agrupamento visual opcional (ex: `processamento_visual`)
- **tipo_resposta**: Deve corresponder à chave em `escalas_resposta`

---

## 3. Escala de Respostas

Defina a escala Likert que será usada:

```json
{
  "likert_1_5": [
    {"valor": 1, "texto": "Quase nunca"},
    {"valor": 2, "texto": "Raramente"},
    {"valor": 3, "texto": "Ocasionalmente"},
    {"valor": 4, "texto": "Frequentemente"},
    {"valor": 5, "texto": "Quase sempre"}
  ]
}
```

---

## 4. Regras de Cálculo (regras_calculo)

Este é o campo mais importante para testes de quadrantes:

```json
{
  "tipo": "quadrantes",
  "quadrantes": {
    "nome_quadrante_1": {
      "nome": "Nome Legível do Quadrante",
      "descricao": "Descrição do que este quadrante mede",
      "questoes": [3, 6, 12, 15, 21],
      "peso": 1
    },
    "nome_quadrante_2": {
      "nome": "Outro Quadrante",
      "descricao": "Descrição",
      "questoes": [2, 4, 8, 10, 14],
      "peso": 1
    }
  },
  "max_por_quadrante": 75
}
```

### Campos:
- **tipo**: Deve ser `"quadrantes"`
- **quadrantes**: Objeto com cada quadrante
  - **nome**: Nome para exibição
  - **descricao**: Explicação clínica do quadrante
  - **questoes**: Array com os números das questões deste quadrante
  - **peso**: Multiplicador (geralmente 1)
- **max_por_quadrante**: Pontuação máxima possível (nº questões × valor máximo da escala)

---

## 5. Interpretação e Normas (interpretacao)

Define as faixas normativas por idade:

```json
{
  "faixas_etarias": {
    "adolescente": {
      "idade_min": 11,
      "idade_max": 17,
      "quadrantes": {
        "nome_quadrante_1": {
          "muito_menos": {"min": 15, "max": 18},
          "menos": {"min": 19, "max": 26},
          "semelhante": {"min": 27, "max": 40},
          "mais": {"min": 41, "max": 51},
          "muito_mais": {"min": 52, "max": 75}
        }
      }
    },
    "adulto": {
      "idade_min": 18,
      "idade_max": 64,
      "quadrantes": {
        "nome_quadrante_1": {
          "muito_menos": {"min": 15, "max": 18},
          "menos": {"min": 19, "max": 23},
          "semelhante": {"min": 24, "max": 35},
          "mais": {"min": 36, "max": 44},
          "muito_mais": {"min": 45, "max": 75}
        }
      }
    }
  },
  "classificacoes": {
    "muito_menos": {
      "nome": "Muito menos que a maioria das pessoas",
      "simbolo": "--",
      "descricao": "Pontuação significativamente abaixo da média."
    },
    "menos": {
      "nome": "Menos que a maioria das pessoas",
      "simbolo": "-",
      "descricao": "Pontuação abaixo da média."
    },
    "semelhante": {
      "nome": "Semelhante à maioria das pessoas",
      "simbolo": "=",
      "descricao": "Pontuação dentro da faixa típica."
    },
    "mais": {
      "nome": "Mais que a maioria das pessoas",
      "simbolo": "+",
      "descricao": "Pontuação acima da média."
    },
    "muito_mais": {
      "nome": "Muito mais que a maioria das pessoas",
      "simbolo": "++",
      "descricao": "Pontuação significativamente acima da média."
    }
  },
  "notas": "Texto explicativo sobre o teste e sua interpretação."
}
```

---

## 6. Exemplo Completo Simplificado

```sql
INSERT INTO testes_templates (
  id,
  nome,
  sigla,
  tipo,
  questoes,
  escalas_resposta,
  regras_calculo,
  interpretacao
) VALUES (
  'uuid-aqui',
  'Meu Teste de Quadrantes',
  'MTQ',
  'escala_likert',

  -- QUESTÕES (10 questões, 2 quadrantes)
  $$[
    {"numero": 1, "texto": "Questão 1", "quadrante": "quadrante_a", "tipo_resposta": "likert_1_5", "obrigatoria": true},
    {"numero": 2, "texto": "Questão 2", "quadrante": "quadrante_b", "tipo_resposta": "likert_1_5", "obrigatoria": true},
    {"numero": 3, "texto": "Questão 3", "quadrante": "quadrante_a", "tipo_resposta": "likert_1_5", "obrigatoria": true},
    {"numero": 4, "texto": "Questão 4", "quadrante": "quadrante_b", "tipo_resposta": "likert_1_5", "obrigatoria": true},
    {"numero": 5, "texto": "Questão 5", "quadrante": "quadrante_a", "tipo_resposta": "likert_1_5", "obrigatoria": true},
    {"numero": 6, "texto": "Questão 6", "quadrante": "quadrante_b", "tipo_resposta": "likert_1_5", "obrigatoria": true},
    {"numero": 7, "texto": "Questão 7", "quadrante": "quadrante_a", "tipo_resposta": "likert_1_5", "obrigatoria": true},
    {"numero": 8, "texto": "Questão 8", "quadrante": "quadrante_b", "tipo_resposta": "likert_1_5", "obrigatoria": true},
    {"numero": 9, "texto": "Questão 9", "quadrante": "quadrante_a", "tipo_resposta": "likert_1_5", "obrigatoria": true},
    {"numero": 10, "texto": "Questão 10", "quadrante": "quadrante_b", "tipo_resposta": "likert_1_5", "obrigatoria": true}
  ]$$::jsonb,

  -- ESCALA
  $${"likert_1_5": [
    {"valor": 1, "texto": "Nunca"},
    {"valor": 2, "texto": "Raramente"},
    {"valor": 3, "texto": "Às vezes"},
    {"valor": 4, "texto": "Frequentemente"},
    {"valor": 5, "texto": "Sempre"}
  ]}$$::jsonb,

  -- REGRAS DE CÁLCULO
  $${
    "tipo": "quadrantes",
    "quadrantes": {
      "quadrante_a": {
        "nome": "Quadrante A",
        "descricao": "Descrição do quadrante A",
        "questoes": [1, 3, 5, 7, 9],
        "peso": 1
      },
      "quadrante_b": {
        "nome": "Quadrante B",
        "descricao": "Descrição do quadrante B",
        "questoes": [2, 4, 6, 8, 10],
        "peso": 1
      }
    },
    "max_por_quadrante": 25
  }$$::jsonb,

  -- INTERPRETAÇÃO
  $${
    "faixas_etarias": {
      "adulto": {
        "idade_min": 18,
        "idade_max": 99,
        "quadrantes": {
          "quadrante_a": {
            "muito_menos": {"min": 5, "max": 8},
            "menos": {"min": 9, "max": 12},
            "semelhante": {"min": 13, "max": 17},
            "mais": {"min": 18, "max": 21},
            "muito_mais": {"min": 22, "max": 25}
          },
          "quadrante_b": {
            "muito_menos": {"min": 5, "max": 8},
            "menos": {"min": 9, "max": 12},
            "semelhante": {"min": 13, "max": 17},
            "mais": {"min": 18, "max": 21},
            "muito_mais": {"min": 22, "max": 25}
          }
        }
      }
    },
    "classificacoes": {
      "muito_menos": {"nome": "Muito menos que a maioria", "simbolo": "--"},
      "menos": {"nome": "Menos que a maioria", "simbolo": "-"},
      "semelhante": {"nome": "Semelhante à maioria", "simbolo": "="},
      "mais": {"nome": "Mais que a maioria", "simbolo": "+"},
      "muito_mais": {"nome": "Muito mais que a maioria", "simbolo": "++"}
    }
  }$$::jsonb
);
```

---

## 7. Como o Sistema Calcula

1. **Coleta de Respostas**: O frontend salva respostas como `{q1: 3, q2: 4, q3: 2, ...}`

2. **Cálculo por Quadrante**: A função `calculateQuadrantScores()` em `lib/calculation/calculator.ts`:
   - Agrupa as questões por quadrante
   - Soma os valores das respostas de cada quadrante
   - Retorna `{total: X, secoes: {quadrante_a: Y, quadrante_b: Z}}`

3. **Classificação**: O componente de resultados compara cada pontuação com as faixas normativas da idade do paciente

---

## 8. Componente de Resultados

Para testes de quadrantes com visualização personalizada, crie um componente em:
```
components/results/[sigla]/[Sigla]Results.tsx
```

E registre no `app/(dashboard)/resultados/[id]/page.tsx`:
```tsx
const isNovoTeste = resultado.teste_template.sigla === 'SIGLA'

// No return:
{isNovoTeste ? (
  <NovoTesteResults ... />
) : ...}
```

---

## 9. Checklist de Inserção

- [ ] Definir UUID único para o teste
- [ ] Listar todas as questões com seus quadrantes
- [ ] Definir escala de resposta
- [ ] Configurar `regras_calculo` com `tipo: "quadrantes"`
- [ ] Listar questões de cada quadrante em `regras_calculo.quadrantes`
- [ ] Calcular `max_por_quadrante` (nº questões × valor máximo)
- [ ] Definir faixas normativas por idade em `interpretacao`
- [ ] Incluir classificações com nomes e símbolos
- [ ] Testar cálculo com dados de exemplo
- [ ] Criar componente de resultados personalizado (opcional)

---

## Referência

Veja o arquivo `supabase/migrations/010_aasp_sensory_profile.sql` para um exemplo completo e funcional do AASP.
