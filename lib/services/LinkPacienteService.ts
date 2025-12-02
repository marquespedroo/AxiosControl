import crypto from 'crypto'

import { SupabaseClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

import { AppError } from '@/lib/errors/AppError'
import { ConfiguracaoSistemaRepository } from '@/lib/repositories/ConfiguracaoSistemaRepository'
import { LinkPacienteRepository } from '@/lib/repositories/LinkPacienteRepository'
import { TesteAplicadoRepository } from '@/lib/repositories/TesteAplicadoRepository'
import { Result, success, failure } from '@/types/core/result'
import type {
  LinkPaciente,
  LinkPacienteWithDetails,
} from '@/types/database'
import { Database } from '@/types/database'


interface CreateLinkParams {
  pacienteId: string
  psicologoId: string
  clinicaId: string
  testeTemplateIds: string[]
  diasExpiracao?: number
}

interface ValidateAccessResult {
  link: LinkPaciente
  isFirstAccess: boolean
}

/**
 * Service for LinkPaciente (Link Hub) business logic
 * Handles link creation, validation, and test management
 */
export class LinkPacienteService {
  private linkRepo: LinkPacienteRepository
  private configRepo: ConfiguracaoSistemaRepository
  private testeRepo: TesteAplicadoRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.linkRepo = new LinkPacienteRepository(supabase)
    this.configRepo = new ConfiguracaoSistemaRepository(supabase)
    this.testeRepo = new TesteAplicadoRepository(supabase)
  }

  /**
   * Generate secure random token (64 chars)
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Generate 6-digit numeric code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Hash access code using bcrypt
   */
  private async hashCode(code: string): Promise<string> {
    return bcrypt.hash(code, 10)
  }

  /**
   * Verify access code against hash
   */
  private async verifyCode(code: string, hash: string): Promise<boolean> {
    return bcrypt.compare(code, hash)
  }

  /**
   * Create or get existing active link hub for patient
   * If active hub exists, add tests to it; otherwise create new hub
   */
  async createOrGetHub(params: CreateLinkParams): Promise<Result<LinkPacienteWithDetails, AppError>> {
    const { pacienteId, psicologoId, clinicaId, testeTemplateIds } = params

    console.log('[LinkPacienteService] createOrGetHub called with:', { pacienteId, psicologoId, clinicaId, testeTemplateIds })

    // Check for existing active hub
    const existingResult = await this.linkRepo.findActiveByPaciente(pacienteId, clinicaId)
    console.log('[LinkPacienteService] findActiveByPaciente result:', existingResult)
    if (!existingResult.success) return failure(existingResult.error)

    let linkId: string

    if (existingResult.data) {
      // Add tests to existing hub
      linkId = existingResult.data.id
      console.log('[LinkPacienteService] Using existing hub:', linkId)
    } else {
      // Create new hub
      console.log('[LinkPacienteService] Creating new hub...')
      const createResult = await this.createNewHub(params)
      console.log('[LinkPacienteService] createNewHub result:', createResult)
      if (!createResult.success) return failure(createResult.error)
      linkId = createResult.data.id
    }

    // Add tests to hub
    console.log('[LinkPacienteService] Adding tests to hub:', { linkId, testeTemplateIds })
    const addResult = await this.addTestesToHub(linkId, testeTemplateIds, pacienteId, psicologoId)
    console.log('[LinkPacienteService] addTestesToHub result:', addResult)
    if (!addResult.success) return failure(addResult.error)

    // Return full details
    const detailsResult = await this.linkRepo.findByIdWithDetails(linkId)
    console.log('[LinkPacienteService] findByIdWithDetails result:', detailsResult)
    if (!detailsResult.success) return failure(detailsResult.error)
    if (!detailsResult.data) {
      return failure(new AppError('LINK_SVC_001', 'Link não encontrado após criação'))
    }

    return success(detailsResult.data)
  }

  /**
   * Create a new link hub
   */
  private async createNewHub(params: CreateLinkParams): Promise<Result<LinkPaciente, AppError>> {
    const { pacienteId, psicologoId, clinicaId, diasExpiracao } = params

    // Get expiration days from config
    let expDias = diasExpiracao
    if (!expDias) {
      const configResult = await this.configRepo.getLinkExpiracaoDias(clinicaId)
      if (!configResult.success) return failure(configResult.error)
      expDias = configResult.data
    }

    const token = this.generateToken()
    const code = this.generateCode()
    const codeHash = await this.hashCode(code)

    const dataExpiracao = new Date()
    dataExpiracao.setDate(dataExpiracao.getDate() + expDias)

    const result = await this.linkRepo.create({
      paciente_id: pacienteId,
      psicologo_id: psicologoId,
      clinica_id: clinicaId,
      link_token: token,
      codigo_acesso_hash: codeHash,
      codigo_acesso_plain: code, // Stored temporarily for display
      data_expiracao: dataExpiracao.toISOString(),
      status: 'ativo',
      tentativas_falhas: 0,
      bloqueado: false,
      primeiro_acesso: null,
      ultimo_acesso: null,
    })

    return result
  }

  /**
   * Add tests to existing hub
   */
  async addTestesToHub(
    linkId: string,
    testeTemplateIds: string[],
    pacienteId: string,
    psicologoId: string
  ): Promise<Result<void, AppError>> {
    for (const templateId of testeTemplateIds) {
      // Create teste_aplicado for this test
      const testeResult = await this.testeRepo.create({
        paciente_id: pacienteId,
        psicologo_id: psicologoId,
        teste_template_id: templateId,
        tipo_aplicacao: 'remota',
        status: 'aguardando',
        progresso: 0,
        respostas: null,
        pontuacao_bruta: null,
        normalizacao: null,
        interpretacao: null,
        link_token: this.generateToken().substring(0, 16), // Max 50 chars in DB
        codigo_acesso: this.generateCode(),
        tentativas_codigo: 0,
        data_criacao: new Date().toISOString(),
        data_primeiro_acesso: null,
        data_conclusao: null,
        data_reabertura: null,
        motivo_reabertura: null,
        data_expiracao: null,
        tabela_normativa_id: null,
      })

      if (!testeResult.success) return failure(testeResult.error)

      // Get next ordem
      const ordemResult = await this.linkRepo.getNextOrdem(linkId)
      if (!ordemResult.success) return failure(ordemResult.error)

      // Link test to hub
      const linkTesteResult = await this.linkRepo.addTeste({
        link_id: linkId,
        teste_aplicado_id: testeResult.data.id,
        ordem: ordemResult.data,
      })

      if (!linkTesteResult.success) return failure(linkTesteResult.error)
    }

    return success(undefined)
  }

  /**
   * Validate patient access (token + code)
   */
  async validateAccess(token: string, code: string): Promise<Result<ValidateAccessResult, AppError>> {
    // Find link by token
    const linkResult = await this.linkRepo.findByToken(token)
    if (!linkResult.success) return failure(linkResult.error)
    if (!linkResult.data) {
      return failure(new AppError('LINK_SVC_002', 'Link inválido', 404))
    }

    const link = linkResult.data

    // Check if blocked
    if (link.bloqueado) {
      return failure(new AppError('LINK_SVC_003', 'Link bloqueado por excesso de tentativas', 403))
    }

    // Check if expired
    if (new Date(link.data_expiracao) < new Date()) {
      await this.linkRepo.updateStatus(link.id, 'expirado')
      return failure(new AppError('LINK_SVC_004', 'Link expirado', 403))
    }

    // Check status
    if (link.status !== 'ativo') {
      return failure(new AppError('LINK_SVC_005', `Link ${link.status}`, 403))
    }

    // Verify code
    const isValid = await this.verifyCode(code, link.codigo_acesso_hash)
    if (!isValid) {
      // Increment failed attempts
      const attemptsResult = await this.linkRepo.incrementTentativasFalhas(link.id)
      if (attemptsResult.success) {
        // Check if should block
        const maxResult = await this.configRepo.getLinkMaxTentativas(link.clinica_id)
        const max = maxResult.success ? maxResult.data : 5
        if (attemptsResult.data >= max) {
          await this.linkRepo.update(link.id, { bloqueado: true })
        }
      }
      return failure(new AppError('LINK_SVC_006', 'Código de acesso inválido', 401))
    }

    // Record access
    const isFirstAccess = !link.primeiro_acesso
    if (isFirstAccess) {
      await this.linkRepo.recordFirstAccess(link.id)
    } else {
      await this.linkRepo.updateLastAccess(link.id)
    }

    return success({ link, isFirstAccess })
  }

  /**
   * Get link details by ID
   */
  async getById(id: string): Promise<Result<LinkPacienteWithDetails | null, AppError>> {
    return this.linkRepo.findByIdWithDetails(id)
  }

  /**
   * Get link details by token (for patient portal)
   */
  async getByToken(token: string): Promise<Result<LinkPacienteWithDetails | null, AppError>> {
    const linkResult = await this.linkRepo.findByToken(token)
    if (!linkResult.success) return failure(linkResult.error)
    if (!linkResult.data) return success(null)

    return this.linkRepo.findByIdWithDetails(linkResult.data.id)
  }

  /**
   * Extend link expiration
   */
  async extendExpiracao(id: string, dias: number): Promise<Result<LinkPaciente, AppError>> {
    const linkResult = await this.linkRepo.findById(id)
    if (!linkResult.success) return failure(linkResult.error)
    if (!linkResult.data) {
      return failure(new AppError('LINK_SVC_007', 'Link não encontrado', 404))
    }

    const newExpiracao = new Date(linkResult.data.data_expiracao)
    newExpiracao.setDate(newExpiracao.getDate() + dias)

    // If link was expired and we're extending, reactivate it
    const newStatus = linkResult.data.status === 'expirado' ? 'ativo' : linkResult.data.status

    return this.linkRepo.update(id, {
      data_expiracao: newExpiracao.toISOString(),
      status: newStatus,
    })
  }

  /**
   * Revoke link (marks incomplete tests as abandoned)
   */
  async revogar(id: string): Promise<Result<void, AppError>> {
    // The trigger will handle marking tests as abandoned
    const result = await this.linkRepo.updateStatus(id, 'revogado')
    return result
  }

  /**
   * Generate copy message for sharing
   */
  generateShareMessage(
    pacienteNome: string,
    linkUrl: string,
    codigo: string,
    dataExpiracao: Date
  ): string {
    const expFormatted = dataExpiracao.toLocaleDateString('pt-BR')
    return `${pacienteNome}, o link para o seu(s) teste(s) é: ${linkUrl} e a senha de acesso é ${codigo}. Você tem até o dia ${expFormatted} para finaliza-lo(s). Em caso de dúvidas, por favor, entre em contato conosco`
  }

  /**
   * Build full link URL
   */
  buildLinkUrl(token: string, baseUrl: string): string {
    return `${baseUrl}/responder/${token}`
  }
}
