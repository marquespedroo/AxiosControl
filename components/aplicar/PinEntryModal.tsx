'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/atoms/Button'

interface PinEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (pin: string) => Promise<boolean>
  title?: string
  description?: string
  pinLength?: number
  isLoading?: boolean
  error?: string | null
}

export default function PinEntryModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Configurar PIN',
  description = 'Defina um PIN de 4 dígitos para proteger a sessão',
  pinLength = 4,
  isLoading = false,
  error: externalError = null,
}: PinEntryModalProps) {
  const [pin, setPin] = useState<string[]>(Array(pinLength).fill(''))
  const [confirmPin, setConfirmPin] = useState<string[]>(Array(pinLength).fill(''))
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (isOpen) {
      setPin(Array(pinLength).fill(''))
      setConfirmPin(Array(pinLength).fill(''))
      setStep('enter')
      setError(null)
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen, pinLength])

  useEffect(() => {
    if (externalError) {
      setError(externalError)
    }
  }, [externalError])

  const handleInputChange = useCallback(
    (index: number, value: string, isConfirm: boolean = false) => {
      if (!/^\d*$/.test(value)) return

      const currentPin = isConfirm ? [...confirmPin] : [...pin]
      const refs = isConfirm ? confirmInputRefs : inputRefs

      if (value.length === 1) {
        currentPin[index] = value
        if (isConfirm) {
          setConfirmPin(currentPin)
        } else {
          setPin(currentPin)
        }

        // Move to next input
        if (index < pinLength - 1) {
          refs.current[index + 1]?.focus()
        }
      } else if (value.length === 0) {
        currentPin[index] = ''
        if (isConfirm) {
          setConfirmPin(currentPin)
        } else {
          setPin(currentPin)
        }
      }
    },
    [pin, confirmPin, pinLength]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent, isConfirm: boolean = false) => {
      const currentPin = isConfirm ? confirmPin : pin
      const refs = isConfirm ? confirmInputRefs : inputRefs

      if (e.key === 'Backspace' && currentPin[index] === '' && index > 0) {
        refs.current[index - 1]?.focus()
      } else if (e.key === 'ArrowLeft' && index > 0) {
        refs.current[index - 1]?.focus()
      } else if (e.key === 'ArrowRight' && index < pinLength - 1) {
        refs.current[index + 1]?.focus()
      }
    },
    [pin, confirmPin, pinLength]
  )

  const handleProceedToConfirm = () => {
    const pinValue = pin.join('')
    if (pinValue.length !== pinLength) {
      setError(`Digite ${pinLength} dígitos`)
      return
    }
    setError(null)
    setStep('confirm')
    setTimeout(() => {
      confirmInputRefs.current[0]?.focus()
    }, 100)
  }

  const handleSubmit = async () => {
    const pinValue = pin.join('')
    const confirmPinValue = confirmPin.join('')

    if (pinValue !== confirmPinValue) {
      setError('Os PINs não coincidem')
      setConfirmPin(Array(pinLength).fill(''))
      confirmInputRefs.current[0]?.focus()
      return
    }

    const success = await onSubmit(pinValue)
    if (!success && !externalError) {
      setError('Erro ao configurar PIN')
    }
  }

  if (!isOpen) return null

  const renderPinInputs = (
    values: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    isConfirm: boolean = false
  ) => (
    <div className="flex justify-center gap-3">
      {values.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el
          }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInputChange(index, e.target.value, isConfirm)}
          onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
          className={`
            w-14 h-14 text-center text-2xl font-bold
            border-2 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
          disabled={isLoading}
        />
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-blue-600"
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
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-2">
            {step === 'enter' ? description : 'Confirme o PIN digitado'}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="mb-6">
          {step === 'enter'
            ? renderPinInputs(pin, inputRefs, false)
            : renderPinInputs(confirmPin, confirmInputRefs, true)}
        </div>

        {step === 'confirm' && (
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={() => {
                setStep('enter')
                setConfirmPin(Array(pinLength).fill(''))
                setError(null)
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Voltar e alterar PIN
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
            Cancelar
          </Button>
          {step === 'enter' ? (
            <Button
              onClick={handleProceedToConfirm}
              className="flex-1"
              disabled={pin.some((d) => d === '') || isLoading}
            >
              Continuar
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={confirmPin.some((d) => d === '') || isLoading}
              isLoading={isLoading}
            >
              Confirmar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
