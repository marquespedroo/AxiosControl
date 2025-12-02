'use client'

import { ScaleScore } from '@/lib/services/mcmi-iv-scoring.service'

interface GrossmanFacetsDisplayProps {
  facets: ScaleScore[]
}

export default function GrossmanFacetsDisplay({ facets }: GrossmanFacetsDisplayProps) {
  // Group facets by domain based on code patterns
  const groupFacetsByDomain = () => {
    // Filter out facets without valid codes
    const validFacets = facets.filter(f => f && f.code && typeof f.code === 'string')

    // Try F1-F5 grouping (Five Factor Model)
    const fiveFactor = {
      'Emocionalidade Negativa': validFacets.filter(f => f.code.startsWith('F1')),
      Introversão: validFacets.filter(f => f.code.startsWith('F2')),
      Antagonismo: validFacets.filter(f => f.code.startsWith('F3')),
      Desinibição: validFacets.filter(f => f.code.startsWith('F4')),
      Compulsividade: validFacets.filter(f => f.code.startsWith('F5'))
    }

    // If F-prefix facets found, use that grouping
    if (Object.values(fiveFactor).some(arr => arr.length > 0)) {
      return fiveFactor
    }

    // Otherwise, group by parent scale (e.g., "2A.1" -> "Escala 2A")
    const grouped: Record<string, ScaleScore[]> = {}
    validFacets.forEach(facet => {
      // Extract parent scale from code (e.g., "2A.1" -> "2A")
      const match = facet.code.match(/^([0-9A-Z]+)\./)
      const parentCode = match ? match[1] : 'Outros'
      const groupName = `Facetas da Escala ${parentCode}`

      if (!grouped[groupName]) {
        grouped[groupName] = []
      }
      grouped[groupName].push(facet)
    })

    // If no valid grouping, show all together
    if (Object.keys(grouped).length === 0) {
      return { 'Facetas de Grossman': validFacets }
    }

    return grouped
  }

  const groupedFacets = groupFacetsByDomain()

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

  const maxBR = 115

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Facetas de Grossman</h3>
          <p className="text-sm text-gray-600 mt-1">
            Análise detalhada de traços de personalidade organizados por domínios
          </p>
        </div>

        <div className="p-6 space-y-8">
          {Object.entries(groupedFacets).map(([domain, domainFacets]) => (
            domainFacets.length > 0 && (
              <div key={domain} className="space-y-4">
                {/* Domain Header */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-base font-semibold text-gray-900">{domain}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {domainFacets.length} faceta{domainFacets.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Facets in this domain */}
                <div className="space-y-3 ml-4">
                  {domainFacets.map((facet) => (
                    <div key={facet.code} className="group">
                      <div className="flex items-center space-x-3">
                        <div className="w-20 flex-shrink-0">
                          <span className="text-xs font-bold text-gray-900">{facet.code}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">{facet.name}</span>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="font-semibold text-gray-900">BR {facet.br}</span>
                              <span className="text-gray-400">|</span>
                              <span className="text-gray-600">{facet.percentile}%</span>
                              <span className={`ml-2 px-2 py-0.5 rounded font-medium ${getBRTextColor(facet.br)}`}>
                                {facet.levelDescription}
                              </span>
                            </div>
                          </div>

                          {/* Mini bar */}
                          <div className="h-6 bg-gray-100 rounded overflow-hidden relative">
                            {/* Reference lines */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 opacity-20" style={{ left: `${(60 / maxBR) * 100}%` }} />
                            <div className="absolute top-0 bottom-0 w-0.5 bg-orange-400 opacity-20" style={{ left: `${(75 / maxBR) * 100}%` }} />
                            <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 opacity-20" style={{ left: `${(85 / maxBR) * 100}%` }} />

                            <div
                              className={`h-full ${getBRColor(facet.br)} transition-all duration-300 group-hover:opacity-80`}
                              style={{ width: `${Math.min((facet.br / maxBR) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-3">Resumo das Facetas</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {Object.entries(groupedFacets).map(([domain, domainFacets]) => {
            if (domainFacets.length === 0) return null
            const elevated = domainFacets.filter(f => f.br >= 75).length
            return (
              <div key={domain} className="bg-white rounded p-2">
                <div className="text-gray-600 mb-1">{domain}</div>
                <div className="font-bold text-gray-900">
                  {elevated > 0 ? (
                    <span className="text-orange-600">{elevated} elevada{elevated !== 1 ? 's' : ''}</span>
                  ) : (
                    <span className="text-green-600">Normal</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
