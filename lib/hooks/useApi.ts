import { useState, useCallback } from 'react'
// import { useAuthStore } from '@/lib/stores/useAuthStore'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useApi<T = any>(options?: UseApiOptions) {
  // const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const request = useCallback(
    async (
      url: string,
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
      body?: any
    ) => {
      try {
        setLoading(true)
        setError(null)

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }

        const response = await fetch(url, {
          method,
          headers,
          ...(body && { body: JSON.stringify(body) }),
        })

        const responseData = await response.json()

        if (!response.ok) {
          const errorMessage = responseData.error || 'Erro na requisição'
          setError(errorMessage)
          options?.onError?.(errorMessage)
          return null
        }

        setData(responseData)
        options?.onSuccess?.(responseData)
        return responseData
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        options?.onError?.(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const get = useCallback((url: string) => request(url, 'GET'), [request])
  const post = useCallback((url: string, body?: any) => request(url, 'POST', body), [request])
  const put = useCallback((url: string, body?: any) => request(url, 'PUT', body), [request])
  const patch = useCallback((url: string, body?: any) => request(url, 'PATCH', body), [request])
  const del = useCallback((url: string) => request(url, 'DELETE'), [request])

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    patch,
    delete: del,
    request,
  }
}

// Specific API hooks
export function usePacientes() {
  const api = useApi()

  const list = useCallback(
    (params?: { page?: number; limit?: number; search?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.search) searchParams.set('search', params.search)

      return api.get(`/api/pacientes?${searchParams.toString()}`)
    },
    [api]
  )

  const getById = useCallback((id: string) => api.get(`/api/pacientes/${id}`), [api])

  const create = useCallback((data: any) => api.post('/api/pacientes', data), [api])

  const update = useCallback((id: string, data: any) => api.put(`/api/pacientes/${id}`, data), [api])

  const remove = useCallback((id: string) => api.delete(`/api/pacientes/${id}`), [api])

  return {
    ...api,
    list,
    getById,
    create,
    update,
    remove,
  }
}

export function useTestesTemplates() {
  const api = useApi()

  const list = useCallback(
    (params?: {
      page?: number
      limit?: number
      search?: string
      tipo?: string
      publico?: boolean
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.search) searchParams.set('search', params.search)
      if (params?.tipo) searchParams.set('tipo', params.tipo)
      if (params?.publico !== undefined) searchParams.set('publico', params.publico.toString())

      return api.get(`/api/testes-templates?${searchParams.toString()}`)
    },
    [api]
  )

  const getById = useCallback((id: string) => api.get(`/api/testes-templates/${id}`), [api])

  const duplicate = useCallback(
    (id: string, newName: string) =>
      api.post(`/api/testes-templates/${id}/duplicate`, { newName }),
    [api]
  )

  return {
    ...api,
    list,
    getById,
    duplicate,
  }
}

export function useClinicas() {
  const api = useApi()

  const list = useCallback(
    (params?: { page?: number; limit?: number; search?: string; ativo?: boolean }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.search) searchParams.set('search', params.search)
      if (params?.ativo !== undefined) searchParams.set('ativo', params.ativo.toString())

      return api.get(`/api/clinicas?${searchParams.toString()}`)
    },
    [api]
  )

  const getById = useCallback((id: string) => api.get(`/api/clinicas/${id}`), [api])

  const create = useCallback((data: any) => api.post('/api/clinicas', data), [api])

  const update = useCallback((id: string, data: any) => api.put(`/api/clinicas/${id}`, data), [api])

  const remove = useCallback((id: string) => api.delete(`/api/clinicas/${id}`), [api])

  return {
    ...api,
    list,
    getById,
    create,
    update,
    remove,
  }
}

export function useLinks() {
  const api = useApi()

  const generate = useCallback(
    (data: {
      teste_aplicado_id: string
      expira_em: Date
      requer_codigo?: boolean
    }) => api.post('/api/links', data),
    [api]
  )

  const validate = useCallback((token: string) => api.get(`/api/links/${token}`), [api])

  const authenticate = useCallback(
    (token: string, codigo?: string) =>
      api.post(`/api/links/${token}`, { codigo }),
    [api]
  )

  return {
    ...api,
    generate,
    validate,
    authenticate,
  }
}

export function useUsers() {
  const api = useApi()

  const list = useCallback(
    (params?: {
      clinica_id?: string
      search?: string
      page?: number
      limit?: number
      role?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.clinica_id) searchParams.set('clinica_id', params.clinica_id)
      if (params?.search) searchParams.set('search', params.search)
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.role) searchParams.set('role', params.role)

      // We might need a new endpoint for generic users or update /api/psicologos to be /api/users
      // For now, assuming we might use /api/psicologos for all users if we update it, or create /api/users
      // But since I haven't created /api/users yet, I'll point to /api/psicologos which I refactored to use UserService
      // But /api/psicologos filters by role=psychologist by default in GET?
      // Yes, I added `filters: { role: 'psychologist' }` in the route.
      // So I should probably create /api/users or update /api/psicologos to accept role filter.
      // I'll stick to usePsicologos for now and maybe add useUsers later when I have the endpoint.
      // Wait, the user asked to refactor user management.
      // I should probably have a generic user management endpoint.
      // But for this task, I'll just add useUsers and point it to /api/psicologos but I need to update the route to allow filtering by role if provided.
      return api.get(`/api/psicologos?${searchParams.toString()}`)
    },
    [api]
  )

  const getById = useCallback((id: string) => api.get(`/api/psicologos/${id}`), [api])

  const create = useCallback((data: any) => api.post('/api/psicologos', data), [api])

  const update = useCallback((id: string, data: any) => api.put(`/api/psicologos/${id}`, data), [api])

  const remove = useCallback((id: string) => api.delete(`/api/psicologos/${id}`), [api])

  return {
    ...api,
    list,
    getById,
    create,
    update,
    remove,
  }
}

export function usePsicologos() {
  return useUsers()
}

export function useTestesAplicados() {
  const api = useApi()

  const list = useCallback(
    (params?: {
      paciente_id?: string
      teste_template_id?: string
      status?: string
      page?: number
      limit?: number
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.paciente_id) searchParams.set('paciente_id', params.paciente_id)
      if (params?.teste_template_id) searchParams.set('teste_template_id', params.teste_template_id)
      if (params?.status) searchParams.set('status', params.status)
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())

      return api.get(`/api/testes-aplicados?${searchParams.toString()}`)
    },
    [api]
  )

  const getById = useCallback((id: string) => api.get(`/api/testes-aplicados/${id}`), [api])

  const create = useCallback((data: any) => api.post('/api/testes-aplicados', data), [api])

  const update = useCallback((id: string, data: any) => api.put(`/api/testes-aplicados/${id}`, data), [api])

  const finalize = useCallback((id: string) => api.post(`/api/testes-aplicados/${id}/finalizar`, {}), [api])

  const reopen = useCallback(
    (id: string, motivo: string) => api.post(`/api/testes-aplicados/${id}/reabrir`, { motivo }),
    [api]
  )

  return {
    ...api,
    list,
    getById,
    create,
    update,
    finalize,
    reopen,
  }
}

export function useTabelas() {
  const api = useApi()

  const list = useCallback(
    (params?: {
      teste_template_id?: string
      page?: number
      limit?: number
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.teste_template_id) searchParams.set('teste_template_id', params.teste_template_id)
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())

      return api.get(`/api/tabelas-normativas?${searchParams.toString()}`)
    },
    [api]
  )

  const getById = useCallback((id: string) => api.get(`/api/tabelas-normativas/${id}`), [api])

  const create = useCallback((data: any) => api.post('/api/tabelas-normativas', data), [api])

  const update = useCallback((id: string, data: any) => api.put(`/api/tabelas-normativas/${id}`, data), [api])

  const remove = useCallback((id: string) => api.delete(`/api/tabelas-normativas/${id}`), [api])

  const importCSV = useCallback(
    (file: File, teste_template_id: string) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('teste_template_id', teste_template_id)

      return fetch('/api/tabelas-normativas/import', {
        method: 'POST',
        body: formData,
      }).then(res => res.json())
    },
    []
  )

  return {
    ...api,
    list,
    getById,
    create,
    update,
    remove,
    importCSV,
  }
}

export function useRegistros() {
  const api = useApi()

  const list = useCallback(
    (params?: {
      paciente_id?: string
      tipo?: string
      page?: number
      limit?: number
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.paciente_id) searchParams.set('paciente_id', params.paciente_id)
      if (params?.tipo) searchParams.set('tipo', params.tipo)
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())

      return api.get(`/api/registros-manuais?${searchParams.toString()}`)
    },
    [api]
  )

  const getById = useCallback((id: string) => api.get(`/api/registros-manuais/${id}`), [api])

  const create = useCallback((data: any) => api.post('/api/registros-manuais', data), [api])

  const update = useCallback((id: string, data: any) => api.put(`/api/registros-manuais/${id}`, data), [api])

  const remove = useCallback((id: string) => api.delete(`/api/registros-manuais/${id}`), [api])

  const uploadAttachment = useCallback(
    (registro_id: string, file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('registro_id', registro_id)

      return fetch('/api/registros-manuais/upload', {
        method: 'POST',
        body: formData,
      }).then(res => res.json())
    },
    []
  )

  return {
    ...api,
    list,
    getById,
    create,
    update,
    remove,
    uploadAttachment,
  }
}

export function useSchedule() {
  const api = useApi()

  const getSettings = useCallback((userId?: string) => {
    const searchParams = new URLSearchParams()
    if (userId) searchParams.set('user_id', userId)
    return api.get(`/api/schedule/settings?${searchParams.toString()}`)
  }, [api])

  const updateSettings = useCallback(
    (data: { default_session_duration?: number; break_between_sessions?: number; default_price?: number | null }, userId?: string) => {
      const searchParams = new URLSearchParams()
      if (userId) searchParams.set('user_id', userId)
      return api.post(`/api/schedule/settings?${searchParams.toString()}`, data)
    },
    [api]
  )

  const getAvailability = useCallback((userId?: string) => {
    const searchParams = new URLSearchParams()
    if (userId) searchParams.set('user_id', userId)
    return api.get(`/api/schedule/availability?${searchParams.toString()}`)
  }, [api])

  const updateAvailability = useCallback(
    (data: any[], userId?: string) => {
      const searchParams = new URLSearchParams()
      if (userId) searchParams.set('user_id', userId)
      return api.post(`/api/schedule/availability?${searchParams.toString()}`, data)
    },
    [api]
  )

  return {
    getSettings,
    updateSettings,
    getAvailability,
    updateAvailability
  }
}

export const useFinancial = () => {
  const api = useApi()

  const listCategories = useCallback(
    (type?: 'receita' | 'despesa') => {
      const searchParams = new URLSearchParams()
      if (type) searchParams.set('type', type)
      return api.get(`/api/financial/categories?${searchParams.toString()}`)
    },
    [api]
  )

  const listPaymentMethods = useCallback(
    () => api.get('/api/financial/payment-methods'),
    [api]
  )

  const listTransactions = useCallback(
    (filters?: { startDate?: string; endDate?: string; type?: 'receita' | 'despesa'; status?: 'pending' | 'paid' }) => {
      const searchParams = new URLSearchParams()
      if (filters?.startDate) searchParams.set('startDate', filters.startDate)
      if (filters?.endDate) searchParams.set('endDate', filters.endDate)
      if (filters?.type) searchParams.set('type', filters.type)
      if (filters?.status) searchParams.set('status', filters.status)
      return api.get(`/api/financial/transactions?${searchParams.toString()}`)
    },
    [api]
  )

  const createTransaction = useCallback(
    (data: any) => api.post('/api/financial/transactions', data),
    [api]
  )

  const createPaymentMethod = useCallback(
    (data: any) => api.post('/api/financial/payment-methods', data),
    [api]
  )

  const updatePaymentMethod = useCallback(
    (id: string, data: any) => api.patch(`/api/financial/payment-methods/${id}`, data),
    [api]
  )

  return {
    listCategories,
    listPaymentMethods,
    listTransactions,
    createTransaction,
    createPaymentMethod,
    updatePaymentMethod
  }
}

export function useAppointments() {
  const api = useApi()

  const list = useCallback(
    (params?: {
      start_date?: string
      end_date?: string
      patient_id?: string
      professional_id?: string
      clinica_id?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.start_date) searchParams.set('start_date', params.start_date)
      if (params?.end_date) searchParams.set('end_date', params.end_date)
      if (params?.patient_id) searchParams.set('patient_id', params.patient_id)
      if (params?.professional_id) searchParams.set('professional_id', params.professional_id)
      if (params?.clinica_id) searchParams.set('clinica_id', params.clinica_id)

      return api.get(`/api/appointments?${searchParams.toString()}`)
    },
    [api]
  )

  const getById = useCallback((id: string) => api.get(`/api/appointments/${id}`), [api])

  const create = useCallback((data: any) => api.post('/api/appointments', data), [api])

  const update = useCallback((id: string, data: any) => api.patch(`/api/appointments/${id}`, data), [api])

  const remove = useCallback((id: string) => api.delete(`/api/appointments/${id}`), [api])

  return {
    ...api,
    list,
    getById,
    create,
    update,
    remove,
  }
}

export function useHealthInsurance() {
  const api = useApi()

  const listInsurances = useCallback(
    (clinicaId?: string) => {
      const searchParams = new URLSearchParams()
      if (clinicaId) searchParams.set('clinica_id', clinicaId)
      return api.get(`/api/settings/health-insurances?${searchParams.toString()}`)
    },
    [api]
  )

  const createInsurance = useCallback((data: any) => api.post('/api/settings/health-insurances', data), [api])

  const updateInsurance = useCallback((id: string, data: any) => api.put(`/api/settings/health-insurances/${id}`, data), [api])

  const deleteInsurance = useCallback((id: string) => api.delete(`/api/settings/health-insurances/${id}`), [api])

  const listProducts = useCallback((insuranceId: string) => api.get(`/api/settings/insurance-products?insurance_id=${insuranceId}`), [api])

  const createProduct = useCallback((data: any) => api.post('/api/settings/insurance-products', data), [api])

  const updateProduct = useCallback((id: string, data: any) => api.put(`/api/settings/insurance-products/${id}`, data), [api])

  const deleteProduct = useCallback((id: string) => api.delete(`/api/settings/insurance-products/${id}`), [api])

  return {
    ...api,
    listInsurances,
    createInsurance,
    updateInsurance,
    deleteInsurance,
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}
