'use client'

interface PercentileChartProps {
  percentil: number
  classificacao: string
}

export default function PercentileChart({ percentil, classificacao }: PercentileChartProps) {
  // Color coding based on classification
  const getColor = () => {
    const lower = classificacao.toLowerCase()
    if (lower.includes('muito superior') || lower.includes('superior')) return 'bg-green-500'
    if (lower.includes('médio superior') || lower.includes('acima')) return 'bg-blue-500'
    if (lower.includes('médio')) return 'bg-yellow-500'
    if (lower.includes('médio inferior') || lower.includes('abaixo')) return 'bg-orange-500'
    if (lower.includes('limítrofe') || lower.includes('inferior')) return 'bg-red-500'
    return 'bg-gray-500'
  }

  const getTextColor = () => {
    const lower = classificacao.toLowerCase()
    if (lower.includes('muito superior') || lower.includes('superior')) return 'text-green-700'
    if (lower.includes('médio superior') || lower.includes('acima')) return 'text-blue-700'
    if (lower.includes('médio')) return 'text-yellow-700'
    if (lower.includes('médio inferior') || lower.includes('abaixo')) return 'text-orange-700'
    if (lower.includes('limítrofe') || lower.includes('inferior')) return 'text-red-700'
    return 'text-gray-700'
  }

  const getBackgroundColor = () => {
    const lower = classificacao.toLowerCase()
    if (lower.includes('muito superior') || lower.includes('superior')) return 'bg-green-50'
    if (lower.includes('médio superior') || lower.includes('acima')) return 'bg-blue-50'
    if (lower.includes('médio')) return 'bg-yellow-50'
    if (lower.includes('médio inferior') || lower.includes('abaixo')) return 'bg-orange-50'
    if (lower.includes('limítrofe') || lower.includes('inferior')) return 'bg-red-50'
    return 'bg-gray-50'
  }

  return (
    <div className="space-y-4">
      {/* Visual Percentile Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>0</span>
          <span className="font-medium">Percentil: {percentil}</span>
          <span>100</span>
        </div>
        <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${getColor()} transition-all duration-500`}
            style={{ width: `${percentil}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-gray-800"
            style={{ left: `${percentil}%` }}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-800 rounded-full" />
          </div>
        </div>
      </div>

      {/* Classification Card */}
      <div className={`${getBackgroundColor()} border border-${getColor().replace('bg-', '')} rounded-lg p-4`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 ${getColor()} rounded-full`} />
          <div>
            <h4 className="text-sm font-medium text-gray-900">Classificação</h4>
            <p className={`text-lg font-semibold ${getTextColor()}`}>
              {classificacao}
            </p>
          </div>
        </div>
      </div>

      {/* Percentile Ranges Reference */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Referência de Percentis</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Muito Inferior</span>
            </span>
            <span className="font-mono">{'<'} 2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Inferior</span>
            </span>
            <span className="font-mono">2 - 9</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Médio</span>
            </span>
            <span className="font-mono">25 - 75</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Superior</span>
            </span>
            <span className="font-mono">91 - 98</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Muito Superior</span>
            </span>
            <span className="font-mono">{'>'} 98</span>
          </div>
        </div>
      </div>
    </div>
  )
}
