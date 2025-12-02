import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import { Database, ProfessionalAvailability, ProfessionalDetails } from '@/types/database'

export class ScheduleRepository {
    constructor(private supabase: SupabaseClient<Database>) { }

    async getAvailability(userId: string): Promise<Result<ProfessionalAvailability[], AppError>> {
        try {
            const { data, error } = await this.supabase
                .from('professional_availability')
                .select('*')
                .eq('user_id', userId)
                .order('day_of_week', { ascending: true })
                .order('start_time', { ascending: true })

            if (error) {
                return failure(new AppError('SCHEDULE_REPO_001', 'Erro ao buscar disponibilidade', 500, { cause: error }))
            }

            return success(data)
        } catch (error) {
            return failure(new AppError('SCHEDULE_REPO_002', 'Erro inesperado ao buscar disponibilidade', 500, { cause: error }))
        }
    }

    async updateAvailability(
        userId: string,
        availability: Omit<ProfessionalAvailability, 'id' | 'created_at' | 'updated_at' | 'user_id'>[]
    ): Promise<Result<void, AppError>> {
        try {
            // Transaction-like behavior: delete all and insert new
            // Note: Supabase doesn't support transactions directly in client-side JS without RPC, 
            // but for this use case, we can delete and insert.

            const { error: deleteError } = await this.supabase
                .from('professional_availability')
                .delete()
                .eq('user_id', userId)

            if (deleteError) {
                return failure(new AppError('SCHEDULE_REPO_003', 'Erro ao limpar disponibilidade antiga', 500, { cause: deleteError }))
            }

            if (availability.length > 0) {
                const toInsert = availability.map(slot => ({
                    ...slot,
                    user_id: userId
                }))

                const { error: insertError } = await this.supabase
                    .from('professional_availability')
                    .insert(toInsert as any)

                if (insertError) {
                    return failure(new AppError('SCHEDULE_REPO_004', 'Erro ao inserir nova disponibilidade', 500, { cause: insertError }))
                }
            }

            return success(undefined)
        } catch (error) {
            return failure(new AppError('SCHEDULE_REPO_005', 'Erro inesperado ao atualizar disponibilidade', 500, { cause: error }))
        }
    }

    async getSettings(userId: string): Promise<Result<Pick<ProfessionalDetails, 'default_session_duration' | 'break_between_sessions' | 'default_price'>, AppError>> {
        try {
            const { data, error } = await this.supabase
                .from('professional_details')
                .select('default_session_duration, break_between_sessions, default_price')
                .eq('user_id', userId)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    // Not found, return defaults
                    return success({
                        default_session_duration: 50,
                        break_between_sessions: 10,
                        default_price: null
                    })
                }
                return failure(new AppError('SCHEDULE_REPO_006', 'Erro ao buscar configurações', 500, { cause: error }))
            }

            return success(data)
        } catch (error) {
            return failure(new AppError('SCHEDULE_REPO_007', 'Erro inesperado ao buscar configurações', 500, { cause: error }))
        }
    }

    async updateSettings(
        userId: string,
        settings: { default_session_duration?: number; break_between_sessions?: number; default_price?: number | null }
    ): Promise<Result<void, AppError>> {
        try {
            // Check if exists
            const { data: existing, error: selectError } = await this.supabase
                .from('professional_details')
                .select('id')
                .eq('user_id', userId)
                .single()

            if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means "no rows found"
                return failure(new AppError('SCHEDULE_REPO_008', 'Erro ao verificar configurações existentes', 500, { cause: selectError }))
            }

            if (existing) {
                const { error } = await (this.supabase
                    .from('professional_details') as any)
                    .update(settings)
                    .eq('user_id', userId)

                if (error) {
                    return failure(new AppError('SCHEDULE_REPO_009', 'Erro ao atualizar configurações', 500, { cause: error }))
                }
            } else {
                const { error } = await this.supabase
                    .from('professional_details')
                    .insert({
                        user_id: userId,
                        ...settings
                    } as any)

                if (error) {
                    return failure(new AppError('SCHEDULE_REPO_010', 'Erro ao inserir novas configurações', 500, { cause: error }))
                }
            }

            return success(undefined)
        } catch (error) {
            return failure(new AppError('SCHEDULE_REPO_011', 'Erro inesperado ao atualizar configurações', 500, { cause: error }))
        }
    }
}
