import { SupabaseClient } from '@supabase/supabase-js'
import { Repository, PaginationParams, PaginationResult } from './base/Repository'
import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import { Database } from '@/types/database.generated'
import { TesteAplicado } from '@/types/database'

export interface TesteSearchParams extends PaginationParams {
  paciente_id?: string
  psicologo_id?: string
  clinica_id?: string
  status?: 'aguardando' | 'em_andamento' | 'finalizado' | 'expirado'
}

/**
 * Repository for TesteAplicado entity
 * Handles all database operations for applied tests
 */
export class TesteAplicadoRepository extends Repository<TesteAplicado> {
  constructor(supabase: SupabaseClient<Database>) {
    super('testes_aplicados', supabase)
  }

  /**
   * Find test with full details (template and patient)
   */
  async findWithDetails(id: string): Promise<Result<any, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select(`
          *,
          teste_template:teste_template_id (
            id,
            nome,
            sigla,
            tipo,
            questoes,
            regras_calculo,
            tempo_estimado
          ),
          paciente:paciente_id (
            id,
            nome_completo,
            data_nascimento,
            sexo,
            escolaridade_anos,
            escolaridade_nivel
          ),
          psicologo:psicologo_id (
            id,
            nome_completo,
            crp
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('TEST_REPO_001', 'Erro ao buscar teste', 500, { cause: error }))
      }

      return success(data)
    } catch (error) {
      return failure(new AppError('TEST_REPO_002', 'Erro inesperado ao buscar teste', 500, { cause: error }))
    }
  }

  /**
   * Find tests by patient
   */
  async findByPaciente(params: TesteSearchParams & { paciente_id: string }): Promise<Result<PaginationResult<TesteAplicado>, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select('*, teste_template:teste_template_id(nome, sigla)', { count: 'exact' })
        .eq('paciente_id', params.paciente_id)
        .order('teste_template(nome)', { ascending: true })

      if (params.status) {
        query = query.eq('status', params.status)
      }

      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)

      const { data, error, count } = await query

      if (error) {
        return failure(new AppError('TEST_REPO_003', 'Erro ao buscar testes do paciente', 500, { cause: error }))
      }

      return success({
        data: (data || []) as unknown as TesteAplicado[],
        meta: {
          total: count || 0,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil((count || 0) / params.limit),
        },
      })
    } catch (error) {
      return failure(new AppError('TEST_REPO_004', 'Erro inesperado ao buscar testes do paciente', 500, { cause: error }))
    }
  }

  /**
   * Find tests by psychologist
   */
  async findByPsicologo(params: TesteSearchParams & { psicologo_id: string }): Promise<Result<PaginationResult<TesteAplicado>, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select(`
          *,
          teste_template:teste_template_id(nome, sigla),
          paciente:paciente_id(nome_completo)
        `, { count: 'exact' })
        .eq('psicologo_id', params.psicologo_id)
        .order('paciente(nome_completo)', { ascending: true })

      if (params.status) {
        query = query.eq('status', params.status)
      }

      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)

      const { data, error, count } = await query

      if (error) {
        return failure(new AppError('TEST_REPO_005', 'Erro ao buscar testes do psicólogo', 500, { cause: error }))
      }

      return success({
        data: (data || []) as unknown as TesteAplicado[],
        meta: {
          total: count || 0,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil((count || 0) / params.limit),
        },
      })
    } catch (error) {
      return failure(new AppError('TEST_REPO_006', 'Erro inesperado ao buscar testes do psicólogo', 500, { cause: error }))
    }
  }

  /**
   * Find test by link token (for remote tests)
   */
  async findByLinkToken(linkToken: string): Promise<Result<TesteAplicado | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('link_token', linkToken)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('TEST_REPO_007', 'Erro ao buscar teste por token', 500, { cause: error }))
      }

      return success(data as unknown as TesteAplicado)
    } catch (error) {
      return failure(new AppError('TEST_REPO_008', 'Erro inesperado ao buscar teste por token', 500, { cause: error }))
    }
  }

  /**
   * Update test responses
   */
  async updateRespostas(id: string, respostas: Record<string, any>): Promise<Result<TesteAplicado, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .update({ respostas })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return failure(new AppError('TEST_REPO_009', 'Erro ao atualizar respostas', 500, { cause: error }))
      }

      return success(data as unknown as TesteAplicado)
    } catch (error) {
      return failure(new AppError('TEST_REPO_010', 'Erro inesperado ao atualizar respostas', 500, { cause: error }))
    }
  }

  /**
   * Finalize test with results
   */
  async finalize(
    id: string,
    data: {
      pontuacao_bruta: number
      normalizacao: Record<string, any>
      interpretacao: string
      status: 'finalizado'
    }
  ): Promise<Result<TesteAplicado, AppError>> {
    try {
      const { data: updated, error } = await this.supabase
        .from(this.tableName as any)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return failure(new AppError('TEST_REPO_011', 'Erro ao finalizar teste', 500, { cause: error }))
      }

      return success(updated as unknown as TesteAplicado)
    } catch (error) {
      return failure(new AppError('TEST_REPO_012', 'Erro inesperado ao finalizar teste', 500, { cause: error }))
    }
  }

  /**
   * Count tests by status
   */
  async countByStatus(clinica_id: string, status: string): Promise<Result<number, AppError>> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact', head: true })
        .eq('paciente_id', clinica_id)
        .eq('status', status)

      if (error) {
        return failure(new AppError('TEST_REPO_013', 'Erro ao contar testes', 500, { cause: error }))
      }

      return success(count || 0)
    } catch (error) {
      return failure(new AppError('TEST_REPO_014', 'Erro inesperado ao contar testes', 500, { cause: error }))
    }
  }

  /**
   * Mark expired tests
   */
  async markExpired(): Promise<Result<number, AppError>> {
    try {
      const now = new Date().toISOString()

      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .update({ status: 'expirado' })
        .eq('status', 'aguardando')
        .lt('data_expiracao', now)
        .select('id')

      if (error) {
        return failure(new AppError('TEST_REPO_015', 'Erro ao marcar testes expirados', 500, { cause: error }))
      }

      return success((data || []).length)
    } catch (error) {
      return failure(new AppError('TEST_REPO_016', 'Erro inesperado ao marcar testes expirados', 500, { cause: error }))
    }
  }
}
