'use client'

import { useMemo } from 'react'

// ===================================
// TYPES
// ===================================

interface ChildSensoryProfileResultsProps {
  testTemplate: {
    nome: string
    sigla: string
    regras_calculo: SP2CRegrasCalculo
    interpretacao: SP2CInterpretacao
  }
  pontuacaoBruta: {
    total: number
    secoes: Record<string, number>
  }
  patientInfo: {
    nome_completo: string
    data_nascimento: string
    escolaridade_anos: number
    sexo: string
  }
  dataConlusao: string
}

interface SP2CRegrasCalculo {
  tipo: 'quadrantes_secoes'
  quadrantes: Record<string, {
    nome: string
    nome_crianca?: string
    descricao: string
    questoes: number[]
    peso: number
    max_score: number
  }>
  secoes_sensoriais: Record<string, {
    nome: string
    questoes: number[]
    max_score: number
  }>
  secoes_comportamentais: Record<string, {
    nome: string
    questoes: number[]
    max_score: number
  }>
}

interface SP2CInterpretacao {
  quadrantes: Record<string, Record<string, { min: number; max: number }>>
  secoes_sensoriais: Record<string, Record<string, { min: number; max: number }>>
  secoes_comportamentais: Record<string, Record<string, { min: number; max: number }>>
  classificacoes: Record<string, {
    nome: string
    simbolo: string
    descricao: string
  }>
  notas: string
}

interface ScoreResult {
  key: string
  nome: string
  descricao?: string
  score: number
  maxScore: number
  classificacao: string
  classificacaoNome: string
  simbolo: string
}

// ===================================
// HELPER FUNCTIONS
// ===================================

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function getClassificationColor(classificacao: string): string {
  switch (classificacao) {
    case 'muito_menos':
      return 'bg-blue-100 border-blue-500 text-blue-900'
    case 'menos':
      return 'bg-cyan-100 border-cyan-500 text-cyan-900'
    case 'semelhante':
      return 'bg-green-100 border-green-500 text-green-900'
    case 'mais':
      return 'bg-orange-100 border-orange-500 text-orange-900'
    case 'muito_mais':
      return 'bg-red-100 border-red-500 text-red-900'
    default:
      return 'bg-gray-100 border-gray-500 text-gray-900'
  }
}

function getQuadrantColor(quadrantKey: string): { bg: string; text: string; border: string; barBg: string } {
  switch (quadrantKey) {
    case 'exploracao':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-400', barBg: 'bg-emerald-400' }
    case 'esquiva':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-400', barBg: 'bg-rose-400' }
    case 'sensibilidade':
      return { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-400', barBg: 'bg-violet-400' }
    case 'observacao':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-400', barBg: 'bg-amber-400' }
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-400', barBg: 'bg-gray-400' }
  }
}

function classifyScore(
  score: number,
  norms: Record<string, { min: number; max: number }>,
  classificacoes: Record<string, { nome: string; simbolo: string; descricao: string }>
): { classificacao: string; nome: string; simbolo: string } {
  for (const [classKey, range] of Object.entries(norms)) {
    if (score >= range.min && score <= range.max) {
      const classInfo = classificacoes[classKey]
      return {
        classificacao: classKey,
        nome: classInfo?.nome || classKey,
        simbolo: classInfo?.simbolo || '?'
      }
    }
  }

  return {
    classificacao: 'semelhante',
    nome: 'Semelhante',
    simbolo: '='
  }
}

// ===================================
// QUADRANT CHART COMPONENT
// ===================================

function QuadrantChart({ results }: { results: ScoreResult[] }) {
  const chartHeight = 256

  return (
    <div className="relative">
      {/* Chart area */}
      <div className="ml-8 mr-4">
        {/* Grid lines */}
        <div className="relative h-64 bg-gray-50 rounded-lg border border-gray-200">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="absolute left-0 right-0 border-t border-gray-200"
              style={{ top: `${100 - percent}%` }}
            />
          ))}

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-around px-4">
            {results.map((result) => {
              const heightPercent = (result.score / result.maxScore) * 100
              const heightPx = Math.max((heightPercent / 100) * chartHeight, 20)
              const colors = getQuadrantColor(result.key)

              return (
                <div key={result.key} className="flex flex-col items-center justify-end w-1/4 h-full px-1">
                  <div className={`text-sm font-bold ${colors.text} mb-1`}>
                    {result.score}
                  </div>
                  <div
                    className={`w-14 ${colors.barBg} rounded-t-lg transition-all duration-500`}
                    style={{ height: `${heightPx}px` }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-around mt-2">
          {results.map((result) => {
            const colors = getQuadrantColor(result.key)
            return (
              <div key={result.key} className="w-1/4 px-1 text-center">
                <div className={`text-xs font-medium ${colors.text}`}>
                  {result.nome}
                </div>
                <div className={`text-lg font-bold ${colors.text}`}>
                  {result.simbolo}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ===================================
// SECTION SCORES TABLE
// ===================================

function SectionScoresTable({
  title,
  results,
  colorClass
}: {
  title: string
  results: ScoreResult[]
  colorClass: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className={`text-lg font-semibold mb-4 ${colorClass}`}>{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Seção</th>
              <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Pontuação</th>
              <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Máx</th>
              <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Classificação</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.key} className="border-b border-gray-100">
                <td className="py-3 px-3 text-sm text-gray-900">{result.nome}</td>
                <td className="py-3 px-3 text-center">
                  <span className="text-lg font-bold text-gray-900">{result.score}</span>
                </td>
                <td className="py-3 px-3 text-center text-sm text-gray-500">/{result.maxScore}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(result.classificacao)}`}>
                    {result.simbolo} {result.classificacaoNome}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ===================================
// QUADRANT DETAIL CARD
// ===================================

function QuadrantCard({ result }: { result: ScoreResult & { descricao?: string; nomeCrianca?: string } }) {
  const colors = getQuadrantColor(result.key)
  const classColors = getClassificationColor(result.classificacao)

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className={`font-semibold ${colors.text}`}>{result.nome}</h4>
          {result.nomeCrianca && (
            <p className={`text-sm ${colors.text} opacity-75`}>{result.nomeCrianca}</p>
          )}
          {result.descricao && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{result.descricao}</p>
          )}
        </div>
        <div className={`text-3xl font-bold ${colors.text}`}>
          {result.simbolo}
        </div>
      </div>

      {/* Score display */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>0</span>
            <span>{result.maxScore}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.barBg} transition-all duration-500`}
              style={{ width: `${(result.score / result.maxScore) * 100}%` }}
            />
          </div>
        </div>
        <div className={`text-2xl font-bold ${colors.text}`}>
          {result.score}
        </div>
      </div>

      {/* Classification */}
      <div className={`mt-3 p-2 rounded border-l-4 ${classColors}`}>
        <div className="font-medium text-sm">{result.classificacaoNome}</div>
      </div>
    </div>
  )
}

// ===================================
// MAIN COMPONENT
// ===================================

export default function ChildSensoryProfileResults({
  testTemplate,
  pontuacaoBruta,
  patientInfo,
  dataConlusao
}: ChildSensoryProfileResultsProps) {
  const idade = calculateAge(patientInfo.data_nascimento)

  // Calculate results for each quadrant
  const quadrantResults = useMemo<(ScoreResult & { descricao?: string; nomeCrianca?: string })[]>(() => {
    const { regras_calculo, interpretacao } = testTemplate
    const results: (ScoreResult & { descricao?: string; nomeCrianca?: string })[] = []

    for (const [key, quadrant] of Object.entries(regras_calculo.quadrantes)) {
      const score = pontuacaoBruta.secoes?.[key] || 0
      const norms = interpretacao.quadrantes[key]
      const classification = classifyScore(score, norms, interpretacao.classificacoes)

      results.push({
        key,
        nome: quadrant.nome,
        nomeCrianca: quadrant.nome_crianca,
        descricao: quadrant.descricao,
        score,
        maxScore: quadrant.max_score,
        classificacao: classification.classificacao,
        classificacaoNome: classification.nome,
        simbolo: classification.simbolo
      })
    }

    // Sort in standard order
    const order = ['exploracao', 'esquiva', 'sensibilidade', 'observacao']
    return results.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
  }, [testTemplate, pontuacaoBruta])

  // Calculate sensory section results
  const sensorySectionResults = useMemo<ScoreResult[]>(() => {
    const { regras_calculo, interpretacao } = testTemplate
    const results: ScoreResult[] = []

    for (const [key, section] of Object.entries(regras_calculo.secoes_sensoriais)) {
      const score = pontuacaoBruta.secoes?.[key] || 0
      const norms = interpretacao.secoes_sensoriais[key]
      const classification = classifyScore(score, norms, interpretacao.classificacoes)

      results.push({
        key,
        nome: section.nome,
        score,
        maxScore: section.max_score,
        classificacao: classification.classificacao,
        classificacaoNome: classification.nome,
        simbolo: classification.simbolo
      })
    }

    return results
  }, [testTemplate, pontuacaoBruta])

  // Calculate behavioral section results
  const behavioralSectionResults = useMemo<ScoreResult[]>(() => {
    const { regras_calculo, interpretacao } = testTemplate
    const results: ScoreResult[] = []

    for (const [key, section] of Object.entries(regras_calculo.secoes_comportamentais)) {
      const score = pontuacaoBruta.secoes?.[key] || 0
      const norms = interpretacao.secoes_comportamentais[key]
      const classification = classifyScore(score, norms, interpretacao.classificacoes)

      results.push({
        key,
        nome: section.nome,
        score,
        maxScore: section.max_score,
        classificacao: classification.classificacao,
        classificacaoNome: classification.nome,
        simbolo: classification.simbolo
      })
    }

    return results
  }, [testTemplate, pontuacaoBruta])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Perfil Sensorial 2 - Crianca</h1>
        <p className="text-green-100">Questionário do Cuidador (3-14 anos) - Modelo de Dunn</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Informacoes da Crianca
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nome Completo</p>
            <p className="font-medium text-gray-900">{patientInfo.nome_completo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Idade</p>
            <p className="font-medium text-gray-900">{idade} anos</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sexo</p>
            <p className="font-medium text-gray-900">
              {patientInfo.sexo === 'M' ? 'Masculino' : 'Feminino'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Respondente</p>
            <p className="font-medium text-green-700">Cuidador/Responsável</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Data de Conclusão</p>
            <p className="font-medium text-gray-900">
              {new Date(dataConlusao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Quadrant Results Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil dos Quadrantes Sensoriais</h2>
        <QuadrantChart results={quadrantResults} />

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda de Classificacoes</h3>
          <div className="flex flex-wrap gap-3">
            {['muito_menos', 'menos', 'semelhante', 'mais', 'muito_mais'].map((key) => {
              const info = testTemplate.interpretacao.classificacoes[key]
              return (
                <div key={key} className={`px-3 py-1 rounded-full text-xs font-medium ${getClassificationColor(key)}`}>
                  {info?.simbolo} {info?.nome}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detailed Quadrant Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados Detalhados por Quadrante</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quadrantResults.map((result) => (
            <QuadrantCard key={result.key} result={result} />
          ))}
        </div>
      </div>

      {/* Sensory Sections */}
      <SectionScoresTable
        title="Secoes Sensoriais"
        results={sensorySectionResults}
        colorClass="text-blue-700"
      />

      {/* Behavioral Sections */}
      <SectionScoresTable
        title="Secoes Comportamentais"
        results={behavioralSectionResults}
        colorClass="text-purple-700"
      />

      {/* Interpretation Guide */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Interpretacao do Perfil Sensorial</h2>

        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 mb-4">
            {testTemplate.interpretacao.notas}
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">Compreendendo os Quadrantes</h3>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-emerald-800">Exploração (Crianca exploradora):</strong>
                <span className="text-gray-600 ml-1">
                  O grau em que a crianca obtém estímulo sensorial. Pontuacões altas indicam que a crianca busca estímulos sensoriais em taxa elevada.
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-rose-800">Esquiva (Crianca que se esquiva):</strong>
                <span className="text-gray-600 ml-1">
                  O grau em que a crianca fica incomodada por estímulos sensoriais. Pontuacões altas indicam que a crianca se afasta de estímulos sensoriais.
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-violet-800">Sensibilidade (Crianca sensível):</strong>
                <span className="text-gray-600 ml-1">
                  O grau em que a crianca detecta estímulos sensoriais. Pontuacões altas indicam que a crianca percebe estímulos em taxa mais elevada.
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-amber-800">Observacao (Crianca observadora):</strong>
                <span className="text-gray-600 ml-1">
                  O grau em que a crianca não percebe estímulos sensoriais. Pontuacões altas indicam que a crianca não percebe estímulos em taxa elevada.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Disclaimer */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Aviso Profissional</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Este relatório foi gerado automaticamente com base nas respostas do Perfil Sensorial 2 e deve ser interpretado por
          um profissional de saúde qualificado (terapeuta ocupacional, psicólogo, etc.). Os resultados devem ser
          considerados em conjunto com outras informacões clínicas, histórico da crianca, observacões comportamentais
          e entrevistas. O perfil sensorial pode informar estratégias de adaptacao ambiental, escolar e terapêutica.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Relatório
        </button>
        <button
          onClick={() => alert('Exportacao PDF será implementada em breve')}
          className="flex-1 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar PDF (Em breve)
        </button>
      </div>
    </div>
  )
}
