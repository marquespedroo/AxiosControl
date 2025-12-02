import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { createAuditLog } from '@/lib/supabase/helpers'
import { Result, success, failure } from '@/types/core/result'
import { RegistroManual, RegistroManualInsert, RegistroManualUpdate } from '@/types/database'
import { Database } from '@/types/database.generated'

import { PaginationResult } from '../repositories/base/Repository'
import { RegistroManualRepository, RegistroManualSearchParams } from '../repositories/RegistroManualRepository'

/**
 * Service layer for RegistroManual entity
 * Handles business logic for manual test records including file uploads
 */
export class RegistroManualService {
  private repository: RegistroManualRepository
  private supabase: SupabaseClient<Database>
  private readonly STORAGE_BUCKET = 'registros-manuais'
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private readonly ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
  ]

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new RegistroManualRepository(supabase)
    this.supabase = supabase
  }

  /**
   * List manual records with search and pagination
   */
  async list(params: RegistroManualSearchParams): Promise<Result<PaginationResult<RegistroManual>, AppError>> {
    // Validate pagination params
    if (params.page < 1) {
      return failure(new AppError('REG_MANUAL_SVC_001', 'Número da página deve ser maior que 0'))
    }

    if (params.limit < 1 || params.limit > 100) {
      return failure(new AppError('REG_MANUAL_SVC_002', 'Limite deve estar entre 1 e 100'))
    }

    return this.repository.findAll(params)
  }

  /**
   * Get manual record by ID
   */
  async getById(id: string): Promise<Result<RegistroManual, AppError>> {
    const result = await this.repository.findById(id)

    if (!result.success) {
      return failure(result.error)
    }

    if (!result.data) {
      return failure(new AppError('REG_MANUAL_SVC_003', 'Registro não encontrado', 404))
    }

    return success(result.data)
  }

  /**
   * Get manual records by patient
   */
  async getByPaciente(paciente_id: string): Promise<Result<RegistroManual[], AppError>> {
    if (!paciente_id) {
      return failure(new AppError('REG_MANUAL_SVC_004', 'ID do paciente é obrigatório'))
    }

    return this.repository.findByPaciente(paciente_id)
  }

  /**
   * Create a new manual record
   */
  async create(
    data: RegistroManualInsert,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<RegistroManual, AppError>> {
    // Validate required fields
    const validationResult = this.validateManualRecord(data)
    if (!validationResult.success) {
      return failure(validationResult.error)
    }

    // Create manual record
    const result = await this.repository.create(data)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'criar',
      entidade: 'registros_manuais',
      entidade_id: result.data.id,
      dados_anteriores: null,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Update manual record
   */
  async update(
    id: string,
    data: RegistroManualUpdate,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<RegistroManual, AppError>> {
    // Get existing record
    const existingResult = await this.repository.findById(id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('REG_MANUAL_SVC_005', 'Registro não encontrado', 404))
    }

    const existingRecord = existingResult.data

    // Update manual record
    const result = await this.repository.update(id, data)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'editar',
      entidade: 'registros_manuais',
      entidade_id: id,
      dados_anteriores: existingRecord as any,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Delete manual record
   */
  async delete(
    id: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<void, AppError>> {
    // Get existing record
    const existingResult = await this.repository.findById(id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('REG_MANUAL_SVC_006', 'Registro não encontrado', 404))
    }

    const existingRecord = existingResult.data

    // Delete files from storage if any
    if (existingRecord.anexos && existingRecord.anexos.length > 0) {
      for (const anexo of existingRecord.anexos) {
        await this.deleteFileFromStorage(anexo.url)
      }
    }

    // Delete manual record
    const result = await this.repository.delete(id)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'deletar',
      entidade: 'registros_manuais',
      entidade_id: id,
      dados_anteriores: existingRecord as any,
      dados_novos: null,
      ip_address,
      user_agent,
    })

    return success(undefined)
  }

  /**
   * Upload file to Supabase Storage and attach to manual record
   */
  async uploadFile(
    record_id: string,
    file: File,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<{ url: string; record: RegistroManual }, AppError>> {
    // Validate file
    const fileValidation = this.validateFile(file)
    if (!fileValidation.success) {
      return failure(fileValidation.error)
    }

    try {
      // Generate unique file name
      const timestamp = Date.now()
      const fileName = `${record_id}/${timestamp}-${file.name}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        return failure(
          new AppError('REG_MANUAL_SVC_007', 'Erro ao fazer upload do arquivo', 500, {
            cause: uploadError,
          })
        )
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(uploadData.path)

      const fileUrl = urlData.publicUrl

      // Attach file to record
      const attachResult = await this.repository.attachFile(record_id, fileUrl)

      if (!attachResult.success) {
        // Rollback: delete uploaded file
        await this.deleteFileFromStorage(fileUrl)
        return failure(attachResult.error)
      }

      // Create audit log
      await createAuditLog({
        usuario_id,
        acao: 'editar',
        entidade: 'registros_manuais',
        entidade_id: record_id,
        dados_anteriores: null,
        dados_novos: { file_url: fileUrl } as any,
        ip_address,
        user_agent,
      })

      return success({
        url: fileUrl,
        record: attachResult.data,
      })
    } catch (error) {
      return failure(
        new AppError('REG_MANUAL_SVC_008', 'Erro inesperado ao fazer upload', 500, { cause: error })
      )
    }
  }

  /**
   * Delete file from storage and remove from record
   */
  async deleteFile(
    record_id: string,
    fileUrl: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<RegistroManual, AppError>> {
    try {
      // Remove file from record
      const removeResult = await this.repository.removeFile(record_id, fileUrl)

      if (!removeResult.success) {
        return failure(removeResult.error)
      }

      // Delete from storage
      await this.deleteFileFromStorage(fileUrl)

      // Create audit log
      await createAuditLog({
        usuario_id,
        acao: 'editar',
        entidade: 'registros_manuais',
        entidade_id: record_id,
        dados_anteriores: { file_url: fileUrl } as any,
        dados_novos: null,
        ip_address,
        user_agent,
      })

      return success(removeResult.data)
    } catch (error) {
      return failure(
        new AppError('REG_MANUAL_SVC_009', 'Erro ao deletar arquivo', 500, { cause: error })
      )
    }
  }

  /**
   * Delete file from Supabase Storage
   */
  private async deleteFileFromStorage(fileUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split(`/${this.STORAGE_BUCKET}/`)
      if (urlParts.length < 2) return

      const filePath = urlParts[1]

      await this.supabase.storage.from(this.STORAGE_BUCKET).remove([filePath])
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Error deleting file from storage:', error)
    }
  }

  /**
   * Validate file for upload
   */
  private validateFile(file: File): Result<void, AppError> {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return failure(
        new AppError(
          'REG_MANUAL_SVC_010',
          `Arquivo muito grande. Tamanho máximo: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
          400
        )
      )
    }

    // Check file type
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return failure(
        new AppError('REG_MANUAL_SVC_011', 'Tipo de arquivo não permitido', 400)
      )
    }

    return success(undefined)
  }

  /**
   * Validate manual record data
   */
  private validateManualRecord(data: RegistroManualInsert): Result<void, AppError> {
    // Validate tipo_teste
    if (!data.nome_teste || data.nome_teste.trim().length < 3) {
      return failure(
        new AppError('REG_MANUAL_SVC_012', 'Tipo de teste deve ter no mínimo 3 caracteres', 400)
      )
    }

    // Validate data_aplicacao
    if (!data.data_aplicacao) {
      return failure(
        new AppError('REG_MANUAL_SVC_013', 'Data de aplicação é obrigatória', 400)
      )
    }

    return success(undefined)
  }
}
