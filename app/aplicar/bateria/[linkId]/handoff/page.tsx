'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import QuestionRenderer from '@/components/test/QuestionRenderer'
import NextTestPrompt from '@/components/patient-portal/NextTestPrompt'
import { HandoffContainer } from '@/components/aplicar'
import { useHandoffMode } from '@/lib/hooks/useHandoffMode'
import { Questao } from '@/types/database'

// Local types that match actual API responses
interface LocalRespostas {
  [key: string]: string | number | null | undefined
}

interface LinkTesteItem {
  id: string
  ordem: number
  teste_aplicado: {
    id: string
    status: string // API can return 'pendente', 'em_andamento', 'concluido', etc.
    progresso: number
    data_conclusao: string | null
  }
  teste_template: {
    id: string
    nome: string
    sigla: string
  }
}

interface LinkData {
  id: string
  paciente: {
    id: string
    nome_completo: string
    data_nascimento: string | null
  }
  psicologo: {
    id: string
    nome_completo: string
  }
  testes: LinkTesteItem[]
  total_testes: number
  testes_completos: number
  progresso_geral: number
}

interface TesteData {
  id: string
  status: string
  respostas: LocalRespostas
  teste_template: {
    nome: string
    sigla: string
    questoes: Questao[]
    tempo_estimado: number
    escalas_resposta?: Record<string, any>
  }
}

type PageState = 'loading' | 'test' | 'prompt' | 'completed' | 'error'

/**
 * Handoff Bateria Runner Page
 * Simplified interface for patient use with multiple tests - no navigation, PIN-protected exit
 * This route is OUTSIDE the dashboard layout to hide all navigation
 */
export default function HandoffBateriaPage() {
  const params = useParams()
  const router = useRouter()
  const linkId = params.linkId as string

  const [state, setState] = useState<PageState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [linkData, setLinkData] = useState<LinkData | null>(null)

  // Current test state
  const [currentTeste, setCurrentTeste] = useState<TesteData | null>(null)
  const [currentTesteIndex, setCurrentTesteIndex] = useState(0)
  const [respostas, setRespostas] = useState<LocalRespostas>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  // For prompt state
  const [completedTestName, setCompletedTestName] = useState('')

  // Handoff mode
  const { isActive: isHandoffActive, startSession, completeTest } = useHandoffMode()

  // Restore handoff session from sessionStorage
  useEffect(() => {
    if (!isHandoffActive) {
      const storedSession = sessionStorage.getItem('handoffSession')
      if (storedSession) {
        try {
          const { linkId: storedLinkId, mode } = JSON.parse(storedSession)
          if (storedLinkId === linkId && mode === 'bateria') {
            // Initialize a dummy session for handoff container
            startSession('bateria-session', {
              id: linkId,
              status: 'em_andamento',
              progresso: 0,
            } as any)
          }
        } catch (e) {
          console.error('Error restoring handoff session:', e)
        }
      }
    }
  }, [isHandoffActive, linkId, startSession])

  // Load link data
  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        const response = await fetch(`/api/links-paciente/${linkId}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Link não encontrado')
        }

        const data: LinkData = await response.json()
        setLinkData(data)

        // Find first test to run (pendente or em_andamento)
        const sortedTests = [...data.testes].sort((a, b) => a.ordem - b.ordem)
        const firstActiveTest = sortedTests.find(
          t => t.teste_aplicado.status === 'pendente' || t.teste_aplicado.status === 'em_andamento'
        )

        if (firstActiveTest) {
          const idx = sortedTests.findIndex(t => t.id === firstActiveTest.id)
          setCurrentTesteIndex(idx)
          await loadTest(firstActiveTest.teste_aplicado.id)
        } else if (data.progresso_geral === 100) {
          setState('completed')
        } else {
          setError('Nenhum teste disponível')
          setState('error')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
        setState('error')
      }
    }

    fetchLinkData()
  }, [linkId])

  const loadTest = useCallback(async (testeAplicadoId: string) => {
    try {
      const response = await fetch(`/api/testes-aplicados/${testeAplicadoId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar teste')
      }

      const data: TesteData = await response.json()
      setCurrentTeste(data)
      setRespostas(data.respostas || {})

      // Find first unanswered question
      if (data.respostas) {
        const questoes = data.teste_template.questoes
        const firstUnanswered = questoes.findIndex(
          (q: Questao) => data.respostas[`q${q.numero}`] === undefined
        )
        if (firstUnanswered > 0) {
          setCurrentQuestionIndex(firstUnanswered)
        } else {
          setCurrentQuestionIndex(0)
        }
      } else {
        setCurrentQuestionIndex(0)
      }

      setState('test')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar teste')
      setState('error')
    }
  }, [])

  const handleResponder = (numeroQuestao: number, valor: string) => {
    setRespostas(prev => ({
      ...prev,
      [`q${numeroQuestao}`]: valor
    }))
  }

  const saveProgress = async () => {
    if (!currentTeste) return

    try {
      setIsSaving(true)
      await fetch(`/api/testes-aplicados/${currentTeste.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    if (!currentTeste) return

    const currentQuestion = currentTeste.teste_template.questoes[currentQuestionIndex]
    const currentAnswer = respostas[`q${currentQuestion.numero}`]

    if (currentAnswer === undefined || currentAnswer === null) {
      return // Can't proceed without answering
    }

    if (currentQuestionIndex < currentTeste.teste_template.questoes.length - 1) {
      saveProgress()
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handleFinalizeTest = async () => {
    if (!currentTeste || !linkData) return

    try {
      setIsSaving(true)

      // Save final responses
      await fetch(`/api/testes-aplicados/${currentTeste.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ respostas }),
      })

      // Finalize test
      const finalizeResponse = await fetch(`/api/testes-aplicados/${currentTeste.id}/finalizar`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!finalizeResponse.ok) {
        const errorData = await finalizeResponse.json().catch(() => ({}))
        // Even if calculation fails, mark as completed if answers saved
        if (!errorData.answersSaved) {
          throw new Error(errorData.message || 'Erro ao finalizar teste')
        }
      }

      // Store completed test name for prompt
      setCompletedTestName(currentTeste.teste_template.nome)

      // Refresh link data to get updated progress
      const refreshResponse = await fetch(`/api/links-paciente/${linkId}`, {
        credentials: 'include'
      })
      const refreshedData: LinkData = await refreshResponse.json()
      setLinkData(refreshedData)

      // Check if there are more tests
      const sortedTests = [...refreshedData.testes].sort((a, b) => a.ordem - b.ordem)
      const remainingTests = sortedTests.filter(
        t => t.teste_aplicado.status === 'pendente' || t.teste_aplicado.status === 'em_andamento'
      )

      if (remainingTests.length > 0) {
        setState('prompt')
      } else {
        setState('completed')
        // Trigger PIN exit modal
        completeTest()
      }
    } catch (err) {
      console.error('Erro ao finalizar teste:', err)
      setError(err instanceof Error ? err.message : 'Erro ao finalizar teste')
    } finally {
      setIsSaving(false)
    }
  }

  const handleContinueToNext = async () => {
    if (!linkData) return

    const sortedTests = [...linkData.testes].sort((a, b) => a.ordem - b.ordem)
    const nextTest = sortedTests.find(
      t => t.teste_aplicado.status === 'pendente' || t.teste_aplicado.status === 'em_andamento'
    )

    if (nextTest) {
      const idx = sortedTests.findIndex(t => t.id === nextTest.id)
      setCurrentTesteIndex(idx)
      await loadTest(nextTest.teste_aplicado.id)
    } else {
      setState('completed')
      completeTest()
    }
  }

  // Handle exit from handoff mode
  const handleHandoffExit = () => {
    sessionStorage.removeItem('handoffSession')
    // Go back to dashboard aplicar page
    router.push('/aplicar')
  }

  // Get next test info for prompt
  const getNextTestInfo = (): { name: string; sigla: string; remaining: number } => {
    if (!linkData) return { name: '', sigla: '', remaining: 0 }

    const sortedTests = [...linkData.testes].sort((a, b) => a.ordem - b.ordem)
    const remainingTests = sortedTests.filter(
      t => t.teste_aplicado.status === 'pendente' || t.teste_aplicado.status === 'em_andamento'
    )
    const nextTest = remainingTests[0]

    return {
      name: nextTest?.teste_template.nome || '',
      sigla: nextTest?.teste_template.sigla || '',
      remaining: remainingTests.length,
    }
  }

  // Loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando bateria de testes...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  // Prompt state (between tests) - Wrapped in HandoffContainer
  if (state === 'prompt' && linkData) {
    const nextInfo = getNextTestInfo()
    return (
      <HandoffContainer onExitSuccess={handleHandoffExit}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
          <NextTestPrompt
            completedTestName={completedTestName}
            nextTestName={nextInfo.name}
            nextTestSigla={nextInfo.sigla}
            testsRemaining={nextInfo.remaining}
            totalTests={linkData.total_testes}
            onContinue={handleContinueToNext}
            onBackToList={() => {
              // In handoff mode, we don't show "back to list" option
              // Instead, continue to next test
              handleContinueToNext()
            }}
          />
        </div>
      </HandoffContainer>
    )
  }

  // Completed state - Wrapped in HandoffContainer for PIN exit
  if (state === 'completed' && linkData) {
    return (
      <HandoffContainer onExitSuccess={handleHandoffExit}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bateria Concluída!</h2>
            <p className="text-gray-600 mb-6">
              Todos os {linkData.total_testes} testes foram concluídos com sucesso.
            </p>
            <p className="text-gray-600 mb-6">
              Obrigado por completar os testes. Por favor, devolva o dispositivo ao profissional.
            </p>
            <p className="text-sm text-gray-500">
              Aguarde o profissional encerrar a sessão.
            </p>
          </div>
        </div>
      </HandoffContainer>
    )
  }

  // Test state - Wrapped in HandoffContainer
  if (state === 'test' && currentTeste && linkData) {
    const questoes = currentTeste.teste_template.questoes
    const currentQuestion = questoes[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questoes.length) * 100
    const respostasCount = Object.values(respostas).filter(r => r !== null && r !== undefined).length
    const isCurrentQuestionAnswered = respostas[`q${currentQuestion.numero}`] !== undefined &&
                                       respostas[`q${currentQuestion.numero}`] !== null
    const isLastQuestion = currentQuestionIndex === questoes.length - 1
    const sortedTests = [...linkData.testes].sort((a, b) => a.ordem - b.ordem)

    const testContent = (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Simplified Header - No navigation */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="text-center">
              <div className="text-sm text-blue-600 font-medium mb-1">
                Teste {currentTesteIndex + 1} de {linkData.total_testes}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{currentTeste.teste_template.nome}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Questão {currentQuestionIndex + 1} de {questoes.length}
              </p>
            </div>
          </div>
          {/* Progress bars */}
          <div className="px-4 pb-2">
            {/* Overall battery progress */}
            <div className="max-w-4xl mx-auto mb-2">
              <div className="flex gap-1">
                {sortedTests.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`h-1 flex-1 rounded-full ${
                      t.teste_aplicado.status === 'concluido'
                        ? 'bg-green-500'
                        : idx === currentTesteIndex
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Current test progress */}
            <div className="max-w-4xl mx-auto">
              <div className="h-1 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Question Content - Centered and clean */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <QuestionRenderer
              questao={currentQuestion}
              resposta={respostas[`q${currentQuestion.numero}`] as string | undefined}
              onResponder={handleResponder}
              escalasResposta={currentTeste.teste_template.escalas_resposta}
            />
          </div>
        </main>

        {/* Navigation Footer - Large touch targets */}
        <footer className="bg-white border-t p-4">
          <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 font-medium rounded-xl
                         hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                         transition-colors text-lg"
            >
              ← Anterior
            </button>

            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                disabled={!isCurrentQuestionAnswered}
                className={`flex-1 py-4 px-6 font-medium rounded-xl transition-colors text-lg
                  ${isCurrentQuestionAnswered
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Próxima →
              </button>
            ) : (
              <button
                onClick={handleFinalizeTest}
                disabled={isSaving || !isCurrentQuestionAnswered}
                className={`flex-1 py-4 px-6 font-medium rounded-xl transition-colors text-lg
                  ${isCurrentQuestionAnswered && !isSaving
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isSaving ? 'Finalizando...' : (
                  linkData.testes_completos + 1 < linkData.total_testes
                    ? 'Finalizar e Próximo'
                    : 'Finalizar'
                )}
              </button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="max-w-2xl mx-auto mt-3 text-center text-sm text-gray-500">
            {respostasCount} de {questoes.length} questões respondidas
          </div>
        </footer>
      </div>
    )

    return (
      <HandoffContainer onExitSuccess={handleHandoffExit}>
        {testContent}
      </HandoffContainer>
    )
  }

  return null
}
