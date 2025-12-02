import { createClient } from '@/lib/supabase/server'
import { TesteAplicadoRepository } from '@/lib/repositories/TesteAplicadoRepository'
import { TabelaNormativaRepository } from '@/lib/repositories/TabelaNormativaRepository'
import { PacienteRepository } from '@/lib/repositories/PacienteRepository'
import { TesteTemplateRepository } from '@/lib/repositories/TesteTemplateRepository'
import { NormalizacaoService } from './NormalizacaoService'
import type { Result } from '@/types/core/result'
import { failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import type { TesteAplicado, TabelaNormativa } from '@/types/database'

/**
 * TesteAplicadoService - Business logic for applied tests
 *
 * Responsibilities:
 * - Test application lifecycle (create, update, finalize, reopen)
 * - Status management and validation
 * - Integration with NormalizacaoService for scoring
 * - Audit logging for all operations
 */

export interface CreateTesteAplicadoParams {
  paciente_id: string
  psicologo_id: string
  teste_template_id: string
  tipo_aplicacao: 'presencial' | 'remota' | 'manual' | 'entrega'
}

export interface UpdateRespostasParams {
  questao_id: string
  resposta: any
}

export interface FinalizeTesteParams {
  respostas: Record<string, any>
}

export class TesteAplicadoService {
  private repository: TesteAplicadoRepository
  private tabelaNormativaRepository: TabelaNormativaRepository
  private pacienteRepository: PacienteRepository
  private testeTemplateRepository: TesteTemplateRepository
  private normalizacaoService: NormalizacaoService

  constructor() {
    const supabase = createClient()
    this.repository = new TesteAplicadoRepository(supabase)
    this.tabelaNormativaRepository = new TabelaNormativaRepository(supabase)
    this.pacienteRepository = new PacienteRepository(supabase)
    this.testeTemplateRepository = new TesteTemplateRepository(supabase)
    this.normalizacaoService = new NormalizacaoService()
  }

  /**
   * Create new test application
   */
  async create(params: CreateTesteAplicadoParams): Promise<Result<TesteAplicado, AppError>> {
    try {
      // Validate paciente exists
      const pacienteResult = await this.pacienteRepository.findById(params.paciente_id)
      if (!pacienteResult.success) {
        return failure(new AppError('TEST_APLIC_001', 'Paciente não encontrado', 404))
      }

      // Validate teste template exists
      const templateResult = await this.testeTemplateRepository.findById(params.teste_template_id)
      if (!templateResult.success) {
        return failure(new AppError('TEST_APLIC_002', 'Template de teste não encontrado', 404))
      }

      // Create teste aplicado
      const result = await this.repository.create({
        ...params,
        status: 'aguardando',
        respostas: {},
        progresso: 0
      })

      if (!result.success) {
        return result
      }

      // TODO: Audit log
      // await this.logAudit('create', result.data)

      return result
    } catch (error) {
      return failure(
        new AppError('TEST_APLIC_003', 'Erro ao criar teste aplicado', 500, { cause: error })
      )
    }
  }

  /**
   * Get test by ID
   */
  async get(id: string): Promise<Result<TesteAplicado, AppError>> {
    const result = await this.repository.findById(id)
    if (result.success && !result.data) {
      return failure(new AppError('TEST_APLIC_000', 'Teste não encontrado', 404))
    }
    return result as Result<TesteAplicado, AppError>
  }

  /**
   * List tests with filters
   */
  async list(params: {
    paciente_id?: string
    psicologo_id?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<Result<{ data: TesteAplicado[]; meta: any }, AppError>> {
    try {
      // Build query based on params
      // For now, use findByPaciente if paciente_id provided
      if (params.paciente_id) {
        const result = await this.repository.findByPaciente({
          paciente_id: params.paciente_id,
          page: params.page || 1,
          limit: params.limit || 10
        })
        return result
      }

      // TODO: Add more filter options
      return failure(new AppError('TEST_APLIC_004', 'Filtro não implementado', 501))
    } catch (error) {
      return failure(
        new AppError('TEST_APLIC_005', 'Erro ao listar testes', 500, { cause: error })
      )
    }
  }

  /**
   * Update test responses
   * Used for saving answers during test application
   */
  async updateRespostas(
    id: string,
    questao_id: string,
    resposta: any
  ): Promise<Result<TesteAplicado, AppError>> {
    try {
      // Get current test
      const testeResult = await this.repository.findById(id)
      if (!testeResult.success) {
        return testeResult
      }

      if (!testeResult.data) {
        return failure(new AppError('TEST_APLIC_000', 'Teste não encontrado', 404))
      }
      const teste = testeResult.data

      // Validate status
      if (teste.status === 'completo') {
        return failure(new AppError('TEST_APLIC_006', 'Teste já finalizado', 400))
      }
      if (teste.status === 'abandonado') {
        return failure(new AppError('TEST_APLIC_015', 'Teste foi abandonado e não pode ser alterado', 400))
      }
      if (teste.status === 'bloqueado') {
        return failure(new AppError('TEST_APLIC_016', 'Teste está bloqueado', 400))
      }

      // Update respostas
      const respostasAtualizadas = {
        ...(teste.respostas as Record<string, any>),
        [questao_id]: resposta
      }

      // Calculate progress (simple count for now)
      // TODO: Get total questions from template
      const totalRespostas = Object.keys(respostasAtualizadas).length
      const progresso = totalRespostas // Will be percentage later

      // Update
      const result = await this.repository.update(id, {
        respostas: respostasAtualizadas,
        progresso,
        status: 'em_andamento'
      })

      if (!result.success) {
        return result
      }

      // TODO: Audit log
      // await this.logAudit('update_respostas', result.data)

      return result
    } catch (error) {
      return failure(
        new AppError('TEST_APLIC_007', 'Erro ao atualizar respostas', 500, { cause: error })
      )
    }
  }

  /**
   * Finalize test - Calculate scores and normalize
   * CRITICAL: Integrates with NormalizacaoService
   */
  async finalize(id: string): Promise<Result<TesteAplicado, AppError>> {
    try {
      // Get test
      const testeResult = await this.repository.findById(id)
      if (!testeResult.success) {
        return testeResult
      }

      if (!testeResult.data) {
        return failure(new AppError('TEST_APLIC_000', 'Teste não encontrado', 404))
      }
      const teste = testeResult.data

      // Validate status
      if (teste.status === 'completo') {
        return failure(new AppError('TEST_APLIC_008', 'Teste já finalizado', 400))
      }

      // Get paciente
      const pacienteResult = await this.pacienteRepository.findById(teste.paciente_id)
      if (!pacienteResult.success) {
        return failure(new AppError('TEST_APLIC_009', 'Paciente não encontrado', 404))
      }

      if (!pacienteResult.data) {
        return failure(new AppError('TEST_APLIC_009', 'Paciente não encontrado', 404))
      }
      const paciente = pacienteResult.data

      // Get template with calculation rules
      const templateResult = await this.testeTemplateRepository.findById(teste.teste_template_id)
      if (!templateResult.success) {
        return failure(new AppError('TEST_APLIC_010', 'Template não encontrado', 404))
      }

      if (!templateResult.data) {
        return failure(new AppError('TEST_APLIC_010', 'Template não encontrado', 404))
      }
      const template = templateResult.data

      // Step 1: Calculate raw score
      const pontuacaoBrutaResult = this.normalizacaoService.calcularPontuacaoBruta(
        teste.respostas as Record<string, any>,
        template.regras_calculo as any
      )

      if (!pontuacaoBrutaResult.success) {
        return failure(
          new AppError('TEST_APLIC_011', 'Erro no cálculo de pontuação bruta', 500, {
            cause: pontuacaoBrutaResult.error
          })
        )
      }

      const pontuacaoBruta = pontuacaoBrutaResult.data

      // Step 2: Get normative table (if exists)
      const tabelasResult = await this.tabelaNormativaRepository.findByTeste(
        teste.teste_template_id
      )

      let normalizacao = null
      let interpretacao = null

      if (tabelasResult.success && tabelasResult.data.length > 0) {
        // Use first active normative table (or default)
        const tabela = tabelasResult.data.find((t: TabelaNormativa) => t.padrao) || tabelasResult.data[0]

        // Step 3: Normalize
        const normalizacaoResult = this.normalizacaoService.normalizar(
          pontuacaoBruta,
          {
            data_nascimento: paciente.data_nascimento,
            escolaridade_anos: paciente.escolaridade_anos,
            sexo: paciente.sexo
          },
          tabela
        )

        if (normalizacaoResult.success) {
          normalizacao = normalizacaoResult.data

          // Step 4: Generate interpretation
          interpretacao = this.gerarInterpretacao(
            pontuacaoBruta,
            normalizacao,
            template
          )
        }
      }

      // Update test with results
      const result = await this.repository.update(id, {
        status: 'completo',
        pontuacao_bruta: pontuacaoBruta,
        normalizacao: normalizacao as any,
        interpretacao,
        data_conclusao: new Date().toISOString(),
        progresso: 100
      })

      if (!result.success) {
        return result
      }

      // TODO: Audit log
      // await this.logAudit('finalize', result.data)

      return result
    } catch (error) {
      return failure(
        new AppError('TEST_APLIC_012', 'Erro ao finalizar teste', 500, { cause: error })
      )
    }
  }

  /**
   * Reopen completed test for editing
   */
  async reopen(id: string, motivo: string): Promise<Result<TesteAplicado, AppError>> {
    try {
      // Get test
      const testeResult = await this.repository.findById(id)
      if (!testeResult.success) {
        return testeResult
      }

      if (!testeResult.data) {
        return failure(new AppError('TEST_APLIC_000', 'Teste não encontrado', 404))
      }
      const teste = testeResult.data

      // Validate status
      if (teste.status !== 'completo') {
        return failure(new AppError('TEST_APLIC_013', 'Apenas testes completos podem ser reabertos', 400))
      }

      // Update status
      const result = await this.repository.update(id, {
        status: 'reaberto',
        data_reabertura: new Date().toISOString(),
        motivo_reabertura: motivo
      })

      if (!result.success) {
        return result
      }

      // TODO: Audit log
      // await this.logAudit('reopen', result.data, { motivo })

      return result
    } catch (error) {
      return failure(
        new AppError('TEST_APLIC_014', 'Erro ao reabrir teste', 500, { cause: error })
      )
    }
  }

  /**
   * Generate interpretation based on scores
   * PRD Section 3.5 - RF-014
   */
  private gerarInterpretacao(
    pontuacaoBruta: any,
    normalizacao: any,
    _template: any
  ): any {
    const interpretacao: any = {
      classificacao_geral: normalizacao.classificacao,
      pontos_atencao: [],
      recomendacoes: []
    }

    // Check section scores for attention points
    if (pontuacaoBruta.secoes) {
      for (const [secao, score] of Object.entries(pontuacaoBruta.secoes)) {
        // If section score is extreme (very high or very low)
        // This is simplified - should use section-specific norms
        const scoreNum = score as number
        if (scoreNum > pontuacaoBruta.total * 0.3) {
          interpretacao.pontos_atencao.push(
            `Seção ${secao} com pontuação elevada`
          )
        }
      }
    }

    // Add general recommendations based on classification
    if (normalizacao.classificacao === 'Muito Inferior' || normalizacao.classificacao === 'Inferior') {
      interpretacao.recomendacoes.push(
        'Considerar avaliação complementar',
        'Investigar possíveis dificuldades relacionadas'
      )
    }

    return interpretacao
  }

  /**
   * Audit logging (placeholder)
   * TODO: Implement actual audit logging to logs_auditoria table
   */
  // @ts-ignore
  private async _logAudit(_action: string, _entity: any, _metadata?: any): Promise<void> {
    // Implementation would go here
    // console.log(`[AUDIT] TesteAplicado ${action}:`, entity.id, metadata)
  }
}
