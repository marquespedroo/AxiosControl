import { SupabaseClient } from '@supabase/supabase-js'
import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import { Database } from '@/types/database.generated'
import { TesteAplicado } from '@/types/database'
import { ConfiguracaoSistemaRepository } from '../repositories/ConfiguracaoSistemaRepository'
import { TesteAplicadoRepository } from '../repositories/TesteAplicadoRepository'
import * as crypto from 'crypto'

/**
 * Service for Handoff Mode (Modo Entrega)
 * Manages PIN-protected test sessions for in-person patient use
 *
 * PIN is stored as a hash directly on the testes_aplicados record
 * to persist across serverless function invocations
 */
export class HandoffService {
  private configRepo: ConfiguracaoSistemaRepository
  private testeRepo: TesteAplicadoRepository
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
    this.configRepo = new ConfiguracaoSistemaRepository(supabase)
    this.testeRepo = new TesteAplicadoRepository(supabase)
  }

  /**
   * Hash PIN using SHA-256
   */
  private hashPin(pin: string): string {
    return crypto.createHash('sha256').update(pin).digest('hex')
  }

  /**
   * Initialize handoff session with PIN
   * Stores the PIN hash on the testes_aplicados record
   */
  async iniciarSessao(
    testeAplicadoId: string,
    pin: string,
    _clinicaId: string
  ): Promise<Result<{ sessionId: string; teste: TesteAplicado }, AppError>> {
    // Validate PIN format
    if (!/^\d{4}$/.test(pin)) {
      return failure(new AppError('HANDOFF_001', 'PIN deve ter 4 dígitos numéricos'))
    }

    // Verify teste exists and is valid for handoff
    const testeResult = await this.testeRepo.findById(testeAplicadoId)
    if (!testeResult.success) return failure(testeResult.error)
    if (!testeResult.data) {
      return failure(new AppError('HANDOFF_002', 'Teste não encontrado', 404))
    }

    const teste = testeResult.data
    if (teste.status === 'completo') {
      return failure(new AppError('HANDOFF_003', 'Teste já foi finalizado'))
    }
    if (teste.status === 'bloqueado' || teste.status === 'abandonado') {
      return failure(new AppError('HANDOFF_004', `Teste está ${teste.status}`))
    }

    // Store PIN hash and update teste to entrega mode
    const pinHash = this.hashPin(pin)

    const { error } = await this.supabase
      .from('testes_aplicados')
      .update({
        tipo_aplicacao: 'entrega',
        status: 'em_andamento',
        data_primeiro_acesso: teste.data_primeiro_acesso || new Date().toISOString(),
        // Store PIN hash in metadata field
        metadata: {
          ...(teste.metadata || {}),
          handoff_pin_hash: pinHash,
          handoff_tentativas_falhas: 0,
          handoff_bloqueado: false,
          handoff_started_at: new Date().toISOString(),
        }
      })
      .eq('id', testeAplicadoId)

    if (error) {
      console.error('Error storing PIN hash:', error)
      return failure(new AppError('HANDOFF_008', 'Erro ao configurar modo entrega'))
    }

    // Use testeAplicadoId as sessionId since it's unique and persistent
    return success({ sessionId: testeAplicadoId, teste: testeResult.data })
  }

  /**
   * Validate PIN to exit handoff mode
   */
  async validarPin(
    sessionId: string, // This is actually testeAplicadoId
    pin: string,
    clinicaId: string
  ): Promise<Result<{ valid: boolean; remainingAttempts: number }, AppError>> {
    // Fetch the teste with PIN hash from database
    const { data: teste, error } = await this.supabase
      .from('testes_aplicados')
      .select('id, metadata')
      .eq('id', sessionId)
      .single()

    if (error || !teste) {
      return failure(new AppError('HANDOFF_005', 'Sessão não encontrada', 404))
    }

    const metadata = (teste.metadata || {}) as Record<string, any>
    const storedPinHash = metadata.handoff_pin_hash

    if (!storedPinHash) {
      return failure(new AppError('HANDOFF_005', 'Sessão de entrega não encontrada', 404))
    }

    // Check if blocked
    if (metadata.handoff_bloqueado) {
      return failure(new AppError('HANDOFF_007', 'Sessão bloqueada por excesso de tentativas', 403))
    }

    // Get max attempts from config
    const maxResult = await this.configRepo.getHandoffMaxTentativas(clinicaId)
    const maxAttempts = maxResult.success ? maxResult.data : 3

    const currentAttempts = metadata.handoff_tentativas_falhas || 0

    // Verify PIN
    const isValid = this.hashPin(pin) === storedPinHash

    if (!isValid) {
      const newAttempts = currentAttempts + 1
      const isNowBlocked = newAttempts >= maxAttempts

      // Update attempts in database
      await this.supabase
        .from('testes_aplicados')
        .update({
          metadata: {
            ...metadata,
            handoff_tentativas_falhas: newAttempts,
            handoff_bloqueado: isNowBlocked,
          }
        })
        .eq('id', sessionId)

      return success({
        valid: false,
        remainingAttempts: Math.max(0, maxAttempts - newAttempts),
      })
    }

    // PIN valid - clear handoff data from metadata
    await this.supabase
      .from('testes_aplicados')
      .update({
        metadata: {
          ...metadata,
          handoff_pin_hash: null,
          handoff_tentativas_falhas: 0,
          handoff_bloqueado: false,
          handoff_ended_at: new Date().toISOString(),
        }
      })
      .eq('id', sessionId)

    return success({ valid: true, remainingAttempts: maxAttempts })
  }

  /**
   * Check if a test has an active handoff session
   */
  async hasActiveSession(testeAplicadoId: string): Promise<boolean> {
    const { data: teste } = await this.supabase
      .from('testes_aplicados')
      .select('metadata')
      .eq('id', testeAplicadoId)
      .single()

    if (!teste) return false

    const metadata = (teste.metadata || {}) as Record<string, any>
    return !!metadata.handoff_pin_hash && !metadata.handoff_bloqueado
  }

  /**
   * Force end session (admin action)
   */
  async endSession(testeAplicadoId: string): Promise<Result<void, AppError>> {
    const { data: teste } = await this.supabase
      .from('testes_aplicados')
      .select('metadata')
      .eq('id', testeAplicadoId)
      .single()

    if (!teste) {
      return failure(new AppError('HANDOFF_002', 'Teste não encontrado', 404))
    }

    const metadata = (teste.metadata || {}) as Record<string, any>

    await this.supabase
      .from('testes_aplicados')
      .update({
        metadata: {
          ...metadata,
          handoff_pin_hash: null,
          handoff_tentativas_falhas: 0,
          handoff_bloqueado: false,
          handoff_ended_at: new Date().toISOString(),
        }
      })
      .eq('id', testeAplicadoId)

    return success(undefined)
  }
}
