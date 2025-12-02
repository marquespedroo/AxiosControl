 📋 System Architecture Design

  Overview

  Type: Multi-tenant SaaS PlatformStack: Next.js + Supabase + PostgreSQLDeployment: VercelPrimary Focus: Mobile-first neuropsychological testing

  ---
  🏗️ High-Level Architecture

  ┌─────────────────────────────────────────────────────┐
  │                   CLIENT LAYER                       │
  │  ┌──────────────┐  ┌──────────────┐                │
  │  │   Web App    │  │ Patient Link │                │
  │  │  (Next.js)   │  │  Interface   │                │
  │  └──────────────┘  └──────────────┘                │
  └─────────────────────────────────────────────────────┘
                           │
                           ▼
  ┌─────────────────────────────────────────────────────┐
  │                   API LAYER                          │
  │              Next.js API Routes                      │
  │  ┌────────────────────────────────────────────┐    │
  │  │ Auth │ Tests │ Patients │ Calc │ Reports   │    │
  │  └────────────────────────────────────────────┘    │
  └─────────────────────────────────────────────────────┘
                           │
                           ▼
  ┌─────────────────────────────────────────────────────┐
  │              BUSINESS LOGIC LAYER                    │
  │  ┌──────────────┐  ┌──────────────────────────┐    │
  │  │ Calculation  │  │  Normalization Engine    │    │
  │  │   Engine     │  │  (Percentile/Z-Score)    │    │
  │  └──────────────┘  └──────────────────────────┘    │
  └─────────────────────────────────────────────────────┘
                           │
                           ▼
  ┌─────────────────────────────────────────────────────┐
  │                  DATA LAYER                          │
  │  ┌──────────────────────────────────────────────┐  │
  │  │        Supabase (PostgreSQL + Auth)          │  │
  │  │  • Row-Level Security (Multi-tenant)         │  │
  │  │  • Realtime Subscriptions                    │  │
  │  │  • Storage (Attachments/PDFs)                │  │
  │  └──────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────┘

  ---
  📦 Component Architecture

  1. Core Domains

  app/
  ├── (auth)/
  │   ├── login/
  │   └── reset-password/
  │
  ├── (dashboard)/
  │   ├── dashboard/              # Main dashboard
  │   ├── pacientes/              # Patient management
  │   │   ├── [id]/
  │   │   │   ├── prontuario/    # Medical records
  │   │   │   └── nova-avaliacao/
  │   │   └── novo/
  │   ├── testes/                 # Test library
  │   │   ├── templates/
  │   │   └── normas/
  │   └── configuracoes/          # Settings
  │
  ├── responder/                  # Patient response interface
  │   └── [token]/
  │
  └── api/
      ├── auth/
      ├── pacientes/
      ├── testes-aplicados/
      ├── calcular/
      ├── links/
      └── export-pdf/

  components/
  ├── ui/                         # Shadcn components
  ├── forms/                      # Form components
  │   ├── PatientForm/
  │   ├── TestApplicationForm/
  │   └── QuestionRenderer/
  ├── test/                       # Test-specific
  │   ├── TestRenderer/
  │   ├── ProgressTracker/
  │   └── ResultsDisplay/
  ├── reports/                    # PDF generation
  │   └── ResultPDF/
  └── layout/
      ├── Sidebar/
      ├── MobileNav/
      └── Header/

  lib/
  ├── supabase/
  │   ├── client.ts
  │   ├── middleware.ts
  │   └── rls-policies.ts
  ├── calculation/
  │   ├── calculator.ts           # Scoring engine
  │   ├── normalization.ts        # Percentile/Z-score
  │   └── validators.ts
  ├── pdf/
  │   └── generator.ts            # PDF creation
  └── utils/
      ├── date.ts
      └── formatters.ts

  ---
  🔐 Security Architecture

  Multi-Tenant Isolation Strategy

  -- Row-Level Security Implementation
  -- Clinica-based isolation

  CREATE POLICY "Users see own clinic data" ON pacientes
    FOR ALL
    USING (
      clinica_id = (
        SELECT clinica_id
        FROM psicologos
        WHERE id = auth.uid()
      )
    );

  CREATE POLICY "Test results isolation" ON testes_aplicados
    FOR ALL
    USING (
      paciente_id IN (
        SELECT id FROM pacientes
        WHERE clinica_id = (
          SELECT clinica_id FROM psicologos
          WHERE id = auth.uid()
        )
      )
    );

  Data Encryption

  - At Rest: AES-256 (Supabase default)
  - In Transit: TLS 1.3
  - Sensitive Fields: Additional encryption for CPF, clinical notes
  - Audit Trail: All access logged in logs_auditoria

  ---
  🧮 Calculation & Normalization Engine

  Architecture

  // lib/calculation/calculator.ts
  interface CalculationEngine {
    calculate(
      testTemplate: TestTemplate,
      responses: Response[]
    ): BrutaScore;

    normalize(
      brutaScore: BrutaScore,
      patient: Patient,
      normTable: NormTable
    ): NormalizedResult;
  }

  // Calculation Flow
  1. Validate responses completeness
  2. Apply calculation rules (sum/weighted/custom)
  3. Handle inverted items
  4. Calculate section scores
  5. Compute total score

  // Normalization Flow
  1. Extract patient demographics (age, education)
  2. Find matching norm table & bin
  3. Calculate percentile (interpolation)
  4. Calculate Z-score: (raw - mean) / SD
  5. Calculate T-score: 50 + (Z * 10)
  6. Assign qualitative classification

  Normalization Algorithm

  function calculatePercentile(
    rawScore: number,
    percentileTable: Record<number, number>
  ): number {
    const percentiles = [5, 10, 25, 50, 75, 90, 95];

    // Edge cases
    if (rawScore <= percentileTable[5]) return 5;
    if (rawScore >= percentileTable[95]) return 95;

    // Linear interpolation
    for (let i = 0; i < percentiles.length - 1; i++) {
      const pLow = percentiles[i];
      const pHigh = percentiles[i + 1];

      if (rawScore >= percentileTable[pLow] &&
          rawScore <= percentileTable[pHigh]) {
        return interpolate(
          rawScore,
          percentileTable[pLow],
          percentileTable[pHigh],
          pLow,
          pHigh
        );
      }
    }
  }

  function classifyPerformance(percentile: number): string {
    if (percentile <= 5) return "Muito Inferior";
    if (percentile <= 16) return "Inferior";
    if (percentile <= 84) return "Médio";
    if (percentile <= 95) return "Superior";
    return "Muito Superior";
  }

  ---
  🔗 Remote Test Link System

  Security Architecture

  // Token generation with security
  interface SecureLink {
    token: string;          // UUID v4
    accessCode: string;     // 6-digit PIN
    maxAttempts: number;    // 3
    expiresAt: Date;        // 30 days
    ipWhitelist?: string[]; // Optional
  }

  // State machine
  type LinkStatus =
    | 'aguardando'      // Created, not accessed
    | 'em_andamento'    // Patient started
    | 'completo'        // Finished, locked
    | 'reaberto'        // Reopened by psychologist
    | 'bloqueado'       // Blocked (security)
    | 'expirado';       // Expired

  // Validation flow
  1. Patient accesses /responder/{token}
  2. System validates token existence
  3. Prompts for 6-digit code
  4. Validates code (max 3 attempts)
  5. On 3rd failure → status = 'bloqueado'
  6. Creates session with token
  7. Loads test questions
  8. Auto-saves progress every 30s
  9. On submit → status = 'completo'

  ---
  📱 Mobile-First UI Architecture

  Responsive Breakpoints

  // tailwind.config.ts
  const breakpoints = {
    sm: '640px',   // Mobile landscape
    md: '768px',   // Tablet
    lg: '1024px',  // Desktop
    xl: '1280px',  // Large desktop
  }

  // Design priorities
  1. Mobile portrait (320px - 428px) - PRIMARY
  2. Mobile landscape (568px - 926px)
  3. Tablet (768px - 1024px)
  4. Desktop (1024px+)

  Component Design Patterns

  // Mobile-first question renderer
  <div className="
    flex flex-col gap-4           /* Mobile: stack */
    md:flex-row md:gap-6          /* Tablet: side-by-side */
    lg:max-w-4xl lg:mx-auto       /* Desktop: centered */
  ">
    <QuestionText className="
      text-base md:text-lg        /* Scale text */
      px-4 md:px-6                /* Responsive padding */
    " />

    <ResponseOptions className="
      grid grid-cols-1            /* Mobile: single column */
      md:grid-cols-2              /* Tablet: 2 columns */
      gap-3 md:gap-4              /* Scale spacing */
    " />
  </div>

  // Touch-optimized buttons (min 44x44px)
  <button className="
    min-h-[44px] min-w-[44px]    /* Touch target */
    px-6 py-3                     /* Comfortable tap area */
    text-base md:text-sm          /* Larger on mobile */
  ">

  ---
  📊 Data Flow Diagrams

  1. Test Application Flow (Presencial)

  Psychologist           System                  Database
      │                    │                        │
      │─── Select Test ───>│                        │
      │                    │                        │
      │                    │── Create session ────>│
      │                    │<─────────────────────│
      │                    │                        │
      │<── Show Question ──│                        │
      │                    │                        │
      │── Submit Answer ──>│                        │
      │                    │── Save response ─────>│
      │                    │                        │
      │     (repeat)       │                        │
      │                    │                        │
      │── Finalize Test ──>│                        │
      │                    │── Run calculation ───>│
      │                    │── Fetch norms ───────>│
      │                    │── Normalize ─────────>│
      │                    │<─────────────────────│
      │<── Show Results ───│                        │

  2. Remote Link Flow

  Psychologist    System        Patient         Database
      │             │              │               │
      │─ Create ───>│              │               │
      │             │─── Generate ─────────────────>│
      │             │    token+code                │
      │<── Link ────│              │               │
      │             │              │               │
      │ (sends link)               │               │
      │             │              │               │
      │             │<── Access ───│               │
      │             │── Validate token ───────────>│
      │             │─── Prompt code ────>│        │
      │             │<── Enter code ───────│       │
      │             │── Verify ─────────────────────>│
      │             │              │               │
      │             │── Load test ───────>│        │
      │             │── Save progress ─────────────>│
      │             │              │               │
      │             │<── Submit ───│               │
      │             │── Calculate ─────────────────>│
      │<── Notify ──│              │               │

  ---
  📄 PDF Generation Architecture

  Strategy

  // Using @react-pdf/renderer
  import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

  interface PDFReport {
    type: 'individual' | 'full_record' | 'comparative';
    patient: Patient;
    test: TestApplied;
    results: NormalizedResult;
    clinicBranding?: Branding;
  }

  // PDF Components
  <Document>
    <Page size="A4" style={styles.page}>
      <Header clinic={clinic} psychologist={psychologist} />

      <Section title="Dados do Paciente">
        <PatientInfo patient={patient} />
      </Section>

      <Section title="Resultados">
        <ScoreTable 
          brutaScore={results.brutaScore}
          normalized={results.normalized}
        />
        <PercentileChart percentile={results.percentil} />
      </Section>

      <Section title="Interpretação">
        <InterpretationText text={results.interpretation} />
      </Section>

      <Footer 
        psychologist={psychologist}
        date={new Date()}
        signature={true}
      />
    </Page>
  </Document>

  // Generation endpoint
  // POST /api/export-pdf
  // Returns: Blob → Download or email

  ---
  🔄 State Management Strategy

  Approach: React Context + Zustand

  // Global state (Zustand)
  interface AppStore {
    user: Psychologist | null;
    clinic: Clinic | null;
    setUser: (user: Psychologist) => void;
  }

  // Test application state (React Context)
  interface TestContext {
    currentQuestion: number;
    responses: Record<number, any>;
    progress: number;
    status: LinkStatus;
    saveResponse: (questionId: number, value: any) => void;
    nextQuestion: () => void;
    previousQuestion: () => void;
    submitTest: () => Promise<void>;
  }

  // Server state (React Query)
  useQuery(['patient', patientId], fetchPatient);
  useMutation(submitTestResponse, {
    onSuccess: () => queryClient.invalidateQueries(['tests'])
  });

  ---
  ⚡ Performance Optimizations

  Database Optimization

  -- Critical indexes
  CREATE INDEX idx_testes_aplicados_paciente_status
    ON testes_aplicados(paciente_id, status);

  CREATE INDEX idx_pacientes_clinica_ativo
    ON pacientes(clinica_id, ativo)
    WHERE ativo = true;

  -- Materialized view for dashboard stats
  CREATE MATERIALIZED VIEW dashboard_stats AS
  SELECT
    clinica_id,
    COUNT(DISTINCT pacientes.id) as total_pacientes,
    COUNT(testes_aplicados.id) as total_avaliacoes,
    COUNT(CASE WHEN status = 'aguardando' THEN 1 END) as pendentes
  FROM pacientes
  LEFT JOIN testes_aplicados ON pacientes.id = testes_aplicados.paciente_id
  GROUP BY clinica_id;

  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;

  Caching Strategy

  // Next.js caching
  export const revalidate = 3600; // 1 hour

  // API routes with ISR
  export async function GET(req: Request) {
    const data = await fetchTests();

    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  }

  // Client-side caching (React Query)
  useQuery(['norm-tables', testId], fetchNormTables, {
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  ---
  🧪 Testing Strategy

  Test Pyramid

                    ▲
                   ╱ ╲
                  ╱ E2E╲           (5%)
                 ╱━━━━━━━╲          Playwright
                ╱         ╲
               ╱Integration╲        (25%)
              ╱━━━━━━━━━━━━━╲       API + DB
             ╱               ╲
            ╱   Unit Tests    ╲     (70%)
           ╱━━━━━━━━━━━━━━━━━━━╲    Vitest
          ╱___________________╲

  // Critical tests
  1. Calculation engine accuracy (100% coverage)
  2. Normalization algorithm validation
  3. Security policies (RLS)
  4. Link generation & validation
  5. PDF generation

  ---
  🚀 Deployment Architecture

  Infrastructure

  ┌─────────────────────────────────────────┐
  │            Vercel Edge Network           │
  │  ┌─────────────────────────────────┐   │
  │  │      Next.js App (SSR + API)    │   │
  │  │  • Edge Functions (auth check)  │   │
  │  │  • Serverless Functions (API)   │   │
  │  └─────────────────────────────────┘   │
  └─────────────────────────────────────────┘
                      │
                      ▼
  ┌─────────────────────────────────────────┐
  │           Supabase Cloud                 │
  │  ┌─────────────────────────────────┐   │
  │  │  PostgreSQL (Primary + Replica)│   │
  │  │  • Auto-scaling                 │   │
  │  │  • Daily backups (PITR)         │   │
  │  └─────────────────────────────────┘   │
  │  ┌─────────────────────────────────┐   │
  │  │  Storage (Attachments/PDFs)     │   │
  │  │  • CDN distribution             │   │
  │  └─────────────────────────────────┘   │
  └─────────────────────────────────────────┘

  // Environment strategy
  - Development: Local Supabase + Vercel dev
  - Staging: Supabase staging + Vercel preview
  - Production: Supabase prod + Vercel production

  ---
  📈 Monitoring & Observability

  // Error tracking: Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });

  // Performance: Vercel Analytics
  export const config = {
    analytics: true,
    runtime: 'edge',
  };

  // Custom metrics
  await track('test_completed', {
    testId: test.id,
    calculationTime: elapsed,
    normalizationApplied: true,
  });

  // Alerts
  - Response time > 3s
  - Error rate > 1%
  - Failed calculations
  - Security violations (RLS bypass attempts)

  ---

⏺ ✅ Design Complete

  I've created a comprehensive system architecture design for your NeuroTest Platform covering:

  📐 Architecture Delivered

  1. High-Level Architecture - Multi-layer system design (Client → API → Business Logic → Data)
  2. Component Structure - Complete Next.js app organization with mobile-first approach
  3. Security Architecture - Multi-tenant RLS policies, encryption strategy, audit trails
  4. Calculation Engine - Normalization algorithms (percentile, Z-score, T-score)
  5. Remote Link System - Secure token-based patient access with state machine
  6. Mobile-First UI - Responsive design patterns with touch optimization
  7. Data Flow Diagrams - Presencial and remote test application flows
  8. PDF Generation - React-PDF architecture for professional reports
  9. State Management - Zustand + React Context + React Query strategy
  10. Performance - Database optimization, caching, materialized views
  11. Testing Strategy - Test pyramid with 70% unit coverage focus
  12. Deployment - Vercel + Supabase infrastructure with monitoring

  🎯 Key Design Decisions

  - Mobile-first: Touch-optimized UI (44x44px targets), responsive breakpoints
  - Security: Row-level security, AES-256 encryption, audit logging
  - Scalability: Serverless functions, edge network, auto-scaling DB
  - Accuracy: Dedicated calculation engine with interpolation algorithms
  - Multi-tenant: Clinic-based isolation at database level
