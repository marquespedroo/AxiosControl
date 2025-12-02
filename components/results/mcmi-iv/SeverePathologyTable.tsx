'use client'

import { ScaleScore } from '@/lib/services/mcmi-iv-scoring.service'

interface SeverePathologyTableProps {
  scales: ScaleScore[]
}

export default function SeverePathologyTable({ scales }: SeverePathologyTableProps) {
  const getBRColor = (br: number) => {
    if (br >= 85) return 'bg-red-100 border-red-500'
    if (br >= 75) return 'bg-orange-100 border-orange-500'
    if (br >= 60) return 'bg-yellow-100 border-yellow-500'
    return 'bg-green-100 border-green-500'
  }

  const getBRBadgeColor = (br: number) => {
    if (br >= 85) return 'bg-red-500 text-white'
    if (br >= 75) return 'bg-orange-500 text-white'
    if (br >= 60) return 'bg-yellow-500 text-gray-900'
    return 'bg-green-500 text-white'
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Patologia Grave de Personalidade</h3>
        <p className="text-sm text-gray-600 mt-1">
          3 escalas de patologia severa (Escalas S, C, P)
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {scales.map((scale) => (
          <div key={scale.code} className={`rounded-lg border-2 p-4 ${getBRColor(scale.br)}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-2xl font-bold text-gray-900">{scale.code}</div>
                <div className="text-sm font-medium text-gray-700">{scale.name}</div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold ${getBRBadgeColor(scale.br)}`}>
                {scale.levelDescription}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600">Base Rate (BR)</span>
                <span className="text-2xl font-bold text-gray-900">{scale.br}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600">Percentil</span>
                <span className="text-lg font-semibold text-gray-700">{scale.percentile}%</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600">PD (Raw)</span>
                <span className="text-sm font-medium text-gray-600">{scale.pd}</span>
              </div>
            </div>

            {/* Mini bar indicator */}
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  scale.br >= 85 ? 'bg-red-600' :
                  scale.br >= 75 ? 'bg-orange-600' :
                  scale.br >= 60 ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${Math.min((scale.br / 115) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
