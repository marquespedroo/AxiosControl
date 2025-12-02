import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import type { Questao, Respostas, PontuacaoBruta, RegrasCalculoSimples } from '@/types/database'

import { ICalculationStrategy } from '../interfaces/ICalculationStrategy'


/**
 * Simple sum calculation strategy
 * Used for tests with straightforward scoring (sum of all responses)
 */
export class SomaSimplesStrategy implements ICalculationStrategy {
  constructor(private regras: RegrasCalculoSimples) { }

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

      // Process each included question
      for (const numeroQuestao of this.regras.questoes_incluidas) {
        const resposta = respostas[numeroQuestao]

        if (resposta === undefined || resposta === null) {
          continue // Skip unanswered optional questions
        }

        let valor = typeof resposta === 'number' ? resposta : parseFloat(resposta as string)

        if (isNaN(valor)) {
          return failure(
            new AppError(
              'CALC_002',
              `Resposta inválida para questão ${numeroQuestao}: ${resposta}`,
              400
            )
          )
        }

        // Check if question is inverted
        if (this.regras.questoes_invertidas.includes(numeroQuestao)) {
          valor = this.regras.valor_maximo_escala - valor
        }

        total += valor
      }

      return success({ total })
    } catch (error) {
      return failure(
        new AppError('CALC_003', 'Erro ao calcular pontuação', 500, { cause: error })
      )
    }
  }
}
