import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import type { Questao, Respostas, PontuacaoBruta, RegrasCalculoPonderada } from '@/types/database'

import { ICalculationStrategy } from '../interfaces/ICalculationStrategy'


/**
 * Weighted sum calculation strategy
 * Used for tests where questions have different weights
 */
export class SomaPonderadaStrategy implements ICalculationStrategy {
  constructor(private regras: RegrasCalculoPonderada) { }

  validate(respostas: Respostas, questoes: Questao[]): Result<void, AppError> {
    const obrigatorias = questoes.filter((q) => q.obrigatoria)

    for (const questao of obrigatorias) {
      if (respostas[questao.numero] === undefined || respostas[questao.numero] === null) {
        return failure(
          new AppError(
            'CALC_001',
            `Questão obrigatória não respondida: ${questao.numero}`,
            400
          )
        )
      }
    }

    return success(undefined)
  }

  calculate(respostas: Respostas, questoes: Questao[]): Result<PontuacaoBruta, AppError> {
    // Validate first
    const validationResult = this.validate(respostas, questoes)
    if (!validationResult.success) {
      return failure(validationResult.error)
    }

    try {
      let total = 0

      // Process each question with its weight
      for (const config of this.regras.questoes) {
        const resposta = respostas[config.numero]

        if (resposta === undefined || resposta === null) {
          continue // Skip unanswered optional questions
        }

        const valor = typeof resposta === 'number' ? resposta : parseFloat(resposta as string)

        if (isNaN(valor)) {
          return failure(
            new AppError(
              'CALC_002',
              `Resposta inválida para questão ${config.numero}: ${resposta}`,
              400
            )
          )
        }

        // Apply weight
        total += valor * config.peso
      }

      return success({ total })
    } catch (error) {
      return failure(
        new AppError('CALC_003', 'Erro ao calcular pontuação ponderada', 500, { cause: error })
      )
    }
  }
}
