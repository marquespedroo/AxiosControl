'use client'

import { useCallback, useEffect } from 'react'
import {
  useHandoffStore,
  selectIsHandoffActive,
  selectIsLocked,
  selectSessionId,
  selectCurrentTeste,
  selectPinState,
  selectCanExit,
  selectProgress,
} from '@/lib/stores/useHandoffStore'
import type { TesteAplicado } from '@/types/database'

interface HandoffApiResponse {
  success?: boolean
  session_id?: string
  teste?: {
    id: string
    status: string
    progresso: number
  }
  valid?: boolean
  remaining_attempts?: number
  error?: string
  message?: string
}

/**
 * Custom hook for handoff mode management
 * Manages the PIN-protected device handoff flow
 */
export function useHandoffMode() {
  // Store state
  const isActive = useHandoffStore(selectIsHandoffActive)
  const isLocked = useHandoffStore(selectIsLocked)
  const sessionId = useHandoffStore(selectSessionId)
  const currentTeste = useHandoffStore(selectCurrentTeste)
  const pinState = useHandoffStore(selectPinState)
  const canExit = useHandoffStore(selectCanExit)
  const progress = useHandoffStore(selectProgress)

  // Store actions
  const {
    startSession,
    endSession,
    lockSession,
    updateTesteProgress,
    openPinEntry,
    closePinEntry,
    openPinExit,
    closePinExit,
    incrementPinAttempts,
    resetPinAttempts,
    setMaxAttempts,
    setLoading,
    setError,
    reset,
  } = useHandoffStore()

  /**
   * Initialize handoff mode with PIN
   * Called when professional sets up handoff for patient
   */
  const initializeHandoff = useCallback(
    async (testeAplicadoId: string, pin: string): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/handoff/iniciar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teste_aplicado_id: testeAplicadoId,
            pin,
          }),
        })

        const data: HandoffApiResponse = await response.json()

        if (!response.ok || !data.success) {
          setError(data.message || 'Erro ao iniciar modo entrega')
          setLoading(false)
          return false
        }

        // Create a minimal TesteAplicado from the response
        const teste: TesteAplicado = {
          id: data.teste!.id,
          status: data.teste!.status as TesteAplicado['status'],
          progresso: data.teste!.progresso,
        } as TesteAplicado

        startSession(data.session_id!, teste)
        setLoading(false)
        return true
      } catch (error) {
        setError('Erro de conexão ao iniciar modo entrega')
        setLoading(false)
        return false
      }
    },
    [setLoading, setError, startSession]
  )

  /**
   * Validate PIN to exit handoff mode
   */
  const validateExitPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!sessionId) {
        setError('Sessão não encontrada')
        return false
      }

      setLoading(true)

      try {
        const response = await fetch('/api/handoff/validar-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            pin,
          }),
        })

        const data: HandoffApiResponse = await response.json()

        if (!response.ok) {
          incrementPinAttempts()
          setError(data.message || 'PIN inválido')
          setLoading(false)
          return false
        }

        if (data.valid) {
          resetPinAttempts()
          closePinExit()
          setLoading(false)
          return true
        } else {
          incrementPinAttempts()
          setError(`PIN incorreto. ${data.remaining_attempts} tentativas restantes.`)
          setLoading(false)
          return false
        }
      } catch (error) {
        setError('Erro de conexão ao validar PIN')
        setLoading(false)
        return false
      }
    },
    [sessionId, setLoading, setError, incrementPinAttempts, resetPinAttempts, closePinExit]
  )

  /**
   * Request to exit handoff mode
   * Opens PIN validation modal
   */
  const requestExit = useCallback(() => {
    if (isActive && !isLocked) {
      openPinExit()
    }
  }, [isActive, isLocked, openPinExit])

  /**
   * Cancel exit request
   */
  const cancelExitRequest = useCallback(() => {
    closePinExit()
  }, [closePinExit])

  /**
   * Complete exit and end session
   */
  const completeExit = useCallback(async () => {
    endSession()
    reset()
  }, [endSession, reset])

  /**
   * Update test progress during handoff
   */
  const updateProgress = useCallback(
    (progresso: number) => {
      updateTesteProgress(progresso)
    },
    [updateTesteProgress]
  )

  /**
   * Handle test completion in handoff mode
   */
  const completeTest = useCallback(() => {
    updateTesteProgress(100)
    // After test completion, show exit PIN modal
    openPinExit()
  }, [updateTesteProgress, openPinExit])

  /**
   * Check if session is locked due to max attempts
   */
  const checkLockStatus = useCallback(() => {
    if (pinState.attempts >= pinState.maxAttempts) {
      lockSession()
      return true
    }
    return false
  }, [pinState.attempts, pinState.maxAttempts, lockSession])

  // Auto-lock when max attempts reached
  useEffect(() => {
    if (isActive && pinState.attempts >= pinState.maxAttempts) {
      lockSession()
    }
  }, [isActive, pinState.attempts, pinState.maxAttempts, lockSession])

  // Prevent navigation when in handoff mode
  useEffect(() => {
    if (!isActive) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }

    const handlePopState = (e: PopStateEvent) => {
      if (isActive && !isLocked) {
        e.preventDefault()
        openPinExit()
        // Push state back to prevent navigation
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    // Push initial state for popstate handling
    window.history.pushState(null, '', window.location.href)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isActive, isLocked, openPinExit])

  return {
    // State
    isActive,
    isLocked,
    sessionId,
    currentTeste,
    pinState,
    canExit,
    progress,

    // PIN Modal State
    showPinEntry: pinState.showEntry,
    showPinExit: pinState.showExit,

    // Actions
    initializeHandoff,
    validateExitPin,
    requestExit,
    cancelExitRequest,
    completeExit,
    updateProgress,
    completeTest,
    checkLockStatus,

    // Session Actions (for restoring session)
    startSession,

    // Modal Actions
    openPinEntry,
    closePinEntry,
    openPinExit,
    closePinExit,

    // Configuration
    setMaxAttempts,

    // Reset
    reset,
  }
}
