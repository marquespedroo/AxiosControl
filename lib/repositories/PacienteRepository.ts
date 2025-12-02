import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import { Paciente } from '@/types/database'
import { Database } from '@/types/database'

import { Repository, PaginationParams, PaginationResult } from './base/Repository'

export interface PacienteSearchParams extends PaginationParams {
  search?: string
  clinica_id: string
}

/**
 * Repository for Paciente entity
 * Handles all database operations for patients
 */
export class PacienteRepository extends Repository<Paciente> {
  constructor(supabase: SupabaseClient<Database>) {
    super('pacientes', supabase)
  }

  /**
   * Find patients by clinic with search and pagination
   */
  async findByClinica(params: PacienteSearchParams): Promise<Result<PaginationResult<Paciente>, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact' })
        .eq('clinica_id', params.clinica_id)
        .order('nome_completo', { ascending: true })

      // Apply search filter
      if (params.search) {
        query = query.or(`nome_completo.ilike.%${params.search}%,cpf.ilike.%${params.search}%`)
      }

      // Apply pagination
      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)

      const { data, error, count } = await query

      if (error) {
        return failure(new AppError('PAC_REPO_001', 'Erro ao buscar pacientes', 500, { cause: error }))
      }

      return success({
        data: (data || []) as unknown as Paciente[],
        meta: {
          total: count || 0,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil((count || 0) / params.limit),
        },
      })
    } catch (error) {
      return failure(new AppError('PAC_REPO_002', 'Erro inesperado ao buscar pacientes', 500, { cause: error }))
    }
  }

  /**
   * Find patient by CPF
   */
  async findByCpf(cpf: string): Promise<Result<Paciente | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('cpf', cpf)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('PAC_REPO_003', 'Erro ao buscar paciente por CPF', 500, { cause: error }))
      }

      return success(data as unknown as Paciente)
    } catch (error) {
      return failure(new AppError('PAC_REPO_004', 'Erro inesperado ao buscar paciente por CPF', 500, { cause: error }))
    }
  }

  /**
   * Find patient by ID with clinic validation
   */
  async findByIdAndClinica(id: string, clinica_id: string): Promise<Result<Paciente | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('id', id)
        .eq('clinica_id', clinica_id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('PAC_REPO_005', 'Erro ao buscar paciente', 500, { cause: error }))
      }

      return success(data as unknown as Paciente)
    } catch (error) {
      return failure(new AppError('PAC_REPO_006', 'Erro inesperado ao buscar paciente', 500, { cause: error }))
    }
  }

  /**
   * Count patients by clinic
   */
  async countByClinica(clinica_id: string): Promise<Result<number, AppError>> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact', head: true })
        .eq('clinica_id', clinica_id)
        .eq('ativo', true)

      if (error) {
        return failure(new AppError('PAC_REPO_007', 'Erro ao contar pacientes', 500, { cause: error }))
      }

      return success(count || 0)
    } catch (error) {
      return failure(new AppError('PAC_REPO_008', 'Erro inesperado ao contar pacientes', 500, { cause: error }))
    }
  }

  /**
   * Find active patients by psychologist
   */
  async findByPsicologo(psicologo_id: string, pagination: PaginationParams): Promise<Result<PaginationResult<Paciente>, AppError>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit

      const { data, error, count } = await this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact' })
        .eq('psicologo_responsavel_id', psicologo_id)
        .eq('ativo', true)
        .order('nome_completo', { ascending: true })
        .range(offset, offset + pagination.limit - 1)

      if (error) {
        return failure(new AppError('PAC_REPO_009', 'Erro ao buscar pacientes do psicólogo', 500, { cause: error }))
      }

      return success({
        data: (data || []) as unknown as Paciente[],
        meta: {
          total: count || 0,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil((count || 0) / pagination.limit),
        },
      })
    } catch (error) {
      return failure(new AppError('PAC_REPO_010', 'Erro inesperado ao buscar pacientes do psicólogo', 500, { cause: error }))
    }
  }
}
