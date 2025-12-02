# Database Access Instructions

## Remote Supabase Database Access

### Connection Details
- **URL**: `https://vndbzqafzuqdyxbayrdd.supabase.co`
- **Credentials**: Stored in `.env.local`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Access Methods

#### 1. Using Supabase JS Client (Recommended)
```javascript
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Example: Query
const { data, error } = await supabase
  .from('testes_templates')
  .select('*')

// Example: Insert
const { data, error } = await supabase
  .from('testes_templates')
  .insert([{ ... }])
```

#### 2. Using Supabase CLI
```bash
# Dump remote database
supabase db dump --db-url "postgresql://postgres:password@host:port/postgres"

# Note: Direct connection requires proper credentials format
```

### Database Schema

#### Table: `testes_templates`
```json
{
  "id": "uuid (auto-generated)",
  "nome": "string (short name)",
  "nome_completo": "string (full name)",
  "sigla": "string (acronym)",
  "versao": "string (version)",
  "autor": "string (optional)",
  "ano_publicacao": "number (optional)",
  "editora": "string (optional)",
  "referencias_bibliograficas": "string (optional)",
  "tipo": "enum (escala_likert | multipla_escolha | manual)",
  "faixa_etaria_min": "number (optional)",
  "faixa_etaria_max": "number (optional)",
  "tempo_medio_aplicacao": "number (minutes)",
  "aplicacao_permitida": "string (optional)",
  "materiais_necessarios": "string[] (optional)",
  "questoes": "jsonb[] (array of question objects)",
  "escalas_resposta": "jsonb (response scales)",
  "regras_calculo": "jsonb (calculation rules)",
  "interpretacao": "jsonb (optional interpretation)",
  "ativo": "boolean (default: true)",
  "publico": "boolean (default: true)",
  "criado_por": "uuid (optional, auto-filled)",
  "created_at": "timestamp (auto-generated)",
  "updated_at": "timestamp (auto-generated)"
}
```

#### Question Object Structure
```json
{
  "tipo": "likert | multiple_choice",
  "texto": "Question text",
  "numero": 1,
  "invertida": false
}
```

#### Escalas_resposta Structure
```json
{
  "likert_0_4": [
    { "texto": "Never", "valor": 0 },
    { "texto": "Rarely", "valor": 1 },
    // ...
  ]
}
```

#### Regras_calculo Structure
```json
{
  "tipo": "soma_simples | weighted | custom",
  "escala_maxima": 4,
  "pontuacao_minima": 0,
  "pontuacao_maxima": 100,
  "interpretacao_ranges": [
    {
      "min": 0,
      "max": 25,
      "nivel": "Low",
      "descricao": "Description"
    }
  ]
}
```

### Common Operations

#### Check Existing Tests
```javascript
const { data } = await supabase
  .from('testes_templates')
  .select('id, sigla, nome')
```

#### Insert New Test
```javascript
const { data, error} = await supabase
  .from('testes_templates')
  .insert([{
    nome: 'TEST',
    nome_completo: 'Test Name',
    sigla: 'TEST',
    versao: '1.0',
    tipo: 'escala_likert',
    tempo_medio_aplicacao: 15,
    publico: true,
    ativo: true,
    questoes: [...],
    escalas_resposta: {...},
    regras_calculo: {...}
  }])
  .select()
```

#### Update Existing Test
```javascript
const { data, error } = await supabase
  .from('testes_templates')
  .update({ ativo: false })
  .eq('sigla', 'TEST')
```

#### Delete Test
```javascript
const { error } = await supabase
  .from('testes_templates')
  .delete()
  .eq('id', 'uuid-here')
```

### Troubleshooting

1. **Schema Cache Errors**: If you get "Could not find column in schema cache", the column doesn't exist or has a different name
2. **Connection Errors**: Check .env.local credentials are correct
3. **Permission Errors**: Ensure using SERVICE_ROLE_KEY not ANON_KEY

### Security Notes
- Never commit `.env.local` to git
- SERVICE_ROLE_KEY bypasses Row Level Security (RLS)
- Use anon key for client-side operations
- Use service key only for server-side/admin operations
