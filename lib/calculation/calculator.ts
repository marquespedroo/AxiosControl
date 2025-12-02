import type {
  Questao,
  RegrasCalculo,
  RegrasCalculoSimples,
  RegrasCalculoPonderada,
  RegrasCalculoSecoes,
  Respostas,
  PontuacaoBruta,
} from '@/types/database'

// ===================================
// RAW SCORE CALCULATION
// ===================================

/**
 * Calculate simple sum score
 */
export function calculateSimpleSum(
  responses: Respostas,
  questions: Questao[],
  maxScaleValue: number
): number {
  let total = 0

  for (const question of questions) {
    // Support both q-prefix and direct number keys (don't use || because 0 is falsy)
    const response = responses[`q${question.numero}`] !== undefined
      ? responses[`q${question.numero}`]
      : responses[question.numero]

    if (response === undefined || response === null) {
      throw new Error(`CALC_001: Missing response for question ${question.numero}`)
    }

    const numericResponse = typeof response === 'string' ? parseFloat(response) : response

    if (isNaN(numericResponse)) {
      throw new Error(`CALC_001: Invalid response type for question ${question.numero}`)
    }

    if (question.invertida) {
      total += maxScaleValue - numericResponse
    } else {
      total += numericResponse
    }
  }

  return total
}

/**
 * Calculate weighted sum score
 */
export function calculateWeightedSum(
  responses: Respostas,
  questions: Array<{ numero: number; peso: number; invertida: boolean }>,
  maxScaleValue: number
): number {
  let total = 0

  for (const question of questions) {
    // Support both q-prefix and direct number keys (don't use || because 0 is falsy)
    const response = responses[`q${question.numero}`] !== undefined
      ? responses[`q${question.numero}`]
      : responses[question.numero]

    if (response === undefined || response === null) {
      throw new Error(`CALC_001: Missing response for question ${question.numero}`)
    }

    const numericResponse = typeof response === 'string' ? parseFloat(response) : response

    if (isNaN(numericResponse)) {
      throw new Error(`CALC_001: Invalid response type for question ${question.numero}`)
    }

    const adjustedResponse = question.invertida
      ? maxScaleValue - numericResponse
      : numericResponse

    total += adjustedResponse * question.peso
  }

  return total
}

/**
 * Calculate section-based scores
 */
export function calculateSectionScores(
  responses: Respostas,
  sections: Record<string, { questoes: number[]; invertidas: number[]; peso: number }>,
  maxScaleValue: number
): PontuacaoBruta {
  const sectionScores: Record<string, number> = {}
  let total = 0

  for (const [sectionName, section] of Object.entries(sections)) {
    let sectionSum = 0

    for (const questionNum of section.questoes) {
      // Support both q-prefix and direct number keys (don't use || because 0 is falsy)
      const response = responses[`q${questionNum}`] !== undefined
        ? responses[`q${questionNum}`]
        : responses[questionNum]

      if (response === undefined || response === null) {
        throw new Error(`CALC_001: Missing response for question ${questionNum} in section ${sectionName}`)
      }

      const numericResponse = typeof response === 'string' ? parseFloat(response) : response

      if (isNaN(numericResponse)) {
        throw new Error(`CALC_001: Invalid response type for question ${questionNum}`)
      }

      const isInverted = section.invertidas.includes(questionNum)
      const adjustedResponse = isInverted
        ? maxScaleValue - numericResponse
        : numericResponse

      sectionSum += adjustedResponse
    }

    const weightedScore = sectionSum * section.peso
    sectionScores[sectionName] = weightedScore
    total += weightedScore
  }

  return {
    total,
    secoes: sectionScores,
  }
}

/**
 * Calculate score using answer key (gabarito)
 * Used for tests like BHS where answers are compared to a correct answer key
 *
 * CRITICAL: Gabarito uses 0-based keys (0, 1, 2...) but frontend saves 1-based (q1, q2, q3...)
 * So we must add 1 to convert: gabarito["0"] → responses["q1"]
 */
export function calculateGabaritoScore(
  responses: Respostas,
  gabarito: Record<string, string>
): number {
  let score = 0

  for (const [questionKey, correctAnswer] of Object.entries(gabarito)) {
    // CRITICAL FIX: Gabarito keys are 0-based, question números are 1-based
    const questionNum = parseInt(questionKey) + 1  // Convert: gabarito["0"] → q1

    // Support both q-prefix and direct number keys (don't use || because 0 is falsy)
    const userAnswer = responses[`q${questionNum}`] !== undefined
      ? responses[`q${questionNum}`]
      : responses[questionNum]

    if (userAnswer === correctAnswer) {
      score += 1
    }
  }

  return score
}

/**
 * Calculate AQ (Autism Quotient) dichotomous score
 * Used for AQ test where responses are collapsed into agree/disagree and scored based on autistic trait direction
 *
 * Scoring:
 * - For items in itens_concordo: score 1 if response is 0 or 1 (agree)
 * - For items in itens_discordo: score 1 if response is 2 or 3 (disagree)
 * - Total score ranges from 0-50
 */
export function calculateAQDichotomous(
  responses: Respostas,
  itens_concordo: number[],
  itens_discordo: number[]
): number {
  let score = 0

  // Score items where AGREE indicates autistic trait
  for (const questionNum of itens_concordo) {
    const response = responses[`q${questionNum}`] !== undefined
      ? responses[`q${questionNum}`]
      : responses[questionNum]

    if (response === undefined || response === null) {
      continue // Skip missing responses
    }

    const numericResponse = typeof response === 'string' ? parseInt(response) : response

    // Score 1 if response is 0 (definitely agree) or 1 (slightly agree)
    if (numericResponse === 0 || numericResponse === 1) {
      score += 1
    }
  }

  // Score items where DISAGREE indicates autistic trait
  for (const questionNum of itens_discordo) {
    const response = responses[`q${questionNum}`] !== undefined
      ? responses[`q${questionNum}`]
      : responses[questionNum]

    if (response === undefined || response === null) {
      continue // Skip missing responses
    }

    const numericResponse = typeof response === 'string' ? parseInt(response) : response

    // Score 1 if response is 2 (slightly disagree) or 3 (definitely disagree)
    if (numericResponse === 2 || numericResponse === 3) {
      score += 1
    }
  }

  return score
}

/**
 * Calculate quadrant-based scores
 * Used for AASP (Perfil Sensorial) where questions are grouped into sensory processing quadrants
 * Each quadrant has a list of question numbers and optional weight
 */
export function calculateQuadrantScores(
  responses: Respostas,
  quadrantes: Record<string, { nome?: string; questoes: number[]; peso?: number }>
): PontuacaoBruta {
  const quadrantScores: Record<string, number> = {}
  let total = 0

  for (const [quadrantName, quadrant] of Object.entries(quadrantes)) {
    let quadrantSum = 0
    const peso = quadrant.peso || 1

    for (const questionNum of quadrant.questoes) {
      // Support both q-prefix and direct number keys (don't use || because 0 is falsy)
      const response = responses[`q${questionNum}`] !== undefined
        ? responses[`q${questionNum}`]
        : responses[questionNum]

      if (response === undefined || response === null) {
        // For quadrant scoring, skip missing responses to allow partial completion
        // This is important for long tests where some questions might be skipped
        continue
      }

      const numericResponse = typeof response === 'string' ? parseFloat(response) : response

      if (isNaN(numericResponse)) {
        continue // Skip invalid responses instead of throwing
      }

      quadrantSum += numericResponse
    }

    const weightedScore = quadrantSum * peso
    quadrantScores[quadrantName] = weightedScore
    total += weightedScore
  }

  return {
    total,
    secoes: quadrantScores,
  }
}

/**
 * Calculate score by summing sections defined by question ranges
 * Used for tests like BDEFS and PSA that group questions by ranges
 *
 * Note: Ranges use 0-based indexing (inicio: 0, fim: 20 means questions 1-21)
 */
export function calculateScoreByRanges(
  responses: Respostas,
  sections: Record<string, { inicio: number; fim: number }>
): PontuacaoBruta {
  const sectionScores: Record<string, number> = {}
  let total = 0

  for (const [sectionName, range] of Object.entries(sections)) {
    let sectionSum = 0

    // Ranges are 0-based, but questions are numbered from 1
    // So we add 1 to convert: inicio 0 → question 1, fim 20 → question 21
    const startQuestion = range.inicio + 1
    const endQuestion = range.fim + 1

    // Sum all questions in the range (inclusive)
    for (let questionNum = startQuestion; questionNum <= endQuestion; questionNum++) {
      // Support both q-prefix and direct number keys (don't use || because 0 is falsy)
      const response = responses[`q${questionNum}`] !== undefined
        ? responses[`q${questionNum}`]
        : responses[questionNum]

      if (response === undefined || response === null) {
        throw new Error(`CALC_001: Missing response for question ${questionNum} in section ${sectionName}`)
      }

      const numericResponse = typeof response === 'string' ? parseFloat(response) : response

      if (isNaN(numericResponse)) {
        throw new Error(`CALC_001: Invalid response type for question ${questionNum}`)
      }

      sectionSum += numericResponse
    }

    sectionScores[sectionName] = sectionSum
    total += sectionSum
  }

  return {
    total,
    secoes: sectionScores,
  }
}

/**
 * Main calculation dispatcher
 */
export function calculateRawScore(
  responses: Respostas,
  regrasCalculo: RegrasCalculo,
  questions: Questao[],
  maxScaleValue: number
): PontuacaoBruta {
  switch ((regrasCalculo as any).tipo) {
    case 'gabarito_binario': {
      // Answer key based scoring (e.g., BHS test)
      const gabarito = (regrasCalculo as any).gabarito
      if (!gabarito) {
        throw new Error('CALC_002: Gabarito not found for gabarito_binario type')
      }

      const total = calculateGabaritoScore(responses, gabarito)
      return { total }
    }

    case 'soma_simples': {
      const rules = regrasCalculo as RegrasCalculoSimples

      // If questoes_incluidas not specified, include all questions
      const includedQuestions = rules.questoes_incluidas && rules.questoes_incluidas.length > 0
        ? questions.filter((q) => rules.questoes_incluidas.includes(q.numero))
        : questions

      // Mark inverted questions
      if (rules.questoes_invertidas) {
        includedQuestions.forEach((q) => {
          if (rules.questoes_invertidas.includes(q.numero)) {
            q.invertida = true
          }
        })
      }

      const total = calculateSimpleSum(responses, includedQuestions, maxScaleValue)

      return { total }
    }

    case 'soma_ponderada': {
      const rules = regrasCalculo as RegrasCalculoPonderada
      const weightedQuestions = rules.questoes.map((q) => ({
        numero: q.numero,
        peso: q.peso,
        invertida: questions.find((quest) => quest.numero === q.numero)?.invertida || false,
      }))

      const total = calculateWeightedSum(responses, weightedQuestions, maxScaleValue)

      return { total }
    }

    case 'secoes': {
      const rules = regrasCalculo as RegrasCalculoSecoes
      return calculateSectionScores(responses, rules.secoes, maxScaleValue)
    }

    case 'aq_dicotomico': {
      // AQ (Autism Quotient) dichotomous scoring
      const rules = (regrasCalculo as any)
      if (!rules.itens_concordo || !rules.itens_discordo) {
        throw new Error('CALC_002: AQ items not found for aq_dicotomico type')
      }

      const total = calculateAQDichotomous(responses, rules.itens_concordo, rules.itens_discordo)
      return { total }
    }

    case 'pontuacao_especifica': {
      // Simple sum of all responses (same as soma_simples but different name)
      const total = calculateSimpleSum(responses, questions, maxScaleValue)
      return { total }
    }

    case 'soma_por_secao': {
      // Sum responses grouped by question number ranges
      // Used for tests like BDEFS and PSA
      const rules = (regrasCalculo as any)
      if (!rules.secoes) {
        throw new Error('CALC_002: Sections not found for soma_por_secao type')
      }

      return calculateScoreByRanges(responses, rules.secoes)
    }

    case 'quadrantes': {
      // Quadrant-based scoring used for AASP (Perfil Sensorial)
      // Each quadrant has a list of question numbers
      const rules = (regrasCalculo as any)
      if (!rules.quadrantes) {
        throw new Error('CALC_002: Quadrantes not found for quadrantes type')
      }

      return calculateQuadrantScores(responses, rules.quadrantes)
    }

    case 'quadrantes_secoes': {
      // Combined quadrant and section scoring used for Child Sensory Profile 2
      // Calculates both quadrant scores and sensory/behavioral section scores
      const rules = (regrasCalculo as any)
      if (!rules.quadrantes) {
        throw new Error('CALC_002: Quadrantes not found for quadrantes_secoes type')
      }

      const secoes: Record<string, number> = {}
      let total = 0

      // Calculate quadrant scores
      for (const [quadrantName, quadrant] of Object.entries(rules.quadrantes as Record<string, { questoes: number[] }>)) {
        let quadrantSum = 0
        for (const questionNum of quadrant.questoes) {
          const response = responses[`q${questionNum}`] !== undefined
            ? responses[`q${questionNum}`]
            : responses[questionNum]

          if (response !== undefined && response !== null && response !== 0) {
            const numericResponse = typeof response === 'string' ? parseFloat(response) : response
            if (!isNaN(numericResponse)) {
              quadrantSum += numericResponse
            }
          }
        }
        secoes[quadrantName] = quadrantSum
        total += quadrantSum
      }

      // Calculate sensory section scores if defined
      if (rules.secoes_sensoriais) {
        for (const [sectionName, section] of Object.entries(rules.secoes_sensoriais as Record<string, { questoes: number[] }>)) {
          let sectionSum = 0
          for (const questionNum of section.questoes) {
            const response = responses[`q${questionNum}`] !== undefined
              ? responses[`q${questionNum}`]
              : responses[questionNum]

            if (response !== undefined && response !== null && response !== 0) {
              const numericResponse = typeof response === 'string' ? parseFloat(response) : response
              if (!isNaN(numericResponse)) {
                sectionSum += numericResponse
              }
            }
          }
          secoes[sectionName] = sectionSum
        }
      }

      // Calculate behavioral section scores if defined
      if (rules.secoes_comportamentais) {
        for (const [sectionName, section] of Object.entries(rules.secoes_comportamentais as Record<string, { questoes: number[] }>)) {
          let sectionSum = 0
          for (const questionNum of section.questoes) {
            const response = responses[`q${questionNum}`] !== undefined
              ? responses[`q${questionNum}`]
              : responses[questionNum]

            if (response !== undefined && response !== null && response !== 0) {
              const numericResponse = typeof response === 'string' ? parseFloat(response) : response
              if (!isNaN(numericResponse)) {
                sectionSum += numericResponse
              }
            }
          }
          secoes[sectionName] = sectionSum
        }
      }

      return { total, secoes }
    }

    case 'custom': {
      // For custom calculations, this would execute user-defined JavaScript
      // For security, this should be sandboxed or pre-validated
      throw new Error('CALC_002: Custom calculations not yet implemented')
    }

    default:
      throw new Error(`CALC_002: Unknown calculation type: ${(regrasCalculo as any).tipo}`)
  }
}

// ===================================
// VALIDATION HELPERS
// ===================================

/**
 * Validate all responses are present and valid
 */
export function validateResponses(
  responses: Respostas,
  questions: Questao[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const question of questions) {
    if (!question.obrigatoria) continue

    // Support both q-prefix and direct number keys (don't use || because 0 is falsy)
    const response = responses[`q${question.numero}`] !== undefined
      ? responses[`q${question.numero}`]
      : responses[question.numero]

    if (response === undefined || response === null) {
      errors.push(`Missing required response for question ${question.numero}`)
      continue
    }

    // Type validation based on question type
    if (question.tipo_resposta === 'numero') {
      const numericResponse = typeof response === 'string' ? parseFloat(response) : response
      if (isNaN(numericResponse)) {
        errors.push(`Invalid numeric response for question ${question.numero}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get maximum scale value from escalas_resposta
 */
export function getMaxScaleValue(tipoResposta: string, escalasResposta: any): number {
  const escala = escalasResposta[tipoResposta]

  if (!escala || !Array.isArray(escala)) {
    throw new Error(`CALC_002: Invalid scale type: ${tipoResposta}`)
  }

  return Math.max(...escala.map((opt: any) => opt.valor))
}

/**
 * Check if response is within valid range
 */
export function isValidResponse(
  response: number | string,
  tipoResposta: string,
  escalasResposta: any
): boolean {
  const numericResponse = typeof response === 'string' ? parseFloat(response) : response

  if (isNaN(numericResponse)) return false

  const escala = escalasResposta[tipoResposta]

  if (!escala || !Array.isArray(escala)) return false

  const validValues = escala.map((opt: any) => opt.valor)
  return validValues.includes(numericResponse)
}
