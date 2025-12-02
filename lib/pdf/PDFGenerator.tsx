import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { TesteAplicado, Paciente, Psicologo, TesteTemplate } from '@/types/database'

// Register fonts for better typography
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf',
// })

// Styles for PDF documents
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: '40%',
    fontSize: 10,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    fontSize: 10,
    color: '#111827',
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  interpretation: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  interpretationText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  signature: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
  },
  signatureLine: {
    textAlign: 'center',
    fontSize: 10,
    color: '#374151',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 30,
    right: 40,
    color: '#9ca3af',
  },
})

interface TestReportData {
  teste: TesteAplicado
  paciente: Paciente
  psicologo: Psicologo
  template: TesteTemplate
  clinicaName: string
  resultados?: {
    pontuacao_bruta?: number
    percentil?: number
    z_score?: number
    t_score?: number
    classificacao?: string
    interpretacao?: string
  }
}

interface ProntuarioData {
  paciente: Paciente
  psicologo: Psicologo
  clinicaName: string
  testes: Array<{
    teste: TesteAplicado
    template: TesteTemplate
    resultados?: any
  }>
  registrosManuais?: Array<{
    tipo_teste: string
    data_aplicacao: string
    observacoes?: string
  }>
}

/**
 * PDF Document for Test Report
 */
const TestReportDocument: React.FC<{ data: TestReportData }> = ({ data }) => {
  const { teste, paciente, psicologo, template, clinicaName, resultados } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.clinicName}>{clinicaName}</Text>
          <Text style={styles.reportTitle}>Relatório de Avaliação Neuropsicológica</Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Paciente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{paciente.nome_completo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Nascimento:</Text>
            <Text style={styles.value}>
              {format(new Date(paciente.data_nascimento), 'dd/MM/yyyy', { locale: ptBR })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CPF:</Text>
            <Text style={styles.value}>{paciente.cpf || 'Não informado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Escolaridade:</Text>
            <Text style={styles.value}>{paciente.escolaridade_nivel || 'Não informado'}</Text>
          </View>
        </View>

        {/* Test Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Teste</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Teste:</Text>
            <Text style={styles.value}>{template.nome}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{template.tipo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Aplicação:</Text>
            <Text style={styles.value}>
              {format(new Date(teste.data_criacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Text>
          </View>
          {teste.data_conclusao && (
            <View style={styles.row}>
              <Text style={styles.label}>Data de Finalização:</Text>
              <Text style={styles.value}>
                {format(new Date(teste.data_conclusao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </Text>
            </View>
          )}
        </View>

        {/* Results */}
        {resultados && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultados</Text>
            {resultados.pontuacao_bruta !== undefined && (
              <View style={styles.row}>
                <Text style={styles.label}>Pontuação Bruta:</Text>
                <Text style={styles.value}>{resultados.pontuacao_bruta}</Text>
              </View>
            )}
            {resultados.percentil !== undefined && (
              <View style={styles.row}>
                <Text style={styles.label}>Percentil:</Text>
                <Text style={styles.value}>{resultados.percentil}</Text>
              </View>
            )}
            {resultados.z_score !== undefined && (
              <View style={styles.row}>
                <Text style={styles.label}>Escore Z:</Text>
                <Text style={styles.value}>{resultados.z_score.toFixed(2)}</Text>
              </View>
            )}
            {resultados.t_score !== undefined && (
              <View style={styles.row}>
                <Text style={styles.label}>Escore T:</Text>
                <Text style={styles.value}>{resultados.t_score.toFixed(2)}</Text>
              </View>
            )}
            {resultados.classificacao && (
              <View style={styles.row}>
                <Text style={styles.label}>Classificação:</Text>
                <Text style={styles.value}>{resultados.classificacao}</Text>
              </View>
            )}
          </View>
        )}

        {/* Interpretation */}
        {resultados?.interpretacao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interpretação</Text>
            <View style={styles.interpretation}>
              <Text style={styles.interpretationText}>{resultados.interpretacao}</Text>
            </View>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureLine}>{psicologo.nome_completo}</Text>
          <Text style={styles.signatureLine}>CRP: {psicologo.crp}/{psicologo.crp_estado}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Relatório gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  )
}

/**
 * PDF Document for Complete Medical Record (Prontuário)
 */
const ProntuarioDocument: React.FC<{ data: ProntuarioData }> = ({ data }) => {
  const { paciente, psicologo, clinicaName, testes, registrosManuais } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.clinicName}>{clinicaName}</Text>
          <Text style={styles.reportTitle}>Prontuário Psicológico Digital</Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Paciente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{paciente.nome_completo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Nascimento:</Text>
            <Text style={styles.value}>
              {format(new Date(paciente.data_nascimento), 'dd/MM/yyyy', { locale: ptBR })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CPF:</Text>
            <Text style={styles.value}>{paciente.cpf || 'Não informado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{paciente.telefone || 'Não informado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{paciente.email || 'Não informado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Escolaridade:</Text>
            <Text style={styles.value}>{paciente.escolaridade_nivel || 'Não informado'}</Text>
          </View>
        </View>

        {/* Applied Tests */}
        {testes && testes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Testes Aplicados ({testes.length})</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { width: '40%' }]}>Teste</Text>
                <Text style={[styles.tableCellHeader, { width: '20%' }]}>Data</Text>
                <Text style={[styles.tableCellHeader, { width: '20%' }]}>Status</Text>
                <Text style={[styles.tableCellHeader, { width: '20%' }]}>Resultado</Text>
              </View>
              {testes.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '40%' }]}>{item.template.nome}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>
                    {format(new Date(item.teste.data_criacao), 'dd/MM/yyyy', { locale: ptBR })}
                  </Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{item.teste.status}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>
                    {item.resultados?.classificacao || '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Manual Records */}
        {registrosManuais && registrosManuais.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Registros Manuais ({registrosManuais.length})</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { width: '40%' }]}>Tipo de Teste</Text>
                <Text style={[styles.tableCellHeader, { width: '30%' }]}>Data</Text>
                <Text style={[styles.tableCellHeader, { width: '30%' }]}>Observações</Text>
              </View>
              {registrosManuais.map((registro, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '40%' }]}>{registro.tipo_teste}</Text>
                  <Text style={[styles.tableCell, { width: '30%' }]}>
                    {format(new Date(registro.data_aplicacao), 'dd/MM/yyyy', { locale: ptBR })}
                  </Text>
                  <Text style={[styles.tableCell, { width: '30%' }]}>
                    {registro.observacoes || '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureLine}>{psicologo.nome_completo}</Text>
          <Text style={styles.signatureLine}>CRP: {psicologo.crp}/{psicologo.crp_estado}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Prontuário gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  )
}

/**
 * PDF Generator Service
 * Generates PDF documents for test reports and medical records
 */
export class PDFGenerator {
  /**
   * Generate test report PDF
   */
  static generateTestReport(data: TestReportData) {
    return <TestReportDocument data={data} />
  }

  /**
   * Generate complete medical record PDF (Prontuário)
   */
  static generateProntuario(data: ProntuarioData) {
    return <ProntuarioDocument data={data} />
  }
}
