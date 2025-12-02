/**
 * Calculations barrel export
 * Centralizes all calculation-related modules
 */

export { CalculationEngine } from './CalculationEngine'
export { NormalizationEngine } from './NormalizationEngine'
export { InterpretationEngine } from './InterpretationEngine'
export type { InterpretationRule } from './InterpretationEngine'

export type { ICalculationStrategy } from './interfaces/ICalculationStrategy'
export type { CalculationContext } from './interfaces/ICalculationStrategy'

export { SomaSimplesStrategy } from './strategies/SomaSimplesStrategy'
export { SomaPonderadaStrategy } from './strategies/SomaPonderadaStrategy'
export { SecoesStrategy } from './strategies/SecoesStrategy'
