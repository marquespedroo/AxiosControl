'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { HandoffContainer } from '@/components/aplicar'
import QuestionRenderer from '@/components/test/QuestionRenderer'
import TestInstructions from '@/components/test/TestInstructions'
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
    interpretacao?: {
      instrucoes_aplicacao?: string
      exemplos_resposta?: Array<{
        texto_esquerda: string
        texto_direita: string
        marcacao: number
        descricao: string
      }>
    }
  }
  paciente: {
    nome_completo: string
  }
}

/**
 * Handoff Test Application Page
 * Simplified interface for patient use - no navigation, PIN-protected exit
 * This route is OUTSIDE the dashboard layout to hide all navigation
 */
export default function HandoffTestePage() {
  const params = useParams()
  const router = useRouter()
  const [teste, setTeste] = useState<TesteData | null>(null)
  const [respostas, setRespostas] = useState<Respostas>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  // Handoff mode - sessionId is the same as testeAplicadoId
  const { isActive: isHandoffActive, startSession, completeTest } = useHandoffMode()

  // Initialize handoff session using testeId (which is the sessionId)
  useEffect(() => {
    if (!isHandoffActive && params.testeId) {
      // Use testeId as sessionId - they are the same in the new implementation
      startSession(params.testeId as string, {
        id: params.testeId as string,
        status: 'em_andamento',
        progresso: 0,
      } as any)
    }
  }, [isHandoffActive, params.testeId, startSession])

  // Fetch test data
  useEffect(() => {
    const fetchTeste = async () => {
      try {
        const response = await fetch(`/api/testes-aplicados/${params.testeId}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Teste não encontrado')
        }

        const data = await response.json()
        setTeste(data)
        setRespostas(data.respostas || {})

        // Find first unanswered question
        if (data.respostas) {
          const questoes = data.teste_template.questoes
          const firstUnanswered = questoes.findIndex(
            (q: Questao) => data.respostas[`q${q.numero}`] === undefined
          )
          if (firstUnanswered > 0) {
            setCurrentQuestionIndex(firstUnanswered)
          }
        }
      } catch (err: any) {
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
      [`q${numeroQuestao}`]: valor
    }))
  }

  const saveProgress = async () => {
    try {
      setIsSaving(true)
      await fetch(`/api/testes-aplicados/${params.testeId}`, {
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
    if (!teste) return

    const currentQuestion = teste.teste_template.questoes[currentQuestionIndex]
    const currentAnswer = respostas[`q${currentQuestion.numero}`]

    if (currentAnswer === undefined || currentAnswer === null) {
      return // Can't proceed without answering
    }

    if (currentQuestionIndex < teste.teste_template.questoes.length - 1) {
      saveProgress()
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handleFinalize = async () => {
    if (!teste) return

    try {
      setIsSaving(true)

      // Save final responses
      await fetch(`/api/testes-aplicados/${params.testeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ respostas }),
      })

      // Finalize and calculate
      const finalizeResponse = await fetch(`/api/testes-aplicados/${params.testeId}/finalizar`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!finalizeResponse.ok) {
        const errorData = await finalizeResponse.json().catch(() => ({}))
        // Even if calculation fails, mark as completed
        if (errorData.answersSaved) {
          setIsCompleted(true)
          completeTest()
          return
        }
        throw new Error(errorData.message || 'Erro ao finalizar teste')
      }

      setIsCompleted(true)
      // Trigger PIN exit modal
      completeTest()
    } catch (err: any) {
      console.error('Error finalizing test:', err)
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle exit from handoff mode
  const handleHandoffExit = () => {
    sessionStorage.removeItem('handoffSession')
    // If test is completed, go to results; otherwise go to in-progress tests page
    if (isCompleted) {
      router.push(`/resultados/${params.testeId}`)
    } else {
      // Test was interrupted - go to in-progress tests page
      router.push('/testes-em-andamento')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando teste...</p>
        </div>
      </div>
    )
  }

  if (error || !teste) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600">{error || 'Teste não encontrado'}</p>
        </div>
      </div>
    )
  }

  // Show instructions if available and not yet dismissed
  if (showInstructions && teste?.teste_template?.interpretacao?.instrucoes_aplicacao) {
    return (
      <HandoffContainer onExitSuccess={handleHandoffExit}>
        <TestInstructions
          titulo={teste.teste_template.nome}
          instrucoes={teste.teste_template.interpretacao.instrucoes_aplicacao}
          exemplos={teste.teste_template.interpretacao.exemplos_resposta || [
            {
              texto_esquerda: "Estou me sentindo alegre",
              texto_direita: "Estou me sentindo triste",
              marcacao: 0,
              descricao: "Se você tem se sentido muito alegre, marque a primeira opção"
            },
            {
              texto_esquerda: "Estou me sentindo alegre",
              texto_direita: "Estou me sentindo triste",
              marcacao: 1,
              descricao: "Se você tem se sentido alegre, marque a segunda opção"
            },
            {
              texto_esquerda: "Estou me sentindo alegre",
              texto_direita: "Estou me sentindo triste",
              marcacao: 2,
              descricao: "Se você tem se sentido triste, marque a terceira opção"
            },
            {
              texto_esquerda: "Estou me sentindo alegre",
              texto_direita: "Estou me sentindo triste",
              marcacao: 3,
              descricao: "Se você tem se sentido muito triste, marque a quarta opção"
            }
          ]}
          onStart={() => setShowInstructions(false)}
        />
      </HandoffContainer>
    )
  }

  // Completed state
  if (isCompleted) {
    return (
      <HandoffContainer onExitSuccess={handleHandoffExit}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-6">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Teste Concluído!</h2>
            <p className="text-gray-600 mb-6">
              Obrigado por completar o teste. Por favor, devolva o dispositivo ao profissional.
            </p>
            <p className="text-sm text-gray-500">
              Aguarde o profissional encerrar a sessão.
            </p>
          </div>
        </div>
      </HandoffContainer>
    )
  }

  const questoes = teste.teste_template.questoes
  const currentQuestion = questoes[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questoes.length) * 100
  const respostasCount = Object.values(respostas).filter(r => r !== null && r !== undefined).length
  const isCurrentQuestionAnswered = respostas[`q${currentQuestion.numero}`] !== undefined &&
                                     respostas[`q${currentQuestion.numero}`] !== null
  const isLastQuestion = currentQuestionIndex === questoes.length - 1

  const testContent = (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simplified Header - No navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">{teste.teste_template.nome}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Questão {currentQuestionIndex + 1} de {questoes.length}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Question Content - Centered and clean */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <QuestionRenderer
            questao={currentQuestion}
            resposta={respostas[`q${currentQuestion.numero}`] as string | undefined}
            onResponder={handleResponder}
            escalasResposta={teste.teste_template.escalas_resposta}
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
              onClick={handleFinalize}
              disabled={isSaving || !isCurrentQuestionAnswered}
              className={`flex-1 py-4 px-6 font-medium rounded-xl transition-colors text-lg
                ${isCurrentQuestionAnswered && !isSaving
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isSaving ? 'Finalizando...' : 'Finalizar'}
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
