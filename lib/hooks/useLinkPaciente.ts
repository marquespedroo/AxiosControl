'use client'

import { useCallback } from 'react'

import {
  useLinkPacienteStore,
  selectLinks,
  selectSelectedLink,
  selectIsLoading,
  selectError,
  selectPagination,
  selectFlowState,
  selectGeneratedLinkState,
  selectCanProceed,
} from '@/lib/stores/useLinkPacienteStore'
import type { ModoAplicacao, LinkPacienteWithDetails } from '@/types/database'

interface FetchLinksParams {
  page?: number
  limit?: number
  status?: string
}

interface CreateLinkParams {
  paciente_id: string
  teste_template_ids: string[]
  dias_expiracao?: number
}

/**
 * Custom hook for link paciente operations
 * Integrates API calls with useLinkPacienteStore
 */
export function useLinkPaciente() {
  // Store state
  const links = useLinkPacienteStore(selectLinks)
  const selectedLink = useLinkPacienteStore(selectSelectedLink)
  const isLoading = useLinkPacienteStore(selectIsLoading)
  const error = useLinkPacienteStore(selectError)
  const pagination = useLinkPacienteStore(selectPagination)
  const flowState = useLinkPacienteStore(selectFlowState)
  const generatedLinkState = useLinkPacienteStore(selectGeneratedLinkState)
  const canProceed = useLinkPacienteStore(selectCanProceed)

  // Store actions
  const {
    setLinks,
    addLink,
    updateLink: updateLinkStore,
    removeLink,
    setLoading,
    setError,
    setPagination,
    setSelectedLink,
    setSelectedPacienteId,
    setSelectedMode,
    setSelectedTesteIds,
    addSelectedTesteId,
    removeSelectedTesteId,
    clearSelection,
    setGeneratedLink,
    setShareMessage,
    setLinkUrl,
    clearGeneratedLink,
    reset,
  } = useLinkPacienteStore()

  /**
   * Fetch links with pagination via API
   */
  const fetchLinks = useCallback(
    async (params?: FetchLinksParams) => {
      setLoading(true)
      setError(null)

      try {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.set('page', String(params.page))
        if (params?.limit) searchParams.set('limit', String(params.limit))
        if (params?.status) searchParams.set('status', params.status)

        const response = await fetch(`/api/links-paciente?${searchParams}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao buscar links')
        }

        setLinks(data.data || [])
        if (data.meta) {
          setPagination(data.meta.total, data.meta.page, data.meta.limit)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar links')
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, setLinks, setPagination]
  )

  /**
   * Get link by ID with full details via API
   */
  const getLink = useCallback(
    async (id: string): Promise<LinkPacienteWithDetails | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/links-paciente/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao buscar link')
        }

        setSelectedLink(data)
        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar link')
        return null
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, setSelectedLink]
  )

  /**
   * Create or get existing hub for patient via API
   */
  const createOrGetHub = useCallback(
    async (params: CreateLinkParams): Promise<LinkPacienteWithDetails | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/links-paciente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao criar link')
        }

        addLink(data)
        setGeneratedLink(data)

        if (data.share_message) {
          setShareMessage(data.share_message)
        }
        if (data.link_url) {
          setLinkUrl(data.link_url)
        }

        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar link')
        return null
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, addLink, setGeneratedLink, setShareMessage, setLinkUrl]
  )

  /**
   * Add tests to existing hub via API
   */
  const addTestesToHub = useCallback(
    async (linkId: string, testeIds: string[]): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/links-paciente/${linkId}/testes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teste_template_ids: testeIds }),
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao adicionar testes')
        }

        updateLinkStore(linkId, data)
        setSelectedLink(data)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao adicionar testes')
        return false
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, updateLinkStore, setSelectedLink]
  )

  /**
   * Extend link expiration via API
   */
  const extendExpiracao = useCallback(
    async (linkId: string, days: number): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/links-paciente/${linkId}/estender`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dias: days }),
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao estender expiração')
        }

        updateLinkStore(linkId, data)
        if (selectedLink?.id === linkId) {
          setSelectedLink(data)
        }
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao estender expiração')
        return false
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, updateLinkStore, selectedLink, setSelectedLink]
  )

  /**
   * Revoke link via API
   */
  const revogar = useCallback(
    async (linkId: string): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/links-paciente/${linkId}/revogar`, {
          method: 'POST',
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao revogar link')
        }

        removeLink(linkId)
        if (selectedLink?.id === linkId) {
          setSelectedLink(null)
        }
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao revogar link')
        return false
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, removeLink, selectedLink, setSelectedLink]
  )

  /**
   * Start the link creation flow
   */
  const startFlow = useCallback(
    (pacienteId: string) => {
      clearSelection()
      clearGeneratedLink()
      setSelectedPacienteId(pacienteId)
    },
    [clearSelection, clearGeneratedLink, setSelectedPacienteId]
  )

  /**
   * Select application mode
   */
  const selectMode = useCallback(
    (mode: ModoAplicacao) => {
      setSelectedMode(mode)
    },
    [setSelectedMode]
  )

  /**
   * Toggle test selection
   */
  const toggleTesteSelection = useCallback(
    (testeId: string, selected: boolean) => {
      if (selected) {
        addSelectedTesteId(testeId)
      } else {
        removeSelectedTesteId(testeId)
      }
    },
    [addSelectedTesteId, removeSelectedTesteId]
  )

  /**
   * Complete the flow - create hub with selected options
   */
  const completeFlow = useCallback(async (): Promise<LinkPacienteWithDetails | null> => {
    if (!flowState.pacienteId || !flowState.mode || flowState.testeIds.length === 0) {
      setError('Selecione paciente, modo e pelo menos um teste')
      return null
    }

    const result = await createOrGetHub({
      paciente_id: flowState.pacienteId,
      teste_template_ids: flowState.testeIds,
    })

    return result
  }, [flowState, createOrGetHub, setError])

  /**
   * Copy share message to clipboard
   */
  const copyShareMessage = useCallback(async (): Promise<boolean> => {
    if (generatedLinkState.message) {
      try {
        await navigator.clipboard.writeText(generatedLinkState.message)
        return true
      } catch {
        return false
      }
    }
    return false
  }, [generatedLinkState.message])

  /**
   * Copy link URL to clipboard
   */
  const copyLinkUrl = useCallback(async (): Promise<boolean> => {
    if (generatedLinkState.url) {
      try {
        await navigator.clipboard.writeText(generatedLinkState.url)
        return true
      } catch {
        return false
      }
    }
    return false
  }, [generatedLinkState.url])

  /**
   * Generate share message for a link
   */
  const generateShareMessage = useCallback(
    (pacienteNome: string, linkUrl: string, codigo: string, dataExpiracao: Date): string => {
      const expFormatted = dataExpiracao.toLocaleDateString('pt-BR')
      return `${pacienteNome}, o link para o seu(s) teste(s) é: ${linkUrl} e a senha de acesso é ${codigo}. Você tem até o dia ${expFormatted} para finaliza-lo(s). Em caso de dúvidas, por favor, entre em contato conosco`
    },
    []
  )

  return {
    // State
    links,
    selectedLink,
    isLoading,
    error,
    pagination,
    flowState,
    generatedLinkState,
    canProceed,

    // CRUD Actions
    fetchLinks,
    getLink,
    createOrGetHub,
    addTestesToHub,
    extendExpiracao,
    revogar,

    // Flow Actions
    startFlow,
    selectMode,
    toggleTesteSelection,
    setSelectedTesteIds,
    completeFlow,
    clearSelection,
    clearGeneratedLink,

    // Utility Actions
    copyShareMessage,
    copyLinkUrl,
    generateShareMessage,
    setSelectedLink,
    reset,
  }
}
