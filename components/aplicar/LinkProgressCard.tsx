'use client'

import type { LinkPacienteWithDetails } from '@/types/database'

import TestProgressList from './TestProgressList'

interface LinkProgressCardProps {
  link: LinkPacienteWithDetails
  onClose?: () => void
  showDetails?: boolean
}

export default function LinkProgressCard({
  link,
  onClose,
  showDetails = true,
}: LinkProgressCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'text-green-600 bg-green-100'
      case 'completo':
        return 'text-blue-600 bg-blue-100'
      case 'revogado':
        return 'text-red-600 bg-red-100'
      case 'expirado':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
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

  const isExpired = new Date(link.data_expiracao) < new Date()
  const displayStatus = isExpired && link.status === 'ativo' ? 'expirado' : link.status

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-900">
            {link.paciente?.nome_completo || 'Paciente'}
          </h3>
          <p className="text-sm text-gray-500">
            Criado em {formatDate(link.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              displayStatus
            )}`}
          >
            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fechar"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
          <span className="text-sm font-semibold text-gray-900">
            {Math.round(link.progresso_geral)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              link.progresso_geral === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${link.progresso_geral}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>
            {link.testes_completos} de {link.total_testes} testes concluídos
          </span>
          {link.progresso_geral === 100 && (
            <span className="text-green-600 font-medium">Completo!</span>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div>
          <p className="text-xs text-gray-500">Expira em</p>
          <p className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
            {formatDate(link.data_expiracao)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Último Acesso</p>
          <p className="text-sm font-medium text-gray-900">
            {link.ultimo_acesso ? formatDate(link.ultimo_acesso) : 'Nunca'}
          </p>
        </div>
        {link.primeiro_acesso && (
          <div>
            <p className="text-xs text-gray-500">Primeiro Acesso</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(link.primeiro_acesso)}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500">Tentativas Falhas</p>
          <p className="text-sm font-medium text-gray-900">
            {link.tentativas_falhas}
          </p>
        </div>
      </div>

      {/* Test List */}
      {showDetails && link.testes && link.testes.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="px-4 py-3 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700">Testes</h4>
          </div>
          <TestProgressList testes={link.testes} />
        </div>
      )}

      {/* Blocked Warning */}
      {link.bloqueado && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-100">
          <div className="flex items-center gap-2 text-red-700">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm font-medium">
              Link bloqueado por excesso de tentativas falhas
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
