import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import type { RegrasCalculo, Questao, Respostas, PontuacaoBruta } from '@/types/database'

import { ICalculationStrategy } from './interfaces/ICalculationStrategy'
import { SecoesStrategy } from './strategies/SecoesStrategy'
import { SomaPonderadaStrategy } from './strategies/SomaPonderadaStrategy'
import { SomaSimplesStrategy } from './strategies/SomaSimplesStrategy'


/**
 * Calculation Engine
 * Factory for creating appropriate calculation strategies
 */
export class CalculationEngine {
  /**
   * Create calculation strategy based on test rules
   */
  static createStrategy(regras: RegrasCalculo): Result<ICalculationStrategy, AppError> {
    switch (regras.tipo) {
      case 'soma_simples':
        return success(new SomaSimplesStrategy(regras))

      case 'soma_ponderada':
        return success(new SomaPonderadaStrategy(regras))

      case 'secoes':
        return success(new SecoesStrategy(regras))

      case 'custom':
        return failure(
          new AppError(
            'CALC_004',
            'Cálculo customizado não implementado. Use registro manual.',
            501
          )
        )

      default:
        return failure(
          new AppError('CALC_005', `Tipo de cálculo desconhecido: ${(regras as any).tipo}`, 400)
        )
    }
  }

  /**
   * Calculate raw score using appropriate strategy
   */
  static calculate(
    regras: RegrasCalculo,
    respostas: Respostas,
    questoes: Questao[]
  ): Result<PontuacaoBruta, AppError> {
    const strategyResult = this.createStrategy(regras)

    if (!strategyResult.success) {
      return failure(strategyResult.error)
    }

    const strategy = strategyResult.data
    return strategy.calculate(respostas, questoes)
  }

  /**
   * Validate answers before calculation
   */
  static validate(
    regras: RegrasCalculo,
    respostas: Respostas,
    questoes: Questao[]
  ): Result<void, AppError> {
    const strategyResult = this.createStrategy(regras)

    if (!strategyResult.success) {
      return failure(strategyResult.error)
    }

    const strategy = strategyResult.data
    return strategy.validate(respostas, questoes)
  }
}
