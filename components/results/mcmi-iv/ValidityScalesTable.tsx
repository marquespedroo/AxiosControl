'use client'

import { ValidityResult } from '@/lib/services/mcmi-iv-scoring.service'

interface ValidityScalesTableProps {
  validity: ValidityResult
}

export default function ValidityScalesTable({ validity }: ValidityScalesTableProps) {
  const scales = [
    { key: 'V', scale: validity.V, threshold: 2, description: 'Invalidez - padrão de respostas inválido' },
    { key: 'W', scale: validity.W, threshold: 7, description: 'Inconsistência - respostas contraditórias' },
    { key: 'X', scale: validity.X, threshold: 27, description: 'Sinceridade - abertura/franqueza', inverted: true },
    { key: 'Y', scale: validity.Y, threshold: 78, description: 'Desejabilidade Social - tendência a parecer positivo' },
    { key: 'Z', scale: validity.Z, threshold: 37, description: 'Desvalorização - tendência a exagerar problemas' }
  ]

  const getStatusColor = (scaleKey: string, pd: number, br: number) => {
    if (scaleKey === 'V') {
      if (pd < 2) return 'bg-green-50 border-green-500 text-green-700'
      return 'bg-red-50 border-red-500 text-red-700'
    }
    if (scaleKey === 'W') {
      if (pd < 7) return 'bg-green-50 border-green-500 text-green-700'
      return 'bg-red-50 border-red-500 text-red-700'
    }
    if (scaleKey === 'X') {
      if (pd >= 27) return 'bg-green-50 border-green-500 text-green-700'
      return 'bg-yellow-50 border-yellow-500 text-yellow-700'
    }
    if (scaleKey === 'Y') {
      if (br < 78) return 'bg-green-50 border-green-500 text-green-700'
      if (br >= 78) return 'bg-yellow-50 border-yellow-500 text-yellow-700'
    }
    if (scaleKey === 'Z') {
      if (br < 37) return 'bg-green-50 border-green-500 text-green-700'
      if (br >= 37) return 'bg-yellow-50 border-yellow-500 text-yellow-700'
    }
    return 'bg-gray-50 border-gray-300 text-gray-700'
  }

  const getStatusIcon = (scaleKey: string, pd: number, br: number) => {
    if (scaleKey === 'V' && pd < 2) return '✓'
    if (scaleKey === 'V' && pd >= 2) return '✗'
    if (scaleKey === 'W' && pd < 7) return '✓'
    if (scaleKey === 'W' && pd >= 7) return '✗'
    if (scaleKey === 'X' && pd >= 27) return '✓'
    if (scaleKey === 'X' && pd < 27) return '⚠'
    if (scaleKey === 'Y' && br < 78) return '✓'
    if (scaleKey === 'Y' && br >= 78) return '⚠'
    if (scaleKey === 'Z' && br < 37) return '✓'
    if (scaleKey === 'Z' && br >= 37) return '⚠'
    return '•'
  }

  return (
    <div className="space-y-4">
      {/* Overall Validity Status */}
      <div className={`rounded-lg p-4 border-2 ${validity.isValid
          ? 'bg-green-50 border-green-500'
          : 'bg-red-50 border-red-500'
        }`}>
        <div className="flex items-center space-x-3">
          <div className={`text-2xl ${validity.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {validity.isValid ? '✓' : '✗'}
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {validity.isValid ? 'Teste Válido' : 'Teste Inválido ou Questionável'}
            </h3>
            <p className="text-sm text-gray-600">
              {validity.isValid
                ? 'As respostas do paciente são consistentes e confiáveis para interpretação.'
                : 'As respostas apresentam padrões que comprometem a validade da interpretação.'}
            </p>
          </div>
        </div>

        {/* Warnings */}
        {validity.warnings.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Avisos:</h4>
            <ul className="space-y-1">
              {validity.warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                  <span className="text-yellow-600">⚠</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Validity Scales Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Escalas de Validade</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escala
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PD
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BR
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentil
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scales.map(({ key, scale, description }) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">{scale.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{scale.name}</div>
                      <div className="text-xs text-gray-500">{description}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-gray-900">{scale.pd}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-gray-900">{scale.br}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-600">{scale.percentile}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        key,
                        scale.pd,
                        scale.br
                      )}`}
                    >
                      {getStatusIcon(key, scale.pd, scale.br)}
                      <span className="ml-1">{scale.levelDescription}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Guia de Interpretação</h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p><strong>V (Invalidez):</strong> 0-1 = Válido, ≥2 = Questionável/Inválido</p>
          <p><strong>W (Inconsistência):</strong> 0-6 = Consistente, ≥7 = Inconsistente</p>
          <p><strong>X (Sinceridade):</strong> 0-26 = Baixa abertura, ≥27 = Aceitável</p>
          <p><strong>Y (Desejabilidade):</strong> {'<'}78 = Normal, ≥78 = Alta (possível ocultação)</p>
          <p><strong>Z (Desvalorização):</strong> {'<'}37 = Normal, ≥37 = Alta (possível exagero)</p>
        </div>
      </div>
    </div>
  )
}
