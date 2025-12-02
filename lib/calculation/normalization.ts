import type { FaixaNormativa } from '@/types/database'

// ===================================
// PERCENTILE CALCULATION
// ===================================

/**
 * Calculate percentile using linear interpolation
 */
export function calculatePercentile(
  rawScore: number,
  percentileTable: Record<number, number>
): number {
  const percentiles = [5, 10, 25, 50, 75, 90, 95]

  // Edge cases
  if (rawScore <= percentileTable[5]) return 5
  if (rawScore >= percentileTable[95]) return 95

  // Find adjacent percentiles for interpolation
  for (let i = 0; i < percentiles.length - 1; i++) {
    const pLow = percentiles[i]
    const pHigh = percentiles[i + 1]
    const scoreLow = percentileTable[pLow]
    const scoreHigh = percentileTable[pHigh]

    if (rawScore >= scoreLow && rawScore <= scoreHigh) {
      // Linear interpolation formula
      const ratio = (rawScore - scoreLow) / (scoreHigh - scoreLow)
      const percentile = pLow + ratio * (pHigh - pLow)
      return Math.round(percentile)
    }
  }

  throw new Error('NORM_004: Percentile calculation failed - invalid interpolation')
}

// ===================================
// Z-SCORE CALCULATION
// ===================================

/**
 * Calculate Z-score (standard score)
 * Formula: Z = (X - μ) / σ
 */
export function calculateZScore(
  rawScore: number,
  mean: number,
  stdDev: number
): number | null {
  if (stdDev === 0) {
    console.warn('NORM_003: Standard deviation is 0, cannot calculate Z-score')
    return null
  }

  const zScore = (rawScore - mean) / stdDev
  return Math.round(zScore * 100) / 100 // Round to 2 decimal places
}

// ===================================
// T-SCORE CALCULATION
// ===================================

/**
 * Calculate T-score from Z-score
 * Formula: T = 50 + (Z × 10)
 */
export function calculateTScore(zScore: number | null): number | null {
  if (zScore === null) return null

  const tScore = 50 + zScore * 10
  return Math.round(tScore * 100) / 100 // Round to 2 decimal places
}

// ===================================
// QUALITATIVE CLASSIFICATION
// ===================================

export type ClassificationScale = 'wechsler' | 'simplified'

/**
 * Classify performance based on percentile
 */
export function classifyPerformance(
  percentile: number,
  scale: ClassificationScale = 'simplified'
): string {
  if (scale === 'wechsler') {
    if (percentile <= 2) return 'Muito Inferior'
    if (percentile <= 8) return 'Inferior'
    if (percentile <= 24) return 'Média Inferior'
    if (percentile <= 74) return 'Médio'
    if (percentile <= 90) return 'Média Superior'
    if (percentile <= 97) return 'Superior'
    return 'Muito Superior'
  }

  // Simplified scale (default)
  if (percentile <= 5) return 'Muito Inferior'
  if (percentile <= 16) return 'Inferior'
  if (percentile <= 84) return 'Médio'
  if (percentile <= 95) return 'Superior'
  return 'Muito Superior'
}

/**
 * Get classification description
 */
export function getClassificationDescription(classificacao: string): string {
  const descriptions: Record<string, string> = {
    'Muito Inferior':
      'Desempenho significativamente abaixo da média esperada para a faixa etária e escolaridade.',
    Inferior: 'Desempenho abaixo da média esperada para a faixa etária e escolaridade.',
    'Média Inferior':
      'Desempenho na faixa inferior da média esperada para a faixa etária e escolaridade.',
    Médio: 'Desempenho dentro da média esperada para a faixa etária e escolaridade.',
    'Média Superior':
      'Desempenho na faixa superior da média esperada para a faixa etária e escolaridade.',
    Superior: 'Desempenho acima da média esperada para a faixa etária e escolaridade.',
    'Muito Superior':
      'Desempenho significativamente acima da média esperada para a faixa etária e escolaridade.',
  }

  return (
    descriptions[classificacao] ||
    'Classificação não disponível para esta faixa normativa.'
  )
}

// ===================================
// NORMATIVE BIN MATCHING
// ===================================

export interface PatientDemographics {
  idade: number
  escolaridade_anos: number
  sexo: string
}

/**
 * Find appropriate normative bin for patient
 */
export function findNormativeBin(
  patient: PatientDemographics,
  normativeBins: FaixaNormativa[]
): { bin: FaixaNormativa; exact: boolean } | null {
  if (!normativeBins || normativeBins.length === 0) {
    return null
  }

  // Try exact match first
  for (const bin of normativeBins) {
    const ageMatch =
      patient.idade >= bin.idade_min && patient.idade <= bin.idade_max

    const educationMatch =
      patient.escolaridade_anos >= bin.escolaridade_min &&
      patient.escolaridade_anos <= bin.escolaridade_max

    const sexMatch = !bin.sexo || bin.sexo === patient.sexo

    if (ageMatch && educationMatch && sexMatch) {
      return { bin, exact: true }
    }
  }

  // No exact match - find closest bin
  const closest = normativeBins.reduce((best, current) => {
    // Calculate age distance
    const bestAgeMid = (best.idade_min + best.idade_max) / 2
    const currentAgeMid = (current.idade_min + current.idade_max) / 2
    const bestAgeDiff = Math.abs(bestAgeMid - patient.idade)
    const currentAgeDiff = Math.abs(currentAgeMid - patient.idade)

    if (currentAgeDiff < bestAgeDiff) {
      return current
    }

    if (currentAgeDiff === bestAgeDiff) {
      // If age is same, compare education
      const bestEduMid = (best.escolaridade_min + best.escolaridade_max) / 2
      const currentEduMid = (current.escolaridade_min + current.escolaridade_max) / 2
      const bestEduDiff = Math.abs(bestEduMid - patient.escolaridade_anos)
      const currentEduDiff = Math.abs(currentEduMid - patient.escolaridade_anos)

      return currentEduDiff < bestEduDiff ? current : best
    }

    return best
  })

  return closest ? { bin: closest, exact: false } : null
}

/**
 * Format normative bin info for display
 */
export function formatBinInfo(bin: FaixaNormativa): {
  idade: string
  escolaridade: string
  sexo?: string
} {
  return {
    idade: `${bin.idade_min}-${bin.idade_max} anos`,
    escolaridade: `${bin.escolaridade_min}-${bin.escolaridade_max} anos`,
    sexo: bin.sexo,
  }
}

// ===================================
// COMPLETE NORMALIZATION PIPELINE
// ===================================

export interface NormalizationResult {
  tabela_utilizada: string
  faixa_aplicada: {
    idade: string
    escolaridade: string
    sexo?: string
  }
  exact_match: boolean
  percentil: number
  escore_z: number | null
  escore_t: number | null
  classificacao: string
  descricao: string
}

/**
 * Normalize raw score using demographic data
 */
export function normalizeScore(
  rawScore: number,
  patient: PatientDemographics,
  normativeBins: FaixaNormativa[],
  tableName: string,
  classificationScale: ClassificationScale = 'simplified'
): NormalizationResult | null {
  // Find appropriate bin
  const binMatch = findNormativeBin(patient, normativeBins)

  if (!binMatch) {
    console.warn('NORM_002: No normative bin found for patient demographics')
    return null
  }

  const { bin, exact } = binMatch

  // Calculate percentile
  const percentil = calculatePercentile(rawScore, bin.percentis)

  // Calculate Z-score and T-score
  const escore_z = calculateZScore(rawScore, bin.media, bin.desvio_padrao)
  const escore_t = calculateTScore(escore_z)

  // Classify performance
  const classificacao = classifyPerformance(percentil, classificationScale)

  // Get description
  const descricao = getClassificationDescription(classificacao)

  return {
    tabela_utilizada: tableName,
    faixa_aplicada: formatBinInfo(bin),
    exact_match: exact,
    percentil,
    escore_z,
    escore_t,
    classificacao,
    descricao,
  }
}

// ===================================
// VALIDATION HELPERS
// ===================================

/**
 * Validate percentile table structure
 */
export function validatePercentileTable(
  percentiles: Record<number, number>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const requiredPercentiles = [5, 10, 25, 50, 75, 90, 95]

  // Check all required percentiles exist
  for (const p of requiredPercentiles) {
    if (!(p in percentiles)) {
      errors.push(`Missing percentile P${p}`)
    }
  }

  // Check ascending order
  const values = requiredPercentiles.map((p) => percentiles[p]).filter((v) => v !== undefined)

  for (let i = 1; i < values.length; i++) {
    if (values[i] < values[i - 1]) {
      errors.push('Percentile values must be in ascending order')
      break
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if patient is within normative range
 */
export function isWithinNormativeRange(
  patient: PatientDemographics,
  normativeBins: FaixaNormativa[]
): boolean {
  const binMatch = findNormativeBin(patient, normativeBins)
  return binMatch?.exact || false
}
