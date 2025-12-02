import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import { TabelaNormativa } from '@/types/database'
import { Database } from '@/types/database'

import { Repository, PaginationParams, PaginationResult } from './base/Repository'

export interface TabelaNormativaSearchParams extends PaginationParams {
  teste_id?: string
  faixa_etaria_min?: number
  faixa_etaria_max?: number
  sexo?: 'M' | 'F' | 'ambos'
  escolaridade?: string
  padrao?: boolean
}

/**
 * Repository for TabelaNormativa entity
 * Handles all database operations for normative tables
 */
export class TabelaNormativaRepository extends Repository<TabelaNormativa> {
  constructor(supabase: SupabaseClient<Database>) {
    super('tabelas_normativas', supabase)
  }

  /**
   * Find all normative tables with filters
   */
  async findAll(params: TabelaNormativaSearchParams): Promise<Result<PaginationResult<TabelaNormativa>, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Filter by test
      if (params.teste_id) {
        query = query.eq('teste_id', params.teste_id)
      }

      // TODO: Columns do not exist in DB
      // if (params.faixa_etaria_min !== undefined) {
      //   query = query.gte('faixa_etaria_min', params.faixa_etaria_min)
      // }

      // if (params.faixa_etaria_max !== undefined) {
      //   query = query.lte('faixa_etaria_max', params.faixa_etaria_max)
      // }

      // Filter by sex
      // TODO: Columns do not exist in DB
      // if (params.sexo) {
      //   query = query.or(`sexo.eq.${params.sexo},sexo.eq.ambos`)
      // }

      // Filter by education level
      // if (params.escolaridade) {
      //   query = query.eq('escolaridade', params.escolaridade)
      // }

      // Filter by default status
      if (params.padrao !== undefined) {
        query = query.eq('padrao', params.padrao)
      }

      // Apply pagination
      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)

      const { data, error, count } = await query

      if (error) {
        return failure(new AppError('NORM_TABLE_REPO_001', 'Erro ao buscar tabelas normativas', 500, { cause: error }))
      }

      return success({
        data: (data || []) as unknown as TabelaNormativa[],
        meta: {
          total: count || 0,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil((count || 0) / params.limit),
        },
      })
    } catch (error) {
      return failure(new AppError('NORM_TABLE_REPO_002', 'Erro inesperado ao buscar tabelas normativas', 500, { cause: error }))
    }
  }

  /**
   * Find normative tables by test ID
   */
  async findByTeste(teste_id: string): Promise<Result<TabelaNormativa[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('teste_id', teste_id)
        .order('faixa_etaria_min')

      if (error) {
        return failure(new AppError('NORM_TABLE_REPO_003', 'Erro ao buscar tabelas do teste', 500, { cause: error }))
      }

      return success((data || []) as unknown as TabelaNormativa[])
    } catch (error) {
      return failure(new AppError('NORM_TABLE_REPO_004', 'Erro inesperado ao buscar tabelas do teste', 500, { cause: error }))
    }
  }

  /**
   * Find default normative table for a test
   */
  async findDefault(teste_id: string): Promise<Result<TabelaNormativa | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('teste_id', teste_id)
        .eq('padrao', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('NORM_TABLE_REPO_005', 'Erro ao buscar tabela padrão', 500, { cause: error }))
      }

      return success(data as unknown as TabelaNormativa)
    } catch (error) {
      return failure(new AppError('NORM_TABLE_REPO_006', 'Erro inesperado ao buscar tabela padrão', 500, { cause: error }))
    }
  }

  /**
   * Find best matching normative table based on patient characteristics
   */
  async findBestMatch(
    teste_id: string,
    _idade: number,
    _sexo: 'M' | 'F',
    _escolaridade?: string
  ): Promise<Result<TabelaNormativa | null, AppError>> {
    try {
      const query = this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('teste_id', teste_id)
      // TODO: Columns do not exist in DB
      // .lte('faixa_etaria_min', idade)
      // .gte('faixa_etaria_max', idade)

      // Match sex (specific or ambos)
      // query = query.or(`sexo.eq.${sexo},sexo.eq.ambos`)

      // If escolaridade provided, try to match
      // if (escolaridade) {
      //   query = query.or(`escolaridade.eq.${escolaridade},escolaridade.is.null`)
      // }

      const { data, error } = await query

      if (error) {
        return failure(new AppError('NORM_TABLE_REPO_007', 'Erro ao buscar tabela compatível', 500, { cause: error }))
      }

      if (!data || data.length === 0) {
        return success(null)
      }

      // Priority: exact sex > ambos, with escolaridade > without escolaridade
      const tables = data as unknown as TabelaNormativa[]

      // Sort by priority
      const sorted = tables.sort((a, b) => {
        // Exact sex match has priority
        // if (a.sexo === sexo && b.sexo !== sexo) return -1
        // if (a.sexo !== sexo && b.sexo === sexo) return 1

        // Then education level match
        // if (escolaridade) {
        //   if (a.escolaridade === escolaridade && b.escolaridade !== escolaridade) return -1
        //   if (a.escolaridade !== escolaridade && b.escolaridade === escolaridade) return 1
        // }

        // Default table has priority
        if (a.padrao && !b.padrao) return -1
        if (!a.padrao && b.padrao) return 1

        return 0
      })

      return success(sorted[0])
    } catch (error) {
      return failure(new AppError('NORM_TABLE_REPO_008', 'Erro inesperado ao buscar tabela compatível', 500, { cause: error }))
    }
  }

  /**
   * Set a normative table as default for a test
   * Unsets previous default if exists
   */
  async setAsDefault(id: string, teste_id: string): Promise<Result<TabelaNormativa, AppError>> {
    try {
      // First, unset previous default for this test
      const { error: unsetError } = await (this.supabase as any)
        .from(this.tableName as any)
        .update({ padrao: false } as any)
        .eq('teste_id', teste_id)
        .eq('padrao', true)

      if (unsetError) {
        return failure(new AppError('NORM_TABLE_REPO_009', 'Erro ao remover padrão anterior', 500, { cause: unsetError }))
      }

      // Then set new default
      const { data, error } = await (this.supabase as any)
        .from(this.tableName as any)
        .update({ padrao: true } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return failure(new AppError('NORM_TABLE_REPO_010', 'Erro ao definir nova tabela padrão', 500, { cause: error }))
      }

      return success(data as unknown as TabelaNormativa)
    } catch (error) {
      return failure(new AppError('NORM_TABLE_REPO_011', 'Erro inesperado ao definir tabela padrão', 500, { cause: error }))
    }
  }

  /**
   * Count normative tables by test
   */
  async countByTest(teste_id: string): Promise<Result<number, AppError>> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact', head: true })
        .eq('teste_id', teste_id)

      if (error) {
        return failure(new AppError('NORM_TABLE_REPO_012', 'Erro ao contar tabelas normativas', 500, { cause: error }))
      }

      return success(count || 0)
    } catch (error) {
      return failure(new AppError('NORM_TABLE_REPO_013', 'Erro inesperado ao contar tabelas normativas', 500, { cause: error }))
    }
  }
}
