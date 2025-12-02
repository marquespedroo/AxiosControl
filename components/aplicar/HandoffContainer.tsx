'use client'

import { useEffect, ReactNode } from 'react'
import { useHandoffMode } from '@/lib/hooks/useHandoffMode'
import PinExitModal from './PinExitModal'

interface HandoffContainerProps {
  children: ReactNode
  onExitSuccess?: () => void
}

/**
 * HandoffContainer wraps the test interface during handoff mode.
 * It prevents navigation and shows exit PIN modal when needed.
 */
export default function HandoffContainer({
  children,
  onExitSuccess,
}: HandoffContainerProps) {
  const {
    isActive,
    isLocked,
    pinState,
    showPinExit,
    validateExitPin,
    cancelExitRequest,
    completeExit,
    requestExit,
  } = useHandoffMode()

  // Handle successful PIN validation
  const handleExitSubmit = async (pin: string): Promise<boolean> => {
    const success = await validateExitPin(pin)
    if (success) {
      await completeExit()
      onExitSuccess?.()
    }
    return success
  }

  // Disable context menu during handoff
  useEffect(() => {
    if (!isActive) return

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [isActive])

  // Disable keyboard shortcuts during handoff
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block common escape/navigation shortcuts
      if (
        e.key === 'Escape' ||
        (e.ctrlKey && e.key === 'w') ||
        (e.ctrlKey && e.key === 'q') ||
        (e.metaKey && e.key === 'w') ||
        (e.metaKey && e.key === 'q') ||
        e.key === 'F5' ||
        (e.ctrlKey && e.key === 'r') ||
        (e.metaKey && e.key === 'r')
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive])

  if (!isActive) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-screen">
      {/* Handoff Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="font-medium">Modo Entrega Ativo</span>
        </div>
        <button
          onClick={requestExit}
          disabled={isLocked}
          className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sair
        </button>
      </div>

      {/* Main Content with padding for header */}
      <div className="pt-12">
        {children}
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-50 bg-red-900/90 flex items-center justify-center">
          <div className="text-center text-white max-w-md p-6">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-red-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Sessão Bloqueada</h2>
            <p className="text-red-200 mb-6">
              Muitas tentativas de PIN incorretas.
              <br />
              Entre em contato com o profissional responsável.
            </p>
            <div className="bg-red-800/50 rounded-lg p-4 text-sm">
              O teste foi interrompido por segurança.
            </div>
          </div>
        </div>
      )}

      {/* PIN Exit Modal */}
      <PinExitModal
        isOpen={showPinExit}
        onCancel={cancelExitRequest}
        onSubmit={handleExitSubmit}
        remainingAttempts={pinState.remainingAttempts}
        maxAttempts={pinState.maxAttempts}
      />
    </div>
  )
}
