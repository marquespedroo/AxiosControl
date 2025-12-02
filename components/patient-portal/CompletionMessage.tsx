'use client'

interface CompletionMessageProps {
  pacienteNome: string
  totalTestes: number
}

export default function CompletionMessage({
  pacienteNome,
  totalTestes,
}: CompletionMessageProps) {
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      {/* Success Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-green-500"
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
        {/* Confetti-like decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 border-4 border-green-200 rounded-full animate-ping opacity-20" />
        </div>
      </div>

      {/* Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Parabéns, {pacienteNome}!
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Você completou todos os {totalTestes} teste{totalTestes !== 1 ? 's' : ''} com
        sucesso!
      </p>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          E agora?
        </h2>
        <div className="space-y-3 text-left text-blue-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
              1
            </div>
            <p className="text-sm">
              Suas respostas foram enviadas com segurança para o profissional responsável.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
              2
            </div>
            <p className="text-sm">
              Os resultados serão analisados e discutidos na sua próxima consulta.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
              3
            </div>
            <p className="text-sm">
              Você pode fechar esta página com segurança.
            </p>
          </div>
        </div>
      </div>

      {/* Thank You */}
      <div className="text-gray-500 text-sm">
        <p>Obrigado por sua participação!</p>
        <p className="mt-2">
          Se tiver dúvidas, entre em contato com o profissional responsável.
        </p>
      </div>

      {/* Privacy Note */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>
            Suas respostas são confidenciais e protegidas por sigilo profissional.
          </span>
        </div>
      </div>
    </div>
  )
}
