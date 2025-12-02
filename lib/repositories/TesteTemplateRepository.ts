import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import { TesteTemplate } from '@/types/database'
import { Database } from '@/types/database.generated'

import { Repository, PaginationParams, PaginationResult } from './base/Repository'

export interface TesteTemplateSearchParams extends PaginationParams {
  clinica_id?: string
  search?: string
  tipo?: string
  ativo?: boolean
  publico?: boolean
  tags?: string[] // Array of tag slugs to filter by
}

/**
 * Repository for TesteTemplate entity
 * Handles all database operations for test templates
 */
export class TesteTemplateRepository extends Repository<TesteTemplate> {
  constructor(supabase: SupabaseClient<Database>) {
    super('testes_templates', supabase)
  }

  /**
   * Find all test templates with filters
   */
  async findAll(params: TesteTemplateSearchParams): Promise<Result<PaginationResult<TesteTemplate>, AppError>> {
    try {
      // If filtering by tags, first get the matching test IDs
      let testIdsFromTags: string[] | null = null
      if (params.tags && params.tags.length > 0) {
        const { data: tagData, error: tagError } = await this.supabase
          .from('tags')
          .select(`
            id,
            testes_templates_tags (
              teste_template_id
            )
          `)
          .in('slug', params.tags)
          .eq('ativo', true)

        if (tagError) {
          return failure(new AppError('TEST_TPL_REPO_001A', 'Erro ao buscar tags', 500, { cause: tagError }))
        }

        // Extract unique test IDs that have ALL specified tags
        const testTagCounts = new Map<string, number>()
        tagData?.forEach((tag: any) => {
          tag.testes_templates_tags?.forEach((rel: any) => {
            const count = testTagCounts.get(rel.teste_template_id) || 0
            testTagCounts.set(rel.teste_template_id, count + 1)
          })
        })

        // Only include tests that have ALL specified tags
        testIdsFromTags = Array.from(testTagCounts.entries())
          .filter(([_, count]) => count >= params.tags!.length)
          .map(([id]) => id)

        // If no tests match all tags, return empty result
        if (testIdsFromTags.length === 0) {
          return success({
            data: [],
            meta: {
              total: 0,
              page: params.page,
              limit: params.limit,
              totalPages: 0,
            },
          })
        }
      }

      let query = this.supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact' })
        .order('nome', { ascending: true })

      // Filter by tag-matched test IDs
      if (testIdsFromTags) {
        query = query.in('id', testIdsFromTags)
      }

      // Filter by active status
      if (params.ativo !== undefined) {
        query = query.eq('ativo', params.ativo)
      }

      // Filter by public/private
      if (params.publico !== undefined) {
        query = query.eq('publico', params.publico)
      }

      // Filter by type
      if (params.tipo) {
        query = query.eq('tipo', params.tipo)
      }

      // Search by name or sigla
      if (params.search) {
        query = query.or(`nome.ilike.%${params.search}%,sigla.ilike.%${params.search}%`)
      }

      // Apply pagination
      const offset = (params.page - 1) * params.limit
      query = query.range(offset, offset + params.limit - 1)

      const { data, error, count } = await query

      if (error) {
        return failure(new AppError('TEST_TMPL_REPO_004', 'Erro ao buscar teste template', 500, { cause: error }))
      }

      return success({
        data: (data || []) as unknown as TesteTemplate[],
        meta: {
          total: count || 0,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil((count || 0) / params.limit),
        },
      })
    } catch (error) {
      return failure(new AppError('TEST_TMPL_REPO_005', 'Erro inesperado ao buscar teste template', 500, { cause: error }))
    }
  }

  /**
   * Find public test templates (available to all clinics)
   */
  async findPublic(): Promise<Result<TesteTemplate[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('publico', true)
        .eq('ativo', true)
        .order('nome')

      if (error) {
        return failure(new AppError('TEST_TMPL_REPO_025', 'Erro ao buscar testes públicos', 500, { cause: error }))
      }

      return success((data || []) as unknown as TesteTemplate[])
    } catch (error) {
      return failure(new AppError('TEST_TMPL_REPO_026', 'Erro inesperado ao buscar testes públicos', 500, { cause: error }))
    }
  }

  /**
   * Find test templates by clinic (public + created by clinic)
   */
  async findByClinica(clinica_id: string): Promise<Result<TesteTemplate[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .or(`publico.eq.true,criado_por.in.(select id from users where clinica_id = '${clinica_id}')`)
        .eq('ativo', true)
        .order('nome')

      if (error) {
        return failure(new AppError('TEST_TMPL_REPO_008', 'Erro ao buscar testes da clínica', 500, { cause: error }))
      }

      return success((data || []) as unknown as TesteTemplate[])
    } catch (error) {
      return failure(new AppError('TEST_TMPL_REPO_022', 'Erro inesperado ao verificar unicidade do nome', 500, { cause: error }))
    }
  }

  /**
   * Check if a test template name is unique for a given clinic (excluding itself)
   */
  async checkNameUniqueness(name: string, clinica_id: string, excludeId?: string): Promise<Result<boolean, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select('id')
        .eq('nome', name)
        .or(`publico.eq.true,criado_por.in.(select id from users where clinica_id = '${clinica_id}')`)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        return failure(new AppError('TEST_TMPL_REPO_021', 'Erro ao verificar unicidade do nome', 500, { cause: error }))
      }

      return success(data?.length === 0)
    } catch (error) {
      return failure(new AppError('TEST_TMPL_REPO_019', 'Erro inesperado ao verificar unicidade do nome', 500, { cause: error }))
    }
  }

  /**
   * Check if a test template sigla is unique for a given clinic (excluding itself)
   */
  async checkSiglaUniqueness(sigla: string, clinica_id: string, excludeId?: string): Promise<Result<boolean, AppError>> {
    try {
      let query = this.supabase
        .from(this.tableName as any)
        .select('id')
        .eq('sigla', sigla)
        .or(`publico.eq.true,criado_por.in.(select id from users where clinica_id = '${clinica_id}')`)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        return failure(new AppError('TEST_TMPL_REPO_020', 'Erro ao verificar unicidade da sigla', 500, { cause: error }))
      }

      return success(data?.length === 0)
    } catch (error) {
      return failure(new AppError('TEST_TMPL_REPO_021', 'Erro inesperado ao verificar unicidade da sigla', 500, { cause: error }))
    }
  }

  /**
   * Find test template by sigla (acronym)
   */
  async findBySigla(sigla: string): Promise<Result<TesteTemplate | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .eq('sigla', sigla)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('TEST_TMPL_REPO_006', 'Erro ao buscar teste template por sigla', 500, { cause: error }))
      }

      return success(data as unknown as TesteTemplate)
    } catch (error) {
      return failure(new AppError('TEST_TMPL_REPO_007', 'Erro inesperado ao buscar teste template por sigla', 500, { cause: error }))
    }
  }

  /**
   * Duplicate a test template
   */
  async duplicate(id: string, newName: string, criado_por: string): Promise<Result<TesteTemplate, AppError>> {
    try {
      // Get original test
      const originalResult = await this.findById(id)
      if (!originalResult.success || !originalResult.data) {
        return failure(new AppError('TEST_TPL_REPO_009', 'Teste original não encontrado', 404))
      }

      const original = originalResult.data

      // Create copy
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .insert({
          nome: newName,
          nome_completo: original.nome_completo,
          sigla: original.sigla ? `${original.sigla}-COPY` : null,
          versao: '1.0',
          autor: original.autor,
          ano_publicacao: original.ano_publicacao,
          editora: original.editora,
          referencias_bibliograficas: original.referencias_bibliograficas,
          tipo: original.tipo,
          faixa_etaria_min: original.faixa_etaria_min,
          faixa_etaria_max: original.faixa_etaria_max,
          tempo_medio_aplicacao: original.tempo_medio_aplicacao,
          aplicacao_permitida: original.aplicacao_permitida,
          materiais_necessarios: original.materiais_necessarios,
          questoes: original.questoes,
          escalas_resposta: original.escalas_resposta,
          regras_calculo: original.regras_calculo,
          interpretacao: original.interpretacao,
          ativo: true,
          publico: false, // Duplicates are always private
          criado_por,
        })
        .select()
        .single()

      if (error) {
        return failure(new AppError('TEST_TMPL_REPO_014', 'Erro ao atualizar teste template', 500, { cause: error }))
      }

      return success(data as unknown as TesteTemplate)
    } catch (error) {
      return failure(new AppError('TEST_TMPL_REPO_016', 'Erro inesperado ao deletar teste template', 500, { cause: error }))
    }
  }

  /**
   * Count test templates by type
   */
  async countByType(): Promise<Result<Record<string, number>, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('tipo')
        .eq('ativo', true)

      if (error) {
        return failure(new AppError('TEST_TMPL_REPO_019', 'Erro ao arquivar teste template', 500, { cause: error }))
      }

      const counts: Record<string, number> = {}
      data.forEach((item: any) => {
        counts[item.tipo] = (counts[item.tipo] || 0) + 1
      })

      return success(counts)
    } catch (error) {
      return failure(new AppError('TEST_TMPL_REPO_028', 'Erro inesperado ao clonar teste template', 500, { cause: error }))
    }
  }

  // ====== VERSIONING METHODS ======

  /**
   * Find all versions of a test template by its original ID or any version ID
   * Returns all versions sorted by versao_numero descending
   */
  async findVersions(testId: string): Promise<Result<TesteTemplate[], AppError>> {
    try {
      // First, get the test to find its versao_origem_id
      const testResult = await this.findById(testId)
      if (!testResult.success || !testResult.data) {
        return failure(new AppError('TEST_TPL_REPO_V001', 'Teste não encontrado', 404))
      }

      const test = testResult.data
      // Get the original ID (either versao_origem_id or the test itself if it's the original)
      const originalId = test.versao_origem_id || test.id

      // Find all versions with this origin
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .or(`id.eq.${originalId},versao_origem_id.eq.${originalId}`)
        .order('versao_numero', { ascending: false })

      if (error) {
        return failure(new AppError('TEST_TMPL_REPO_023', 'Erro ao buscar versões do teste', 500, { cause: error }))
      }

      return success((data || []) as unknown as TesteTemplate[])
    } catch (error) {
      return failure(new AppError('TEST_TMPL_REPO_025', 'Erro inesperado ao buscar versões do teste', 500, { cause: error }))
    }
  }

  /**
   * Find the active version of a test template chain
   */
  async findActiveByOrigin(testId: string): Promise<Result<TesteTemplate | null, AppError>> {
    try {
      // First, get the test to find its versao_origem_id
      const testResult = await this.findById(testId)
      if (!testResult.success || !testResult.data) {
        return failure(new AppError('TEST_TPL_REPO_V004', 'Teste não encontrado', 404))
      }

      const test = testResult.data
      const originalId = test.versao_origem_id || test.id

      // Find the active version
      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .select('*')
        .or(`id.eq.${originalId},versao_origem_id.eq.${originalId}`)
        .eq('ativo', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('TEST_TPL_REPO_V005', 'Erro ao buscar versão ativa', 500, { cause: error }))
      }

      return success(data as unknown as TesteTemplate)
    } catch (error) {
      return failure(new AppError('TEST_TPL_REPO_V006', 'Erro inesperado ao buscar versão ativa', 500, { cause: error }))
    }
  }

  /**
   * Create a new version of a test template
   * Deactivates the current active version and creates a new one
   */
  async createVersion(
    originalId: string,
    changes: Partial<TesteTemplate>,
    motivo: string,
    userId: string
  ): Promise<Result<TesteTemplate, AppError>> {
    try {
      // Get the test to find version info
      const testResult = await this.findById(originalId)
      if (!testResult.success || !testResult.data) {
        return failure(new AppError('TEST_TPL_REPO_V007', 'Teste não encontrado', 404))
      }

      const currentTest = testResult.data
      const rootOriginId = currentTest.versao_origem_id || currentTest.id
      const currentVersionNumber = currentTest.versao_numero || 1
      const newVersionNumber = currentVersionNumber + 1

      // Deactivate current active version in the chain
      const { error: deactivateError } = await this.supabase
        .from(this.tableName as any)
        .update({ ativo: false })
        .or(`id.eq.${rootOriginId},versao_origem_id.eq.${rootOriginId}`)
        .eq('ativo', true)

      if (deactivateError) {
        return failure(new AppError('TEST_TPL_REPO_V008', 'Erro ao desativar versão atual', 500, { cause: deactivateError }))
      }

      // Create new version
      const newVersionData = {
        nome: changes.nome ?? currentTest.nome,
        nome_completo: changes.nome_completo ?? currentTest.nome_completo,
        sigla: changes.sigla ?? currentTest.sigla,
        versao: changes.versao ?? currentTest.versao,
        autor: changes.autor ?? currentTest.autor,
        ano_publicacao: changes.ano_publicacao ?? currentTest.ano_publicacao,
        editora: changes.editora ?? currentTest.editora,
        referencias_bibliograficas: changes.referencias_bibliograficas ?? currentTest.referencias_bibliograficas,
        tipo: changes.tipo ?? currentTest.tipo,
        faixa_etaria_min: changes.faixa_etaria_min ?? currentTest.faixa_etaria_min,
        faixa_etaria_max: changes.faixa_etaria_max ?? currentTest.faixa_etaria_max,
        tempo_medio_aplicacao: changes.tempo_medio_aplicacao ?? currentTest.tempo_medio_aplicacao,
        aplicacao_permitida: changes.aplicacao_permitida ?? currentTest.aplicacao_permitida,
        materiais_necessarios: changes.materiais_necessarios ?? currentTest.materiais_necessarios,
        questoes: changes.questoes ?? currentTest.questoes,
        escalas_resposta: changes.escalas_resposta ?? currentTest.escalas_resposta,
        regras_calculo: changes.regras_calculo ?? currentTest.regras_calculo,
        interpretacao: changes.interpretacao ?? currentTest.interpretacao,
        publico: changes.publico ?? currentTest.publico,
        criado_por: currentTest.criado_por,
        // Versioning fields
        versao_origem_id: rootOriginId,
        versao_numero: newVersionNumber,
        motivo_alteracao: motivo,
        alterado_por: userId,
        alterado_em: new Date().toISOString(),
        ativo: true,
      }

      const { data, error } = await this.supabase
        .from(this.tableName as any)
        .insert(newVersionData)
        .select()
        .single()

      if (error) {
        // Try to reactivate the previous version if creation fails
        await this.supabase
          .from(this.tableName as any)
          .update({ ativo: true })
          .eq('id', originalId)

        return failure(new AppError('TEST_TMPL_REPO_024', 'Erro ao criar nova versão', 500, { cause: error }))
      }

      return success(data as unknown as TesteTemplate)
    } catch (error) {
      return failure(new AppError('TEST_TPL_REPO_V010', 'Erro inesperado ao criar versão', 500, { cause: error }))
    }
  }

  /**
   * Restore a previous version of a test template
   * Creates a new version based on the specified version
   */
  async restoreVersion(
    versionId: string,
    userId: string
  ): Promise<Result<TesteTemplate, AppError>> {
    try {
      // Get the version to restore
      const versionResult = await this.findById(versionId)
      if (!versionResult.success || !versionResult.data) {
        return failure(new AppError('TEST_TPL_REPO_V011', 'Versão não encontrada', 404))
      }

      const versionToRestore = versionResult.data
      const motivo = `Restaurado da versão ${versionToRestore.versao_numero}`

      // Create a new version with the restored content
      return this.createVersion(
        versionId,
        {
          nome: versionToRestore.nome,
          nome_completo: versionToRestore.nome_completo,
          sigla: versionToRestore.sigla,
          versao: versionToRestore.versao,
          autor: versionToRestore.autor,
          ano_publicacao: versionToRestore.ano_publicacao,
          editora: versionToRestore.editora,
          tipo: versionToRestore.tipo,
          faixa_etaria_min: versionToRestore.faixa_etaria_min,
          faixa_etaria_max: versionToRestore.faixa_etaria_max,
          tempo_medio_aplicacao: versionToRestore.tempo_medio_aplicacao,
          questoes: versionToRestore.questoes,
          escalas_resposta: versionToRestore.escalas_resposta,
          regras_calculo: versionToRestore.regras_calculo,
          publico: versionToRestore.publico,
        },
        motivo,
        userId
      )
    } catch (error) {
      return failure(new AppError('TEST_TPL_REPO_V012', 'Erro inesperado ao restaurar versão', 500, { cause: error }))
    }
  }
}
