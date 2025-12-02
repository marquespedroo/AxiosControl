'use client'

import { ScaleScore } from '@/lib/services/mcmi-iv-scoring.service'

interface ScoreSummaryTableProps {
  summary: {
    highestPersonality?: ScaleScore
    highestSevere?: ScaleScore
    highestClinical?: ScaleScore
    elevatedScales: ScaleScore[]
  }
}

export default function ScoreSummaryTable({ summary }: ScoreSummaryTableProps) {
  const { highestPersonality, highestSevere, highestClinical, elevatedScales } = summary

  const getBRBadge = (br: number) => {
    if (br >= 85) return 'bg-red-500 text-white'
    if (br >= 75) return 'bg-orange-500 text-white'
    if (br >= 60) return 'bg-yellow-500 text-gray-900'
    return 'bg-gray-300 text-gray-700'
  }

  return (
    <div className="space-y-4">
      {/* Highest Scales Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Resumo de Pontuações</h3>
          <p className="text-sm text-gray-600 mt-1">
            Escalas mais elevadas por categoria
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Highest Personality */}
          {highestPersonality && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                Padrão de Personalidade
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {highestPersonality.code} - {highestPersonality.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {highestPersonality.percentile}º percentil
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-lg font-bold ${getBRBadge(highestPersonality.br)}`}>
                  {highestPersonality.br}
                </div>
              </div>
            </div>
          )}

          {/* Highest Severe Pathology */}
          {highestSevere && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                Patologia Grave
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {highestSevere.code} - {highestSevere.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {highestSevere.percentile}º percentil
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-lg font-bold ${getBRBadge(highestSevere.br)}`}>
                  {highestSevere.br}
                </div>
              </div>
            </div>
          )}

          {/* Highest Clinical Syndrome */}
          {highestClinical && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                Síndrome Clínica
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {highestClinical.code} - {highestClinical.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {highestClinical.percentile}º percentil
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-lg font-bold ${getBRBadge(highestClinical.br)}`}>
                  {highestClinical.br}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Elevated Scales (BR >= 75) */}
      {elevatedScales.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 bg-orange-50 border-b border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900">
              Escalas Clinicamente Elevadas
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              {elevatedScales.length} escala{elevatedScales.length !== 1 ? 's' : ''} com BR ≥ 75 (Padrão Clínico ou Proeminente)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Escala
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    BR
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Percentil
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Nível
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {elevatedScales.map((scale, idx) => (
                  <tr key={`${scale.code}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{scale.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{scale.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-gray-900">{scale.br}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-600">{scale.percentile}%</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getBRBadge(scale.br)}`}>
                        {scale.levelDescription}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Elevated Scales Message */}
      {elevatedScales.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-900">
                Nenhuma Escala Clinicamente Elevada
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Todas as escalas estão abaixo do limiar clínico (BR {'<'} 75)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
