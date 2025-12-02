import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { createAuditLog } from '@/lib/supabase/helpers'
import { Result, success, failure } from '@/types/core/result'
import { TesteTemplate, TesteTemplateInsert, TesteTemplateUpdate } from '@/types/database'
import { Database } from '@/types/database.generated'

import { PaginationResult } from '../repositories/base/Repository'
import { TesteTemplateRepository, TesteTemplateSearchParams } from '../repositories/TesteTemplateRepository'

/**
 * Service layer for TesteTemplate entity
 * Handles business logic for test templates
 */
export class TesteTemplateService {
  private repository: TesteTemplateRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new TesteTemplateRepository(supabase)
  }

  /**
   * List test templates with search and pagination
   */
  async list(params: TesteTemplateSearchParams): Promise<Result<PaginationResult<TesteTemplate>, AppError>> {
    // Validate pagination params
    if (params.page < 1) {
      return failure(new AppError('TEST_TPL_SVC_001', 'Número da página deve ser maior que 0'))
    }

    if (params.limit < 1 || params.limit > 100) {
      return failure(new AppError('TEST_TPL_SVC_002', 'Limite deve estar entre 1 e 100'))
    }

    return this.repository.findAll(params)
  }

  /**
   * Get test template by ID
   */
  async getById(id: string): Promise<Result<TesteTemplate, AppError>> {
    const result = await this.repository.findById(id)

    if (!result.success) {
      return failure(result.error)
    }

    if (!result.data) {
      return failure(new AppError('TMPL_SVC_013', 'Template não encontrado', 404))
    }

    return success(result.data)
  }

  /**
   * Get public test templates (available to all clinics)
   */
  async getPublic(): Promise<Result<TesteTemplate[], AppError>> {
    return this.repository.findPublic()
  }

  /**
   * Get test templates available to a clinic (public + created by clinic)
   */
  async getByClinica(clinica_id: string): Promise<Result<TesteTemplate[], AppError>> {
    if (!clinica_id) {
      return failure(new AppError('TEST_TPL_SVC_004', 'ID da clínica é obrigatório'))
    }

    return this.repository.findByClinica(clinica_id)
  }

  /**
   * Create a new test template
   */
  async create(
    data: TesteTemplateInsert,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<TesteTemplate, AppError>> {
    // Validate required fields
    const validationResult = this.validateTestTemplate(data)
    if (!validationResult.success) {
      return failure(validationResult.error)
    }

    // Validate sigla uniqueness if provided
    if (data.sigla) {
      const existingResult = await this.repository.findBySigla(data.sigla)
      if (!existingResult.success) {
        return failure(existingResult.error)
      }

      if (existingResult.data) {
        return failure(new AppError('TMPL_SVC_009', 'Template já está arquivado', 400))
      }
    }

    // Set default values
    const templateData: TesteTemplateInsert = {
      ...data,
      ativo: true,
      criado_por: usuario_id,
      versao: data.versao || '1.0',
    }

    // Create test template
    const result = await this.repository.create(templateData)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'criar',
      entidade: 'testes_templates',
      entidade_id: result.data.id,
      dados_anteriores: null,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Update test template
   */
  async update(
    id: string,
    data: TesteTemplateUpdate,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<TesteTemplate, AppError>> {
    // Get existing template
    const existingResult = await this.repository.findById(id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('TMPL_SVC_008', 'Template não encontrado', 404))
    }

    const existingTemplate = existingResult.data

    // Validate sigla uniqueness if changing
    if (data.sigla && data.sigla !== existingTemplate.sigla) {
      const siglaResult = await this.repository.findBySigla(data.sigla)
      if (!siglaResult.success) {
        return failure(siglaResult.error)
      }

      if (siglaResult.data) {
        return failure(new AppError('TMPL_SVC_014', 'Template já está na versão 1', 400))
      }
    }

    // Update test template
    const result = await this.repository.update(id, data)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'editar',
      entidade: 'testes_templates',
      entidade_id: id,
      dados_anteriores: existingTemplate as any,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Delete test template (soft delete)
   */
  async delete(
    id: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<void, AppError>> {
    // Get existing template
    const existingResult = await this.repository.findById(id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('TMPL_SVC_006', 'Template não encontrado', 404))
    }

    const existingTemplate = existingResult.data

    // Soft delete (set ativo = false)
    const result = await this.repository.delete(id)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'deletar',
      entidade: 'testes_templates',
      entidade_id: id,
      dados_anteriores: existingTemplate as any,
      dados_novos: null,
      ip_address,
      user_agent,
    })

    return success(undefined)
  }

  /**
   * Duplicate a test template
   */
  async duplicate(
    id: string,
    newName: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<TesteTemplate, AppError>> {
    // Validate new name
    if (!newName || newName.trim().length < 3) {
      return failure(
        new AppError('TEST_TPL_SVC_009', 'Nome deve ter no mínimo 3 caracteres', 400)
      )
    }

    // Duplicate template
    const result = await this.repository.duplicate(id, newName, usuario_id)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'criar',
      entidade: 'testes_templates',
      entidade_id: result.data.id,
      dados_anteriores: null,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Get test template statistics by type
   */
  async getStatsByType(): Promise<Result<Record<string, number>, AppError>> {
    return this.repository.countByType()
  }

  /**
   * Validate test template data
   */
  private validateTestTemplate(data: TesteTemplateInsert): Result<void, AppError> {
    // Validate nome
    if (!data.nome || data.nome.trim().length < 3) {
      return failure(
        new AppError('TEST_TPL_SVC_010', 'Nome deve ter no mínimo 3 caracteres', 400)
      )
    }

    // Validate tipo
    const validTypes = ['escala_likert', 'multipla_escolha', 'manual']
    if (!data.tipo || !validTypes.includes(data.tipo)) {
      return failure(
        new AppError('TEST_TPL_SVC_011', 'Tipo de teste inválido', 400)
      )
    }

    // Validate faixa_etaria
    if (data.faixa_etaria_min !== null && data.faixa_etaria_max !== null) {
      if (data.faixa_etaria_min < 0 || data.faixa_etaria_max < 0) {
        return failure(
          new AppError('TEST_TPL_SVC_012', 'Faixa etária deve ser maior ou igual a zero', 400)
        )
      }

      if (data.faixa_etaria_min > data.faixa_etaria_max) {
        return failure(
          new AppError('TEST_TPL_SVC_013', 'Faixa etária mínima não pode ser maior que a máxima', 400)
        )
      }
    }

    // Validate questoes for escala_likert and multipla_escolha
    if (data.tipo !== 'manual') {
      if (!data.questoes || !Array.isArray(data.questoes) || data.questoes.length === 0) {
        return failure(
          new AppError('TEST_TPL_SVC_014', 'Testes automatizados devem ter pelo menos uma questão', 400)
        )
      }
    }

    return success(undefined)
  }

  // ====== VERSIONING METHODS ======

  /**
   * Get all versions of a test template
   */
  async getVersions(testId: string): Promise<Result<TesteTemplate[], AppError>> {
    if (!testId) {
      return failure(new AppError('TEST_TPL_SVC_V001', 'ID do teste é obrigatório'))
    }

    return this.repository.findVersions(testId)
  }

  /**
   * Get the active version of a test template chain
   */
  async getActiveVersion(testId: string): Promise<Result<TesteTemplate | null, AppError>> {
    if (!testId) {
      return failure(new AppError('TEST_TPL_SVC_V002', 'ID do teste é obrigatório'))
    }

    return this.repository.findActiveByOrigin(testId)
  }

  /**
   * Create a new version of a test template
   */
  async createVersion(
    testId: string,
    changes: Partial<TesteTemplate>,
    motivo: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<TesteTemplate, AppError>> {
    // Validate required fields
    if (!testId) {
      return failure(new AppError('TEST_TPL_SVC_V003', 'ID do teste é obrigatório'))
    }

    if (!motivo || motivo.trim().length < 3) {
      return failure(
        new AppError('TEST_TPL_SVC_V004', 'Motivo da alteração deve ter no mínimo 3 caracteres', 400)
      )
    }

    // Validate nome if being changed
    if (changes.nome && changes.nome.trim().length < 3) {
      return failure(
        new AppError('TEST_TPL_SVC_V005', 'Nome deve ter no mínimo 3 caracteres', 400)
      )
    }

    // Create new version
    const result = await this.repository.createVersion(testId, changes, motivo, usuario_id)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log for version creation
    await createAuditLog({
      usuario_id,
      acao: 'criar',
      entidade: 'testes_templates',
      entidade_id: result.data.id,
      dados_anteriores: { versao_anterior_id: testId },
      dados_novos: {
        versao_numero: result.data.versao_numero,
        motivo_alteracao: motivo,
      },
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Restore a previous version of a test template
   */
  async restoreVersion(
    versionId: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<TesteTemplate, AppError>> {
    // Validate required fields
    if (!versionId) {
      return failure(new AppError('TEST_TPL_SVC_V006', 'ID da versão é obrigatório'))
    }

    // Get the version being restored for audit
    const versionResult = await this.repository.findById(versionId)
    if (!versionResult.success || !versionResult.data) {
      return failure(new AppError('TMPL_SVC_015', 'Versão não encontrada', 404))
    }

    const versionToRestore = versionResult.data

    // Restore version
    const result = await this.repository.restoreVersion(versionId, usuario_id)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log for version restoration
    await createAuditLog({
      usuario_id,
      acao: 'editar',
      entidade: 'testes_templates',
      entidade_id: result.data.id,
      dados_anteriores: {
        versao_restaurada_id: versionId,
        versao_restaurada_numero: versionToRestore.versao_numero,
      },
      dados_novos: {
        nova_versao_numero: result.data.versao_numero,
      },
      ip_address,
      user_agent,
    })

    return result
  }
}
