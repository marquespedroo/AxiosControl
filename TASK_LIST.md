# NeuroTest Platform - MVP Task List (Agile Strategy)

**Strategy:** Agile MVP - Build core features first, iterate based on testing
**Priority:** Authentication → Patients → Tests → Reports

---

## 🎯 Phase 1: Authentication (Week 1) - NEXT

### Task 1.1: Authentication API
- [ ] Create `/app/api/auth/login/route.ts`
  - POST endpoint for email/password login
  - Verify credentials against `psicologos` table
  - Return JWT token + user session
- [ ] Create `/app/api/auth/logout/route.ts`
  - Clear session and invalidate token
- [ ] Create `/app/api/auth/session/route.ts`
  - GET current user session
  - Validate token and return user data

### Task 1.2: Login Page UI
- [ ] Create `/app/(auth)/login/page.tsx`
  - Email/password form with validation
  - Error handling and loading states
  - Redirect to dashboard on success
- [ ] Create `/components/auth/LoginForm.tsx`
  - React Hook Form + Zod validation
  - Mobile-first responsive design

### Task 1.3: Auth Middleware
- [ ] Update `/middleware.ts`
  - Check session on protected routes
  - Redirect to login if unauthenticated
  - Store redirect URL for post-login

### Task 1.4: Dashboard Shell
- [ ] Create `/app/(dashboard)/dashboard/page.tsx`
  - Basic layout with sidebar
  - Stats cards (patients, tests, pending)
  - Recent activity list

---

## 🎯 Phase 2: Patient Management (Week 1-2)

### Task 2.1: Patient API Endpoints
- [ ] Create `/app/api/pacientes/route.ts`
  - GET: List patients (paginated, searchable)
  - POST: Create new patient
- [ ] Create `/app/api/pacientes/[id]/route.ts`
  - GET: Get patient details
  - PUT: Update patient
  - DELETE: Soft delete patient

### Task 2.2: Patient List Page
- [ ] Create `/app/(dashboard)/pacientes/page.tsx`
  - Table view with search
  - Pagination controls
  - "Add Patient" button
- [ ] Create `/components/patient/PatientTable.tsx`
  - Sortable columns
  - Mobile-responsive cards view

### Task 2.3: Patient Form
- [ ] Create `/app/(dashboard)/pacientes/novo/page.tsx`
  - New patient form
- [ ] Create `/app/(dashboard)/pacientes/[id]/editar/page.tsx`
  - Edit patient form
- [ ] Create `/components/forms/PatientForm.tsx`
  - All required fields (nome, data_nascimento, escolaridade_anos, sexo)
  - Optional fields (CPF, telefone, endereço)
  - Validation with Zod
  - Auto-calculate age

---

## 🎯 Phase 3: Test Application (Week 2-3)

### Task 3.1: Test Application Flow (Presencial)
- [ ] Create `/app/api/testes-aplicados/route.ts`
  - POST: Create new test application
- [ ] Create `/app/api/testes-aplicados/[id]/route.ts`
  - GET: Get test with questions
  - PUT: Save responses (progressive)
- [ ] Create `/app/api/testes-aplicados/[id]/finalizar/route.ts`
  - POST: Finalize test and calculate results

### Task 3.2: Test Selection & Start
- [ ] Create `/app/(dashboard)/pacientes/[id]/nova-avaliacao/page.tsx`
  - Select test from library
  - Choose presencial/remota
  - Start test application
- [ ] Create `/components/test/TestSelector.tsx`
  - List available tests
  - Show test metadata (time, age range)

### Task 3.3: Question Renderer
- [ ] Create `/app/(dashboard)/aplicar/[testeId]/page.tsx`
  - Question-by-question display
  - Progress bar
  - Navigation (previous/next)
  - Save draft functionality
- [ ] Create `/components/test/QuestionRenderer.tsx`
  - Render different question types (likert, multiple choice)
  - Mobile-optimized touch targets
  - Response validation

### Task 3.4: Results & Calculation
- [ ] Integrate calculation engine
  - Call `calculateRawScore()` on finalize
  - Call `normalizeScore()` with patient demographics
  - Store results in database
- [ ] Create `/app/(dashboard)/resultados/[id]/page.tsx`
  - Display raw score
  - Display normalized results (percentile, Z-score)
  - Show classification
  - Interpretation text

---

## 🎯 Phase 4: PDF Reports (Week 3)

### Task 4.1: PDF Generation
- [ ] Create `/lib/pdf/templates/ResultTemplate.tsx`
  - Header with patient info
  - Results table
  - Graphs (percentile curve)
  - Footer with psychologist signature
- [ ] Create `/app/api/export-pdf/[id]/route.ts`
  - Generate PDF from test results
  - Return as downloadable file

### Task 4.2: Export UI
- [ ] Add "Export PDF" button to results page
- [ ] Download/preview functionality

---

## 🎯 Phase 5: Testing & Validation (Ongoing)

### Task 5.1: Manual Testing
- [ ] Test complete flow: login → create patient → apply test → view results → export PDF
- [ ] Test on mobile devices
- [ ] Test edge cases (invalid data, missing responses)

### Task 5.2: Bug Fixes
- [ ] Fix any issues found during testing
- [ ] Improve error messages
- [ ] Add loading states

---

## 📦 Completed Foundation (Reference)

✅ Database schema (8 tables)
✅ Row-level security policies
✅ TypeScript types (complete)
✅ Supabase client utilities
✅ Calculation engine (calculator.ts, normalization.ts)
✅ Project configuration (Next.js, Tailwind, Vitest)
✅ Environment setup (.env.local configured)
✅ Migrations applied to remote Supabase

---

## 🔑 Key Files Reference

**Calculation Engine:**
- `lib/calculation/calculator.ts` - Raw score calculations
- `lib/calculation/normalization.ts` - Percentile, Z-score, classification

**Database:**
- `database/migrations/001_initial_schema.sql`
- `database/migrations/002_row_level_security.sql`

**Types:**
- `types/database.ts` - All database and API types

**Supabase:**
- `lib/supabase/client.ts` - Supabase clients
- `lib/supabase/helpers.ts` - Helper functions

**Config:**
- `.env.local` - Environment variables (Supabase credentials)
- `package.json` - Dependencies

---

## 📊 MVP Success Criteria

**Phase 1-2 (Week 1-2):**
- [ ] Psychologist can login
- [ ] Psychologist can create/edit patients
- [ ] Patient list shows all patients for clinic

**Phase 3 (Week 2-3):**
- [ ] Psychologist can apply test presencially
- [ ] System calculates results automatically
- [ ] Results show percentile and classification

**Phase 4 (Week 3):**
- [ ] PDF export works
- [ ] PDF looks professional

**Overall MVP:**
- [ ] Complete flow works end-to-end
- [ ] Works on mobile (320px+)
- [ ] No critical bugs
- [ ] Calculations are accurate

---

## 🚀 Next Immediate Action

**START HERE:** Task 1.1 - Create Authentication API endpoints

File to create: `/app/api/auth/login/route.ts`
