import { SupabaseClient } from '@supabase/supabase-js'
import { Repository, PaginationParams, PaginationResult } from './base/Repository'
import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import { Database } from '@/types/database.generated'
import { Tag, TagSimple, TagWithCount, CategoriaTag } from '@/types/database'

export interface TagSearchParams extends PaginationParams {
  search?: string
  categoria?: CategoriaTag
  ativo?: boolean
}

/**
 * Repository for Tag entity
 * Handles all database operations for tags
 */
export class TagRepository extends Repository<Tag> {
  constructor(supabase: SupabaseClient<Database>) {
    super('tags', supabase)
  }

  /**
   * Find all tags with filters
   */
  async findAll(params: TagSearchParams): Promise<Result<PaginationResult<Tag>, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact' })
        .order('categoria')
        .order('ordem')
        .order('nome')

      // Filter by active status
      if (params.ativo !== undefined) {
        query = query.eq('ativo', params.ativo)
      }

      // Filter by category
      if (params.categoria) {
        query = query.eq('categoria', params.categoria)
      }

      // Search by name or slug
      if (params.search) {
        query = query.or(`nome.ilike.%${params.search}%,slug.ilike.%${params.search}%`)
      }

      // Apply pagination
      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)

      const { data, error, count } = await query

      if (error) {
        return failure(new AppError('TAG_REPO_001', 'Erro ao buscar tags', 500, { cause: error }))
      }

      return success({
        data: (data || []) as unknown as Tag[],
        meta: {
          total: count || 0,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil((count || 0) / params.limit),
        },
      })
    } catch (error) {
      return failure(new AppError('TAG_REPO_002', 'Erro inesperado ao buscar tags', 500, { cause: error }))
    }
  }

  /**
   * Find all active tags (no pagination, for dropdowns)
   */
  async findAllActive(): Promise<Result<Tag[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('ativo', true)
        .order('categoria')
        .order('ordem')
        .order('nome')

      if (error) {
        return failure(new AppError('TAG_REPO_003', 'Erro ao buscar tags ativas', 500, { cause: error }))
      }

      return success((data || []) as unknown as Tag[])
    } catch (error) {
      return failure(new AppError('TAG_REPO_004', 'Erro inesperado ao buscar tags ativas', 500, { cause: error }))
    }
  }

  /**
   * Find tag by slug
   */
  async findBySlug(slug: string): Promise<Result<Tag | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('TAG_REPO_005', 'Erro ao buscar tag por slug', 500, { cause: error }))
      }

      return success(data as unknown as Tag)
    } catch (error) {
      return failure(new AppError('TAG_REPO_006', 'Erro inesperado ao buscar tag por slug', 500, { cause: error }))
    }
  }

  /**
   * Find tags by category
   */
  async findByCategoria(categoria: CategoriaTag): Promise<Result<Tag[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('categoria', categoria)
        .eq('ativo', true)
        .order('ordem')
        .order('nome')

      if (error) {
        return failure(new AppError('TAG_REPO_007', 'Erro ao buscar tags por categoria', 500, { cause: error }))
      }

      return success((data || []) as unknown as Tag[])
    } catch (error) {
      return failure(new AppError('TAG_REPO_008', 'Erro inesperado ao buscar tags por categoria', 500, { cause: error }))
    }
  }

  /**
   * Find tags for a specific test
   */
  async findByTesteTemplateId(testeTemplateId: string): Promise<Result<TagSimple[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from('testes_templates_tags')
        .select(`
          tag_id,
          tags:tag_id (
            id,
            nome,
            slug,
            categoria,
            cor,
            icone
          )
        `)
        .eq('teste_template_id', testeTemplateId)

      if (error) {
        return failure(new AppError('TAG_REPO_009', 'Erro ao buscar tags do teste', 500, { cause: error }))
      }

      // Extract tags from the joined result
      const tags = (data || [])
        .map((item: any) => item.tags)
        .filter((tag: any) => tag !== null) as TagSimple[]

      return success(tags)
    } catch (error) {
      return failure(new AppError('TAG_REPO_010', 'Erro inesperado ao buscar tags do teste', 500, { cause: error }))
    }
  }

  /**
   * Add tag to a test
   */
  async addTagToTeste(testeTemplateId: string, tagId: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.supabase
        .from('testes_templates_tags')
        .insert({
          teste_template_id: testeTemplateId,
          tag_id: tagId,
        })

      if (error) {
        // Check for duplicate constraint
        if (error.code === '23505') {
          return success(undefined) // Already exists, not an error
        }
        return failure(new AppError('TAG_REPO_011', 'Erro ao adicionar tag ao teste', 500, { cause: error }))
      }

      return success(undefined)
    } catch (error) {
      return failure(new AppError('TAG_REPO_012', 'Erro inesperado ao adicionar tag ao teste', 500, { cause: error }))
    }
  }

  /**
   * Remove tag from a test
   */
  async removeTagFromTeste(testeTemplateId: string, tagId: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.supabase
        .from('testes_templates_tags')
        .delete()
        .eq('teste_template_id', testeTemplateId)
        .eq('tag_id', tagId)

      if (error) {
        return failure(new AppError('TAG_REPO_013', 'Erro ao remover tag do teste', 500, { cause: error }))
      }

      return success(undefined)
    } catch (error) {
      return failure(new AppError('TAG_REPO_014', 'Erro inesperado ao remover tag do teste', 500, { cause: error }))
    }
  }

  /**
   * Set tags for a test (replace all existing tags)
   */
  async setTesteTags(testeTemplateId: string, tagIds: string[]): Promise<Result<void, AppError>> {
    try {
      // First, remove all existing tags
      const { error: deleteError } = await this.supabase
        .from('testes_templates_tags')
        .delete()
        .eq('teste_template_id', testeTemplateId)

      if (deleteError) {
        return failure(new AppError('TAG_REPO_015', 'Erro ao remover tags existentes', 500, { cause: deleteError }))
      }

      // Then, add new tags if any
      if (tagIds.length > 0) {
        const insertData = tagIds.map(tagId => ({
          teste_template_id: testeTemplateId,
          tag_id: tagId,
        }))

        const { error: insertError } = await this.supabase
          .from('testes_templates_tags')
          .insert(insertData)

        if (insertError) {
          return failure(new AppError('TAG_REPO_016', 'Erro ao adicionar novas tags', 500, { cause: insertError }))
        }
      }

      return success(undefined)
    } catch (error) {
      return failure(new AppError('TAG_REPO_017', 'Erro inesperado ao definir tags do teste', 500, { cause: error }))
    }
  }

  /**
   * Find tests by tag slugs
   */
  async findTestesByTagSlugs(slugs: string[]): Promise<Result<string[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from('tags')
        .select(`
          id,
          testes_templates_tags (
            teste_template_id
          )
        `)
        .in('slug', slugs)
        .eq('ativo', true)

      if (error) {
        return failure(new AppError('TAG_REPO_018', 'Erro ao buscar testes por tags', 500, { cause: error }))
      }

      // Extract unique test IDs
      const testeIds = new Set<string>()
      data?.forEach((tag: any) => {
        tag.testes_templates_tags?.forEach((rel: any) => {
          testeIds.add(rel.teste_template_id)
        })
      })

      return success(Array.from(testeIds))
    } catch (error) {
      return failure(new AppError('TAG_REPO_019', 'Erro inesperado ao buscar testes por tags', 500, { cause: error }))
    }
  }

  /**
   * Get tags with test count
   */
  async findAllWithCount(): Promise<Result<TagWithCount[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select(`
          *,
          testes_templates_tags (
            teste_template_id
          )
        `)
        .eq('ativo', true)
        .order('categoria')
        .order('ordem')
        .order('nome')

      if (error) {
        return failure(new AppError('TAG_REPO_020', 'Erro ao buscar tags com contagem', 500, { cause: error }))
      }

      // Map results to include test count
      const tagsWithCount = (data || []).map((tag: any) => ({
        ...tag,
        teste_count: tag.testes_templates_tags?.length || 0,
        testes_templates_tags: undefined, // Remove the relation data
      })) as TagWithCount[]

      return success(tagsWithCount)
    } catch (error) {
      return failure(new AppError('TAG_REPO_021', 'Erro inesperado ao buscar tags com contagem', 500, { cause: error }))
    }
  }

  /**
   * Check if slug is unique
   */
  async isSlugUnique(slug: string, excludeId?: string): Promise<Result<boolean, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select('id')
        .eq('slug', slug)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query.maybeSingle()

      if (error) {
        return failure(new AppError('TAG_REPO_022', 'Erro ao verificar unicidade do slug', 500, { cause: error }))
      }

      return success(data === null)
    } catch (error) {
      return failure(new AppError('TAG_REPO_023', 'Erro inesperado ao verificar unicidade do slug', 500, { cause: error }))
    }
  }
}
