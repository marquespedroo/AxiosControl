import { SupabaseClient } from '@supabase/supabase-js'
import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import { Database } from '@/types/database.generated'

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/**
 * Base Repository class
 * Implements common CRUD operations with type safety
 */
export abstract class Repository<T extends Record<string, any>> {
  protected tableName: string
  protected supabase: SupabaseClient<Database>

  constructor(tableName: string, supabase: SupabaseClient<Database>) {
    this.tableName = tableName
    this.supabase = supabase
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<Result<T | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return success(null)
        }
        return failure(new AppError('REPO_001', `Erro ao buscar ${this.tableName}`, 500, { cause: error }))
      }

      return success(data as unknown as T)
    } catch (error) {
      return failure(new AppError('REPO_002', `Erro inesperado ao buscar ${this.tableName}`, 500, { cause: error }))
    }
  }

  /**
   * Find all records with optional pagination
   */
  async findAll(pagination?: PaginationParams): Promise<Result<PaginationResult<T>, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact' })

      // Apply pagination
      if (pagination) {
        const offset = (pagination.page - 1) * pagination.limit
        query = query.range(offset, offset + pagination.limit - 1)
      }

      const { data, error, count } = await query

      if (error) {
        return failure(new AppError('REPO_003', `Erro ao listar ${this.tableName}`, 500, { cause: error }))
      }

      const total = count || 0
      const page = pagination?.page || 1
      const limit = pagination?.limit || total

      return success({
        data: (data || []) as unknown as T[],
        meta: {
          total,
          page,
          limit,
          totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
        },
      })
    } catch (error) {
      return failure(new AppError('REPO_004', `Erro inesperado ao listar ${this.tableName}`, 500, { cause: error }))
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<Result<T, AppError>> {
    try {
      const { data: created, error } = await this.supabase
        .from(this.tableName as any)
        .insert(data as any)
        .select()
        .single()

      if (error) {
        return failure(new AppError('REPO_005', `Erro ao criar ${this.tableName}`, 500, { cause: error }))
      }

      return success(created as unknown as T)
    } catch (error) {
      return failure(new AppError('REPO_006', `Erro inesperado ao criar ${this.tableName}`, 500, { cause: error }))
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>): Promise<Result<T, AppError>> {
    try {
      const { data: updated, error } = await this.supabase
        .from(this.tableName as any)
        .update(data as any)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return failure(new AppError('REPO_007', `Erro ao atualizar ${this.tableName}`, 500, { cause: error }))
      }

      return success(updated as unknown as T)
    } catch (error) {
      return failure(new AppError('REPO_008', `Erro inesperado ao atualizar ${this.tableName}`, 500, { cause: error }))
    }
  }

  /**
   * Delete a record by ID (soft delete by setting ativo = false)
   */
  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName as any)
        .update({ ativo: false } as any)
        .eq('id', id)

      if (error) {
        return failure(new AppError('REPO_009', `Erro ao deletar ${this.tableName}`, 500, { cause: error }))
      }

      return success(undefined)
    } catch (error) {
      return failure(new AppError('REPO_010', `Erro inesperado ao deletar ${this.tableName}`, 500, { cause: error }))
    }
  }

  /**
   * Hard delete a record by ID
   */
  async hardDelete(id: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName as any)
        .delete()
        .eq('id', id)

      if (error) {
        return failure(new AppError('REPO_011', `Erro ao deletar permanentemente ${this.tableName}`, 500, { cause: error }))
      }

      return success(undefined)
    } catch (error) {
      return failure(new AppError('REPO_012', `Erro inesperado ao deletar permanentemente ${this.tableName}`, 500, { cause: error }))
    }
  }

  /**
   * Count records
   */
  async count(): Promise<Result<number, AppError>> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact', head: true })

      if (error) {
        return failure(new AppError('REPO_013', `Erro ao contar ${this.tableName}`, 500, { cause: error }))
      }

      return success(count || 0)
    } catch (error) {
      return failure(new AppError('REPO_014', `Erro inesperado ao contar ${this.tableName}`, 500, { cause: error }))
    }
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<Result<boolean, AppError>> {
    const result = await this.findById(id)
    if (!result.success) {
      return failure(result.error)
    }
    return success(result.data !== null)
  }
}
