import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { createAuditLog } from '@/lib/supabase/helpers'
import { Result, success, failure } from '@/types/core/result'
import { Paciente, PacienteInsert, PacienteUpdate } from '@/types/database'
import { Database } from '@/types/database.generated'

import { PaginationResult } from '../repositories/base/Repository'
import { PacienteRepository, PacienteSearchParams } from '../repositories/PacienteRepository'

/**
 * Service layer for Paciente entity
 * Implements business logic and validation
 */
export class PacienteService {
  private repository: PacienteRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new PacienteRepository(supabase)
  }

  /**
   * List patients with search and pagination
   */
  async list(params: PacienteSearchParams): Promise<Result<PaginationResult<Paciente>, AppError>> {
    // Validate pagination params
    if (params.page < 1) {
      return failure(new AppError('PAC_SVC_001', 'Número da página deve ser maior que 0'))
    }

    if (params.limit < 1 || params.limit > 100) {
      return failure(new AppError('PAC_SVC_002', 'Limite deve estar entre 1 e 100'))
    }

    return this.repository.findByClinica(params)
  }

  /**
   * Get patient by ID
   */
  async getById(id: string, clinica_id: string): Promise<Result<Paciente, AppError>> {
    const result = await this.repository.findByIdAndClinica(id, clinica_id)

    if (!result.success) {
      return failure(result.error)
    }

    if (!result.data) {
      return failure(new AppError('PAC_SVC_003', 'Paciente não encontrado', 404))
    }

    return success(result.data)
  }

  /**
   * Create a new patient
   */
  async create(data: PacienteInsert, usuario_id: string, ip_address: string, user_agent: string): Promise<Result<Paciente, AppError>> {
    // Validate required fields
    if (!data.nome_completo || !data.data_nascimento || !data.escolaridade_anos || !data.sexo) {
      return failure(new AppError('PAC_SVC_004', 'Campos obrigatórios faltando', 400))
    }

    // Validate CPF uniqueness if provided
    if (data.cpf) {
      const existingResult = await this.repository.findByCpf(data.cpf)
      if (!existingResult.success) {
        return failure(existingResult.error)
      }

      if (existingResult.data) {
        return failure(new AppError('PAC_SVC_005', 'CPF já cadastrado', 409))
      }
    }

    // Validate age
    const birthDate = new Date(data.data_nascimento)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()

    if (age < 0 || age > 150) {
      return failure(new AppError('PAC_SVC_006', 'Data de nascimento inválida', 400))
    }

    // Set default values
    const pacienteData: PacienteInsert = {
      ...data,
      ativo: true,
    }

    // Create patient
    const result = await this.repository.create(pacienteData)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'criar',
      entidade: 'pacientes',
      entidade_id: result.data.id,
      dados_anteriores: null,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Update patient
   */
  async update(
    id: string,
    data: PacienteUpdate,
    clinica_id: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<Paciente, AppError>> {
    // Get existing patient
    const existingResult = await this.repository.findByIdAndClinica(id, clinica_id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('PAC_SVC_007', 'Paciente não encontrado', 404))
    }

    const existingPaciente = existingResult.data

    // Validate CPF uniqueness if changing
    if (data.cpf && data.cpf !== existingPaciente.cpf) {
      const cpfResult = await this.repository.findByCpf(data.cpf)
      if (!cpfResult.success) {
        return failure(cpfResult.error)
      }

      if (cpfResult.data) {
        return failure(new AppError('PAC_SVC_008', 'CPF já cadastrado', 409))
      }
    }

    // Update patient
    const result = await this.repository.update(id, data)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'editar',
      entidade: 'pacientes',
      entidade_id: id,
      dados_anteriores: existingPaciente as any,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Delete patient (soft delete)
   */
  async delete(id: string, clinica_id: string, usuario_id: string, ip_address: string, user_agent: string): Promise<Result<void, AppError>> {
    // Get existing patient
    const existingResult = await this.repository.findByIdAndClinica(id, clinica_id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('PAC_SVC_009', 'Paciente não encontrado', 404))
    }

    const existingPaciente = existingResult.data

    // Soft delete
    const result = await this.repository.delete(id)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'deletar',
      entidade: 'pacientes',
      entidade_id: id,
      dados_anteriores: existingPaciente as any,
      dados_novos: null,
      ip_address,
      user_agent,
    })

    return success(undefined)
  }

  /**
   * Get patient statistics
   */
  async getStats(clinica_id: string): Promise<Result<{ total: number; active: number }, AppError>> {
    const totalResult = await this.repository.countByClinica(clinica_id)

    if (!totalResult.success) {
      return failure(totalResult.error)
    }

    return success({
      total: totalResult.data,
      active: totalResult.data, // All counted patients are active due to filter
    })
  }
}
