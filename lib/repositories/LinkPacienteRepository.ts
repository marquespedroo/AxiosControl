import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import type {
  LinkPaciente,
  LinkPacienteWithDetails,
  LinkTeste,
  LinkTesteInsert,
} from '@/types/database'

import { PaginationParams, PaginationResult } from './base/Repository'

/**
 * Repository for LinkPaciente (Link Hub) entity
 * Handles CRUD operations and specialized queries for patient links
 *
 * Note: Uses 'any' casting for Supabase queries because the tables
 * are created by migration and not yet in database.generated.ts
 */
export class LinkPacienteRepository {
  protected supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<Result<LinkPaciente | null, AppError>> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('links_paciente')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return success(null)
        return failure(new AppError('LINK_REPO_001', 'Erro ao buscar link'))
      }

      return success(data as LinkPaciente)
    } catch (error) {
      return failure(new AppError('LINK_REPO_002', 'Erro inesperado'))
    }
  }

  /**
   * Create new link
   */
  async create(data: Partial<LinkPaciente>): Promise<Result<LinkPaciente, AppError>> {
    try {
      console.log('[LinkPacienteRepository] create:', data)
      const { data: created, error } = await (this.supabase as any)
        .from('links_paciente')
        .insert(data)
        .select()
        .single()

      if (error) {
        console.error('[LinkPacienteRepository] create error:', error)
        return failure(new AppError('LINK_REPO_003', `Erro ao criar link: ${error.message}`))
      }

      console.log('[LinkPacienteRepository] create success:', created)
      return success(created as LinkPaciente)
    } catch (error) {
      console.error('[LinkPacienteRepository] create exception:', error)
      return failure(new AppError('LINK_REPO_004', 'Erro inesperado'))
    }
  }

  /**
   * Update link
   */
  async update(id: string, data: Partial<LinkPaciente>): Promise<Result<LinkPaciente, AppError>> {
    try {
      const { data: updated, error } = await (this.supabase as any)
        .from('links_paciente')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return failure(new AppError('LINK_REPO_005', 'Erro ao atualizar link'))
      }

      return success(updated as LinkPaciente)
    } catch (error) {
      return failure(new AppError('LINK_REPO_006', 'Erro inesperado'))
    }
  }

  /**
   * Find active link for a patient in a clinic
   */
  async findActiveByPaciente(
    pacienteId: string,
    clinicaId: string
  ): Promise<Result<LinkPaciente | null, AppError>> {
    try {
      console.log('[LinkPacienteRepository] findActiveByPaciente:', { pacienteId, clinicaId })
      const { data, error } = await (this.supabase as any)
        .from('links_paciente')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('clinica_id', clinicaId)
        .eq('status', 'ativo')
        .gt('data_expiracao', new Date().toISOString())
        .single()

      if (error) {
        console.log('[LinkPacienteRepository] findActiveByPaciente error:', error)
        if (error.code === 'PGRST116') return success(null)
        return failure(new AppError('LINK_REPO_007', `Erro ao buscar link ativo: ${error.message}`))
      }

      return success(data as LinkPaciente)
    } catch (error) {
      console.error('[LinkPacienteRepository] findActiveByPaciente exception:', error)
      return failure(new AppError('LINK_REPO_008', 'Erro inesperado ao buscar link'))
    }
  }

  /**
   * Find link by token (for patient portal access)
   */
  async findByToken(token: string): Promise<Result<LinkPaciente | null, AppError>> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('links_paciente')
        .select('*')
        .eq('link_token', token)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return success(null)
        return failure(new AppError('LINK_REPO_009', 'Erro ao buscar link por token'))
      }

      return success(data as LinkPaciente)
    } catch (error) {
      return failure(new AppError('LINK_REPO_010', 'Erro inesperado'))
    }
  }

  /**
   * Find all links for a clinic with pagination and filters
   */
  async findByClinica(
    clinicaId: string,
    pagination?: PaginationParams,
    filters?: { status?: string; pacienteId?: string }
  ): Promise<Result<PaginationResult<LinkPaciente>, AppError>> {
    try {
      let query = (this.supabase as any)
        .from('links_paciente')
        .select(`
          *,
          paciente:pacientes!links_paciente_paciente_id_fkey(nome_completo)
        `, { count: 'exact' })
        .eq('clinica_id', clinicaId)
        .order('paciente(nome_completo)', { ascending: true })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.pacienteId) {
        query = query.eq('paciente_id', filters.pacienteId)
      }

      if (pagination) {
        const offset = (pagination.page - 1) * pagination.limit
        query = query.range(offset, offset + pagination.limit - 1)
      }

      const { data, error, count } = await query

      if (error) {
        return failure(new AppError('LINK_REPO_011', 'Erro ao listar links'))
      }

      const total = count || 0
      const page = pagination?.page || 1
      const limit = pagination?.limit || total

      return success({
        data: (data || []) as LinkPaciente[],
        meta: { total, page, limit, totalPages: limit > 0 ? Math.ceil(total / limit) : 0 },
      })
    } catch (error) {
      return failure(new AppError('LINK_REPO_012', 'Erro inesperado ao listar'))
    }
  }

  /**
   * Find link with full details (paciente, psicologo, testes)
   */
  async findByIdWithDetails(id: string): Promise<Result<LinkPacienteWithDetails | null, AppError>> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('links_paciente')
        .select(`
          *,
          paciente:pacientes!links_paciente_paciente_id_fkey(id, nome_completo, data_nascimento),
          psicologo:users!links_paciente_psicologo_id_fkey(id, nome_completo)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return success(null)
        return failure(new AppError('LINK_REPO_013', 'Erro ao buscar link'))
      }

      // Fetch testes separately for better control
      const testesResult = await this.findTestesByLinkId(id)
      if (!testesResult.success) {
        return failure(testesResult.error)
      }

      const testes = testesResult.data
      const testesCompletos = testes.filter(t => t.teste_aplicado.status === 'completo').length
      const progressoGeral = testes.length > 0
        ? Math.round(testes.reduce((sum, t) => sum + t.teste_aplicado.progresso, 0) / testes.length)
        : 0

      const result: LinkPacienteWithDetails = {
        ...(data as LinkPaciente),
        paciente: data.paciente,
        psicologo: data.psicologo,
        testes,
        total_testes: testes.length,
        testes_completos: testesCompletos,
        progresso_geral: progressoGeral,
      }

      return success(result)
    } catch (error) {
      return failure(new AppError('LINK_REPO_014', 'Erro inesperado'))
    }
  }

  /**
   * Find testes associated with a link
   */
  async findTestesByLinkId(linkId: string): Promise<Result<LinkPacienteWithDetails['testes'], AppError>> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('link_testes')
        .select(`
          *,
          teste_aplicado:testes_aplicados!link_testes_teste_aplicado_id_fkey(
            id, status, progresso, data_conclusao,
            teste_template:testes_templates!testes_aplicados_teste_template_id_fkey(id, nome, sigla)
          )
        `)
        .eq('link_id', linkId)
        .order('ordem', { ascending: true })

      if (error) {
        return failure(new AppError('LINK_REPO_015', 'Erro ao buscar testes do link'))
      }

      const testes = (data || []).map((item: any) => ({
        ...item,
        teste_aplicado: {
          id: item.teste_aplicado.id,
          status: item.teste_aplicado.status,
          progresso: item.teste_aplicado.progresso,
          data_conclusao: item.teste_aplicado.data_conclusao,
        },
        teste_template: item.teste_aplicado.teste_template,
      }))

      return success(testes)
    } catch (error) {
      return failure(new AppError('LINK_REPO_016', 'Erro inesperado'))
    }
  }

  /**
   * Add teste to link
   */
  async addTeste(linkTesteData: LinkTesteInsert): Promise<Result<LinkTeste, AppError>> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('link_testes')
        .insert(linkTesteData)
        .select()
        .single()

      if (error) {
        return failure(new AppError('LINK_REPO_017', 'Erro ao adicionar teste ao link'))
      }

      return success(data as LinkTeste)
    } catch (error) {
      return failure(new AppError('LINK_REPO_018', 'Erro inesperado'))
    }
  }

  /**
   * Get next ordem number for a link
   */
  async getNextOrdem(linkId: string): Promise<Result<number, AppError>> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('link_testes')
        .select('ordem')
        .eq('link_id', linkId)
        .order('ordem', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return success(0)
        return failure(new AppError('LINK_REPO_019', 'Erro ao buscar ordem'))
      }

      return success((data?.ordem || 0) + 1)
    } catch (error) {
      return failure(new AppError('LINK_REPO_020', 'Erro inesperado'))
    }
  }

  /**
   * Increment failed attempts
   */
  async incrementTentativasFalhas(id: string): Promise<Result<number, AppError>> {
    try {
      const { data: link } = await (this.supabase as any)
        .from('links_paciente')
        .select('tentativas_falhas')
        .eq('id', id)
        .single()

      const newAttempts = (link?.tentativas_falhas || 0) + 1

      const { error } = await (this.supabase as any)
        .from('links_paciente')
        .update({ tentativas_falhas: newAttempts })
        .eq('id', id)

      if (error) {
        return failure(new AppError('LINK_REPO_021', 'Erro ao incrementar tentativas'))
      }

      return success(newAttempts)
    } catch (error) {
      return failure(new AppError('LINK_REPO_022', 'Erro inesperado'))
    }
  }

  /**
   * Update link status
   */
  async updateStatus(id: string, status: LinkPaciente['status']): Promise<Result<void, AppError>> {
    try {
      const { error } = await (this.supabase as any)
        .from('links_paciente')
        .update({ status })
        .eq('id', id)

      if (error) {
        return failure(new AppError('LINK_REPO_023', 'Erro ao atualizar status'))
      }

      return success(undefined)
    } catch (error) {
      return failure(new AppError('LINK_REPO_024', 'Erro inesperado'))
    }
  }

  /**
   * Record first access and clear plain code
   */
  async recordFirstAccess(id: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await (this.supabase as any)
        .from('links_paciente')
        .update({
          primeiro_acesso: new Date().toISOString(),
          ultimo_acesso: new Date().toISOString(),
        })
        .eq('id', id)
        .is('primeiro_acesso', null)

      if (error) {
        return failure(new AppError('LINK_REPO_025', 'Erro ao registrar primeiro acesso'))
      }

      return success(undefined)
    } catch (error) {
      return failure(new AppError('LINK_REPO_026', 'Erro inesperado'))
    }
  }

  /**
   * Update last access timestamp
   */
  async updateLastAccess(id: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await (this.supabase as any)
        .from('links_paciente')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        return failure(new AppError('LINK_REPO_027', 'Erro ao atualizar último acesso'))
      }

      return success(undefined)
    } catch (error) {
      return failure(new AppError('LINK_REPO_028', 'Erro inesperado'))
    }
  }
}
