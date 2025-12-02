'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import QuestionRenderer from '@/components/test/QuestionRenderer'
import NextTestPrompt from '@/components/patient-portal/NextTestPrompt'
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

export default function BateriaRunnerPage() {
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
      setCurrentQuestionIndex(0)
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
      alert('Por favor, responda a questão atual antes de continuar.')
      return
    }

    if (currentQuestionIndex < currentTeste.teste_template.questoes.length - 1) {
      saveProgress()
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handleFinalizeTest = async () => {
    if (!currentTeste || !linkData) return

    const totalQuestoes = currentTeste.teste_template.questoes.length
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
        throw new Error(errorData.message || 'Erro ao finalizar teste')
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
    }
  }

  const handleBackToList = () => {
    router.push('/aplicar')
  }

  const handleViewResults = () => {
    if (linkData) {
      // Navigate to results page for the link
      router.push(`/links/${linkId}`)
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando bateria de testes...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/aplicar')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  // Prompt state (between tests)
  if (state === 'prompt' && linkData) {
    const nextInfo = getNextTestInfo()
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
        <NextTestPrompt
          completedTestName={completedTestName}
          nextTestName={nextInfo.name}
          nextTestSigla={nextInfo.sigla}
          testsRemaining={nextInfo.remaining}
          totalTests={linkData.total_testes}
          onContinue={handleContinueToNext}
          onBackToList={handleViewResults}
        />
      </div>
    )
  }

  // Completed state
  if (state === 'completed' && linkData) {
    return (
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
          <p className="text-sm text-gray-500 mb-6">
            Paciente: {linkData.paciente.nome_completo}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleViewResults}
              className="w-full px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600"
            >
              Ver Resultados
            </button>
            <button
              onClick={handleBackToList}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Voltar para Aplicar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Test state
  if (state === 'test' && currentTeste && linkData) {
    const questoes = currentTeste.teste_template.questoes
    const currentQuestion = questoes[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questoes.length) * 100
    const respostasCount = Object.values(respostas).filter(r => r !== null && r !== undefined).length
    const isCurrentQuestionAnswered = respostas[`q${currentQuestion.numero}`] !== undefined && respostas[`q${currentQuestion.numero}`] !== null
    const sortedTests = [...linkData.testes].sort((a, b) => a.ordem - b.ordem)

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-blue-600 font-medium">
                    Teste {currentTesteIndex + 1} de {linkData.total_testes}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm text-gray-500">
                    {currentTeste.teste_template.sigla}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{currentTeste.teste_template.nome}</h1>
                <p className="text-sm text-gray-600">Paciente: {linkData.paciente.nome_completo}</p>
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

        {/* Test progress bar */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Overall battery progress */}
            <div className="py-2 border-b">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span>Progresso da Bateria:</span>
                <span>{linkData.testes_completos} de {linkData.total_testes} testes</span>
              </div>
              <div className="flex gap-1">
                {sortedTests.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`h-1.5 flex-1 rounded-full ${
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
            <div className="py-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuestionRenderer
            questao={currentQuestion}
            resposta={respostas[`q${currentQuestion.numero}`] as string | undefined}
            onResponder={handleResponder}
            escalasResposta={currentTeste.teste_template.escalas_resposta}
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
                onClick={handleFinalizeTest}
                disabled={isSaving}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {linkData.testes_completos + 1 < linkData.total_testes
                  ? 'Finalizar e Próximo Teste'
                  : 'Finalizar Bateria'
                }
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
