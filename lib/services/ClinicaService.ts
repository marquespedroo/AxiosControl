import { SupabaseClient } from '@supabase/supabase-js'
import { ClinicaRepository, ClinicaSearchParams } from '../repositories/ClinicaRepository'
import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import { Database } from '@/types/database.generated'
import { Clinica, ClinicaInsert, ClinicaUpdate } from '@/types/database'
import { PaginationResult } from '../repositories/base/Repository'
import { createAuditLog } from '@/lib/supabase/helpers'

/**
 * Service layer for Clinica entity
 * ⚠️ ALL OPERATIONS REQUIRE SUPER ADMIN PRIVILEGES
 */
export class ClinicaService {
  private repository: ClinicaRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new ClinicaRepository(supabase)
  }

  /**
   * List clinics with search and pagination
   * @requires Super Admin
   */
  async list(params: ClinicaSearchParams): Promise<Result<PaginationResult<Clinica>, AppError>> {
    // Validate pagination params
    if (params.page < 1) {
      return failure(new AppError('CLINIC_SVC_001', 'Número da página deve ser maior que 0'))
    }

    if (params.limit < 1 || params.limit > 100) {
      return failure(new AppError('CLINIC_SVC_002', 'Limite deve estar entre 1 e 100'))
    }

    return this.repository.findAll(params)
  }

  /**
   * Get clinic by ID
   * @requires Super Admin
   */
  async getById(id: string): Promise<Result<Clinica, AppError>> {
    const result = await this.repository.findById(id)

    if (!result.success) {
      return failure(result.error)
    }

    if (!result.data) {
      return failure(new AppError('CLINICA_SVC_003', 'Clínica não encontrada', 404))
    }

    return success(result.data)
  }

  /**
   * Create a new clinic
   * @requires Super Admin
   */
  async create(
    data: ClinicaInsert,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<Clinica, AppError>> {
    // Validate required fields
    if (!data.nome || data.nome.trim().length < 3) {
      return failure(
        new AppError('CLINIC_SVC_004', 'Nome da clínica deve ter no mínimo 3 caracteres', 400)
      )
    }

    // Validate CNPJ uniqueness if provided
    if (data.cnpj) {
      const existingResult = await this.repository.findByCnpj(data.cnpj)
      if (!existingResult.success) {
        return failure(existingResult.error)
      }

      if (existingResult.data) {
        return failure(new AppError('CLINICA_SVC_001', 'CNPJ já cadastrado', 409))
      }
    }

    // Set default values
    const clinicaData: ClinicaInsert = {
      ...data,
      ativo: true,
    }

    // Create clinic
    const result = await this.repository.create(clinicaData)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'criar',
      entidade: 'clinicas',
      entidade_id: result.data.id,
      dados_anteriores: null,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Update clinic
   * @requires Super Admin
   */
  async update(
    id: string,
    data: ClinicaUpdate,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<Clinica, AppError>> {
    // Get existing clinic
    const existingResult = await this.repository.findById(id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('CLINICA_SVC_002', 'Clínica não encontrada', 404))
    }

    const existingClinica = existingResult.data

    // Validate CNPJ uniqueness if changing
    if (data.cnpj && data.cnpj !== existingClinica.cnpj) {
      const cnpjResult = await this.repository.findByCnpj(data.cnpj)
      if (!cnpjResult.success) {
        return failure(cnpjResult.error)
      }

      if (cnpjResult.data) {
        return failure(
          new AppError('CLINIC_SVC_007', 'CNPJ já cadastrado', 409)
        )
      }
    }

    // Update clinic
    const result = await this.repository.update(id, data)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'editar',
      entidade: 'clinicas',
      entidade_id: id,
      dados_anteriores: existingClinica as any,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Delete clinic (soft delete)
   * @requires Super Admin
   */
  async delete(
    id: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<void, AppError>> {
    // Get existing clinic
    const existingResult = await this.repository.findById(id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('CLINIC_SVC_008', 'Clínica não encontrada', 404))
    }

    const existingClinica = existingResult.data

    // Soft delete (set ativo = false)
    const result = await this.repository.delete(id)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'deletar',
      entidade: 'clinicas',
      entidade_id: id,
      dados_anteriores: existingClinica as any,
      dados_novos: null,
      ip_address,
      user_agent,
    })

    return success(undefined)
  }

  /**
   * Get clinic statistics
   * @requires Super Admin
   */
  async getStats(): Promise<Result<{ total: number; active: number }, AppError>> {
    const activeResult = await this.repository.countActive()

    if (!activeResult.success) {
      return failure(activeResult.error)
    }

    // Get total count (including inactive)
    const totalResult = await this.repository.findAll({ page: 1, limit: 1 })

    if (!totalResult.success) {
      return failure(totalResult.error)
    }

    return success({
      total: totalResult.data.meta.total,
      active: activeResult.data,
    })
  }
}
