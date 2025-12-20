'use client'

import { useMemo } from 'react'

// ===================================
// TYPES
// ===================================

interface BDEFSResultsProps {
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

interface SectionResult {
  key: string
  nome: string
  score: number
  percentil: number
  classificacao: string
}

// ===================================
// CONSTANTS
// ===================================

const BDEFS_SECTIONS: Record<string, string> = {
  gerenciamento_tempo: 'Gerenciamento de Tempo',
  organizacao: 'Organização e Resolução de Problemas',
  autocontrole: 'Autocontrole',
  motivacao: 'Motivação',
  regulacao_emocional: 'Regulação Emocional'
}

const CLASSIFICACOES = [
  { key: 'sem_significancia', nome: 'Sem Significância Clínica', min: 0, max: 82, color: 'bg-green-100 border-green-500 text-green-900' },
  { key: 'minima', nome: 'Significância Clínica Mínima', min: 83, max: 92, color: 'bg-yellow-100 border-yellow-500 text-yellow-900' },
  { key: 'limitrofe', nome: 'Limítrofe', min: 93, max: 97, color: 'bg-orange-100 border-orange-500 text-orange-900' },
  { key: 'leve', nome: 'Deficiência Leve', min: 98, max: 98, color: 'bg-red-100 border-red-500 text-red-900' },
  { key: 'moderada', nome: 'Deficiência Moderada', min: 99, max: 99, color: 'bg-red-200 border-red-600 text-red-900' },
  { key: 'severa', nome: 'Deficiência Severa', min: 100, max: 100, color: 'bg-red-300 border-red-700 text-red-900' }
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

function getClassificationFromPercentil(percentil: number): { nome: string; color: string } {
  for (const c of CLASSIFICACOES) {
    if (percentil >= c.min && percentil <= c.max) {
      return { nome: c.nome, color: c.color }
    }
  }
  return { nome: 'Não classificado', color: 'bg-gray-100 border-gray-500 text-gray-900' }
}

function getBarColor(percentil: number): string {
  if (percentil <= 82) return 'bg-green-500'
  if (percentil <= 92) return 'bg-yellow-500'
  if (percentil <= 97) return 'bg-orange-500'
  return 'bg-red-500'
}

function getEducationLevel(years: number): string {
  if (years >= 16) return 'Pós-Graduação'
  if (years >= 12) return 'Ensino Superior'
  if (years >= 9) return 'Ensino Médio'
  return 'Ensino Fundamental'
}

// ===================================
// SECTION CARD COMPONENT
// ===================================

function SectionCard({ result }: { result: SectionResult }) {
  const { nome, color } = getClassificationFromPercentil(result.percentil)
  const barColor = getBarColor(result.percentil)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-900">{result.nome}</h4>
        <span className="text-2xl font-bold text-gray-900">{result.score}</span>
      </div>

      {/* Percentile bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0</span>
          <span>Percentil: {result.percentil}</span>
          <span>100</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-500`}
            style={{ width: `${result.percentil}%` }}
          />
        </div>
      </div>

      {/* Classification */}
      <div className={`p-2 rounded border-l-4 ${color}`}>
        <span className="text-sm font-medium">{nome}</span>
      </div>
    </div>
  )
}

// ===================================
// SUMMARY CHART
// ===================================

function SummaryChart({ results }: { results: SectionResult[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo Visual</h2>
      <div className="space-y-4">
        {results.map((result) => {
          const barColor = getBarColor(result.percentil)
          return (
            <div key={result.key} className="flex items-center gap-4">
              <div className="w-40 text-sm text-gray-700 truncate">{result.nome}</div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${result.percentil}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
                    P{result.percentil}
                  </span>
                </div>
              </div>
              <div className="w-16 text-right font-bold text-gray-900">{result.score}</div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda</h3>
        <div className="flex flex-wrap gap-3">
          {CLASSIFICACOES.slice(0, 4).map((c) => (
            <div key={c.key} className={`px-3 py-1 rounded-full text-xs font-medium ${c.color}`}>
              {c.nome}
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

export default function BDEFSResults({
  testTemplate,
  pontuacaoBruta,
  patientInfo,
  dataConlusao
}: BDEFSResultsProps) {
  const idade = calculateAge(patientInfo.data_nascimento)
  const educationLevel = getEducationLevel(patientInfo.escolaridade_anos)

  // Calculate section results
  const sectionResults = useMemo<SectionResult[]>(() => {
    const results: SectionResult[] = []
    const interpretacao = testTemplate.interpretacao

    for (const [key, nome] of Object.entries(BDEFS_SECTIONS)) {
      const score = pontuacaoBruta.secoes?.[key] || 0

      // Get percentile from interpretacao or calculate based on score
      let percentil = 50
      if (interpretacao?.percentis?.[key]) {
        percentil = interpretacao.percentis[key][score] || 50
      } else {
        // Fallback calculation (simplified)
        percentil = Math.min(99, Math.round((score / 100) * 100))
      }

      const { nome: classificacao } = getClassificationFromPercentil(percentil)

      results.push({
        key,
        nome: nome as string,
        score,
        percentil,
        classificacao
      })
    }

    return results
  }, [testTemplate, pontuacaoBruta])

  // Calculate total
  const totalScore = pontuacaoBruta.total || sectionResults.reduce((sum, r) => sum + r.score, 0)
  const totalPercentil = useMemo(() => {
    const interpretacao = testTemplate.interpretacao
    if (interpretacao?.percentis?.total?.[totalScore]) {
      return interpretacao.percentis.total[totalScore]
    }
    return Math.min(99, Math.round((totalScore / 500) * 100))
  }, [testTemplate, totalScore])

  const totalClassification = getClassificationFromPercentil(totalPercentil)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{testTemplate.nome}</h1>
        <p className="text-indigo-100">Escala de Avaliação de Funções Executivas</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <p className="text-sm text-gray-600">Escolaridade</p>
            <p className="font-medium text-indigo-700">{educationLevel}</p>
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

      {/* Total Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultado Total</h2>
        <div className="flex items-center gap-6">
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded flex-1">
            <p className="text-4xl font-bold text-indigo-900">{totalScore}</p>
            <p className="text-sm text-indigo-700 mt-1">Pontuação Total</p>
          </div>
          <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded flex-1">
            <p className="text-4xl font-bold text-purple-900">{totalPercentil}</p>
            <p className="text-sm text-purple-700 mt-1">Percentil</p>
          </div>
          <div className={`p-4 rounded border-l-4 flex-1 ${totalClassification.color}`}>
            <p className="text-lg font-bold">{totalClassification.nome}</p>
            <p className="text-sm opacity-80 mt-1">Classificação Geral</p>
          </div>
        </div>
      </div>

      {/* Visual Summary */}
      <SummaryChart results={sectionResults} />

      {/* Detailed Section Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados por Domínio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionResults.map((result) => (
            <SectionCard key={result.key} result={result} />
          ))}
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Interpretação dos Domínios</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-indigo-800">Gerenciamento de Tempo:</strong>
              <span className="ml-1">Avalia a capacidade de administrar o tempo, cumprir prazos e organizar atividades.</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-purple-800">Organização e Resolução de Problemas:</strong>
              <span className="ml-1">Mede habilidades de planejamento, organização e resolução de problemas do dia a dia.</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-blue-800">Autocontrole:</strong>
              <span className="ml-1">Avalia a capacidade de controlar impulsos e comportamentos.</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-teal-800">Motivação:</strong>
              <span className="ml-1">Mede a iniciativa, persistência e motivação para completar tarefas.</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />
            <div>
              <strong className="text-pink-800">Regulação Emocional:</strong>
              <span className="ml-1">Avalia a capacidade de gerenciar emoções e reações emocionais.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Disclaimer */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Aviso Profissional</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Este relatório foi gerado automaticamente e deve ser interpretado por um profissional qualificado.
          Os resultados devem ser considerados em conjunto com outras informações clínicas, histórico do paciente
          e observações comportamentais. O BDEFS é uma ferramenta de triagem e não substitui uma avaliação
          neuropsicológica completa.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
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
