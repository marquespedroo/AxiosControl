# Calculation Engine Specification

**Version:** 1.0
**Purpose:** Define mathematical algorithms for test scoring and normalization
**Critical:** All calculations must be validated against manual calculations

---

## 📐 Core Algorithms

### 1. Raw Score Calculation

#### 1.1 Simple Sum (Soma Simples)

**Formula:**
```
raw_score = Σ(responses) - Σ(inverted_responses_adjusted)
```

**Inverted Item Adjustment:**
```
adjusted_value = max_scale_value - original_value
```

**Example (EPF-TDAH):**
- Scale: 0-4 (Nunca=0, Raramente=1, Algumas vezes=2, Muitas vezes=3, Sempre=4)
- Question 1 (normal): Response = 2 → Score = 2
- Question 2 (inverted): Response = 1 → Score = 4-1 = 3
- Total: 2 + 3 = 5

**TypeScript Implementation:**
```typescript
function calculateSimpleSum(
  responses: Record<number, number>,
  questions: Question[],
  maxScaleValue: number
): number {
  let total = 0;

  for (const question of questions) {
    const response = responses[question.numero];

    if (response === undefined) {
      throw new Error(`Missing response for question ${question.numero}`);
    }

    if (question.invertida) {
      total += maxScaleValue - response;
    } else {
      total += response;
    }
  }

  return total;
}
```

**Test Cases:**
```typescript
// Test 1: Normal items only
input: {
  responses: { 1: 2, 2: 3, 3: 1 },
  questions: [
    { numero: 1, invertida: false },
    { numero: 2, invertida: false },
    { numero: 3, invertida: false }
  ],
  maxScaleValue: 4
}
expected: 6

// Test 2: With inverted items
input: {
  responses: { 1: 2, 2: 1, 3: 3 },
  questions: [
    { numero: 1, invertida: false },
    { numero: 2, invertida: true },  // 4-1=3
    { numero: 3, invertida: false }
  ],
  maxScaleValue: 4
}
expected: 8

// Test 3: Error case - missing response
input: {
  responses: { 1: 2, 3: 1 },
  questions: [
    { numero: 1, invertida: false },
    { numero: 2, invertida: false },
    { numero: 3, invertida: false }
  ],
  maxScaleValue: 4
}
expected: Error("Missing response for question 2")
```

---

#### 1.2 Weighted Sum (Soma Ponderada)

**Formula:**
```
raw_score = Σ(response_i × weight_i)
```

**TypeScript Implementation:**
```typescript
function calculateWeightedSum(
  responses: Record<number, number>,
  questions: Array<{ numero: number; peso: number; invertida: boolean }>,
  maxScaleValue: number
): number {
  let total = 0;

  for (const question of questions) {
    const response = responses[question.numero];

    if (response === undefined) {
      throw new Error(`Missing response for question ${question.numero}`);
    }

    const adjustedResponse = question.invertida
      ? maxScaleValue - response
      : response;

    total += adjustedResponse * question.peso;
  }

  return total;
}
```

**Test Cases:**
```typescript
// Test 1: Basic weighted sum
input: {
  responses: { 1: 2, 2: 3, 3: 1 },
  questions: [
    { numero: 1, peso: 1, invertida: false },
    { numero: 2, peso: 2, invertida: false },
    { numero: 3, peso: 1.5, invertida: false }
  ],
  maxScaleValue: 4
}
expected: 2*1 + 3*2 + 1*1.5 = 9.5

// Test 2: Weighted with inverted items
input: {
  responses: { 1: 2, 2: 1 },
  questions: [
    { numero: 1, peso: 2, invertida: false },
    { numero: 2, peso: 3, invertida: true }  // (4-1)*3 = 9
  ],
  maxScaleValue: 4
}
expected: 2*2 + 9 = 13
```

---

#### 1.3 Section-Based Calculation (Cálculo por Seções)

**Formula:**
```
section_score = Σ(section_responses) × section_weight
total_score = Σ(all_section_scores)
```

**TypeScript Implementation:**
```typescript
interface Section {
  nome: string;
  questoes: number[];
  invertidas: number[];
  peso: number;
}

function calculateSectionScores(
  responses: Record<number, number>,
  sections: Section[],
  maxScaleValue: number
): { total: number; secoes: Record<string, number> } {
  const sectionScores: Record<string, number> = {};
  let total = 0;

  for (const section of sections) {
    let sectionSum = 0;

    for (const questionNum of section.questoes) {
      const response = responses[questionNum];

      if (response === undefined) {
        throw new Error(`Missing response for question ${questionNum}`);
      }

      const isInverted = section.invertidas.includes(questionNum);
      const adjustedResponse = isInverted
        ? maxScaleValue - response
        : response;

      sectionSum += adjustedResponse;
    }

    const weightedScore = sectionSum * section.peso;
    sectionScores[section.nome] = weightedScore;
    total += weightedScore;
  }

  return { total, secoes: sectionScores };
}
```

**Test Cases (EPF-TDAH):**
```typescript
// Test 1: Multiple sections
input: {
  responses: {
    1: 2, 2: 1, 3: 3, 4: 2, 5: 1, 6: 2, 7: 3, 8: 1,  // estudos_trabalho
    9: 2, 10: 3, 11: 1, 12: 2                        // profissional
  },
  sections: [
    {
      nome: "estudos_trabalho",
      questoes: [1, 2, 3, 4, 5, 6, 7, 8],
      invertidas: [2, 5],  // Inverted items
      peso: 1
    },
    {
      nome: "profissional",
      questoes: [9, 10, 11, 12],
      invertidas: [],
      peso: 1.5
    }
  ],
  maxScaleValue: 4
}
expected: {
  total: 30,
  secoes: {
    estudos_trabalho: 18,  // (2 + (4-1) + 3 + 2 + (4-1) + 2 + 3 + 1) * 1
    profissional: 12       // (2 + 3 + 1 + 2) * 1.5
  }
}

// Calculation breakdown:
// estudos_trabalho:
//   Q1: 2, Q2: 4-1=3, Q3: 3, Q4: 2, Q5: 4-1=3, Q6: 2, Q7: 3, Q8: 1
//   Sum: 2+3+3+2+3+2+3+1 = 18
//   Weighted: 18 * 1 = 18
//
// profissional:
//   Q9: 2, Q10: 3, Q11: 1, Q12: 2
//   Sum: 2+3+1+2 = 8
//   Weighted: 8 * 1.5 = 12
//
// Total: 18 + 12 = 30
```

---

### 2. Normalization Algorithms

#### 2.1 Percentile Calculation (Linear Interpolation)

**Algorithm:**
```
1. Find percentile table for patient demographics
2. If raw_score ≤ P5 → return 5
3. If raw_score ≥ P95 → return 95
4. Find adjacent percentiles (P_low, P_high) where:
   score_low ≤ raw_score ≤ score_high
5. Linear interpolation:
   percentile = P_low + ((raw_score - score_low) / (score_high - score_low)) × (P_high - P_low)
```

**TypeScript Implementation:**
```typescript
function calculatePercentile(
  rawScore: number,
  percentileTable: Record<number, number>
): number {
  const percentiles = [5, 10, 25, 50, 75, 90, 95];

  // Edge cases
  if (rawScore <= percentileTable[5]) return 5;
  if (rawScore >= percentileTable[95]) return 95;

  // Find adjacent percentiles
  for (let i = 0; i < percentiles.length - 1; i++) {
    const pLow = percentiles[i];
    const pHigh = percentiles[i + 1];
    const scoreLow = percentileTable[pLow];
    const scoreHigh = percentileTable[pHigh];

    if (rawScore >= scoreLow && rawScore <= scoreHigh) {
      // Linear interpolation
      const ratio = (rawScore - scoreLow) / (scoreHigh - scoreLow);
      const percentile = pLow + ratio * (pHigh - pLow);
      return Math.round(percentile);
    }
  }

  throw new Error('Percentile calculation failed');
}
```

**Test Cases:**
```typescript
// Test 1: Exact percentile match
input: {
  rawScore: 42,
  percentileTable: { 5: 20, 10: 25, 25: 35, 50: 42, 75: 50, 90: 58, 95: 62 }
}
expected: 50

// Test 2: Interpolation needed
input: {
  rawScore: 45,
  percentileTable: { 5: 20, 10: 25, 25: 35, 50: 42, 75: 50, 90: 58, 95: 62 }
}
// Between P50 (42) and P75 (50)
// ratio = (45 - 42) / (50 - 42) = 3/8 = 0.375
// percentile = 50 + 0.375 * (75 - 50) = 50 + 9.375 = 59.375 ≈ 59
expected: 59

// Test 3: Below minimum
input: {
  rawScore: 15,
  percentileTable: { 5: 20, 10: 25, 25: 35, 50: 42, 75: 50, 90: 58, 95: 62 }
}
expected: 5

// Test 4: Above maximum
input: {
  rawScore: 70,
  percentileTable: { 5: 20, 10: 25, 25: 35, 50: 42, 75: 50, 90: 58, 95: 62 }
}
expected: 95
```

---

#### 2.2 Z-Score Calculation

**Formula:**
```
Z = (raw_score - mean) / standard_deviation
```

**Edge Cases:**
- If SD = 0 → return null (no variance in sample)
- Round to 2 decimal places

**TypeScript Implementation:**
```typescript
function calculateZScore(
  rawScore: number,
  mean: number,
  stdDev: number
): number | null {
  if (stdDev === 0) {
    console.warn('Standard deviation is 0, cannot calculate Z-score');
    return null;
  }

  const zScore = (rawScore - mean) / stdDev;
  return Math.round(zScore * 100) / 100; // Round to 2 decimals
}
```

**Test Cases:**
```typescript
// Test 1: Basic Z-score
input: { rawScore: 85, mean: 75, stdDev: 12 }
expected: 0.83

// Test 2: Negative Z-score
input: { rawScore: 60, mean: 75, stdDev: 12 }
expected: -1.25

// Test 3: Zero standard deviation
input: { rawScore: 50, mean: 50, stdDev: 0 }
expected: null

// Test 4: Exact mean
input: { rawScore: 75, mean: 75, stdDev: 12 }
expected: 0.00
```

---

#### 2.3 T-Score Calculation

**Formula:**
```
T = 50 + (Z × 10)
```

**Range:** 0-100 (theoretical), typically 20-80

**TypeScript Implementation:**
```typescript
function calculateTScore(zScore: number | null): number | null {
  if (zScore === null) return null;

  const tScore = 50 + (zScore * 10);
  return Math.round(tScore * 100) / 100; // Round to 2 decimals
}
```

**Test Cases:**
```typescript
// Test 1: Positive Z-score
input: { zScore: 0.83 }
expected: 58.30

// Test 2: Negative Z-score
input: { zScore: -1.25 }
expected: 37.50

// Test 3: Zero Z-score
input: { zScore: 0 }
expected: 50.00

// Test 4: Null Z-score
input: { zScore: null }
expected: null
```

---

#### 2.4 Qualitative Classification

**Wechsler Scale (Standard):**
```
Percentile ≤ 2:     "Muito Inferior"      (Extremely Low)
Percentile 3-8:     "Inferior"            (Borderline)
Percentile 9-24:    "Média Inferior"      (Low Average)
Percentile 25-74:   "Médio"               (Average)
Percentile 75-90:   "Média Superior"      (High Average)
Percentile 91-97:   "Superior"            (Superior)
Percentile ≥ 98:    "Muito Superior"      (Very Superior)
```

**Simplified Scale (EPF-TDAH):**
```
Percentile ≤ 5:     "Muito Inferior"
Percentile 6-16:    "Inferior"
Percentile 17-84:   "Médio"
Percentile 85-95:   "Superior"
Percentile > 95:    "Muito Superior"
```

**TypeScript Implementation:**
```typescript
type ClassificationScale = 'wechsler' | 'simplified';

function classifyPerformance(
  percentile: number,
  scale: ClassificationScale = 'simplified'
): string {
  if (scale === 'wechsler') {
    if (percentile <= 2) return 'Muito Inferior';
    if (percentile <= 8) return 'Inferior';
    if (percentile <= 24) return 'Média Inferior';
    if (percentile <= 74) return 'Médio';
    if (percentile <= 90) return 'Média Superior';
    if (percentile <= 97) return 'Superior';
    return 'Muito Superior';
  }

  // Simplified scale
  if (percentile <= 5) return 'Muito Inferior';
  if (percentile <= 16) return 'Inferior';
  if (percentile <= 84) return 'Médio';
  if (percentile <= 95) return 'Superior';
  return 'Muito Superior';
}
```

**Test Cases:**
```typescript
// Simplified scale
input: { percentile: 3, scale: 'simplified' }
expected: "Muito Inferior"

input: { percentile: 12, scale: 'simplified' }
expected: "Inferior"

input: { percentile: 50, scale: 'simplified' }
expected: "Médio"

input: { percentile: 90, scale: 'simplified' }
expected: "Superior"

input: { percentile: 97, scale: 'simplified' }
expected: "Muito Superior"

// Wechsler scale
input: { percentile: 15, scale: 'wechsler' }
expected: "Média Inferior"
```

---

### 3. Normative Bin Matching

**Algorithm:**
```
1. Extract patient demographics (age, education, sex)
2. Find active normative table for test
3. Search for matching bin:
   - age_min ≤ patient_age ≤ age_max
   - education_min ≤ patient_education ≤ education_max
   - sex matches (if stratified)
4. If no match:
   - Use closest bin (nearest age/education)
   - Flag as extrapolation
5. Return bin with mean, SD, percentiles
```

**TypeScript Implementation:**
```typescript
interface NormativeBin {
  idade_min: number;
  idade_max: number;
  escolaridade_min: number;
  escolaridade_max: number;
  sexo?: string;
  n: number;
  media: number;
  desvio_padrao: number;
  percentis: Record<number, number>;
}

interface Patient {
  idade: number;
  escolaridade_anos: number;
  sexo: string;
}

function findNormativeBin(
  patient: Patient,
  normativeBins: NormativeBin[]
): { bin: NormativeBin; exact: boolean } | null {
  // Try exact match first
  for (const bin of normativeBins) {
    if (
      patient.idade >= bin.idade_min &&
      patient.idade <= bin.idade_max &&
      patient.escolaridade_anos >= bin.escolaridade_min &&
      patient.escolaridade_anos <= bin.escolaridade_max &&
      (!bin.sexo || bin.sexo === patient.sexo)
    ) {
      return { bin, exact: true };
    }
  }

  // No exact match - find closest
  const closest = normativeBins.reduce((best, current) => {
    const bestAgeDiff = Math.abs((best.idade_min + best.idade_max) / 2 - patient.idade);
    const currentAgeDiff = Math.abs((current.idade_min + current.idade_max) / 2 - patient.idade);

    if (currentAgeDiff < bestAgeDiff) {
      return current;
    }

    if (currentAgeDiff === bestAgeDiff) {
      const bestEduDiff = Math.abs((best.escolaridade_min + best.escolaridade_max) / 2 - patient.escolaridade_anos);
      const currentEduDiff = Math.abs((current.escolaridade_min + current.escolaridade_max) / 2 - patient.escolaridade_anos);
      return currentEduDiff < bestEduDiff ? current : best;
    }

    return best;
  });

  return closest ? { bin: closest, exact: false } : null;
}
```

**Test Cases:**
```typescript
// Test 1: Exact match
input: {
  patient: { idade: 32, escolaridade_anos: 16, sexo: 'M' },
  bins: [
    { idade_min: 26, idade_max: 35, escolaridade_min: 12, escolaridade_max: 20, n: 150, media: 75, desvio_padrao: 12, percentis: {...} },
    { idade_min: 36, idade_max: 45, escolaridade_min: 12, escolaridade_max: 20, n: 140, media: 80, desvio_padrao: 10, percentis: {...} }
  ]
}
expected: { bin: bins[0], exact: true }

// Test 2: No exact match - extrapolation
input: {
  patient: { idade: 70, escolaridade_anos: 16, sexo: 'M' },
  bins: [
    { idade_min: 26, idade_max: 35, escolaridade_min: 12, escolaridade_max: 20, ... },
    { idade_min: 51, idade_max: 65, escolaridade_min: 12, escolaridade_max: 20, ... }
  ]
}
expected: { bin: bins[1], exact: false }  // Closest bin (51-65)
```

---

## 🔍 Complete Calculation Pipeline

**Full normalization flow:**

```typescript
interface CalculationResult {
  pontuacao_bruta: {
    total: number;
    secoes?: Record<string, number>;
  };
  normalizacao?: {
    tabela_utilizada: string;
    faixa_aplicada: {
      idade: string;
      escolaridade: string;
    };
    exact_match: boolean;
    percentil: number;
    escore_z: number | null;
    escore_t: number | null;
    classificacao: string;
    descricao: string;
  };
  interpretacao?: {
    classificacao_geral: string;
    pontos_atencao: string[];
    recomendacoes: string[];
  };
}

async function calculateTestResults(
  testTemplate: TestTemplate,
  responses: Record<number, number>,
  patient: Patient
): Promise<CalculationResult> {
  // Step 1: Calculate raw score
  const rawScore = calculateSectionScores(
    responses,
    testTemplate.regras_calculo.secoes,
    getMaxScaleValue(testTemplate)
  );

  // Step 2: Find normative bin
  const normTable = await getNormativeTable(testTemplate.id);
  const binMatch = findNormativeBin(patient, normTable.faixas);

  if (!binMatch) {
    return {
      pontuacao_bruta: rawScore,
      // No normalization available
    };
  }

  const { bin, exact } = binMatch;

  // Step 3: Calculate percentile
  const percentil = calculatePercentile(rawScore.total, bin.percentis);

  // Step 4: Calculate Z-score and T-score
  const escore_z = calculateZScore(rawScore.total, bin.media, bin.desvio_padrao);
  const escore_t = calculateTScore(escore_z);

  // Step 5: Classify performance
  const classificacao = classifyPerformance(percentil);

  // Step 6: Generate interpretation
  const interpretacao = generateInterpretation(
    rawScore,
    percentil,
    classificacao,
    testTemplate
  );

  return {
    pontuacao_bruta: rawScore,
    normalizacao: {
      tabela_utilizada: normTable.nome,
      faixa_aplicada: {
        idade: `${bin.idade_min}-${bin.idade_max} anos`,
        escolaridade: `${bin.escolaridade_min}-${bin.escolaridade_max} anos`
      },
      exact_match: exact,
      percentil,
      escore_z,
      escore_t,
      classificacao,
      descricao: getClassificationDescription(classificacao)
    },
    interpretacao
  };
}
```

---

## ✅ Validation & Testing

### Unit Test Coverage Required

1. **Calculation Functions:**
   - ✅ Simple sum (5 tests)
   - ✅ Weighted sum (3 tests)
   - ✅ Section-based (5 tests)
   - ✅ Inverted items (3 tests)

2. **Normalization Functions:**
   - ✅ Percentile calculation (6 tests)
   - ✅ Z-score (5 tests)
   - ✅ T-score (4 tests)
   - ✅ Classification (8 tests)

3. **Bin Matching:**
   - ✅ Exact match (3 tests)
   - ✅ Extrapolation (3 tests)
   - ✅ Multiple stratification (2 tests)

4. **Edge Cases:**
   - ✅ Missing responses
   - ✅ SD = 0
   - ✅ Out of range scores
   - ✅ No normative data

### Integration Tests

```typescript
describe('Full calculation pipeline', () => {
  it('should calculate EPF-TDAH correctly', async () => {
    const result = await calculateTestResults(
      epfTdahTemplate,
      validResponses,
      testPatient
    );

    expect(result.pontuacao_bruta.total).toBe(85);
    expect(result.normalizacao?.percentil).toBe(72);
    expect(result.normalizacao?.classificacao).toBe('Médio');
  });
});
```

---

## 🚨 Error Handling

### Error Codes

- **CALC_001:** Calculation failed - missing responses
- **CALC_002:** Invalid calculation rule configuration
- **CALC_003:** Inverted item processing error
- **NORM_001:** No normative table found
- **NORM_002:** Patient demographics outside norm range
- **NORM_003:** Standard deviation is zero
- **NORM_004:** Invalid percentile interpolation

### Example Error Response

```json
{
  "error": "NORM_002",
  "message": "Paciente fora da faixa normativa",
  "details": {
    "patient_age": 70,
    "available_range": "18-65 anos",
    "solution": "Utilizadas normas da faixa mais próxima (51-65 anos)",
    "warning": "Interpretação deve considerar extrapolação de dados"
  }
}
```

---

## 📊 Performance Requirements

- **Calculation Time:** < 100ms for simple tests
- **Calculation Time:** < 500ms for complex tests (69+ questions)
- **Accuracy:** 100% match with manual calculations
- **Precision:** 2 decimal places for Z/T scores
- **Rounding:** Standard rounding (0.5 rounds up)
