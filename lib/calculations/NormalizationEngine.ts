import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import type {
  TabelaNormativa,
  FaixaNormativa,
  Normalizacao,
  Paciente,
  PontuacaoBruta,
} from '@/types/database'

/**
 * Normalization Engine
 * Converts raw scores to normalized scores using normative tables
 */
export class NormalizationEngine {
  /**
   * Find appropriate normative range for a patient
   */
  static findNormativeRange(
    tabela: TabelaNormativa,
    paciente: Paciente
  ): Result<FaixaNormativa, AppError> {
    const idade = this.calculateAge(paciente.data_nascimento)
    const escolaridade = paciente.escolaridade_anos
    const sexo = paciente.sexo

    // Find exact match first
    let faixaEncontrada = tabela.faixas.find((faixa) => {
      const idadeMatch = idade >= faixa.idade_min && idade <= faixa.idade_max
      const escolaridadeMatch =
        escolaridade >= faixa.escolaridade_min && escolaridade <= faixa.escolaridade_max
      const sexoMatch = !faixa.sexo || faixa.sexo === sexo

      return idadeMatch && escolaridadeMatch && sexoMatch
    })

    if (faixaEncontrada) {
      return success(faixaEncontrada)
    }

    // Try without sex filter
    faixaEncontrada = tabela.faixas.find((faixa) => {
      const idadeMatch = idade >= faixa.idade_min && idade <= faixa.idade_max
      const escolaridadeMatch =
        escolaridade >= faixa.escolaridade_min && escolaridade <= faixa.escolaridade_max

      return idadeMatch && escolaridadeMatch
    })

    if (faixaEncontrada) {
      return success(faixaEncontrada)
    }

    // No suitable range found
    return failure(
      new AppError(
        'NORM_001',
        `Faixa normativa não encontrada para idade=${idade}, escolaridade=${escolaridade}, sexo=${sexo}`,
        404
      )
    )
  }

  /**
   * Calculate patient age from birth date
   */
  private static calculateAge(dataNascimento: string): number {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mesAniversario = nascimento.getMonth()

    if (
      hoje.getMonth() < mesAniversario ||
      (hoje.getMonth() === mesAniversario && hoje.getDate() < nascimento.getDate())
    ) {
      idade--
    }

    return idade
  }

  /**
   * Calculate percentile from raw score
   */
  static calculatePercentile(
    pontuacaoBruta: number,
    faixa: FaixaNormativa
  ): Result<number, AppError> {
    const percentis = faixa.percentis

    // Check if score matches a percentile exactly
    for (const [percentil, valor] of Object.entries(percentis)) {
      if (pontuacaoBruta === valor) {
        return success(parseInt(percentil))
      }
    }

    // Interpolate between percentiles
    const percentilKeys = Object.keys(percentis)
      .map((k) => parseInt(k))
      .sort((a, b) => a - b)

    for (let i = 0; i < percentilKeys.length - 1; i++) {
      const p1 = percentilKeys[i]
      const p2 = percentilKeys[i + 1]
      const v1 = percentis[p1 as keyof typeof percentis]
      const v2 = percentis[p2 as keyof typeof percentis]

      if (pontuacaoBruta >= v1 && pontuacaoBruta <= v2) {
        // Linear interpolation
        const percentil = p1 + ((pontuacaoBruta - v1) / (v2 - v1)) * (p2 - p1)
        return success(Math.round(percentil))
      }
    }

    // Score is below 5th percentile
    if (pontuacaoBruta < percentis[5]) {
      return success(Math.min(5, Math.round((pontuacaoBruta / percentis[5]) * 5)))
    }

    // Score is above 95th percentile
    if (pontuacaoBruta > percentis[95]) {
      return success(
        Math.max(95, Math.min(99, 95 + Math.round(((pontuacaoBruta - percentis[95]) / percentis[95]) * 4)))
      )
    }

    return failure(
      new AppError('NORM_002', 'Não foi possível calcular percentil', 500)
    )
  }

  /**
   * Calculate Z-score (standard score)
   */
  static calculateZScore(pontuacaoBruta: number, faixa: FaixaNormativa): number {
    return (pontuacaoBruta - faixa.media) / faixa.desvio_padrao
  }

  /**
   * Calculate T-score (normalized score with mean=50, SD=10)
   */
  static calculateTScore(zScore: number): number {
    return 50 + zScore * 10
  }

  /**
   * Get classification based on percentile
   */
  static getClassification(percentil: number): {
    classificacao: string
    descricao: string
  } {
    if (percentil < 5) {
      return {
        classificacao: 'Muito Baixo',
        descricao: 'Desempenho significativamente abaixo da média',
      }
    } else if (percentil < 25) {
      return {
        classificacao: 'Baixo',
        descricao: 'Desempenho abaixo da média',
      }
    } else if (percentil < 75) {
      return {
        classificacao: 'Médio',
        descricao: 'Desempenho na média esperada',
      }
    } else if (percentil < 95) {
      return {
        classificacao: 'Alto',
        descricao: 'Desempenho acima da média',
      }
    } else {
      return {
        classificacao: 'Muito Alto',
        descricao: 'Desempenho significativamente acima da média',
      }
    }
  }

  /**
   * Normalize raw score
   */
  static normalize(
    pontuacao: PontuacaoBruta,
    tabela: TabelaNormativa,
    paciente: Paciente
  ): Result<Normalizacao, AppError> {
    // Find appropriate normative range
    const faixaResult = this.findNormativeRange(tabela, paciente)
    if (!faixaResult.success) {
      return failure(faixaResult.error)
    }

    const faixa = faixaResult.data

    // Calculate percentile
    const percentilResult = this.calculatePercentile(pontuacao.total, faixa)
    if (!percentilResult.success) {
      return failure(percentilResult.error)
    }

    const percentil = percentilResult.data

    // Calculate Z-score and T-score
    const escoreZ = this.calculateZScore(pontuacao.total, faixa)
    const escoreT = this.calculateTScore(escoreZ)

    // Get classification
    const { classificacao, descricao } = this.getClassification(percentil)

    const normalizacao: Normalizacao = {
      tabela_utilizada: tabela.nome,
      faixa_aplicada: {
        idade: `${faixa.idade_min}-${faixa.idade_max} anos`,
        escolaridade: `${faixa.escolaridade_min}-${faixa.escolaridade_max} anos`,
        sexo: faixa.sexo,
      },
      exact_match: true,
      percentil,
      escore_z: Math.round(escoreZ * 100) / 100,
      escore_t: Math.round(escoreT * 100) / 100,
      classificacao,
      descricao,
    }

    return success(normalizacao)
  }
}
