'use client'

import { useMemo } from 'react'

// ===================================
// TYPES
// ===================================

interface IDADIResultsProps {
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

interface DomainResult {
  key: string
  nome: string
  pontuacaoBruta: number
  escoreDesenvolvimental: number
  intervaloInferior: number
  intervaloSuperior: number
  classificacao: string
}

// ===================================
// CONSTANTS
// ===================================

const IDADI_DOMAINS: Record<string, { nome: string; abrev: string; color: string }> = {
  cognitivo: { nome: 'Cognitivo', abrev: 'COG', color: 'blue' },
  socioemocional: { nome: 'Socioemocional', abrev: 'SE', color: 'pink' },
  comunicacao_receptiva: { nome: 'Comunicação e Linguagem Receptiva', abrev: 'CLR', color: 'purple' },
  comunicacao_expressiva: { nome: 'Comunicação e Linguagem Expressiva', abrev: 'CLE', color: 'violet' },
  motricidade_ampla: { nome: 'Motricidade Ampla', abrev: 'MA', color: 'green' },
  motricidade_fina: { nome: 'Motricidade Fina', abrev: 'MF', color: 'emerald' },
  comportamento_adaptativo: { nome: 'Comportamento Adaptativo', abrev: 'CA', color: 'amber' }
}

const CLASSIFICACOES = [
  { key: 'muito_alto', nome: 'Muito Alto', min: 130, max: 200, color: 'bg-green-100 border-green-500 text-green-900' },
  { key: 'alto', nome: 'Alto', min: 115, max: 129, color: 'bg-emerald-100 border-emerald-500 text-emerald-900' },
  { key: 'medio', nome: 'Médio', min: 85, max: 114, color: 'bg-blue-100 border-blue-500 text-blue-900' },
  { key: 'baixo', nome: 'Baixo', min: 70, max: 84, color: 'bg-orange-100 border-orange-500 text-orange-900' },
  { key: 'muito_baixo', nome: 'Muito Baixo', min: 0, max: 69, color: 'bg-red-100 border-red-500 text-red-900' }
]

// ===================================
// HELPER FUNCTIONS
// ===================================

function calculateAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
  return months
}

function formatAgeInMonths(months: number): string {
  if (months < 12) return `${months} meses`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years} ano${years > 1 ? 's' : ''}`
  return `${years} ano${years > 1 ? 's' : ''} e ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`
}

function getClassificationFromScore(score: number): { nome: string; color: string } {
  for (const c of CLASSIFICACOES) {
    if (score >= c.min && score <= c.max) {
      return { nome: c.nome, color: c.color }
    }
  }
  return { nome: 'Médio', color: 'bg-blue-100 border-blue-500 text-blue-900' }
}

function getDomainColors(color: string): { bg: string; border: string; text: string; barBg: string } {
  const colors: Record<string, { bg: string; border: string; text: string; barBg: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800', barBg: 'bg-blue-500' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-800', barBg: 'bg-pink-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-800', barBg: 'bg-purple-500' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-400', text: 'text-violet-800', barBg: 'bg-violet-500' },
    green: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', barBg: 'bg-green-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', barBg: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-800', barBg: 'bg-amber-500' }
  }
  return colors[color] || colors.blue
}

// ===================================
// DOMAIN CARD COMPONENT
// ===================================

function DomainCard({ result }: { result: DomainResult }) {
  const domainDef = IDADI_DOMAINS[result.key]
  const colors = getDomainColors(domainDef?.color || 'blue')
  const classInfo = getClassificationFromScore(result.escoreDesenvolvimental)

  // Calculate bar position (score normalized to 0-200 scale, centered at 100)
  const barPosition = Math.max(0, Math.min(100, ((result.escoreDesenvolvimental - 40) / 120) * 100))
  const ciLeft = Math.max(0, Math.min(100, ((result.intervaloInferior - 40) / 120) * 100))
  const ciRight = Math.max(0, Math.min(100, ((result.intervaloSuperior - 40) / 120) * 100))

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className={`font-semibold ${colors.text}`}>{result.nome}</h4>
          <span className={`text-sm ${colors.text} opacity-75`}>({domainDef?.abrev})</span>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${colors.text}`}>{result.escoreDesenvolvimental}</p>
          <p className="text-xs text-gray-500">Escore</p>
        </div>
      </div>

      {/* Score Visualization with Confidence Interval */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>40</span>
          <span>100</span>
          <span>160</span>
        </div>
        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
          {/* Background zones */}
          <div className="absolute inset-0 flex">
            <div className="w-[25%] bg-red-200" />
            <div className="w-[12.5%] bg-orange-200" />
            <div className="w-[25%] bg-blue-100" />
            <div className="w-[12.5%] bg-emerald-200" />
            <div className="w-[25%] bg-green-200" />
          </div>

          {/* Confidence Interval */}
          <div
            className="absolute h-full bg-gray-400 opacity-40"
            style={{ left: `${ciLeft}%`, width: `${ciRight - ciLeft}%` }}
          />

          {/* Score marker */}
          <div
            className={`absolute top-0 h-full w-1 ${colors.barBg}`}
            style={{ left: `${barPosition}%` }}
          >
            <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 ${colors.barBg} rounded-full border-2 border-white shadow`} />
          </div>
        </div>

        {/* Confidence Interval Text */}
        <div className="text-xs text-gray-600 mt-1 text-center">
          IC 95%: {result.intervaloInferior} - {result.intervaloSuperior}
        </div>
      </div>

      {/* Raw Score */}
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">Pontuação Bruta:</span>
        <span className="font-medium text-gray-900">{result.pontuacaoBruta}</span>
      </div>

      {/* Classification */}
      <div className={`p-2 rounded border-l-4 ${classInfo.color}`}>
        <span className="text-sm font-medium">{classInfo.nome}</span>
      </div>
    </div>
  )
}

// ===================================
// SUMMARY TABLE
// ===================================

function SummaryTable({ results }: { results: DomainResult[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo dos Domínios</h2>
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Domínio</th>
            <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">PB</th>
            <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Escore</th>
            <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">IC 95%</th>
            <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Classificação</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => {
            const classInfo = getClassificationFromScore(result.escoreDesenvolvimental)
            const domainDef = IDADI_DOMAINS[result.key]
            const colors = getDomainColors(domainDef?.color || 'blue')
            return (
              <tr key={result.key} className="border-b border-gray-100">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors.barBg}`} />
                    <span className="text-sm text-gray-900">{domainDef?.abrev || result.key}</span>
                    <span className="text-sm text-gray-500 hidden md:inline">- {result.nome}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center text-sm text-gray-700">{result.pontuacaoBruta}</td>
                <td className="py-3 px-3 text-center">
                  <span className="text-lg font-bold text-gray-900">{result.escoreDesenvolvimental}</span>
                </td>
                <td className="py-3 px-3 text-center text-sm text-gray-600">
                  {result.intervaloInferior} - {result.intervaloSuperior}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${classInfo.color}`}>
                    {classInfo.nome}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ===================================
// MAIN COMPONENT
// ===================================

export default function IDADIResults({
  testTemplate,
  pontuacaoBruta,
  patientInfo,
  dataConlusao
}: IDADIResultsProps) {
  const ageInMonths = calculateAgeInMonths(patientInfo.data_nascimento)
  const ageFormatted = formatAgeInMonths(ageInMonths)

  // Determine version based on age
  const version = ageInMonths <= 35 ? '4 a 35 meses' : '36 a 72 meses'

  // Calculate domain results
  const domainResults = useMemo<DomainResult[]>(() => {
    const results: DomainResult[] = []
    const interpretacao = testTemplate.interpretacao

    for (const [key, domainDef] of Object.entries(IDADI_DOMAINS)) {
      const pontuacao = pontuacaoBruta.secoes?.[key] || 0
      const escoreKey = `${key}_escore`
      const icInfKey = `${key}_ic_inf`
      const icSupKey = `${key}_ic_sup`

      // Get scores from secoes or calculate defaults
      let escoreDesenvolvimental = pontuacaoBruta.secoes?.[escoreKey] || 100
      let intervaloInferior = pontuacaoBruta.secoes?.[icInfKey] || escoreDesenvolvimental - 10
      let intervaloSuperior = pontuacaoBruta.secoes?.[icSupKey] || escoreDesenvolvimental + 10

      // Try to get from interpretacao
      if (interpretacao?.escores?.[key]) {
        const escoreData = interpretacao.escores[key]
        escoreDesenvolvimental = escoreData.escore || escoreDesenvolvimental
        intervaloInferior = escoreData.ic_inferior || intervaloInferior
        intervaloSuperior = escoreData.ic_superior || intervaloSuperior
      }

      const { nome: classificacao } = getClassificationFromScore(escoreDesenvolvimental)

      results.push({
        key,
        nome: domainDef.nome,
        pontuacaoBruta: pontuacao,
        escoreDesenvolvimental,
        intervaloInferior,
        intervaloSuperior,
        classificacao
      })
    }

    return results
  }, [testTemplate, pontuacaoBruta])

  // Calculate global score
  const globalScore = useMemo(() => {
    const scores = domainResults.map(r => r.escoreDesenvolvimental)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [domainResults])

  const globalClassification = getClassificationFromScore(globalScore)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">IDADI - Inventário Dimensional de Avaliação do Desenvolvimento Infantil</h1>
        <p className="text-teal-100">Versão: {version}</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Informações da Criança
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nome Completo</p>
            <p className="font-medium text-gray-900">{patientInfo.nome_completo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Idade</p>
            <p className="font-medium text-teal-700">{ageFormatted} ({ageInMonths} meses)</p>
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
          <div>
            <p className="text-sm text-gray-600">Respondente</p>
            <p className="font-medium text-gray-900">Cuidador/Responsável</p>
          </div>
        </div>
      </div>

      {/* Global Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Escore Global de Desenvolvimento</h2>
        <div className="flex items-center gap-6">
          <div className="bg-teal-50 border-l-4 border-teal-600 p-4 rounded flex-1">
            <p className="text-4xl font-bold text-teal-900">{globalScore}</p>
            <p className="text-sm text-teal-700 mt-1">Escore Médio</p>
          </div>
          <div className={`p-4 rounded border-l-4 flex-1 ${globalClassification.color}`}>
            <p className="text-lg font-bold">{globalClassification.nome}</p>
            <p className="text-sm opacity-80 mt-1">Classificação Geral</p>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <SummaryTable results={domainResults} />

      {/* Detailed Domain Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados Detalhados por Domínio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domainResults.map((result) => (
            <DomainCard key={result.key} result={result} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Legenda de Classificações</h2>
        <div className="flex flex-wrap gap-3">
          {CLASSIFICACOES.map((c) => (
            <div key={c.key} className={`px-4 py-2 rounded ${c.color}`}>
              <span className="font-medium">{c.nome}</span>
              <span className="ml-2 text-sm opacity-75">({c.min}-{c.max})</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          <strong>IC 95%:</strong> Intervalo de confiança de 95% - indica a faixa onde o verdadeiro escore provavelmente se encontra.
        </p>
      </div>

      {/* Professional Disclaimer */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Aviso Profissional</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Este relatório foi gerado automaticamente e deve ser interpretado por um profissional qualificado
          (psicólogo, pediatra do desenvolvimento, etc.). O IDADI é um instrumento de avaliação do desenvolvimento
          infantil e os resultados devem ser considerados em conjunto com observações clínicas, histórico da criança
          e outras avaliações complementares.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
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
