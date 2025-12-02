'use client'

interface SignificantResponse {
  category: string
  itemsEndorsed: number
  level: 'low' | 'moderate' | 'high'
}

interface SignificantResponsesTableProps {
  responses: SignificantResponse[]
}

export default function SignificantResponsesTable({ responses }: SignificantResponsesTableProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'high':
        return '🔴'
      case 'moderate':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'high':
        return 'Alta Preocupação'
      case 'moderate':
        return 'Preocupação Moderada'
      case 'low':
        return 'Baixa/Sem Preocupação'
      default:
        return 'Não Avaliado'
    }
  }

  // Separate by concern level
  const highConcern = responses.filter(r => r.level === 'high')
  const moderateConcern = responses.filter(r => r.level === 'moderate')
  const lowConcern = responses.filter(r => r.level === 'low')

  return (
    <div className="space-y-4">
      {/* Alert Banner for High Concern Items */}
      {highConcern.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Atenção: {highConcern.length} categoria{highConcern.length !== 1 ? 's' : ''} com alta preocupação clínica
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Múltiplas respostas significativas foram identificadas. Avaliação clínica aprofundada recomendada.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Respostas Significativas</h3>
          <p className="text-sm text-gray-600 mt-1">
            Categorias de itens clinicamente relevantes
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Itens Endossados
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nível de Preocupação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* High Concern Items First */}
              {highConcern.map((response, idx) => (
                <tr key={`high-${idx}`} className="bg-red-25">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getLevelIcon(response.level)}</span>
                      <span className="text-sm font-medium text-gray-900">{response.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {response.itemsEndorsed} {response.itemsEndorsed === 1 ? 'item' : 'itens'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(response.level)}`}>
                      {getLevelLabel(response.level)}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Moderate Concern */}
              {moderateConcern.map((response, idx) => (
                <tr key={`moderate-${idx}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getLevelIcon(response.level)}</span>
                      <span className="text-sm font-medium text-gray-900">{response.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {response.itemsEndorsed} {response.itemsEndorsed === 1 ? 'item' : 'itens'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(response.level)}`}>
                      {getLevelLabel(response.level)}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Low Concern */}
              {lowConcern.map((response, idx) => (
                <tr key={`low-${idx}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getLevelIcon(response.level)}</span>
                      <span className="text-sm text-gray-700">{response.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-600">
                      {response.itemsEndorsed} {response.itemsEndorsed === 1 ? 'item' : 'itens'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(response.level)}`}>
                      {getLevelLabel(response.level)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Níveis de Preocupação</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🟢</span>
            <div>
              <div className="font-medium">Baixa/Sem Preocupação</div>
              <div className="text-gray-600">0-1 itens endossados</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🟡</span>
            <div>
              <div className="font-medium">Preocupação Moderada</div>
              <div className="text-gray-600">2-3 itens endossados</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🔴</span>
            <div>
              <div className="font-medium">Alta Preocupação</div>
              <div className="text-gray-600">{'>'} 3 itens endossados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
