'use client'

import { useState } from 'react'

import { useLinks } from '@/lib/hooks/useApi'

interface LinkGeneratorModalProps {
  testeAplicadoId: string
  isOpen: boolean
  onClose: () => void
}

export default function LinkGeneratorModal({
  testeAplicadoId,
  isOpen,
  onClose,
}: LinkGeneratorModalProps) {
  const linksApi = useLinks()
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [expiraDias, setExpiraDias] = useState(7)
  const [requerCodigo, setRequerCodigo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const expiraEm = new Date()
      expiraEm.setDate(expiraEm.getDate() + expiraDias)

      const result = await linksApi.generate({
        teste_aplicado_id: testeAplicadoId,
        expira_em: expiraEm,
        requer_codigo: requerCodigo,
      })

      if (result && result.link_url) {
        setGeneratedLink(result.link_url)
      } else {
        setError(linksApi.error || 'Erro ao gerar link')
      }
    } catch (err) {
      console.error('Error generating link:', err)
      setError('Erro ao gerar link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
    }
  }

  const handleClose = () => {
    setGeneratedLink(null)
    setError(null)
    setCopied(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Gerar Link de Resposta</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!generatedLink ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Configure as opções do link que será enviado para o paciente responder remotamente.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validade do Link
              </label>
              <select
                value={expiraDias}
                onChange={(e) => setExpiraDias(Number(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={1}>1 dia</option>
                <option value={3}>3 dias</option>
                <option value={7}>7 dias (recomendado)</option>
                <option value={14}>14 dias</option>
                <option value={30}>30 dias</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requerCodigo"
                checked={requerCodigo}
                onChange={(e) => setRequerCodigo(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requerCodigo" className="ml-2 text-sm text-gray-700">
                Exigir código de acesso (maior segurança)
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Gerando...' : 'Gerar Link'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5"
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
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Link gerado com sucesso!
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Envie este link para o paciente responder ao teste.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link de Acesso
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {requerCodigo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-600 mt-0.5"
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
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Atenção: Código de acesso obrigatório
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      Lembre-se de enviar o código de acesso separadamente para o paciente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
