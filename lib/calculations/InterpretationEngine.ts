import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import type { Normalizacao, PontuacaoBruta } from '@/types/database'

/**
 * Interpretation rule interface
 */
export interface InterpretationRule {
  condicao: {
    percentil_min?: number
    percentil_max?: number
    escore_z_min?: number
    escore_z_max?: number
    pontuacao_min?: number
    pontuacao_max?: number
    secao?: string
  }
  interpretacao: string
  recomendacoes?: string[]
  nivel_alerta?: 'baixo' | 'moderado' | 'alto' | 'critico'
}

/**
 * Interpretation Engine
 * Generates clinical interpretations based on test results
 */
export class InterpretationEngine {
  /**
   * Check if normalization matches a rule condition
   */
  private static matchesCondition(
    condicao: InterpretationRule['condicao'],
    normalizacao: Normalizacao,
    pontuacao?: PontuacaoBruta
  ): boolean {
    // Check percentile range
    if (condicao.percentil_min !== undefined && normalizacao.percentil < condicao.percentil_min) {
      return false
    }
    if (condicao.percentil_max !== undefined && normalizacao.percentil > condicao.percentil_max) {
      return false
    }

    // Check Z-score range
    if (
      condicao.escore_z_min !== undefined &&
      normalizacao.escore_z !== null &&
      normalizacao.escore_z < condicao.escore_z_min
    ) {
      return false
    }
    if (
      condicao.escore_z_max !== undefined &&
      normalizacao.escore_z !== null &&
      normalizacao.escore_z > condicao.escore_z_max
    ) {
      return false
    }

    // Check raw score range
    if (pontuacao) {
      if (condicao.pontuacao_min !== undefined && pontuacao.total < condicao.pontuacao_min) {
        return false
      }
      if (condicao.pontuacao_max !== undefined && pontuacao.total > condicao.pontuacao_max) {
        return false
      }

      // Check section scores
      if (condicao.secao && pontuacao.secoes) {
        const secaoScore = pontuacao.secoes[condicao.secao]
        if (secaoScore === undefined) {
          return false
        }
        if (condicao.pontuacao_min !== undefined && secaoScore < condicao.pontuacao_min) {
          return false
        }
        if (condicao.pontuacao_max !== undefined && secaoScore > condicao.pontuacao_max) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Generate interpretation from rules
   */
  static interpret(
    regras: InterpretationRule[],
    normalizacao: Normalizacao,
    pontuacao?: PontuacaoBruta
  ): Result<string, AppError> {
    if (!regras || regras.length === 0) {
      return failure(
        new AppError('INTERP_001', 'Nenhuma regra de interpretação definida', 404)
      )
    }

    // Find matching rules
    const regraEncontrada = regras.find((regra) =>
      this.matchesCondition(regra.condicao, normalizacao, pontuacao)
    )

    if (!regraEncontrada) {
      // Generate default interpretation based on classification
      const interpretacao = this.generateDefaultInterpretation(normalizacao)
      return success(interpretacao)
    }

    // Build interpretation text
    let texto = regraEncontrada.interpretacao

    // Add recommendations if present
    if (regraEncontrada.recomendacoes && regraEncontrada.recomendacoes.length > 0) {
      texto += '\n\n**Recomendações:**\n'
      texto += regraEncontrada.recomendacoes.map((rec) => `- ${rec}`).join('\n')
    }

    // Add alert level if critical
    if (regraEncontrada.nivel_alerta === 'critico') {
      texto = `⚠️ **ATENÇÃO:** ${texto}`
    } else if (regraEncontrada.nivel_alerta === 'alto') {
      texto = `⚡ **IMPORTANTE:** ${texto}`
    }

    return success(texto)
  }

  /**
   * Generate default interpretation based on normalization
   */
  private static generateDefaultInterpretation(normalizacao: Normalizacao): string {
    const { classificacao, descricao, percentil, escore_z } = normalizacao

    let texto = `**Classificação:** ${classificacao}\n\n`
    texto += `${descricao}\n\n`
    texto += `**Percentil:** ${percentil} (${this.percentilDescription(percentil)})\n\n`

    if (escore_z !== null) {
      texto += `**Escore Z:** ${escore_z.toFixed(2)} (desvios-padrão da média)\n\n`
    }

    texto += this.generateGeneralRecommendations(percentil)

    return texto
  }

  /**
   * Get percentile description
   */
  private static percentilDescription(percentil: number): string {
    if (percentil < 5) {
      return 'abaixo de 95% da população'
    } else if (percentil < 25) {
      return 'abaixo de 75% da população'
    } else if (percentil === 50) {
      return 'na mediana da população'
    } else if (percentil < 75) {
      return 'acima de 25% da população'
    } else if (percentil < 95) {
      return 'acima de 75% da população'
    } else {
      return 'acima de 95% da população'
    }
  }

  /**
   * Generate general recommendations based on percentile
   */
  private static generateGeneralRecommendations(percentil: number): string {
    if (percentil < 5) {
      return '**Recomendação:** Avaliação mais detalhada recomendada. Considere investigação adicional e possíveis intervenções.'
    } else if (percentil < 25) {
      return '**Recomendação:** Monitoramento recomendado. Considere avaliações complementares se houver outros indicadores clínicos.'
    } else if (percentil >= 25 && percentil <= 75) {
      return '**Recomendação:** Desempenho dentro do esperado. Continue acompanhamento regular.'
    } else if (percentil < 95) {
      return '**Recomendação:** Desempenho acima da média. Considere potencialidades a serem desenvolvidas.'
    } else {
      return '**Recomendação:** Desempenho superior. Considere enriquecimento e desenvolvimento de habilidades avançadas.'
    }
  }

  /**
   * Generate section-based interpretation
   */
  static interpretSections(
    regras: InterpretationRule[],
    pontuacao: PontuacaoBruta,
    normalizacao: Normalizacao
  ): Result<Record<string, string>, AppError> {
    if (!pontuacao.secoes) {
      return failure(
        new AppError('INTERP_002', 'Teste não possui seções para interpretação', 400)
      )
    }

    const interpretacoes: Record<string, string> = {}

    // Interpret each section
    for (const [nomeSecao, pontuacaoSecao] of Object.entries(pontuacao.secoes)) {
      // Find rules for this section
      const regrasSecao = regras.filter((r) => r.condicao.secao === nomeSecao)

      if (regrasSecao.length === 0) {
        interpretacoes[nomeSecao] = `Pontuação: ${pontuacaoSecao}`
        continue
      }

      // Find matching rule
      const regraEncontrada = regrasSecao.find((regra) =>
        this.matchesCondition(
          regra.condicao,
          normalizacao,
          { total: pontuacaoSecao, secoes: { [nomeSecao]: pontuacaoSecao } }
        )
      )

      interpretacoes[nomeSecao] = regraEncontrada
        ? regraEncontrada.interpretacao
        : `Pontuação: ${pontuacaoSecao}`
    }

    return success(interpretacoes)
  }
}
