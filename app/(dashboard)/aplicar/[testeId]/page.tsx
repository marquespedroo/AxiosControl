'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import QuestionRenderer from '@/components/test/QuestionRenderer'
import { HandoffContainer } from '@/components/aplicar'
import { useHandoffMode } from '@/lib/hooks/useHandoffMode'
import { Questao, Respostas } from '@/types/database'

interface TesteData {
  id: string
  status: string
  respostas: Respostas
  teste_template: {
    nome: string
    questoes: Questao[]
    tempo_estimado: number
    escalas_resposta?: Record<string, any>
  }
  paciente: {
    nome_completo: string
  }
}

interface CalculationError {
  message: string
  details?: string
  answersSaved?: boolean
  canRetry?: boolean
}

export default function AplicarTestePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [teste, setTeste] = useState<TesteData | null>(null)
  const [respostas, setRespostas] = useState<Respostas>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calculationError, setCalculationError] = useState<CalculationError | null>(null)

  // Handoff mode state
  const isHandoffMode = searchParams.get('handoff') === 'true'
  const { isActive: isHandoffActive, startSession } = useHandoffMode()

  // Restore handoff session from sessionStorage
  useEffect(() => {
    if (isHandoffMode && !isHandoffActive) {
      const storedSession = sessionStorage.getItem('handoffSession')
      if (storedSession) {
        try {
          const { sessionId, testeAplicadoId } = JSON.parse(storedSession)
          if (sessionId && testeAplicadoId === params.testeId) {
            // Restore session with minimal teste data
            startSession(sessionId, {
              id: testeAplicadoId,
              status: 'em_andamento',
              progresso: 0,
            } as any)
          }
        } catch (e) {
          console.error('Error restoring handoff session:', e)
        }
      }
    }
  }, [isHandoffMode, isHandoffActive, params.testeId, startSession])

  useEffect(() => {
    const fetchTeste = async () => {
      console.log('🔍 Fetching test with ID:', params.testeId)

      try {
        // Cookies are sent automatically
        const url = `/api/testes-aplicados/${params.testeId}`
        console.log('📡 Request URL:', url)

        const response = await fetch(url, {
          credentials: 'include' // Ensure cookies are sent
        })

        console.log('📥 Response status:', response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ API Error:', errorData)
          throw new Error(errorData.message || 'Teste não encontrado')
        }

        const data = await response.json()
        console.log('✅ Test data loaded:', {
          id: data.id,
          status: data.status,
          template: data.teste_template?.nome,
          patient: data.paciente?.nome_completo,
          questions: data.teste_template?.questoes?.length
        })

        setTeste(data)
        setRespostas(data.respostas || {})
      } catch (err: any) {
        console.error('❌ Error fetching test:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeste()
  }, [params.testeId])

  const handleResponder = (numeroQuestao: number, valor: string) => {
    setRespostas(prev => ({
      ...prev,
      [`q${numeroQuestao}`]: valor  // Use q1, q2, q3... format
    }))
  }

  const saveProgress = async () => {
    try {
      setIsSaving(true)
      // Cookies are sent automatically
      await fetch(`/api/testes-aplicados/${params.testeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          respostas,
          status: 'em_andamento'
        }),
      })
    } catch (err) {
      console.error('Erro ao salvar progresso:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      saveProgress()
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (!teste) return

    // CRITICAL FIX: Require answer before allowing navigation
    const currentQuestion = teste.teste_template.questoes[currentQuestionIndex]
    const currentAnswer = respostas[`q${currentQuestion.numero}`]

    if (currentAnswer === undefined || currentAnswer === null) {
      alert('Por favor, responda a questão atual antes de continuar.')
      return
    }

    if (currentQuestionIndex < teste.teste_template.questoes.length - 1) {
      saveProgress()
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handleFinalize = async () => {
    if (!teste) return

    // Clear any previous calculation error
    setCalculationError(null)

    // IMPROVED: Check if all questions are answered (excluding null/undefined values)
    const totalQuestoes = teste.teste_template.questoes.length
    const validRespostas = Object.values(respostas).filter(r => r !== null && r !== undefined)
    const respostasCount = validRespostas.length

    if (respostasCount < totalQuestoes) {
      const unansweredCount = totalQuestoes - respostasCount
      const confirmar = window.confirm(
        `Você respondeu ${respostasCount} de ${totalQuestoes} questões.\n\n` +
        `${unansweredCount} questão${unansweredCount !== 1 ? 'ões' : ''} ainda não foi${unansweredCount !== 1 ? 'ram' : ''} respondida${unansweredCount !== 1 ? 's' : ''}.\n\n` +
        `Deseja finalizar mesmo assim? Os resultados podem não ser precisos.`
      )
      if (!confirmar) return
    }

    try {
      setIsSaving(true)

      // Save final responses - cookies are sent automatically
      await fetch(`/api/testes-aplicados/${params.testeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          respostas,
        }),
      })

      // Finalize and calculate - cookies are sent automatically
      const finalizeResponse = await fetch(`/api/testes-aplicados/${params.testeId}/finalizar`, {
        method: 'POST',
        credentials: 'include' // Ensure cookies are sent
      })

      if (!finalizeResponse.ok) {
        const errorData = await finalizeResponse.json().catch(() => ({}))

        // Check if this is a calculation error with saved answers
        if (errorData.error === 'CALC_999' && errorData.answersSaved) {
          setCalculationError({
            message: errorData.message,
            details: errorData.details,
            answersSaved: errorData.answersSaved,
            canRetry: errorData.canRetry
          })
          setIsSaving(false)
          return
        }

        throw new Error(errorData.message || 'Erro ao finalizar teste')
      }

      // Redirect to results
      router.push(`/resultados/${params.testeId}`)
    } catch (err: any) {
      console.error('Error finalizing test:', err)
      setError(err.message)
      setIsSaving(false)
    }
  }

  const handleRetryCalculation = async () => {
    setCalculationError(null)
    await handleFinalize()
  }

  const handleViewAnswersOnly = () => {
    // Navigate to a page that shows only the answers without scores
    router.push(`/resultados/${params.testeId}?modo=respostas`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando teste...</div>
      </div>
    )
  }

  if (error || !teste) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Teste não encontrado'}</div>
      </div>
    )
  }

  const questoes = teste.teste_template.questoes
  const currentQuestion = questoes[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questoes.length) * 100

  // IMPROVED: Count only valid answers (excluding null/undefined)
  const respostasCount = Object.values(respostas).filter(r => r !== null && r !== undefined).length
  const isCurrentQuestionAnswered = respostas[`q${currentQuestion.numero}`] !== undefined && respostas[`q${currentQuestion.numero}`] !== null

  // Handle exit from handoff mode
  const handleHandoffExit = () => {
    // Clear handoff session from storage
    sessionStorage.removeItem('handoffSession')
    // Redirect to results or dashboard
    router.push(`/resultados/${params.testeId}`)
  }

  // Main test content
  const testContent = (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{teste.teste_template.nome}</h1>
              <p className="text-sm text-gray-600">Paciente: {teste.paciente.nome_completo}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Questão {currentQuestionIndex + 1} de {questoes.length}
              </p>
              <div className="flex items-center justify-end gap-2">
                <p className="text-xs text-gray-500">
                  {respostasCount} respondidas
                </p>
                {isCurrentQuestionAnswered && (
                  <span className="text-green-600 text-xs">✓ Respondida</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Calculation Error Banner */}
      {calculationError && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Erro ao calcular pontuação
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    {calculationError.message}
                    {calculationError.details && (
                      <span className="block text-xs text-red-600 mt-1">
                        Detalhes: {calculationError.details}
                      </span>
                    )}
                  </p>
                  {calculationError.answersSaved && (
                    <p className="mt-2 text-sm text-green-700 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Suas respostas foram salvas com sucesso.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={handleViewAnswersOnly}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ver apenas as respostas
                </button>
                {calculationError.canRetry && (
                  <button
                    onClick={handleRetryCalculation}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    {isSaving ? 'Calculando...' : 'Calcular novamente'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuestionRenderer
          questao={currentQuestion}
          resposta={respostas[`q${currentQuestion.numero}`] as string | undefined}
          onResponder={handleResponder}
          escalasResposta={teste.teste_template.escalas_resposta}
        />

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <div className="flex flex-col items-center gap-1">
            {isSaving && <span className="text-sm text-gray-600">Salvando...</span>}
            {!isCurrentQuestionAnswered && (
              <span className="text-xs text-orange-600 font-medium">⚠️ Responda para continuar</span>
            )}
          </div>

          {currentQuestionIndex < questoes.length - 1 ? (
            <button
              onClick={handleNext}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                isCurrentQuestionAnswered
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Próxima →
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              disabled={isSaving}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Finalizar Teste
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // Wrap with HandoffContainer if in handoff mode
  if (isHandoffMode || isHandoffActive) {
    return (
      <HandoffContainer onExitSuccess={handleHandoffExit}>
        {testContent}
      </HandoffContainer>
    )
  }

  return testContent
}
