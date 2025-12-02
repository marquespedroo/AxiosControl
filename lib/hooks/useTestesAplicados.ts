'use client'

import { useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { TesteAplicadoRepository } from '@/lib/repositories/TesteAplicadoRepository'
import {
  useTesteAplicadoStore,
  selectTestes,
  selectCurrentTeste,
  selectIsLoading,
} from '@/lib/stores/useTesteAplicadoStore'
import { useAuthStore, selectUserId } from '@/lib/stores/useAuthStore'
// import type { TesteAplicado } from '@/types/database'

type TesteStatus = 'aguardando' | 'em_andamento' | 'finalizado' | 'expirado'

/**
 * Custom hook for applied test operations
 * Integrates TesteAplicadoRepository with useTesteAplicadoStore
 */
export function useTestesAplicados() {
  const supabase = createBrowserClient()
  const repository = new TesteAplicadoRepository(supabase)

  // Store state
  const testes = useTesteAplicadoStore(selectTestes)
  const currentTeste = useTesteAplicadoStore(selectCurrentTeste)
  const isLoading = useTesteAplicadoStore(selectIsLoading)
  const usuario_id = useAuthStore(selectUserId)

  // Store actions
  const {
    setTestes,
    setCurrentTeste,
    // addTeste,
    updateTeste: updateTesteStore,
    // removeTeste,
    updateRespostas,
    setLoading,
    setError,
    setPagination,
    setStatusFilter,
    resetCurrentTeste,
  } = useTesteAplicadoStore()

  /**
   * Fetch tests by psychologist
   */
  const fetchTestesByPsicologo = useCallback(
    async (params?: { status?: TesteStatus; page?: number; limit?: number }) => {
      if (!usuario_id) {
        setError('Usuário não autenticado')
        return
      }

      setLoading(true)
      const result = await repository.findByPsicologo({
        psicologo_id: usuario_id,
        status: params?.status,
        page: params?.page || 1,
        limit: params?.limit || 20,
      })

      if (result.success) {
        setTestes(result.data.data)
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
    [usuario_id, repository, setLoading, setError, setTestes, setPagination]
  )

  /**
   * Fetch tests by patient
   */
  const fetchTestesByPaciente = useCallback(
    async (
      paciente_id: string,
      params?: { status?: TesteStatus; page?: number; limit?: number }
    ) => {
      setLoading(true)
      const result = await repository.findByPaciente({
        paciente_id,
        status: params?.status,
        page: params?.page || 1,
        limit: params?.limit || 20,
      })

      if (result.success) {
        setTestes(result.data.data)
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
    [repository, setLoading, setError, setTestes, setPagination]
  )

  /**
   * Get test with full details (template and patient)
   */
  const getTesteWithDetails = useCallback(
    async (id: string) => {
      setLoading(true)
      const result = await repository.findWithDetails(id)
      setLoading(false)

      if (result.success) {
        return result.data
      } else {
        setError(result.error.message)
        return null
      }
    },
    [repository, setLoading, setError]
  )

  /**
   * Start test execution
   */
  const startTeste = useCallback(
    async (id: string) => {
      setLoading(true)
      const result = await repository.findById(id)

      if (result.success && result.data) {
        // Update status to 'em_andamento'
        const updateResult = await repository.update(id, {
          status: 'em_andamento',
          data_inicio: new Date().toISOString(),
        } as any)

        if (updateResult.success) {
          setCurrentTeste(updateResult.data)
          updateTesteStore(id, updateResult.data)
          setLoading(false)
          return updateResult.data
        }
      }

      if (!result.success) {
        setError(result.error.message)
      } else {
        setError('Erro ao iniciar teste')
      }
      setLoading(false)
      return null
    },
    [repository, setLoading, setError, setCurrentTeste, updateTesteStore]
  )

  /**
   * Save answer to current test
   */
  const saveAnswer = useCallback(
    async (questaoId: string, resposta: any) => {
      if (!currentTeste) {
        setError('Nenhum teste em execução')
        return false
      }

      // Update local state immediately (optimistic update)
      updateRespostas(questaoId, resposta)

      // Save to database
      const newRespostas = {
        ...currentTeste.respostas,
        [questaoId]: resposta,
      }

      const result = await repository.updateRespostas(currentTeste.id, newRespostas)

      if (!result.success) {
        setError(result.error.message)
        return false
      }

      return true
    },
    [currentTeste, repository, updateRespostas, setError]
  )

  /**
   * Finalize test with results
   */
  const finalizeTeste = useCallback(
    async (data: {
      pontuacao_bruta: number
      normalizacao: Record<string, any>
      interpretacao: string
    }) => {
      if (!currentTeste) {
        setError('Nenhum teste em execução')
        return null
      }

      setLoading(true)
      const result = await repository.finalize(currentTeste.id, {
        ...data,
        status: 'finalizado',
      })

      if (result.success) {
        updateTesteStore(currentTeste.id, result.data)
        resetCurrentTeste()
        setLoading(false)
        return result.data
      } else {
        setError(result.error.message)
        setLoading(false)
        return null
      }
    },
    [currentTeste, repository, setLoading, setError, updateTesteStore, resetCurrentTeste]
  )

  /**
   * Get test by link token (for remote tests)
   */
  const getTesteByToken = useCallback(
    async (token: string) => {
      setLoading(true)
      const result = await repository.findByLinkToken(token)
      setLoading(false)

      if (result.success && result.data) {
        setCurrentTeste(result.data)
        return result.data
      } else {
        if (!result.success) {
          setError(result.error.message)
        } else {
          setError('Teste não encontrado')
        }
        return null
      }
    },
    [repository, setLoading, setError, setCurrentTeste]
  )

  /**
   * Filter tests by status
   */
  const filterByStatus = useCallback(
    async (status: TesteStatus | 'all') => {
      setStatusFilter(status)
      await fetchTestesByPsicologo({ status: status === 'all' ? undefined : status })
    },
    [setStatusFilter, fetchTestesByPsicologo]
  )

  return {
    // State
    testes,
    currentTeste,
    isLoading,

    // Actions
    fetchTestesByPsicologo,
    fetchTestesByPaciente,
    getTesteWithDetails,
    startTeste,
    saveAnswer,
    finalizeTeste,
    getTesteByToken,
    filterByStatus,
    resetCurrentTeste,
  }
}
