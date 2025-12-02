# NeuroTest Platform - Comprehensive Implementation Plan

**Version:** 2.0
**Date:** 2025-10-06
**Purpose:** Complete remaining MVP features following SOLID, DRY, OOP principles

---

## 📊 Current Implementation Status: 70-75% Complete

---

## 🏗️ EXISTING ARCHITECTURE (DO NOT DUPLICATE)

### Database Layer
**Location:** `supabase/migrations/`

**Existing Tables:**
- `clinicas` - Clinic organizations (multi-tenant)
- `psicologos` - Psychologists (auth users)
- `pacientes` - Patients with demographic data
- `testes_templates` - Test templates library
- `tabelas_normativas` - Normative tables for scoring
- `testes_aplicados` - Applied tests with results
- `registros_manuais` - Manual test records
- `logs_auditoria` - Audit trail

**Existing Migrations:**
1. `001_initial_schema.sql` - Core schema
2. `002_rls_policies.sql` - Row-level security
3. `003_add_super_admin.sql` - Super admin system

---

### Backend Layer - Data Access

**Existing Repositories:** `lib/db/repositories/`

✅ **ClinicaRepository.ts**
- Methods: `findAll()`, `findById()`, `create()`, `update()`, `delete()`
- Pattern: Result<T, E> for error handling
- Uses: Supabase client with RLS

✅ **TesteTemplateRepository.ts**
- Methods: `findAll()`, `findById()`, `create()`, `update()`, `delete()`, `duplicate()`
- Pattern: Railway-oriented programming
- Filtering: tipo, publico, ativo

✅ **TabelaNormativaRepository.ts**
- Methods: `findAll()`, `findById()`, `findByTesteId()`, `create()`, `update()`, `delete()`
- Features: CSV import support

✅ **LinkRepository.ts**
- Methods: `findByToken()`, `create()`, `updateStatus()`, `authenticate()`
- Security: Token generation, access code validation

✅ **RegistroManualRepository.ts**
- Methods: `findAll()`, `findById()`, `create()`, `update()`, `delete()`
- Features: File attachment support

⚠️ **MISSING REPOSITORIES:**
- `PacienteRepository.ts` - Check if exists, may need to create
- `TesteAplicadoRepository.ts` - Check if exists, may need to create
- `PsicologoRepository.ts` - **DOES NOT EXIST** - Must create

---

### Backend Layer - Business Logic

**Existing Services:** `lib/services/`

✅ **ClinicaService.ts**
- Methods: `list()`, `get()`, `create()`, `update()`, `delete()`
- Features: Audit logging, validation
- Pattern: Service delegates to repository

✅ **TesteTemplateService.ts**
- Methods: `list()`, `get()`, `create()`, `update()`, `delete()`, `duplicate()`
- Validation: Template structure validation

✅ **TabelaNormativaService.ts**
- Methods: `list()`, `get()`, `create()`, `update()`, `delete()`, `importCSV()`
- Validation: Normative data validation

✅ **LinkService.ts**
- Methods: `generate()`, `validate()`, `authenticate()`
- Security: Token generation, rate limiting

✅ **RegistroManualService.ts**
- Methods: `list()`, `get()`, `create()`, `update()`, `delete()`, `uploadAttachment()`
- Features: File handling

✅ **PDFGeneratorService.ts**
- Methods: `generateTestReport()`, `generateProntuario()`
- Library: react-pdf
- Features: Professional PDF reports

⚠️ **MISSING SERVICES:**
- `PacienteService.ts` - Patient business logic
- `TesteAplicadoService.ts` - Test application business logic
- `PsicologoService.ts` - Psychologist business logic
- `NormalizacaoService.ts` - Normalization calculation engine (CRITICAL)

---

### API Layer

**Existing API Routes:** `app/api/`

✅ **Authentication:** `/api/auth/`
- `login/route.ts` - POST - Email/password authentication
- `logout/route.ts` - POST - Session termination
- `session/route.ts` - GET - Current session
- `refresh/route.ts` - POST - Token refresh

✅ **Clinicas:** `/api/clinicas/`
- `route.ts` - GET (list), POST (create)
- `[id]/route.ts` - GET (detail), PUT (update), DELETE (soft delete)

✅ **Pacientes:** `/api/pacientes/`
- `route.ts` - GET (list with pagination), POST (create)
- `[id]/route.ts` - GET (detail), PUT (update), DELETE (soft delete)

✅ **Testes Templates:** `/api/testes-templates/`
- `route.ts` - GET (list with filters), POST (create)
- `[id]/route.ts` - GET (detail), PUT (update), DELETE (soft delete)
- `[id]/duplicate/route.ts` - POST (duplicate template)

✅ **Tabelas Normativas:** `/api/tabelas-normativas/`
- `route.ts` - GET (list), POST (create)
- `[id]/route.ts` - GET (detail), PUT (update), DELETE (soft delete)
- `import-csv/route.ts` - POST (CSV import)

✅ **Testes Aplicados:** `/api/testes-aplicados/`
- `route.ts` - GET (list), POST (create application)
- `[id]/route.ts` - GET (detail), PUT (update)
- `[id]/finalizar/route.ts` - POST (finalize and calculate)

✅ **Links:** `/api/links/`
- `route.ts` - POST (generate link)
- `[token]/route.ts` - GET (validate), POST (authenticate)

✅ **Registros Manuais:** `/api/registros-manuais/`
- `route.ts` - GET (list), POST (create)
- `[id]/route.ts` - GET (detail), PUT (update), DELETE (soft delete)
- `[id]/upload/route.ts` - POST (upload attachment)

✅ **PDF Export:** `/api/export-pdf/`
- `[id]/route.ts` - GET (export test result as PDF)

⚠️ **MISSING API ROUTES:**
- `/api/psicologos/route.ts` - GET, POST
- `/api/psicologos/[id]/route.ts` - GET, PUT, DELETE
- `/api/testes-aplicados/[id]/reabrir/route.ts` - POST (reopen test)
- `/api/links/[token]/questoes/route.ts` - GET (fetch questions)
- `/api/links/[token]/responder/route.ts` - PUT (save answer)
- `/api/links/[token]/finalizar/route.ts` - POST (complete test)

---

### Frontend Layer - State Management

**Existing Stores:** `lib/stores/`

✅ **useAuthStore.ts** (Zustand)
- State: `user`, `isAuthenticated`, `isLoading`
- Actions: `login()`, `logout()`, `checkSession()`
- Selectors: `selectIsSuperAdmin`, `selectUser`

---

### Frontend Layer - Hooks

**Existing Hooks:** `lib/hooks/`

✅ **useApi.ts** - Generic API client
- `useApi<T>()` - Generic hook with loading/error states
- `usePacientes()` - Patient CRUD operations
- `useTestesTemplates()` - Template operations
- `useClinicas()` - Clinic operations
- `useLinks()` - Link generation operations

⚠️ **MISSING HOOKS:**
- `usePsicologos()` - Psychologist operations
- `useTestesAplicados()` - Applied tests operations
- `useTabelas()` - Normative tables operations
- `useRegistros()` - Manual records operations

✅ **useTouchGestures.ts** - Mobile touch interactions
- `useTouchGestures()` - Swipe detection
- `useLongPress()` - Long press detection

✅ **useMediaQuery.ts** - Responsive breakpoints
- `useMediaQuery(query)` - Generic media query hook
- `useBreakpoint(breakpoint)` - Tailwind breakpoint detection
- `useIsMobile()`, `useIsTablet()`, `useIsDesktop()` - Device detection

---

### Frontend Layer - UI Components

**Existing Components:** `components/ui/`

✅ **card.tsx** (Radix UI)
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Pattern: shadcn/ui component

⚠️ **MISSING UI COMPONENTS:**
- Form components (forms are inline in pages currently)
- Button, Input, Select, Textarea, Label (may need to add from shadcn/ui)
- Dialog, Modal components

---

### Frontend Layer - Pages

**Existing Pages:** `app/`

✅ **Authentication:**
- `login/page.tsx` - Login form
- `cadastro/page.tsx` - Registration form

✅ **Dashboard Layout:** `(dashboard)/layout.tsx`
- Sidebar navigation
- Header with user info
- Protected route wrapper

✅ **Dashboard Pages:**
- `dashboard/page.tsx` - Stats overview, quick actions
- `pacientes/page.tsx` - Patient list with search/filters
- `biblioteca/page.tsx` - Test library with filters, duplicate action
- `admin/page.tsx` - Super admin clinic management

✅ **Public Pages:**
- `responder/[token]/page.tsx` - Public test response (basic structure)

⚠️ **MISSING PAGES:**

**Patient Management:**
- `(dashboard)/pacientes/novo/page.tsx` - Create patient
- `(dashboard)/pacientes/[id]/editar/page.tsx` - Edit patient
- `(dashboard)/pacientes/[id]/prontuario/page.tsx` - Patient record timeline

**Clinic Management (Admin):**
- `(dashboard)/admin/clinicas/nova/page.tsx` - Create clinic
- `(dashboard)/admin/clinicas/[id]/editar/page.tsx` - Edit clinic

**Test Application:**
- `(dashboard)/aplicar/presencial/[teste_aplicado_id]/page.tsx` - Presential test application
- Component for link generation modal/page

**Test Results:**
- `(dashboard)/resultados/[id]/page.tsx` - Test result detail with charts

**Manual Records:**
- `(dashboard)/registros-manuais/novo/page.tsx` - Create manual record
- `(dashboard)/registros-manuais/[id]/page.tsx` - View/edit manual record

**Normative Tables:**
- `(dashboard)/normas/page.tsx` - List normative tables
- `(dashboard)/normas/nova/page.tsx` - Create normative table
- `(dashboard)/normas/import/page.tsx` - Import CSV

**Test Templates (Future - not MVP):**
- `(dashboard)/testes/page.tsx` - List templates
- `(dashboard)/testes/novo/page.tsx` - Create template
- `(dashboard)/testes/[id]/editar/page.tsx` - Edit template

---

### Frontend Layer - Types

**Existing Types:** `types/database.ts`

✅ **Database Types** (Supabase generated)
- `Clinica` - Clinic entity
- `Psicologo` - Psychologist entity
- `Paciente` - Patient entity
- `TesteTemplate` - Test template entity
- `TabelaNormativa` - Normative table entity
- `TesteAplicado` - Applied test entity
- `RegistroManual` - Manual record entity

---

## 🎯 IMPLEMENTATION PHASES

### PHASE 1: Complete Data Layer ✅ Priority: CRITICAL

**Objective:** Complete all missing repositories and services following existing patterns

**Tasks:**

1. **Create PacienteRepository** (if not exists)
   - Check: `lib/db/repositories/PacienteRepository.ts`
   - Methods: `findAll()`, `findById()`, `findByClinica()`, `create()`, `update()`, `delete()`
   - Pattern: Mirror ClinicaRepository structure
   - Features: Age calculation, pagination, search

2. **Create TesteAplicadoRepository** (if not exists)
   - Location: `lib/db/repositories/TesteAplicadoRepository.ts`
   - Methods: `findAll()`, `findById()`, `findByPaciente()`, `create()`, `update()`, `updateStatus()`, `updateRespostas()`, `finalize()`, `reopen()`
   - Pattern: Mirror existing repository structure
   - Features: Status management, progress tracking

3. **Create PsicologoRepository** ⚠️ MUST CREATE
   - Location: `lib/db/repositories/PsicologoRepository.ts`
   - Methods: `findAll()`, `findById()`, `findByEmail()`, `findByClinica()`, `create()`, `update()`, `delete()`
   - Pattern: Mirror ClinicaRepository
   - Security: Password hash handling

4. **Create PacienteService** ⚠️ MUST CREATE
   - Location: `lib/services/PacienteService.ts`
   - Methods: `list()`, `get()`, `create()`, `update()`, `delete()`
   - Validation: Required fields (nome, data_nascimento, escolaridade_anos)
   - Features: Age calculation, audit logging
   - Pattern: Delegate to PacienteRepository

5. **Create TesteAplicadoService** ⚠️ MUST CREATE
   - Location: `lib/services/TesteAplicadoService.ts`
   - Methods: `list()`, `get()`, `create()`, `update()`, `finalize()`, `reopen()`
   - Business Logic: Status transitions, validation
   - Integration: Calls NormalizacaoService on finalize
   - Audit: Log all status changes

6. **Create PsicologoService** ⚠️ MUST CREATE
   - Location: `lib/services/PsicologoService.ts`
   - Methods: `list()`, `get()`, `create()`, `update()`, `delete()`
   - Security: Password hashing (bcrypt), email validation
   - Validation: CRP format, email uniqueness
   - Audit: All operations logged

7. **Create NormalizacaoService** ⚠️ CRITICAL - MUST CREATE
   - Location: `lib/services/NormalizacaoService.ts`
   - Methods:
     - `calcularPontuacaoBruta(respostas, regraCalculo)` - Calculate raw score
     - `buscarFaixaNormativa(paciente, tabelaNormativa)` - Find applicable norm
     - `calcularPercentil(pontuacaoBruta, faixa)` - Calculate percentile
     - `calcularEscoreZ(pontuacaoBruta, faixa)` - Calculate z-score
     - `calcularEscoreT(escoreZ)` - Calculate t-score
     - `classificar(percentil)` - Qualitative classification
     - `normalizar(pontuacaoBruta, paciente, testeId)` - Main normalization flow
   - Algorithm: Linear interpolation for percentiles
   - Edge Cases: Out-of-norm patients, missing norms
   - Pattern: Pure functions, no state

**Dependencies:**
- Supabase client (`lib/db/supabase.ts`)
- Result type (`lib/types/result.ts`)
- Database types (`types/database.ts`)

**Validation Rules:**
- All create/update operations must validate required fields
- All operations must log to audit trail
- All operations must respect RLS policies
- All calculations must handle edge cases

---

### PHASE 2: Complete API Layer ✅ Priority: HIGH

**Objective:** Add missing API endpoints following existing patterns

**Pattern to Follow:**
```typescript
// Example: app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ServiceClass } from '@/lib/services/ServiceClass'

export async function GET(request: NextRequest) {
  try {
    const service = new ServiceClass()
    const result = await service.list(/* params */)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Tasks:**

1. **Create `/api/psicologos/route.ts`**
   - GET: List psychologists (filter by clinica_id)
   - POST: Create psychologist (validate CRP, hash password)
   - Auth: Require authenticated user
   - RLS: Only see psychologists from same clinic

2. **Create `/api/psicologos/[id]/route.ts`**
   - GET: Get psychologist details
   - PUT: Update psychologist (validate changes)
   - DELETE: Soft delete (set ativo = false)
   - Auth: Require authenticated user

3. **Create `/api/testes-aplicados/[id]/reabrir/route.ts`**
   - POST: Reopen completed test
   - Body: `{ motivo: string }`
   - Business Logic: Change status from 'completo' to 'reaberto'
   - Audit: Log reopening with reason
   - Response: Updated test object

4. **Create `/api/links/[token]/questoes/route.ts`**
   - GET: Fetch test questions for public response
   - Auth: Validate token only (no user auth)
   - Response: Test template with questions array
   - Security: Don't expose answer keys

5. **Create `/api/links/[token]/responder/route.ts`**
   - PUT: Save answer to test
   - Body: `{ questao_id: string, resposta: any }`
   - Logic: Update respostas JSONB, update progresso
   - Security: Validate token, check test not expired

6. **Create `/api/links/[token]/finalizar/route.ts`**
   - POST: Complete remote test
   - Logic:
     - Change status to 'completo'
     - Call NormalizacaoService to calculate results
     - Save pontuacao_bruta, normalizacao, interpretacao
     - Block link (set ativo = false)
   - Response: Success message
   - Notification: Could trigger email to psychologist (future)

**API Patterns:**
- All routes use Result<T, E> pattern
- All routes have try-catch error handling
- All routes validate authentication when needed
- All routes return proper HTTP status codes
- All routes log errors for debugging

---

### PHASE 3: Complete Frontend Hooks ✅ Priority: HIGH

**Objective:** Add missing entity hooks to `lib/hooks/useApi.ts`

**Pattern to Follow:**
```typescript
export function useEntityName() {
  const api = useApi()

  const list = useCallback((params?: Params) => {
    const searchParams = new URLSearchParams()
    // Add params
    return api.get(`/api/entity?${searchParams.toString()}`)
  }, [api])

  const getById = useCallback((id: string) =>
    api.get(`/api/entity/${id}`), [api])

  const create = useCallback((data: EntityData) =>
    api.post('/api/entity', data), [api])

  const update = useCallback((id: string, data: Partial<EntityData>) =>
    api.put(`/api/entity/${id}`, data), [api])

  const remove = useCallback((id: string) =>
    api.delete(`/api/entity/${id}`), [api])

  return { ...api, list, getById, create, update, remove }
}
```

**Tasks:**

1. **Add `usePsicologos()` to `lib/hooks/useApi.ts`**
   - Methods: list, getById, create, update, remove
   - List params: clinica_id filter

2. **Add `useTestesAplicados()` to `lib/hooks/useApi.ts`**
   - Methods: list, getById, create, update, finalize, reopen
   - List params: paciente_id, status filters
   - Special: `reopen(id, motivo)`

3. **Add `useTabelas()` to `lib/hooks/useApi.ts`**
   - Methods: list, getById, create, update, remove, importCSV
   - List params: teste_template_id filter

4. **Add `useRegistros()` to `lib/hooks/useApi.ts`**
   - Methods: list, getById, create, update, remove, uploadAttachment
   - List params: paciente_id filter

**Testing:**
- Each hook should be tested in a page to verify API integration
- Error handling should be tested (network failures, validation errors)

---

### PHASE 4: Build Reusable Form Components ✅ Priority: MEDIUM

**Objective:** Create reusable form components following composition pattern

**Component Pattern:**
```typescript
interface FormProps {
  initialData?: EntityType
  onSubmit: (data: EntityType) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function EntityForm({ initialData, onSubmit, onCancel, isLoading }: FormProps) {
  const [formData, setFormData] = useState(initialData || defaultValues)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

**Tasks:**

1. **Create `components/forms/PatientForm.tsx`**
   - Fields (PRD Section 3.1):
     - Required: nome_completo, data_nascimento, sexo, escolaridade_anos
     - Optional: cpf, telefone, email, profissao, estado_civil, endereco, motivo_encaminhamento, observacoes_clinicas
   - Features:
     - Display calculated age (read-only field)
     - CPF format validation (XXX.XXX.XXX-XX)
     - Date picker for data_nascimento
     - Number input for escolaridade_anos
   - Validation:
     - Required field validation
     - Age must be >= 0
     - CPF format (if provided)
     - Email format (if provided)
   - Props: `initialData?: Paciente`, `onSubmit`, `onCancel`, `isLoading`

2. **Create `components/forms/ClinicForm.tsx`**
   - Fields (PRD Section 3.1):
     - Required: nome
     - Optional: cnpj, endereco (JSONB), telefone, email, logo_url
   - Features:
     - CNPJ format validation (XX.XXX.XXX/XXXX-XX)
     - Logo upload with preview
     - Address structured input (rua, cidade, estado, cep)
   - Validation:
     - Nome required
     - CNPJ format (if provided)
     - Email format (if provided)
   - Props: `initialData?: Clinica`, `onSubmit`, `onCancel`, `isLoading`

3. **Create `components/forms/TestQuestionRenderer.tsx`**
   - Purpose: Render different question types dynamically
   - Types (PRD Section 3.2):
     - `likert_0_4` - Radio buttons (0-4)
     - `likert_0_3` - Radio buttons (0-3)
     - `multipla_escolha` - Radio buttons (A, B, C, D)
     - `texto_livre` - Textarea
     - `numero` - Number input
   - Props:
     - `questao: { numero, texto, subtexto, tipo_resposta, obrigatoria }`
     - `resposta: any` - Current answer
     - `onChange: (value) => void`
   - Features:
     - Highlight required questions
     - Responsive mobile layout
     - Touch-friendly sizing

4. **Create `components/forms/ManualRecordForm.tsx`**
   - Fields (PRD Section 3.4):
     - nome_teste (text input)
     - data_aplicacao (date picker)
     - resultado_texto (rich text editor - react-quill or tiptap)
     - observacoes (textarea)
     - anexos (file upload - images, PDFs)
   - Features:
     - Multiple file upload
     - File preview
     - Rich text toolbar (bold, italic, lists)
     - Max file size validation (10MB)
   - Props: `initialData?: RegistroManual`, `onSubmit`, `onCancel`, `isLoading`

**Additional UI Components Needed:**
- May need to add from shadcn/ui:
  - `components/ui/button.tsx`
  - `components/ui/input.tsx`
  - `components/ui/label.tsx`
  - `components/ui/select.tsx`
  - `components/ui/textarea.tsx`
  - `components/ui/dialog.tsx`

---

### PHASE 5A: Patient Management Pages ✅ Priority: CRITICAL

**Objective:** Complete patient CRUD workflow

**Tasks:**

1. **Create `app/(dashboard)/pacientes/novo/page.tsx`**
   - Layout: Centered card with form
   - Components: PatientForm
   - Hooks: usePacientes
   - Flow:
     1. Render PatientForm with no initial data
     2. On submit, call `usePacientes().create(data)`
     3. Show success message
     4. Redirect to `/pacientes` or patient detail
   - Error Handling: Display API errors below form

2. **Create `app/(dashboard)/pacientes/[id]/editar/page.tsx`**
   - Layout: Centered card with form
   - Components: PatientForm
   - Hooks: usePacientes
   - Flow:
     1. Fetch patient data with `usePacientes().getById(id)`
     2. Render PatientForm with initialData
     3. On submit, call `usePacientes().update(id, data)`
     4. Show success message
     5. Redirect to patient detail
   - Loading: Show skeleton while fetching
   - Error: Show 404 if patient not found

3. **Create `app/(dashboard)/pacientes/[id]/prontuario/page.tsx`**
   - Layout: Full page with header + timeline
   - Sections (PRD Section 3.5):
     - Patient summary (name, age, recent tests count)
     - Filters (date range, test type, status)
     - Timeline of all tests (card list)
   - Hooks: usePacientes, useTestesAplicados
   - Features:
     - Each test card shows: date, test name, score, percentile, status
     - Quick actions: View details, Export PDF, Reopen
     - Empty state: "No tests applied yet"
     - Button: "New Assessment"
   - Mobile: Stack cards vertically

---

### PHASE 5B: Clinic Management Pages (Admin) ✅ Priority: HIGH

**Objective:** Complete super admin clinic management

**Tasks:**

1. **Create `app/(dashboard)/admin/clinicas/nova/page.tsx`**
   - Auth: Check `selectIsSuperAdmin` from Zustand
   - Redirect: Non-super-admins to `/dashboard`
   - Layout: Centered card with form
   - Components: ClinicForm
   - Hooks: useClinicas
   - Flow:
     1. Render ClinicForm
     2. On submit, call `useClinicas().create(data)`
     3. Show success message
     4. Redirect to `/admin`

2. **Create `app/(dashboard)/admin/clinicas/[id]/editar/page.tsx`**
   - Auth: Check `selectIsSuperAdmin`
   - Layout: Centered card with form
   - Components: ClinicForm
   - Hooks: useClinicas
   - Flow:
     1. Fetch clinic with `useClinicas().getById(id)`
     2. Render ClinicForm with initialData
     3. On submit, call `useClinicas().update(id, data)`
     4. Redirect to `/admin`

---

### PHASE 5C: Test Application Flow ✅ Priority: CRITICAL

**Objective:** Complete presential and remote test application

**Tasks:**

1. **Create `app/(dashboard)/aplicar/presencial/[teste_aplicado_id]/page.tsx`**
   - Layout: Full screen question display
   - Hooks: useTestesAplicados, useTestesTemplates
   - Flow (PRD Section 3.4):
     1. Fetch teste_aplicado data (get patient, test template)
     2. Load questions from test template
     3. Display one question at a time (or all, configurable)
     4. Render with TestQuestionRenderer
     5. Navigation: "Previous", "Next", "Save Draft", "Finalize"
     6. On answer change, auto-save to API
     7. Progress bar: X/Y questions
   - Features:
     - Save draft (call API to save respostas)
     - Timer (optional, for timed tests)
     - Mark question for review
     - Mobile-optimized touch targets
   - Finalize:
     1. Validate all required questions answered
     2. Call `/api/testes-aplicados/[id]/finalizar`
     3. Show loading "Calculating results..."
     4. Redirect to results page

2. **Update `app/responder/[token]/page.tsx`**
   - Current: Basic structure with mock questions
   - Changes Needed:
     1. Fetch real questions from `/api/links/[token]/questoes`
     2. Render with TestQuestionRenderer
     3. Save each answer with `/api/links/[token]/responder`
     4. Auto-save progress (debounced)
     5. Finalize with `/api/links/[token]/finalizar`
     6. Show success screen
   - States:
     - validating: Checking token
     - code: Enter access code
     - test: Answering questions
     - success: Completed
     - error: Invalid/expired link

3. **Create `components/test/LinkGeneratorModal.tsx`**
   - Type: Modal dialog (use Radix UI Dialog)
   - Trigger: Button in patient prontuario "Generate Link"
   - Form:
     - Select test template (dropdown)
     - Option: Require access code (checkbox)
     - Expiration date (date picker, default +30 days)
   - On submit:
     1. Call `useLinks().generate({ teste_aplicado_id, expira_em, requer_codigo })`
     2. Display generated link + code
     3. Copy to clipboard button
     4. WhatsApp share button (opens WhatsApp with pre-filled message)
   - Example message: "Olá! Acesse este link para responder ao teste: [URL]. Código de acesso: [CODE]"

---

### PHASE 5D: Test Results Pages ✅ Priority: HIGH

**Objective:** View and interpret test results

**Tasks:**

1. **Create `app/(dashboard)/resultados/[id]/page.tsx`**
   - Layout: Full page with sections
   - Hooks: useTestesAplicados, usePacientes
   - Sections (PRD Section 3.5):
     1. **General Info**
        - Test name, date, psychologist, application type
     2. **Raw Scores**
        - Total score
        - Section scores (if applicable)
        - Table of all answers
     3. **Normalization** ⭐ CRITICAL
        - Normative table used
        - Demographic range applied
        - Percentile (with PercentileChart)
        - Z-score, T-score
        - Qualitative classification
     4. **Interpretation**
        - General classification
        - Attention points
        - Recommendations
        - Comparison with previous tests (if any)
     5. **Actions**
        - Export PDF button
        - Reopen button (with reason modal)
   - Components: PercentileChart
   - Mobile: Stack sections vertically

2. **Create `components/results/PercentileChart.tsx`**
   - Purpose: Visual representation of normal distribution
   - Library: recharts or simple SVG
   - Display:
     - Bell curve (normal distribution)
     - Mark patient's percentile position
     - Shade area below percentile
     - Labels: P5, P25, P50, P75, P95
   - Props: `percentil: number`, `classificacao: string`
   - Responsive: Scale on mobile

---

### PHASE 5E: Manual Records Pages ✅ Priority: MEDIUM

**Objective:** Create/edit manual test records

**Tasks:**

1. **Create `app/(dashboard)/registros-manuais/novo/page.tsx`**
   - Layout: Full page form
   - Components: ManualRecordForm
   - Hooks: useRegistros
   - Flow:
     1. Render ManualRecordForm
     2. On submit, call `useRegistros().create(data)`
     3. If files attached, call `useRegistros().uploadAttachment(id, file)` for each
     4. Show success
     5. Redirect to patient prontuario

2. **Create `app/(dashboard)/registros-manuais/[id]/page.tsx`**
   - Layout: View mode + edit mode toggle
   - Hooks: useRegistros
   - View Mode:
     - Display all fields (read-only)
     - Show attached files with preview/download
     - Edit button
   - Edit Mode:
     - Render ManualRecordForm with initialData
     - On submit, call `useRegistros().update(id, data)`

---

### PHASE 5F: Normative Tables Pages ✅ Priority: LOW (Can use API directly for MVP)

**Objective:** Admin interface for managing normative tables

**Tasks:**

1. **Create `app/(dashboard)/normas/page.tsx`**
   - Layout: List with search/filters
   - Hooks: useTabelas
   - Filters:
     - Test template
     - Country
     - Year
     - Active/inactive
   - List:
     - Card per table
     - Shows: name, test, country, year, sample size
     - Actions: Edit, Delete, Set as default
   - Button: "New Table", "Import CSV"

2. **Create `app/(dashboard)/normas/nova/page.tsx`**
   - Layout: Multi-step form
   - Steps:
     1. Metadata (name, country, year, sample size)
     2. Stratification variables (age, education, sex)
     3. Ranges (table input with faixas)
   - Validation: Percentiles in order, no range overlap
   - Submit: Call `useTabelas().create(data)`

3. **Create `app/(dashboard)/normas/import/page.tsx`**
   - Layout: CSV upload + mapping
   - Steps:
     1. Upload CSV file
     2. Map columns (idade_min → "Age Min" column)
     3. Preview parsed data
     4. Validate data
     5. Confirm and import
   - Validation:
     - Check required columns present
     - Validate data types
     - Check percentiles ascending
   - Submit: Call `useTabelas().importCSV(formData)`

---

### PHASE 6: PWA Assets and Final Polish ✅ Priority: LOW

**Objective:** Complete PWA setup and final testing

**Tasks:**

1. **Generate PWA Icons**
   - Required sizes: 192x192, 512x512
   - Format: PNG
   - Location: `/public/icon-192x192.png`, `/public/icon-512x512.png`
   - Tools: Use Figma, Canva, or online generator
   - Design: Simple logo with "NeuroTest" text

2. **Comprehensive Testing**
   - Test all user flows:
     - ✅ Login/logout
     - ✅ Create/edit patient
     - ✅ Apply test (presential)
     - ✅ Apply test (remote link)
     - ✅ View results
     - ✅ Export PDF
     - ✅ Reopen test
     - ✅ Create manual record
     - ✅ Super admin clinic management
   - Test on devices:
     - Desktop (Chrome, Firefox, Safari)
     - Mobile (iOS Safari, Android Chrome)
     - Tablet

3. **API Error Handling Verification**
   - All endpoints return proper status codes
   - All errors have user-friendly messages
   - All validation errors detailed
   - All server errors logged

---

## 🎨 DESIGN PATTERNS TO FOLLOW

### Repository Pattern
```typescript
export class EntityRepository {
  async findAll(filters?: Filters): Promise<Result<Entity[], string>> {
    try {
      let query = supabase.from('table').select('*')
      // Apply filters
      const { data, error } = await query
      if (error) return { success: false, error: error.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Database error' }
    }
  }
}
```

### Service Pattern
```typescript
export class EntityService {
  private repository: EntityRepository

  constructor() {
    this.repository = new EntityRepository()
  }

  async create(data: CreateData): Promise<Result<Entity, string>> {
    // Validate
    const validation = this.validate(data)
    if (!validation.success) return validation

    // Create
    const result = await this.repository.create(data)

    // Audit
    if (result.success) {
      await this.audit('create', result.data)
    }

    return result
  }

  private validate(data: CreateData): Result<true, string> {
    // Validation logic
  }

  private async audit(action: string, entity: Entity) {
    // Audit logging
  }
}
```

### API Route Pattern
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const service = new EntityService()
    const result = await service.create(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Hook Pattern
```typescript
export function useEntity() {
  const api = useApi()

  const list = useCallback((params?: Params) => {
    const searchParams = new URLSearchParams()
    if (params?.filter) searchParams.set('filter', params.filter)
    return api.get(`/api/entity?${searchParams.toString()}`)
  }, [api])

  return { ...api, list, /* other methods */ }
}
```

### Form Component Pattern
```typescript
interface FormProps {
  initialData?: Entity
  onSubmit: (data: Entity) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function EntityForm({ initialData, onSubmit, onCancel, isLoading }: FormProps) {
  const [formData, setFormData] = useState(initialData || defaultValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    // Validation logic
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  )
}
```

### Page Component Pattern
```typescript
'use client'

export default function EntityPage() {
  const router = useRouter()
  const entityHook = useEntity()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: Entity) => {
    setLoading(true)
    try {
      const result = await entityHook.create(data)
      if (result) {
        alert('Success!')
        router.push('/success-route')
      }
    } catch (error) {
      console.error(error)
      alert('Error!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <EntityForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={loading}
      />
    </div>
  )
}
```

---

## 🔍 CRITICAL IMPLEMENTATION NOTES

### NormalizacaoService Algorithm

**Purpose:** Convert raw test scores to normalized scores (PRD Section 3.3)

**Key Functions:**

1. **`calcularPontuacaoBruta(respostas, regrasCalculo)`**
   - Input: User responses + test calculation rules
   - Process: Apply calculation type (soma_simples, soma_ponderada, secoes, custom)
   - Output: Raw score number
   - Edge cases: Missing answers, inverted questions

2. **`buscarFaixaNormativa(paciente, tabelaNormativa)`**
   - Input: Patient demographics + normative table
   - Process: Find matching range (idade_min/max, escolaridade_min/max)
   - Output: Faixa object with media, desvio_padrao, percentis
   - Edge cases:
     - Patient outside norms → use closest range + flag
     - Multiple matches → use most specific

3. **`calcularPercentil(pontuacaoBruta, faixa)`**
   - Input: Raw score + normative range
   - Process: Linear interpolation between percentile points
   - Algorithm (PRD Section 3.3):
     ```typescript
     if (score <= faixa.percentis['5']) return 5
     if (score >= faixa.percentis['95']) return 95

     // Find adjacent percentiles
     for (let p of [10, 25, 50, 75, 90]) {
       if (score < faixa.percentis[p]) {
         const pBaixo = getAnterior(p) // e.g., 5 for 10
         const scoreBaixo = faixa.percentis[pBaixo]
         const scoreAlto = faixa.percentis[p]
         // Linear interpolation
         const percentil = pBaixo + (p - pBaixo) * (score - scoreBaixo) / (scoreAlto - scoreBaixo)
         return percentil
       }
     }
     ```
   - Output: Percentile number (0-100)

4. **`calcularEscoreZ(pontuacaoBruta, faixa)`**
   - Formula: `(pontuacaoBruta - faixa.media) / faixa.desvio_padrao`
   - Output: Z-score number

5. **`calcularEscoreT(escoreZ)`**
   - Formula: `50 + (escoreZ * 10)`
   - Output: T-score number

6. **`classificar(percentil)`**
   - Mapping (PRD Section 3.3):
     - P ≤ 5: "Muito Inferior"
     - P ≤ 16: "Inferior"
     - P ≤ 84: "Médio"
     - P ≤ 95: "Superior"
     - P > 95: "Muito Superior"

**Testing:** Must have unit tests for all edge cases

---

## 📋 CHECKLISTS

### Pre-Implementation Checklist
- [ ] Read IMPLEMENTATION_PLAN.md
- [ ] Check existing files before creating new ones
- [ ] Understand repository/service/API/hook patterns
- [ ] Review PRD for business requirements

### Repository Checklist
- [ ] Follows Result<T, E> pattern
- [ ] All methods have try-catch
- [ ] Uses Supabase client correctly
- [ ] Respects RLS policies
- [ ] Has pagination for list methods
- [ ] Has search/filter parameters

### Service Checklist
- [ ] Validates input data
- [ ] Calls repository methods
- [ ] Logs to audit trail
- [ ] Returns Result<T, E>
- [ ] Handles edge cases
- [ ] Has business logic (not just CRUD)

### API Route Checklist
- [ ] Has try-catch error handling
- [ ] Validates authentication if needed
- [ ] Delegates to service layer
- [ ] Returns proper HTTP status codes
- [ ] Returns JSON error messages
- [ ] Logs errors to console

### Hook Checklist
- [ ] Follows useApi pattern
- [ ] Uses useCallback for methods
- [ ] Returns loading/error states
- [ ] Has TypeScript types
- [ ] Handles API errors gracefully

### Form Component Checklist
- [ ] Has controlled inputs
- [ ] Validates on submit
- [ ] Shows error messages
- [ ] Has loading state
- [ ] Disables submit while loading
- [ ] Mobile-responsive layout
- [ ] Has Cancel button

### Page Component Checklist
- [ ] Uses 'use client' directive
- [ ] Fetches data on mount if needed
- [ ] Has loading skeleton
- [ ] Has error handling
- [ ] Has empty state
- [ ] Mobile-responsive layout
- [ ] Has proper navigation

---

## 🚀 IMPLEMENTATION ORDER (Priority)

### Week 1: Foundation
1. ✅ CRITICAL: NormalizacaoService (test calculations depend on this)
2. ✅ CRITICAL: PacienteRepository + Service
3. ✅ CRITICAL: TesteAplicadoRepository + Service
4. ✅ HIGH: PsicologoRepository + Service

### Week 2: API Layer
5. ✅ CRITICAL: Missing API endpoints (psicologos, reabrir, link/questoes, link/responder, link/finalizar)
6. ✅ HIGH: Complete hooks (usePsicologos, useTestesAplicados, useTabelas, useRegistros)

### Week 3: Forms & Core Pages
7. ✅ CRITICAL: PatientForm + patient CRUD pages
8. ✅ CRITICAL: Patient prontuario page
9. ✅ CRITICAL: Test application (presential)
10. ✅ HIGH: Public test completion (responder page)

### Week 4: Results & Polish
11. ✅ HIGH: Test results detail page + PercentileChart
12. ✅ MEDIUM: ClinicForm + admin pages
13. ✅ MEDIUM: ManualRecordForm + pages
14. ✅ MEDIUM: Link generator modal
15. ✅ LOW: Normative tables pages
16. ✅ LOW: PWA icons
17. ✅ LOW: Final testing

---

## 📚 REFERENCES

- **PRD:** `/product_requirement.md`
- **Database Schema:** `supabase/migrations/001_initial_schema.sql`
- **Existing Repository:** `lib/db/repositories/ClinicaRepository.ts`
- **Existing Service:** `lib/services/ClinicaService.ts`
- **Existing API:** `app/api/clinicas/route.ts`
- **Existing Hook:** `lib/hooks/useApi.ts`
- **Existing Form Example:** Look at inline forms in existing pages
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Radix UI Docs:** https://www.radix-ui.com/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**END OF IMPLEMENTATION PLAN**
