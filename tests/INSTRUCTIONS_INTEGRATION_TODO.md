# INSTRUCTIONS INTEGRATION - Detailed TODO

## Context
The TestInstructions component has been created at `/components/test/TestInstructions.tsx` but needs to be integrated into the test application flow. This will display instructions BEFORE the test starts.

## Reference Documents
- **Implementation Guide**: `/tests/EBADEP_A_IMPLEMENTATION_COMPLETE.md` (section "Integration Required")
- **Test Insertion Guide**: `/docs/TEST_INSERTION_GUIDE.md` (section 6c and new section 9)
- **Component Location**: `/components/test/TestInstructions.tsx`
- **Target File**: `/app/aplicar/[testeId]/handoff/page.tsx`

---

## STEP 1: Import TestInstructions Component

**File**: `/app/aplicar/[testeId]/handoff/page.tsx`

**Location**: Top of file (around line 6-10, with other imports)

**Add this import:**
```typescript
import TestInstructions from '@/components/test/TestInstructions'
```

**After line 8 which has:**
```typescript
import { useHandoffMode } from '@/lib/hooks/useHandoffMode'
```

---

## STEP 2: Add State for Instructions Display

**File**: `/app/aplicar/[testeId]/handoff/page.tsx`

**Location**: After line 40, with other useState declarations

**Add this state:**
```typescript
const [showInstructions, setShowInstructions] = useState(true)
```

**Context**: This controls whether to show instructions screen or test questions. Initially true (show instructions first).

---

## STEP 3: Add Instructions Rendering Block

**File**: `/app/aplicar/[testeId]/handoff/page.tsx`

**Location**: After line 222 (after error handling) and BEFORE line 224 (the `if (isCompleted)` check)

**Add this complete block:**
```typescript
  // Show instructions if available and not yet dismissed
  if (showInstructions && teste?.teste_template?.interpretacao?.instrucoes_aplicacao) {
    return (
      <HandoffContainer onExitSuccess={handleHandoffExit}>
        <TestInstructions
          titulo={teste.teste_template.nome}
          instrucoes={teste.teste_template.interpretacao.instrucoes_aplicacao}
          exemplos={teste.teste_template.interpretacao.exemplos_resposta || [
            {
              texto_esquerda: "Estou me sentindo alegre",
              texto_direita: "Estou me sentindo triste",
              marcacao: 0,
              descricao: "Se você tem se sentido muito alegre, marque a primeira opção"
            },
            {
              texto_esquerda: "Estou me sentindo alegre",
              texto_direita: "Estou me sentindo triste",
              marcacao: 1,
              descricao: "Se você tem se sentido alegre, marque a segunda opção"
            },
            {
              texto_esquerda: "Estou me sentindo alegre",
              texto_direita: "Estou me sentindo triste",
              marcacao: 2,
              descricao: "Se você tem se sentido triste, marque a terceira opção"
            },
            {
              texto_esquerda: "Estou me sentindo alegre",
              texto_direita: "Estou me sentindo triste",
              marcacao: 3,
              descricao: "Se você tem se sentido muito triste, marque a quarta opção"
            }
          ]}
          onStart={() => setShowInstructions(false)}
        />
      </HandoffContainer>
    )
  }
```

**Important Notes:**
- This checks if instructions exist in `interpretacao.instrucoes_aplicacao`
- Falls back to default EBADEP-A examples if `exemplos_resposta` not in database
- `onStart` callback hides instructions and shows first question
- Wrapped in HandoffContainer for PIN protection

---

## STEP 4: Update EBADEP-A SQL to Include Examples (OPTIONAL)

**File**: `/tests/ebadep_a_insert.sql`

**Location**: In the `interpretacao` JSONB object (around line 430)

**Add after `instrucoes_aplicacao` field:**
```json
"exemplos_resposta": [
  {
    "texto_esquerda": "Estou me sentindo alegre",
    "texto_direita": "Estou me sentindo triste",
    "marcacao": 0,
    "descricao": "Se você tem se sentido muito alegre, marque a primeira opção"
  },
  {
    "texto_esquerda": "Estou me sentindo alegre",
    "texto_direita": "Estou me sentindo triste",
    "marcacao": 1,
    "descricao": "Se você tem se sentido alegre, marque a segunda opção"
  },
  {
    "texto_esquerda": "Estou me sentindo alegre",
    "texto_direita": "Estou me sentindo triste",
    "marcacao": 2,
    "descricao": "Se você tem se sentido triste, marque a terceira opção"
  },
  {
    "texto_esquerda": "Estou me sentindo alegre",
    "texto_direita": "Estou me sentindo triste",
    "marcacao": 3,
    "descricao": "Se você tem se sentido muito triste, marque a quarta opção"
  }
],
```

**Note**: This is optional because fallback examples are in the code. But storing in database allows customization per test.

---

## STEP 5: Test the Integration

### 5.1 Insert Test into Database
```bash
psql -U your_user -d your_database -f /Users/pedrohenriqueoliveira/Downloads/sistema_testes/tests/ebadep_a_insert.sql
```

### 5.2 Create Test Application
1. Go to system and create new test application for EBADEP-A
2. Open in handoff mode

### 5.3 Verify Instructions Display
- ✅ Instructions page shows first
- ✅ Blue-bordered panel with instructions text
- ✅ 4 visual examples showing bipolar format
- ✅ "Iniciar Teste" button visible

### 5.4 Verify Transition to Test
- Click "Iniciar Teste"
- ✅ Instructions disappear
- ✅ First question (question 1) displays
- ✅ Bipolar format: [left text] ( ) ( ) ( ) ( ) [right text]
- ✅ Can select options and navigate

---

## Expected Flow

```
User opens test link
    ↓
Handoff mode activated (PIN protected)
    ↓
Instructions screen displays
    ↓
User reads instructions and examples
    ↓
User clicks "Iniciar Teste"
    ↓
showInstructions = false
    ↓
Question 1 displays
    ↓
User answers all 45 questions
    ↓
Test completes
    ↓
PIN exit to view results
```

---

## Troubleshooting

### Instructions Don't Show
**Check:**
1. Is `interpretacao.instrucoes_aplicacao` populated in database?
2. Is import statement correct? `import TestInstructions from '@/components/test/TestInstructions'`
3. Is state initialized? `const [showInstructions, setShowInstructions] = useState(true)`
4. Is conditional placement correct? (before `if (isCompleted)` check)

### Instructions Show But Don't Dismiss
**Check:**
1. Is `onStart` callback correct? `onStart={() => setShowInstructions(false)}`
2. Check browser console for errors
3. Verify TestInstructions component button has `onClick={onStart}`

### Examples Don't Display Correctly
**Check:**
1. Verify `exemplos` prop structure matches interface:
   ```typescript
   Array<{
     texto_esquerda: string
     texto_direita: string
     marcacao: number  // 0-3
     descricao: string
   }>
   ```
2. Check browser console for prop validation errors

### Bipolar Questions Don't Render After Instructions
**Check:**
1. QuestionRenderer updated? Check `/components/test/QuestionRenderer.tsx` line 92-157
2. Questions have `tipo_resposta: "diferencial_0_3"`?
3. Questions have `texto_esquerda` and `texto_direita` fields?

---

## Files Modified Summary

| File | Change | Status |
|------|--------|--------|
| `/components/test/TestInstructions.tsx` | Created new component | ✅ Complete |
| `/components/test/QuestionRenderer.tsx` | Added bipolar rendering | ✅ Complete |
| `/types/database.ts` | Added diferencial_0_3 type + bipolar fields | ✅ Complete |
| `/tests/ebadep_a_insert.sql` | Restructured questions + added instructions | ✅ Complete |
| `/app/aplicar/[testeId]/handoff/page.tsx` | **NEEDS INTEGRATION** | ⏳ Pending |

---

## Success Criteria

- [ ] Import added to handoff page
- [ ] State variable added
- [ ] Instructions rendering block added before completion check
- [ ] No TypeScript errors
- [ ] Instructions display on test start
- [ ] "Iniciar Teste" hides instructions and shows first question
- [ ] Bipolar questions render correctly
- [ ] Complete test flow works end-to-end

---

**Created**: 2024-12-19
**Status**: READY FOR IMPLEMENTATION
**Estimated Time**: 10-15 minutes
