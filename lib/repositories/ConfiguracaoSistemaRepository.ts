import { SupabaseClient } from '@supabase/supabase-js'
import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import type { ConfiguracaoSistema } from '@/types/database'

/**
 * Repository for ConfiguracaoSistema entity
 * Handles system configuration with clinic-specific overrides
 *
 * Note: Uses 'any' casting for Supabase queries because the table
 * is created by migration and not yet in database.generated.ts
 */
export class ConfiguracaoSistemaRepository {
  protected supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Get configuration value with clinic override fallback
   * Priority: clinic-specific > global
   */
  async getConfig<T = unknown>(
    chave: string,
    clinicaId?: string
  ): Promise<Result<T | null, AppError>> {
    try {
      // First try clinic-specific config
      if (clinicaId) {
        const { data: clinicConfig, error: clinicError } = await (this.supabase as any)
          .from('configuracoes_sistema')
          .select('valor')
          .eq('chave', chave)
          .eq('clinica_id', clinicaId)
          .single()

        if (!clinicError && clinicConfig) {
          return success(clinicConfig.valor as T)
        }
      }

      // Fall back to global config
      const { data: globalConfig, error: globalError } = await (this.supabase as any)
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', chave)
        .is('clinica_id', null)
        .single()

      if (globalError) {
        if (globalError.code === 'PGRST116') return success(null)
        return failure(new AppError('CFG_REPO_001', 'Erro ao buscar configuração'))
      }

      return success(globalConfig?.valor as T ?? null)
    } catch (error) {
      return failure(new AppError('CFG_REPO_002', 'Erro inesperado'))
    }
  }

  /**
   * Get link expiration days (with fallback to default)
   */
  async getLinkExpiracaoDias(clinicaId?: string): Promise<Result<number, AppError>> {
    const result = await this.getConfig<string>('link_expiracao_dias_padrao', clinicaId)
    if (!result.success) return failure(result.error)
    return success(parseInt(result.data || '7', 10))
  }

  /**
   * Get max code attempts before blocking link
   */
  async getLinkMaxTentativas(clinicaId?: string): Promise<Result<number, AppError>> {
    const result = await this.getConfig<string>('link_max_tentativas_codigo', clinicaId)
    if (!result.success) return failure(result.error)
    return success(parseInt(result.data || '5', 10))
  }

  /**
   * Get max PIN attempts for handoff mode
   */
  async getHandoffMaxTentativas(clinicaId?: string): Promise<Result<number, AppError>> {
    const result = await this.getConfig<string>('handoff_max_tentativas_pin', clinicaId)
    if (!result.success) return failure(result.error)
    return success(parseInt(result.data || '3', 10))
  }

  /**
   * Set clinic-specific configuration
   */
  async setClinicConfig(
    clinicaId: string,
    chave: string,
    valor: unknown,
    descricao?: string
  ): Promise<Result<ConfiguracaoSistema, AppError>> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('configuracoes_sistema')
        .upsert(
          {
            clinica_id: clinicaId,
            chave,
            valor: valor,
            descricao: descricao || null,
          },
          { onConflict: 'clinica_id,chave' }
        )
        .select()
        .single()

      if (error) {
        return failure(new AppError('CFG_REPO_003', 'Erro ao salvar configuração'))
      }

      return success(data as ConfiguracaoSistema)
    } catch (error) {
      return failure(new AppError('CFG_REPO_004', 'Erro inesperado'))
    }
  }

  /**
   * Get all configurations for a clinic (including global fallbacks)
   */
  async getAllForClinica(clinicaId: string): Promise<Result<ConfiguracaoSistema[], AppError>> {
    try {
      // Get all global configs
      const { data: globalConfigs, error: globalError } = await (this.supabase as any)
        .from('configuracoes_sistema')
        .select('*')
        .is('clinica_id', null)

      if (globalError) {
        return failure(new AppError('CFG_REPO_005', 'Erro ao buscar configurações globais'))
      }

      // Get clinic-specific configs
      const { data: clinicConfigs, error: clinicError } = await (this.supabase as any)
        .from('configuracoes_sistema')
        .select('*')
        .eq('clinica_id', clinicaId)

      if (clinicError) {
        return failure(new AppError('CFG_REPO_006', 'Erro ao buscar configurações da clínica'))
      }

      // Merge configs (clinic overrides global)
      const configMap = new Map<string, ConfiguracaoSistema>()

      for (const config of (globalConfigs || [])) {
        configMap.set(config.chave, config as ConfiguracaoSistema)
      }

      for (const config of (clinicConfigs || [])) {
        configMap.set(config.chave, config as ConfiguracaoSistema)
      }

      return success(Array.from(configMap.values()))
    } catch (error) {
      return failure(new AppError('CFG_REPO_007', 'Erro inesperado'))
    }
  }

  /**
   * Delete clinic-specific configuration (revert to global)
   */
  async deleteClinicConfig(clinicaId: string, chave: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await (this.supabase as any)
        .from('configuracoes_sistema')
        .delete()
        .eq('clinica_id', clinicaId)
        .eq('chave', chave)

      if (error) {
        return failure(new AppError('CFG_REPO_008', 'Erro ao deletar configuração'))
      }

      return success(undefined)
    } catch (error) {
      return failure(new AppError('CFG_REPO_009', 'Erro inesperado'))
    }
  }
}
