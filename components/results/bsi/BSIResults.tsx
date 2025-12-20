'use client'

import { useMemo } from 'react'

// ===================================
// TYPES
// ===================================

interface BSIResultsProps {
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

interface DimensionResult {
  key: string
  nome: string
  abrev: string
  score: number
  tScore: number
  classificacao: string
}

interface GlobalIndex {
  key: string
  nome: string
  value: number
  tScore: number
}

// ===================================
// CONSTANTS
// ===================================

const BSI_DIMENSIONS: Record<string, { nome: string; abrev: string; descricao: string }> = {
  somatizacao: { nome: 'Somatização', abrev: 'SOM', descricao: 'Mal-estar proveniente da percepção de disfunção corporal' },
  obsessao_compulsao: { nome: 'Obsessão-Compulsão', abrev: 'O-C', descricao: 'Pensamentos e comportamentos repetitivos e indesejados' },
  sensibilidade_interpessoal: { nome: 'Sensibilidade Interpessoal', abrev: 'SI', descricao: 'Sentimentos de inadequação e inferioridade nas relações' },
  depressao: { nome: 'Depressão', abrev: 'DEP', descricao: 'Sintomas de humor depressivo e desesperança' },
  ansiedade: { nome: 'Ansiedade', abrev: 'ANS', descricao: 'Nervosismo, tensão e ataques de pânico' },
  hostilidade: { nome: 'Hostilidade', abrev: 'HOS', descricao: 'Pensamentos, sentimentos e ações de raiva' },
  ansiedade_fobica: { nome: 'Ansiedade Fóbica', abrev: 'FOB', descricao: 'Medo persistente e desproporcional' },
  ideacao_paranoide: { nome: 'Ideação Paranóide', abrev: 'PAR', descricao: 'Desconfiança, hostilidade e pensamentos de referência' },
  psicoticismo: { nome: 'Psicoticismo', abrev: 'PSI', descricao: 'Isolamento, estilo de vida esquizóide' }
}

const T_SCORE_CLASSIFICATIONS = [
  { key: 'normal', nome: 'Normal', min: 0, max: 59, color: 'bg-green-100 border-green-500 text-green-900' },
  { key: 'leve', nome: 'Leve', min: 60, max: 64, color: 'bg-yellow-100 border-yellow-500 text-yellow-900' },
  { key: 'moderado', nome: 'Moderado', min: 65, max: 69, color: 'bg-orange-100 border-orange-500 text-orange-900' },
  { key: 'grave', nome: 'Grave', min: 70, max: 100, color: 'bg-red-100 border-red-500 text-red-900' }
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

function getClassificationFromTScore(tScore: number): { nome: string; color: string } {
  for (const c of T_SCORE_CLASSIFICATIONS) {
    if (tScore >= c.min && tScore <= c.max) {
      return { nome: c.nome, color: c.color }
    }
  }
  return { nome: 'Normal', color: 'bg-green-100 border-green-500 text-green-900' }
}

function getBarColor(tScore: number): string {
  if (tScore < 60) return 'bg-green-500'
  if (tScore < 65) return 'bg-yellow-500'
  if (tScore < 70) return 'bg-orange-500'
  return 'bg-red-500'
}

function getPatientType(idade: number, sexo: string, isPatient: boolean = false): string {
  const gender = sexo === 'M' ? 'Homem' : 'Mulher'
  const ageGroup = idade < 18 ? 'Adolescente' : 'Adulto'
  const patientStatus = isPatient ? 'Paciente' : 'Não-Paciente'
  return `${ageGroup} ${gender} ${patientStatus}`
}

// ===================================
// DIMENSION CARD COMPONENT
// ===================================

function DimensionCard({ result }: { result: DimensionResult }) {
  const dimDef = BSI_DIMENSIONS[result.key]
  const { color } = getClassificationFromTScore(result.tScore)
  const barColor = getBarColor(result.tScore)

  // Normalize T-Score for display (range 30-80)
  const barWidth = Math.max(0, Math.min(100, ((result.tScore - 30) / 50) * 100))

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{dimDef?.nome || result.nome}</h4>
          <span className="text-xs text-gray-500">({dimDef?.abrev})</span>
        </div>
        <span className="text-xl font-bold text-gray-900">T={result.tScore}</span>
      </div>

      <p className="text-xs text-gray-600 mb-3">{dimDef?.descricao}</p>

      {/* T-Score Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>30</span>
          <span className="text-red-500">|60|</span>
          <span>80</span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Clinical cutoff marker */}
          <div className="absolute top-0 h-full w-0.5 bg-red-400" style={{ left: '60%' }} />
          {/* Score bar */}
          <div
            className={`h-full ${barColor} transition-all duration-500`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Classification */}
      <div className={`p-2 rounded border-l-4 ${color}`}>
        <span className="text-sm font-medium">{result.classificacao}</span>
      </div>
    </div>
  )
}

// ===================================
// GLOBAL INDICES COMPONENT
// ===================================

function GlobalIndices({ indices }: { indices: GlobalIndex[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Índices Globais</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indices.map((index) => {
          const { color } = getClassificationFromTScore(index.tScore)
          const barColor = getBarColor(index.tScore)
          return (
            <div key={index.key} className={`rounded-lg border-2 p-4 ${color.replace('border-', 'border-')}`}>
              <h3 className="font-medium text-gray-900 mb-2">{index.nome}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{index.value.toFixed(2)}</span>
                <span className="text-lg font-medium text-gray-600">T={index.tScore}</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(100, ((index.tScore - 30) / 50) * 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ===================================
// PROFILE CHART
// ===================================

function ProfileChart({ results }: { results: DimensionResult[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil Sintomático</h2>
      <div className="space-y-3">
        {results.map((result) => {
          const barColor = getBarColor(result.tScore)
          const barWidth = Math.max(0, Math.min(100, ((result.tScore - 30) / 50) * 100))
          return (
            <div key={result.key} className="flex items-center gap-3">
              <div className="w-8 text-xs font-medium text-gray-600">{result.abrev}</div>
              <div className="flex-1 relative">
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                  {/* Reference zones */}
                  <div className="absolute inset-0 flex">
                    <div className="w-[60%] bg-green-100" />
                    <div className="w-[10%] bg-yellow-100" />
                    <div className="w-[10%] bg-orange-100" />
                    <div className="w-[20%] bg-red-100" />
                  </div>
                  {/* Score bar */}
                  <div
                    className={`absolute top-0 h-full ${barColor} rounded-r-full transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                {/* Clinical cutoff line */}
                <div className="absolute top-0 h-full w-0.5 bg-red-600" style={{ left: '60%' }} />
              </div>
              <div className="w-12 text-sm font-bold text-gray-900 text-right">{result.tScore}</div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-600">Classificação:</span>
        {T_SCORE_CLASSIFICATIONS.map((c) => (
          <div key={c.key} className={`px-2 py-1 rounded text-xs font-medium ${c.color}`}>
            {c.nome} (T≥{c.min})
          </div>
        ))}
      </div>
    </div>
  )
}

// ===================================
// MAIN COMPONENT
// ===================================

export default function BSIResults({
  testTemplate,
  pontuacaoBruta,
  patientInfo,
  dataConlusao
}: BSIResultsProps) {
  const idade = calculateAge(patientInfo.data_nascimento)
  const patientType = getPatientType(idade, patientInfo.sexo)

  // Calculate dimension results
  const dimensionResults = useMemo<DimensionResult[]>(() => {
    const results: DimensionResult[] = []
    const interpretacao = testTemplate.interpretacao

    for (const [key, dimDef] of Object.entries(BSI_DIMENSIONS)) {
      const score = pontuacaoBruta.secoes?.[key] || 0
      let tScore = pontuacaoBruta.secoes?.[`${key}_t`] || 50

      // Try to get from interpretacao
      if (interpretacao?.t_scores?.[key]) {
        tScore = interpretacao.t_scores[key] || tScore
      }

      const { nome: classificacao } = getClassificationFromTScore(tScore)

      results.push({
        key,
        nome: dimDef.nome,
        abrev: dimDef.abrev,
        score,
        tScore,
        classificacao
      })
    }

    return results
  }, [testTemplate, pontuacaoBruta])

  // Calculate global indices
  const globalIndices = useMemo<GlobalIndex[]>(() => {
    const interpretacao = testTemplate.interpretacao

    const gsiValue = pontuacaoBruta.secoes?.gsi || pontuacaoBruta.total / 53 || 0
    const pstValue = pontuacaoBruta.secoes?.pst || 0
    const psdiValue = pontuacaoBruta.secoes?.psdi || 0

    return [
      {
        key: 'gsi',
        nome: 'GSI (Índice de Gravidade Global)',
        value: gsiValue,
        tScore: interpretacao?.t_scores?.gsi || Math.round(50 + gsiValue * 20)
      },
      {
        key: 'pst',
        nome: 'PST (Total de Sintomas Positivos)',
        value: pstValue,
        tScore: interpretacao?.t_scores?.pst || Math.round(50 + pstValue / 53 * 20)
      },
      {
        key: 'psdi',
        nome: 'PSDI (Índice de Distúrbio de Sintomas)',
        value: psdiValue,
        tScore: interpretacao?.t_scores?.psdi || Math.round(50 + psdiValue * 10)
      }
    ]
  }, [testTemplate, pontuacaoBruta])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">BSI - Brief Symptom Inventory</h1>
        <p className="text-rose-100">Inventário Breve de Sintomas</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <p className="text-sm text-gray-600">Norma Utilizada</p>
            <p className="font-medium text-rose-700">{patientType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Data de Conclusão</p>
            <p className="font-medium text-gray-900">
              {new Date(dataConlusao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Global Indices */}
      <GlobalIndices indices={globalIndices} />

      {/* Profile Chart */}
      <ProfileChart results={dimensionResults} />

      {/* Detailed Dimension Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados por Dimensão</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensionResults.map((result) => (
            <DimensionCard key={result.key} result={result} />
          ))}
        </div>
      </div>

      {/* Interpretation Note */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Interpretação</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>Escore T ≥ 63:</strong> Indica sintomatologia clinicamente significativa que merece atenção.
          </p>
          <p>
            <strong>GSI (Índice de Gravidade Global):</strong> Melhor indicador único do nível atual de sofrimento.
            Combina informação sobre número de sintomas e intensidade.
          </p>
          <p>
            <strong>PST (Total de Sintomas Positivos):</strong> Conta o número de sintomas reportados.
            Reflete a amplitude da sintomatologia.
          </p>
          <p>
            <strong>PSDI (Índice de Distúrbio de Sintomas):</strong> Mede o estilo de resposta.
            Indica se o paciente tende a exagerar ou minimizar sintomas.
          </p>
        </div>
      </div>

      {/* Professional Disclaimer */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Aviso Profissional</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Este relatório foi gerado automaticamente e deve ser interpretado por um profissional de saúde mental qualificado.
          O BSI é um instrumento de rastreamento e não substitui uma avaliação clínica completa.
          Os resultados devem ser considerados em conjunto com entrevistas clínicas, história do paciente e observações comportamentais.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
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
