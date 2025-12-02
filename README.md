# AxiosControl Platform - MVP

Plataforma de avaliação neuropsicológica com normalização automática.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env.local` file is already configured with Supabase credentials.

### 3. Apply Database Migrations

Migrations have already been applied to the remote Supabase database.

### 4. Seed Test Data (Manual)

Go to Supabase SQL Editor (https://supabase.com/dashboard/project/vndbzqafzuqdyxbayrdd/sql) and run:

```sql
-- Copy and paste the contents of database/seed.sql
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Test Credentials

After seeding the database:

- **Email**: joao@exemplo.com
- **Password**: senha123

## 📱 Features Implemented

### Phase 1: Authentication ✅
- Login/Logout/Session APIs
- JWT token authentication
- Protected routes with middleware
- Dashboard with stats

### Phase 2: Patient Management ✅
- Patient CRUD APIs (list, create, update, delete)
- Patient list with search & pagination
- Patient form (create/edit)
- Mobile-responsive design

### Phase 3: Test Application ✅
- Test application APIs
- Question renderer (Likert scale)
- Progressive answer saving
- Automatic calculation & normalization

### Phase 4: Results & PDF Export ✅
- Results display with normalization
- Percentile, Z-score, T-score calculation
- Classification (Muito Inferior → Muito Superior)
- PDF export functionality

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS
- **State**: React Hooks + localStorage

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT + bcrypt
- **Security**: Row-Level Security (RLS)

### Key Components
- **Calculation Engine**: `/lib/calculation/`
  - Raw score calculation
  - Normalization (percentile, Z-score, T-score)
  - Classification
- **PDF Generation**: `@react-pdf/renderer`
- **Type Safety**: Complete TypeScript coverage

## 📂 Project Structure

```
/app
  /(auth)/login          # Login page
  /(dashboard)
    /dashboard           # Main dashboard
    /pacientes           # Patient management
    /aplicar             # Test application
    /resultados          # Results display
  /api
    /auth                # Authentication endpoints
    /pacientes           # Patient CRUD
    /testes-aplicados    # Test application
    /export-pdf          # PDF generation

/components
  /auth                  # Login form
  /forms                 # Patient form
  /test                  # Question renderer
  /layout                # Shared layouts

/lib
  /calculation           # Calculation engine
  /supabase             # Database helpers
  /pdf                  # PDF templates

/database
  /migrations           # SQL migrations
  seed.sql              # Test data

/types
  database.ts           # TypeScript types
```

## 🧪 Testing Flow

1. Login with test credentials
2. Dashboard → "Novo Paciente"
3. Fill patient form and save
4. Patients list → Select patient
5. (Note: Test application UI will be completed in next iteration)

## 🗄️ Database Schema

8 main tables:
- `clinicas` - Clinic information
- `psicologos` - Psychologists (users)
- `pacientes` - Patients
- `testes_templates` - Test templates
- `tabelas_normativas` - Normative tables
- `testes_aplicados` - Test applications
- `registros_manuais` - Manual records
- `logs_auditoria` - Audit logs

## 🔐 Security

- Row-Level Security (RLS) for multi-tenant isolation
- JWT authentication
- Password hashing with bcrypt
- Audit logging for all operations

## 📊 Normalization

The platform supports:
- **Percentile**: Linear interpolation between adjacent points
- **Z-score**: (raw - mean) / SD
- **T-score**: 50 + (Z × 10)
- **Classification**: 5-level system
- **Demographic matching**: Age, education, sex

## 📋 Stack Tecnológica

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT + bcrypt + RLS
- **Styling:** Tailwind CSS
- **PDF Generation:** @react-pdf/renderer
- **Testing:** Vitest

## 📝 License

Proprietary - AxiosControl Platform
   ```bash
   npm run db:migrate
   ```

6. **Popule o banco com dados de teste (opcional)**
   ```bash
   npm run db:seed
   ```

7. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
sistema_testes/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth routes (login, reset-password)
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── pacientes/
│   │   ├── testes/
│   │   └── configuracoes/
│   ├── responder/               # Patient response interface
│   │   └── [token]/
│   └── api/                     # API routes
│       ├── auth/
│       ├── pacientes/
│       ├── testes-aplicados/
│       ├── calcular/
│       ├── links/
│       └── export-pdf/
├── components/                  # React components
│   ├── ui/                     # Shadcn components
│   ├── forms/                  # Form components
│   ├── test/                   # Test-specific components
│   ├── reports/                # PDF generation
│   └── layout/                 # Layout components
├── lib/                        # Core libraries
│   ├── supabase/              # Supabase client & utils
│   ├── calculation/           # Calculation engine
│   ├── pdf/                   # PDF generation
│   └── utils/                 # Utility functions
├── database/                   # Database files
│   ├── migrations/            # SQL migrations
│   ├── seed.ts                # Seed script
│   └── types.ts               # Database types
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript types
├── docs/                       # Documentation
│   ├── api-specification.md
│   ├── calculation-engine-spec.md
│   └── architectural-design.md
└── tests/                      # Test files
    ├── unit/
    ├── integration/
    └── e2e/
```

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Testes com UI
npm run test:ui

# Testes com coverage
npm run test:coverage

# Type checking
npm run type-check
```

### Coverage Mínima

- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

## 📊 Database Migrations

```bash
# Aplicar migrações
npm run db:migrate

# Reset database (CUIDADO: apaga todos os dados)
npm run db:reset

# Ver status do Supabase
npm run supabase:status
```

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas críticas têm RLS habilitado:

- **Pacientes:** Isolamento por clínica
- **Testes Aplicados:** Acesso apenas para psicólogos da clínica
- **Logs de Auditoria:** Imutáveis, visíveis apenas para a clínica

### Criptografia

- **At Rest:** AES-256 (Supabase default)
- **In Transit:** TLS 1.3
- **Sensitive Fields:** CPF e observações clínicas têm criptografia adicional

### Compliance LGPD

- Audit logs completos
- Direito ao esquecimento implementado
- Consentimento explícito para coleta de dados

## 📈 Performance

### Targets

- Cálculo de resultados: < 2s
- Carregamento de página: < 1s
- Geração de PDF: < 5s
- Suporte para 100 usuários simultâneos

### Otimizações

- React Query para cache de dados
- Materialized views para dashboard stats
- Índices otimizados no PostgreSQL
- Image optimization com Next.js

## 🎨 Design System

### Mobile-First

Interface otimizada para celulares:

- Touch targets mínimos de 44x44px
- Breakpoints: mobile (320px) → tablet (768px) → desktop (1024px)
- Progressive enhancement

### Componentes Base (Shadcn/UI)

- Button, Input, Select, Checkbox
- Dialog, Alert, Toast
- Table, Tabs, Accordion
- Form components com React Hook Form

## 📱 Features Principais

### Para Psicólogos

- ✅ Gestão de pacientes com dados demográficos
- ✅ Biblioteca de testes neuropsicológicos
- ✅ Aplicação presencial (psicólogo insere respostas)
- ✅ Aplicação remota (link para paciente)
- ✅ Cálculo automático de pontuações
- ✅ Normatização por idade/escolaridade
- ✅ Prontuário digital unificado
- ✅ Exportação de resultados em PDF
- ✅ Registros manuais (desenhos, observações)

### Para Pacientes

- ✅ Acesso via link seguro (código de 6 dígitos)
- ✅ Interface mobile-first
- ✅ Progresso salvo automaticamente
- ✅ Instruções claras e intuitivas

## 🔄 Workflow de Desenvolvimento

1. **Branch:** Crie uma branch a partir de `main`
2. **Desenvolva:** Escreva código + testes
3. **Type Check:** `npm run type-check`
4. **Testes:** `npm test`
5. **Lint:** `npm run lint`
6. **Format:** `npm run format`
7. **Commit:** Mensagens claras e descritivas
8. **Push:** Para sua branch
9. **PR:** Crie Pull Request para `main`

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Inicia servidor dev
npm run build              # Build para produção
npm run start              # Inicia servidor produção
npm run lint               # Lint código
npm run format             # Formata código (Prettier)
npm run type-check         # Verifica tipos TypeScript

# Database
npm run db:migrate         # Aplica migrações
npm run db:seed            # Popula com dados de teste
npm run db:reset           # Reset completo (CUIDADO!)

# Supabase
npm run supabase:start     # Inicia Supabase local
npm run supabase:stop      # Para Supabase local
npm run supabase:status    # Status do Supabase

# Testes
npm test                   # Roda testes
npm run test:ui            # Testes com UI interativa
npm run test:coverage      # Testes com coverage
```

## 🐛 Troubleshooting

### Erro: "Failed to connect to Supabase"

1. Verifique se o Supabase está rodando: `npm run supabase:status`
2. Confirme as variáveis de ambiente em `.env.local`
3. Reinicie o Supabase: `npm run supabase:stop && npm run supabase:start`

### Erro: "Database migration failed"

1. Verifique se há migrações pendentes
2. Reset o banco (CUIDADO!): `npm run db:reset`
3. Reaplique as migrações: `npm run db:migrate`

### Erro: "Type errors" no build

1. Rode `npm run type-check` para ver erros detalhados
2. Certifique-se de que todos os tipos estão definidos
3. Verifique imports e exports

## 📚 Documentação Adicional

- [API Specification](./docs/api-specification.md)
- [Calculation Engine](./docs/calculation-engine-spec.md)
- [Architectural Design](./docs/architectural-design.md)
- [Product Requirements](./product_requirement.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário e confidencial.

## 👥 Time

- **Product Owner:** [Nome]
- **Tech Lead:** [Nome]
- **Developers:** [Nomes]
- **QA:** [Nome]

## 📞 Suporte

Para questões técnicas, abra uma issue no repositório ou contate: [email@suporte.com]

---

**Versão:** 1.0.0
**Última atualização:** 04/10/2025
