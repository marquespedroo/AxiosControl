import { createClient } from '@/lib/supabase/server'
import { ScheduleRepository } from '@/lib/repositories/ScheduleRepository'
import { Result, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import { ProfessionalAvailability, ProfessionalDetails } from '@/types/database'

export class ScheduleService {
    private repository: ScheduleRepository
    private supabase: any

    constructor() {
        this.supabase = createClient()
        this.repository = new ScheduleRepository(this.supabase)
    }

    async getAvailability(userId: string): Promise<Result<ProfessionalAvailability[], AppError>> {
        return await this.repository.getAvailability(userId)
    }

    async updateAvailability(
        userId: string,
        availability: Omit<ProfessionalAvailability, 'id' | 'created_at' | 'updated_at' | 'user_id'>[]
    ): Promise<Result<void, AppError>> {
        // Basic validation: check start < end
        for (const slot of availability) {
            if (slot.start_time >= slot.end_time) {
                return failure(new AppError('SCHEDULE_SERVICE_001', 'Horário de início deve ser anterior ao fim', 400))
            }
        }
        return await this.repository.updateAvailability(userId, availability)
    }

    async getSettings(userId: string): Promise<Result<Pick<ProfessionalDetails, 'default_session_duration' | 'break_between_sessions'>, AppError>> {
        return await this.repository.getSettings(userId)
    }

    async updateSettings(
        userId: string,
        settings: { default_session_duration?: number; break_between_sessions?: number; default_price?: number | null }
    ): Promise<Result<void, AppError>> {
        return await this.repository.updateSettings(userId, settings)
    }
}
