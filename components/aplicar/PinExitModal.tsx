'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

import { Button } from '@/components/ui/atoms/Button'

interface PinExitModalProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: (pin: string) => Promise<boolean>
  remainingAttempts: number
  maxAttempts: number
  isLoading?: boolean
  error?: string | null
}

export default function PinExitModal({
  isOpen,
  onCancel,
  onSubmit,
  remainingAttempts,
  maxAttempts,
  isLoading = false,
  error: externalError = null,
}: PinExitModalProps) {
  const pinLength = 4
  const [pin, setPin] = useState<string[]>(Array(pinLength).fill(''))
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (isOpen) {
      setPin(Array(pinLength).fill(''))
      setError(null)
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (externalError) {
      setError(externalError)
      // Clear PIN on error
      setPin(Array(pinLength).fill(''))
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [externalError])

  const handleInputChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return

      const newPin = [...pin]

      if (value.length === 1) {
        newPin[index] = value
        setPin(newPin)
        setError(null)

        // Move to next input
        if (index < pinLength - 1) {
          inputRefs.current[index + 1]?.focus()
        }
      } else if (value.length === 0) {
        newPin[index] = ''
        setPin(newPin)
      }
    },
    [pin]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else if (e.key === 'ArrowRight' && index < pinLength - 1) {
        inputRefs.current[index + 1]?.focus()
      } else if (e.key === 'Enter') {
        handleSubmit()
      }
    },
    [pin]
  )

  const handleSubmit = async () => {
    const pinValue = pin.join('')
    if (pinValue.length !== pinLength) {
      setError('Digite o PIN completo')
      return
    }

    await onSubmit(pinValue)
  }

  if (!isOpen) return null

  const attemptsWarning = remainingAttempts <= 2
  const isBlocked = remainingAttempts <= 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
        {isBlocked ? (
          // Blocked State
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sessão Bloqueada</h2>
            <p className="text-gray-600 mb-6">
              Muitas tentativas incorretas. Entre em contato com o profissional
              responsável para desbloquear.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
              O teste foi interrompido por segurança.
            </div>
          </div>
        ) : (
          // PIN Entry State
          <>
            <div className="text-center mb-6">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-yellow-600"
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
              </div>
              <h2 className="text-xl font-bold text-gray-900">Sair do Modo Entrega</h2>
              <p className="text-sm text-gray-500 mt-2">
                Digite o PIN de 4 dígitos para encerrar a sessão
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Attempts Warning */}
            {attemptsWarning && !error && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm text-center">
                Atenção: {remainingAttempts} tentativa{remainingAttempts !== 1 ? 's' : ''}{' '}
                restante{remainingAttempts !== 1 ? 's' : ''}
              </div>
            )}

            {/* PIN Inputs */}
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`
                    w-14 h-14 text-center text-2xl font-bold
                    border-2 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${error ? 'border-red-300 animate-shake' : 'border-gray-300'}
                  `}
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Attempts Counter */}
            <div className="text-center text-sm text-gray-500 mb-4">
              {remainingAttempts} de {maxAttempts} tentativas restantes
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Voltar ao Teste
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={pin.some((d) => d === '') || isLoading}
                isLoading={isLoading}
              >
                Confirmar
              </Button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
