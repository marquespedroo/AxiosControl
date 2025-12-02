'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PatientAuthForm from '@/components/patient-portal/PatientAuthForm'
import PatientTestList from '@/components/patient-portal/PatientTestList'
import PatientTestRunner from '@/components/patient-portal/PatientTestRunner'
import NextTestPrompt from '@/components/patient-portal/NextTestPrompt'
import CompletionMessage from '@/components/patient-portal/CompletionMessage'

interface PatientTest {
  id: string
  teste_aplicado_id: string
  ordem: number
  status: string
  progresso: number
  teste_nome: string
  teste_sigla: string
}

interface LinkInfo {
  paciente_nome: string
  total_testes: number
  testes_completos: number
  progresso_geral: number
  testes: PatientTest[]
  data_expiracao: string
}

interface TestQuestion {
  id: string
  texto: string
  tipo: string
  opcoes?: { valor: number; texto: string }[]
  ordem: number
}

type PageState = 'loading' | 'auth' | 'list' | 'test' | 'completed' | 'prompt' | 'error' | 'blocked'

export default function ResponderTestePage() {
  const params = useParams()
  const token = params.token as string

  const [state, setState] = useState<PageState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState(3)

  // Link data
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null)

  // Test runner data
  const [currentTesteId, setCurrentTesteId] = useState<string | null>(null)
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([])
  const [testResponses, setTestResponses] = useState<Record<string, number>>({})
  const [completedTestName, setCompletedTestName] = useState<string>('')

  // Check if link needs auth or load data
  useEffect(() => {
    checkLinkStatus()
  }, [token])

  const checkLinkStatus = async () => {
    try {
      // First check if authenticated (has session)
      const response = await fetch(`/api/responder/${token}`)

      if (response.status === 403) {
        const data = await response.json()
        if (data.error === 'LINK_BLOCKED') {
          setState('blocked')
          return
        }
        // Need authentication
        setState('auth')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Erro ao carregar dados')
        setState('error')
        return
      }

      const data = await response.json()
      setLinkInfo(data)

      // Check if all tests completed
      if (data.progresso_geral === 100) {
        setState('completed')
      } else {
        setState('list')
      }
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet.')
      setState('error')
    }
  }

  const handleAuthSubmit = async (code: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/responder/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, codigo: code }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.remaining_attempts !== undefined) {
          setRemainingAttempts(data.remaining_attempts)
        }
        if (data.remaining_attempts === 0) {
          setState('blocked')
          return false
        }
        setError(data.message || 'Código inválido')
        return false
      }

      // Authentication successful, load link info
      await checkLinkStatus()
      return true
    } catch (err) {
      setError('Erro de conexão')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const loadTestQuestions = async (testeAplicadoId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/testes-aplicados/${testeAplicadoId}/questoes`)
      if (!response.ok) {
        throw new Error('Erro ao carregar questões')
      }
      const data = await response.json()
      setTestQuestions(data.questoes || [])
      setTestResponses(data.respostas || {})
      setCurrentTesteId(testeAplicadoId)
      setState('test')
    } catch (err) {
      setError('Erro ao carregar teste')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTest = (testeAplicadoId: string) => {
    loadTestQuestions(testeAplicadoId)
  }

  const handleContinueTest = (testeAplicadoId: string) => {
    loadTestQuestions(testeAplicadoId)
  }

  const handleSaveResponse = async (questionId: string, value: number) => {
    if (!currentTesteId) return

    try {
      await fetch(`/api/testes-aplicados/${currentTesteId}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questao_id: questionId,
          resposta: value,
        }),
      })
    } catch (err) {
      console.error('Error saving response:', err)
    }
  }

  const handleCompleteTest = async () => {
    if (!currentTesteId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/testes-aplicados/${currentTesteId}/finalizar`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Erro ao finalizar teste')
      }

      // Find completed test name
      const completedTest = linkInfo?.testes.find(
        (t) => t.teste_aplicado_id === currentTesteId
      )
      setCompletedTestName(completedTest?.teste_nome || '')

      // Refresh link info
      await checkLinkStatus()

      // Show prompt or completion
      if (linkInfo && linkInfo.progresso_geral < 100) {
        setState('prompt')
      } else {
        setState('completed')
      }
    } catch (err) {
      setError('Erro ao finalizar teste')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToList = () => {
    setCurrentTesteId(null)
    setTestQuestions([])
    setTestResponses({})
    checkLinkStatus()
  }

  const handleContinueToNext = () => {
    if (!linkInfo) return

    // Find next test (first pending or in_progress)
    const nextTest = linkInfo.testes
      .sort((a, b) => a.ordem - b.ordem)
      .find((t) => t.status === 'pendente' || t.status === 'em_andamento')

    if (nextTest) {
      loadTestQuestions(nextTest.teste_aplicado_id)
    } else {
      setState('completed')
    }
  }

  // Get next test info for prompt
  const getNextTestInfo = () => {
    if (!linkInfo) return { name: '', sigla: '', remaining: 0 }

    const remaining = linkInfo.testes.filter(
      (t) => t.status !== 'concluido' && t.status !== 'abandonado'
    ).length

    const nextTest = linkInfo.testes
      .sort((a, b) => a.ordem - b.ordem)
      .find((t) => t.status === 'pendente' || t.status === 'em_andamento')

    return {
      name: nextTest?.teste_nome || '',
      sigla: nextTest?.teste_sigla || '',
      remaining,
    }
  }

  // Get current test info
  const getCurrentTestInfo = () => {
    if (!linkInfo || !currentTesteId) return { nome: '', sigla: '' }

    const test = linkInfo.testes.find((t) => t.teste_aplicado_id === currentTesteId)
    return {
      nome: test?.teste_nome || '',
      sigla: test?.teste_sigla || '',
    }
  }

  // Render based on state
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro de Acesso</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Entre em contato com o profissional responsável.
          </p>
        </div>
      </div>
    )
  }

  if (state === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Bloqueado</h2>
          <p className="text-gray-600 mb-6">
            Muitas tentativas incorretas. Este link foi bloqueado por segurança.
          </p>
          <p className="text-sm text-gray-500">
            Entre em contato com o profissional responsável para obter um novo link.
          </p>
        </div>
      </div>
    )
  }

  if (state === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <PatientAuthForm
          onSubmit={handleAuthSubmit}
          isLoading={isLoading}
          error={error}
          remainingAttempts={remainingAttempts}
          maxAttempts={3}
        />
      </div>
    )
  }

  if (state === 'list' && linkInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <PatientTestList
          pacienteNome={linkInfo.paciente_nome}
          testes={linkInfo.testes}
          testesCompletos={linkInfo.testes_completos}
          totalTestes={linkInfo.total_testes}
          progressoGeral={linkInfo.progresso_geral}
          onStartTest={handleStartTest}
          onContinueTest={handleContinueTest}
        />
      </div>
    )
  }

  if (state === 'test' && currentTesteId) {
    const testInfo = getCurrentTestInfo()
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <PatientTestRunner
          testeId={currentTesteId}
          testeNome={testInfo.nome}
          testeSigla={testInfo.sigla}
          questions={testQuestions}
          currentResponses={testResponses}
          onSaveResponse={handleSaveResponse}
          onComplete={handleCompleteTest}
          onBack={handleBackToList}
          isLoading={isLoading}
        />
      </div>
    )
  }

  if (state === 'prompt' && linkInfo) {
    const nextInfo = getNextTestInfo()
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
        <NextTestPrompt
          completedTestName={completedTestName}
          nextTestName={nextInfo.name}
          nextTestSigla={nextInfo.sigla}
          testsRemaining={nextInfo.remaining}
          totalTests={linkInfo.total_testes}
          onContinue={handleContinueToNext}
          onBackToList={handleBackToList}
        />
      </div>
    )
  }

  if (state === 'completed' && linkInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
        <CompletionMessage
          pacienteNome={linkInfo.paciente_nome}
          totalTestes={linkInfo.total_testes}
        />
      </div>
    )
  }

  return null
}
