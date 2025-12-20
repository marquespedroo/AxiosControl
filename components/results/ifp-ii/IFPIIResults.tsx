'use client'

import { useMemo } from 'react'

// ===================================
// TYPES
// ===================================

interface IFPIIResultsProps {
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

interface ScaleResult {
  key: string
  nome: string
  score: number
  percentil: number
  classificacao: string
}

// ===================================
// CONSTANTS
// ===================================

const IFP_SCALES: Record<string, { nome: string; descricao: string }> = {
  assistencia: { nome: 'Assistência', descricao: 'Tendência a ajudar outros' },
  intracepcao: { nome: 'Intracepção', descricao: 'Interesse por sentimentos e motivações' },
  afago: { nome: 'Afago', descricao: 'Necessidade de apoio e atenção' },
  deferencia: { nome: 'Deferência', descricao: 'Respeito por autoridades e tradições' },
  afiliacao: { nome: 'Afiliação', descricao: 'Necessidade de pertencer a grupos' },
  dominancia: { nome: 'Dominância', descricao: 'Tendência a liderar e influenciar' },
  desempenho: { nome: 'Desempenho', descricao: 'Busca por excelência e sucesso' },
  exibicao: { nome: 'Exibição', descricao: 'Desejo de ser o centro das atenções' },
  agressividade: { nome: 'Agressividade', descricao: 'Expressão de hostilidade e crítica' },
  ordem: { nome: 'Ordem', descricao: 'Necessidade de organização e planejamento' },
  persistencia: { nome: 'Persistência', descricao: 'Tendência a completar tarefas' },
  mudanca: { nome: 'Mudança', descricao: 'Busca por novidade e variedade' },
  autonomia: { nome: 'Autonomia', descricao: 'Independência e autoconfiança' },
  heterossexualidade: { nome: 'Heterossexualidade', descricao: 'Interesse em relacionamentos românticos' }
}

const CLASSIFICACOES = [
  { key: 'muito_baixo', nome: 'Muito Baixo', min: 0, max: 15, color: 'bg-blue-100 border-blue-500 text-blue-900' },
  { key: 'baixo', nome: 'Baixo', min: 16, max: 30, color: 'bg-cyan-100 border-cyan-500 text-cyan-900' },
  { key: 'medio', nome: 'Médio', min: 31, max: 70, color: 'bg-green-100 border-green-500 text-green-900' },
  { key: 'alto', nome: 'Alto', min: 71, max: 85, color: 'bg-orange-100 border-orange-500 text-orange-900' },
  { key: 'muito_alto', nome: 'Muito Alto', min: 86, max: 100, color: 'bg-red-100 border-red-500 text-red-900' }
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
  return { nome: 'Médio', color: 'bg-green-100 border-green-500 text-green-900' }
}

function getBarColor(percentil: number): string {
  if (percentil <= 15) return 'bg-blue-500'
  if (percentil <= 30) return 'bg-cyan-500'
  if (percentil <= 70) return 'bg-green-500'
  if (percentil <= 85) return 'bg-orange-500'
  return 'bg-red-500'
}

// ===================================
// SCALE ROW COMPONENT
// ===================================

function ScaleRow({ result }: { result: ScaleResult }) {
  const scaleDef = IFP_SCALES[result.key]
  const { color } = getClassificationFromPercentil(result.percentil)
  const barColor = getBarColor(result.percentil)

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{scaleDef?.nome || result.nome}</p>
          <p className="text-xs text-gray-500">{scaleDef?.descricao}</p>
        </div>
      </td>
      <td className="py-3 px-3 text-center">
        <span className="text-lg font-bold text-gray-900">{result.score}</span>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${result.percentil}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 w-10 text-right">{result.percentil}</span>
        </div>
      </td>
      <td className="py-3 px-3 text-center">
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${color}`}>
          {result.classificacao}
        </span>
      </td>
    </tr>
  )
}

// ===================================
// PROFILE CHART
// ===================================

function ProfileChart({ results }: { results: ScaleResult[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil de Personalidade</h2>
      <div className="space-y-2">
        {results.map((result) => {
          const barColor = getBarColor(result.percentil)
          return (
            <div key={result.key} className="flex items-center gap-3">
              <div className="w-24 text-xs text-gray-700 truncate">{result.nome}</div>
              <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden relative">
                {/* Reference zones */}
                <div className="absolute inset-0 flex">
                  <div className="w-[15%] bg-blue-100 border-r border-blue-200" />
                  <div className="w-[15%] bg-cyan-100 border-r border-cyan-200" />
                  <div className="w-[40%] bg-green-100 border-r border-green-200" />
                  <div className="w-[15%] bg-orange-100 border-r border-orange-200" />
                  <div className="w-[15%] bg-red-100" />
                </div>
                {/* Score marker */}
                <div
                  className={`absolute top-0 h-full w-1.5 ${barColor} rounded`}
                  style={{ left: `calc(${result.percentil}% - 3px)` }}
                />
              </div>
              <div className="w-8 text-xs font-bold text-gray-900 text-right">{result.percentil}</div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
        {CLASSIFICACOES.map((c) => (
          <div key={c.key} className={`px-2 py-1 rounded text-xs font-medium ${c.color}`}>
            {c.nome}
          </div>
        ))}
      </div>
    </div>
  )
}

// ===================================
// MAIN COMPONENT
// ===================================

export default function IFPIIResults({
  testTemplate,
  pontuacaoBruta,
  patientInfo,
  dataConlusao
}: IFPIIResultsProps) {
  const idade = calculateAge(patientInfo.data_nascimento)

  // Calculate scale results
  const scaleResults = useMemo<ScaleResult[]>(() => {
    const results: ScaleResult[] = []
    const interpretacao = testTemplate.interpretacao

    for (const [key, scaleDef] of Object.entries(IFP_SCALES)) {
      const score = pontuacaoBruta.secoes?.[key] || 0
      let percentil = pontuacaoBruta.secoes?.[`${key}_percentil`] || 50

      // Try to get from interpretacao
      if (interpretacao?.percentis?.[key]) {
        percentil = interpretacao.percentis[key] || percentil
      }

      const { nome: classificacao } = getClassificationFromPercentil(percentil)

      results.push({
        key,
        nome: scaleDef.nome,
        score,
        percentil,
        classificacao
      })
    }

    return results
  }, [testTemplate, pontuacaoBruta])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">IFP-II - Inventário Fatorial de Personalidade</h1>
        <p className="text-amber-100">Avaliação de Necessidades e Motivos Psicológicos</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Profile Chart */}
      <ProfileChart results={scaleResults} />

      {/* Detailed Results Table */}
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados Detalhados</h2>
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Escala</th>
              <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Pontos</th>
              <th className="text-center py-2 px-3 text-sm font-medium text-gray-600 w-48">Percentil</th>
              <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Classificação</th>
            </tr>
          </thead>
          <tbody>
            {scaleResults.map((result) => (
              <ScaleRow key={result.key} result={result} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Interpretation Guide */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Interpretação das Escalas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p><strong className="text-amber-700">Assistência:</strong> Tendência a oferecer ajuda e apoio aos outros.</p>
            <p><strong className="text-amber-700">Intracepção:</strong> Interesse em analisar sentimentos e motivações.</p>
            <p><strong className="text-amber-700">Afago:</strong> Necessidade de receber apoio, afeto e atenção.</p>
            <p><strong className="text-amber-700">Deferência:</strong> Respeito por autoridades e normas sociais.</p>
            <p><strong className="text-amber-700">Afiliação:</strong> Desejo de pertencer e participar de grupos.</p>
            <p><strong className="text-amber-700">Dominância:</strong> Tendência a liderar e influenciar outros.</p>
            <p><strong className="text-amber-700">Desempenho:</strong> Busca por excelência e realização pessoal.</p>
          </div>
          <div className="space-y-2">
            <p><strong className="text-amber-700">Exibição:</strong> Desejo de atrair atenção e ser admirado.</p>
            <p><strong className="text-amber-700">Agressividade:</strong> Expressão de crítica, hostilidade ou raiva.</p>
            <p><strong className="text-amber-700">Ordem:</strong> Necessidade de organização e planejamento.</p>
            <p><strong className="text-amber-700">Persistência:</strong> Tendência a completar tarefas iniciadas.</p>
            <p><strong className="text-amber-700">Mudança:</strong> Busca por novidade e variedade.</p>
            <p><strong className="text-amber-700">Autonomia:</strong> Independência e resistência a influências.</p>
          </div>
        </div>
      </div>

      {/* Professional Disclaimer */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Aviso Profissional</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Este relatório foi gerado automaticamente e deve ser interpretado por um psicólogo qualificado.
          O IFP-II é um instrumento de avaliação de personalidade baseado na teoria de Murray. Os resultados
          devem ser considerados em conjunto com entrevistas clínicas e outras fontes de informação.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
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
