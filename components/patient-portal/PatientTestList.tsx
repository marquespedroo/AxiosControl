'use client'

interface PatientTest {
  id: string
  teste_aplicado_id: string
  ordem: number
  status: string
  progresso: number
  teste_nome: string
  teste_sigla: string
}

interface PatientTestListProps {
  pacienteNome: string
  testes: PatientTest[]
  testesCompletos: number
  totalTestes: number
  progressoGeral: number
  onStartTest: (testeAplicadoId: string) => void
  onContinueTest: (testeAplicadoId: string) => void
}

export default function PatientTestList({
  pacienteNome,
  testes,
  testesCompletos,
  totalTestes,
  progressoGeral,
  onStartTest,
  onContinueTest,
}: PatientTestListProps) {
  const getStatusConfig = (status: string, progresso: number) => {
    switch (status) {
      case 'concluido':
        return {
          label: 'Concluído',
          color: 'bg-green-100 text-green-700',
          icon: (
            <svg
              className="w-6 h-6 text-green-500"
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
          ),
          canInteract: false,
        }
      case 'em_andamento':
        return {
          label: `${Math.round(progresso)}% concluído`,
          color: 'bg-blue-100 text-blue-700',
          icon: (
            <svg
              className="w-6 h-6 text-blue-500"
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
          ),
          canInteract: true,
          action: 'continue',
        }
      case 'abandonado':
        return {
          label: 'Abandonado',
          color: 'bg-red-100 text-red-700',
          icon: (
            <svg
              className="w-6 h-6 text-red-500"
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
          ),
          canInteract: false,
        }
      default: // pendente
        return {
          label: 'Aguardando',
          color: 'bg-gray-100 text-gray-600',
          icon: (
            <svg
              className="w-6 h-6 text-gray-400"
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
          ),
          canInteract: true,
          action: 'start',
        }
    }
  }

  const sortedTestes = [...testes].sort((a, b) => a.ordem - b.ordem)

  // Find next test to do (first pending or in_progress)
  const nextTest = sortedTestes.find(
    (t) => t.status === 'em_andamento' || t.status === 'pendente'
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Olá, {pacienteNome}!
        </h1>
        <p className="text-gray-600">
          {testesCompletos === totalTestes
            ? 'Parabéns! Você concluiu todos os testes.'
            : 'Você tem testes para completar. Vamos lá?'}
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
          <span className="text-sm font-semibold text-gray-900">
            {testesCompletos}/{totalTestes} testes
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressoGeral === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressoGeral}%` }}
          />
        </div>
        {progressoGeral === 100 && (
          <p className="text-center text-green-600 text-sm mt-2 font-medium">
            Todos os testes foram concluídos!
          </p>
        )}
      </div>

      {/* Test List */}
      <div className="space-y-3">
        {sortedTestes.map((teste, index) => {
          const config = getStatusConfig(teste.status, teste.progresso)
          const isNext = teste.id === nextTest?.id

          return (
            <div
              key={teste.id}
              className={`
                bg-white rounded-lg border-2 p-4 transition-all
                ${isNext ? 'border-blue-300 shadow-md' : 'border-gray-200'}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Order Number */}
                <div
                  className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${
                      teste.status === 'concluido'
                        ? 'bg-green-500 text-white'
                        : isNext
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {index + 1}
                </div>

                {/* Test Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {teste.teste_sigla}
                    </span>
                    <span className="text-gray-600 truncate">{teste.teste_nome}</span>
                  </div>
                  <span
                    className={`
                      inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full
                      ${config.color}
                    `}
                  >
                    {config.label}
                  </span>

                  {/* Progress bar for in-progress */}
                  {teste.status === 'em_andamento' && (
                    <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full">
                      <div
                        className="h-1.5 bg-blue-500 rounded-full"
                        style={{ width: `${teste.progresso}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status Icon / Action Button */}
                <div className="flex-shrink-0">
                  {config.canInteract ? (
                    <button
                      onClick={() =>
                        config.action === 'continue'
                          ? onContinueTest(teste.teste_aplicado_id)
                          : onStartTest(teste.teste_aplicado_id)
                      }
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-colors
                        ${
                          isNext
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {config.action === 'continue' ? 'Continuar' : 'Iniciar'}
                    </button>
                  ) : (
                    config.icon
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
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
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Dicas importantes:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Complete os testes na ordem sugerida</li>
              <li>Responda com sinceridade - não há respostas certas ou erradas</li>
              <li>Você pode pausar e continuar depois</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
