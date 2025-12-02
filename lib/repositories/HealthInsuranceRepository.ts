import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database, HealthInsuranceInsert, HealthInsuranceUpdate, InsuranceProductInsert, InsuranceProductUpdate } from '@/types/database'

const supabase = createClientComponentClient<Database>()

export const HealthInsuranceRepository = {
    async listInsurances(clinicaId: string) {
        const { data, error } = await supabase
            .from('health_insurances')
            .select('*')
            .eq('clinica_id', clinicaId)
            .order('name', { ascending: true })

        if (error) throw error
        return data
    },

    async createInsurance(insurance: HealthInsuranceInsert) {
        const { data, error } = await supabase
            .from('health_insurances')
            .insert(insurance)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateInsurance(id: string, updates: HealthInsuranceUpdate) {
        const { data, error } = await supabase
            .from('health_insurances')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteInsurance(id: string) {
        const { error } = await supabase
            .from('health_insurances')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    async listProducts(insuranceId: string) {
        const { data, error } = await supabase
            .from('insurance_products')
            .select('*')
            .eq('insurance_id', insuranceId)
            .order('name', { ascending: true })

        if (error) throw error
        return data
    },

    async createProduct(product: InsuranceProductInsert) {
        const { data, error } = await supabase
            .from('insurance_products')
            .insert(product)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateProduct(id: string, updates: InsuranceProductUpdate) {
        const { data, error } = await supabase
            .from('insurance_products')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteProduct(id: string) {
        const { error } = await supabase
            .from('insurance_products')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
