/**
 * MCMI-IV Scoring Service
 *
 * Implements the complete scoring algorithm for the MCMI-IV psychological test:
 * 1. Calculate Raw Scores (PD) using weighted formulas
 * 2. Convert PD → BR (Base Rate) using lookup tables
 * 3. Convert BR → Percentile using lookup tables
 * 4. Apply interpretation ranges
 * 5. Generate clinical interpretations
 *
 * Based on Excel analysis with 677 formulas extracted
 */

export interface McmiAnswer {
  questionNumber: number
  answer: boolean // true = Verdadeiro, false = Falso
}

export interface ScaleScore {
  code: string
  name: string
  pd: number // Raw score (Puntuación Directa)
  br: number // Base Rate score
  percentile: number
  level: 'not_present' | 'at_risk' | 'clinical_pattern' | 'prominent'
  levelDescription: string
}

export interface ValidityResult {
  V: ScaleScore // Invalidez
  W: ScaleScore // Inconsistencia
  X: ScaleScore // Sinceridad
  Y: ScaleScore // Deseabilidade Social
  Z: ScaleScore // Devaluación
  isValid: boolean
  warnings: string[]
}

export interface McmiResults {
  validity: ValidityResult
  personalityPatterns: ScaleScore[] // 12 scales
  severePathology: ScaleScore[] // 3 scales
  clinicalSyndromes: ScaleScore[] // 10 scales
  grossmanFacets: ScaleScore[] // 24 facets
  significantResponses: {
    category: string
    itemsEndorsed: number
    level: 'low' | 'moderate' | 'high'
  }[]
  summary: {
    highestPersonality?: ScaleScore
    highestSevere?: ScaleScore
    highestClinical?: ScaleScore
    elevatedScales: ScaleScore[]
  }
}

export class McmiIVScoringService {
  private pdToBrTable: any
  private brToPercentileTable: any
  private grossmanPercentilesTable: any
  private scalesData: any
  // private _interpretations: any

  constructor(testTemplate: any) {
    // Extract conversion tables from test template
    this.pdToBrTable = testTemplate.regras_calculo.tabelas_conversao.pd_to_br
    this.brToPercentileTable = testTemplate.regras_calculo.tabelas_conversao.br_to_percentile
    this.grossmanPercentilesTable = testTemplate.regras_calculo.tabelas_conversao.grossman_percentiles
    this.scalesData = testTemplate.regras_calculo.escalas
    // this._interpretations = testTemplate.interpretacao.textos
  }

  /**
   * Main scoring method - calculates all scores from user answers
   */
  public calculateScores(answers: McmiAnswer[]): McmiResults {
    // Convert answers array to lookup map for easier access
    const answerMap = new Map<number, boolean>()
    answers.forEach(a => answerMap.set(a.questionNumber, a.answer))

    // 1. Calculate validity scales
    const validity = this.calculateValidityScales(answerMap)

    // 2. Calculate personality patterns
    const personalityPatterns = this.calculatePersonalityPatterns(answerMap)

    // 3. Calculate severe pathology
    const severePathology = this.calculateSeverePathology(answerMap)

    // 4. Calculate clinical syndromes
    const clinicalSyndromes = this.calculateClinicalSyndromes(answerMap)

    // 5. Calculate Grossman facets
    const grossmanFacets = this.calculateGrossmanFacets(answerMap)

    // 6. Calculate significant responses
    const significantResponses = this.calculateSignificantResponses(answerMap)

    // 7. Generate summary
    const summary = this.generateSummary(personalityPatterns, severePathology, clinicalSyndromes)

    return {
      validity,
      personalityPatterns,
      severePathology,
      clinicalSyndromes,
      grossmanFacets,
      significantResponses,
      summary
    }
  }

  /**
   * Calculate Validity Scales (V, W, X, Y, Z)
   */
  private calculateValidityScales(answerMap: Map<number, boolean>): ValidityResult {
    const scales = this.scalesData.validade

    const results: any = {}
    const warnings: string[] = []

    // Calculate each validity scale
    scales.forEach((scale: any) => {
      const pd = this.calculateScalePD(scale, answerMap)
      const br = this.convertPDtoBR(scale.code, pd)
      const percentile = this.convertBRtoPercentile(scale.code, br)
      const level = this.getBRLevel(br)

      results[scale.code] = {
        code: scale.code,
        name: scale.name.pt,
        pd,
        br,
        percentile,
        level: level.key,
        levelDescription: level.description
      }
    })

    // Validate test validity
    let isValid = true

    // V scale: 0-1 valid, 2+ questionable/invalid
    if (results.V.pd >= 2) {
      isValid = false
      warnings.push('Teste pode ser inválido - muitas respostas inconsistentes (Escala V)')
    }

    // W scale: 0-6 consistent, 7+ inconsistent
    if (results.W.pd >= 7) {
      isValid = false
      warnings.push('Respostas inconsistentes detectadas (Escala W)')
    }

    // X scale: 0-26 low candor, 27+ acceptable
    if (results.X.pd < 27) {
      warnings.push('Baixa franqueza/abertura nas respostas (Escala X)')
    }

    // Y scale: high scores may indicate defensive responding
    if (results.Y.br >= 78) {
      warnings.push('Possível desejabilidade social - paciente pode estar ocultando problemas (Escala Y)')
    }

    // Z scale: high scores indicate self-devaluation
    if (results.Z.br >= 37) {
      warnings.push('Alta autodesvalorização - paciente pode estar exagerando problemas (Escala Z)')
    }

    return {
      V: results.V,
      W: results.W,
      X: results.X,
      Y: results.Y,
      Z: results.Z,
      isValid,
      warnings
    }
  }

  /**
   * Calculate Personality Patterns (Scales 1, 2A, 2B, 3, 4A, 4B, 5, 6A, 6B, 7, 8A, 8B)
   */
  private calculatePersonalityPatterns(answerMap: Map<number, boolean>): ScaleScore[] {
    const scales = this.scalesData.personalidade
    return scales.map((scale: any) => this.calculateScale(scale, answerMap))
  }

  /**
   * Calculate Severe Pathology (Scales S, C, P)
   */
  private calculateSeverePathology(answerMap: Map<number, boolean>): ScaleScore[] {
    const scales = this.scalesData.patologia_grave
    return scales.map((scale: any) => this.calculateScale(scale, answerMap))
  }

  /**
   * Calculate Clinical Syndromes (Scales A, H, N, D, B, T, R, SS, CC, PP)
   */
  private calculateClinicalSyndromes(answerMap: Map<number, boolean>): ScaleScore[] {
    const scales = this.scalesData.sindromes_clinicas
    return scales.map((scale: any) => this.calculateScale(scale, answerMap))
  }

  /**
   * Calculate Grossman Facets (24 facets across 5 domains)
   */
  private calculateGrossmanFacets(answerMap: Map<number, boolean>): ScaleScore[] {
    const facets = this.scalesData.facetas_grossman
    return facets.map((facet: any) => this.calculateScale(facet, answerMap, true))
  }

  /**
   * Calculate a single scale score (generic method)
   */
  private calculateScale(scale: any, answerMap: Map<number, boolean>, isGrossmanFacet: boolean = false): ScaleScore {
    const pd = this.calculateScalePD(scale, answerMap)

    // For Grossman facets, use parent scale's PD→BR table
    let scaleCodeForConversion = scale.code
    if (isGrossmanFacet && scale.code) {
      // Extract parent scale (e.g., "2A.1" → "2A", "3.2" → "3")
      const match = scale.code.match(/^([0-9A-Z]+)\./)
      if (match) {
        scaleCodeForConversion = match[1]
      }
    }

    const br = this.convertPDtoBR(scaleCodeForConversion, pd)
    const percentile = isGrossmanFacet
      ? this.convertGrossmanBRtoPercentile(scale.code, br)
      : this.convertBRtoPercentile(scale.code, br)
    const level = this.getBRLevel(br)

    return {
      code: scale.code,
      name: scale.name.pt || scale.name,
      pd,
      br,
      percentile,
      level: level.key,
      levelDescription: level.description
    }
  }

  /**
   * Calculate Raw Score (PD) for a scale using weighted formula
   * Formula: PD = (2 × sum(weighted_items)) + sum(unweighted_items)
   */
  private calculateScalePD(scale: any, answerMap: Map<number, boolean>): number {
    let weightedSum = 0
    let unweightedSum = 0

    // Items weighted 2x
    if (scale.items_weighted) {
      scale.items_weighted.forEach((itemNum: number) => {
        const answer = answerMap.get(itemNum)
        if (answer === true) { // True = 1 point
          weightedSum += 1
        }
      })
    }

    // Items weighted 1x
    if (scale.items_unweighted) {
      scale.items_unweighted.forEach((itemNum: number) => {
        const answer = answerMap.get(itemNum)
        if (answer === true) { // True = 1 point
          unweightedSum += 1
        }
      })
    }

    return (2 * weightedSum) + unweightedSum
  }

  /**
   * Convert PD (Raw Score) to BR (Base Rate) using lookup table
   */
  private convertPDtoBR(scaleCode: string, pd: number): number {
    const scaleTable = this.pdToBrTable[scaleCode]
    if (!scaleTable) {
      console.warn(`No PD→BR table found for scale ${scaleCode}`)
      return 0
    }

    // Look up BR value for this PD
    const key = `pd_${Math.floor(pd)}`
    const br = scaleTable[key]

    if (br === undefined) {
      // PD out of range - use closest value
      const pdNum = Math.floor(pd)
      const availableKeys = Object.keys(scaleTable)
        .filter(k => k.startsWith('pd_'))
        .map(k => parseInt(k.replace('pd_', '')))
        .sort((a, b) => a - b)

      if (pdNum < availableKeys[0]) return scaleTable[`pd_${availableKeys[0]}`]
      if (pdNum > availableKeys[availableKeys.length - 1]) return scaleTable[`pd_${availableKeys[availableKeys.length - 1]}`]

      // Find closest
      const closest = availableKeys.reduce((prev, curr) =>
        Math.abs(curr - pdNum) < Math.abs(prev - pdNum) ? curr : prev
      )
      return scaleTable[`pd_${closest}`]
    }

    return br
  }

  /**
   * Convert BR (Base Rate) to Percentile using lookup table
   */
  private convertBRtoPercentile(scaleCode: string, br: number): number {
    const scaleTable = this.brToPercentileTable[scaleCode]
    if (!scaleTable) {
      console.warn(`No BR→Percentile table found for scale ${scaleCode}`)
      return 0
    }

    // Look up percentile for this BR
    const key = `br_${Math.floor(br)}`
    const percentile = scaleTable[key]

    if (percentile === undefined) {
      // BR out of range - use closest value
      const brNum = Math.floor(br)
      const availableKeys = Object.keys(scaleTable)
        .filter(k => k.startsWith('br_'))
        .map(k => parseInt(k.replace('br_', '')))
        .sort((a, b) => a - b)

      if (brNum < availableKeys[0]) return scaleTable[`br_${availableKeys[0]}`]
      if (brNum > availableKeys[availableKeys.length - 1]) return scaleTable[`br_${availableKeys[availableKeys.length - 1]}`]

      // Find closest
      const closest = availableKeys.reduce((prev, curr) =>
        Math.abs(curr - brNum) < Math.abs(prev - brNum) ? curr : prev
      )
      return scaleTable[`br_${closest}`]
    }

    return percentile
  }

  /**
   * Convert Grossman Facet BR to Percentile using Grossman-specific table
   */
  private convertGrossmanBRtoPercentile(facetCode: string, br: number): number {
    const facetTable = this.grossmanPercentilesTable[facetCode]
    if (!facetTable) {
      console.warn(`No Grossman percentile table found for facet ${facetCode}`)
      return 0
    }

    // Same logic as regular BR→Percentile conversion
    const key = `br_${Math.floor(br)}`
    const percentile = facetTable[key]

    if (percentile === undefined) {
      const brNum = Math.floor(br)
      const availableKeys = Object.keys(facetTable)
        .filter(k => k.startsWith('br_'))
        .map(k => parseInt(k.replace('br_', '')))
        .sort((a, b) => a - b)

      if (availableKeys.length === 0) return 0
      if (brNum < availableKeys[0]) return facetTable[`br_${availableKeys[0]}`]
      if (brNum > availableKeys[availableKeys.length - 1]) return facetTable[`br_${availableKeys[availableKeys.length - 1]}`]

      const closest = availableKeys.reduce((prev, curr) =>
        Math.abs(curr - brNum) < Math.abs(prev - brNum) ? curr : prev
      )
      return facetTable[`br_${closest}`]
    }

    return percentile
  }

  /**
   * Get interpretation level based on BR score
   */
  private getBRLevel(br: number): { key: 'not_present' | 'at_risk' | 'clinical_pattern' | 'prominent'; description: string } {
    if (br < 60) {
      return { key: 'not_present', description: 'Não Presente' }
    } else if (br < 75) {
      return { key: 'at_risk', description: 'Em Risco' }
    } else if (br < 85) {
      return { key: 'clinical_pattern', description: 'Padrão Clínico' }
    } else {
      return { key: 'prominent', description: 'Proeminente' }
    }
  }

  /**
   * Calculate Significant Responses (13 categories)
   */
  private calculateSignificantResponses(answerMap: Map<number, boolean>) {
    const categories = this.scalesData.respostas_significativas

    return categories.map((category: any) => {
      let itemsEndorsed = 0

      if (category.items) {
        category.items.forEach((itemNum: number) => {
          if (answerMap.get(itemNum) === true) {
            itemsEndorsed++
          }
        })
      }

      let level: 'low' | 'moderate' | 'high' = 'low'
      if (itemsEndorsed > 3) level = 'high'
      else if (itemsEndorsed >= 2) level = 'moderate'

      return {
        category: category.name.pt,
        itemsEndorsed,
        level
      }
    })
  }

  /**
   * Generate summary with highest scales
   */
  private generateSummary(
    personality: ScaleScore[],
    severe: ScaleScore[],
    clinical: ScaleScore[]
  ) {
    const highestPersonality = personality.reduce((max, scale) =>
      scale.br > max.br ? scale : max
      , personality[0])

    const highestSevere = severe.reduce((max, scale) =>
      scale.br > max.br ? scale : max
      , severe[0])

    const highestClinical = clinical.reduce((max, scale) =>
      scale.br > max.br ? scale : max
      , clinical[0])

    // Get all elevated scales (BR >= 75)
    const elevatedScales = [
      ...personality,
      ...severe,
      ...clinical
    ].filter(scale => scale.br >= 75)
      .sort((a, b) => b.br - a.br) // Sort by BR descending

    return {
      highestPersonality,
      highestSevere,
      highestClinical,
      elevatedScales
    }
  }
}
