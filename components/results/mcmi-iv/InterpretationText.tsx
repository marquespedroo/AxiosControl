'use client'

import { ScaleScore, ValidityResult } from '@/lib/services/mcmi-iv-scoring.service'

interface InterpretationTextProps {
  validity: ValidityResult
  summary: {
    highestPersonality?: ScaleScore
    highestSevere?: ScaleScore
    highestClinical?: ScaleScore
    elevatedScales: ScaleScore[]
  }
}

export default function InterpretationText({ validity, summary }: InterpretationTextProps) {
  const { highestPersonality, highestSevere, highestClinical, elevatedScales } = summary

  // Generate narrative interpretation
  const generateInterpretation = () => {
    const sections: string[] = []

    // Validity Section
    if (!validity.isValid) {
      sections.push(
        `**ATENÇÃO: Validade Comprometida**\n\n` +
        `Os resultados deste teste devem ser interpretados com cautela devido a padrões de resposta que comprometem a validade. ` +
        validity.warnings.join(' ')
      )
    } else if (validity.warnings.length > 0) {
      sections.push(
        `**Considerações de Validade:**\n\n` +
        validity.warnings.join(' ')
      )
    }

    // Main Profile Section
    if (elevatedScales.length > 0) {
      sections.push(
        `**Perfil Clínico:**\n\n` +
        `Os resultados indicam ${elevatedScales.length} escala${elevatedScales.length !== 1 ? 's' : ''} clinicamente elevada${elevatedScales.length !== 1 ? 's' : ''} ` +
        `(Base Rate ≥ 75), sugerindo padrões clínicos significativos que merecem atenção profissional.`
      )
    } else {
      sections.push(
        `**Perfil Clínico:**\n\n` +
        `Os resultados não indicam escalas clinicamente elevadas (todas abaixo de BR 75). ` +
        `Isto sugere que o paciente não apresenta padrões clínicos proeminentes nas áreas avaliadas pelo MCMI-IV.`
      )
    }

    // Personality Patterns
    if (highestPersonality) {
      const isElevated = highestPersonality.br >= 75
      sections.push(
        `**Padrões de Personalidade:**\n\n` +
        `A escala de personalidade mais elevada é **${highestPersonality.name}** (${highestPersonality.code}) ` +
        `com Base Rate de ${highestPersonality.br} (${highestPersonality.percentile}º percentil), ` +
        `classificada como "${highestPersonality.levelDescription}". ` +
        (isElevated
          ? `Esta elevação sugere que o paciente apresenta características significativas deste padrão de personalidade, ` +
            `o que pode influenciar seu funcionamento interpessoal e comportamental.`
          : `Este é o padrão de personalidade mais proeminente, embora não atinja o nível clínico.`)
      )
    }

    // Severe Pathology
    if (highestSevere && highestSevere.br >= 60) {
      sections.push(
        `**Patologia Grave:**\n\n` +
        `A escala **${highestSevere.name}** (${highestSevere.code}) apresenta Base Rate de ${highestSevere.br}, ` +
        `indicando ${highestSevere.br >= 75 ? 'presença significativa' : 'características observáveis'} ` +
        `deste padrão. ${highestSevere.br >= 85 ? 'Avaliação clínica aprofundada é fortemente recomendada.' : ''}`
      )
    }

    // Clinical Syndromes
    if (highestClinical && highestClinical.br >= 60) {
      sections.push(
        `**Síndromes Clínicas:**\n\n` +
        `A síndrome clínica mais proeminente é **${highestClinical.name}** (${highestClinical.code}) ` +
        `com Base Rate de ${highestClinical.br}. ` +
        (highestClinical.br >= 75
          ? `Esta elevação sugere a presença de sintomatologia clínica atual que pode requerer intervenção.`
          : `Embora não atinja nível clínico, esta síndrome apresenta características observáveis.`)
      )
    }

    // Clinical Recommendations
    const recommendations: string[] = []
    if (!validity.isValid) {
      recommendations.push('Reaplicação do teste com instruções mais claras')
    }
    if (elevatedScales.length >= 5) {
      recommendations.push('Avaliação clínica abrangente por profissional qualificado')
    }
    if (elevatedScales.some(s => s.br >= 85)) {
      recommendations.push('Consideração de intervenção terapêutica especializada')
    }
    if (highestSevere && highestSevere.br >= 75) {
      recommendations.push('Avaliação de risco e necessidade de suporte intensivo')
    }

    if (recommendations.length > 0) {
      sections.push(
        `**Recomendações Clínicas:**\n\n` +
        recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')
      )
    }

    return sections
  }

  const interpretationSections = generateInterpretation()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900">Interpretação Clínica</h3>
          <p className="text-sm text-gray-600 mt-1">
            Narrativa interpretativa automaticamente gerada com base nos resultados
          </p>
        </div>

        <div className="p-6 space-y-6">
          {interpretationSections.map((section, idx) => {
            const [title, ...content] = section.split('\n\n')
            return (
              <div key={idx} className="prose prose-sm max-w-none">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  {title.replace(/\*\*/g, '')}
                </h4>
                <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                  {content.map((paragraph, pIdx) => (
                    <p key={pIdx} className="whitespace-pre-line">
                      {paragraph.split('**').map((part, i) =>
                        i % 2 === 0 ? (
                          <span key={i}>{part}</span>
                        ) : (
                          <strong key={i} className="font-semibold text-gray-900">
                            {part}
                          </strong>
                        )
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Nota Importante</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Esta interpretação é gerada automaticamente com base nos escores obtidos e serve como guia inicial.
                Uma avaliação clínica completa deve considerar o contexto individual do paciente, história clínica,
                observações comportamentais e outras fontes de informação. Este relatório não substitui o julgamento
                clínico profissional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
