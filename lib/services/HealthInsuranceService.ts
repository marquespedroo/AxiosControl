import { HealthInsuranceRepository } from '@/lib/repositories/HealthInsuranceRepository'
import { HealthInsuranceInsert, HealthInsuranceUpdate, InsuranceProductInsert, InsuranceProductUpdate } from '@/types/database'

export const HealthInsuranceService = {
    async listInsurances(clinicaId: string) {
        return await HealthInsuranceRepository.listInsurances(clinicaId)
    },

    async createInsurance(insurance: HealthInsuranceInsert) {
        return await HealthInsuranceRepository.createInsurance(insurance)
    },

    async updateInsurance(id: string, updates: HealthInsuranceUpdate) {
        return await HealthInsuranceRepository.updateInsurance(id, updates)
    },

    async deleteInsurance(id: string) {
        return await HealthInsuranceRepository.deleteInsurance(id)
    },

    async listProducts(insuranceId: string) {
        return await HealthInsuranceRepository.listProducts(insuranceId)
    },

    async createProduct(product: InsuranceProductInsert) {
        return await HealthInsuranceRepository.createProduct(product)
    },

    async updateProduct(id: string, updates: InsuranceProductUpdate) {
        return await HealthInsuranceRepository.updateProduct(id, updates)
    },

    async deleteProduct(id: string) {
        return await HealthInsuranceRepository.deleteProduct(id)
    }
}
