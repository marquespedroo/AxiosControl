// Main calculation engine exports

export {
  calculateSimpleSum,
  calculateWeightedSum,
  calculateSectionScores,
  calculateRawScore,
  validateResponses,
  getMaxScaleValue,
  isValidResponse,
} from './calculator'

export {
  calculatePercentile,
  calculateZScore,
  calculateTScore,
  classifyPerformance,
  getClassificationDescription,
  findNormativeBin,
  formatBinInfo,
  normalizeScore,
  validatePercentileTable,
  isWithinNormativeRange,
  type ClassificationScale,
  type PatientDemographics,
  type NormalizationResult,
} from './normalization'

// Re-export types
export type {
  PontuacaoBruta,
  Normalizacao,
  Interpretacao,
  CalculationResult,
} from '@/types/database'
