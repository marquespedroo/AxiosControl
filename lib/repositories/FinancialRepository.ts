import { SupabaseClient } from '@supabase/supabase-js'

import { AppError } from '@/lib/errors/AppError'
import { Result, success, failure } from '@/types/core/result'
import {
    FinancialCategory, FinancialCategoryInsert,
    PaymentMethod, PaymentMethodInsert, PaymentMethodUpdate,
    FinancialTransaction, FinancialTransactionInsert, FinancialTransactionUpdate,
    FinancialTransactionWithDetails
} from '@/types/database'

export class FinancialRepository {
    constructor(private supabase: SupabaseClient) { }

    // Categories
    async listCategories(clinicaId: string, type?: 'receita' | 'despesa'): Promise<Result<FinancialCategory[], AppError>> {
        try {
            let query = this.supabase
                .from('financial_categories')
                .select('*')
                .eq('clinica_id', clinicaId)
                .eq('active', true)
                .order('name')

            if (type) {
                query = query.eq('type', type)
            }

            const { data, error } = await query

            if (error) {
                return failure(new AppError('FINANCIAL_REPO_001', 'Erro ao listar categorias', 500, { cause: error }))
            }

            return success(data)
        } catch (error) {
            return failure(new AppError('FINANCIAL_REPO_002', 'Erro inesperado ao listar categorias', 500, { cause: error }))
        }
    }

    async createCategory(category: FinancialCategoryInsert): Promise<Result<FinancialCategory, AppError>> {
        try {
            const { data, error } = await this.supabase
                .from('financial_categories')
                .insert(category)
                .select()
                .single()

            if (error) {
                return failure(new AppError('FINANCIAL_REPO_003', 'Erro ao criar categoria', 500, { cause: error }))
            }

            return success(data)
        } catch (error) {
            return failure(new AppError('FINANCIAL_REPO_004', 'Erro inesperado ao criar categoria', 500, { cause: error }))
        }
    }

    // Payment Methods
    async listPaymentMethods(clinicaId: string): Promise<Result<PaymentMethod[], AppError>> {
        try {
            const { data, error } = await this.supabase
                .from('payment_methods')
                .select('*')
                .eq('clinica_id', clinicaId)
                .eq('active', true)
                .order('name')

            if (error) {
                return failure(new AppError('FINANCIAL_REPO_005', 'Erro ao listar métodos de pagamento', 500, { cause: error }))
            }

            return success(data)
        } catch (error) {
            return failure(new AppError('FINANCIAL_REPO_006', 'Erro inesperado ao listar métodos de pagamento', 500, { cause: error }))
        }
    }

    async createPaymentMethod(method: PaymentMethodInsert): Promise<Result<PaymentMethod, AppError>> {
        try {
            const { data, error } = await this.supabase
                .from('payment_methods')
                .insert(method)
                .select()
                .single()

            if (error) {
                return failure(new AppError('FINANCIAL_REPO_007', 'Erro ao criar método de pagamento', 500, { cause: error }))
            }

            return success(data)
        } catch (error) {
            return failure(new AppError('FINANCIAL_REPO_008', 'Erro inesperado ao criar método de pagamento', 500, { cause: error }))
        }
    }

    async updatePaymentMethod(id: string, method: PaymentMethodUpdate): Promise<Result<PaymentMethod, AppError>> {
        try {
            const { data, error } = await this.supabase
                .from('payment_methods')
                .update(method)
                .eq('id', id)
                .select()
                .single()

            if (error) {
                return failure(new AppError('FINANCIAL_REPO_009', 'Erro ao atualizar método de pagamento', 500, { cause: error }))
            }

            return success(data)
        } catch (error) {
            return failure(new AppError('FINANCIAL_REPO_010', 'Erro inesperado ao atualizar método de pagamento', 500, { cause: error }))
        }
    }

    // Transactions
    async listTransactions(
        clinicaId: string,
        filters?: {
            startDate?: string,
            endDate?: string,
            type?: 'receita' | 'despesa',
            status?: 'pending' | 'paid'
        }
    ): Promise<Result<FinancialTransactionWithDetails[], AppError>> {
        try {
            let query = this.supabase
                .from('financial_transactions')
                .select(`
                    *,
                    category:financial_categories(id, name),
                    payment_method:payment_methods(id, name),
                    patient:pacientes(id, nome_completo)
                `)
                .eq('clinica_id', clinicaId)
                .order('due_date', { ascending: true })

            if (filters?.startDate) {
                query = query.gte('due_date', filters.startDate)
            }
            if (filters?.endDate) {
                query = query.lte('due_date', filters.endDate)
            }
            if (filters?.type) {
                query = query.eq('type', filters.type)
            }
            if (filters?.status) {
                query = query.eq('status', filters.status)
            }

            const { data, error } = await query

            if (error) {
                return failure(new AppError('FINANCIAL_REPO_011', 'Erro ao listar transações', 500, { cause: error }))
            }

            return success(data)
        } catch (error) {
            return failure(new AppError('FINANCIAL_REPO_012', 'Erro inesperado ao listar transações', 500, { cause: error }))
        }
    }

    async createTransaction(transaction: FinancialTransactionInsert): Promise<Result<FinancialTransaction, AppError>> {
        try {
            const { data, error } = await this.supabase
                .from('financial_transactions')
                .insert(transaction)
                .select()
                .single()

            if (error) {
                return failure(new AppError('FINANCIAL_REPO_013', 'Erro ao criar transação', 500, { cause: error }))
            }

            return success(data)
        } catch (error) {
            return failure(new AppError('FINANCIAL_REPO_014', 'Erro inesperado ao criar transação', 500, { cause: error }))
        }
    }

    async updateTransaction(id: string, transaction: FinancialTransactionUpdate): Promise<Result<FinancialTransaction, AppError>> {
        try {
            const { data, error } = await this.supabase
                .from('financial_transactions')
                .update(transaction)
                .eq('id', id)
                .select()
                .single()

            if (error) {
                return failure(new AppError('FINANCIAL_REPO_015', 'Erro ao atualizar transação', 500, { cause: error }))
            }

            return success(data)
        } catch (error) {
            return failure(new AppError('FINANCIAL_REPO_016', 'Erro inesperado ao atualizar transação', 500, { cause: error }))
        }
    }
}
