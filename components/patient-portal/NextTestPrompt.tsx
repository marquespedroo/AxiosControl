'use client'

import { Button } from '@/components/ui/atoms/Button'

interface NextTestPromptProps {
  completedTestName: string
  nextTestName?: string
  nextTestSigla?: string
  testsRemaining: number
  totalTests: number
  onContinue: () => void
  onBackToList: () => void
}

export default function NextTestPrompt({
  completedTestName,
  nextTestName,
  nextTestSigla,
  testsRemaining,
  totalTests,
  onContinue,
  onBackToList,
}: NextTestPromptProps) {
  const progress = ((totalTests - testsRemaining) / totalTests) * 100

  return (
    <div className="max-w-md mx-auto text-center">
      {/* Success Animation */}
      <div className="relative mb-6">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce-once">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Completed Message */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Muito bem!</h2>
      <p className="text-gray-600 mb-6">
        Você completou o teste <span className="font-medium">{completedTestName}</span>
      </p>

      {/* Progress */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progresso</span>
          <span>
            {totalTests - testsRemaining} de {totalTests} testes
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Next Test Info */}
      {testsRemaining > 0 && nextTestName && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-600 mb-1">Próximo teste:</p>
          <p className="font-semibold text-blue-900">
            {nextTestSigla} - {nextTestName}
          </p>
          <p className="text-sm text-blue-600 mt-2">
            {testsRemaining} teste{testsRemaining !== 1 ? 's' : ''} restante
            {testsRemaining !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {testsRemaining > 0 ? (
          <>
            <Button onClick={onContinue} className="w-full" size="lg">
              Continuar para o próximo teste
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
            <Button variant="outline" onClick={onBackToList} className="w-full">
              Ver lista de testes
            </Button>
          </>
        ) : (
          <Button onClick={onBackToList} className="w-full" size="lg">
            Ver resultados
            <svg
              className="w-5 h-5 ml-2"
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
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-once {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
