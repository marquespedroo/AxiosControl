'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/atoms/Button'
import type { LinkPacienteWithDetails } from '@/types/database'

interface LinkManagementTableProps {
  links: LinkPacienteWithDetails[]
  isLoading?: boolean
  onViewDetails: (link: LinkPacienteWithDetails) => void
  onExtend: (linkId: string, days: number) => Promise<void>
  onRevoke: (linkId: string) => Promise<void>
  onAddTests: (link: LinkPacienteWithDetails) => void
}

export default function LinkManagementTable({
  links,
  isLoading = false,
  onViewDetails,
  onExtend,
  onRevoke,
  onAddTests,
}: LinkManagementTableProps) {
  const [extendingId, setExtendingId] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [showExtendModal, setShowExtendModal] = useState<string | null>(null)

  const getStatusBadge = (status: string, isExpired: boolean, isBlocked: boolean) => {
    if (isBlocked) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
          Bloqueado
        </span>
      )
    }
    if (isExpired) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          Expirado
        </span>
      )
    }
    switch (status) {
      case 'ativo':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            Ativo
          </span>
        )
      case 'completo':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
            Completo
          </span>
        )
      case 'revogado':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            Revogado
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            {status}
          </span>
        )
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired = (dateStr: string) => {
    return new Date(dateStr) < new Date()
  }

  const handleExtend = async (linkId: string, days: number) => {
    setExtendingId(linkId)
    try {
      await onExtend(linkId, days)
    } finally {
      setExtendingId(null)
      setShowExtendModal(null)
    }
  }

  const handleRevoke = async (linkId: string) => {
    if (!confirm('Tem certeza que deseja revogar este link? Esta ação não pode ser desfeita.')) {
      return
    }
    setRevokingId(linkId)
    try {
      await onRevoke(linkId)
    } finally {
      setRevokingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <svg
          className="animate-spin h-8 w-8 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <p>Nenhum link encontrado</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paciente
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progresso
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expira em
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Último Acesso
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {links.map((link) => {
            const expired = isExpired(link.data_expiracao)
            const canModify = link.status === 'ativo' && !expired && !link.bloqueado

            return (
              <tr key={link.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {link.paciente?.nome_completo || 'Paciente'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {link.total_testes} teste{link.total_testes !== 1 ? 's' : ''}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(link.status, expired, link.bloqueado)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-24">
                      <div
                        className="h-2 bg-blue-500 rounded-full transition-all"
                        style={{ width: `${link.progresso_geral}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round(link.progresso_geral)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {link.testes_completos}/{link.total_testes} concluídos
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={expired ? 'text-red-600' : 'text-gray-600'}>
                    {formatDate(link.data_expiracao)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {formatDateTime(link.ultimo_acesso)}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(link)}
                      title="Ver detalhes"
                    >
                      <svg
                        className="w-4 h-4"
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
                    </Button>

                    {canModify && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddTests(link)}
                          title="Adicionar testes"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </Button>

                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowExtendModal(link.id)}
                            isLoading={extendingId === link.id}
                            title="Estender prazo"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </Button>

                          {showExtendModal === link.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="p-2">
                                <p className="text-xs text-gray-500 mb-2">
                                  Estender por:
                                </p>
                                {[3, 7, 14, 30].map((days) => (
                                  <button
                                    key={days}
                                    onClick={() => handleExtend(link.id, days)}
                                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded"
                                  >
                                    {days} dias
                                  </button>
                                ))}
                              </div>
                              <div className="border-t border-gray-100 p-2">
                                <button
                                  onClick={() => setShowExtendModal(null)}
                                  className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(link.id)}
                          isLoading={revokingId === link.id}
                          title="Revogar link"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
