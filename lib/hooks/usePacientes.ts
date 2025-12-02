'use client'

import { useCallback } from 'react'

import { PacienteService } from '@/lib/services/PacienteService'
import { useAuthStore, selectClinicaId, selectUserId } from '@/lib/stores/useAuthStore'
import { usePacienteStore, selectPacientes, selectIsLoading } from '@/lib/stores/usePacienteStore'
import { createBrowserClient } from '@/lib/supabase/client'
import type { PacienteInsert, PacienteUpdate } from '@/types/database'

/**
 * Custom hook for patient operations
 * Integrates PacienteService with usePacienteStore
 */
export function usePacientes() {
  const supabase = createBrowserClient()
  const service = new PacienteService(supabase)

  // Store state
  const pacientes = usePacienteStore(selectPacientes)
  const isLoading = usePacienteStore(selectIsLoading)
  const clinica_id = useAuthStore(selectClinicaId)
  const usuario_id = useAuthStore(selectUserId)

  // Store actions
  const {
    setPacientes,
    setSelectedPaciente,
    addPaciente,
    updatePaciente: updatePacienteStore,
    removePaciente,
    setLoading,
    setError,
    setPagination,
    setSearchQuery,
  } = usePacienteStore()

  /**
   * Fetch patients with search and pagination
   */
  const fetchPacientes = useCallback(
    async (params?: { search?: string; page?: number; limit?: number }) => {
      if (!clinica_id) {
        setError('Clínica não identificada')
        return
      }

      setLoading(true)
      const result = await service.list({
        clinica_id,
        search: params?.search || '',
        page: params?.page || 1,
        limit: params?.limit || 20,
      })

      if (result.success) {
        setPacientes(result.data.data)
        setPagination(
          result.data.meta.total,
          result.data.meta.page,
          result.data.meta.limit
        )
      } else {
        setError(result.error.message)
      }

      setLoading(false)
    },
    [clinica_id, service, setLoading, setError, setPacientes, setPagination]
  )

  /**
   * Get patient by ID
   */
  const getPaciente = useCallback(
    async (id: string) => {
      if (!clinica_id) {
        setError('Clínica não identificada')
        return null
      }

      setLoading(true)
      const result = await service.getById(id, clinica_id)
      setLoading(false)

      if (result.success) {
        setSelectedPaciente(result.data)
        return result.data
      } else {
        setError(result.error.message)
        return null
      }
    },
    [clinica_id, service, setLoading, setError, setSelectedPaciente]
  )

  /**
   * Create new patient
   */
  const createPaciente = useCallback(
    async (data: PacienteInsert) => {
      if (!usuario_id || !clinica_id) {
        setError('Usuário não autenticado')
        return null
      }

      setLoading(true)
      const result = await service.create(
        { ...data, clinica_id },
        usuario_id,
        '', // IP address - should be captured from request
        navigator.userAgent
      )

      if (result.success) {
        addPaciente(result.data)
        setLoading(false)
        return result.data
      } else {
        setError(result.error.message)
        setLoading(false)
        return null
      }
    },
    [usuario_id, clinica_id, service, setLoading, setError, addPaciente]
  )

  /**
   * Update patient
   */
  const updatePaciente = useCallback(
    async (id: string, data: PacienteUpdate) => {
      if (!usuario_id || !clinica_id) {
        setError('Usuário não autenticado')
        return null
      }

      setLoading(true)
      const result = await service.update(
        id,
        data,
        clinica_id,
        usuario_id,
        '',
        navigator.userAgent
      )

      if (result.success) {
        updatePacienteStore(id, result.data)
        setLoading(false)
        return result.data
      } else {
        setError(result.error.message)
        setLoading(false)
        return null
      }
    },
    [usuario_id, clinica_id, service, setLoading, setError, updatePacienteStore]
  )

  /**
   * Delete patient (soft delete)
   */
  const deletePaciente = useCallback(
    async (id: string) => {
      if (!usuario_id || !clinica_id) {
        setError('Usuário não autenticado')
        return false
      }

      setLoading(true)
      const result = await service.delete(
        id,
        clinica_id,
        usuario_id,
        '',
        navigator.userAgent
      )

      if (result.success) {
        removePaciente(id)
        setLoading(false)
        return true
      } else {
        setError(result.error.message)
        setLoading(false)
        return false
      }
    },
    [usuario_id, clinica_id, service, setLoading, setError, removePaciente]
  )

  /**
   * Search patients
   */
  const searchPacientes = useCallback(
    async (query: string) => {
      setSearchQuery(query)
      await fetchPacientes({ search: query, page: 1 })
    },
    [setSearchQuery, fetchPacientes]
  )

  return {
    // State
    pacientes,
    isLoading,

    // Actions
    fetchPacientes,
    getPaciente,
    createPaciente,
    updatePaciente,
    deletePaciente,
    searchPacientes,
    setSelectedPaciente,
  }
}
