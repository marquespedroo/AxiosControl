import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import { Tag, TagInsert, TagUpdate, TagSimple, TagWithCount, CategoriaTag } from '@/types/database'
import { Database } from '@/types/database.generated'

import { PaginationResult } from '../repositories/base/Repository'
import { TagRepository, TagSearchParams } from '../repositories/TagRepository'

/**
 * Service layer for Tag entity
 * Handles business logic for tags
 */
export class TagService {
  private repository: TagRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new TagRepository(supabase)
  }

  /**
   * List tags with search and pagination
   */
  async list(params: TagSearchParams): Promise<Result<PaginationResult<Tag>, AppError>> {
    // Validate pagination params
    if (params.page < 1) {
      return failure(new AppError('TAG_SVC_001', 'Número da página deve ser maior que 0'))
    }

    if (params.limit < 1 || params.limit > 100) {
      return failure(new AppError('TAG_SVC_002', 'Limite deve estar entre 1 e 100'))
    }

    return this.repository.findAll(params)
  }

  /**
   * Get all active tags (for dropdowns/selectors)
   */
  async getAllActive(): Promise<Result<Tag[], AppError>> {
    return this.repository.findAllActive()
  }

  /**
   * Get all tags with test count
   */
  async getAllWithCount(): Promise<Result<TagWithCount[], AppError>> {
    return this.repository.findAllWithCount()
  }

  /**
   * Get tags grouped by category
   */
  async getAllGroupedByCategory(): Promise<Result<Record<CategoriaTag, Tag[]>, AppError>> {
    const result = await this.repository.findAllActive()

    if (!result.success) {
      return failure(result.error)
    }

    const grouped: Record<CategoriaTag, Tag[]> = {
      populacao: [],
      dominio_clinico: [],
      faixa_etaria: [],
      instrumento: [],
    }

    result.data.forEach(tag => {
      if (grouped[tag.categoria]) {
        grouped[tag.categoria].push(tag)
      }
    })

    return success(grouped)
  }

  /**
   * Get tag by ID
   */
  async getById(id: string): Promise<Result<Tag, AppError>> {
    const result = await this.repository.findById(id)

    if (!result.success) {
      return failure(result.error)
    }

    if (!result.data) {
      return failure(new AppError('TAG_SVC_003', 'Tag não encontrada', 404))
    }

    return success(result.data)
  }

  /**
   * Get tag by slug
   */
  async getBySlug(slug: string): Promise<Result<Tag, AppError>> {
    const result = await this.repository.findBySlug(slug)

    if (!result.success) {
      return failure(result.error)
    }

    if (!result.data) {
      return failure(new AppError('TAG_SVC_004', 'Tag não encontrada', 404))
    }

    return success(result.data)
  }

  /**
   * Get tags by category
   */
  async getByCategoria(categoria: CategoriaTag): Promise<Result<Tag[], AppError>> {
    const validCategories: CategoriaTag[] = ['populacao', 'dominio_clinico', 'faixa_etaria', 'instrumento']

    if (!validCategories.includes(categoria)) {
      return failure(new AppError('TAG_SVC_005', 'Categoria inválida', 400))
    }

    return this.repository.findByCategoria(categoria)
  }

  /**
   * Get tags for a test
   */
  async getTesteTemplateTags(testeTemplateId: string): Promise<Result<TagSimple[], AppError>> {
    if (!testeTemplateId) {
      return failure(new AppError('TAG_SVC_006', 'ID do teste é obrigatório', 400))
    }

    return this.repository.findByTesteTemplateId(testeTemplateId)
  }

  /**
   * Create a new tag
   */
  async create(data: TagInsert): Promise<Result<Tag, AppError>> {
    // Validate required fields
    const validationResult = this.validateTag(data)
    if (!validationResult.success) {
      return failure(validationResult.error)
    }

    // Check slug uniqueness
    const slugUniqueResult = await this.repository.isSlugUnique(data.slug)
    if (!slugUniqueResult.success) {
      return failure(slugUniqueResult.error)
    }

    if (!slugUniqueResult.data) {
      return failure(new AppError('TAG_SVC_007', 'Slug já existe', 409))
    }

    // Set default values
    const tagData: Partial<Tag> = {
      ...data,
      ativo: data.ativo ?? true,
      ordem: data.ordem ?? 0,
      cor: data.cor || '#6366f1',
    }

    return this.repository.create(tagData)
  }

  /**
   * Update a tag
   */
  async update(id: string, data: TagUpdate): Promise<Result<Tag, AppError>> {
    // Get existing tag
    const existingResult = await this.repository.findById(id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('TAG_SVC_008', 'Tag não encontrada', 404))
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existingResult.data.slug) {
      const slugUniqueResult = await this.repository.isSlugUnique(data.slug, id)
      if (!slugUniqueResult.success) {
        return failure(slugUniqueResult.error)
      }

      if (!slugUniqueResult.data) {
        return failure(new AppError('TAG_SVC_009', 'Slug já existe', 409))
      }
    }

    return this.repository.update(id, data)
  }

  /**
   * Delete a tag (soft delete)
   */
  async delete(id: string): Promise<Result<void, AppError>> {
    const existingResult = await this.repository.findById(id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('TAG_SVC_010', 'Tag não encontrada', 404))
    }

    return this.repository.delete(id)
  }

  /**
   * Add tag to a test
   */
  async addTagToTeste(testeTemplateId: string, tagId: string): Promise<Result<void, AppError>> {
    if (!testeTemplateId || !tagId) {
      return failure(new AppError('TAG_SVC_011', 'IDs do teste e da tag são obrigatórios', 400))
    }

    // Verify tag exists
    const tagResult = await this.repository.findById(tagId)
    if (!tagResult.success || !tagResult.data) {
      return failure(new AppError('TAG_SVC_012', 'Tag não encontrada', 404))
    }

    return this.repository.addTagToTeste(testeTemplateId, tagId)
  }

  /**
   * Remove tag from a test
   */
  async removeTagFromTeste(testeTemplateId: string, tagId: string): Promise<Result<void, AppError>> {
    if (!testeTemplateId || !tagId) {
      return failure(new AppError('TAG_SVC_013', 'IDs do teste e da tag são obrigatórios', 400))
    }

    return this.repository.removeTagFromTeste(testeTemplateId, tagId)
  }

  /**
   * Set all tags for a test (replace existing)
   */
  async setTesteTags(testeTemplateId: string, tagIds: string[]): Promise<Result<void, AppError>> {
    if (!testeTemplateId) {
      return failure(new AppError('TAG_SVC_014', 'ID do teste é obrigatório', 400))
    }

    // Validate all tag IDs exist
    for (const tagId of tagIds) {
      const tagResult = await this.repository.findById(tagId)
      if (!tagResult.success || !tagResult.data) {
        return failure(new AppError('TAG_SVC_015', `Tag ${tagId} não encontrada`, 404))
      }
    }

    return this.repository.setTesteTags(testeTemplateId, tagIds)
  }

  /**
   * Set tags for a test using slugs
   */
  async setTesteTagsBySlugs(testeTemplateId: string, slugs: string[]): Promise<Result<void, AppError>> {
    if (!testeTemplateId) {
      return failure(new AppError('TAG_SVC_016', 'ID do teste é obrigatório', 400))
    }

    const tagIds: string[] = []

    for (const slug of slugs) {
      const tagResult = await this.repository.findBySlug(slug)
      if (!tagResult.success) {
        return failure(tagResult.error)
      }
      if (!tagResult.data) {
        return failure(new AppError('TAG_SVC_017', `Tag com slug '${slug}' não encontrada`, 404))
      }
      tagIds.push(tagResult.data.id)
    }

    return this.repository.setTesteTags(testeTemplateId, tagIds)
  }

  /**
   * Find tests by tag slugs
   */
  async findTestesByTagSlugs(slugs: string[]): Promise<Result<string[], AppError>> {
    if (!slugs || slugs.length === 0) {
      return failure(new AppError('TAG_SVC_018', 'Pelo menos um slug é obrigatório', 400))
    }

    return this.repository.findTestesByTagSlugs(slugs)
  }

  /**
   * Generate slug from name
   */
  generateSlug(nome: string): string {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
  }

  /**
   * Validate tag data
   */
  private validateTag(data: TagInsert): Result<void, AppError> {
    // Validate nome
    if (!data.nome || data.nome.trim().length < 2) {
      return failure(
        new AppError('TAG_SVC_019', 'Nome deve ter no mínimo 2 caracteres', 400)
      )
    }

    // Validate slug
    if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) {
      return failure(
        new AppError('TAG_SVC_020', 'Slug deve conter apenas letras minúsculas, números e hífens', 400)
      )
    }

    // Validate categoria
    const validCategories: CategoriaTag[] = ['populacao', 'dominio_clinico', 'faixa_etaria', 'instrumento']
    if (!data.categoria || !validCategories.includes(data.categoria)) {
      return failure(
        new AppError('TAG_SVC_021', 'Categoria inválida', 400)
      )
    }

    // Validate cor (hex format)
    if (data.cor && !/^#[0-9A-Fa-f]{6}$/.test(data.cor)) {
      return failure(
        new AppError('TAG_SVC_022', 'Cor deve estar no formato hexadecimal (#RRGGBB)', 400)
      )
    }

    return success(undefined)
  }
}
