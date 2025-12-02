'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/atoms/Button'
import type { LinkPacienteWithDetails } from '@/types/database'

import CopyMessageButton from './CopyMessageButton'

interface LinkHubResultProps {
  link: LinkPacienteWithDetails
  shareMessage: string
  linkUrl: string
  onClose: () => void
  onViewLink?: (link: LinkPacienteWithDetails) => void
}

export default function LinkHubResult({
  link,
  shareMessage,
  linkUrl,
  onClose,
  onViewLink,
}: LinkHubResultProps) {
  const [copySuccess, setCopySuccess] = useState<'url' | 'message' | null>(null)

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl)
      setCopySuccess('url')
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 m-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-full">
            <svg
              className="w-6 h-6 text-green-600"
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
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Link Gerado com Sucesso!</h2>
            <p className="text-sm text-gray-500">
              Expira em: {formatDate(link.data_expiracao)}
            </p>
          </div>
        </div>

        {/* Link Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Link de Acesso</span>
            <button
              onClick={handleCopyUrl}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {copySuccess === 'url' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copiar URL
                </>
              )}
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded px-3 py-2 font-mono text-sm text-gray-700 break-all">
            {linkUrl}
          </div>
        </div>

        {/* Tests Count */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200 mb-4">
          <span className="text-gray-600">Testes incluídos</span>
          <span className="font-semibold text-gray-900">{link.total_testes}</span>
        </div>

        {/* Share Message Preview */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Mensagem para Enviar
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {shareMessage}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <CopyMessageButton
            message={shareMessage}
            label="Copiar Mensagem Completa"
            successLabel="Mensagem Copiada!"
            size="lg"
            className="w-full justify-center"
          />

          <div className="flex gap-3">
            {onViewLink && (
              <Button
                variant="outline"
                onClick={() => onViewLink(link)}
                className="flex-1"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Ver Detalhes
              </Button>
            )}
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
          <svg
            className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            A mensagem já contém o código de acesso de 6 dígitos. Envie por WhatsApp, SMS ou
            e-mail.
          </span>
        </div>
      </div>
    </div>
  )
}
