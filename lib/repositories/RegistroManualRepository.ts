import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import { RegistroManual } from '@/types/database'
import { Database } from '@/types/database'

import { Repository, PaginationParams, PaginationResult } from './base/Repository'

export interface RegistroManualSearchParams extends PaginationParams {
  paciente_id?: string
  psicologo_id?: string
  tipo_teste?: string
  data_inicio?: string
  data_fim?: string
}

/**
 * Repository for RegistroManual entity
 * Handles all database operations for manual test records
 */
export class RegistroManualRepository extends Repository<RegistroManual> {
  constructor(supabase: SupabaseClient<Database>) {
    super('registros_manuais', supabase)
  }

  /**
   * Find all manual records with filters
   */
  async findAll(params: RegistroManualSearchParams): Promise<Result<PaginationResult<RegistroManual>, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact' })
        .order('data_aplicacao', { ascending: false })

      // Filter by patient
      if (params.paciente_id) {
        query = query.eq('paciente_id', params.paciente_id)
      }

      // Filter by psychologist
      if (params.psicologo_id) {
        query = query.eq('psicologo_id', params.psicologo_id)
      }

      // Filter by test type
      if (params.tipo_teste) {
        query = query.eq('tipo_teste', params.tipo_teste)
      }

      // Filter by date range
      if (params.data_inicio) {
        query = query.gte('data_aplicacao', params.data_inicio)
      }

      if (params.data_fim) {
        query = query.lte('data_aplicacao', params.data_fim)
      }

      // Apply pagination
      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)

      const { data, error, count } = await query

      if (error) {
        return failure(new AppError('REG_MANUAL_REPO_001', 'Erro ao buscar registros manuais', 500, { cause: error }))
      }

      return success({
        data: (data || []) as unknown as RegistroManual[],
        meta: {
          total: count || 0,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil((count || 0) / params.limit),
        },
      })
    } catch (error) {
      return failure(new AppError('REG_MANUAL_REPO_002', 'Erro inesperado ao buscar registros manuais', 500, { cause: error }))
    }
  }

  /**
   * Find manual records by patient
   */
  async findByPaciente(paciente_id: string): Promise<Result<RegistroManual[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('paciente_id', paciente_id)
        .order('data_aplicacao', { ascending: false })

      if (error) {
        return failure(new AppError('REG_MANUAL_REPO_003', 'Erro ao buscar registros do paciente', 500, { cause: error }))
      }

      return success((data || []) as unknown as RegistroManual[])
    } catch (error) {
      return failure(new AppError('REG_MANUAL_REPO_004', 'Erro inesperado ao buscar registros do paciente', 500, { cause: error }))
    }
  }

  /**
   * Attach file to manual record
   */
  async attachFile(
    id: string,
    fileUrl: string
  ): Promise<Result<RegistroManual, AppError>> {
    try {
      // Get existing record
      const { data: existing, error: fetchError } = await this.supabase
        .from(this.tableName as any)
        .select('arquivos_anexos')
        .eq('id', id)
        .single()

      if (fetchError) {
        return failure(new AppError('REG_MANUAL_REPO_005', 'Registro não encontrado', 404, { cause: fetchError }))
      }

      // Add new file to existing files
      const currentFiles = ((existing as any).arquivos_anexos || []) as string[]
      const updatedFiles = [...currentFiles, fileUrl]

      // Update record
      const { data, error } = await (this.supabase as any)
        .from(this.tableName as any)
        .update({ arquivos_anexos: updatedFiles })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return failure(new AppError('REG_MANUAL_REPO_006', 'Erro ao anexar arquivo', 500, { cause: error }))
      }

      return success(data as unknown as RegistroManual)
    } catch (error) {
      return failure(new AppError('REG_MANUAL_REPO_007', 'Erro inesperado ao anexar arquivo', 500, { cause: error }))
    }
  }

  /**
   * Remove file from manual record
   */
  async removeFile(
    id: string,
    fileUrl: string
  ): Promise<Result<RegistroManual, AppError>> {
    try {
      // Get existing record
      const { data: existing, error: fetchError } = await this.supabase
        .from(this.tableName as any)
        .select('arquivos_anexos')
        .eq('id', id)
        .single()

      if (fetchError) {
        return failure(new AppError('REG_MANUAL_REPO_008', 'Registro não encontrado', 404, { cause: fetchError }))
      }

      // Remove file from existing files
      const currentFiles = ((existing as any).arquivos_anexos || []) as string[]
      const updatedFiles = currentFiles.filter(url => url !== fileUrl)

      // Update record
      const { data, error } = await (this.supabase as any)
        .from(this.tableName as any)
        .update({ arquivos_anexos: updatedFiles })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return failure(new AppError('REG_MANUAL_REPO_009', 'Erro ao remover arquivo', 500, { cause: error }))
      }

      return success(data as unknown as RegistroManual)
    } catch (error) {
      return failure(new AppError('REG_MANUAL_REPO_010', 'Erro inesperado ao remover arquivo', 500, { cause: error }))
    }
  }

  /**
   * Count manual records by patient
   */
  async countByPaciente(paciente_id: string): Promise<Result<number, AppError>> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact', head: true })
        .eq('paciente_id', paciente_id)

      if (error) {
        return failure(new AppError('REG_MANUAL_REPO_011', 'Erro ao contar registros', 500, { cause: error }))
      }

      return success(count || 0)
    } catch (error) {
      return failure(new AppError('REG_MANUAL_REPO_012', 'Erro inesperado ao contar registros', 500, { cause: error }))
    }
  }

  /**
   * Count manual records by psychologist
   */
  async countByPsicologo(psicologo_id: string): Promise<Result<number, AppError>> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact', head: true })
        .eq('psicologo_id', psicologo_id)

      if (error) {
        return failure(new AppError('REG_MANUAL_REPO_013', 'Erro ao contar registros', 500, { cause: error }))
      }

      return success(count || 0)
    } catch (error) {
      return failure(new AppError('REG_MANUAL_REPO_014', 'Erro inesperado ao contar registros', 500, { cause: error }))
    }
  }
}
