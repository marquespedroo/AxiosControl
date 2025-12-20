'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import AASPResults from '@/components/results/aasp/AASPResults'
import { BDEFSResults } from '@/components/results/bdefs'
import { BFPResults } from '@/components/results/bfp'
import { BSIResults } from '@/components/results/bsi'
import { IDADIResults } from '@/components/results/idadi'
import { IFPIIResults } from '@/components/results/ifp-ii'
import McmiIVResults from '@/components/results/mcmi-iv/McmiIVResults'
import { ChildSensoryProfileResults } from '@/components/results/sensory-profile'
import { PontuacaoBruta, Normalizacao, Questao } from '@/types/database'

interface ResultadoData {
  id: string
  status: string
  data_conclusao: string
  respostas: Record<string, any>
  pontuacao_bruta: PontuacaoBruta
  normalizacao: Normalizacao | null
  observacoes?: string
  teste_template: {
    nome: string
    sigla: string
    questoes?: Questao[]
    escalas_resposta?: Record<string, any>
    regras_calculo?: any
    interpretacao?: any
  }
  paciente: {
    nome_completo: string
    data_nascimento: string
    escolaridade_anos: number
    sexo: string
  }
}

export default function ResultadosPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [resultado, setResultado] = useState<ResultadoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  // Check if we're in "answers only" mode
  const modoRespostas = searchParams.get('modo') === 'respostas'

  useEffect(() => {
    const fetchResultado = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/api/testes-aplicados/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Resultado não encontrado')
        }

        const data = await response.json()
        setResultado(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResultado()
  }, [params.id])

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getClassificationColor = (classificacao: string) => {
    switch (classificacao) {
      case 'Muito Superior':
        return 'text-green-700 bg-green-100'
      case 'Superior':
        return 'text-green-600 bg-green-50'
      case 'Médio':
        return 'text-blue-600 bg-blue-50'
      case 'Inferior':
        return 'text-orange-600 bg-orange-50'
      case 'Muito Inferior':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getScoreInterpretation = () => {
    if (!resultado) return null

    const score = resultado.pontuacao_bruta.total
    const regrasCalculo = resultado.teste_template.regras_calculo
    const interpretacao = resultado.teste_template.interpretacao

    // Check if there are interpretation ranges in regras_calculo
    if (regrasCalculo?.interpretacao_ranges && Array.isArray(regrasCalculo.interpretacao_ranges)) {
      for (const range of regrasCalculo.interpretacao_ranges) {
        if (score >= range.min && score <= range.max) {
          return {
            nivel: range.nivel,
            descricao: range.descricao,
            color: getInterpretationColor(range.nivel)
          }
        }
      }
    }

    // Check interpretacao field
    if (interpretacao?.faixas && Array.isArray(interpretacao.faixas)) {
      for (const faixa of interpretacao.faixas) {
        if (score >= faixa.min && score <= faixa.max) {
          return {
            nivel: faixa.nivel,
            descricao: faixa.descricao,
            color: getInterpretationColor(faixa.nivel)
          }
        }
      }
    }

    return null
  }

  const getInterpretationColor = (nivel: string) => {
    const lowerNivel = nivel.toLowerCase()

    // For depression/anxiety tests (BDI-II, BHS, etc.) - higher = worse
    if (lowerNivel.includes('mínimo') || lowerNivel.includes('normal') || lowerNivel.includes('ausente')) {
      return 'bg-green-100 border-green-500 text-green-900'
    }
    if (lowerNivel.includes('leve') || lowerNivel.includes('mild')) {
      return 'bg-yellow-100 border-yellow-500 text-yellow-900'
    }
    if (lowerNivel.includes('moderado') || lowerNivel.includes('moderate')) {
      return 'bg-orange-100 border-orange-500 text-orange-900'
    }
    if (lowerNivel.includes('grave') || lowerNivel.includes('severo') || lowerNivel.includes('severe')) {
      return 'bg-red-100 border-red-500 text-red-900'
    }

    // Default
    return 'bg-blue-100 border-blue-500 text-blue-900'
  }

  const handleRetryCalculation = async () => {
    if (!resultado) return

    setIsRetrying(true)
    try {
      const response = await fetch(`/api/testes-aplicados/${params.id}/finalizar`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        // Refresh the page to show new results
        window.location.href = `/resultados/${params.id}`
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || 'Erro ao recalcular')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsRetrying(false)
    }
  }

  const getAnswerLabel = (questionNum: number, answerValue: any) => {
    if (!resultado?.teste_template?.escalas_resposta) return answerValue

    const questao = resultado.teste_template.questoes?.find(q => q.numero === questionNum)
    const tipoResposta = questao?.tipo_resposta || 'likert_1_5'
    const escala = resultado.teste_template.escalas_resposta[tipoResposta]

    if (escala && Array.isArray(escala)) {
      const option = escala.find((o: any) => o.valor === Number(answerValue) || o.valor === answerValue)
      if (option) return `${option.valor} - ${option.texto}`
    }

    return answerValue
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando resultados...</div>
      </div>
    )
  }

  if (error || !resultado) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Resultado não encontrado'}</div>
      </div>
    )
  }

  const idade = calculateAge(resultado.paciente.data_nascimento)

  // Check test type by sigla
  const testSigla = resultado.teste_template.sigla
  const isMcmiIV = testSigla === 'MCMI-IV'
  const isAASP = testSigla === 'AASP'
  const isChildSensoryProfile = testSigla === 'SP2-C'
  const isBDEFS = testSigla === 'BDEFS' || testSigla === 'BDEFS-L' || testSigla.startsWith('BDEFS')
  const isBFP = testSigla === 'BFP'
  const isIDADI = testSigla === 'IDADI' || testSigla.startsWith('IDADI')
  const isIFPII = testSigla === 'IFP-II' || testSigla === 'IFPII'
  const isBSI = testSigla === 'BSI'

  // Check if there was a calculation error
  const hasCalculationError = resultado.status === 'erro_calculo'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {modoRespostas || hasCalculationError ? 'Respostas do Teste' : 'Resultados do Teste'}
            </h1>
            <button
              onClick={() => router.push('/pacientes')}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </header>

      {/* Calculation Error Banner */}
      {hasCalculationError && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <svg className="h-6 w-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Erro no cálculo da pontuação
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Não foi possível calcular a pontuação deste teste. As respostas foram salvas e você pode visualizá-las abaixo.
                  </p>
                  {resultado.observacoes && (
                    <p className="mt-1 text-xs text-red-600">
                      {resultado.observacoes}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleRetryCalculation}
                disabled={isRetrying}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 whitespace-nowrap"
              >
                {isRetrying ? 'Calculando...' : 'Calcular novamente'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient and Test Info - Always shown */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Avaliação</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Paciente</p>
              <p className="font-medium text-gray-900">{resultado.paciente.nome_completo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teste Aplicado</p>
              <p className="font-medium text-gray-900">{resultado.teste_template.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Idade</p>
              <p className="font-medium text-gray-900">{idade} anos</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Escolaridade</p>
              <p className="font-medium text-gray-900">{resultado.paciente.escolaridade_anos} anos</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sexo</p>
              <p className="font-medium text-gray-900">
                {resultado.paciente.sexo === 'M' ? 'Masculino' : 'Feminino'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-medium ${hasCalculationError ? 'text-red-600' : 'text-green-600'}`}>
                {hasCalculationError ? 'Erro no cálculo' : resultado.status === 'completo' ? 'Completo' : resultado.status}
              </p>
            </div>
          </div>
        </div>

        {/* Answers Only View - shown for modoRespostas or calculation error */}
        {(modoRespostas || hasCalculationError) && resultado.respostas && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Respostas do Teste</h2>
            <p className="text-sm text-gray-600 mb-4">
              Total de respostas: {Object.keys(resultado.respostas).length} de {resultado.teste_template.questoes?.length || '?'} questões
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questão
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enunciado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resposta
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resultado.teste_template.questoes?.map((questao) => {
                    const resposta = resultado.respostas[`q${questao.numero}`] ?? resultado.respostas[questao.numero]
                    return (
                      <tr key={questao.numero} className={resposta === undefined ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {questao.numero}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-md">
                          {questao.texto}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {resposta !== undefined ? (
                            <span className="font-medium">{getAnswerLabel(questao.numero, resposta)}</span>
                          ) : (
                            <span className="text-yellow-600 italic">Não respondida</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Show full results only if not in answers-only mode and no calculation error */}
        {!modoRespostas && !hasCalculationError && (
          <>
        {/* Render specialized results based on test type */}
        {isMcmiIV ? (
          <McmiIVResults
            testTemplate={resultado.teste_template}
            userAnswers={resultado.pontuacao_bruta}
            patientInfo={resultado.paciente}
            dataConlusao={resultado.data_conclusao}
          />
        ) : isAASP ? (
          <AASPResults
            testTemplate={resultado.teste_template as any}
            pontuacaoBruta={resultado.pontuacao_bruta as any}
            patientInfo={resultado.paciente}
            dataConlusao={resultado.data_conclusao}
          />
        ) : isChildSensoryProfile ? (
          <ChildSensoryProfileResults
            testTemplate={resultado.teste_template as any}
            pontuacaoBruta={resultado.pontuacao_bruta as any}
            patientInfo={resultado.paciente}
            dataConlusao={resultado.data_conclusao}
          />
        ) : isBDEFS ? (
          <BDEFSResults
            testTemplate={resultado.teste_template as any}
            pontuacaoBruta={resultado.pontuacao_bruta as any}
            patientInfo={resultado.paciente}
            dataConlusao={resultado.data_conclusao}
          />
        ) : isBFP ? (
          <BFPResults
            testTemplate={resultado.teste_template as any}
            pontuacaoBruta={resultado.pontuacao_bruta as any}
            patientInfo={resultado.paciente}
            dataConlusao={resultado.data_conclusao}
          />
        ) : isIDADI ? (
          <IDADIResults
            testTemplate={resultado.teste_template as any}
            pontuacaoBruta={resultado.pontuacao_bruta as any}
            patientInfo={resultado.paciente}
            dataConlusao={resultado.data_conclusao}
          />
        ) : isIFPII ? (
          <IFPIIResults
            testTemplate={resultado.teste_template as any}
            pontuacaoBruta={resultado.pontuacao_bruta as any}
            patientInfo={resultado.paciente}
            dataConlusao={resultado.data_conclusao}
          />
        ) : isBSI ? (
          <BSIResults
            testTemplate={resultado.teste_template as any}
            pontuacaoBruta={resultado.pontuacao_bruta as any}
            patientInfo={resultado.paciente}
            dataConlusao={resultado.data_conclusao}
          />
        ) : (
          <>
        {/* Raw Score and Interpretation */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultado</h2>

          {/* Score Display */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-4">
            <p className="text-3xl font-bold text-blue-900">
              {resultado.pontuacao_bruta.total}
            </p>
            <p className="text-sm text-blue-700 mt-1">Pontuação Total</p>
          </div>

          {/* Interpretation */}
          {(() => {
            const interpretation = getScoreInterpretation()
            if (interpretation) {
              return (
                <div className={`border-l-4 p-4 rounded ${interpretation.color}`}>
                  <div className="flex items-start">
                    <div className="flex-1">
                      <p className="text-lg font-bold mb-1">{interpretation.nivel}</p>
                      <p className="text-sm opacity-90">{interpretation.descricao}</p>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })()}

          {/* Section Scores (if available) */}
          {resultado.pontuacao_bruta.secoes && Object.keys(resultado.pontuacao_bruta.secoes).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Pontuações por Seção</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(resultado.pontuacao_bruta.secoes).map(([secao, pontuacao]) => (
                  <div key={secao} className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600 capitalize">{secao.replace(/_/g, ' ')}</p>
                    <p className="text-xl font-bold text-gray-900">{pontuacao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Normalized Results */}
        {resultado.normalizacao ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultados Normalizados</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Percentile */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-1">Percentil</p>
                <p className="text-4xl font-bold text-blue-900">
                  {resultado.normalizacao.percentil}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Melhor que {resultado.normalizacao.percentil}% da população
                </p>
              </div>

              {/* Z-Score */}
              {resultado.normalizacao.escore_z !== null && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-700 mb-1">Escore Z</p>
                  <p className="text-4xl font-bold text-purple-900">
                    {resultado.normalizacao.escore_z.toFixed(2)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Desvios padrão da média
                  </p>
                </div>
              )}

              {/* T-Score */}
              {resultado.normalizacao.escore_t !== null && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 mb-1">Escore T</p>
                  <p className="text-4xl font-bold text-green-900">
                    {resultado.normalizacao.escore_t}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Escala T (média 50, DP 10)
                  </p>
                </div>
              )}
            </div>

            {/* Classification */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Classificação</p>
              <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${getClassificationColor(resultado.normalizacao.classificacao)}`}>
                {resultado.normalizacao.classificacao}
              </span>
            </div>

            {/* Normative Bin Info */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Faixa Normativa Aplicada</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Idade: </span>
                  <span className="font-medium text-gray-900">
                    {resultado.normalizacao.faixa_aplicada.idade} anos
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Escolaridade: </span>
                  <span className="font-medium text-gray-900">
                    {resultado.normalizacao.faixa_aplicada.escolaridade} anos
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-600">Correspondência: </span>
                  <span className={`font-medium ${resultado.normalizacao.exact_match ? 'text-green-600' : 'text-orange-600'}`}>
                    {resultado.normalizacao.exact_match ? 'Exata' : 'Aproximada (bin mais próximo)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p className="text-yellow-800">
              ⚠️ Normatização não disponível para este teste ou perfil demográfico
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Imprimir Relatório
          </button>
          <button
            onClick={() => alert('PDF export funcionalidade será implementada em breve')}
            className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Exportar PDF (Em breve)
          </button>
        </div>
          </>
        )}
          </>
        )}

        {/* Actions for answers-only mode */}
        {(modoRespostas || hasCalculationError) && (
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Imprimir Respostas
            </button>
            {hasCalculationError && (
              <button
                onClick={handleRetryCalculation}
                disabled={isRetrying}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {isRetrying ? 'Calculando...' : 'Calcular novamente'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
