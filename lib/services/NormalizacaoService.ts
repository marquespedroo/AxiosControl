import type { Result } from '../../types/core/result'
import type { TabelaNormativa, Paciente } from '../../types/database'

/**
 * NormalizacaoService - Critical service for test score normalization
 *
 * Implements algorithms from PRD Section 3.3:
 * - Raw score calculation
 * - Percentile calculation (linear interpolation)
 * - Z-score, T-score calculation
 * - Qualitative classification
 *
 * Pure functions, stateless, handles all edge cases
 */

interface RegraCalculo {
  tipo: 'soma_simples' | 'soma_ponderada' | 'secoes' | 'custom'
  questoes_incluidas?: number[]
  questoes_invertidas?: number[]
  valor_maximo_escala?: number
  questoes?: Array<{ numero: number; peso: number }>
  secoes?: Record<string, {
    questoes: number[]
    invertidas: number[]
    peso: number
  }>
  score_total?: string
  funcao_calculo?: string
}

interface Faixa {
  idade_min: number
  idade_max: number
  escolaridade_min: number
  escolaridade_max: number
  sexo?: string
  n: number
  media: number
  desvio_padrao: number
  percentis: {
    '5': number
    '10': number
    '25': number
    '50': number
    '75': number
    '90': number
    '95': number
  }
}

interface PontuacaoBruta {
  total: number
  secoes?: Record<string, number>
}

interface Normalizacao {
  tabela_utilizada: string
  faixa_aplicada: {
    idade: string
    escolaridade: string
    sexo?: string
  }
  percentil: number
  escore_z: number
  escore_t: number
  classificacao: string
  descricao: string
  fora_das_normas: boolean
}

export class NormalizacaoService {
  /**
   * Calculate raw score from test responses
   * PRD Section 3.2 - RF-006
   */
  calcularPontuacaoBruta(
    respostas: Record<string, any>,
    regrasCalculo: RegraCalculo
  ): Result<PontuacaoBruta, string> {
    try {
      switch (regrasCalculo.tipo) {
        case 'soma_simples':
          return this.calcularSomaSimples(respostas, regrasCalculo)

        case 'soma_ponderada':
          return this.calcularSomaPonderada(respostas, regrasCalculo)

        case 'secoes':
          return this.calcularPorSecoes(respostas, regrasCalculo)

        case 'custom':
          return this.calcularCustom(respostas, regrasCalculo)

        default:
          return { success: false, error: 'Tipo de cálculo inválido' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no cálculo'
      }
    }
  }

  /**
   * Simple sum with inverted questions support
   */
  private calcularSomaSimples(
    respostas: Record<string, any>,
    regras: RegraCalculo
  ): Result<PontuacaoBruta, string> {
    const questoes = regras.questoes_incluidas || []
    const invertidas = regras.questoes_invertidas || []
    const valorMax = regras.valor_maximo_escala || 4

    let total = 0

    for (const questaoNum of questoes) {
      const resposta = respostas[questaoNum.toString()]

      if (resposta === undefined || resposta === null) {
        return {
          success: false,
          error: `Questão ${questaoNum} não respondida`
        }
      }

      let valor = parseInt(resposta.toString())

      // Invert if needed
      if (invertidas.includes(questaoNum)) {
        valor = valorMax - valor
      }

      total += valor
    }

    return {
      success: true,
      data: { total }
    }
  }

  /**
   * Weighted sum calculation
   */
  private calcularSomaPonderada(
    respostas: Record<string, any>,
    regras: RegraCalculo
  ): Result<PontuacaoBruta, string> {
    const questoes = regras.questoes || []

    let total = 0

    for (const { numero, peso } of questoes) {
      const resposta = respostas[numero.toString()]

      if (resposta === undefined || resposta === null) {
        return {
          success: false,
          error: `Questão ${numero} não respondida`
        }
      }

      const valor = parseInt(resposta.toString())
      total += valor * peso
    }

    return {
      success: true,
      data: { total }
    }
  }

  /**
   * Section-based calculation
   */
  private calcularPorSecoes(
    respostas: Record<string, any>,
    regras: RegraCalculo
  ): Result<PontuacaoBruta, string> {
    const secoes = regras.secoes || {}
    const secaoScores: Record<string, number> = {}
    let total = 0

    for (const [secaoNome, secaoConfig] of Object.entries(secoes)) {
      let secaoTotal = 0

      for (const questaoNum of secaoConfig.questoes) {
        const resposta = respostas[questaoNum.toString()]

        if (resposta === undefined || resposta === null) {
          return {
            success: false,
            error: `Questão ${questaoNum} não respondida`
          }
        }

        let valor = parseInt(resposta.toString())

        // Invert if needed
        if (secaoConfig.invertidas.includes(questaoNum)) {
          const valorMax = 4 // Default, could be configurable
          valor = valorMax - valor
        }

        secaoTotal += valor
      }

      // Apply section weight
      secaoTotal *= secaoConfig.peso
      secaoScores[secaoNome] = secaoTotal
      total += secaoTotal
    }

    return {
      success: true,
      data: {
        total,
        secoes: secaoScores
      }
    }
  }

  /**
   * Custom calculation using JavaScript function
   * WARNING: Eval is dangerous - use with caution
   */
  private calcularCustom(
    respostas: Record<string, any>,
    regras: RegraCalculo
  ): Result<PontuacaoBruta, string> {
    if (!regras.funcao_calculo) {
      return {
        success: false,
        error: 'Função de cálculo não definida'
      }
    }

    try {
      // Create sandboxed function
      const calcFunc = new Function('respostas', regras.funcao_calculo)
      const result = calcFunc(respostas)

      return {
        success: true,
        data: { total: result }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erro na função de cálculo customizada'
      }
    }
  }

  /**
   * Find applicable normative range for patient
   * PRD Section 3.3 - RF-008
   */
  buscarFaixaNormativa(
    paciente: Pick<Paciente, 'data_nascimento' | 'escolaridade_anos' | 'sexo'>,
    tabelaNormativa: TabelaNormativa
  ): Result<Faixa & { fora_das_normas: boolean }, string> {
    try {
      // Calculate patient age
      const idade = this.calcularIdade(paciente.data_nascimento)
      const escolaridade = paciente.escolaridade_anos
      const sexo = paciente.sexo

      const faixas = tabelaNormativa.faixas as unknown as Faixa[]

      // Find exact match
      for (const faixa of faixas) {
        const idadeMatch = idade >= faixa.idade_min && idade <= faixa.idade_max
        const escolaridadeMatch = escolaridade >= faixa.escolaridade_min &&
          escolaridade <= faixa.escolaridade_max
        const sexoMatch = !faixa.sexo || faixa.sexo === sexo

        if (idadeMatch && escolaridadeMatch && sexoMatch) {
          return {
            success: true,
            data: { ...faixa, fora_das_normas: false }
          }
        }
      }

      // No exact match - find closest range
      const faixaMaisProxima = this.encontrarFaixaMaisProxima(
        idade,
        escolaridade,
        sexo,
        faixas
      )

      if (faixaMaisProxima) {
        return {
          success: true,
          data: { ...faixaMaisProxima, fora_das_normas: true }
        }
      }

      return {
        success: false,
        error: 'Nenhuma faixa normativa disponível para este paciente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao buscar faixa normativa'
      }
    }
  }

  /**
   * Calculate age from birth date
   */
  private calcularIdade(dataNascimento: string): number {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }

    return idade
  }

  /**
   * Find closest normative range when patient is out of norms
   */
  private encontrarFaixaMaisProxima(
    idade: number,
    escolaridade: number,
    sexo: string | null,
    faixas: Faixa[]
  ): Faixa | null {
    let melhorFaixa: Faixa | null = null
    let menorDistancia = Infinity

    for (const faixa of faixas) {
      // Skip if sex doesn't match (when specified)
      if (faixa.sexo && sexo && faixa.sexo !== sexo) continue

      // Calculate distance (Manhattan distance)
      let distancia = 0

      // Age distance
      if (idade < faixa.idade_min) {
        distancia += faixa.idade_min - idade
      } else if (idade > faixa.idade_max) {
        distancia += idade - faixa.idade_max
      }

      // Education distance
      if (escolaridade < faixa.escolaridade_min) {
        distancia += faixa.escolaridade_min - escolaridade
      } else if (escolaridade > faixa.escolaridade_max) {
        distancia += escolaridade - faixa.escolaridade_max
      }

      if (distancia < menorDistancia) {
        menorDistancia = distancia
        melhorFaixa = faixa
      }
    }

    return melhorFaixa
  }

  /**
   * Calculate percentile using linear interpolation
   * PRD Section 3.3 - RF-008
   */
  calcularPercentil(pontuacaoBruta: number, faixa: Faixa): number {
    const percentis = faixa.percentis

    // Below P5
    if (pontuacaoBruta <= percentis['5']) {
      return 5
    }

    // Above P95
    if (pontuacaoBruta >= percentis['95']) {
      return 95
    }

    // Linear interpolation between adjacent percentiles
    const pontosPercentil: [number, number][] = [
      [5, percentis['5']],
      [10, percentis['10']],
      [25, percentis['25']],
      [50, percentis['50']],
      [75, percentis['75']],
      [90, percentis['90']],
      [95, percentis['95']]
    ]

    for (let i = 1; i < pontosPercentil.length; i++) {
      const [pBaixo, scoreBaixo] = pontosPercentil[i - 1]
      const [pAlto, scoreAlto] = pontosPercentil[i]

      if (pontuacaoBruta >= scoreBaixo && pontuacaoBruta <= scoreAlto) {
        // Linear interpolation formula
        const percentil = pBaixo + (pAlto - pBaixo) *
          (pontuacaoBruta - scoreBaixo) / (scoreAlto - scoreBaixo)
        return Math.round(percentil)
      }
    }

    // Fallback (should not reach here)
    return 50
  }

  /**
   * Calculate Z-score
   * PRD Section 3.3 - RF-008
   */
  calcularEscoreZ(pontuacaoBruta: number, faixa: Faixa): number {
    if (faixa.desvio_padrao === 0) {
      return 0
    }

    const escoreZ = (pontuacaoBruta - faixa.media) / faixa.desvio_padrao
    return Math.round(escoreZ * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Calculate T-score
   * PRD Section 3.3 - RF-008
   */
  calcularEscoreT(escoreZ: number): number {
    const escoreT = 50 + (escoreZ * 10)
    return Math.round(escoreT)
  }

  /**
   * Qualitative classification from percentile
   * PRD Section 3.3 - RF-008
   */
  classificar(percentil: number): string {
    if (percentil <= 5) return 'Muito Inferior'
    if (percentil <= 16) return 'Inferior'
    if (percentil <= 84) return 'Médio'
    if (percentil <= 95) return 'Superior'
    return 'Muito Superior'
  }

  /**
   * Generate description for classification
   */
  private gerarDescricao(
    classificacao: string,
    fora_das_normas: boolean
  ): string {
    let base = ''

    switch (classificacao) {
      case 'Muito Inferior':
        base = 'Desempenho significativamente abaixo da média esperada'
        break
      case 'Inferior':
        base = 'Desempenho abaixo da média esperada'
        break
      case 'Médio':
        base = 'Desempenho dentro da média esperada'
        break
      case 'Superior':
        base = 'Desempenho acima da média esperada'
        break
      case 'Muito Superior':
        base = 'Desempenho significativamente acima da média esperada'
        break
      default:
        base = 'Classificação não disponível'
    }

    if (fora_das_normas) {
      base += ' (resultado baseado em extrapolação de normas)'
    }

    return base + ' para a faixa etária e escolaridade.'
  }

  /**
   * Main normalization pipeline
   * Orchestrates all normalization steps
   */
  normalizar(
    pontuacaoBruta: PontuacaoBruta,
    paciente: Pick<Paciente, 'data_nascimento' | 'escolaridade_anos' | 'sexo'>,
    tabelaNormativa: TabelaNormativa
  ): Result<Normalizacao, string> {
    try {
      // 1. Find normative range
      const faixaResult = this.buscarFaixaNormativa(paciente, tabelaNormativa)

      if (!faixaResult.success) {
        return {
          success: false,
          error: faixaResult.error
        }
      }

      const faixa = faixaResult.data

      // 2. Calculate metrics
      const percentil = this.calcularPercentil(pontuacaoBruta.total, faixa)
      const escoreZ = this.calcularEscoreZ(pontuacaoBruta.total, faixa)
      const escoreT = this.calcularEscoreT(escoreZ)
      const classificacao = this.classificar(percentil)

      // 3. Build normalization result
      const normalizacao: Normalizacao = {
        tabela_utilizada: tabelaNormativa.nome,
        faixa_aplicada: {
          idade: `${faixa.idade_min}-${faixa.idade_max} anos`,
          escolaridade: `${faixa.escolaridade_min}-${faixa.escolaridade_max} anos`,
          ...(faixa.sexo && { sexo: faixa.sexo })
        },
        percentil,
        escore_z: escoreZ,
        escore_t: escoreT,
        classificacao,
        descricao: this.gerarDescricao(classificacao, faixa.fora_das_normas),
        fora_das_normas: faixa.fora_das_normas
      }

      return {
        success: true,
        data: normalizacao
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erro no processo de normatização'
      }
    }
  }
}
