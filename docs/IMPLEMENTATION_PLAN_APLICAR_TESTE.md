# Implementation Plan: Multi-Mode Test Application Feature

> **CRITICAL**: This document serves as the single source of truth for the implementation.
> It MUST be consulted after any conversation compaction to maintain context.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Requirements Specification](#3-requirements-specification)
4. [Architecture Design](#4-architecture-design)
5. [Database Schema](#5-database-schema)
6. [Implementation Phases](#6-implementation-phases)
7. [File Inventory](#7-file-inventory)
8. [Component Specifications](#8-component-specifications)
9. [API Specifications](#9-api-specifications)
10. [Testing Strategy](#10-testing-strategy)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Executive Summary

### Feature Overview
Enhance the "Aplicar Teste" flow to support three application modes:
1. **Modo Presencial**: Psychologist applies test directly (current behavior)
2. **Modo Entrega**: Patient uses system on psychologist's device with PIN-protected exit
3. **Modo Link**: Generate shareable link with password for remote test-taking (Hub model)

### Key Architectural Decisions
- **Hub Model**: One active link per patient containing multiple tests
- **No Test Re-do**: Patients cannot redo completed tests from same assignment
- **PIN Exit**: 4-digit PIN to exit handoff mode (protects system access)
- **Abandoned Status**: New status for incomplete tests when links are revoked

### Constraints
- Maximum 300 LOC per component
- Follow existing patterns (Repository → Service → API)
- No new architectural patterns
- Reuse existing components where possible
- SOLID, DRY, OOP principles

---

## 2. Current State Analysis

### Existing Infrastructure

#### Database Tables (Relevant)
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `testes_aplicados` | Applied test instances | `link_token`, `codigo_acesso`, `status`, `respostas`, `progresso` |
| `pacientes` | Patient data | `id`, `nome_completo`, `clinica_id` |
| `testes_templates` | Test library | `id`, `nome`, `questoes` |

#### Existing Services
| Service | File | Purpose |
|---------|------|---------|
| `LinkService` | `lib/services/LinkService.ts` | Token generation, validation (for `links_acesso` table - NOT USED) |
| `TesteAplicadoService` | `lib/services/TesteAplicadoService.ts` | Test lifecycle management |
| `PacienteService` | `lib/services/PacienteService.ts` | Patient CRUD |

#### Existing Components
| Component | File | Reusable? |
|-----------|------|-----------|
| `Button` | `components/ui/atoms/Button.tsx` | ✅ Yes |
| `Input` | `components/ui/atoms/Input.tsx` | ✅ Yes |
| `Card` | `components/ui/atoms/Card.tsx` | ✅ Yes |
| `FormField` | `components/ui/molecules/FormField.tsx` | ✅ Yes |
| `LoadingState` | `components/ui/molecules/LoadingState.tsx` | ✅ Yes |
| `EmptyState` | `components/ui/molecules/EmptyState.tsx` | ✅ Yes |
| `QuestionRenderer` | `components/test/QuestionRenderer.tsx` | ✅ Yes |
| `LinkGeneratorModal` | `components/test/LinkGeneratorModal.tsx` | ⚠️ Replace/Extend |

#### Current Flow
```
/aplicar → Select Test → /aplicar/[testeId]/selecionar-paciente → Select Patient → Create teste_aplicado → /aplicar/[testeId]
```

#### New Flow
```
/aplicar → Select Patient → /aplicar/selecionar-paciente/[pacienteId]/modo → Select Mode → Select Test(s) → Apply/Generate Link
```

---

## 3. Requirements Specification

### 3.1 Mode Selection (After Patient Selection)

| Mode | Icon | Description | Next Step |
|------|------|-------------|-----------|
| Aplicar Pessoalmente | 👤 | User asks questions, registers answers | Select test → Apply directly |
| Entregar ao Paciente | 📱 | Patient uses device, PIN to exit | Select test → Enter PIN → Handoff |
| Enviar Link | 🔗 | Remote access via link/password | Select test(s) → Generate/Update Hub |

### 3.2 Link Hub Model

```
┌─────────────────────────────────────────────────────────────┐
│ LINK HUB (links_paciente)                                   │
│ ─────────────────────────────────────────────────────────── │
│ • One active hub per patient at a time                      │
│ • All new test assignments → same hub (while valid)         │
│ • Expiration: 7 days default (DB-configurable)              │
│ • If expired → new hub created automatically                │
│ • Contains N tests with individual progress                 │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Hub Lifecycle

| Event | Action |
|-------|--------|
| First link assignment | Create new hub |
| Subsequent assignment (hub valid) | Add test to existing hub |
| Hub expires | Create new hub on next assignment |
| Hub revoked | Mark incomplete tests as `abandonado` |
| All tests complete | Hub status → `completo` |

### 3.4 Patient Experience (Remote)

1. Access link → Enter 6-digit password
2. See list of assigned tests with progress indicators
3. Select test → Complete questions
4. After completion → Prompt: "Start next test?"
5. **Cannot see results** (security requirement)
6. **Cannot redo completed tests**

### 3.5 Handoff Mode (Entrega)

1. User selects patient → mode → test
2. User enters 4-digit PIN (to exit later)
3. System enters "kiosk mode" - simplified UI
4. Patient completes test
5. To exit: Enter 4-digit PIN
6. If wrong PIN 3x → Lock (user must re-authenticate)

### 3.6 Link Management Dashboard

| Feature | Details |
|---------|---------|
| View all links | List with patient name, creation date, expiration, status |
| Progress per test | Percentage (%) completion |
| Extend expiration | Modify `data_expiracao` |
| Revoke/Delete | Mark incomplete as `abandonado`, invalidate link |
| Add tests to hub | If hub still valid |
| Copy message | Template with link, password, expiration |

### 3.7 Message Template
```
[Nome Sobrenome], o link para o seu(s) teste(s) é: [link] e a senha de acesso é [password].
Você tem até o dia [expirationdate] para finaliza-lo(s).
Em caso de dúvidas, por favor, entre em contato conosco
```

---

## 4. Architecture Design

### 4.1 New Flow Diagram

```
                    ┌──────────────┐
                    │  /aplicar    │
                    │ (unchanged)  │
                    └──────┬───────┘
                           │ User clicks "Aplicar"
                           ▼
              ┌────────────────────────┐
              │  Select Patient Page   │
              │ /aplicar/paciente      │
              └───────────┬────────────┘
                          │ User selects patient
                          ▼
              ┌────────────────────────┐
              │  Mode Selection Modal  │
              │  (ModoAplicacaoModal)  │
              └───────────┬────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Presencial│    │ Entrega  │    │   Link   │
   └────┬─────┘    └────┬─────┘    └────┬─────┘
        │               │               │
        ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Select   │    │ Select   │    │ Select   │
   │ 1 Test   │    │ 1 Test   │    │ N Tests  │
   └────┬─────┘    └────┬─────┘    └────┬─────┘
        │               │               │
        ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Apply    │    │ Enter PIN│    │ Generate │
   │ Directly │    │ + Handoff│    │ /Add Hub │
   └──────────┘    └──────────┘    └──────────┘
```

### 4.2 Data Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        API Routes                            │
│  /api/links-paciente/*  /api/handoff/*  /api/responder/*    │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                       Services                               │
│  LinkPacienteService    HandoffService    ResponderService  │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      Repositories                            │
│  LinkPacienteRepository   ConfiguracaoRepository            │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│  links_paciente   link_testes   configuracoes_sistema       │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema

### 5.1 New Tables

#### `links_paciente` (Link Hub)
```sql
CREATE TABLE links_paciente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  psicologo_id UUID NOT NULL REFERENCES psicologos(id),
  clinica_id UUID NOT NULL REFERENCES clinicas(id),

  -- Access credentials
  link_token VARCHAR(64) UNIQUE NOT NULL,
  codigo_acesso_hash VARCHAR(255) NOT NULL, -- bcrypt hash of 6-digit code
  codigo_acesso_plain VARCHAR(6), -- stored temporarily for display, cleared after first access

  -- Expiration
  data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Status: ativo, expirado, revogado, completo
  status VARCHAR(20) DEFAULT 'ativo',

  -- Tracking
  primeiro_acesso TIMESTAMP WITH TIME ZONE,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  tentativas_falhas INTEGER DEFAULT 0,
  bloqueado BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT links_paciente_status_valido CHECK (status IN ('ativo', 'expirado', 'revogado', 'completo'))
);

-- Indexes
CREATE INDEX idx_links_paciente_paciente ON links_paciente(paciente_id);
CREATE INDEX idx_links_paciente_clinica ON links_paciente(clinica_id);
CREATE INDEX idx_links_paciente_token ON links_paciente(link_token);
CREATE INDEX idx_links_paciente_status ON links_paciente(status) WHERE status = 'ativo';

-- Only one active link per patient
CREATE UNIQUE INDEX idx_links_paciente_ativo_unico ON links_paciente(paciente_id, clinica_id)
  WHERE status = 'ativo';
```

#### `link_testes` (Junction Table)
```sql
CREATE TABLE link_testes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links_paciente(id) ON DELETE CASCADE,
  teste_aplicado_id UUID NOT NULL REFERENCES testes_aplicados(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT link_testes_unique UNIQUE (link_id, teste_aplicado_id)
);

CREATE INDEX idx_link_testes_link ON link_testes(link_id);
CREATE INDEX idx_link_testes_teste ON link_testes(teste_aplicado_id);
```

#### `configuracoes_sistema` (System Config)
```sql
CREATE TABLE configuracoes_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  chave VARCHAR(100) NOT NULL,
  valor JSONB NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT configuracoes_sistema_unique UNIQUE (clinica_id, chave)
);

-- Global configs have clinica_id = NULL
CREATE UNIQUE INDEX idx_configuracoes_global ON configuracoes_sistema(chave)
  WHERE clinica_id IS NULL;

-- Default configs
INSERT INTO configuracoes_sistema (clinica_id, chave, valor, descricao) VALUES
  (NULL, 'link_expiracao_dias_padrao', '7', 'Dias padrão para expiração de links'),
  (NULL, 'link_max_tentativas_codigo', '5', 'Máximo de tentativas de código antes de bloquear'),
  (NULL, 'handoff_max_tentativas_pin', '3', 'Máximo de tentativas de PIN antes de bloquear');
```

### 5.2 Schema Modifications

#### Add `abandonado` status to `testes_aplicados`
```sql
-- Update constraint
ALTER TABLE testes_aplicados
  DROP CONSTRAINT testes_aplicados_status_valido;

ALTER TABLE testes_aplicados
  ADD CONSTRAINT testes_aplicados_status_valido
  CHECK (status IN ('aguardando', 'em_andamento', 'completo', 'reaberto', 'bloqueado', 'expirado', 'abandonado'));
```

### 5.3 Migration File
**File**: `database/migrations/004_link_hub_system.sql`

---

## 6. Implementation Phases

### Phase 1: Database Layer
| Task | File | Status |
|------|------|--------|
| Create migration file | `database/migrations/004_link_hub_system.sql` | ⬜ |
| Add types to database.ts | `types/database.ts` | ⬜ |
| Create Zod schemas | `lib/validations/schemas/link.schema.ts` | ⬜ |

### Phase 2: Repository Layer
| Task | File | Status |
|------|------|--------|
| LinkPacienteRepository | `lib/repositories/LinkPacienteRepository.ts` | ⬜ |
| ConfiguracaoSistemaRepository | `lib/repositories/ConfiguracaoSistemaRepository.ts` | ⬜ |

### Phase 3: Service Layer
| Task | File | Status |
|------|------|--------|
| LinkPacienteService | `lib/services/LinkPacienteService.ts` | ⬜ |
| HandoffService | `lib/services/HandoffService.ts` | ⬜ |
| Update TesteAplicadoService | `lib/services/TesteAplicadoService.ts` | ⬜ |

### Phase 4: API Layer
| Task | File | Status |
|------|------|--------|
| GET/POST /api/links-paciente | `app/api/links-paciente/route.ts` | ⬜ |
| GET/PUT/DELETE /api/links-paciente/[id] | `app/api/links-paciente/[id]/route.ts` | ⬜ |
| POST /api/links-paciente/[id]/testes | `app/api/links-paciente/[id]/testes/route.ts` | ⬜ |
| POST /api/links-paciente/[id]/estender | `app/api/links-paciente/[id]/estender/route.ts` | ⬜ |
| POST /api/links-paciente/[id]/revogar | `app/api/links-paciente/[id]/revogar/route.ts` | ⬜ |
| POST /api/responder/validar | `app/api/responder/validar/route.ts` | ⬜ |
| GET /api/responder/[token] | `app/api/responder/[token]/route.ts` | ⬜ |
| POST /api/handoff/iniciar | `app/api/handoff/iniciar/route.ts` | ⬜ |
| POST /api/handoff/validar-pin | `app/api/handoff/validar-pin/route.ts` | ⬜ |

### Phase 5: State Management
| Task | File | Status |
|------|------|--------|
| useLinkPacienteStore | `lib/stores/useLinkPacienteStore.ts` | ⬜ |
| useHandoffStore | `lib/stores/useHandoffStore.ts` | ⬜ |

### Phase 6: Hooks
| Task | File | Status |
|------|------|--------|
| useLinkPaciente hook | `lib/hooks/useLinkPaciente.ts` | ⬜ |
| useHandoffMode hook | `lib/hooks/useHandoffMode.ts` | ⬜ |

### Phase 7: UI Components
| Task | File | Status |
|------|------|--------|
| ModoAplicacaoModal | `components/aplicar/ModoAplicacaoModal.tsx` | ⬜ |
| TesteSelectorModal | `components/aplicar/TesteSelectorModal.tsx` | ⬜ |
| LinkHubResult | `components/aplicar/LinkHubResult.tsx` | ⬜ |
| CopyMessageButton | `components/aplicar/CopyMessageButton.tsx` | ⬜ |
| PinEntryModal | `components/aplicar/PinEntryModal.tsx` | ⬜ |
| PinExitModal | `components/aplicar/PinExitModal.tsx` | ⬜ |
| HandoffContainer | `components/aplicar/HandoffContainer.tsx` | ⬜ |
| LinkManagementTable | `components/links/LinkManagementTable.tsx` | ⬜ |
| LinkProgressCard | `components/links/LinkProgressCard.tsx` | ⬜ |
| TestProgressList | `components/links/TestProgressList.tsx` | ⬜ |

### Phase 8: Patient Portal Components
| Task | File | Status |
|------|------|--------|
| PatientAuthForm | `components/responder/PatientAuthForm.tsx` | ⬜ |
| PatientTestList | `components/responder/PatientTestList.tsx` | ⬜ |
| PatientTestRunner | `components/responder/PatientTestRunner.tsx` | ⬜ |
| NextTestPrompt | `components/responder/NextTestPrompt.tsx` | ⬜ |
| CompletionMessage | `components/responder/CompletionMessage.tsx` | ⬜ |

### Phase 9: Pages
| Task | File | Status |
|------|------|--------|
| Refactor /aplicar flow | `app/(dashboard)/aplicar/page.tsx` | ⬜ |
| Patient selection page | `app/(dashboard)/aplicar/paciente/page.tsx` | ⬜ |
| Mode + Test selection | `app/(dashboard)/aplicar/paciente/[pacienteId]/page.tsx` | ⬜ |
| Handoff mode page | `app/(dashboard)/aplicar/handoff/[testeId]/page.tsx` | ⬜ |
| Link management page | `app/(dashboard)/links/page.tsx` | ⬜ |
| Link detail page | `app/(dashboard)/links/[id]/page.tsx` | ⬜ |
| Patient portal - auth | `app/responder/[token]/page.tsx` | ⬜ |
| Patient portal - test | `app/responder/[token]/teste/[testeId]/page.tsx` | ⬜ |

### Phase 10: Testing & Validation
| Task | Status |
|------|--------|
| Run TypeScript compiler | ⬜ |
| Run ESLint | ⬜ |
| Test all API endpoints | ⬜ |
| Test patient portal flow | ⬜ |
| Test handoff mode flow | ⬜ |
| Test link management | ⬜ |

---

## 7. File Inventory

### 7.1 Files to CREATE

```
database/
└── migrations/
    └── 004_link_hub_system.sql                 # NEW

types/
└── database.ts                                  # MODIFY (add new types)

lib/
├── validations/
│   └── schemas/
│       └── link.schema.ts                       # NEW
├── repositories/
│   ├── LinkPacienteRepository.ts                # NEW
│   └── ConfiguracaoSistemaRepository.ts         # NEW
├── services/
│   ├── LinkPacienteService.ts                   # NEW
│   ├── HandoffService.ts                        # NEW
│   └── TesteAplicadoService.ts                  # MODIFY
├── stores/
│   ├── useLinkPacienteStore.ts                  # NEW
│   └── useHandoffStore.ts                       # NEW
└── hooks/
    ├── useLinkPaciente.ts                       # NEW
    └── useHandoffMode.ts                        # NEW

components/
├── aplicar/
│   ├── ModoAplicacaoModal.tsx                   # NEW
│   ├── TesteSelectorModal.tsx                   # NEW
│   ├── LinkHubResult.tsx                        # NEW
│   ├── CopyMessageButton.tsx                    # NEW
│   ├── PinEntryModal.tsx                        # NEW
│   ├── PinExitModal.tsx                         # NEW
│   └── HandoffContainer.tsx                     # NEW
├── links/
│   ├── LinkManagementTable.tsx                  # NEW
│   ├── LinkProgressCard.tsx                     # NEW
│   └── TestProgressList.tsx                     # NEW
├── responder/
│   ├── PatientAuthForm.tsx                      # NEW
│   ├── PatientTestList.tsx                      # NEW
│   ├── PatientTestRunner.tsx                    # NEW
│   ├── NextTestPrompt.tsx                       # NEW
│   └── CompletionMessage.tsx                    # NEW
└── test/
    └── LinkGeneratorModal.tsx                   # DELETE (replaced)

app/
├── api/
│   ├── links-paciente/
│   │   ├── route.ts                             # NEW
│   │   └── [id]/
│   │       ├── route.ts                         # NEW
│   │       ├── testes/
│   │       │   └── route.ts                     # NEW
│   │       ├── estender/
│   │       │   └── route.ts                     # NEW
│   │       └── revogar/
│   │           └── route.ts                     # NEW
│   ├── responder/
│   │   ├── validar/
│   │   │   └── route.ts                         # NEW
│   │   └── [token]/
│   │       └── route.ts                         # NEW
│   └── handoff/
│       ├── iniciar/
│       │   └── route.ts                         # NEW
│       └── validar-pin/
│           └── route.ts                         # NEW
├── (dashboard)/
│   ├── aplicar/
│   │   ├── page.tsx                             # MODIFY
│   │   ├── paciente/
│   │   │   └── page.tsx                         # NEW
│   │   ├── paciente/
│   │   │   └── [pacienteId]/
│   │   │       └── page.tsx                     # NEW
│   │   └── handoff/
│   │       └── [testeId]/
│   │           └── page.tsx                     # NEW
│   └── links/
│       ├── page.tsx                             # NEW
│       └── [id]/
│           └── page.tsx                         # NEW
└── responder/
    └── [token]/
        ├── page.tsx                             # MODIFY/NEW
        └── teste/
            └── [testeId]/
                └── page.tsx                     # NEW
```

### 7.2 Files to MODIFY

| File | Changes |
|------|---------|
| `types/database.ts` | Add LinkPaciente, LinkTeste, ConfiguracaoSistema types |
| `lib/services/TesteAplicadoService.ts` | Add abandonado status handling |
| `app/(dashboard)/aplicar/page.tsx` | Change flow to patient-first |

### 7.3 Files to DELETE

| File | Reason |
|------|--------|
| `components/test/LinkGeneratorModal.tsx` | Replaced by new components |

---

## 8. Component Specifications

### 8.1 ModoAplicacaoModal

**Purpose**: Display 3 mode options after patient selection

**Props**:
```typescript
interface ModoAplicacaoModalProps {
  isOpen: boolean
  onClose: () => void
  paciente: Paciente
  onModeSelect: (mode: ModoAplicacao) => void
}

type ModoAplicacao = 'presencial' | 'entrega' | 'link'
```

**Max LOC**: 150

**Reuses**: Button, Card (existing)

### 8.2 TesteSelectorModal

**Purpose**: Multi-select tests with search (for link mode) or single-select (for other modes)

**Props**:
```typescript
interface TesteSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  mode: ModoAplicacao
  pacienteId: string
  onSelect: (testeIds: string[]) => void
  existingTesteIds?: string[] // For adding to existing hub
}
```

**Max LOC**: 200

**Reuses**: Input (search), Card, Button, LoadingState, EmptyState

### 8.3 LinkHubResult

**Purpose**: Display generated/updated link with copy functionality

**Props**:
```typescript
interface LinkHubResultProps {
  link: LinkPaciente
  paciente: Paciente
  isNew: boolean // New hub vs added to existing
  onClose: () => void
}
```

**Max LOC**: 150

**Reuses**: Button, Card, CopyMessageButton

### 8.4 CopyMessageButton

**Purpose**: Copy formatted message with link, password, expiration

**Props**:
```typescript
interface CopyMessageButtonProps {
  pacienteNome: string
  link: string
  codigo: string
  dataExpiracao: Date
  className?: string
}
```

**Max LOC**: 80

### 8.5 PinEntryModal

**Purpose**: Enter 4-digit PIN to start handoff mode

**Props**:
```typescript
interface PinEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pin: string) => void
}
```

**Max LOC**: 100

### 8.6 PinExitModal

**Purpose**: Enter PIN to exit handoff mode

**Props**:
```typescript
interface PinExitModalProps {
  isOpen: boolean
  onValidate: (pin: string) => Promise<boolean>
  onSuccess: () => void
  maxAttempts: number
}
```

**Max LOC**: 120

### 8.7 HandoffContainer

**Purpose**: Wrapper for handoff mode with simplified UI

**Props**:
```typescript
interface HandoffContainerProps {
  testeAplicadoId: string
  pin: string
  onExit: () => void
}
```

**Max LOC**: 200

**Reuses**: QuestionRenderer

### 8.8 LinkManagementTable

**Purpose**: Display all links with actions

**Props**:
```typescript
interface LinkManagementTableProps {
  links: LinkPacienteWithDetails[]
  onExtend: (id: string) => void
  onRevoke: (id: string) => void
  onViewDetails: (id: string) => void
}
```

**Max LOC**: 250

### 8.9 PatientAuthForm

**Purpose**: Patient enters 6-digit code

**Props**:
```typescript
interface PatientAuthFormProps {
  token: string
  onSuccess: (sessionToken: string) => void
}
```

**Max LOC**: 120

### 8.10 PatientTestList

**Purpose**: Show tests available for patient with progress

**Props**:
```typescript
interface PatientTestListProps {
  testes: TesteAplicadoWithTemplate[]
  onSelectTeste: (testeId: string) => void
}
```

**Max LOC**: 150

### 8.11 PatientTestRunner

**Purpose**: Patient answers test questions (no results shown)

**Props**:
```typescript
interface PatientTestRunnerProps {
  testeAplicado: TesteAplicado
  template: TesteTemplate
  onComplete: () => void
  onProgress: (progresso: number) => void
}
```

**Max LOC**: 250

**Reuses**: QuestionRenderer

### 8.12 NextTestPrompt

**Purpose**: Prompt patient to start next test

**Props**:
```typescript
interface NextTestPromptProps {
  nextTeste: TesteAplicadoWithTemplate | null
  onContinue: () => void
  onFinish: () => void
}
```

**Max LOC**: 80

---

## 9. API Specifications

### 9.1 Links Paciente API

#### GET /api/links-paciente
**Purpose**: List all links for clinic
**Query**: `?paciente_id=&status=&page=&limit=`
**Response**: `PaginatedResponse<LinkPacienteWithDetails>`

#### POST /api/links-paciente
**Purpose**: Create new link hub OR get existing active hub
**Body**:
```typescript
{
  paciente_id: string
  teste_template_ids: string[]
  dias_expiracao?: number // default from config
}
```
**Response**: `LinkPaciente` with tests

#### GET /api/links-paciente/[id]
**Purpose**: Get link details with tests and progress
**Response**: `LinkPacienteWithDetails`

#### PUT /api/links-paciente/[id]
**Purpose**: Update link (extend expiration)
**Body**: `{ data_expiracao: string }`

#### DELETE /api/links-paciente/[id]
**Purpose**: Soft delete (revoke)
**Action**: Set status='revogado', mark incomplete tests as 'abandonado'

#### POST /api/links-paciente/[id]/testes
**Purpose**: Add tests to existing hub
**Body**: `{ teste_template_ids: string[] }`

#### POST /api/links-paciente/[id]/estender
**Purpose**: Extend expiration
**Body**: `{ dias: number }`

#### POST /api/links-paciente/[id]/revogar
**Purpose**: Revoke link

### 9.2 Patient Portal API

#### POST /api/responder/validar
**Purpose**: Validate token + code, return session
**Body**: `{ token: string, codigo: string }`
**Response**: `{ session_token: string, link: LinkPaciente }`

#### GET /api/responder/[token]
**Purpose**: Get link info and tests (requires session)
**Headers**: `Authorization: Bearer <session_token>`
**Response**: `{ link: LinkPaciente, testes: TesteAplicadoWithTemplate[] }`

### 9.3 Handoff API

#### POST /api/handoff/iniciar
**Purpose**: Initialize handoff session
**Body**: `{ teste_aplicado_id: string, pin: string }`
**Response**: `{ session_id: string }`

#### POST /api/handoff/validar-pin
**Purpose**: Validate PIN to exit
**Body**: `{ session_id: string, pin: string }`
**Response**: `{ valid: boolean, remaining_attempts: number }`

---

## 10. Testing Strategy

### 10.1 Unit Tests
- [ ] LinkPacienteRepository methods
- [ ] LinkPacienteService logic
- [ ] HandoffService PIN validation
- [ ] Zod schema validation

### 10.2 Integration Tests
- [ ] Create link hub flow
- [ ] Add tests to existing hub
- [ ] Revoke link and mark tests abandoned
- [ ] Patient authentication flow

### 10.3 E2E Tests
- [ ] Complete presencial mode flow
- [ ] Complete handoff mode flow with PIN
- [ ] Complete link mode flow (generate, access, complete)
- [ ] Link management (extend, revoke)

---

## 11. Implementation Checklist

### Pre-Implementation
- [ ] Read this document completely
- [ ] Verify no existing components conflict
- [ ] Check existing patterns in codebase

### Phase 1: Database (Priority: HIGHEST)
- [ ] Create `database/migrations/004_link_hub_system.sql`
- [ ] Run migration
- [ ] Verify tables created

### Phase 2: Types & Validation (Priority: HIGH)
- [ ] Add types to `types/database.ts`
- [ ] Create `lib/validations/schemas/link.schema.ts`

### Phase 3: Repository Layer (Priority: HIGH)
- [ ] Create `LinkPacienteRepository.ts`
- [ ] Create `ConfiguracaoSistemaRepository.ts`

### Phase 4: Service Layer (Priority: HIGH)
- [ ] Create `LinkPacienteService.ts`
- [ ] Create `HandoffService.ts`
- [ ] Modify `TesteAplicadoService.ts` (add abandonado)

### Phase 5: API Routes (Priority: HIGH)
- [ ] Create all `/api/links-paciente/*` routes
- [ ] Create all `/api/responder/*` routes
- [ ] Create all `/api/handoff/*` routes

### Phase 6: State & Hooks (Priority: MEDIUM)
- [ ] Create `useLinkPacienteStore.ts`
- [ ] Create `useHandoffStore.ts`
- [ ] Create `useLinkPaciente.ts` hook
- [ ] Create `useHandoffMode.ts` hook

### Phase 7: UI Components (Priority: MEDIUM)
- [ ] Create `components/aplicar/*` components
- [ ] Create `components/links/*` components
- [ ] Create `components/responder/*` components

### Phase 8: Pages (Priority: MEDIUM)
- [ ] Modify `/aplicar` page
- [ ] Create patient selection pages
- [ ] Create handoff pages
- [ ] Create link management pages
- [ ] Create patient portal pages

### Phase 9: Final Validation (Priority: HIGHEST)
- [ ] Run `npm run typecheck`
- [ ] Run `npm run lint`
- [ ] Test all flows manually
- [ ] Remove old `LinkGeneratorModal.tsx`

---

## 12. Post-Implementation Notes

### Created Files Registry
> Add files here as they are created to track progress

| File | Created | Tested |
|------|---------|--------|
| | | |

### Modified Files Registry
> Add files here as they are modified

| File | Changes | Tested |
|------|---------|--------|
| | | |

### Known Issues
> Document any issues found during implementation

| Issue | Status | Resolution |
|-------|--------|------------|
| | | |

---

## Appendix A: Existing Patterns Reference

### Repository Pattern
```typescript
// lib/repositories/base/Repository.ts
export abstract class Repository<T extends Record<string, any>> {
  protected tableName: string
  protected supabase: SupabaseClient<Database>

  constructor(tableName: string, supabase: SupabaseClient<Database>) {
    this.tableName = tableName
    this.supabase = supabase
  }

  async findById(id: string): Promise<Result<T | null, AppError>> { ... }
  async findAll(pagination?: PaginationParams): Promise<Result<PaginationResult<T>, AppError>> { ... }
  async create(data: Partial<T>): Promise<Result<T, AppError>> { ... }
  async update(id: string, data: Partial<T>): Promise<Result<T, AppError>> { ... }
  async delete(id: string): Promise<Result<void, AppError>> { ... }
}
```

### Service Pattern
```typescript
// Example from lib/services/LinkService.ts
export class LinkService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  async methodName(...): Promise<Result<ReturnType, AppError>> {
    try {
      // Implementation
      return success(data)
    } catch (error) {
      return failure(new AppError('CODE', 'Message', { cause: error }))
    }
  }
}
```

### API Route Pattern
```typescript
// Example pattern
import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/auth/SessionManager'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const session = await SessionManager.requireAuth()
    const supabase = createServerSupabaseClient()

    // Implementation

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'ERROR_CODE', message: 'Error message' },
      { status: 500 }
    )
  }
}
```

### Zustand Store Pattern
```typescript
// Example from lib/stores/useTesteAplicadoStore.ts
import { create } from 'zustand'

interface StoreState {
  data: DataType[]
  isLoading: boolean
  error: string | null
}

interface StoreActions {
  setData: (data: DataType[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type Store = StoreState & StoreActions

const initialState: StoreState = {
  data: [],
  isLoading: false,
  error: null,
}

export const useStore = create<Store>()((set) => ({
  ...initialState,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
```

---

**END OF IMPLEMENTATION PLAN**

> Last Updated: 2025-11-25
> Version: 1.0
