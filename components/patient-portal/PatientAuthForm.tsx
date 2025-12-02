'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

import { Button } from '@/components/ui/atoms/Button'

interface PatientAuthFormProps {
  onSubmit: (code: string) => Promise<boolean>
  isLoading?: boolean
  error?: string | null
  remainingAttempts?: number
  maxAttempts?: number
}

export default function PatientAuthForm({
  onSubmit,
  isLoading = false,
  error: externalError = null,
  remainingAttempts = 3,
  maxAttempts = 3,
}: PatientAuthFormProps) {
  const codeLength = 6
  const [code, setCode] = useState<string[]>(Array(codeLength).fill(''))
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (externalError) {
      setError(externalError)
      // Clear code on error
      setCode(Array(codeLength).fill(''))
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [externalError])

  const handleInputChange = useCallback(
    (index: number, value: string) => {
      // Allow only numbers
      if (!/^\d*$/.test(value)) return

      const newCode = [...code]

      if (value.length === 1) {
        newCode[index] = value
        setCode(newCode)
        setError(null)

        // Move to next input
        if (index < codeLength - 1) {
          inputRefs.current[index + 1]?.focus()
        }
      } else if (value.length === 0) {
        newCode[index] = ''
        setCode(newCode)
      } else if (value.length > 1) {
        // Handle paste
        const digits = value.replace(/\D/g, '').slice(0, codeLength)
        for (let i = 0; i < codeLength; i++) {
          newCode[i] = digits[i] || ''
        }
        setCode(newCode)
        const lastFilledIndex = Math.min(digits.length - 1, codeLength - 1)
        inputRefs.current[lastFilledIndex]?.focus()
      }
    },
    [code]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && code[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else if (e.key === 'ArrowRight' && index < codeLength - 1) {
        inputRefs.current[index + 1]?.focus()
      } else if (e.key === 'Enter') {
        handleSubmit()
      }
    },
    [code]
  )

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').slice(0, codeLength)

    if (digits.length > 0) {
      const newCode = Array(codeLength).fill('')
      for (let i = 0; i < digits.length && i < codeLength; i++) {
        newCode[i] = digits[i]
      }
      setCode(newCode)
      const lastFilledIndex = Math.min(digits.length - 1, codeLength - 1)
      inputRefs.current[lastFilledIndex]?.focus()
    }
  }, [])

  const handleSubmit = async () => {
    const codeValue = code.join('')
    if (codeValue.length !== codeLength) {
      setError('Digite o código completo de 6 dígitos')
      return
    }

    await onSubmit(codeValue)
  }

  const isBlocked = remainingAttempts <= 0

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso ao Teste</h1>
        <p className="text-gray-600">
          Digite o código de 6 dígitos que você recebeu
        </p>
      </div>

      {isBlocked ? (
        // Blocked State
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-red-500"
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
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Acesso Bloqueado
          </h2>
          <p className="text-red-600 text-sm">
            Muitas tentativas incorretas. Entre em contato com o profissional
            responsável.
          </p>
        </div>
      ) : (
        <>
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Attempts Warning */}
          {remainingAttempts < maxAttempts && remainingAttempts > 0 && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm text-center">
              {remainingAttempts} tentativa{remainingAttempts !== 1 ? 's' : ''} restante
              {remainingAttempts !== 1 ? 's' : ''}
            </div>
          )}

          {/* Code Inputs */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`
                  w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold
                  border-2 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${error ? 'border-red-300' : 'border-gray-300'}
                  transition-colors
                `}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={code.some((d) => d === '') || isLoading}
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            Acessar Testes
          </Button>

          {/* Help Text */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Não recebeu o código?{' '}
            <span className="text-blue-600">
              Entre em contato com o profissional responsável
            </span>
          </p>
        </>
      )}
    </div>
  )
}
