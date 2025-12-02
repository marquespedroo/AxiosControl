import crypto from 'crypto'

import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { createAuditLog } from '@/lib/supabase/helpers'
import { Result, success, failure } from '@/types/core/result'
import { LinkPaciente as LinkAcesso } from '@/types/database'
import { Database } from '@/types/database.generated'

/**
 * Service layer for LinkAcesso entity
 * Handles link generation, validation, and access control
 */
export class LinkService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * Generate a secure random token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Generate a 6-digit numeric code
   */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Generate a new access link with token and optional 6-digit code
   */
  async generateToken(
    teste_aplicado_id: string,
    expira_em: Date,
    usuario_id: string,
    ip_address: string,
    user_agent: string,
    requer_codigo: boolean = false
  ): Promise<Result<LinkAcesso, AppError>> {
    try {
      // Generate token
      const token = this.generateSecureToken()

      // Generate code if required
      const codigo_acesso = requer_codigo ? this.generateCode() : null

      // Create link
      const { data, error } = await this.supabase
        .from('links_paciente')
        .insert({
          clinica_id: '00000000-0000-0000-0000-000000000000', // TODO: Need clinica_id from context or user
          paciente_id: '00000000-0000-0000-0000-000000000000', // TODO: Need paciente_id from somewhere
          psicologo_id: usuario_id,
          link_token: token,
          codigo_acesso_hash: codigo_acesso || '', // TODO: Hash this
          data_expiracao: expira_em.toISOString(),
          status: 'ativo',
          tentativas_falhas: 0,
          bloqueado: false,
        })
        .select()
        .single()

      if (error) {
        return failure(new AppError('LINK_SVC_001', 'Erro ao gerar link de acesso', 500, { cause: error }))
      }

      // Create link_teste
      const { error: linkTesteError } = await this.supabase
        .from('link_testes')
        .insert({
          link_id: data.id,
          teste_aplicado_id,
          ordem: 1
        })

      if (linkTesteError) {
        return failure(new AppError('LINK_SVC_001b', 'Erro ao vincular teste ao link', 500, { cause: linkTesteError }))
      }



      // Create audit log
      await createAuditLog({
        usuario_id,
        acao: 'criar' as any,
        entidade: 'links_paciente',
        entidade_id: data.id,
        dados_anteriores: null,
        dados_novos: data as any,
        ip_address,
        user_agent,
      })

      return success(data as LinkAcesso)
    } catch (error) {
      return failure(new AppError('LINK_SVC_002', 'Erro inesperado ao gerar link', 500, { cause: error }))
    }
  }

  /**
   * Validate access link token
   */
  async validate(token: string): Promise<Result<LinkAcesso, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from('links_paciente')
        .select('*')
        .eq('link_token', token)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return failure(new AppError('LINK_SVC_003', 'Link inválido', 404))
        }
        return failure(new AppError('LINK_SVC_004', 'Erro ao validar link', 500, { cause: error }))
      }

      const link = data as LinkAcesso

      // Check if link is active
      if (link.status !== 'ativo') {
        return failure(new AppError('LINK_SVC_005', 'Link desativado', 403))
      }

      // Check if link is blocked
      if (link.bloqueado) {
        return failure(
          new AppError('LINK_SVC_006', 'Link bloqueado por excesso de tentativas', 403)
        )
      }

      // Check if link is expired
      const now = new Date()
      const expiresAt = new Date(link.data_expiracao)

      if (now > expiresAt) {
        return failure(new AppError('LINK_SVC_007', 'Link expirado', 403))
      }

      return success(link)
    } catch (error) {
      return failure(new AppError('LINK_SVC_008', 'Erro inesperado ao validar link', 500, { cause: error }))
    }
  }

  /**
   * Authenticate with token and optional 6-digit code
   */
  async authenticate(
    token: string,
    codigo?: string
  ): Promise<Result<{ link: LinkAcesso; teste_aplicado_id: string }, AppError>> {
    // Validate token
    const validateResult = await this.validate(token)

    if (!validateResult.success) {
      return failure(validateResult.error)
    }

    const link = validateResult.data

    // Check if code is required
    if (link.codigo_acesso_plain) {
      if (!codigo) {
        return failure(
          new AppError('LINK_SVC_009', 'Código de acesso obrigatório', 400)
        )
      }

      if (codigo !== link.codigo_acesso_plain) {
        // Increment failed attempts
        await this.incrementAttempts(link.id)

        return failure(
          new AppError('LINK_SVC_010', 'Código de acesso inválido', 401)
        )
      }
    }

    // Update last access
    await this.supabase
      .from('links_paciente')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', link.id)

    return success({
      link,
      teste_aplicado_id: '', // TODO: Fix this, LinkPaciente doesn't have teste_aplicado_id directly
    })
  }

  /**
   * Increment failed attempts and block if threshold reached
   */
  async incrementAttempts(link_id: string): Promise<Result<void, AppError>> {
    try {
      // Get current attempts
      const { data: link, error: fetchError } = await this.supabase
        .from('links_paciente')
        .select('tentativas_falhas')
        .eq('id', link_id)
        .single()

      if (fetchError) {
        return failure(new AppError('LINK_SVC_011', 'Erro ao buscar link', 500, { cause: fetchError }))
      }

      const newAttempts = (link.tentativas_falhas || 0) + 1
      const shouldBlock = newAttempts >= 3

      // Update attempts and block if needed
      const { error: updateError } = await this.supabase
        .from('links_paciente')
        .update({
          tentativas_falhas: newAttempts,
          bloqueado: shouldBlock,
        })
        .eq('id', link_id)

      if (updateError) {
        return failure(new AppError('LINK_SVC_012', 'Erro ao atualizar tentativas', 500, { cause: updateError }))
      }

      return success(undefined)
    } catch (error) {
      return failure(new AppError('LINK_SVC_013', 'Erro inesperado ao atualizar tentativas', 500, { cause: error }))
    }
  }

  /**
   * Block access link
   */
  async block(
    link_id: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<void, AppError>> {
    try {
      // Get link before blocking
      const { data: link, error: fetchError } = await this.supabase
        .from('links_paciente')
        .select('*')
        .eq('id', link_id)
        .single()

      if (fetchError) {
        return failure(new AppError('LINK_SVC_014', 'Link não encontrado', 404, { cause: fetchError }))
      }

      // Block link
      const { error: updateError } = await this.supabase
        .from('links_paciente')
        .update({ bloqueado: true })
        .eq('id', link_id)

      if (updateError) {
        return failure(new AppError('LINK_SVC_015', 'Erro ao bloquear link', 500, { cause: updateError }))
      }

      // Create audit log
      await createAuditLog({
        usuario_id,
        acao: 'editar' as any,
        entidade: 'links_acesso',
        entidade_id: link_id,
        dados_anteriores: link as any,
        dados_novos: { ...link, bloqueado: true } as any,
        ip_address,
        user_agent,
      })

      return success(undefined)
    } catch (error) {
      return failure(new AppError('LINK_SVC_016', 'Erro inesperado ao bloquear link', 500, { cause: error }))
    }
  }

  /**
   * Deactivate access link
   */
  async deactivate(
    link_id: string,
    usuario_id: string,
    ip_address: string,
    user_agent: string
  ): Promise<Result<void, AppError>> {
    try {
      // Get link before deactivating
      const { data: link, error: fetchError } = await this.supabase
        .from('links_paciente')
        .select('*')
        .eq('id', link_id)
        .single()

      if (fetchError) {
        return failure(new AppError('LINK_SVC_017', 'Link não encontrado', 404, { cause: fetchError }))
      }

      // Deactivate link
      const { error: updateError } = await this.supabase
        .from('links_paciente')
        .update({ status: 'revogado' })
        .eq('id', link_id)

      if (updateError) {
        return failure(new AppError('LINK_SVC_018', 'Erro ao desativar link', 500, { cause: updateError }))
      }

      // Create audit log
      await createAuditLog({
        usuario_id,
        acao: 'editar' as any,
        entidade: 'links_acesso',
        entidade_id: link_id,
        dados_anteriores: link as any,
        dados_novos: { ...link, status: 'revogado' } as any,
        ip_address,
        user_agent,
      })

      return success(undefined)
    } catch (error) {
      return failure(new AppError('LINK_SVC_019', 'Erro inesperado ao desativar link', 500, { cause: error }))
    }
  }

  /**
   * Get link by test application ID
   */
  async getByTesteAplicado(teste_aplicado_id: string): Promise<Result<LinkAcesso | null, AppError>> {
    try {
      // First find the link_id from link_testes
      const { data: linkTeste, error: linkTesteError } = await this.supabase
        .from('link_testes')
        .select('link_id')
        .eq('teste_aplicado_id', teste_aplicado_id)
        .single()

      if (linkTesteError) {
        if (linkTesteError.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('LINK_SVC_020a', 'Erro ao buscar vínculo do teste', 500, { cause: linkTesteError }))
      }

      const { data, error } = await this.supabase
        .from('links_paciente')
        .select('*')
        .eq('id', linkTeste.link_id)
        .eq('status', 'ativo')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null)
        }
        return failure(new AppError('LINK_SVC_020', 'Erro ao buscar link', 500, { cause: error }))
      }

      return success(data as LinkAcesso)
    } catch (error) {
      return failure(new AppError('LINK_SVC_021', 'Erro inesperado ao buscar link', 500, { cause: error }))
    }
  }
}
