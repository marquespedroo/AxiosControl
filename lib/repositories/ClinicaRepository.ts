import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import { Clinica } from '@/types/database'
import { Database } from '@/types/database.generated'

import { Repository, PaginationParams, PaginationResult } from './base/Repository'

export interface ClinicaSearchParams extends PaginationParams {
  search?: string
  ativo?: boolean
}

/**
 * Repository for Clinica entity
 * Handles all database operations for clinics
 */
export class ClinicaRepository extends Repository<Clinica> {
  constructor(supabase: SupabaseClient<Database>) {
    super('clinicas', supabase)
  }

  /**
   * Find clinics with search and filters
   */
  async findAll(params: ClinicaSearchParams): Promise<Result<PaginationResult<Clinica>, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply search filter
      if (params.search) {
        query = query.or(`nome.ilike.%${params.search}%,cnpj.ilike.%${params.search}%`)
      }

      // Apply active filter
      if (params.ativo !== undefined) {
        query = query.eq('ativo', params.ativo)
      }

      // Apply pagination
      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)

      const { data, error, count } = await query

      if (error) {
        return failure(new AppError('CLINIC_REPO_001', 'Erro ao buscar clínicas', 500, { cause: error }))
      }

      return success({
        data: (data || []) as unknown as Clinica[],
        meta: {
          total: count || 0,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil((count || 0) / params.limit),
        },
      })
    } catch (error) {
      return failure(new AppError('CLINIC_REPO_002', 'Erro inesperado ao buscar clínicas', 500, { cause: error }))
    }
  }

  /**
   * Find clinic by CNPJ
   */
  async findByCnpj(cnpj: string): Promise<Result<Clinica | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('cnpj', cnpj)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('CLINIC_REPO_003', 'Erro ao buscar clínica por CNPJ', 500, { cause: error }))
      }

      return success(data as unknown as Clinica)
    } catch (error) {
      return failure(new AppError('CLINIC_REPO_004', 'Erro inesperado ao buscar clínica por CNPJ', 500, { cause: error }))
    }
  }

  /**
   * Count active clinics
   */
  async countActive(): Promise<Result<number, AppError>> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true)

      if (error) {
        return failure(new AppError('CLINIC_REPO_005', 'Erro ao contar clínicas ativas', 500, { cause: error }))
      }

      return success(count || 0)
    } catch (error) {
      return failure(new AppError('CLINIC_REPO_006', 'Erro inesperado ao contar clínicas', 500, { cause: error }))
    }
  }
}
