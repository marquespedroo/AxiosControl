import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import type { Questao, Respostas, PontuacaoBruta, RegrasCalculoSecoes } from '@/types/database'

import { ICalculationStrategy } from '../interfaces/ICalculationStrategy'


/**
 * Section-based calculation strategy
 * Calculates scores for each section/subscale separately
 */
export class SecoesStrategy implements ICalculationStrategy {
  constructor(private regras: RegrasCalculoSecoes) { }

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
      const secoes: Record<string, number> = {}
      let totalGeral = 0

      // Calculate score for each section
      for (const [nomeSecao, configSecao] of Object.entries(this.regras.secoes)) {
        let totalSecao = 0

        // Process questions in this section
        for (const numeroQuestao of configSecao.questoes) {
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

          // Check if question is inverted in this section
          if (configSecao.invertidas.includes(numeroQuestao)) {
            const questao = questoes.find((q) => q.numero === numeroQuestao)
            if (questao?.escala_opcoes) {
              const maxValor = Math.max(...questao.escala_opcoes.map((o) => o.valor))
              valor = maxValor - valor
            }
          }

          totalSecao += valor
        }

        // Apply section weight
        const pontuacaoSecao = totalSecao * configSecao.peso
        secoes[nomeSecao] = pontuacaoSecao

        // Add to general total based on score_total rule
        if (this.regras.score_total === 'soma_secoes') {
          totalGeral += pontuacaoSecao
        }
      }

      return success({
        total: totalGeral,
        secoes,
      })
    } catch (error) {
      return failure(
        new AppError('CALC_003', 'Erro ao calcular pontuação por seções', 500, { cause: error })
      )
    }
  }
}
