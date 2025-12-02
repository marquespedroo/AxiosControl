import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { AppointmentRepository } from '@/lib/repositories/AppointmentRepository'
import { createClient } from '@/lib/supabase/server'
import { Result, failure } from '@/types/core/result'
import { Appointment, AppointmentInsert, AppointmentUpdate, AppointmentWithDetails, Database } from '@/types/database'


export class AppointmentService {
    private repository: AppointmentRepository
    private supabase: SupabaseClient<Database>

    constructor(supabaseClient?: SupabaseClient<Database>) {
        this.supabase = supabaseClient || createClient()
        this.repository = new AppointmentRepository(this.supabase)
    }

    async create(data: AppointmentInsert): Promise<Result<Appointment, AppError>> {
        // Check for conflicts
        const conflictResult = await this.repository.checkConflict(
            data.professional_id,
            data.start_time,
            data.end_time
        )

        if (!conflictResult.success) {
            return conflictResult as any
        }

        if (conflictResult.data) {
            return failure(new AppError('APPOINTMENT_SERVICE_001', 'Horário indisponível (conflito com outro agendamento)', 409))
        }

        // Validate time
        if (new Date(data.start_time) >= new Date(data.end_time)) {
            return failure(new AppError('APPOINTMENT_SERVICE_002', 'Horário de início deve ser anterior ao fim', 400))
        }

        return await this.repository.create(data)
    }

    async update(id: string, data: AppointmentUpdate): Promise<Result<Appointment, AppError>> {
        // If updating time, check for conflicts
        if (data.start_time || data.end_time) {
            // Need to fetch existing appointment to get professional_id and missing time if partial update
            const existingResult = await this.repository.findById(id)
            if (!existingResult.success) {
                return existingResult as any
            }
            const existing = existingResult.data

            const professionalId = existing.professional_id
            const startTime = data.start_time || existing.start_time
            const endTime = data.end_time || existing.end_time

            if (new Date(startTime) >= new Date(endTime)) {
                return failure(new AppError('APPOINTMENT_SERVICE_003', 'Horário de início deve ser anterior ao fim', 400))
            }

            const conflictResult = await this.repository.checkConflict(
                professionalId,
                startTime,
                endTime,
                id // Exclude current appointment from check
            )

            if (!conflictResult.success) {
                return conflictResult as any
            }

            if (conflictResult.data) {
                return failure(new AppError('APPOINTMENT_SERVICE_004', 'Horário indisponível (conflito com outro agendamento)', 409))
            }
        }

        return await this.repository.update(id, data)
    }

    async delete(id: string): Promise<Result<void, AppError>> {
        return await this.repository.delete(id)
    }

    async findById(id: string): Promise<Result<AppointmentWithDetails, AppError>> {
        return await this.repository.findById(id)
    }

    async list(filters: {
        clinica_id?: string
        professional_id?: string
        patient_id?: string
        start_date?: string
        end_date?: string
    }): Promise<Result<AppointmentWithDetails[], AppError>> {
        return await this.repository.list(filters)
    }
}
