'use client'

import { useMemo } from 'react'

// ===================================
// TYPES
// ===================================

interface BFPResultsProps {
  testTemplate: {
    nome: string
    sigla: string
    regras_calculo?: any
    interpretacao?: any
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

interface FactorResult {
  key: string
  nome: string
  nomeCompleto: string
  score: number
  percentil: number
  classificacao: string
  subfatores: SubfatorResult[]
}

interface SubfatorResult {
  key: string
  nome: string
  score: number
  percentil: number
  classificacao: string
}

// ===================================
// CONSTANTS
// ===================================

const BFP_FACTORS: Record<string, { nome: string; nomeCompleto: string; subfatores: Record<string, string>; color: string }> = {
  N: {
    nome: 'N',
    nomeCompleto: 'Neuroticismo',
    subfatores: {
      N1: 'Vulnerabilidade',
      N2: 'Instabilidade Emocional',
      N3: 'Passividade / Falta de Energia',
      N4: 'Depressão'
    },
    color: 'indigo'
  },
  E: {
    nome: 'E',
    nomeCompleto: 'Extroversão',
    subfatores: {
      E1: 'Comunicação',
      E2: 'Altivez',
      E3: 'Dinamismo',
      E4: 'Interações Sociais'
    },
    color: 'emerald'
  },
  S: {
    nome: 'S',
    nomeCompleto: 'Socialização',
    subfatores: {
      S1: 'Amabilidade',
      S2: 'Pró-sociabilidade',
      S3: 'Confiança'
    },
    color: 'amber'
  },
  R: {
    nome: 'R',
    nomeCompleto: 'Realização',
    subfatores: {
      R1: 'Competência',
      R2: 'Ponderação / Prudência',
      R3: 'Empenho / Comprometimento'
    },
    color: 'rose'
  },
  A: {
    nome: 'A',
    nomeCompleto: 'Abertura',
    subfatores: {
      A1: 'Abertura a Ideias',
      A2: 'Liberalismo',
      A3: 'Busca por Novidades'
    },
    color: 'cyan'
  }
}

const CLASSIFICACOES = [
  { key: 'muito_baixo', nome: 'Muito Baixo', min: 0, max: 15 },
  { key: 'baixo', nome: 'Baixo', min: 16, max: 30 },
  { key: 'medio', nome: 'Médio', min: 31, max: 70 },
  { key: 'alto', nome: 'Alto', min: 71, max: 85 },
  { key: 'muito_alto', nome: 'Muito Alto', min: 86, max: 100 }
]

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

function getClassificationFromPercentil(percentil: number): string {
  for (const c of CLASSIFICACOES) {
    if (percentil >= c.min && percentil <= c.max) {
      return c.nome
    }
  }
  return 'Médio'
}

function getClassificationColor(classificacao: string): string {
  switch (classificacao.toLowerCase()) {
    case 'muito baixo':
      return 'bg-blue-100 border-blue-500 text-blue-900'
    case 'baixo':
      return 'bg-cyan-100 border-cyan-500 text-cyan-900'
    case 'médio':
      return 'bg-green-100 border-green-500 text-green-900'
    case 'alto':
      return 'bg-orange-100 border-orange-500 text-orange-900'
    case 'muito alto':
      return 'bg-red-100 border-red-500 text-red-900'
    default:
      return 'bg-gray-100 border-gray-500 text-gray-900'
  }
}

function getFactorColors(color: string): { bg: string; border: string; text: string; barBg: string } {
  const colors: Record<string, { bg: string; border: string; text: string; barBg: string }> = {
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-400', text: 'text-indigo-800', barBg: 'bg-indigo-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', barBg: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-800', barBg: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-400', text: 'text-rose-800', barBg: 'bg-rose-500' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-800', barBg: 'bg-cyan-500' }
  }
  return colors[color] || colors.indigo
}

// ===================================
// FACTOR CARD COMPONENT
// ===================================

function FactorCard({ factor }: { factor: FactorResult }) {
  const factorDef = BFP_FACTORS[factor.key]
  const colors = getFactorColors(factorDef.color)
  const classColor = getClassificationColor(factor.classificacao)

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4`}>
      {/* Factor Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`text-xl font-bold ${colors.text}`}>{factor.nomeCompleto}</h3>
          <span className={`text-3xl font-bold ${colors.text}`}>({factor.key})</span>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${colors.text}`}>{factor.percentil}</p>
          <p className="text-sm text-gray-600">Percentil</p>
        </div>
      </div>

      {/* Factor Percentile Bar */}
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.barBg} transition-all duration-500`}
            style={{ width: `${factor.percentil}%` }}
          />
        </div>
        <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${classColor}`}>
          {factor.classificacao}
        </div>
      </div>

      {/* Subfactors */}
      <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Subfatores</h4>
        {factor.subfatores.map((sub) => (
          <div key={sub.key} className="flex items-center gap-3">
            <span className="w-8 text-sm font-medium text-gray-600">{sub.key}</span>
            <span className="flex-1 text-sm text-gray-700 truncate">{sub.nome}</span>
            <div className="w-24">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.barBg} opacity-70 transition-all duration-500`}
                  style={{ width: `${sub.percentil}%` }}
                />
              </div>
            </div>
            <span className="w-12 text-sm font-bold text-gray-900 text-right">{sub.percentil}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===================================
// RADAR SUMMARY
// ===================================

function FactorSummary({ factors }: { factors: FactorResult[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo dos Fatores</h2>
      <div className="space-y-3">
        {factors.map((factor) => {
          const factorDef = BFP_FACTORS[factor.key]
          const colors = getFactorColors(factorDef.color)
          return (
            <div key={factor.key} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center`}>
                <span className={`font-bold ${colors.text}`}>{factor.key}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{factor.nomeCompleto}</span>
                  <span className={`font-bold ${colors.text}`}>{factor.percentil}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.barBg} transition-all duration-500`}
                    style={{ width: `${factor.percentil}%` }}
                  />
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getClassificationColor(factor.classificacao)}`}>
                {factor.classificacao}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda</h3>
        <div className="flex flex-wrap gap-2">
          {CLASSIFICACOES.map((c) => (
            <div key={c.key} className={`px-3 py-1 rounded-full text-xs font-medium ${getClassificationColor(c.nome)}`}>
              {c.nome} ({c.min}-{c.max})
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ===================================
// MAIN COMPONENT
// ===================================

export default function BFPResults({
  testTemplate,
  pontuacaoBruta,
  patientInfo,
  dataConlusao
}: BFPResultsProps) {
  const idade = calculateAge(patientInfo.data_nascimento)

  // Calculate factor results
  const factorResults = useMemo<FactorResult[]>(() => {
    const results: FactorResult[] = []
    const interpretacao = testTemplate.interpretacao

    for (const [key, factorDef] of Object.entries(BFP_FACTORS)) {
      // Get factor score and percentile
      const score = pontuacaoBruta.secoes?.[key] || pontuacaoBruta.secoes?.[key.toLowerCase()] || 0
      let percentil = pontuacaoBruta.secoes?.[`${key}_percentil`] || 50

      // Try to get from interpretacao
      if (interpretacao?.percentis?.[key]) {
        percentil = interpretacao.percentis[key] || percentil
      }

      const classificacao = getClassificationFromPercentil(percentil)

      // Get subfactors
      const subfatores: SubfatorResult[] = []
      for (const [subKey, subNome] of Object.entries(factorDef.subfatores)) {
        const subScore = pontuacaoBruta.secoes?.[subKey] || pontuacaoBruta.secoes?.[subKey.toLowerCase()] || 0
        let subPercentil = pontuacaoBruta.secoes?.[`${subKey}_percentil`] || 50

        if (interpretacao?.percentis?.[subKey]) {
          subPercentil = interpretacao.percentis[subKey] || subPercentil
        }

        subfatores.push({
          key: subKey,
          nome: subNome,
          score: subScore,
          percentil: subPercentil,
          classificacao: getClassificationFromPercentil(subPercentil)
        })
      }

      results.push({
        key,
        nome: factorDef.nome,
        nomeCompleto: factorDef.nomeCompleto,
        score,
        percentil,
        classificacao,
        subfatores
      })
    }

    return results
  }, [testTemplate, pontuacaoBruta])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Bateria Fatorial de Personalidade (BFP)</h1>
        <p className="text-violet-100">Modelo dos Cinco Grandes Fatores de Personalidade</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <p className="text-sm text-gray-600">Sexo</p>
            <p className="font-medium text-gray-900">
              {patientInfo.sexo === 'M' ? 'Masculino' : 'Feminino'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Escolaridade</p>
            <p className="font-medium text-gray-900">{patientInfo.escolaridade_anos} anos</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Data de Conclusão</p>
            <p className="font-medium text-gray-900">
              {new Date(dataConlusao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Factor Summary */}
      <FactorSummary factors={factorResults} />

      {/* Detailed Factor Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados Detalhados por Fator</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {factorResults.map((factor) => (
            <FactorCard key={factor.key} factor={factor} />
          ))}
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Interpretação dos Fatores</h2>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <strong className="text-indigo-700">Neuroticismo (N):</strong>
            <span className="ml-1">Reflete a instabilidade emocional e vulnerabilidade. Escores altos indicam maior propensão a experienciar emoções negativas.</span>
          </div>
          <div>
            <strong className="text-emerald-700">Extroversão (E):</strong>
            <span className="ml-1">Mede a quantidade e intensidade das interações sociais. Escores altos indicam pessoas mais sociáveis e assertivas.</span>
          </div>
          <div>
            <strong className="text-amber-700">Socialização (S):</strong>
            <span className="ml-1">Avalia a qualidade das relações interpessoais. Escores altos indicam pessoas mais altruístas e cooperativas.</span>
          </div>
          <div>
            <strong className="text-rose-700">Realização (R):</strong>
            <span className="ml-1">Reflete organização, persistência e motivação. Escores altos indicam pessoas mais disciplinadas e focadas em objetivos.</span>
          </div>
          <div>
            <strong className="text-cyan-700">Abertura (A):</strong>
            <span className="ml-1">Mede receptividade a novas experiências e ideias. Escores altos indicam pessoas mais criativas e curiosas.</span>
          </div>
        </div>
      </div>

      {/* Professional Disclaimer */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Aviso Profissional</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Este relatório foi gerado automaticamente e deve ser interpretado por um psicólogo qualificado.
          A BFP é um instrumento de avaliação de personalidade baseado no modelo dos Cinco Grandes Fatores.
          Os resultados devem ser considerados em conjunto com entrevistas clínicas e outras fontes de informação.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Relatório
        </button>
      </div>
    </div>
  )
}
