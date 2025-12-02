'use client'

import { useMemo } from 'react'

// ===================================
// TYPES
// ===================================

interface AASPResultsProps {
  testTemplate: {
    nome: string
    sigla: string
    regras_calculo: AASPRegrasCalculo
    interpretacao: AASPInterpretacao
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

interface AASPRegrasCalculo {
  tipo: 'quadrantes'
  quadrantes: Record<string, {
    nome: string
    descricao: string
    questoes: number[]
    peso: number
  }>
  secoes_sensoriais?: Record<string, {
    nome: string
    questoes: number[]
  }>
  max_por_quadrante: number
}

interface AASPInterpretacao {
  faixas_etarias: Record<string, {
    idade_min: number
    idade_max: number
    quadrantes: Record<string, Record<string, { min: number; max: number }>>
  }>
  classificacoes: Record<string, {
    nome: string
    simbolo: string
    descricao: string
  }>
  notas: string
}

interface QuadrantResult {
  key: string
  nome: string
  descricao: string
  score: number
  maxScore: number
  classificacao: string
  classificacaoNome: string
  simbolo: string
  classificacaoDescricao: string
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

function getAgeGroup(age: number): string {
  if (age >= 11 && age <= 17) return 'adolescente'
  if (age >= 18 && age <= 64) return 'adulto'
  if (age >= 65) return 'idoso'
  return 'adulto' // default
}

function getAgeGroupLabel(ageGroup: string): string {
  switch (ageGroup) {
    case 'adolescente': return 'Adolescente (11-17 anos)'
    case 'adulto': return 'Adulto (18-64 anos)'
    case 'idoso': return 'Idoso (65+ anos)'
    default: return 'Adulto'
  }
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

function getQuadrantColor(quadrantKey: string): { bg: string; text: string; border: string } {
  switch (quadrantKey) {
    case 'baixo_registro':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-400' }
    case 'procura_sensacao':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-400' }
    case 'sensitividade_sensorial':
      return { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-400' }
    case 'evita_sensacao':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-400' }
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-400' }
  }
}

function classifyScore(
  score: number,
  quadrantKey: string,
  ageGroup: string,
  interpretacao: AASPInterpretacao
): { classificacao: string; nome: string; simbolo: string; descricao: string } {
  const ageGroupNorms = interpretacao.faixas_etarias[ageGroup]
  if (!ageGroupNorms?.quadrantes[quadrantKey]) {
    return {
      classificacao: 'semelhante',
      nome: 'Semelhante',
      simbolo: '=',
      descricao: 'Normas não disponíveis para esta faixa etária'
    }
  }

  const norms = ageGroupNorms.quadrantes[quadrantKey]
  const classifications = interpretacao.classificacoes

  for (const [classKey, range] of Object.entries(norms)) {
    if (score >= range.min && score <= range.max) {
      const classInfo = classifications[classKey]
      return {
        classificacao: classKey,
        nome: classInfo?.nome || classKey,
        simbolo: classInfo?.simbolo || '?',
        descricao: classInfo?.descricao || ''
      }
    }
  }

  // Fallback
  return {
    classificacao: 'semelhante',
    nome: 'Semelhante',
    simbolo: '=',
    descricao: 'Pontuação fora das faixas normativas'
  }
}

// ===================================
// QUADRANT CHART COMPONENT
// ===================================

function QuadrantChart({ results }: { results: QuadrantResult[] }) {
  const maxScore = results[0]?.maxScore || 75
  const chartHeight = 256 // 16rem = 256px (h-64)
  const minScore = 15

  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 py-2">
        <span>{maxScore}</span>
        <span>{Math.round(maxScore * 0.75)}</span>
        <span>{Math.round(maxScore * 0.5)}</span>
        <span>{Math.round(maxScore * 0.25)}</span>
        <span>{minScore}</span>
      </div>

      {/* Chart area */}
      <div className="ml-14 mr-4">
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
              // Calculate height as pixels for reliable rendering
              const heightPercent = ((result.score - minScore) / (maxScore - minScore)) * 100
              const heightPx = Math.max((heightPercent / 100) * chartHeight, 20)
              const colors = getQuadrantColor(result.key)

              return (
                <div key={result.key} className="flex flex-col items-center justify-end w-1/4 h-full px-1">
                  {/* Score label on top of bar */}
                  <div className={`text-sm font-bold ${colors.text} mb-1`}>
                    {result.score}
                  </div>
                  {/* Bar */}
                  <div
                    className={`w-16 ${colors.bg} ${colors.border} border-2 rounded-t-lg transition-all duration-500`}
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
                <div className={`text-xs font-medium ${colors.text} truncate`}>
                  {result.nome.split(' ')[0]}
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
// QUADRANT DETAIL CARD
// ===================================

function QuadrantCard({ result }: { result: QuadrantResult }) {
  const colors = getQuadrantColor(result.key)
  const classColors = getClassificationColor(result.classificacao)

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className={`font-semibold ${colors.text}`}>{result.nome}</h4>
          <p className="text-xs text-gray-600 mt-1">{result.descricao}</p>
        </div>
        <div className={`text-3xl font-bold ${colors.text}`}>
          {result.simbolo}
        </div>
      </div>

      {/* Score display */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>15</span>
            <span>{result.maxScore}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bg.replace('50', '400')} transition-all duration-500`}
              style={{ width: `${((result.score - 15) / (result.maxScore - 15)) * 100}%` }}
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
        <div className="text-xs opacity-80 mt-0.5">{result.classificacaoDescricao}</div>
      </div>
    </div>
  )
}

// ===================================
// MAIN COMPONENT
// ===================================

export default function AASPResults({
  testTemplate,
  pontuacaoBruta,
  patientInfo,
  dataConlusao
}: AASPResultsProps) {
  const idade = calculateAge(patientInfo.data_nascimento)
  const ageGroup = getAgeGroup(idade)
  const ageGroupLabel = getAgeGroupLabel(ageGroup)

  // Calculate results for each quadrant
  const quadrantResults = useMemo<QuadrantResult[]>(() => {
    const { regras_calculo, interpretacao } = testTemplate
    const results: QuadrantResult[] = []

    for (const [key, quadrant] of Object.entries(regras_calculo.quadrantes)) {
      const score = pontuacaoBruta.secoes?.[key] || 0
      const classification = classifyScore(score, key, ageGroup, interpretacao)

      results.push({
        key,
        nome: quadrant.nome,
        descricao: quadrant.descricao,
        score,
        maxScore: regras_calculo.max_por_quadrante,
        classificacao: classification.classificacao,
        classificacaoNome: classification.nome,
        simbolo: classification.simbolo,
        classificacaoDescricao: classification.descricao
      })
    }

    // Sort in standard AASP order
    const order = ['baixo_registro', 'procura_sensacao', 'sensitividade_sensorial', 'evita_sensacao']
    return results.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
  }, [testTemplate, pontuacaoBruta, ageGroup])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Perfil Sensorial do Adulto/Adolescente (AASP)</h1>
        <p className="text-cyan-100">Modelo de Processamento Sensorial de Dunn</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Informações do Paciente
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
            <p className="text-sm text-gray-600">Faixa Etária Normativa</p>
            <p className="font-medium text-cyan-700">{ageGroupLabel}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sexo</p>
            <p className="font-medium text-gray-900">
              {patientInfo.sexo === 'M' ? 'Masculino' : 'Feminino'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Data de Conclusão</p>
            <p className="font-medium text-gray-900">
              {new Date(dataConlusao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Results Summary Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil dos Quadrantes Sensoriais</h2>
        <QuadrantChart results={quadrantResults} />

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda de Classificações</h3>
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

      {/* Interpretation Guide */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Interpretação do Perfil Sensorial</h2>

        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 mb-4">
            {testTemplate.interpretacao.notas}
          </p>

          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">Compreendendo os Quadrantes</h3>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-amber-800">Baixo Registro:</strong>
                <span className="text-gray-600 ml-1">
                  Reflete a tendência de não perceber estímulos sensoriais. Pontuações altas sugerem que a pessoa pode parecer desatenta ou não responder a estímulos do ambiente.
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-emerald-800">Procura Sensação:</strong>
                <span className="text-gray-600 ml-1">
                  Reflete a busca ativa por experiências sensoriais. Pontuações altas indicam que a pessoa procura ativamente estímulos sensoriais intensos ou variados.
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-violet-800">Sensitividade Sensorial:</strong>
                <span className="text-gray-600 ml-1">
                  Reflete a alta percepção de estímulos sensoriais. Pontuações altas indicam que a pessoa detecta mais estímulos que a maioria e pode se sentir sobrecarregada.
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-rose-800">Evita Sensação:</strong>
                <span className="text-gray-600 ml-1">
                  Reflete comportamentos de evitação de estímulos. Pontuações altas indicam que a pessoa ativamente evita ou limita sua exposição a estímulos sensoriais.
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
          Este relatório foi gerado automaticamente com base nas respostas do AASP e deve ser interpretado por
          um profissional de saúde qualificado (terapeuta ocupacional, psicólogo, etc.). Os resultados devem ser
          considerados em conjunto com outras informações clínicas, histórico do paciente, observações comportamentais
          e entrevistas. O perfil sensorial pode informar estratégias de adaptação ambiental e ocupacional.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Relatório
        </button>
        <button
          onClick={() => alert('Exportação PDF será implementada em breve')}
          className="flex-1 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
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
