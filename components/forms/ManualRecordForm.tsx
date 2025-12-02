'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegistroManual, Paciente, Anexo } from '@/types/database'
import { usePacientes, useRegistros } from '@/lib/hooks/useApi'

interface ManualRecordFormProps {
  registro?: RegistroManual
  paciente_id?: string
  mode: 'create' | 'edit'
}

export default function ManualRecordForm({ registro, paciente_id, mode }: ManualRecordFormProps) {
  const router = useRouter()
  const pacientesApi = usePacientes()
  const registrosApi = useRegistros()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])

  // Form fields
  const [selectedPacienteId, setSelectedPacienteId] = useState(paciente_id || registro?.paciente_id || '')
  const [nomeTeste, setNomeTeste] = useState(registro?.nome_teste || '')
  const [dataAplicacao, setDataAplicacao] = useState(
    registro?.data_aplicacao ? registro.data_aplicacao.split('T')[0] : ''
  )
  const [resultadoTexto, setResultadoTexto] = useState(registro?.resultado_texto || '')
  const [observacoes, setObservacoes] = useState(registro?.observacoes || '')
  const [anexos, setAnexos] = useState<Anexo[]>(registro?.anexos || [])
  const [uploadingFile, setUploadingFile] = useState(false)

  // Load patients for dropdown
  useEffect(() => {
    const loadPacientes = async () => {
      const result = await pacientesApi.list({ limit: 100 })
      if (result && result.items) {
        setPacientes(result.items)
      }
    }
    if (!paciente_id) {
      loadPacientes()
    }
  }, [paciente_id])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB')
      return
    }

    setUploadingFile(true)
    setError(null)

    try {
      // For now, just add to the list. Upload will happen on form submit
      // In production, you would upload to storage service here
      const newAnexo: Anexo = {
        url: URL.createObjectURL(file), // Temporary URL
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
      }

      setAnexos([...anexos, newAnexo])
    } catch (err) {
      console.error('Error uploading file:', err)
      setError('Erro ao fazer upload do arquivo')
    } finally {
      setUploadingFile(false)
    }
  }

  const removeAnexo = (index: number) => {
    setAnexos(anexos.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!selectedPacienteId || !nomeTeste || !dataAplicacao) {
        setError('Preencha todos os campos obrigatórios')
        setIsLoading(false)
        return
      }

      // Prepare request body
      const body = {
        paciente_id: selectedPacienteId,
        nome_teste: nomeTeste,
        data_aplicacao: dataAplicacao,
        resultado_texto: resultadoTexto || null,
        observacoes: observacoes || null,
        anexos: anexos.length > 0 ? anexos : null,
      }

      let result
      if (mode === 'create') {
        result = await registrosApi.create(body)
      } else {
        result = await registrosApi.update(registro!.id, body)
      }

      if (result && !registrosApi.error) {
        // Redirect to patient record or records list
        if (paciente_id) {
          router.push(`/pacientes/${paciente_id}/prontuario`)
        } else {
          router.push('/registros-manuais')
        }
      } else {
        setError(registrosApi.error || 'Erro ao salvar registro')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('Erro ao salvar registro')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Informações do Teste</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!paciente_id && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Paciente *
              </label>
              <select
                value={selectedPacienteId}
                onChange={(e) => setSelectedPacienteId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um paciente</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome_completo}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={!paciente_id ? 'md:col-span-2' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700">
              Nome do Teste *
            </label>
            <input
              type="text"
              value={nomeTeste}
              onChange={(e) => setNomeTeste(e.target.value)}
              placeholder="Ex: WISC-IV, Rorschach, TAT, etc."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data de Aplicação *
            </label>
            <input
              type="date"
              value={dataAplicacao}
              onChange={(e) => setDataAplicacao(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Resultados e Observações</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resultado (Texto)
            </label>
            <textarea
              value={resultadoTexto}
              onChange={(e) => setResultadoTexto(e.target.value)}
              rows={6}
              placeholder="Descreva os resultados do teste..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              placeholder="Observações adicionais..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Anexos</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adicionar Arquivo
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploadingFile}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <p className="mt-1 text-sm text-gray-500">
            Formatos aceitos: PDF, DOC, DOCX, JPG, PNG. Tamanho máximo: 10MB
          </p>
        </div>

        {anexos.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Arquivos anexados:</p>
            {anexos.map((anexo, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{anexo.nome}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(anexo.tamanho)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAnexo(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading || uploadingFile}
        >
          {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Registro' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  )
}
