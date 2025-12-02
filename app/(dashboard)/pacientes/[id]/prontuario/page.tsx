'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Paciente, TesteAplicado, RegistroManual } from '@/types/database'
import { usePacientes, useTestesAplicados, useRegistros } from '@/lib/hooks/useApi'

// Extended type for teste aplicado with API response fields
interface TesteAplicadoComNome extends TesteAplicado {
  teste_nome?: string
  teste_sigla?: string
  paciente_nome?: string
  teste_template?: { id: string; nome: string; sigla: string }
}

export default function ProntuarioPage() {
  const params = useParams()
  const router = useRouter()
  const pacienteId = params.id as string

  const pacientesApi = usePacientes()
  const testesApi = useTestesAplicados()
  const registrosApi = useRegistros()

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [testes, setTestes] = useState<TesteAplicadoComNome[]>([])
  const [registros, setRegistros] = useState<RegistroManual[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'testes' | 'registros'>('testes')

  useEffect(() => {
    loadData()
  }, [pacienteId])

  const loadData = async () => {
    setLoading(true)

    // Load patient
    const pacienteResult = await pacientesApi.getById(pacienteId)
    if (pacienteResult) {
      setPaciente(pacienteResult)
    }

    // Load tests
    const testesResult = await testesApi.list({ paciente_id: pacienteId, limit: 100 })
    if (testesResult?.data) {
      setTestes(testesResult.data)
    }

    // Load manual records
    const registrosResult = await registrosApi.list({ paciente_id: pacienteId, limit: 100 })
    if (registrosResult?.data) {
      setRegistros(registrosResult.data)
    }

    setLoading(false)
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pendente: 'bg-yellow-100 text-yellow-800',
      em_andamento: 'bg-blue-100 text-blue-800',
      completo: 'bg-green-100 text-green-800',
    }
    const labels = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      completo: 'Completo',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Paciente não encontrado</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prontuário</h1>
          <p className="mt-1 text-sm text-gray-500">
            Histórico completo de avaliações e registros
          </p>
        </div>
        <Link
          href={`/pacientes/${pacienteId}/editar`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Editar Paciente
        </Link>
      </div>

      {/* Patient Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nome Completo</h3>
            <p className="mt-1 text-lg font-medium text-gray-900">{paciente.nome_completo}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Idade</h3>
            <p className="mt-1 text-lg font-medium text-gray-900">
              {calculateAge(paciente.data_nascimento)} anos
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Escolaridade</h3>
            <p className="mt-1 text-lg font-medium text-gray-900">
              {paciente.escolaridade_anos} anos
            </p>
          </div>
          {paciente.motivo_encaminhamento && (
            <div className="md:col-span-3">
              <h3 className="text-sm font-medium text-gray-500">Motivo do Encaminhamento</h3>
              <p className="mt-1 text-gray-900">{paciente.motivo_encaminhamento}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('testes')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'testes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Testes Aplicados ({testes.length})
            </button>
            <button
              onClick={() => setActiveTab('registros')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'registros'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Registros Manuais ({registros.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'testes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Testes Aplicados</h3>
                <Link
                  href={`/aplicar?paciente_id=${pacienteId}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Aplicar Novo Teste
                </Link>
              </div>

              {testes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum teste aplicado ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {testes.map((teste) => (
                    <div
                      key={teste.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/resultados/${teste.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-base font-medium text-gray-900">
                              {teste.teste_nome || teste.teste_template?.nome || 'Teste'}
                            </h4>
                            {getStatusBadge(teste.status)}
                          </div>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Data:</span>{' '}
                              {formatDate(teste.created_at)}
                            </div>
                            {teste.data_conclusao && (
                              <div>
                                <span className="font-medium">Conclusão:</span>{' '}
                                {formatDate(teste.data_conclusao)}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Progresso:</span>{' '}
                              {teste.progresso}%
                            </div>
                            {teste.pontuacao_bruta && (
                              <div>
                                <span className="font-medium">Pontuação:</span>{' '}
                                {teste.pontuacao_bruta.total}
                              </div>
                            )}
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'registros' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Registros Manuais</h3>
                <Link
                  href={`/registros-manuais/novo?paciente_id=${pacienteId}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Novo Registro
                </Link>
              </div>

              {registros.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum registro manual ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {registros.map((registro) => (
                    <div
                      key={registro.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/registros-manuais/${registro.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900">
                            {registro.nome_teste}
                          </h4>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Data Aplicação:</span>{' '}
                              {formatDate(registro.data_aplicacao)}
                            </div>
                            <div>
                              <span className="font-medium">Criado em:</span>{' '}
                              {formatDate(registro.created_at)}
                            </div>
                            {registro.anexos && registro.anexos.length > 0 && (
                              <div>
                                <span className="font-medium">Anexos:</span>{' '}
                                {registro.anexos.length}
                              </div>
                            )}
                          </div>
                          {registro.observacoes && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {registro.observacoes}
                            </p>
                          )}
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
