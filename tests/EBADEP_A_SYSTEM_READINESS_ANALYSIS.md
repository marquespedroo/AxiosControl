# EBADEP-A System Readiness Analysis

## Executive Summary

**Status: ❌ NOT READY** - The system requires significant modifications to support EBADEP-A's unique format.

### Critical Missing Features

1. **Semantic Differential Question Format** - Not supported
2. **Test Instructions Display** - Partially supported (needs enhancement)
3. **Bipolar Response Scale UI** - Does not exist

---

## Detailed Analysis

### 1. Question Display Format ❌

#### What EBADEP-A Requires

The EBADEP-A uses a **semantic differential (bipolar) format** where each question has:

```
[Positive Statement] ( ) ( ) ( ) ( ) [Negative Statement]
```

**Example:**
```
Não tenho vontade de chorar  ( ) ( ) ( ) ( )  Tenho sentido vontade de chorar
```

The user marks one of the 4 parentheses based on which statement they identify with more strongly.

#### What the System Currently Supports

The `QuestionRenderer.tsx` component currently supports:

1. **Likert Scale** (lines 93-189)
   - Vertical list of options
   - Single statement with 1-5 or 1-7 scale
   - Example: "I feel happy" → [1] [2] [3] [4] [5]

2. **Multiple Choice** (lines 192-242)
   - Vertical list of options
   - Single question with multiple answer choices

3. **BDI-II Format** (lines 36-90)
   - 4 severity levels (0-3)
   - Vertical grouped options

#### What's Missing

**Bipolar/Semantic Differential Format**:
- **Two opposing statements** on the same line
- **4 response options between them** displayed horizontally
- Visual layout that shows the continuum from positive to negative

**Visual Comparison:**

Current System (Likert):
```
╔════════════════════════════════════╗
║ Question: "I feel happy"           ║
║                                    ║
║ ○ Strongly Disagree                ║
║ ○ Disagree                         ║
║ ○ Neutral                          ║
║ ○ Agree                            ║
║ ○ Strongly Agree                   ║
╚════════════════════════════════════╝
```

Required for EBADEP-A (Semantic Differential):
```
╔═══════════════════════════════════════════════════════════════════╗
║ Não tenho vontade de chorar  ( ) ( ) ( ) ( )  Tenho vontade de chorar  ║
║                               ↑   ↑   ↑   ↑                            ║
║                               0   1   2   3                            ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

### 2. Test Instructions Display ⚠️ PARTIAL

#### What EBADEP-A Requires

EBADEP-A has specific instructions that must be displayed before the test starts:

**Instruções:**
> "Você acabou de receber uma escala com 45 itens, contendo duas frases na mesma linha de cada item. Entre as frases há quatro parênteses. Leia atentamente as duas frases opostas em cada linha e marque com um X como você vem se sentindo em um período de duas semanas, inclusive hoje. O parêntese que você escolher deve estar mais próximo do que a frase significar."

Plus visual examples showing how to mark the 4 options.

#### What the System Currently Has

**Database Structure:**
- The `interpretacao` field (JSONB) can store instructions
- In the SQL insert, we included: `interpretacao.instrucoes_aplicacao`

**Frontend Display:**
- ❌ **No dedicated instructions page/modal** before test start
- ❌ **No visual examples** showing how to respond
- ✅ Minor instruction text can be added per question (line 47 in QuestionRenderer)

**Current Display Locations:**
1. Test application page shows only:
   - Test name
   - Question number
   - Progress bar
   - Current question

2. No pre-test instructions screen

#### What's Missing

1. **Pre-test Instructions Screen**
   - Display before first question
   - Show complete instructions with examples
   - Visual demonstration of response format
   - "Start Test" button to proceed

2. **Instructions Modal/Page Component**
   - Not currently implemented
   - Would need to be added to handoff flow

---

### 3. Response Scale Structure ❌

#### What EBADEP-A Requires

Response scale structure for semantic differential:
- **Type**: `diferencial_0_3`
- **4 positions** representing a continuum
- **Values**: 0 (strong positive) → 1 (moderate positive) → 2 (moderate negative) → 3 (strong negative)

```json
{
  "diferencial_0_3": [
    {"valor": 0, "texto": "Primeira opção (forte)", "posicao": "esquerda_forte"},
    {"valor": 1, "texto": "Segunda opção (moderada)", "posicao": "esquerda_moderada"},
    {"valor": 2, "texto": "Terceira opção (moderada)", "posicao": "direita_moderada"},
    {"valor": 3, "texto": "Quarta opção (forte)", "posicao": "direita_forte"}
  ]
}
```

#### What the System Currently Supports

The `QuestionRenderer` checks for scale types (lines 101-109):
```typescript
const possibleScaleNames = [
  'binario',
  'likert',
  'likert_0_4',
  'likert_0_5',
  'likert_1_4',
  'likert_1_5',
  'multipla_escolha'
]
```

**Missing**: `diferencial_0_3` or any bipolar scale type

---

## Required Modifications

### Priority 1: CRITICAL - Question Renderer

**File**: `/components/test/QuestionRenderer.tsx`

**Add new rendering mode for semantic differential:**

```typescript
// Add after line 91, before Likert rendering
if (questao.tipo_resposta === 'diferencial_0_3') {
  // NEW: Render bipolar semantic differential format
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <span className="text-sm text-gray-500">Questão {questao.numero}</span>
      </div>

      {/* Bipolar response layout */}
      <div className="flex items-center gap-4">
        {/* Left statement (positive) */}
        <div className="flex-1 text-right">
          <p className="text-base text-gray-900">{questao.texto_esquerda}</p>
        </div>

        {/* 4 response options in the middle */}
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((valor) => (
            <button
              key={valor}
              onClick={() => handleSelect(String(valor))}
              disabled={readonly}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                selectedValue === String(valor)
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {selectedValue === String(valor) && (
                <div className="w-4 h-4 bg-white rounded-full mx-auto" />
              )}
            </button>
          ))}
        </div>

        {/* Right statement (negative) */}
        <div className="flex-1">
          <p className="text-base text-gray-900">{questao.texto_direita}</p>
        </div>
      </div>

      {/* Optional: Show labels under options */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex-1"></div>
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="w-10 text-center">Muito</span>
          <span className="w-10 text-center">Pouco</span>
          <span className="w-10 text-center">Pouco</span>
          <span className="w-10 text-center">Muito</span>
        </div>
        <div className="flex-1"></div>
      </div>
    </div>
  )
}
```

### Priority 2: HIGH - Question Data Structure

**File**: Update SQL insert `/tests/ebadep_a_insert.sql`

**Change question format to include both statements:**

Current:
```json
{"numero": 1, "texto": "Não tenho vontade de chorar ( ) ( ) ( ) ( ) Tenho sentido vontade de chorar", ...}
```

Required:
```json
{
  "numero": 1,
  "texto_esquerda": "Não tenho vontade de chorar",
  "texto_direita": "Tenho sentido vontade de chorar",
  "tipo_resposta": "diferencial_0_3",
  "invertida": false,
  "obrigatoria": true,
  "peso": 1,
  "ordem": 1
}
```

### Priority 3: MEDIUM - Instructions Display

**New Component**: `/components/test/TestInstructions.tsx`

```typescript
interface TestInstructionsProps {
  titulo: string
  instrucoes: string
  exemplos?: Array<{
    texto_esquerda: string
    texto_direita: string
    marcacao: number
    descricao: string
  }>
  onStart: () => void
}

export default function TestInstructions({
  titulo,
  instrucoes,
  exemplos,
  onStart
}: TestInstructionsProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{titulo}</h1>
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
        <h2 className="font-semibold mb-2">Instruções</h2>
        <p className="text-gray-700">{instrucoes}</p>
      </div>

      {exemplos && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">Exemplos:</h3>
          {exemplos.map((ex, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 text-right text-sm">{ex.texto_esquerda}</div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((pos) => (
                    <div key={pos} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      pos === ex.marcacao ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}>
                      {pos === ex.marcacao && <span className="text-white font-bold">X</span>}
                    </div>
                  ))}
                </div>
                <div className="flex-1 text-sm">{ex.texto_direita}</div>
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center">{ex.descricao}</p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onStart}
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
      >
        Iniciar Teste
      </button>
    </div>
  )
}
```

**Integration**: Modify `/app/aplicar/[testeId]/handoff/page.tsx`

Add state to show instructions first:
```typescript
const [showInstructions, setShowInstructions] = useState(true)

// Before rendering test content, show instructions if needed
if (showInstructions && teste?.teste_template?.interpretacao?.instrucoes_aplicacao) {
  return (
    <HandoffContainer>
      <TestInstructions
        titulo={teste.teste_template.nome}
        instrucoes={teste.teste_template.interpretacao.instrucoes_aplicacao}
        exemplos={teste.teste_template.interpretacao.exemplos_resposta}
        onStart={() => setShowInstructions(false)}
      />
    </HandoffContainer>
  )
}
```

### Priority 4: LOW - Database Type Updates

**File**: `/types/database.ts`

Update `Questao` interface to support bipolar format:

```typescript
export interface Questao {
  numero: number
  texto?: string  // Keep for backward compatibility
  texto_esquerda?: string  // NEW: Left statement (positive)
  texto_direita?: string   // NEW: Right statement (negative)
  tipo?: 'likert' | 'multipla_escolha' | 'diferencial'  // NEW: Add diferencial
  tipo_resposta?: string
  secao?: string
  invertida?: boolean
  obrigatoria?: boolean
  peso?: number
  ordem?: number
  opcoes?: string[]
  escala_opcoes?: any
}
```

---

## Implementation Checklist

### Phase 1: Core Functionality (MUST HAVE)
- [ ] Update `QuestionRenderer.tsx` to support bipolar/semantic differential rendering
- [ ] Update EBADEP-A SQL insert with split `texto_esquerda` and `texto_direita`
- [ ] Add `diferencial_0_3` to recognized scale types
- [ ] Test bipolar question display in handoff mode

### Phase 2: Instructions (SHOULD HAVE)
- [ ] Create `TestInstructions.tsx` component
- [ ] Integrate instructions display in handoff flow
- [ ] Add examples visualization for response format
- [ ] Test instructions → test flow

### Phase 3: Data Structure (NICE TO HAVE)
- [ ] Update `Questao` type definition to include bipolar fields
- [ ] Add migration to support new question format
- [ ] Update existing tests if needed

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Bipolar format breaks mobile layout | HIGH | MEDIUM | Responsive design with vertical stack on mobile |
| Users confused by new format | MEDIUM | HIGH | Clear instructions with visual examples |
| Backward compatibility with existing tests | MEDIUM | LOW | Keep `texto` field, add optional bipolar fields |
| Score calculation errors | HIGH | LOW | Thoroughly test scoring with sample data |

---

## Estimated Effort

| Task | Effort | Complexity |
|------|--------|------------|
| QuestionRenderer bipolar format | 4-6 hours | Medium |
| TestInstructions component | 2-3 hours | Low |
| SQL data restructuring | 1-2 hours | Low |
| Type definitions update | 1 hour | Low |
| Testing & QA | 3-4 hours | Medium |
| **TOTAL** | **11-16 hours** | **Medium** |

---

## Conclusion

The system is **NOT ready** to handle EBADEP-A in its current state. The primary blocker is the **lack of semantic differential question rendering**.

**Minimum Required Changes:**
1. Add bipolar question rendering to `QuestionRenderer.tsx`
2. Restructure questions in SQL to separate left/right statements
3. Add instructions display before test start

**Timeline**: 2-3 days of development + testing

---

## Next Steps

1. **Immediate**: Modify `QuestionRenderer.tsx` to add bipolar format support
2. **Short-term**: Create instructions display component
3. **Medium-term**: Update database types for better bipolar support
4. **Long-term**: Consider other tests that might use similar formats

---

**Generated**: 2024-12-19
**Status**: DRAFT - Pending Development
