'use client'

import { ScaleScore } from '@/lib/services/mcmi-iv-scoring.service'

interface ClinicalSyndromesChartProps {
  scales: ScaleScore[]
}

export default function ClinicalSyndromesChart({ scales }: ClinicalSyndromesChartProps) {
  const getBRColor = (br: number) => {
    if (br >= 85) return 'bg-red-500'
    if (br >= 75) return 'bg-orange-500'
    if (br >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getBRTextColor = (br: number) => {
    if (br >= 85) return 'text-red-700'
    if (br >= 75) return 'text-orange-700'
    if (br >= 60) return 'text-yellow-700'
    return 'text-green-700'
  }

  const getBRLabel = (br: number) => {
    if (br >= 85) return 'Proeminente'
    if (br >= 75) return 'Padrão Clínico'
    if (br >= 60) return 'Em Risco'
    return 'Não Presente'
  }

  const maxBR = 115

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Síndromes Clínicas</h3>
          <p className="text-sm text-gray-600 mt-1">
            10 escalas de síndromes clínicas (A, H, N, D, B, T, R, SS, CC, PP)
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {scales.map((scale) => (
              <div key={scale.code} className="group">
                <div className="flex items-center space-x-3 mb-1">
                  <div className="w-32 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900">{scale.code}</span>
                    <span className="text-xs text-gray-600 ml-2">{scale.name}</span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                      {/* Reference lines */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 opacity-30" style={{ left: `${(60 / maxBR) * 100}%` }} />
                      <div className="absolute top-0 bottom-0 w-0.5 bg-orange-400 opacity-30" style={{ left: `${(75 / maxBR) * 100}%` }} />
                      <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 opacity-30" style={{ left: `${(85 / maxBR) * 100}%` }} />

                      {/* BR bar */}
                      <div
                        className={`absolute top-0 bottom-0 ${getBRColor(scale.br)} transition-all duration-500 ease-out group-hover:opacity-90`}
                        style={{ width: `${Math.min((scale.br / maxBR) * 100, 100)}%` }}
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gray-900 opacity-50" />
                      </div>
                    </div>

                    {/* BR marker */}
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 w-0.5 h-12 bg-gray-900"
                      style={{ left: `${Math.min((scale.br / maxBR) * 100, 100)}%` }}
                    >
                      <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900 rounded-full border-2 border-white" />
                    </div>
                  </div>

                  <div className="w-40 flex-shrink-0 text-right space-y-0.5">
                    <div className="text-sm">
                      <span className="font-bold text-gray-900">BR {scale.br}</span>
                      <span className="text-gray-400 mx-1">|</span>
                      <span className="text-gray-600">{scale.percentile}%</span>
                    </div>
                    <div className={`text-xs font-medium ${getBRTextColor(scale.br)}`}>
                      {getBRLabel(scale.br)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
