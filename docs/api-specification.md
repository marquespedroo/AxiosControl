# API Specification - NeuroTest Platform

**Version:** 1.0
**Base URL:** `/api`
**Authentication:** Bearer JWT Token
**Content-Type:** `application/json`

---

## 🔐 Authentication

### POST `/api/auth/login`
Authenticate psychologist and return JWT token.

**Request:**
```json
{
  "email": "psico@clinica.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "nome_completo": "Dra. Maria Santos",
    "email": "psico@clinica.com",
    "crp": "01/12345",
    "clinica_id": "uuid"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "refresh_token_here"
}
```

**Errors:**
- `401`: Invalid credentials
- `403`: Account inactive

---

### POST `/api/auth/logout`
Invalidate current session.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### POST `/api/auth/refresh-token`
Refresh expired JWT token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

---

## 👥 Pacientes (Patients)

### GET `/api/pacientes`
List all patients for authenticated psychologist's clinic.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name or CPF
- `ativo` (boolean): Filter active/inactive

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome_completo": "João Silva",
      "data_nascimento": "1993-08-08",
      "idade_atual": 32,
      "sexo": "M",
      "cpf": "123.456.789-00",
      "escolaridade_anos": 16,
      "escolaridade_nivel": "superior",
      "telefone": "(11) 98765-4321",
      "email": "joao@email.com",
      "psicologo_responsavel": {
        "id": "uuid",
        "nome_completo": "Dra. Maria Santos"
      },
      "total_avaliacoes": 8,
      "ultima_avaliacao": "2025-10-15T14:30:00Z",
      "ativo": true
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### POST `/api/pacientes`
Create new patient.

**Request:**
```json
{
  "nome_completo": "João Silva",
  "data_nascimento": "1993-08-08",
  "sexo": "M",
  "cpf": "12345678900", // optional
  "escolaridade_anos": 16,
  "escolaridade_nivel": "superior",
  "profissao": "Engenheiro",
  "estado_civil": "Solteiro",
  "telefone": "11987654321",
  "email": "joao@email.com",
  "endereco": {
    "rua": "Av. Paulista",
    "numero": "1000",
    "complemento": "Apto 101",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01310-100"
  },
  "motivo_encaminhamento": "Avaliação de TDAH",
  "observacoes_clinicas": "Paciente relata dificuldades de concentração"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nome_completo": "João Silva",
  "created_at": "2025-10-04T10:00:00Z"
}
```

**Errors:**
- `400`: Validation error (missing required fields)
- `409`: CPF already exists

---

### GET `/api/pacientes/:id`
Get patient details.

**Response (200):**
```json
{
  "id": "uuid",
  "nome_completo": "João Silva",
  "data_nascimento": "1993-08-08",
  "idade_atual": 32,
  "sexo": "M",
  "cpf": "123.456.789-00",
  "escolaridade_anos": 16,
  "escolaridade_nivel": "superior",
  "profissao": "Engenheiro",
  "estado_civil": "Solteiro",
  "telefone": "(11) 98765-4321",
  "email": "joao@email.com",
  "endereco": { /* ... */ },
  "motivo_encaminhamento": "Avaliação de TDAH",
  "observacoes_clinicas": "...",
  "psicologo_responsavel_id": "uuid",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2025-10-04T10:00:00Z"
}
```

**Errors:**
- `404`: Patient not found
- `403`: Not authorized (different clinic)

---

### PUT `/api/pacientes/:id`
Update patient information.

**Request:** Same as POST (partial updates allowed)

**Response (200):**
```json
{
  "id": "uuid",
  "nome_completo": "João Silva",
  "updated_at": "2025-10-04T11:00:00Z"
}
```

---

### DELETE `/api/pacientes/:id`
Soft delete patient (set ativo = false).

**Response (200):**
```json
{
  "message": "Patient deactivated successfully"
}
```

**Errors:**
- `409`: Cannot delete patient with active tests

---

### GET `/api/pacientes/:id/prontuario`
Get patient's complete medical record (all tests).

**Response (200):**
```json
{
  "paciente": {
    "id": "uuid",
    "nome_completo": "João Silva",
    "idade_atual": 32
  },
  "resumo": {
    "total_avaliacoes": 8,
    "primeira_avaliacao": "2024-01-15T10:00:00Z",
    "ultima_avaliacao": "2025-10-15T14:30:00Z"
  },
  "avaliacoes": [
    {
      "id": "uuid",
      "teste_template": {
        "nome": "EPF-TDAH",
        "sigla": "EPF-TDAH"
      },
      "data_aplicacao": "2025-10-15T14:30:00Z",
      "tipo_aplicacao": "presencial",
      "status": "completo",
      "pontuacao_bruta": {
        "total": 85,
        "secoes": { /* ... */ }
      },
      "normalizacao": {
        "percentil": 72,
        "escore_z": 0.58,
        "classificacao": "Médio"
      },
      "psicologo": {
        "nome_completo": "Dra. Maria Santos"
      }
    }
  ],
  "registros_manuais": [
    {
      "id": "uuid",
      "nome_teste": "Teste HTP",
      "data_aplicacao": "2025-02-15",
      "resultado_texto": "...",
      "anexos": ["url1", "url2"]
    }
  ]
}
```

---

### GET `/api/pacientes/:id/prontuario/export-pdf`
Export patient's medical record as PDF.

**Response (200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="prontuario_joao_silva.pdf"`

**Errors:**
- `404`: Patient not found
- `500`: PDF generation failed

---

## 📚 Testes Templates (Test Library)

### GET `/api/testes-templates`
List all available test templates.

**Query Parameters:**
- `tipo` (string): Filter by type (escala_likert, multipla_escolha, manual)
- `publico` (boolean): Show only public tests
- `ativo` (boolean): Filter active tests

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "EPF-TDAH",
      "nome_completo": "Escala de Prejuízos Funcionais - TDAH",
      "sigla": "EPF-TDAH",
      "tipo": "escala_likert",
      "versao": "1.0",
      "autor": "Ana Paula Assis de Oliveira",
      "ano_publicacao": 2017,
      "faixa_etaria_min": 18,
      "faixa_etaria_max": 99,
      "tempo_medio_aplicacao": 20,
      "aplicacao_permitida": ["presencial", "remota"],
      "total_questoes": 69,
      "ativo": true,
      "publico": true
    }
  ]
}
```

---

### GET `/api/testes-templates/:id`
Get complete test template including questions and calculation rules.

**Response (200):**
```json
{
  "id": "uuid",
  "nome": "EPF-TDAH",
  "nome_completo": "Escala de Prejuízos Funcionais - TDAH",
  "sigla": "EPF-TDAH",
  "tipo": "escala_likert",
  "versao": "1.0",
  "questoes": [
    {
      "numero": 1,
      "texto": "Nos estudos/cursos/treinamentos, com que frequência nos últimos anos:",
      "subtexto": "Meus trabalhos foram de baixa qualidade.",
      "secao": "estudos_trabalho",
      "tipo_resposta": "likert_0_4",
      "invertida": false,
      "obrigatoria": true,
      "peso": 1,
      "ordem": 1
    }
  ],
  "escalas_resposta": {
    "likert_0_4": [
      { "valor": 0, "texto": "Nunca" },
      { "valor": 1, "texto": "Raramente" },
      { "valor": 2, "texto": "Algumas vezes" },
      { "valor": 3, "texto": "Muitas vezes" },
      { "valor": 4, "texto": "Sempre" }
    ]
  },
  "regras_calculo": {
    "tipo": "secoes",
    "secoes": {
      "estudos_trabalho": {
        "questoes": [1, 2, 3, 4, 5, 6, 7, 8],
        "invertidas": [2, 5],
        "peso": 1
      }
    },
    "score_total": "soma_secoes"
  }
}
```

---

### POST `/api/testes-templates`
Create new test template (admin only).

**Request:**
```json
{
  "nome": "Novo Teste",
  "nome_completo": "Nome Completo do Teste",
  "sigla": "NT",
  "tipo": "escala_likert",
  "versao": "1.0",
  "faixa_etaria_min": 18,
  "faixa_etaria_max": 65,
  "questoes": [ /* ... */ ],
  "escalas_resposta": { /* ... */ },
  "regras_calculo": { /* ... */ }
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nome": "Novo Teste",
  "created_at": "2025-10-04T12:00:00Z"
}
```

---

## 📊 Tabelas Normativas (Normative Tables)

### GET `/api/tabelas-normativas`
List normative tables.

**Query Parameters:**
- `teste_template_id` (uuid): Filter by test

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "teste_template_id": "uuid",
      "nome": "Normas EPF-TDAH - Brasil 2017",
      "pais": "Brasil",
      "ano_coleta": 2017,
      "tamanho_amostra": 1250,
      "variaveis_estratificacao": ["idade", "escolaridade"],
      "ativo": true,
      "padrao": true
    }
  ]
}
```

---

### GET `/api/tabelas-normativas/:id`
Get complete normative table with all bins.

**Response (200):**
```json
{
  "id": "uuid",
  "teste_template_id": "uuid",
  "nome": "Normas EPF-TDAH - Brasil 2017",
  "pais": "Brasil",
  "ano_coleta": 2017,
  "tamanho_amostra": 1250,
  "variaveis_estratificacao": ["idade", "escolaridade"],
  "faixas": [
    {
      "idade_min": 18,
      "idade_max": 25,
      "escolaridade_min": 0,
      "escolaridade_max": 8,
      "n": 150,
      "media": 42.5,
      "desvio_padrao": 12.3,
      "percentis": {
        "5": 20,
        "10": 25,
        "25": 35,
        "50": 42,
        "75": 50,
        "90": 58,
        "95": 62
      }
    }
  ]
}
```

---

### POST `/api/tabelas-normativas/import-csv`
Import normative data from CSV file.

**Request (multipart/form-data):**
- `file`: CSV file
- `teste_template_id`: UUID
- `nome`: Table name
- `pais`: Country
- `ano_coleta`: Year

**CSV Format:**
```csv
idade_min,idade_max,escolaridade_min,escolaridade_max,n,media,desvio_padrao,p5,p10,p25,p50,p75,p90,p95
18,25,0,8,150,42.5,12.3,20,25,35,42,50,58,62
```

**Response (201):**
```json
{
  "id": "uuid",
  "total_faixas_importadas": 24,
  "message": "Normative table imported successfully"
}
```

**Errors:**
- `400`: Invalid CSV format
- `422`: Validation errors (overlapping bins, invalid percentiles)

---

## 🧪 Aplicação de Testes (Test Application)

### POST `/api/testes-aplicados`
Create new test application.

**Request:**
```json
{
  "paciente_id": "uuid",
  "teste_template_id": "uuid",
  "tipo_aplicacao": "presencial" // or "remota"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "paciente_id": "uuid",
  "teste_template_id": "uuid",
  "tipo_aplicacao": "presencial",
  "status": "aguardando",
  "link_token": null, // only for remota
  "codigo_acesso": null, // only for remota
  "created_at": "2025-10-04T14:00:00Z"
}
```

---

### GET `/api/testes-aplicados/:id`
Get test application details.

**Response (200):**
```json
{
  "id": "uuid",
  "paciente": {
    "id": "uuid",
    "nome_completo": "João Silva",
    "idade_atual": 32,
    "escolaridade_anos": 16
  },
  "teste_template": {
    "id": "uuid",
    "nome": "EPF-TDAH",
    "questoes": [ /* ... */ ]
  },
  "tipo_aplicacao": "presencial",
  "status": "em_andamento",
  "progresso": 45,
  "respostas": {
    "1": 2,
    "2": 3,
    "3": 1
  },
  "data_criacao": "2025-10-04T14:00:00Z",
  "data_primeiro_acesso": "2025-10-04T14:05:00Z"
}
```

---

### PUT `/api/testes-aplicados/:id/respostas`
Save test responses (partial or complete).

**Request:**
```json
{
  "respostas": {
    "1": 2,
    "2": 3,
    "3": 1
  },
  "progresso": 45
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "progresso": 45,
  "status": "em_andamento",
  "updated_at": "2025-10-04T14:15:00Z"
}
```

---

### POST `/api/testes-aplicados/:id/finalizar`
Finalize test and calculate results.

**Request:**
```json
{
  "respostas": { /* complete responses */ }
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "completo",
  "pontuacao_bruta": {
    "total": 85,
    "secoes": {
      "estudos_trabalho": 18,
      "profissional": 22,
      "relacionamentos": 15,
      "casa": 12,
      "relacionamentos_afetivos": 8,
      "saude": 6,
      "financeiro": 4
    }
  },
  "normalizacao": {
    "tabela_utilizada": "EPF-TDAH Brasil 2017",
    "faixa_aplicada": {
      "idade": "26-35 anos",
      "escolaridade": "12+ anos"
    },
    "percentil": 72,
    "escore_z": 0.58,
    "escore_t": 56,
    "classificacao": "Médio",
    "descricao": "Prejuízos funcionais dentro da média esperada."
  },
  "interpretacao": {
    "classificacao_geral": "Prejuízos Leves a Moderados",
    "pontos_atencao": [
      "Seção Profissional com pontuação elevada (P80)"
    ],
    "recomendacoes": [
      "Investigar dificuldades no contexto profissional"
    ]
  },
  "data_conclusao": "2025-10-04T14:30:00Z"
}
```

**Errors:**
- `400`: Incomplete responses
- `404`: Test not found
- `500`: Calculation error (CALC_001, NORM_002)

---

### POST `/api/testes-aplicados/:id/reabrir`
Reopen completed test for editing.

**Request:**
```json
{
  "motivo": "Paciente pediu para revisar questões 10-15"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "reaberto",
  "motivo_reabertura": "Paciente pediu para revisar questões 10-15",
  "data_reabertura": "2025-10-04T15:00:00Z"
}
```

---

### GET `/api/testes-aplicados/:id/export-pdf`
Export test results as PDF.

**Response (200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="resultado_epf_tdah_joao_silva.pdf"`

---

## 🔗 Sistema de Links Remotos (Remote Link System)

### POST `/api/links/gerar`
Generate secure remote link for patient.

**Request:**
```json
{
  "paciente_id": "uuid",
  "teste_template_id": "uuid"
}
```

**Response (201):**
```json
{
  "teste_aplicado_id": "uuid",
  "link_token": "a7f3k9m2",
  "codigo_acesso": "483926",
  "url_completa": "https://app.neurotest.com/responder/a7f3k9m2",
  "expira_em": "2025-11-03T14:00:00Z",
  "instrucoes": "Envie o link e código para o paciente via WhatsApp/Email"
}
```

---

### POST `/api/links/:token/autenticar`
Validate patient access code.

**Request:**
```json
{
  "codigo_acesso": "483926"
}
```

**Response (200):**
```json
{
  "autenticado": true,
  "teste_aplicado_id": "uuid",
  "session_token": "patient_session_token"
}
```

**Errors:**
- `401`: Invalid code (attempts remaining: X)
- `403`: Link blocked (max attempts exceeded)
- `410`: Link expired

---

### GET `/api/links/:token/questoes`
Get test questions for patient (authenticated).

**Headers:** `Authorization: Bearer {patient_session_token}`

**Response (200):**
```json
{
  "teste": {
    "nome": "EPF-TDAH",
    "total_questoes": 69,
    "tempo_estimado": 20
  },
  "questoes": [
    {
      "numero": 1,
      "texto": "Nos estudos/cursos/treinamentos:",
      "subtexto": "Meus trabalhos foram de baixa qualidade.",
      "tipo_resposta": "likert_0_4",
      "opcoes": [
        { "valor": 0, "texto": "Nunca" },
        { "valor": 1, "texto": "Raramente" },
        { "valor": 2, "texto": "Algumas vezes" },
        { "valor": 3, "texto": "Muitas vezes" },
        { "valor": 4, "texto": "Sempre" }
      ]
    }
  ],
  "respostas_salvas": {}, // empty if new, or previous responses if reopened
  "progresso": 0
}
```

---

### PUT `/api/links/:token/responder`
Save patient response.

**Request:**
```json
{
  "questao_numero": 1,
  "resposta": 2
}
```

**Response (200):**
```json
{
  "questao_numero": 1,
  "resposta_salva": true,
  "progresso": 1.45 // percentage
}
```

---

### POST `/api/links/:token/finalizar`
Finalize patient responses and lock link.

**Request:**
```json
{
  "respostas": {
    "1": 2,
    "2": 3,
    // ... all 69 responses
  }
}
```

**Response (200):**
```json
{
  "finalizado": true,
  "status": "completo",
  "mensagem": "Obrigado! Suas respostas foram enviadas com sucesso. O link foi bloqueado automaticamente."
}
```

**Errors:**
- `400`: Incomplete responses
- `403`: Link already finalized

---

## 📝 Registros Manuais (Manual Records)

### POST `/api/registros-manuais`
Create manual test record.

**Request (multipart/form-data):**
- `paciente_id`: UUID
- `nome_teste`: string
- `data_aplicacao`: date
- `resultado_texto`: text
- `observacoes`: text (optional)
- `anexos[]`: files (optional, max 10MB each)

**Response (201):**
```json
{
  "id": "uuid",
  "nome_teste": "Teste HTP",
  "anexos": ["url1", "url2"],
  "created_at": "2025-10-04T16:00:00Z"
}
```

---

### GET `/api/registros-manuais/:id`
Get manual record details.

**Response (200):**
```json
{
  "id": "uuid",
  "paciente_id": "uuid",
  "nome_teste": "Teste HTP",
  "data_aplicacao": "2025-10-04",
  "resultado_texto": "...",
  "observacoes": "...",
  "anexos": [
    {
      "url": "https://storage.supabase.com/...",
      "nome": "desenho_htp.jpg",
      "tipo": "image/jpeg",
      "tamanho": 1024000
    }
  ],
  "psicologo": {
    "nome_completo": "Dra. Maria Santos"
  }
}
```

---

## 🧮 Cálculo e Normatização (Calculation)

### POST `/api/calcular`
Calculate test scores and normalization.

**Request:**
```json
{
  "teste_template_id": "uuid",
  "paciente_id": "uuid",
  "respostas": {
    "1": 2,
    "2": 3,
    "3": 1
  }
}
```

**Response (200):**
```json
{
  "pontuacao_bruta": {
    "total": 85,
    "secoes": { /* ... */ }
  },
  "normalizacao": {
    "tabela_utilizada": "EPF-TDAH Brasil 2017",
    "faixa_aplicada": {
      "idade": "26-35 anos",
      "escolaridade": "12+ anos",
      "sexo": "M"
    },
    "percentil": 72,
    "escore_z": 0.58,
    "escore_t": 56,
    "classificacao": "Médio"
  },
  "interpretacao": {
    "classificacao_geral": "Prejuízos Leves a Moderados",
    "pontos_atencao": [],
    "recomendacoes": []
  }
}
```

**Errors:**
- `CALC_001`: Calculation failed - missing responses
- `NORM_002`: No normative table found for demographics
- `NORM_003`: Patient outside normative range (extrapolation used)

---

## 📈 Dashboard & Analytics

### GET `/api/dashboard/stats`
Get dashboard statistics.

**Response (200):**
```json
{
  "total_pacientes": 45,
  "total_avaliacoes": 120,
  "avaliacoes_pendentes": 8,
  "avaliacoes_mes_atual": 15,
  "avaliacoes_recentes": [
    {
      "id": "uuid",
      "paciente": "João Silva",
      "teste": "EPF-TDAH",
      "status": "completo",
      "data": "2025-10-15T14:30:00Z"
    }
  ]
}
```

---

## 🔒 Error Codes Reference

### Authentication Errors
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Invalid link access code
- `AUTH_004`: Account inactive

### Calculation Errors
- `CALC_001`: Calculation failed - missing responses
- `CALC_002`: Invalid calculation rule
- `CALC_003`: Inverted item processing error

### Normalization Errors
- `NORM_001`: No normative table found
- `NORM_002`: Patient demographics outside norm range
- `NORM_003`: Multiple norm tables found (ambiguity)
- `NORM_004`: Invalid percentile interpolation

### Validation Errors
- `VAL_001`: Missing required field
- `VAL_002`: Invalid field format
- `VAL_003`: Data constraint violation
- `VAL_004`: Business rule violation

### Security Errors
- `SEC_001`: Unauthorized access (RLS violation)
- `SEC_002`: LGPD compliance violation
- `SEC_003`: Audit log failure

---

## 🌐 Rate Limiting

**Limits:**
- Authentication: 5 requests/minute
- API endpoints: 100 requests/minute
- PDF generation: 10 requests/minute

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696435200
```

**Error (429):**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retry_after": 60
}
```

---

## 📝 Notes

1. **All dates/times** are in ISO 8601 format (UTC)
2. **JSONB fields** may have flexible structure - document separately
3. **File uploads** use multipart/form-data
4. **Authentication** required for all endpoints except `/api/links/*` (patient access)
5. **RLS policies** enforce clinic-level data isolation
6. **Audit logs** automatically record all data modifications
