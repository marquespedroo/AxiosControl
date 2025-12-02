import { SupabaseClient } from '@supabase/supabase-js'

import { CalculationEngine } from '@/lib/calculations/CalculationEngine'
import { InterpretationEngine, InterpretationRule } from '@/lib/calculations/InterpretationEngine'
import { NormalizationEngine } from '@/lib/calculations/NormalizationEngine'
import { AppError } from '@/lib/errors/AppError'
import { TesteAplicadoRepository } from '@/lib/repositories/TesteAplicadoRepository'
import { Result, success, failure } from '@/types/core/result'
import type {
  TesteAplicado,
  TesteTemplate,
  TabelaNormativa,
  Paciente,
  // Respostas,
  PontuacaoBruta,
  Normalizacao,
} from '@/types/database'
import { Database } from '@/types/database.generated'

/**
 * Test Results Service
 * Orchestrates calculation, normalization, and interpretation
 */
export class TestResultsService {
  private repository: TesteAplicadoRepository

  constructor(private supabase: SupabaseClient<Database>) {
    this.repository = new TesteAplicadoRepository(supabase)
  }

  /**
   * Process test results (calculate, normalize, interpret)
   */
  async processResults(
    testeAplicadoId: string
  ): Promise<
    Result<
      {
        pontuacao: PontuacaoBruta
        normalizacao: Normalizacao
        interpretacao: string
      },
      AppError
    >
  > {
    // Get test with full details
    const testeResult = await this.getTesteWithDetails(testeAplicadoId)
    if (!testeResult.success) {
      return failure(testeResult.error)
    }

    const {
      teste_aplicado,
      teste_template,
      paciente,
      tabela_normativa,
    } = testeResult.data

    // Step 1: Calculate raw score
    const pontuacaoResult = CalculationEngine.calculate(
      teste_template.regras_calculo,
      teste_aplicado.respostas || {},
      teste_template.questoes
    )

    if (!pontuacaoResult.success) {
      return failure(pontuacaoResult.error)
    }

    const pontuacao = pontuacaoResult.data

    // Step 2: Normalize score (if normative table available)
    let normalizacao: Normalizacao

    if (tabela_normativa) {
      const normalizacaoResult = NormalizationEngine.normalize(
        pontuacao,
        tabela_normativa,
        paciente
      )

      if (!normalizacaoResult.success) {
        return failure(normalizacaoResult.error)
      }

      normalizacao = normalizacaoResult.data
    } else {
      // No normative table - create basic normalization
      normalizacao = {
        tabela_utilizada: 'Sem normatização',
        faixa_aplicada: {
          idade: 'N/A',
          escolaridade: 'N/A',
        },
        exact_match: false,
        percentil: 0,
        escore_z: null,
        escore_t: null,
        classificacao: 'Sem classificação',
        descricao: 'Pontuação bruta apenas (sem normas disponíveis)',
      }
    }

    // Step 3: Generate interpretation
    const interpretacaoResult = InterpretationEngine.interpret(
      teste_template.interpretacao as InterpretationRule[],
      normalizacao,
      pontuacao
    )

    if (!interpretacaoResult.success) {
      return failure(interpretacaoResult.error)
    }

    const interpretacao = interpretacaoResult.data

    return success({
      pontuacao,
      normalizacao,
      interpretacao,
    })
  }

  /**
   * Finalize test with calculated results
   */
  async finalizeTest(
    testeAplicadoId: string
  ): Promise<Result<TesteAplicado, AppError>> {
    // Process results
    const resultsResult = await this.processResults(testeAplicadoId)
    if (!resultsResult.success) {
      return failure(resultsResult.error)
    }

    const { pontuacao, normalizacao, interpretacao } = resultsResult.data

    // Save to database
    const finalizeResult = await this.repository.finalize(testeAplicadoId, {
      pontuacao_bruta: pontuacao.total,
      normalizacao: normalizacao as any,
      interpretacao,
      status: 'finalizado',
    })

    return finalizeResult
  }

  /**
   * Get test with all required details
   */
  private async getTesteWithDetails(
    testeAplicadoId: string
  ): Promise<
    Result<
      {
        teste_aplicado: TesteAplicado
        teste_template: TesteTemplate
        paciente: Paciente
        tabela_normativa: TabelaNormativa | null
      },
      AppError
    >
  > {
    try {
      // Get test with relations
      const { data: testeData, error: testeError } = await this.supabase
        .from('testes_aplicados')
        .select(
          `
          *,
          teste_template:teste_template_id(*),
          paciente:paciente_id(*)
        `
        )
        .eq('id', testeAplicadoId)
        .single()

      if (testeError || !testeData) {
        return failure(
          new AppError('TEST_RES_001', 'Teste não encontrado', 404, { cause: testeError })
        )
      }

      // Get normative table (default one for this test)
      const { data: tabelaData } = await this.supabase
        .from('tabelas_normativas')
        .select('*')
        .eq('teste_template_id', (testeData as any).teste_template.id)
        .eq('padrao', true)
        .eq('ativo', true)
        .single()

      return success({
        teste_aplicado: testeData as any,
        teste_template: (testeData as any).teste_template,
        paciente: (testeData as any).paciente,
        tabela_normativa: tabelaData as any,
      })
    } catch (error) {
      return failure(
        new AppError('TEST_RES_002', 'Erro ao carregar dados do teste', 500, { cause: error })
      )
    }
  }

  /**
   * Validate test answers before finalization
   */
  async validateAnswers(
    testeAplicadoId: string
  ): Promise<Result<void, AppError>> {
    const testeResult = await this.getTesteWithDetails(testeAplicadoId)
    if (!testeResult.success) {
      return failure(testeResult.error)
    }

    const { teste_aplicado, teste_template } = testeResult.data

    return CalculationEngine.validate(
      teste_template.regras_calculo,
      teste_aplicado.respostas || {},
      teste_template.questoes
    )
  }
}
