import { Result } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import type { Questao, Respostas, PontuacaoBruta } from '@/types/database'

/**
 * Base interface for calculation strategies
 * Each test type implements its own calculation logic
 */
export interface ICalculationStrategy {
  /**
   * Calculate raw score from answers
   */
  calculate(
    respostas: Respostas,
    questoes: Questao[]
  ): Result<PontuacaoBruta, AppError>

  /**
   * Validate that all required questions are answered
   */
  validate(respostas: Respostas, questoes: Questao[]): Result<void, AppError>
}

/**
 * Context for calculation strategies
 * Provides additional data needed for calculations
 */
export interface CalculationContext {
  questoes: Questao[]
  respostas: Respostas
  regras_calculo: any
}
