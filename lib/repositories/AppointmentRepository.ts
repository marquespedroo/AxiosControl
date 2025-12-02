import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import { Database, Appointment, AppointmentInsert, AppointmentUpdate, AppointmentWithDetails } from '@/types/database'

export class AppointmentRepository {
    constructor(private supabase: SupabaseClient<Database>) { }

    async create(data: AppointmentInsert): Promise<Result<Appointment, AppError>> {
        try {
            const { data: appointment, error } = await this.supabase
                .from('appointments')
                .insert(data as any)
                .select()
                .single()

            if (error) {
                return failure(new AppError('APPOINTMENT_REPO_001', 'Erro ao criar agendamento', 500, { cause: error }))
            }

            return success(appointment)
        } catch (error) {
            return failure(new AppError('APPOINTMENT_REPO_002', 'Erro inesperado ao criar agendamento', 500, { cause: error }))
        }
    }

    async update(id: string, data: AppointmentUpdate): Promise<Result<Appointment, AppError>> {
        try {
            const { data: appointment, error } = await (this.supabase
                .from('appointments') as any)
                .update(data)
                .eq('id', id)
                .select()
                .single()

            if (error) {
                return failure(new AppError('APPOINTMENT_REPO_003', 'Erro ao atualizar agendamento', 500, { cause: error }))
            }

            return success(appointment)
        } catch (error) {
            return failure(new AppError('APPOINTMENT_REPO_004', 'Erro inesperado ao atualizar agendamento', 500, { cause: error }))
        }
    }

    async delete(id: string): Promise<Result<void, AppError>> {
        try {
            const { error } = await this.supabase
                .from('appointments')
                .delete()
                .eq('id', id)

            if (error) {
                return failure(new AppError('APPOINTMENT_REPO_005', 'Erro ao deletar agendamento', 500, { cause: error }))
            }

            return success(undefined)
        } catch (error) {
            return failure(new AppError('APPOINTMENT_REPO_006', 'Erro inesperado ao deletar agendamento', 500, { cause: error }))
        }
    }

    async findById(id: string): Promise<Result<AppointmentWithDetails, AppError>> {
        try {
            const { data, error } = await this.supabase
                .from('appointments')
                .select(`
          *,
          patient:pacientes(id, nome_completo),
          professional:users(id, nome_completo),
          insurance_product:insurance_products(id, name)
        `)
                .eq('id', id)
                .single()

            if (error) {
                return failure(new AppError('APPOINTMENT_REPO_007', 'Erro ao buscar agendamento', 500, { cause: error }))
            }

            return success(data as unknown as AppointmentWithDetails)
        } catch (error) {
            return failure(new AppError('APPOINTMENT_REPO_008', 'Erro inesperado ao buscar agendamento', 500, { cause: error }))
        }
    }

    async list(filters: {
        clinica_id?: string
        professional_id?: string
        patient_id?: string
        start_date?: string
        end_date?: string
    }): Promise<Result<AppointmentWithDetails[], AppError>> {
        try {
            let query = this.supabase
                .from('appointments')
                .select(`
          *,
          patient:pacientes(id, nome_completo),
          professional:users(id, nome_completo),
          insurance_product:insurance_products(id, name)
        `)
                .order('start_time', { ascending: true })

            if (filters.clinica_id) query = query.eq('clinica_id', filters.clinica_id)
            if (filters.professional_id) query = query.eq('professional_id', filters.professional_id)
            if (filters.patient_id) query = query.eq('patient_id', filters.patient_id)
            if (filters.start_date) query = query.gte('start_time', filters.start_date)
            if (filters.end_date) query = query.lte('end_time', filters.end_date)

            const { data, error } = await query

            if (error) {
                return failure(new AppError('APPOINTMENT_REPO_009', 'Erro ao listar agendamentos', 500, { cause: error }))
            }

            return success(data as unknown as AppointmentWithDetails[])
        } catch (error) {
            return failure(new AppError('APPOINTMENT_REPO_010', 'Erro inesperado ao listar agendamentos', 500, { cause: error }))
        }
    }

    async checkConflict(
        professionalId: string,
        startTime: string,
        endTime: string,
        excludeId?: string
    ): Promise<Result<boolean, AppError>> {
        try {
            let query = this.supabase
                .from('appointments')
                .select('id')
                .eq('professional_id', professionalId)
                .neq('status', 'cancelled')
                // Overlap logic: (StartA < EndB) and (EndA > StartB)
                .lt('start_time', endTime)
                .gt('end_time', startTime)

            if (excludeId) {
                query = query.neq('id', excludeId)
            }

            const { data, error } = await query

            if (error) {
                return failure(new AppError('APPOINTMENT_REPO_011', 'Erro ao verificar conflitos', 500, { cause: error }))
            }

            return success(data.length > 0)
        } catch (error) {
            return failure(new AppError('APPOINTMENT_REPO_012', 'Erro inesperado ao verificar conflitos', 500, { cause: error }))
        }
    }
}
