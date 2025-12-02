import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

import { PontuacaoBruta, Normalizacao } from '@/types/database'

interface ResultTemplateProps {
  paciente: {
    nome_completo: string
    data_nascimento: string
    escolaridade_anos: number
    sexo: string
    idade: number
  }
  teste: {
    nome: string
    sigla: string
  }
  pontuacaoBruta: PontuacaoBruta
  normalizacao: Normalizacao | null
  dataConclusao: string
  psicologo: {
    nome_completo: string
    crp: string
  }
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #1e40af',
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  infoItem: {
    width: '50%',
    marginBottom: 8,
  },
  label: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  scoreBox: {
    backgroundColor: '#dbeafe',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderLeft: '4 solid #1e40af',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 3,
  },
  scoreLabel: {
    fontSize: 10,
    color: '#1e40af',
  },
  normGrid: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  normCard: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  normValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  normLabel: {
    fontSize: 8,
    color: '#6b7280',
  },
  classification: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #e5e7eb',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
  },
  signature: {
    marginTop: 40,
    borderTop: '1 solid #1f2937',
    paddingTop: 5,
    width: 250,
  },
  signatureText: {
    fontSize: 10,
    color: '#1f2937',
  },
})

export const ResultTemplate: React.FC<ResultTemplateProps> = ({
  paciente,
  teste,
  pontuacaoBruta,
  normalizacao,
  dataConclusao,
  psicologo,
}) => {
  const getClassificationColor = (classificacao: string) => {
    switch (classificacao) {
      case 'Muito Superior': return '#059669'
      case 'Superior': return '#10b981'
      case 'Médio': return '#3b82f6'
      case 'Inferior': return '#f97316'
      case 'Muito Inferior': return '#dc2626'
      default: return '#6b7280'
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Avaliação Neuropsicológica</Text>
          <Text style={styles.subtitle}>AxiosControl Platform</Text>
        </View>

        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Paciente</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Nome Completo</Text>
              <Text style={styles.value}>{paciente.nome_completo}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Idade</Text>
              <Text style={styles.value}>{paciente.idade} anos</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Escolaridade</Text>
              <Text style={styles.value}>{paciente.escolaridade_anos} anos</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Sexo</Text>
              <Text style={styles.value}>{paciente.sexo === 'M' ? 'Masculino' : 'Feminino'}</Text>
            </View>
          </View>
        </View>

        {/* Test Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Teste</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Teste Aplicado</Text>
              <Text style={styles.value}>{teste.nome}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Data de Conclusão</Text>
              <Text style={styles.value}>
                {new Date(dataConclusao).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Raw Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pontuação Bruta</Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{pontuacaoBruta.total}</Text>
            <Text style={styles.scoreLabel}>Pontuação Total</Text>
          </View>
        </View>

        {/* Normalized Results */}
        {normalizacao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultados Normalizados</Text>

            <View style={styles.normGrid}>
              <View style={styles.normCard}>
                <Text style={styles.normValue}>{normalizacao.percentil}</Text>
                <Text style={styles.normLabel}>Percentil</Text>
              </View>

              {normalizacao.escore_z !== null && (
                <View style={styles.normCard}>
                  <Text style={styles.normValue}>{normalizacao.escore_z.toFixed(2)}</Text>
                  <Text style={styles.normLabel}>Escore Z</Text>
                </View>
              )}

              {normalizacao.escore_t !== null && (
                <View style={styles.normCard}>
                  <Text style={styles.normValue}>{normalizacao.escore_t}</Text>
                  <Text style={styles.normLabel}>Escore T</Text>
                </View>
              )}
            </View>

            <View style={[
              styles.classification,
              { backgroundColor: getClassificationColor(normalizacao.classificacao) }
            ]}>
              <Text>{normalizacao.classificacao}</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Faixa de Idade</Text>
                <Text style={styles.value}>{normalizacao.faixa_aplicada.idade} anos</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Faixa de Escolaridade</Text>
                <Text style={styles.value}>{normalizacao.faixa_aplicada.escolaridade} anos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureText}>{psicologo.nome_completo}</Text>
          <Text style={styles.signatureText}>CRP: {psicologo.crp}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Este relatório foi gerado automaticamente pela plataforma AxiosControl
          </Text>
          <Text style={styles.footerText}>
            Data de emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
