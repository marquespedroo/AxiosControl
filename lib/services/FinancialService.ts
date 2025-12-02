import { addDays, format } from 'date-fns'

import {
    FinancialCategoryInsert,
    PaymentMethodInsert, PaymentMethodUpdate,
    FinancialTransactionInsert, FinancialTransactionUpdate
} from '@/types/database'

import { FinancialRepository } from '../repositories/FinancialRepository'

export class FinancialService {
    constructor(private repository: FinancialRepository) { }

    // Categories
    async listCategories(clinicaId: string, type?: 'receita' | 'despesa') {
        return this.repository.listCategories(clinicaId, type)
    }

    async createCategory(category: FinancialCategoryInsert) {
        return this.repository.createCategory(category)
    }

    // Payment Methods
    async listPaymentMethods(clinicaId: string) {
        return this.repository.listPaymentMethods(clinicaId)
    }

    async createPaymentMethod(method: PaymentMethodInsert) {
        return this.repository.createPaymentMethod(method)
    }

    async updatePaymentMethod(id: string, method: PaymentMethodUpdate) {
        return this.repository.updatePaymentMethod(id, method)
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
    ) {
        return this.repository.listTransactions(clinicaId, filters)
    }

    async createTransaction(transaction: FinancialTransactionInsert) {
        // Calculate due date if not provided, based on payment method
        if (!transaction.due_date && transaction.payment_method_id) {
            // Fetch payment method to get days_to_receive
            // For now, we assume the frontend sends the correct due_date or we fetch it here
            // Optimization: Pass payment method details or fetch it
        }
        return this.repository.createTransaction(transaction)
    }

    async updateTransaction(id: string, transaction: FinancialTransactionUpdate) {
        return this.repository.updateTransaction(id, transaction)
    }

    // Helper to calculate due date
    calculateDueDate(transactionDate: Date, daysToReceive: number): string {
        return format(addDays(transactionDate, daysToReceive), 'yyyy-MM-dd')
    }

    // Helper to calculate net amount (subtracting fees)
    calculateNetAmount(amount: number, feePercentage: number): number {
        return amount - (amount * (feePercentage / 100))
    }
}
