# Biblioteca de Testes - Implementation Checklist

> **QUICK REFERENCE**: Use this after conversation compaction.
> Full details in: `BIBLIOTECA_DE_TESTES_IMPLEMENTATION_PLAN.md`

## DO NOT DUPLICATE - Existing Components

### UI Components (REUSE THESE)
- `/components/ui/atoms/Button.tsx`
- `/components/ui/atoms/Input.tsx`
- `/components/ui/atoms/Label.tsx`
- `/components/ui/atoms/Card.tsx`
- `/components/ui/molecules/FormField.tsx`
- `/components/ui/molecules/LoadingState.tsx`
- `/components/ui/molecules/EmptyState.tsx`

### Form Patterns (FOLLOW THESE)
- `/components/forms/PatientForm.tsx` - Reference for CRUD form
- `/components/forms/ClinicForm.tsx` - Reference for form structure

### Types (EXTEND THESE)
- `/types/database.ts` - Add `verdadeiro_falso` to TipoResposta
- `/types/biblioteca.ts` - NEW file for biblioteca-specific types

### Services (EXTEND THESE)
- `/lib/services/TesteTemplateService.ts`
- `/lib/repositories/TesteTemplateRepository.ts`

---

## Files to Create

### Phase 1: Database
- [ ] `/database/migrations/007_teste_template_versioning.sql`

### Phase 2: Types
- [ ] `/types/biblioteca.ts`

### Phase 3: Components (MAX 300 lines each)
- [ ] `/components/biblioteca/index.ts`
- [ ] `/components/biblioteca/TestBasicInfoForm.tsx` (~150 lines)
- [ ] `/components/biblioteca/QuestionItemEditor.tsx` (~150 lines)
- [ ] `/components/biblioteca/QuestionsEditor.tsx` (~180 lines)
- [ ] `/components/biblioteca/AnswerScalesEditor.tsx` (~150 lines)
- [ ] `/components/biblioteca/ScoringRulesEditor.tsx` (~180 lines)
- [ ] `/components/biblioteca/VersionHistory.tsx` (~120 lines)

### Phase 4: Pages
- [ ] `/app/(dashboard)/biblioteca/[id]/editar/page.tsx` (~250 lines)
- [ ] `/app/(dashboard)/biblioteca/[id]/editar/loading.tsx`

### Phase 5: Refactor
- [ ] Update `/app/(dashboard)/biblioteca/page.tsx` (title + edit button)
- [ ] Refactor `/app/(dashboard)/biblioteca/novo/page.tsx` (use new components)

### Phase 6-7: API & Services
- [ ] Extend `TesteTemplateService.ts` (createVersion, getVersions, restoreVersion)
- [ ] Extend `TesteTemplateRepository.ts` (findVersions, findActiveByOrigin)
- [ ] `/app/api/testes-templates/[id]/version/route.ts`
- [ ] `/app/api/testes-templates/[id]/versions/route.ts`
- [ ] `/app/api/testes-templates/[id]/restore/route.ts`

---

## Key Architecture Decisions

### Versioning Strategy
- NO separate versions table
- Same `testes_templates` table with:
  - `versao_origem_id` (FK to original test)
  - `versao_numero` (1, 2, 3...)
  - `motivo_alteracao` (reason for change)
  - `alterado_por` (who changed)
  - `alterado_em` (when changed)
- Old versions: `ativo = false`
- New version: `ativo = true`

### Edit Flow
1. User edits test
2. System creates NEW row (new version)
3. Old row deactivated
4. Audit logged automatically

### Question Type Addition
- Add `verdadeiro_falso` to `TipoResposta` in `/types/database.ts`

---

## Validation Commands

```bash
npm run type-check   # TypeScript validation
npm run lint         # ESLint
npm run build        # Production build
```

---

## Color Palette (USE THESE)
- Primary: `hsl(var(--primary))`
- Destructive: `hsl(var(--destructive))`
- Muted: `hsl(var(--muted))`
- Success: `text-green-600`, `bg-green-50`
- Warning: `text-yellow-600`, `bg-yellow-50`
- Info: `text-blue-600`, `bg-blue-50`

---

## API Patterns (FOLLOW THESE)

```typescript
// Response format
{ data: T } | { error: string }

// Auth header
Authorization: Bearer ${localStorage.getItem('auth_token')}

// Error handling
try {
  const result = await service.method()
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 })
  }
  return NextResponse.json(result.data)
} catch (error) {
  return NextResponse.json({ error: 'Internal error' }, { status: 500 })
}
```
