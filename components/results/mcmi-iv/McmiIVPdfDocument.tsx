import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

import { McmiResults } from '@/lib/services/mcmi-iv-scoring.service'

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  section: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '30%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  validityWarning: {
    backgroundColor: '#fef2f2',
    border: 1,
    borderColor: '#fca5a5',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  validityWarningText: {
    fontSize: 9,
    color: '#991b1b',
  },
  table: {
    marginTop: 8,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: 1,
    borderBottomColor: '#d1d5db',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  tableCellText: {
    fontSize: 9,
    color: '#1f2937',
  },
  col1: { width: '15%' },
  col2: { width: '40%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  scaleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  scaleLabel: {
    width: '30%',
    fontSize: 9,
  },
  scaleBarContainer: {
    width: '50%',
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    position: 'relative',
  },
  scaleBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  scaleValue: {
    width: '20%',
    textAlign: 'right',
    fontSize: 9,
    fontWeight: 'bold',
  },
  interpretationText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 8,
  },
  interpretationSection: {
    marginBottom: 12,
  },
  interpretationTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  disclaimer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f9fafb',
    border: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
  },
  disclaimerTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 8,
    lineHeight: 1.4,
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
  },
})

interface McmiIVPdfDocumentProps {
  results: McmiResults
  patientInfo: {
    nome_completo: string
    idade: number
    sexo: string
    escolaridade_anos: number
    data_conclusao: string
  }
}

export function McmiIVPdfDocument({ results, patientInfo }: McmiIVPdfDocumentProps) {
  const getBRColor = (br: number) => {
    if (br >= 85) return '#ef4444'
    if (br >= 75) return '#f97316'
    if (br >= 60) return '#eab308'
    return '#22c55e'
  }



  return (
    <Document>
      {/* Page 1: Header, Patient Info, Validity */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MCMI-IV - Inventário Clínico Multiaxial de Millon IV</Text>
          <Text style={styles.subtitle}>Relatório Completo de Avaliação Psicológica</Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Paciente</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nome Completo</Text>
              <Text style={styles.infoValue}>{patientInfo.nome_completo}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Idade</Text>
              <Text style={styles.infoValue}>{patientInfo.idade} anos</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Sexo</Text>
              <Text style={styles.infoValue}>{patientInfo.sexo === 'M' ? 'Masculino' : 'Feminino'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Escolaridade</Text>
              <Text style={styles.infoValue}>{patientInfo.escolaridade_anos} anos</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data de Conclusão</Text>
              <Text style={styles.infoValue}>
                {new Date(patientInfo.data_conclusao).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Validity Scales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escalas de Validade</Text>

          {!results.validity.isValid && (
            <View style={styles.validityWarning}>
              <Text style={styles.validityWarningText}>
                ⚠️ ATENÇÃO: Validade Comprometida - {results.validity.warnings.join('; ')}
              </Text>
            </View>
          )}

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Código</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Escala</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>PD</Text>
              <Text style={[styles.tableHeaderText, styles.col4]}>BR</Text>
              <Text style={[styles.tableHeaderText, styles.col5]}>Percentil</Text>
            </View>
            {[results.validity.V, results.validity.W, results.validity.X, results.validity.Y, results.validity.Z].map((scale) => (
              <View key={scale.code} style={styles.tableRow}>
                <Text style={[styles.tableCellText, styles.col1]}>{scale.code}</Text>
                <Text style={[styles.tableCellText, styles.col2]}>{scale.name}</Text>
                <Text style={[styles.tableCellText, styles.col3]}>{scale.pd}</Text>
                <Text style={[styles.tableCellText, styles.col4]}>{scale.br}</Text>
                <Text style={[styles.tableCellText, styles.col5]}>{scale.percentile}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo de Pontuações</Text>

          {results.summary.highestPersonality && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.infoLabel}>Padrão de Personalidade Mais Elevado</Text>
              <Text style={styles.infoValue}>
                {results.summary.highestPersonality.code} - {results.summary.highestPersonality.name} (BR {results.summary.highestPersonality.br})
              </Text>
            </View>
          )}

          {results.summary.elevatedScales.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.infoLabel}>Escalas Clinicamente Elevadas (BR ≥ 75)</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.col1]}>Código</Text>
                  <Text style={[styles.tableHeaderText, styles.col2]}>Escala</Text>
                  <Text style={[styles.tableHeaderText, styles.col4]}>BR</Text>
                  <Text style={[styles.tableHeaderText, styles.col5]}>Nível</Text>
                </View>
                {results.summary.elevatedScales.map((scale) => (
                  <View key={scale.code} style={styles.tableRow}>
                    <Text style={[styles.tableCellText, styles.col1]}>{scale.code}</Text>
                    <Text style={[styles.tableCellText, styles.col2]}>{scale.name}</Text>
                    <Text style={[styles.tableCellText, styles.col4]}>{scale.br}</Text>
                    <Text style={[styles.tableCellText, styles.col5]}>{scale.levelDescription}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <Text style={styles.pageNumber}>Página 1</Text>
      </Page>

      {/* Page 2: Personality Patterns */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Padrões de Personalidade (12 Escalas)</Text>

          {results.personalityPatterns.map((scale) => (
            <View key={scale.code} style={styles.scaleBar}>
              <Text style={styles.scaleLabel}>{scale.code} - {scale.name}</Text>
              <View style={styles.scaleBarContainer}>
                <View
                  style={[
                    styles.scaleBarFill,
                    {
                      width: `${Math.min((scale.br / 115) * 100, 100)}%`,
                      backgroundColor: getBRColor(scale.br)
                    }
                  ]}
                />
              </View>
              <Text style={styles.scaleValue}>BR {scale.br} ({scale.percentile}%)</Text>
            </View>
          ))}
        </View>

        <Text style={styles.pageNumber}>Página 2</Text>
      </Page>

      {/* Page 3: Severe Pathology & Clinical Syndromes */}
      <Page size="A4" style={styles.page}>
        {/* Severe Pathology */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patologia Grave (3 Escalas)</Text>

          {results.severePathology.map((scale) => (
            <View key={scale.code} style={styles.scaleBar}>
              <Text style={styles.scaleLabel}>{scale.code} - {scale.name}</Text>
              <View style={styles.scaleBarContainer}>
                <View
                  style={[
                    styles.scaleBarFill,
                    {
                      width: `${Math.min((scale.br / 115) * 100, 100)}%`,
                      backgroundColor: getBRColor(scale.br)
                    }
                  ]}
                />
              </View>
              <Text style={styles.scaleValue}>BR {scale.br} ({scale.percentile}%)</Text>
            </View>
          ))}
        </View>

        {/* Clinical Syndromes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Síndromes Clínicas (10 Escalas)</Text>

          {results.clinicalSyndromes.map((scale) => (
            <View key={scale.code} style={styles.scaleBar}>
              <Text style={styles.scaleLabel}>{scale.code} - {scale.name}</Text>
              <View style={styles.scaleBarContainer}>
                <View
                  style={[
                    styles.scaleBarFill,
                    {
                      width: `${Math.min((scale.br / 115) * 100, 100)}%`,
                      backgroundColor: getBRColor(scale.br)
                    }
                  ]}
                />
              </View>
              <Text style={styles.scaleValue}>BR {scale.br} ({scale.percentile}%)</Text>
            </View>
          ))}
        </View>

        <Text style={styles.pageNumber}>Página 3</Text>
      </Page>

      {/* Page 4: Significant Responses */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Respostas Significativas</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: '60%' }]}>Categoria</Text>
              <Text style={[styles.tableHeaderText, { width: '20%' }]}>Itens</Text>
              <Text style={[styles.tableHeaderText, { width: '20%' }]}>Nível</Text>
            </View>
            {results.significantResponses
              .sort((a, b) => {
                const levelOrder = { high: 0, moderate: 1, low: 2 }
                return levelOrder[a.level] - levelOrder[b.level]
              })
              .map((response, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCellText, { width: '60%' }]}>{response.category}</Text>
                  <Text style={[styles.tableCellText, { width: '20%' }]}>{response.itemsEndorsed}</Text>
                  <Text style={[styles.tableCellText, { width: '20%' }]}>
                    {response.level === 'high' ? 'Alta' : response.level === 'moderate' ? 'Moderada' : 'Baixa'}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Aviso Profissional</Text>
          <Text style={styles.disclaimerText}>
            Este relatório foi gerado automaticamente com base nas respostas do MCMI-IV e deve ser interpretado por
            um profissional de saúde mental qualificado. Os resultados devem ser considerados em conjunto com outras
            informações clínicas, histórico do paciente, observações comportamentais e entrevistas. Este relatório não
            deve ser usado isoladamente para diagnóstico ou tomada de decisões clínicas.
          </Text>
        </View>

        <Text style={styles.pageNumber}>Página 4</Text>
      </Page>
    </Document>
  )
}
