'use client'

import type { LinkTesteWithDetails } from '@/types/database'

interface TestProgressListProps {
  testes: LinkTesteWithDetails[]
  onSelectTest?: (teste: LinkTesteWithDetails) => void
  compact?: boolean
}

export default function TestProgressList({
  testes,
  onSelectTest,
  compact = false,
}: TestProgressListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return (
          <svg
            className="w-5 h-5 text-green-500"
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
        )
      case 'em_andamento':
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        )
      case 'abandonado':
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'bloqueado':
        return (
          <svg
            className="w-5 h-5 text-gray-500"
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
        )
      default: // pendente
        return (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      abandonado: 'Abandonado',
      bloqueado: 'Bloqueado',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-700'
      case 'em_andamento':
        return 'bg-blue-100 text-blue-700'
      case 'abandonado':
        return 'bg-red-100 text-red-700'
      case 'bloqueado':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const sortedTestes = [...testes].sort((a, b) => a.ordem - b.ordem)

  if (compact) {
    return (
      <div className="space-y-2">
        {sortedTestes.map((teste) => (
          <div
            key={teste.id}
            className="flex items-center gap-2 text-sm"
            onClick={() => onSelectTest?.(teste)}
          >
            {getStatusIcon(teste.teste_aplicado.status)}
            <span className="flex-1 truncate">
              {teste.teste_template.sigla} - {teste.teste_template.nome}
            </span>
            {teste.teste_aplicado.status === 'em_andamento' && (
              <span className="text-xs text-blue-600">
                {Math.round(teste.teste_aplicado.progresso)}%
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {sortedTestes.map((teste, index) => {
        const isClickable =
          onSelectTest &&
          ['pendente', 'em_andamento'].includes(teste.teste_aplicado.status)

        return (
          <div
            key={teste.id}
            className={`
              flex items-center gap-4 px-4 py-3
              ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}
            `}
            onClick={() => isClickable && onSelectTest(teste)}
          >
            {/* Order Number */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              {index + 1}
            </div>

            {/* Status Icon */}
            <div className="flex-shrink-0">{getStatusIcon(teste.teste_aplicado.status)}</div>

            {/* Test Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {teste.teste_template.sigla}
                </span>
                <span className="text-gray-600 truncate">
                  {teste.teste_template.nome}
                </span>
              </div>

              {/* Progress bar for in-progress tests */}
              {teste.teste_aplicado.status === 'em_andamento' && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full max-w-32">
                    <div
                      className="h-1.5 bg-blue-500 rounded-full transition-all"
                      style={{ width: `${teste.teste_aplicado.progresso}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(teste.teste_aplicado.progresso)}%
                  </span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <span
              className={`
                px-2 py-1 text-xs font-medium rounded-full flex-shrink-0
                ${getStatusColor(teste.teste_aplicado.status)}
              `}
            >
              {getStatusLabel(teste.teste_aplicado.status)}
            </span>

            {/* Arrow for clickable items */}
            {isClickable && (
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
            )}
          </div>
        )
      })}
    </div>
  )
}
