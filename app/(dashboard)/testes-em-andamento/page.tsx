'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  User,
  Brain,
  Play,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react'

interface TesteEmAndamento {
  id: string
  paciente: {
    id: string
    nome_completo: string
  }
  teste_template: {
    id: string
    nome: string
    sigla: string
    questoes: Array<{ numero: number }>
  }
  status: string
  tipo_aplicacao: string
  progresso: number
  respostas: Record<string, any> | null
  data_primeiro_acesso: string | null
  updated_at: string | null
  created_at: string | null
}

/**
 * Format duration from milliseconds to human readable string
 */
function formatDuration(ms: number): string {
  if (ms < 0) return '-'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}min`
  }
  if (minutes > 0) {
    return `${minutes}min`
  }
  return `${seconds}s`
}

/**
 * Calculate test duration
 */
function calculateDuration(teste: TesteEmAndamento): number {
  if (!teste.data_primeiro_acesso) return -1

  const start = new Date(teste.data_primeiro_acesso).getTime()
  const end = teste.updated_at
    ? new Date(teste.updated_at).getTime()
    : Date.now()

  return end - start
}

/**
 * Count answered questions
 */
function countAnsweredQuestions(respostas: Record<string, any> | null): number {
  if (!respostas) return 0
  return Object.values(respostas).filter(v => v !== null && v !== undefined).length
}

/**
 * Get status badge config
 */
function getStatusConfig(status: string) {
  switch (status) {
    case 'em_andamento':
      return { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    case 'aguardando':
      return { label: 'Aguardando', color: 'bg-blue-100 text-blue-800', icon: HelpCircle }
    case 'bloqueado':
      return { label: 'Bloqueado', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800', icon: HelpCircle }
  }
}

export default function TestesEmAndamentoPage() {
  const router = useRouter()
  const [testes, setTestes] = useState<TesteEmAndamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTestes = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch incomplete tests (em_andamento, aguardando, bloqueado)
      const response = await fetch('/api/testes-aplicados?status=em_andamento,aguardando,bloqueado&limit=100', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar testes')
      }

      const data = await response.json()
      setTestes(data.data || data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTestes()
  }, [])

  const handleContinueTest = (testeId: string) => {
    router.push(`/aplicar/${testeId}`)
  }

  const handleDeleteTest = async (testeId: string) => {
    if (!confirm('Tem certeza que deseja excluir este teste? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/testes-aplicados/${testeId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir teste')
      }

      // Refresh list
      fetchTestes()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando testes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTestes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testes em Andamento</h1>
          <p className="text-gray-600 mt-1">
            {testes.length} teste{testes.length !== 1 ? 's' : ''} incompleto{testes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchTestes}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Empty State */}
      {testes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum teste em andamento
          </h2>
          <p className="text-gray-600">
            Todos os testes foram concluídos ou não há testes pendentes.
          </p>
        </div>
      ) : (
        /* Tests List */
        <div className="space-y-4">
          {testes.map((teste) => {
            const statusConfig = getStatusConfig(teste.status)
            const StatusIcon = statusConfig.icon
            const totalQuestions = teste.teste_template?.questoes?.length || 0
            const answeredQuestions = countAnsweredQuestions(teste.respostas)
            const duration = calculateDuration(teste)
            const progressPercent = totalQuestions > 0
              ? Math.round((answeredQuestions / totalQuestions) * 100)
              : 0

            return (
              <div
                key={teste.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Top Row: Patient & Test Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Brain className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {teste.teste_template?.nome || 'Teste'}
                          {teste.teste_template?.sigla && (
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({teste.teste_template.sigla})
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <User className="w-4 h-4" />
                          <span>{teste.paciente?.nome_completo || 'Paciente'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig.label}
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {/* Questions Answered */}
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {answeredQuestions}/{totalQuestions}
                        </p>
                        <p className="text-sm text-gray-600">Questões respondidas</p>
                      </div>

                      {/* Progress */}
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {progressPercent}%
                        </p>
                        <p className="text-sm text-gray-600">Progresso</p>
                      </div>

                      {/* Duration */}
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {duration >= 0 ? formatDuration(duration) : '-'}
                        </p>
                        <p className="text-sm text-gray-600">Tempo decorrido</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>
                        Iniciado: {teste.data_primeiro_acesso
                          ? new Date(teste.data_primeiro_acesso).toLocaleString('pt-BR')
                          : 'Não iniciado'}
                      </span>
                    </div>
                    {teste.updated_at && (
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4" />
                        <span>
                          Última atividade: {new Date(teste.updated_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleContinueTest(teste.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Continuar Teste
                    </button>
                    <button
                      onClick={() => handleDeleteTest(teste.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
