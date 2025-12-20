# EBADEP-A Implementation Reference for Agents

## TYPE DEFINITIONS (COMPLETED - DO NOT MODIFY)

### TipoResposta
Location: `/types/database.ts` line 274-282
```typescript
export type TipoResposta =
  | 'likert_0_4'
  | 'likert_0_3'
  | 'likert_0_2'
  | 'diferencial_0_3'  // ✅ ADDED
  | 'multipla_escolha'
  | 'verdadeiro_falso'
  | 'texto_livre'
  | 'numero'
```

### Questao Interface
Location: `/types/database.ts` line 284-300
```typescript
export interface Questao {
  numero: number
  texto: string
  texto_esquerda?: string  // ✅ ADDED - For bipolar questions (positive statement)
  texto_direita?: string   // ✅ ADDED - For bipolar questions (negative statement)
  subtexto?: string
  secao: string
  tipo_resposta: TipoResposta
  tipo?: string
  escala_opcoes?: Array<{ valor: number; label: string }>
  opcoes?: string[]
  invertida: boolean
  obrigatoria: boolean
  peso: number
  depende_de?: number
  ordem: number
}
```

## EXISTING COMPONENTS & PATTERNS

### QuestionRenderer.tsx Location
File: `/components/test/QuestionRenderer.tsx`

**Current Props Interface (line 7-13):**
```typescript
interface QuestionRendererProps {
  questao: Questao
  resposta?: string
  onResponder: (numeroQuestao: number, valor: string) => void
  readonly?: boolean
  escalasResposta?: Record<string, any>
}
```

**Current Question Types Handled:**
1. BDI-II format (lines 36-90) - 4 grouped severity options
2. Likert scale (lines 93-189) - Vertical option list
3. Multiple choice (lines 192-242) - Vertical option list

**Pattern for Adding New Type:**
Insert BEFORE the Likert section (before line 93), check `tipo_resposta` field:
```typescript
if (questao.tipo_resposta === 'diferencial_0_3') {
  // Your bipolar rendering here
}
```

**How handleSelect Works (line 29-33):**
```typescript
const handleSelect = (valor: string) => {
  if (readonly) return
  setSelectedValue(valor)
  onResponder(questao.numero, valor)  // Passes question number and value string
}
```

### Test Application Page
File: `/app/aplicar/[testeId]/handoff/page.tsx`

**Key Components:**
- Line 280-285: QuestionRenderer is used
- Line 256-335: Test content structure
- No instructions display currently exists

## EBADEP-A SPECIFIC REQUIREMENTS

### Question Format
Each of the 45 questions has:
- `texto_esquerda`: Positive/healthy statement (e.g., "Não tenho vontade de chorar")
- `texto_direita`: Negative/depressive statement (e.g., "Tenho sentido vontade de chorar")
- `tipo_resposta`: "diferencial_0_3"
- 4 response options between them: 0, 1, 2, 3

### Visual Layout Required
```
┌──────────────────────────────────────────────────────────────────┐
│ [Positive Statement]    ( ) ( ) ( ) ( )    [Negative Statement]  │
│                         ↑   ↑   ↑   ↑                            │
│                         0   1   2   3                            │
└──────────────────────────────────────────────────────────────────┘
```

### Response Scale
```json
{
  "diferencial_0_3": [
    {"valor": 0, "texto": "Primeira opção (forte)", "descricao": "Concordo fortemente com a afirmação positiva/saudável"},
    {"valor": 1, "texto": "Segunda opção (moderada)", "descricao": "Concordo moderadamente com a afirmação positiva/saudável"},
    {"valor": 2, "texto": "Terceira opção (moderada)", "descricao": "Concordo moderadamente com a afirmação negativa/depressiva"},
    {"valor": 3, "texto": "Quarta opção (forte)", "descricao": "Concordo fortemente com a afirmação negativa/depressiva"}
  ]
}
```

### Instructions Text
Full text in: `/tests/ebadep_a_extraction.json`

Key instruction:
> "Você acabou de receber uma escala com 45 itens, contendo duas frases na mesma linha de cada item. Entre as frases há quatro parênteses. Leia atentamente as duas frases opostas em cada linha e marque com um X como você vem se sentindo em um período de duas semanas, inclusive hoje."

### Visual Examples for Instructions
```
Estou me sentindo alegre  (X) ( ) ( ) ( )  Estou me sentindo triste
→ "Se você tem se sentido muito alegre, marque"

Estou me sentindo alegre  ( ) (X) ( ) ( )  Estou me sentindo triste
→ "Se você tem se sentido alegre, marque"

Estou me sentindo alegre  ( ) ( ) (X) ( )  Estou me sentindo triste
→ "Se você tem se sentindo triste, marque"

Estou me sentindo alegre  ( ) ( ) ( ) (X)  Estou me sentindo triste
→ "Se você tem se sentindo muito triste, marque"
```

## EXISTING UI PATTERNS TO FOLLOW

### Color Scheme (from QuestionRenderer.tsx)
- Selected: `border-blue-600 bg-blue-50`
- Unselected: `border-gray-200 hover:border-blue-300 hover:bg-gray-50`
- Radio indicator: `border-blue-600 bg-blue-600` with `bg-white` inner circle

### Button Styles (from handoff/page.tsx)
- Primary: `bg-blue-600 text-white hover:bg-blue-700`
- Secondary: `border-2 border-gray-300 text-gray-700 hover:bg-gray-50`
- Disabled: `opacity-30 cursor-not-allowed`

### Typography
- Question number badge: `w-8 h-8 bg-blue-100 text-blue-600 rounded-full`
- Question text: `text-lg text-gray-900`
- Helper text: `text-sm text-gray-500`

## FILE LOCATIONS

```
/Users/pedrohenriqueoliveira/Downloads/sistema_testes/
├── types/database.ts                          [✅ UPDATED]
├── components/
│   └── test/
│       ├── QuestionRenderer.tsx               [AGENT 1 - UPDATE]
│       └── TestInstructions.tsx               [AGENT 3 - CREATE]
├── app/aplicar/[testeId]/handoff/page.tsx     [Reference only]
└── tests/
    └── ebadep_a_insert.sql                    [AGENT 2 - UPDATE]
```

## CRITICAL REQUIREMENTS

### For QuestionRenderer Agent
1. Check if `questao.tipo_resposta === 'diferencial_0_3'`
2. Use `questao.texto_esquerda` and `questao.texto_direita`
3. Render 4 circular buttons horizontally
4. Save values as strings: '0', '1', '2', '3'
5. Insert BEFORE line 93 (before Likert rendering)

### For SQL Insert Agent
1. Update ALL 45 questions
2. Split current `texto` into `texto_esquerda` and `texto_direita`
3. Set `tipo_resposta: "diferencial_0_3"`
4. Keep all other fields unchanged
5. File location: `/Users/pedrohenriqueoliveira/Downloads/sistema_testes/tests/ebadep_a_insert.sql`

### For TestInstructions Agent
1. Create NEW file at `/Users/pedrohenriqueoliveira/Downloads/sistema_testes/components/test/TestInstructions.tsx`
2. Props: `{ titulo, instrucoes, exemplos, onStart }`
3. Display full instructions text
4. Show 4 visual examples with marked circles
5. "Iniciar Teste" button calls onStart
6. Use existing UI patterns (colors, typography)

## SUCCESS CRITERIA

✅ All agents must use exact field names from Questao interface
✅ All agents must follow existing UI patterns
✅ No invention of new types or interfaces
✅ No duplication of existing components
✅ Maintain backward compatibility (texto field still works)
