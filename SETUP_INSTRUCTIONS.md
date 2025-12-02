# Setup Instructions - NeuroTest Platform

## Passo 1: Aplicar Seed Data no Supabase

1. Acesse o Supabase SQL Editor: https://supabase.com/dashboard/project/vndbzqafzuqdyxbayrdd/sql

2. Execute o seguinte SQL:

```sql
-- Limpar dados existentes (se necessário)
TRUNCATE TABLE logs_auditoria, testes_aplicados, tabelas_normativas, testes_templates, pacientes, psicologos, clinicas CASCADE;

-- Inserir clínica de teste
INSERT INTO clinicas (id, nome, cnpj, ativo) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Clínica Neuropsicológica Exemplo', '12.345.678/0001-90', true);

-- Inserir psicólogo de teste
-- Email: joao@exemplo.com
-- Senha: senha123
-- Hash gerado com bcrypt rounds=10
INSERT INTO psicologos (id, clinica_id, nome_completo, email, senha_hash, crp, crp_estado, especialidades, ativo) VALUES
('550e8400-e29b-41d4-a716-446655440002',
 '550e8400-e29b-41d4-a716-446655440001',
 'Dr. João Silva',
 'joao@exemplo.com',
 '$2a$10$GE8gM43Q8w/8pJ5rJ57tsegWUty64XWD4rdAH2FveuDfZ8VqTW2mq',
 '06/12345',
 'SP',
 ARRAY['Neuropsicologia', 'Avaliação Cognitiva'],
 true);

-- Inserir template de teste (Escala de Ansiedade - 10 questões Likert)
INSERT INTO testes_templates (
  id,
  nome,
  nome_completo,
  sigla,
  tipo,
  tempo_medio_aplicacao,
  questoes,
  escalas_resposta,
  regras_calculo,
  publico,
  criado_por
) VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'EAE',
  'Escala de Ansiedade Exemplo',
  'EAE',
  'escala_likert',
  15,
  '[
    {"numero": 1, "texto": "Sinto-me tenso ou contraído", "tipo": "likert", "invertida": false},
    {"numero": 2, "texto": "Tenho a sensação de que algo ruim vai acontecer", "tipo": "likert", "invertida": false},
    {"numero": 3, "texto": "Preocupo-me demais com as situações", "tipo": "likert", "invertida": false},
    {"numero": 4, "texto": "Consigo me manter calmo facilmente", "tipo": "likert", "invertida": true},
    {"numero": 5, "texto": "Sinto medo sem motivo aparente", "tipo": "likert", "invertida": false},
    {"numero": 6, "texto": "Fico irritado com facilidade", "tipo": "likert", "invertida": false},
    {"numero": 7, "texto": "Tenho dificuldade para relaxar", "tipo": "likert", "invertida": false},
    {"numero": 8, "texto": "Sinto-me confiante sobre o futuro", "tipo": "likert", "invertida": true},
    {"numero": 9, "texto": "Tenho pensamentos negativos repetitivos", "tipo": "likert", "invertida": false},
    {"numero": 10, "texto": "Durmo bem e acordo descansado", "tipo": "likert", "invertida": true}
  ]'::jsonb,
  '{
    "likert_0_4": [
      {"valor": 0, "texto": "Nunca"},
      {"valor": 1, "texto": "Raramente"},
      {"valor": 2, "texto": "Às vezes"},
      {"valor": 3, "texto": "Frequentemente"},
      {"valor": 4, "texto": "Sempre"}
    ]
  }'::jsonb,
  '{
    "tipo": "soma_simples",
    "escala_maxima": 5,
    "pontuacao_minima": 10,
    "pontuacao_maxima": 50
  }'::jsonb,
  true,
  '550e8400-e29b-41d4-a716-446655440002'
);

-- Inserir tabela normativa
INSERT INTO tabelas_normativas (
  id,
  teste_template_id,
  nome,
  pais,
  regiao,
  ano_coleta,
  tamanho_amostra,
  variaveis_estratificacao,
  faixas
) VALUES (
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440003',
  'Normas Brasileiras - Adultos',
  'Brasil',
  'Nacional',
  2024,
  500,
  ARRAY['idade', 'escolaridade', 'sexo'],
  '[
    {
      "idade_min": 18,
      "idade_max": 65,
      "escolaridade_min": 0,
      "escolaridade_max": 30,
      "sexo": "ambos",
      "n": 500,
      "media": 25.5,
      "desvio_padrao": 7.2,
      "percentis": {
        "5": 15,
        "10": 17,
        "25": 20,
        "50": 25,
        "75": 31,
        "90": 35,
        "95": 38
      }
    }
  ]'::jsonb
);

-- Inserir pacientes de exemplo
INSERT INTO pacientes (id, clinica_id, psicologo_responsavel_id, nome_completo, data_nascimento, escolaridade_anos, sexo, ativo) VALUES
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Maria Santos', '1985-06-15', 12, 'F', true),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Pedro Oliveira', '1990-03-22', 16, 'M', true),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Ana Costa', '1978-11-08', 10, 'F', true);
```

## Passo 2: Verificar se os dados foram inseridos

Execute esta query para verificar:

```sql
SELECT
  p.nome_completo,
  p.email,
  c.nome as clinica,
  p.ativo
FROM psicologos p
JOIN clinicas c ON c.id = p.clinica_id;
```

Deve retornar:
- **Nome**: Dr. João Silva
- **Email**: joao@exemplo.com
- **Clínica**: Clínica Neuropsicológica Exemplo
- **Ativo**: true

## Passo 3: Iniciar o servidor

```bash
npm run dev
```

## Passo 4: Fazer login

- **URL**: http://localhost:3000
- **Email**: joao@exemplo.com
- **Senha**: senha123

## Troubleshooting

### Se o login ainda não funcionar:

1. Verifique se o hash da senha está correto:
```sql
SELECT senha_hash FROM psicologos WHERE email = 'joao@exemplo.com';
```

Deve retornar: `$2a$10$GE8gM43Q8w/8pJ5rJ57tsegWUty64XWD4rdAH2FveuDfZ8VqTW2mq`

2. Verifique os logs do navegador (Console) para ver o erro exato

3. Verifique os logs do servidor Next.js

### Se quiser gerar um novo hash de senha:

Use este código Node.js:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('senha123', 10);
console.log(hash);
```

Depois atualize no banco:

```sql
UPDATE psicologos
SET senha_hash = 'NOVO_HASH_AQUI'
WHERE email = 'joao@exemplo.com';
```

## Estrutura de Teste Completa

Após o login, você pode:

1. **Ver Dashboard** - Estatísticas e ações rápidas
2. **Criar Paciente** - Formulário completo com validação
3. **Listar Pacientes** - 3 pacientes de exemplo já criados
4. **Editar Paciente** - Modificar dados existentes
5. **Aplicar Teste** - Iniciar avaliação (em desenvolvimento)
6. **Ver Resultados** - Com normalização automática (em desenvolvimento)

## Dados de Teste Disponíveis

- **1 Clínica**: Clínica Neuropsicológica Exemplo
- **1 Psicólogo**: Dr. João Silva (joao@exemplo.com)
- **3 Pacientes**: Maria Santos, Pedro Oliveira, Ana Costa
- **1 Teste**: Escala de Ansiedade Exemplo (10 questões Likert)
- **1 Tabela Normativa**: Normas Brasileiras - Adultos

## Fluxo de Teste Completo

```
Login → Dashboard → Novo Paciente →
Preencher Formulário → Salvar →
Lista de Pacientes → Selecionar Paciente →
Aplicar Teste → Responder Questões →
Finalizar → Ver Resultados com Normalização
```
