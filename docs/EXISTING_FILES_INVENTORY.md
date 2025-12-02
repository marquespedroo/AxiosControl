# Existing Files Inventory - DO NOT DUPLICATE

**Last Updated:** 2025-10-06
**Purpose:** Quick reference of all existing files to prevent duplication after compaction

---

## 📁 PROJECT STRUCTURE

```
sistema_testes/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx ✅ EXISTS
│   │   ├── dashboard/
│   │   │   └── page.tsx ✅ EXISTS (Dashboard with stats)
│   │   ├── pacientes/
│   │   │   ├── page.tsx ✅ EXISTS (Patient list)
│   │   │   ├── novo/ ❌ MISSING
│   │   │   └── [id]/
│   │   │       ├── editar/ ❌ MISSING
│   │   │       └── prontuario/ ❌ MISSING
│   │   ├── biblioteca/
│   │   │   └── page.tsx ✅ EXISTS (Test library)
│   │   ├── admin/
│   │   │   ├── page.tsx ✅ EXISTS (Admin panel)
│   │   │   └── clinicas/
│   │   │       ├── nova/ ❌ MISSING
│   │   │       └── [id]/
│   │   │           └── editar/ ❌ MISSING
│   │   ├── aplicar/ ❌ MISSING
│   │   ├── resultados/ ❌ MISSING
│   │   ├── registros-manuais/ ❌ MISSING
│   │   ├── normas/ ❌ MISSING
│   │   └── testes/ ❌ MISSING (Future)
│   ├── responder/
│   │   └── [token]/
│   │       └── page.tsx ✅ EXISTS (Public test, needs completion)
│   ├── login/
│   │   └── page.tsx ✅ EXISTS
│   ├── cadastro/
│   │   └── page.tsx ✅ EXISTS
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts ✅ EXISTS
│   │   │   ├── logout/route.ts ✅ EXISTS
│   │   │   ├── session/route.ts ✅ EXISTS
│   │   │   └── refresh/route.ts ✅ EXISTS
│   │   ├── clinicas/
│   │   │   ├── route.ts ✅ EXISTS (GET, POST)
│   │   │   └── [id]/route.ts ✅ EXISTS (GET, PUT, DELETE)
│   │   ├── pacientes/
│   │   │   ├── route.ts ✅ EXISTS (GET, POST)
│   │   │   └── [id]/route.ts ✅ EXISTS (GET, PUT, DELETE)
│   │   ├── psicologos/ ❌ MISSING
│   │   ├── testes-templates/
│   │   │   ├── route.ts ✅ EXISTS (GET, POST)
│   │   │   └── [id]/
│   │   │       ├── route.ts ✅ EXISTS (GET, PUT, DELETE)
│   │   │       └── duplicate/route.ts ✅ EXISTS (POST)
│   │   ├── tabelas-normativas/
│   │   │   ├── route.ts ✅ EXISTS (GET, POST)
│   │   │   ├── [id]/route.ts ✅ EXISTS (GET, PUT, DELETE)
│   │   │   └── import-csv/route.ts ✅ EXISTS (POST)
│   │   ├── testes-aplicados/
│   │   │   ├── route.ts ✅ EXISTS (GET, POST)
│   │   │   └── [id]/
│   │   │       ├── route.ts ✅ EXISTS (GET, PUT)
│   │   │       ├── finalizar/route.ts ✅ EXISTS (POST)
│   │   │       └── reabrir/ ❌ MISSING
│   │   ├── links/
│   │   │   ├── route.ts ✅ EXISTS (POST - generate)
│   │   │   └── [token]/
│   │   │       ├── route.ts ✅ EXISTS (GET validate, POST auth)
│   │   │       ├── questoes/ ❌ MISSING
│   │   │       ├── responder/ ❌ MISSING
│   │   │       └── finalizar/ ❌ MISSING
│   │   ├── registros-manuais/
│   │   │   ├── route.ts ✅ EXISTS (GET, POST)
│   │   │   └── [id]/
│   │   │       ├── route.ts ✅ EXISTS (GET, PUT, DELETE)
│   │   │       └── upload/route.ts ✅ EXISTS (POST)
│   │   └── export-pdf/
│   │       └── [id]/route.ts ✅ EXISTS (GET)
│   ├── layout.tsx ✅ EXISTS (Root layout with PWA meta)
│   └── page.tsx ✅ EXISTS (Landing page)
├── components/
│   ├── ui/
│   │   └── card.tsx ✅ EXISTS (Radix UI Card)
│   ├── forms/ ❌ MISSING (Need to create)
│   ├── test/ ❌ MISSING (Need to create)
│   └── results/ ❌ MISSING (Need to create)
├── lib/
│   ├── db/
│   │   ├── supabase.ts ✅ EXISTS (Supabase client)
│   │   └── repositories/
│   │       ├── ClinicaRepository.ts ✅ EXISTS
│   │       ├── TesteTemplateRepository.ts ✅ EXISTS
│   │       ├── TabelaNormativaRepository.ts ✅ EXISTS
│   │       ├── LinkRepository.ts ✅ EXISTS
│   │       ├── RegistroManualRepository.ts ✅ EXISTS
│   │       ├── PacienteRepository.ts ⚠️ UNKNOWN (Check)
│   │       ├── TesteAplicadoRepository.ts ⚠️ UNKNOWN (Check)
│   │       └── PsicologoRepository.ts ❌ MISSING
│   ├── services/
│   │   ├── ClinicaService.ts ✅ EXISTS
│   │   ├── TesteTemplateService.ts ✅ EXISTS
│   │   ├── TabelaNormativaService.ts ✅ EXISTS
│   │   ├── LinkService.ts ✅ EXISTS
│   │   ├── RegistroManualService.ts ✅ EXISTS
│   │   ├── PDFGeneratorService.ts ✅ EXISTS
│   │   ├── PacienteService.ts ❌ MISSING
│   │   ├── TesteAplicadoService.ts ❌ MISSING
│   │   ├── PsicologoService.ts ❌ MISSING
│   │   └── NormalizacaoService.ts ❌ MISSING (CRITICAL)
│   ├── stores/
│   │   └── useAuthStore.ts ✅ EXISTS (Zustand auth)
│   ├── hooks/
│   │   ├── useApi.ts ✅ EXISTS (useApi, usePacientes, useTestesTemplates, useClinicas, useLinks)
│   │   ├── useTouchGestures.ts ✅ EXISTS
│   │   └── useMediaQuery.ts ✅ EXISTS
│   ├── types/
│   │   └── result.ts ✅ EXISTS (Result<T, E> type)
│   └── utils.ts ✅ EXISTS (cn utility)
├── types/
│   └── database.ts ✅ EXISTS (Supabase generated types)
├── supabase/
│   ├── config.toml ✅ EXISTS
│   └── migrations/
│       ├── 001_initial_schema.sql ✅ EXISTS
│       ├── 002_rls_policies.sql ✅ EXISTS
│       └── 003_add_super_admin.sql ✅ EXISTS
├── public/
│   ├── manifest.json ✅ EXISTS (PWA manifest)
│   ├── icon-192x192.png ❌ MISSING
│   └── icon-512x512.png ❌ MISSING
├── product_requirement.md ✅ EXISTS
├── IMPLEMENTATION_PLAN.md ✅ EXISTS (This plan)
└── EXISTING_FILES_INVENTORY.md ✅ EXISTS (This file)
```

---

## ✅ EXISTING REPOSITORIES

### ClinicaRepository
**Location:** `lib/db/repositories/ClinicaRepository.ts`
**Methods:**
- `findAll(params): Promise<Result<{ data: Clinica[], meta: Meta }, string>>`
- `findById(id): Promise<Result<Clinica, string>>`
- `create(data): Promise<Result<Clinica, string>>`
- `update(id, data): Promise<Result<Clinica, string>>`
- `delete(id): Promise<Result<void, string>>`

### TesteTemplateRepository
**Location:** `lib/db/repositories/TesteTemplateRepository.ts`
**Methods:**
- `findAll(params): Promise<Result<{ data: TesteTemplate[], meta: Meta }, string>>`
- `findById(id): Promise<Result<TesteTemplate, string>>`
- `create(data): Promise<Result<TesteTemplate, string>>`
- `update(id, data): Promise<Result<TesteTemplate, string>>`
- `delete(id): Promise<Result<void, string>>`
- `duplicate(id, newName): Promise<Result<TesteTemplate, string>>`

### TabelaNormativaRepository
**Location:** `lib/db/repositories/TabelaNormativaRepository.ts`
**Methods:**
- `findAll(params): Promise<Result<{ data: TabelaNormativa[], meta: Meta }, string>>`
- `findById(id): Promise<Result<TabelaNormativa, string>>`
- `findByTesteId(testeId): Promise<Result<TabelaNormativa[], string>>`
- `create(data): Promise<Result<TabelaNormativa, string>>`
- `update(id, data): Promise<Result<TabelaNormativa, string>>`
- `delete(id): Promise<Result<void, string>>`

### LinkRepository
**Location:** `lib/db/repositories/LinkRepository.ts`
**Methods:**
- `findByToken(token): Promise<Result<Link, string>>`
- `create(data): Promise<Result<Link, string>>`
- `updateStatus(id, status): Promise<Result<void, string>>`
- `authenticate(token, codigo): Promise<Result<boolean, string>>`

### RegistroManualRepository
**Location:** `lib/db/repositories/RegistroManualRepository.ts`
**Methods:**
- `findAll(params): Promise<Result<{ data: RegistroManual[], meta: Meta }, string>>`
- `findById(id): Promise<Result<RegistroManual, string>>`
- `create(data): Promise<Result<RegistroManual, string>>`
- `update(id, data): Promise<Result<RegistroManual, string>>`
- `delete(id): Promise<Result<void, string>>`

---

## ✅ EXISTING SERVICES

### ClinicaService
**Location:** `lib/services/ClinicaService.ts`
**Methods:**
- `list(params): Promise<Result<{ data: Clinica[], meta: Meta }, string>>`
- `get(id): Promise<Result<Clinica, string>>`
- `create(data): Promise<Result<Clinica, string>>`
- `update(id, data): Promise<Result<Clinica, string>>`
- `delete(id): Promise<Result<void, string>>`
**Features:** Validation, audit logging

### TesteTemplateService
**Location:** `lib/services/TesteTemplateService.ts`
**Methods:**
- `list(params): Promise<Result<{ data: TesteTemplate[], meta: Meta }, string>>`
- `get(id): Promise<Result<TesteTemplate, string>>`
- `create(data): Promise<Result<TesteTemplate, string>>`
- `update(id, data): Promise<Result<TesteTemplate, string>>`
- `delete(id): Promise<Result<void, string>>`
- `duplicate(id, newName): Promise<Result<TesteTemplate, string>>`
**Features:** Template validation, audit logging

### TabelaNormativaService
**Location:** `lib/services/TabelaNormativaService.ts`
**Methods:**
- `list(params): Promise<Result<{ data: TabelaNormativa[], meta: Meta }, string>>`
- `get(id): Promise<Result<TabelaNormativa, string>>`
- `create(data): Promise<Result<TabelaNormativa, string>>`
- `update(id, data): Promise<Result<TabelaNormativa, string>>`
- `delete(id): Promise<Result<void, string>>`
- `importCSV(file): Promise<Result<TabelaNormativa, string>>`
**Features:** Normative data validation, CSV parsing

### LinkService
**Location:** `lib/services/LinkService.ts`
**Methods:**
- `generate(data): Promise<Result<Link, string>>`
- `validate(token): Promise<Result<Link, string>>`
- `authenticate(token, codigo): Promise<Result<boolean, string>>`
**Features:** Token generation, rate limiting

### RegistroManualService
**Location:** `lib/services/RegistroManualService.ts`
**Methods:**
- `list(params): Promise<Result<{ data: RegistroManual[], meta: Meta }, string>>`
- `get(id): Promise<Result<RegistroManual, string>>`
- `create(data): Promise<Result<RegistroManual, string>>`
- `update(id, data): Promise<Result<RegistroManual, string>>`
- `delete(id): Promise<Result<void, string>>`
- `uploadAttachment(id, file): Promise<Result<string, string>>`
**Features:** File handling, Supabase Storage

### PDFGeneratorService
**Location:** `lib/services/PDFGeneratorService.ts`
**Methods:**
- `generateTestReport(testeAplicadoId): Promise<Result<Buffer, string>>`
- `generateProntuario(pacienteId): Promise<Result<Buffer, string>>`
**Library:** react-pdf
**Features:** Professional PDF generation

---

## ✅ EXISTING API ROUTES

### Authentication
- `/api/auth/login/route.ts` - POST (email/password login)
- `/api/auth/logout/route.ts` - POST (session termination)
- `/api/auth/session/route.ts` - GET (current session)
- `/api/auth/refresh/route.ts` - POST (token refresh)

### Clinicas
- `/api/clinicas/route.ts` - GET (list with pagination), POST (create)
- `/api/clinicas/[id]/route.ts` - GET (detail), PUT (update), DELETE (soft delete)

### Pacientes
- `/api/pacientes/route.ts` - GET (list with search), POST (create)
- `/api/pacientes/[id]/route.ts` - GET (detail), PUT (update), DELETE (soft delete)

### Testes Templates
- `/api/testes-templates/route.ts` - GET (list with filters), POST (create)
- `/api/testes-templates/[id]/route.ts` - GET (detail), PUT (update), DELETE (soft delete)
- `/api/testes-templates/[id]/duplicate/route.ts` - POST (duplicate template)

### Tabelas Normativas
- `/api/tabelas-normativas/route.ts` - GET (list), POST (create)
- `/api/tabelas-normativas/[id]/route.ts` - GET (detail), PUT (update), DELETE (soft delete)
- `/api/tabelas-normativas/import-csv/route.ts` - POST (CSV import)

### Testes Aplicados
- `/api/testes-aplicados/route.ts` - GET (list), POST (create application)
- `/api/testes-aplicados/[id]/route.ts` - GET (detail), PUT (update)
- `/api/testes-aplicados/[id]/finalizar/route.ts` - POST (finalize and calculate)

### Links
- `/api/links/route.ts` - POST (generate link)
- `/api/links/[token]/route.ts` - GET (validate), POST (authenticate)

### Registros Manuais
- `/api/registros-manuais/route.ts` - GET (list), POST (create)
- `/api/registros-manuais/[id]/route.ts` - GET (detail), PUT (update), DELETE (soft delete)
- `/api/registros-manuais/[id]/upload/route.ts` - POST (upload attachment)

### PDF Export
- `/api/export-pdf/[id]/route.ts` - GET (export test result as PDF)

---

## ✅ EXISTING HOOKS

### useApi (Generic API Client)
**Location:** `lib/hooks/useApi.ts`
**Exports:**
- `useApi<T>()` - Generic API hook
- `usePacientes()` - Patient operations
- `useTestesTemplates()` - Template operations
- `useClinicas()` - Clinic operations
- `useLinks()` - Link generation

**usePacientes Methods:**
- `list(params)` - List patients with search/pagination
- `getById(id)` - Get patient detail
- `create(data)` - Create patient
- `update(id, data)` - Update patient
- `remove(id)` - Delete patient

**useTestesTemplates Methods:**
- `list(params)` - List templates with filters (tipo, publico)
- `getById(id)` - Get template detail
- `duplicate(id, newName)` - Duplicate template

**useClinicas Methods:**
- `list(params)` - List clinics with filters (ativo)
- `getById(id)` - Get clinic detail
- `create(data)` - Create clinic
- `update(id, data)` - Update clinic
- `remove(id)` - Delete clinic

**useLinks Methods:**
- `generate(data)` - Generate remote link
- `validate(token)` - Validate link token
- `authenticate(token, codigo)` - Authenticate with access code

### useTouchGestures
**Location:** `lib/hooks/useTouchGestures.ts`
**Exports:**
- `useTouchGestures(options)` - Swipe detection (left, right, up, down)
- `useLongPress(callback, duration)` - Long press detection

### useMediaQuery
**Location:** `lib/hooks/useMediaQuery.ts`
**Exports:**
- `useMediaQuery(query)` - Generic media query hook
- `useBreakpoint(breakpoint)` - Tailwind breakpoint detection
- `useIsMobile()` - Mobile detection (<768px)
- `useIsTablet()` - Tablet detection (768px-1024px)
- `useIsDesktop()` - Desktop detection (>1024px)

---

## ✅ EXISTING PAGES

### Authentication
- `app/login/page.tsx` - Login form
- `app/cadastro/page.tsx` - Registration form

### Dashboard
- `app/(dashboard)/layout.tsx` - Sidebar, header, protected route
- `app/(dashboard)/dashboard/page.tsx` - Stats, quick actions, real API integration
- `app/(dashboard)/pacientes/page.tsx` - Patient list with search, pagination, real API
- `app/(dashboard)/biblioteca/page.tsx` - Test library with filters, duplicate, real API
- `app/(dashboard)/admin/page.tsx` - Super admin clinic management, real API

### Public
- `app/responder/[token]/page.tsx` - Public test response (basic structure, needs completion)

---

## ✅ EXISTING UI COMPONENTS

### Radix UI Components
- `components/ui/card.tsx` - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

---

## ✅ EXISTING STATE MANAGEMENT

### Zustand Stores
- `lib/stores/useAuthStore.ts` - Authentication state
  - State: `user`, `isAuthenticated`, `isLoading`
  - Actions: `login(user)`, `logout()`, `checkSession()`
  - Selectors: `selectIsSuperAdmin`, `selectUser`

---

## ✅ EXISTING TYPES

### Database Types
**Location:** `types/database.ts` (Supabase generated)
- `Clinica` - Clinic entity
- `Psicologo` - Psychologist entity
- `Paciente` - Patient entity
- `TesteTemplate` - Test template entity
- `TabelaNormativa` - Normative table entity
- `TesteAplicado` - Applied test entity
- `RegistroManual` - Manual record entity
- `LogAuditoria` - Audit log entity

### Result Type
**Location:** `lib/types/result.ts`
```typescript
export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E }
```

---

## ✅ EXISTING DATABASE SCHEMA

### Migrations
1. `supabase/migrations/001_initial_schema.sql` - Core tables
2. `supabase/migrations/002_rls_policies.sql` - Row-level security
3. `supabase/migrations/003_add_super_admin.sql` - Super admin system

### Tables
- `clinicas` - Multi-tenant organizations
- `psicologos` - Psychologists (auth users)
- `pacientes` - Patients with demographics
- `testes_templates` - Test templates library
- `tabelas_normativas` - Normative scoring tables
- `testes_aplicados` - Applied tests with results
- `registros_manuais` - Manual test records
- `logs_auditoria` - Audit trail

---

## ❌ MISSING COMPONENTS TO CREATE

### Repositories (lib/db/repositories/)
- `PacienteRepository.ts` ⚠️ Check if exists, may need to create
- `TesteAplicadoRepository.ts` ⚠️ Check if exists, may need to create
- `PsicologoRepository.ts` ❌ Must create

### Services (lib/services/)
- `PacienteService.ts` ❌ Must create
- `TesteAplicadoService.ts` ❌ Must create
- `PsicologoService.ts` ❌ Must create
- `NormalizacaoService.ts` ❌ Must create (CRITICAL)

### API Routes (app/api/)
- `psicologos/route.ts` ❌ Must create (GET, POST)
- `psicologos/[id]/route.ts` ❌ Must create (GET, PUT, DELETE)
- `testes-aplicados/[id]/reabrir/route.ts` ❌ Must create (POST)
- `links/[token]/questoes/route.ts` ❌ Must create (GET)
- `links/[token]/responder/route.ts` ❌ Must create (PUT)
- `links/[token]/finalizar/route.ts` ❌ Must create (POST)

### Hooks (lib/hooks/useApi.ts)
- `usePsicologos()` ❌ Must add
- `useTestesAplicados()` ❌ Must add
- `useTabelas()` ❌ Must add
- `useRegistros()` ❌ Must add

### Form Components (components/forms/)
- `PatientForm.tsx` ❌ Must create
- `ClinicForm.tsx` ❌ Must create
- `TestQuestionRenderer.tsx` ❌ Must create
- `ManualRecordForm.tsx` ❌ Must create

### Other Components
- `components/test/LinkGeneratorModal.tsx` ❌ Must create
- `components/results/PercentileChart.tsx` ❌ Must create

### Pages (app/(dashboard)/)
- `pacientes/novo/page.tsx` ❌ Must create
- `pacientes/[id]/editar/page.tsx` ❌ Must create
- `pacientes/[id]/prontuario/page.tsx` ❌ Must create
- `admin/clinicas/nova/page.tsx` ❌ Must create
- `admin/clinicas/[id]/editar/page.tsx` ❌ Must create
- `aplicar/presencial/[teste_aplicado_id]/page.tsx` ❌ Must create
- `resultados/[id]/page.tsx` ❌ Must create
- `registros-manuais/novo/page.tsx` ❌ Must create
- `registros-manuais/[id]/page.tsx` ❌ Must create
- `normas/page.tsx` ❌ Must create (LOW PRIORITY)
- `normas/nova/page.tsx` ❌ Must create (LOW PRIORITY)
- `normas/import/page.tsx` ❌ Must create (LOW PRIORITY)

### Assets
- `public/icon-192x192.png` ❌ Must generate
- `public/icon-512x512.png` ❌ Must generate

---

## 🔍 BEFORE CREATING ANY FILE

**Always check:**
1. Does this file already exist in this inventory?
2. Does a similar component/service already exist that I can extend?
3. Can I reuse existing patterns from similar files?

**If YES to any, DO NOT create a new file - use/extend existing one.**

---

**END OF INVENTORY**
