# Flexibilidade na Escolaridade dos Pacientes

## Visão Geral

O sistema agora suporta **duas formas** de registrar a escolaridade dos pacientes:

1. **Anos de Estudo** (`escolaridade_anos`) - Número direto de anos (0-30)
2. **Nível Educacional Brasileiro** (`escolaridade_nivel`) - Níveis padronizados do sistema educacional brasileiro

## Opções de Nível Educacional

| Valor do Campo | Descrição | Anos Equivalentes |
|----------------|-----------|-------------------|
| `fundamental_incompleto` | Ensino Fundamental Incompleto | ~4 anos |
| `fundamental_completo` | Ensino Fundamental Completo | 9 anos |
| `medio_incompleto` | Ensino Médio Incompleto | ~10 anos |
| `medio_completo` | Ensino Médio Completo | 12 anos |
| `superior_incompleto` | Ensino Superior Incompleto | ~14 anos |
| `superior_completo` | Ensino Superior Completo | 16 anos |
| `pos_graduacao` | Pós-Graduação | 18 anos |

## Mudanças no Banco de Dados

### Migration 004 - Make Escolaridade Flexible

Execute o SQL abaixo no Supabase Dashboard:

```sql
-- Make escolaridade_anos nullable
ALTER TABLE pacientes
  ALTER COLUMN escolaridade_anos DROP NOT NULL;

-- Require at least one field
ALTER TABLE pacientes
  ADD CONSTRAINT pacientes_escolaridade_required
  CHECK (
    escolaridade_anos IS NOT NULL OR
    escolaridade_nivel IS NOT NULL
  );

-- Helper function to convert nivel to anos
CREATE OR REPLACE FUNCTION escolaridade_nivel_to_anos(nivel VARCHAR(50))
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN nivel ILIKE '%fundamental incompleto%' OR nivel = 'fundamental_incompleto' THEN 4
    WHEN nivel ILIKE '%fundamental%' OR nivel = 'fundamental_completo' THEN 9
    WHEN nivel ILIKE '%médio incompleto%' OR nivel = 'medio_incompleto' THEN 10
    WHEN nivel ILIKE '%médio%' OR nivel ILIKE '%medio%' OR nivel = 'medio_completo' THEN 12
    WHEN nivel ILIKE '%superior incompleto%' OR nivel = 'superior_incompleto' THEN 14
    WHEN nivel ILIKE '%superior%' OR nivel = 'superior_completo' THEN 16
    WHEN nivel ILIKE '%pós%' OR nivel ILIKE '%pos%' OR nivel = 'pos_graduacao' THEN 18
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- View with computed years
CREATE OR REPLACE VIEW pacientes_com_escolaridade AS
SELECT
  p.*,
  COALESCE(p.escolaridade_anos, escolaridade_nivel_to_anos(p.escolaridade_nivel)) as anos_estudo_efetivos
FROM pacientes p;
```

### Aplicar Migration

1. Acesse: https://supabase.com/dashboard/project/vndbzqafzuqdyxbayrdd/sql
2. Cole o SQL acima
3. Execute (Run)

## Validação na API

A API foi atualizada para aceitar qualquer uma das opções:

```typescript
// ✅ VÁLIDO - Apenas anos
{
  "nome_completo": "João Silva",
  "data_nascimento": "1990-01-01",
  "sexo": "M",
  "escolaridade_anos": 12
}

// ✅ VÁLIDO - Apenas nível
{
  "nome_completo": "Maria Santos",
  "data_nascimento": "1985-05-15",
  "sexo": "F",
  "escolaridade_nivel": "superior_completo"
}

// ✅ VÁLIDO - Ambos (anos tem prioridade)
{
  "nome_completo": "Pedro Oliveira",
  "data_nascimento": "1992-03-20",
  "sexo": "M",
  "escolaridade_anos": 16,
  "escolaridade_nivel": "superior_completo"
}

// ❌ INVÁLIDO - Nenhum informado
{
  "nome_completo": "Ana Costa",
  "data_nascimento": "1988-07-10",
  "sexo": "F"
}
```

## Como Usar na Interface

### Opção 1: Campo de Anos
```html
<input
  type="number"
  name="escolaridade_anos"
  min="0"
  max="30"
  placeholder="Anos de estudo"
/>
```

### Opção 2: Select de Nível
```html
<select name="escolaridade_nivel">
  <option value="">Selecione o nível</option>
  <option value="fundamental_incompleto">Ensino Fundamental Incompleto</option>
  <option value="fundamental_completo">Ensino Fundamental Completo</option>
  <option value="medio_incompleto">Ensino Médio Incompleto</option>
  <option value="medio_completo">Ensino Médio Completo</option>
  <option value="superior_incompleto">Ensino Superior Incompleto</option>
  <option value="superior_completo">Ensino Superior Completo</option>
  <option value="pos_graduacao">Pós-Graduação</option>
</select>
```

### Opção 3: Toggle entre os dois (Recomendado)
```typescript
const [escolaridadeMode, setEscolaridadeMode] = useState<'anos' | 'nivel'>('nivel')

// Mostrar campo apropriado baseado no mode
{escolaridadeMode === 'anos' ? (
  <input type="number" name="escolaridade_anos" />
) : (
  <select name="escolaridade_nivel">...</select>
)}

// Botão para alternar
<button onClick={() => setEscolaridadeMode(mode === 'anos' ? 'nivel' : 'anos')}>
  Usar {escolaridadeMode === 'anos' ? 'Nível' : 'Anos'}
</button>
```

## Consultas com Anos Efetivos

Use a view `pacientes_com_escolaridade` para queries que precisam dos anos:

```sql
-- Buscar pacientes com anos calculados
SELECT
  nome_completo,
  anos_estudo_efetivos
FROM pacientes_com_escolaridade
WHERE anos_estudo_efetivos >= 12;

-- Normatização de testes
SELECT
  p.nome_completo,
  buscar_faixa_normativa(
    teste_id,
    idade,
    p.anos_estudo_efetivos,  -- Usa anos ou converte nível
    sexo
  ) as norma
FROM pacientes_com_escolaridade p;
```

## Benefícios

1. **Flexibilidade**: Usuários podem escolher o método mais conveniente
2. **Precisão**: Nível educacional é mais familiar para brasileiros
3. **Compatibilidade**: Anos diretos ainda funcionam para casos específicos
4. **Conversão Automática**: Sistema converte nível em anos quando necessário
5. **Validação**: Garante que pelo menos um campo seja preenchido
