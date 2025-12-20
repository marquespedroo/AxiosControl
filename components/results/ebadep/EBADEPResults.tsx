'use client'

import { PontuacaoBruta } from '@/types/database'

interface EBADEPResultsProps {
  testTemplate: {
    nome: string
    sigla: string
    regras_calculo?: any
    interpretacao?: any
    questoes?: any[]
  }
  pontuacaoBruta: PontuacaoBruta & { percentil?: number }
  patientInfo: {
    nome_completo: string
    data_nascimento: string
    escolaridade_anos: number
    sexo: string
  }
  respostas?: Record<string, any>
  dataConlusao: string
}

export function EBADEPResults({
  testTemplate,
  pontuacaoBruta,
  patientInfo: _patientInfo,
  respostas,
  dataConlusao: _dataConlusao,
}: EBADEPResultsProps) {
  const rawScore = pontuacaoBruta.total
  const percentil = pontuacaoBruta.percentil || 0
  const interpretacao = testTemplate.interpretacao

  // Get classification based on raw score
  const getClassification = () => {
    if (!interpretacao?.faixas) return null

    for (const faixa of interpretacao.faixas) {
      if (rawScore >= faixa.pontuacao_min && rawScore <= faixa.pontuacao_max) {
        return faixa
      }
    }
    return null
  }

  const classification = getClassification()

  // Get color based on severity
  const getSeverityColor = (classificacao: string) => {
    const lower = classificacao.toLowerCase()
    if (lower.includes('sintomatologia depressiva') && !lower.includes('leve') && !lower.includes('moderada') && !lower.includes('severa')) {
      return 'from-green-500 to-green-600' // Normal range
    }
    if (lower.includes('leve')) {
      return 'from-yellow-500 to-yellow-600'
    }
    if (lower.includes('moderada')) {
      return 'from-orange-500 to-orange-600'
    }
    if (lower.includes('severa')) {
      return 'from-red-500 to-red-600'
    }
    return 'from-gray-500 to-gray-600'
  }

  const getBorderColor = (classificacao: string) => {
    const lower = classificacao.toLowerCase()
    if (lower.includes('sintomatologia depressiva') && !lower.includes('leve') && !lower.includes('moderada') && !lower.includes('severa')) {
      return 'border-green-200 bg-green-50'
    }
    if (lower.includes('leve')) {
      return 'border-yellow-200 bg-yellow-50'
    }
    if (lower.includes('moderada')) {
      return 'border-orange-200 bg-orange-50'
    }
    if (lower.includes('severa')) {
      return 'border-red-200 bg-red-50'
    }
    return 'border-gray-200 bg-gray-50'
  }

  // Check clinical alerts
  const checkClinicalAlerts = () => {
    if (!respostas || !interpretacao?.alertas_clinicos) return []

    const alerts = []
    for (const alerta of interpretacao.alertas_clinicos) {
      const resposta = respostas[`q${alerta.item}`] ?? respostas[alerta.item]
      const numericResponse = typeof resposta === 'string' ? parseInt(resposta) : resposta

      // Check if response triggers alert (2 or 3)
      if (numericResponse >= 2) {
        alerts.push(alerta)
      }
    }
    return alerts
  }

  const clinicalAlerts = checkClinicalAlerts()

  // Calculate percentile bar position
  const getPercentilePosition = () => {
    return Math.min(Math.max(percentil, 0), 100)
  }

  return (
    <div className="space-y-6">
      {/* Clinical Alerts - CRITICAL */}
      {clinicalAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ ALERTA CLÍNICO</h3>
              {clinicalAlerts.map((alerta, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <p className="font-semibold text-red-800">Item {alerta.item}: {alerta.conteudo}</p>
                  <p className="text-sm text-red-700 mt-1">{alerta.acao}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Score Summary Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo da Avaliação</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Raw Score */}
          <div className="relative overflow-hidden rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="relative z-10">
              <p className="text-sm font-semibold text-blue-700 mb-1">PONTUAÇÃO BRUTA</p>
              <p className="text-5xl font-bold text-blue-900 mb-2">{rawScore}</p>
              <p className="text-sm text-blue-600">de 135 pontos possíveis</p>
              <div className="mt-4 bg-white bg-opacity-50 rounded-lg px-3 py-2">
                <div className="flex justify-between text-xs text-blue-700 mb-1">
                  <span>0</span>
                  <span>135</span>
                </div>
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${(rawScore / 135) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Percentile */}
          <div className="relative overflow-hidden rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
            <div className="relative z-10">
              <p className="text-sm font-semibold text-purple-700 mb-1">PERCENTIL</p>
              <p className="text-5xl font-bold text-purple-900 mb-2">{percentil}</p>
              <p className="text-sm text-purple-600">
                {percentil >= 50
                  ? `Acima de ${percentil}% da população normativa`
                  : `Dentro de ${100 - percentil}% da população normativa`}
              </p>
              <div className="mt-4 bg-white bg-opacity-50 rounded-lg px-3 py-2">
                <div className="flex justify-between text-xs text-purple-700 mb-1">
                  <span>1º</span>
                  <span>99º</span>
                </div>
                <div className="h-2 bg-purple-200 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${getPercentilePosition()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Classification */}
        {classification && (
          <div className={`border-l-4 rounded-lg p-6 ${getBorderColor(classification.classificacao)}`}>
            <h3 className="text-xl font-bold mb-2" style={{
              color: classification.classificacao.toLowerCase().includes('severa') ? '#991b1b' :
                     classification.classificacao.toLowerCase().includes('moderada') ? '#9a3412' :
                     classification.classificacao.toLowerCase().includes('leve') ? '#854d0e' : '#065f46'
            }}>
              {classification.classificacao}
            </h3>
            <p className="text-gray-700 mb-3">{classification.descricao}</p>
            {classification.recomendacao && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-1">Recomendações:</p>
                <p className="text-sm text-gray-600">{classification.recomendacao}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interpretation Ranges Graph */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Faixas de Classificação</h3>
        <div className="space-y-3">
          {interpretacao?.faixas?.map((faixa: any, idx: number) => {
            const isCurrentRange = rawScore >= faixa.pontuacao_min && rawScore <= faixa.pontuacao_max
            const rangeWidth = ((faixa.pontuacao_max - faixa.pontuacao_min + 1) / 136) * 100
            const rangeStart = (faixa.pontuacao_min / 136) * 100

            return (
              <div key={idx} className={`rounded-lg p-4 transition-all ${isCurrentRange ? 'ring-2 ring-blue-500 shadow-md' : ''} ${getBorderColor(faixa.classificacao)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{faixa.classificacao}</span>
                  <span className="text-sm text-gray-600">
                    {faixa.pontuacao_min} - {faixa.pontuacao_max} pontos
                    {isCurrentRange && <span className="ml-2 text-blue-600 font-bold">← Você está aqui</span>}
                  </span>
                </div>
                <div className="h-8 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className={`absolute h-full bg-gradient-to-r ${getSeverityColor(faixa.classificacao)} opacity-60`}
                    style={{
                      left: `${rangeStart}%`,
                      width: `${rangeWidth}%`
                    }}
                  />
                  {isCurrentRange && (
                    <div
                      className="absolute h-full w-1 bg-blue-600"
                      style={{ left: `${(rawScore / 136) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {rawScore}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Additional Information */}
      {interpretacao?.notas && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Informações sobre o teste</h3>
          <p className="text-sm text-blue-800">{interpretacao.notas}</p>
          {interpretacao.referencias && (
            <p className="text-xs text-blue-600 mt-3">
              <strong>Referência:</strong> {interpretacao.referencias}
            </p>
          )}
        </div>
      )}

      {/* Print/Export Actions */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Imprimir Relatório
        </button>
        <button
          onClick={() => alert('Exportação PDF em desenvolvimento')}
          className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Exportar PDF
        </button>
      </div>
    </div>
  )
}
