'use client'

import { useEffect, useState } from 'react'
import { McmiIVScoringService, McmiResults, McmiAnswer } from '@/lib/services/mcmi-iv-scoring.service'
import { generateAndDownloadPdf } from '@/lib/utils/pdf-generator'
import { McmiIVPdfDocument } from './McmiIVPdfDocument'
import ValidityScalesTable from './ValidityScalesTable'
import PersonalityPatternsChart from './PersonalityPatternsChart'
import SeverePathologyTable from './SeverePathologyTable'
import ClinicalSyndromesChart from './ClinicalSyndromesChart'
import GrossmanFacetsDisplay from './GrossmanFacetsDisplay'
import SignificantResponsesTable from './SignificantResponsesTable'
import ScoreSummaryTable from './ScoreSummaryTable'
import InterpretationText from './InterpretationText'

interface McmiIVResultsProps {
  testTemplate: any
  userAnswers: any // From pontuacao_bruta
  patientInfo: {
    nome_completo: string
    data_nascimento: string
    escolaridade_anos: number
    sexo: string
  }
  dataConlusao: string
}

export default function McmiIVResults({
  testTemplate,
  userAnswers,
  patientInfo,
  dataConlusao
}: McmiIVResultsProps) {
  const [results, setResults] = useState<McmiResults | null>(null)
  const [isCalculating, setIsCalculating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  useEffect(() => {
    try {
      // Initialize scoring service
      const scoringService = new McmiIVScoringService(testTemplate)

      // Convert user answers to McmiAnswer format
      const mcmiAnswers: McmiAnswer[] = Object.entries(userAnswers.respostas || {}).map(([key, value]) => ({
        questionNumber: parseInt(key.replace('q', '')),
        answer: value === 'Verdadeiro' || value === true
      }))

      // Calculate all scores
      const calculatedResults = scoringService.calculateScores(mcmiAnswers)
      setResults(calculatedResults)
    } catch (err: any) {
      console.error('Error calculating MCMI-IV scores:', err)
      setError(err.message || 'Erro ao calcular pontuações MCMI-IV')
    } finally {
      setIsCalculating(false)
    }
  }, [testTemplate, userAnswers])

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

  const handleExportPdf = async () => {
    if (!results) return

    setIsGeneratingPdf(true)
    try {
      const idade = calculateAge(patientInfo.data_nascimento)

      // Create sanitized filename
      const patientName = patientInfo.nome_completo
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '_') // Replace spaces with underscores

      const date = new Date(dataConlusao).toISOString().split('T')[0]
      const filename = `MCMI-IV_${patientName}_${date}.pdf`

      // Generate PDF document
      const pdfDocument = (
        <McmiIVPdfDocument
          results={results}
          patientInfo={{
            nome_completo: patientInfo.nome_completo,
            idade,
            sexo: patientInfo.sexo,
            escolaridade_anos: patientInfo.escolaridade_anos,
            data_conclusao: dataConlusao
          }}
        />
      )

      // Generate and download
      await generateAndDownloadPdf(pdfDocument, filename)
    } catch (err: any) {
      console.error('Error generating PDF:', err)
      alert('Erro ao gerar PDF: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Calculando resultados MCMI-IV...</p>
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Erro ao Processar Resultados</h3>
        <p className="text-red-700">{error || 'Não foi possível calcular os resultados MCMI-IV'}</p>
      </div>
    )
  }

  const idade = calculateAge(patientInfo.data_nascimento)

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">MCMI-IV - Inventário Clínico Multiaxial de Millon IV</h1>
        <p className="text-blue-100">Relatório Completo de Avaliação Psicológica</p>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px px-6" aria-label="Seções">
            {[
              { id: 'validity', label: 'Validade' },
              { id: 'summary', label: 'Resumo' },
              { id: 'interpretation', label: 'Interpretação' },
              { id: 'personality', label: 'Personalidade' },
              { id: 'severe', label: 'Patologia Grave' },
              { id: 'clinical', label: 'Síndromes' },
              { id: 'facets', label: 'Facetas' },
              { id: 'significant', label: 'Respostas Sig.' }
            ].map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-4 text-sm font-medium transition-colors"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* 1. Validity Scales */}
      <section id="validity">
        <ValidityScalesTable validity={results.validity} />
      </section>

      {/* 2. Score Summary */}
      <section id="summary">
        <ScoreSummaryTable summary={results.summary} />
      </section>

      {/* 3. Interpretation */}
      <section id="interpretation">
        <InterpretationText validity={results.validity} summary={results.summary} />
      </section>

      {/* 4. Personality Patterns (PRIMARY CHART) */}
      <section id="personality">
        <PersonalityPatternsChart scales={results.personalityPatterns} />
      </section>

      {/* 5. Severe Pathology */}
      <section id="severe">
        <SeverePathologyTable scales={results.severePathology} />
      </section>

      {/* 6. Clinical Syndromes (SECONDARY CHART) */}
      <section id="clinical">
        <ClinicalSyndromesChart scales={results.clinicalSyndromes} />
      </section>

      {/* 7. Grossman Facets */}
      <section id="facets">
        <GrossmanFacetsDisplay facets={results.grossmanFacets} />
      </section>

      {/* 8. Significant Responses */}
      <section id="significant">
        <SignificantResponsesTable responses={results.significantResponses} />
      </section>

      {/* Professional Disclaimer */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Aviso Profissional</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Este relatório foi gerado automaticamente com base nas respostas do MCMI-IV e deve ser interpretado por
          um profissional de saúde mental qualificado. Os resultados devem ser considerados em conjunto com outras
          informações clínicas, histórico do paciente, observações comportamentais e entrevistas. Este relatório não
          deve ser usado isoladamente para diagnóstico ou tomada de decisões clínicas.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Relatório
        </button>
        <button
          onClick={handleExportPdf}
          disabled={isGeneratingPdf}
          className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPdf ? (
            <>
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Gerando PDF...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF
            </>
          )}
        </button>
      </div>
    </div>
  )
}
