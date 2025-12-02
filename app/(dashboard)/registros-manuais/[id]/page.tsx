'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { RegistroManual, Paciente } from '@/types/database'
import { useRegistros, usePacientes } from '@/lib/hooks/useApi'

export default function RegistroDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const registroId = params.id as string

  const registrosApi = useRegistros()
  const pacientesApi = usePacientes()

  const [registro, setRegistro] = useState<RegistroManual | null>(null)
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [registroId])

  const loadData = async () => {
    setLoading(true)

    const registroResult = await registrosApi.getById(registroId)
    if (registroResult) {
      setRegistro(registroResult)

      const pacienteResult = await pacientesApi.getById(registroResult.paciente_id)
      if (pacienteResult) {
        setPaciente(pacienteResult)
      }
    }

    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return

    const result = await registrosApi.remove(registroId)
    if (result) {
      alert('Registro excluido com sucesso!')
      router.push(`/pacientes/${paciente?.id}/prontuario`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (!registro || !paciente) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Registro nao encontrado</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registro Manual</h1>
          <p className="mt-1 text-sm text-gray-500">
            {registro.nome_teste} - {paciente.nome_completo}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
          >
            Excluir
          </button>
          <Link
            href={`/pacientes/${paciente.id}/prontuario`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ver Prontuario
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Informacoes do Paciente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Nome:</span>
            <p className="font-medium">{paciente.nome_completo}</p>
          </div>
          <div>
            <span className="text-gray-500">Data de Nascimento:</span>
            <p className="font-medium">{formatDate(paciente.data_nascimento)}</p>
          </div>
          <div>
            <span className="text-gray-500">Escolaridade:</span>
            <p className="font-medium">{paciente.escolaridade_anos} anos</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Informacoes do Teste</h3>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-500">Nome do Teste</span>
            <p className="mt-1 text-base font-medium">{registro.nome_teste}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Data de Aplicacao:</span>
              <p className="font-medium">{formatDate(registro.data_aplicacao)}</p>
            </div>
            <div>
              <span className="text-gray-500">Data de Registro:</span>
              <p className="font-medium">{formatDate(registro.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {registro.resultado_texto && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Resultado</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{registro.resultado_texto}</p>
          </div>
        </div>
      )}

      {registro.observacoes && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Observacoes</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{registro.observacoes}</p>
          </div>
        </div>
      )}

      {registro.anexos && registro.anexos.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Anexos ({registro.anexos.length})</h3>
          <div className="space-y-3">
            {registro.anexos.map((anexo, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{anexo.nome}</p>
                    <p className="text-xs text-gray-500">
                      {anexo.tipo} - {formatFileSize(anexo.tamanho)}
                    </p>
                  </div>
                </div>
                <a
                  href={anexo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Baixar
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
