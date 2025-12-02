# Biblioteca de Testes - Implementation Plan

> **CRITICAL**: This document serves as the authoritative guide for implementation.
> After conversation compaction, refer to this document for all details.

## Overview

**Feature**: Biblioteca de Testes (Test Library) with full CRUD capabilities
**Goal**: Enterprise-level test management with version control and audit trail

---

## Pre-Implementation Checklist

### EXISTING COMPONENTS TO REUSE (DO NOT DUPLICATE)

#### UI Atoms (`/components/ui/atoms/`)
- [x] `Button.tsx` - Use variants: default, destructive, outline, secondary, ghost, link
- [x] `Input.tsx` - Text input with error state support
- [x] `Label.tsx` - Form label with required indicator
- [x] `Card.tsx` - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

#### UI Molecules (`/components/ui/molecules/`)
- [x] `FormField.tsx` - Label + Input + error/helper text
- [x] `LoadingState.tsx` - Loading spinner
- [x] `EmptyState.tsx` - Empty state display

#### Existing Form Patterns (`/components/forms/`)
- [x] `PatientForm.tsx` - Reference for form structure (sections, validation, submission)
- [x] `ClinicForm.tsx` - Reference for CRUD form pattern

#### Existing Types (`/types/database.ts`)
- [x] `TesteTemplate`, `TesteTemplateInsert`, `TesteTemplateUpdate`
- [x] `Questao`, `EscalasResposta`, `RegrasCalculo`
- [x] `TipoTeste`, `TipoResposta`
- [x] `ConfiguracaoSistema`

#### Existing Services (`/lib/services/`)
- [x] `TesteTemplateService.ts` - Extend, don't replace
- [x] `ConfiguracaoSistemaRepository.ts` - For feature flags

#### Existing Repositories (`/lib/repositories/`)
- [x] `TesteTemplateRepository.ts` - Extend, don't replace

#### Utilities (`/lib/utils.ts`)
- [x] `cn()` - Class name merging
- [x] `formatDate()`, `formatDateTime()`

#### Color Palette (from `tailwind.config.ts`)
- Primary: `hsl(var(--primary))`
- Secondary: `hsl(var(--secondary))`
- Destructive: `hsl(var(--destructive))`
- Muted: `hsl(var(--muted))`
- Success: `green-600`
- Warning: `yellow-600`
- Info: `blue-600`

---

## Phase 1: Database Schema Updates

### 1.1 Migration File: `007_teste_template_versioning.sql`

**Location**: `/database/migrations/007_teste_template_versioning.sql`

```sql
-- ===================================
-- MIGRATION 007: Test Template Versioning
-- Biblioteca de Testes Enhancement
-- ===================================

-- Add versioning columns to testes_templates
ALTER TABLE testes_templates
ADD COLUMN IF NOT EXISTS versao_origem_id UUID REFERENCES testes_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS versao_numero INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS motivo_alteracao TEXT,
ADD COLUMN IF NOT EXISTS alterado_por UUID REFERENCES psicologos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS alterado_em TIMESTAMP WITH TIME ZONE;

-- Index for version queries
CREATE INDEX IF NOT EXISTS idx_testes_versao_origem ON testes_templates(versao_origem_id)
  WHERE versao_origem_id IS NOT NULL;

-- Add audit trigger for testes_templates (MISSING in original schema)
CREATE TRIGGER IF NOT EXISTS trigger_audit_testes_templates
  AFTER INSERT OR UPDATE OR DELETE ON testes_templates
  FOR EACH ROW EXECUTE FUNCTION log_auditoria();

-- Comment updates
COMMENT ON COLUMN testes_templates.versao_origem_id IS 'UUID of the original test (self-reference for version chain)';
COMMENT ON COLUMN testes_templates.versao_numero IS 'Sequential version number (1, 2, 3...)';
COMMENT ON COLUMN testes_templates.motivo_alteracao IS 'Reason for creating this version';
COMMENT ON COLUMN testes_templates.alterado_por IS 'User who created this version';
COMMENT ON COLUMN testes_templates.alterado_em IS 'Timestamp when this version was created';
```

### 1.2 Add `verdadeiro_falso` Question Type

**Location**: `/types/database.ts` (line ~140)

```typescript
// UPDATE existing TipoResposta
export type TipoResposta =
  | 'likert_0_4'
  | 'likert_0_3'
  | 'likert_0_2'
  | 'multipla_escolha'
  | 'verdadeiro_falso'  // NEW
  | 'texto_livre'
  | 'numero'
```

---

## Phase 2: TypeScript Interfaces

### 2.1 New Types File: `/types/biblioteca.ts`

```typescript
// ===================================
// BIBLIOTECA DE TESTES TYPES
// ===================================

import {
  TesteTemplate,
  Questao,
  EscalasResposta,
  RegrasCalculo,
  TipoTeste,
  TipoResposta
} from './database'

// ----- Form Mode -----
export type FormMode = 'create' | 'edit' | 'view'

// ----- Test Basic Info -----
export interface TestBasicInfoFormData {
  nome: string
  nome_completo?: string
  sigla?: string
  versao?: string
  autor?: string
  ano_publicacao?: number
  editora?: string
  tipo: TipoTeste
  faixa_etaria_min?: number
  faixa_etaria_max?: number
  tempo_medio_aplicacao?: number
  publico: boolean
  ativo: boolean
}

// ----- Question Editor -----
export interface QuestionFormData {
  numero: number
  texto: string
  subtexto?: string
  secao: string
  tipo_resposta: TipoResposta
  opcoes?: string[]  // For multipla_escolha
  invertida: boolean
  obrigatoria: boolean
  peso: number
  ordem: number
}

// ----- Answer Scale Editor -----
export interface AnswerScaleOption {
  valor: number
  texto: string
}

export interface AnswerScaleFormData {
  key: string  // e.g., 'likert_0_4'
  opcoes: AnswerScaleOption[]
}

// ----- Scoring Rules Editor -----
export interface SectionScore {
  nome: string
  questoes: number[]
  invertidas: number[]
  peso: number
}

export interface ScoringRulesFormData {
  tipo: 'soma_simples' | 'soma_ponderada' | 'secoes' | 'custom'
  questoes_incluidas?: number[]
  questoes_invertidas?: number[]
  valor_maximo_escala?: number
  secoes?: Record<string, SectionScore>
  score_total?: string
}

// ----- Version History -----
export interface TestVersion {
  id: string
  versao: string
  versao_numero: number
  motivo_alteracao?: string
  alterado_por?: string
  alterado_em?: string
  ativo: boolean
  created_at: string
}

// ----- Component Props -----
export interface TestBasicInfoFormProps {
  data: TestBasicInfoFormData
  onChange: (data: TestBasicInfoFormData) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export interface QuestionsEditorProps {
  questions: QuestionFormData[]
  onChange: (questions: QuestionFormData[]) => void
  availableScales: string[]
  errors?: Record<string, string>
  disabled?: boolean
}

export interface QuestionItemEditorProps {
  question: QuestionFormData
  index: number
  onChange: (question: QuestionFormData) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  availableScales: string[]
  disabled?: boolean
}

export interface AnswerScalesEditorProps {
  scales: EscalasResposta
  onChange: (scales: EscalasResposta) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export interface ScoringRulesEditorProps {
  rules: RegrasCalculo
  onChange: (rules: RegrasCalculo) => void
  questionNumbers: number[]
  sections: string[]
  errors?: Record<string, string>
  disabled?: boolean
}

export interface VersionHistoryProps {
  versions: TestVersion[]
  currentVersionId: string
  onRestore: (versionId: string) => void
  disabled?: boolean
}

// ----- API Types -----
export interface CreateTestVersionPayload {
  originalTestId: string
  motivo_alteracao: string
  data: Partial<TesteTemplate>
}

export interface TestWithVersions extends TesteTemplate {
  versions: TestVersion[]
  versao_origem_id?: string
  versao_numero: number
}
```

---

## Phase 3: Reusable Form Components

### 3.1 Component Structure

```
components/
└── biblioteca/
    ├── index.ts                    # Barrel exports
    ├── TestBasicInfoForm.tsx       # ~150 lines
    ├── QuestionsEditor.tsx         # ~180 lines
    ├── QuestionItemEditor.tsx      # ~150 lines
    ├── AnswerScalesEditor.tsx      # ~150 lines
    ├── ScoringRulesEditor.tsx      # ~180 lines
    ├── VersionHistory.tsx          # ~120 lines
    └── TestPreview.tsx             # ~100 lines (optional)
```

### 3.2 Component Specifications

#### `TestBasicInfoForm.tsx` (~150 lines)

**Purpose**: Edit test metadata (name, type, age range, etc.)

**Reuses**:
- `FormField` from `/components/ui/molecules/FormField.tsx`
- `Input` from `/components/ui/atoms/Input.tsx`
- `Label` from `/components/ui/atoms/Label.tsx`
- `Card` components from `/components/ui/atoms/Card.tsx`

**Fields**:
| Field | Type | Required | Component |
|-------|------|----------|-----------|
| nome | string | Yes | Input |
| nome_completo | string | No | Input |
| sigla | string | No | Input |
| versao | string | No | Input |
| autor | string | No | Input |
| ano_publicacao | number | No | Input type="number" |
| editora | string | No | Input |
| tipo | select | Yes | Custom Select (Radix) |
| faixa_etaria_min | number | No | Input type="number" |
| faixa_etaria_max | number | No | Input type="number" |
| tempo_medio_aplicacao | number | No | Input type="number" |
| publico | boolean | No | Switch/Checkbox |
| ativo | boolean | No | Switch/Checkbox |

**Validation**:
- `nome`: min 3 chars
- `faixa_etaria_min` < `faixa_etaria_max`
- `ano_publicacao`: 1900-current year

---

#### `QuestionsEditor.tsx` (~180 lines)

**Purpose**: Manage list of questions with add/remove/reorder

**Reuses**:
- `Button` from `/components/ui/atoms/Button.tsx`
- `Card` components

**Features**:
- Add new question button
- Bulk actions (select all, delete selected)
- Drag-and-drop reorder (using existing patterns or simple up/down buttons)
- Section grouping toggle
- Search/filter questions

**State Management**:
- Local state for questions array
- Callback to parent on changes

---

#### `QuestionItemEditor.tsx` (~150 lines)

**Purpose**: Edit single question details

**Reuses**:
- `FormField`, `Input`, `Label`
- `Button` for actions

**Fields**:
| Field | Type | Component |
|-------|------|-----------|
| numero | number | Input (auto-generated) |
| texto | string | Textarea |
| subtexto | string | Input |
| secao | string | Input or Select |
| tipo_resposta | select | Custom Select |
| opcoes | string[] | Dynamic inputs (for multipla_escolha) |
| invertida | boolean | Checkbox |
| obrigatoria | boolean | Checkbox |
| peso | number | Input |

**Actions**:
- Delete question
- Move up/down
- Duplicate question

---

#### `AnswerScalesEditor.tsx` (~150 lines)

**Purpose**: Define response scales (Likert options, True/False, etc.)

**Reuses**:
- `Card`, `Button`, `Input`

**Features**:
- Add new scale
- Edit scale name (key)
- Add/remove/edit options within scale
- Preview scale appearance
- Predefined templates (Likert 0-4, Likert 0-3, True/False)

**Predefined Scales**:
```typescript
const PREDEFINED_SCALES = {
  likert_0_4: [
    { valor: 0, texto: 'Nunca' },
    { valor: 1, texto: 'Raramente' },
    { valor: 2, texto: 'Às vezes' },
    { valor: 3, texto: 'Frequentemente' },
    { valor: 4, texto: 'Sempre' }
  ],
  likert_0_3: [
    { valor: 0, texto: 'Nunca verdade' },
    { valor: 1, texto: 'Raramente verdade' },
    { valor: 2, texto: 'Às vezes verdade' },
    { valor: 3, texto: 'Frequentemente verdade' }
  ],
  verdadeiro_falso: [
    { valor: 1, texto: 'Verdadeiro' },
    { valor: 0, texto: 'Falso' }
  ]
}
```

---

#### `ScoringRulesEditor.tsx` (~180 lines)

**Purpose**: Configure how test scores are calculated

**Reuses**:
- `Card`, `Button`, `Input`, `FormField`

**Features**:
- Select calculation type (soma_simples, soma_ponderada, secoes, custom)
- Configure based on type:
  - **soma_simples**: Select questions, inverted questions, max scale value
  - **soma_ponderada**: Assign weight per question
  - **secoes**: Create sections with question groups
  - **custom**: Text input for function name

**UI by Type**:
- Radio buttons for type selection
- Conditional rendering based on type
- Question multi-select (checkboxes)
- Section builder (add/remove sections)

---

#### `VersionHistory.tsx` (~120 lines)

**Purpose**: Display version history with restore option

**Reuses**:
- `Card`, `Button`

**Features**:
- List all versions (sorted by versao_numero desc)
- Show: version number, date, who changed, reason
- Current version badge
- Restore button (creates new version from selected)
- Diff view (optional - compare two versions)

---

## Phase 4: Test Editor Page

### 4.1 Page Structure

**Location**: `/app/(dashboard)/biblioteca/[id]/editar/page.tsx`

```
/biblioteca/[id]/editar/
├── page.tsx           # Main editor page (~250 lines)
└── loading.tsx        # Loading state
```

### 4.2 Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Editar Teste: {nome}" + Save/Cancel buttons    │
├─────────────────────────────────────────────────────────┤
│ Tabs: [Informações] [Questões] [Escalas] [Pontuação]   │
│       [Histórico]                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tab Content (one of the form components)               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Footer: Version info + Last saved                       │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Save Flow

1. User makes changes in any tab
2. Changes stored in local state
3. User clicks "Salvar"
4. Modal asks for "Motivo da alteração"
5. System creates NEW version:
   - Copy current test data with changes
   - Set `versao_origem_id` to original test
   - Increment `versao_numero`
   - Set `motivo_alteracao`, `alterado_por`, `alterado_em`
   - Deactivate old version (`ativo = false`)
6. Redirect to new version's edit page
7. Success toast

---

## Phase 5: Refactor Existing Pages

### 5.1 List Page (`/biblioteca/page.tsx`)

**Current**: 262 lines
**Changes**:
- Update title to "Biblioteca de Testes"
- Add "Editar" button per test card
- Show version badge if `versao_numero > 1`
- Filter by active versions only (default)
- Optional: Show all versions toggle

### 5.2 Create Page (`/biblioteca/novo/page.tsx`)

**Current**: 426 lines (EXCEEDS 300 limit)
**Changes**:
- Extract form sections into new components
- Import `TestBasicInfoForm`, `QuestionsEditor`, etc.
- Reduce to ~200 lines (orchestration only)
- Use tabs like edit page

### 5.3 Detail Page (`/biblioteca/[id]/page.tsx`)

**Changes**:
- Add "Editar" button linking to `/biblioteca/[id]/editar`
- Show version info
- Read-only preview using same components

---

## Phase 6: Version History UI

### 6.1 Version Query

```typescript
// In TesteTemplateRepository
async findVersions(originalId: string): Promise<TestVersion[]> {
  const { data, error } = await supabase
    .from('testes_templates')
    .select('id, versao, versao_numero, motivo_alteracao, alterado_por, alterado_em, ativo, created_at')
    .or(`id.eq.${originalId},versao_origem_id.eq.${originalId}`)
    .order('versao_numero', { ascending: false })

  return data || []
}
```

### 6.2 Restore Version

```typescript
// In TesteTemplateService
async restoreVersion(versionId: string, userId: string): Promise<Result<TesteTemplate, AppError>> {
  // 1. Get the version to restore
  const oldVersion = await this.repository.findById(versionId)

  // 2. Get current active version
  const currentActive = await this.repository.findActiveByOrigin(oldVersion.versao_origem_id)

  // 3. Deactivate current
  await this.repository.update(currentActive.id, { ativo: false })

  // 4. Create new version from old data
  const newVersion = await this.repository.create({
    ...oldVersion,
    versao_numero: currentActive.versao_numero + 1,
    versao_origem_id: oldVersion.versao_origem_id || oldVersion.id,
    motivo_alteracao: `Restaurado da versão ${oldVersion.versao_numero}`,
    alterado_por: userId,
    alterado_em: new Date().toISOString(),
    ativo: true
  })

  return success(newVersion)
}
```

---

## Phase 7: Service and API Updates

### 7.1 TesteTemplateService Extensions

**File**: `/lib/services/TesteTemplateService.ts`

**New Methods**:
```typescript
// Create new version (for edits)
async createVersion(
  originalId: string,
  changes: Partial<TesteTemplate>,
  motivo: string,
  userId: string
): Promise<Result<TesteTemplate, AppError>>

// Get all versions
async getVersions(testId: string): Promise<Result<TestVersion[], AppError>>

// Restore specific version
async restoreVersion(versionId: string, userId: string): Promise<Result<TesteTemplate, AppError>>

// Get active version
async getActiveVersion(originalId: string): Promise<Result<TesteTemplate, AppError>>
```

### 7.2 API Routes

**New Routes**:
- `PUT /api/testes-templates/[id]/version` - Create new version
- `GET /api/testes-templates/[id]/versions` - Get version history
- `POST /api/testes-templates/[id]/restore` - Restore specific version

**Updates to Existing**:
- `GET /api/testes-templates/[id]` - Include version info
- `GET /api/testes-templates` - Filter by active only (default)

---

## Phase 8: Testing and Validation

### 8.1 Type Checking

```bash
npm run type-check
```

### 8.2 Lint

```bash
npm run lint
```

### 8.3 Build

```bash
npm run build
```

### 8.4 Manual Testing Checklist

- [ ] Create new test with all fields
- [ ] Edit test basic info → new version created
- [ ] Add/remove questions → new version created
- [ ] Edit answer scales → new version created
- [ ] Edit scoring rules → new version created
- [ ] View version history
- [ ] Restore old version
- [ ] Applied tests reference correct version
- [ ] List shows only active versions
- [ ] Search works with new fields

---

## File Creation Order

1. `/database/migrations/007_teste_template_versioning.sql`
2. `/types/biblioteca.ts`
3. `/components/biblioteca/index.ts`
4. `/components/biblioteca/TestBasicInfoForm.tsx`
5. `/components/biblioteca/QuestionItemEditor.tsx`
6. `/components/biblioteca/QuestionsEditor.tsx`
7. `/components/biblioteca/AnswerScalesEditor.tsx`
8. `/components/biblioteca/ScoringRulesEditor.tsx`
9. `/components/biblioteca/VersionHistory.tsx`
10. `/app/(dashboard)/biblioteca/[id]/editar/page.tsx`
11. `/app/(dashboard)/biblioteca/[id]/editar/loading.tsx`
12. `/lib/services/TesteTemplateService.ts` (extend)
13. `/lib/repositories/TesteTemplateRepository.ts` (extend)
14. `/app/api/testes-templates/[id]/version/route.ts`
15. `/app/api/testes-templates/[id]/versions/route.ts`
16. `/app/api/testes-templates/[id]/restore/route.ts`
17. Update `/app/(dashboard)/biblioteca/page.tsx`
18. Refactor `/app/(dashboard)/biblioteca/novo/page.tsx`

---

## Risk Mitigation

### Breaking Changes
- Existing `testes_aplicados` keep references to old test IDs
- Solution: Never delete old versions, just deactivate

### Data Migration
- Existing tests need `versao_numero = 1` set
- Solution: Migration handles with DEFAULT 1

### Performance
- Version queries could be slow with many versions
- Solution: Index on `versao_origem_id`, limit history display

---

## Rollback Plan

If issues arise:
1. Keep migration reversible (ALTER TABLE DROP COLUMN)
2. New components are additive (don't break existing)
3. API changes are backwards compatible

---

## Success Criteria

- [ ] All tests have version history
- [ ] Edits create new versions (not in-place updates)
- [ ] Audit trail in `logs_auditoria`
- [ ] UI shows version info
- [ ] Can restore any previous version
- [ ] No lint/type errors
- [ ] Build passes
- [ ] All existing functionality preserved
