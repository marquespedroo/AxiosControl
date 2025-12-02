import { SupabaseClient } from '@supabase/supabase-js'
import { TabelaNormativaRepository, TabelaNormativaSearchParams } from '../repositories/TabelaNormativaRepository'
import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import { Database } from '@/types/database.generated'
import { TabelaNormativa, TabelaNormativaInsert, TabelaNormativaUpdate } from '@/types/database'
import { PaginationResult } from '../repositories/base/Repository'
import { createAuditLog } from '@/lib/supabase/helpers'

/**
 * Service layer for TabelaNormativa entity
 * Handles business logic for normative tables including CSV import
 */
export class TabelaNormativaService {
  private repository: TabelaNormativaRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new TabelaNormativaRepository(supabase)
  }

  /**
   * List normative tables with search and pagination
   */
  async list(params: TabelaNormativaSearchParams): Promise<Result<PaginationResult<TabelaNormativa>, AppError>> {
    // Validate pagination params
    if (params.page < 1) {
      return failure(new AppError('NORM_TABLE_SVC_001', 'Número da página deve ser maior que 0'))
    }

    if (params.limit < 1 || params.limit > 100) {
      return failure(new AppError('NORM_TABLE_SVC_002', 'Limite deve estar entre 1 e 100'))
    }

    return this.repository.findAll(params)
  }

  /**
   * Get normative table by ID
   */
  async getById(id: string): Promise<Result<TabelaNormativa, AppError>> {
    const result = await this.repository.findById(id)

    if (!result.success) {
      return failure(result.error)
    }

    if (!result.data) {
      return failure(new AppError('NORM_TABLE_SVC_003', 'Tabela normativa não encontrada', 404))
    }

    return success(result.data)
  }

  /**
   * Get normative tables by test ID
   */
  async getByTeste(teste_id: string): Promise<Result<TabelaNormativa[], AppError>> {
    if (!teste_id) {
      return failure(new AppError('NORM_TABLE_SVC_004', 'ID do teste é obrigatório'))
    }

    return this.repository.findByTeste(teste_id)
  }

  /**
   * Get default normative table for a test
   */
  async getDefault(teste_id: string): Promise<Result<TabelaNormativa | null, AppError>> {
    if (!teste_id) {
      return failure(new AppError('NORM_TABLE_SVC_005', 'ID do teste é obrigatório'))
    }

    return this.repository.findDefault(teste_id)
  }

  /**
   * Find best matching normative table for patient
   */
  async getBestMatch(
    teste_id: string,
    idade: number,
    sexo: 'M' | 'F',
    escolaridade?: string
  ): Promise<Result<TabelaNormativa | null, AppError>> {
    if (!teste_id) {
      return failure(new AppError('NORM_TABLE_SVC_006', 'ID do teste é obrigatório'))
    }

    if (idade < 0) {
      return failure(new AppError('NORM_TABLE_SVC_007', 'Idade deve ser maior ou igual a zero'))
    }

    if (!['M', 'F'].includes(sexo)) {
      return failure(new AppError('NORM_TABLE_SVC_008', 'Sexo deve ser M ou F'))
    }

    return this.repository.findBestMatch(teste_id, idade, sexo, escolaridade)
  }

  /**
   * Create a new normative table
   */
  async create(
    data: TabelaNormativaInsert,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<TabelaNormativa, AppError>> {
    // Validate required fields
    const validationResult = this.validateNormativeTable(data)
    if (!validationResult.success) {
      return failure(validationResult.error)
    }

    // Create normative table
    const result = await this.repository.create(data)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'criar',
      entidade: 'tabelas_normativas',
      entidade_id: result.data.id,
      dados_anteriores: null,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Update normative table
   */
  async update(
    id: string,
    data: TabelaNormativaUpdate,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<TabelaNormativa, AppError>> {
    // Get existing table
    const existingResult = await this.repository.findById(id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('NORM_TABLE_SVC_009', 'Tabela normativa não encontrada', 404))
    }

    const existingTable = existingResult.data

    // Update normative table
    const result = await this.repository.update(id, data)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'editar',
      entidade: 'tabelas_normativas',
      entidade_id: id,
      dados_anteriores: existingTable as any,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Delete normative table
   */
  async delete(
    id: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<void, AppError>> {
    // Get existing table
    const existingResult = await this.repository.findById(id)

    if (!existingResult.success) {
      return failure(existingResult.error)
    }

    if (!existingResult.data) {
      return failure(new AppError('NORM_TABLE_SVC_010', 'Tabela normativa não encontrada', 404))
    }

    const existingTable = existingResult.data

    // Delete normative table
    const result = await this.repository.delete(id)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'deletar',
      entidade: 'tabelas_normativas',
      entidade_id: id,
      dados_anteriores: existingTable as any,
      dados_novos: null,
      ip_address,
      user_agent,
    })

    return success(undefined)
  }

  /**
   * Set a normative table as default for a test
   */
  async setDefault(
    id: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<TabelaNormativa, AppError>> {
    // Get table to validate it exists
    const tableResult = await this.repository.findById(id)

    if (!tableResult.success) {
      return failure(tableResult.error)
    }

    if (!tableResult.data) {
      return failure(new AppError('NORM_TABLE_SVC_011', 'Tabela normativa não encontrada', 404))
    }

    // Set as default
    const result = await this.repository.setAsDefault(id, tableResult.data.teste_template_id)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'editar',
      entidade: 'tabelas_normativas',
      entidade_id: id,
      dados_anteriores: null,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Parse CSV data into normative table structure
   */
  parseCSV(csvContent: string): Result<any[], AppError> {
    try {
      const lines = csvContent.trim().split('\n')

      if (lines.length < 2) {
        return failure(new AppError('NORM_TABLE_SVC_012', 'CSV vazio ou inválido', 400))
      }

      // Get headers
      const headers = lines[0].split(',').map(h => h.trim())

      // Validate required headers
      const requiredHeaders = ['pontuacao_bruta', 'percentil', 'z_score', 't_score']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

      if (missingHeaders.length > 0) {
        return failure(
          new AppError(
            'NORM_TABLE_SVC_013',
            `Headers obrigatórios ausentes: ${missingHeaders.join(', ')}`,
            400
          )
        )
      }

      // Parse data rows
      const data = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())

        if (values.length !== headers.length) {
          return failure(
            new AppError(
              'NORM_TABLE_SVC_014',
              `Linha ${i + 1}: número de colunas não corresponde aos headers`,
              400
            )
          )
        }

        const row: any = {}
        headers.forEach((header, index) => {
          const value = values[index]

          // Convert numeric fields
          if (['pontuacao_bruta', 'percentil', 'z_score', 't_score'].includes(header)) {
            row[header] = parseFloat(value)

            if (isNaN(row[header])) {
              throw new Error(`Linha ${i + 1}: valor numérico inválido para ${header}`)
            }
          } else {
            row[header] = value
          }
        })

        data.push(row)
      }

      return success(data)
    } catch (error) {
      return failure(
        new AppError(
          'NORM_TABLE_SVC_015',
          error instanceof Error ? error.message : 'Erro ao parsear CSV',
          400,
          { cause: error }
        )
      )
    }
  }

  /**
   * Import normative data from CSV
   */
  async importCSV(
    teste_id: string,
    csvContent: string,
    metadata: {
      nome: string
      faixa_etaria_min: number
      faixa_etaria_max: number
      sexo: 'M' | 'F' | 'ambos'
      escolaridade?: string
      is_default?: boolean
    },
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<TabelaNormativa, AppError>> {
    // Parse CSV
    const parseResult = this.parseCSV(csvContent)

    if (!parseResult.success) {
      return failure(parseResult.error)
    }

    const csvData = parseResult.data

    // Transform CSV data into percentiles object
    const percentis: any = {
      5: 0, 10: 0, 25: 0, 50: 0, 75: 0, 90: 0, 95: 0
    }

    // Find scores for standard percentiles
    // Assuming CSV has rows with 'percentil' and 'pontuacao_bruta'
    const standardPercentiles = [5, 10, 25, 50, 75, 90, 95]

    standardPercentiles.forEach(p => {
      // Find row with closest percentile
      const row = csvData.reduce((prev, curr) =>
        Math.abs(curr.percentil - p) < Math.abs(prev.percentil - p) ? curr : prev
      )
      percentis[p] = row.pontuacao_bruta
    })

    // Create FaixaNormativa
    const faixa: any = {
      idade_min: metadata.faixa_etaria_min,
      idade_max: metadata.faixa_etaria_max,
      escolaridade_min: 0, // Default
      escolaridade_max: 99, // Default
      sexo: metadata.sexo === 'ambos' ? undefined : metadata.sexo,
      n: 0, // Unknown from CSV
      media: 0, // Unknown from CSV
      desvio_padrao: 0, // Unknown from CSV
      percentis
    }

    // Create normative table with parsed data
    const tableData: TabelaNormativaInsert = {
      teste_template_id: teste_id,
      nome: metadata.nome,
      pais: 'Brasil', // Default
      regiao: null,
      ano_coleta: new Date().getFullYear(),
      tamanho_amostra: 0,
      variaveis_estratificacao: ['idade', 'sexo'],
      faixas: [faixa],
      ativo: true,
      padrao: metadata.is_default || false,
    }

    // Validate
    const validationResult = this.validateNormativeTable(tableData)
    if (!validationResult.success) {
      return failure(validationResult.error)
    }

    // Create table
    const result = await this.repository.create(tableData)

    if (!result.success) {
      return failure(result.error)
    }

    // Create audit log
    await createAuditLog({
      usuario_id,
      acao: 'criar',
      entidade: 'tabelas_normativas',
      entidade_id: result.data.id,
      dados_anteriores: null,
      dados_novos: result.data as any,
      ip_address,
      user_agent,
    })

    return result
  }

  /**
   * Validate normative table data
   */
  private validateNormativeTable(data: TabelaNormativaInsert): Result<void, AppError> {
    // Validate nome
    if (!data.nome || data.nome.trim().length < 3) {
      return failure(
        new AppError('NORM_TABLE_SVC_016', 'Nome deve ter no mínimo 3 caracteres', 400)
      )
    }

    // Validate faixas
    if (!data.faixas || !Array.isArray(data.faixas) || data.faixas.length === 0) {
      return failure(
        new AppError('NORM_TABLE_SVC_020', 'Tabela deve conter pelo menos uma faixa normativa', 400)
      )
    }

    return success(undefined)
  }
}
