'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/atoms/Button'

interface Question {
  id: string
  texto: string
  tipo: string
  opcoes?: { valor: number; texto: string }[]
  ordem: number
}

interface PatientTestRunnerProps {
  testeId: string
  testeNome: string
  testeSigla: string
  questions: Question[]
  currentResponses: Record<string, number>
  onSaveResponse: (questionId: string, value: number) => Promise<void>
  onComplete: () => Promise<void>
  onBack: () => void
  isLoading?: boolean
}

export default function PatientTestRunner({
  testeId: _testeId,
  testeNome,
  testeSigla,
  questions,
  currentResponses,
  onSaveResponse,
  onComplete,
  onBack,
  isLoading = false,
}: PatientTestRunnerProps) {
  // _testeId available for future use (e.g., analytics)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>(currentResponses)
  const [saving, setSaving] = useState(false)

  // Find first unanswered question on mount
  useEffect(() => {
    const firstUnanswered = questions.findIndex(
      (q) => responses[q.id] === undefined
    )
    if (firstUnanswered > 0) {
      setCurrentIndex(firstUnanswered)
    }
  }, [])

  const currentQuestion = questions[currentIndex]
  const progress = (Object.keys(responses).length / questions.length) * 100
  const isLastQuestion = currentIndex === questions.length - 1
  const isAnswered = responses[currentQuestion?.id] !== undefined
  const allAnswered = Object.keys(responses).length === questions.length

  const handleSelectOption = useCallback(
    async (value: number) => {
      if (!currentQuestion) return

      setSaving(true)
      try {
        await onSaveResponse(currentQuestion.id, value)
        setResponses((prev) => ({ ...prev, [currentQuestion.id]: value }))

        // Auto-advance to next question
        if (!isLastQuestion) {
          setTimeout(() => {
            setCurrentIndex((prev) => prev + 1)
          }, 300)
        }
      } catch (error) {
        console.error('Error saving response:', error)
      } finally {
        setSaving(false)
      }
    },
    [currentQuestion, isLastQuestion, onSaveResponse]
  )

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleComplete = async () => {
    if (allAnswered) {
      await onComplete()
    }
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Carregando questões...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {testeSigla} - {testeNome}
            </h1>
            <p className="text-sm text-gray-500">
              Questão {currentIndex + 1} de {questions.length}
            </p>
          </div>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 min-h-[300px]">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4">
            Questão {currentIndex + 1}
          </span>
          <p className="text-lg text-gray-900">{currentQuestion.texto}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.opcoes?.map((opcao) => {
            const isSelected = responses[currentQuestion.id] === opcao.valor

            return (
              <button
                key={opcao.valor}
                onClick={() => handleSelectOption(opcao.valor)}
                disabled={saving}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                  ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }
                    `}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm sm:text-base">{opcao.texto}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || saving}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Anterior
        </Button>

        <div className="text-sm text-gray-500">
          {Object.keys(responses).length} de {questions.length} respondidas
        </div>

        {isLastQuestion && allAnswered ? (
          <Button onClick={handleComplete} isLoading={isLoading} disabled={!allAnswered}>
            Finalizar
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isAnswered || saving}
            variant={isAnswered ? 'default' : 'outline'}
          >
            Próxima
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Navegação Rápida
        </p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isCurrentQ = idx === currentIndex
            const isAnsweredQ = responses[q.id] !== undefined

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`
                  w-8 h-8 rounded-full text-xs font-medium transition-colors
                  ${
                    isCurrentQ
                      ? 'bg-blue-500 text-white'
                      : isAnsweredQ
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
