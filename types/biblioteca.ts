// ===================================
// BIBLIOTECA DE TESTES TYPES
// Types for Test Library CRUD and Versioning
// ===================================

import {
  TesteTemplate,
  Questao,
  EscalasResposta,
  RegrasCalculo,
  TipoTeste,
  TipoResposta,
  OpcaoResposta
} from './database'

// ===================================
// FORM MODES
// ===================================

export type FormMode = 'create' | 'edit' | 'view'

// ===================================
// TEST BASIC INFO
// ===================================

export interface TestBasicInfoFormData {
  nome: string
  nome_completo: string
  sigla: string
  versao: string
  autor: string
  ano_publicacao: number | null
  editora: string
  tipo: TipoTeste
  faixa_etaria_min: number | null
  faixa_etaria_max: number | null
  tempo_medio_aplicacao: number | null
  publico: boolean
  ativo: boolean
}

// ===================================
// QUESTION EDITOR
// ===================================

export interface QuestionFormData {
  numero: number
  texto: string
  subtexto: string
  secao: string
  tipo_resposta: TipoResposta
  opcoes: string[]
  invertida: boolean
  obrigatoria: boolean
  peso: number
  ordem: number
}

/**
 * Converts Questao from database to QuestionFormData for editing
 */
export function questaoToFormData(questao: Questao): QuestionFormData {
  return {
    numero: questao.numero,
    texto: questao.texto,
    subtexto: questao.subtexto || '',
    secao: questao.secao,
    tipo_resposta: questao.tipo_resposta,
    opcoes: questao.opcoes || [],
    invertida: questao.invertida,
    obrigatoria: questao.obrigatoria,
    peso: questao.peso,
    ordem: questao.ordem
  }
}

/**
 * Converts QuestionFormData back to Questao for saving
 */
export function formDataToQuestao(data: QuestionFormData): Questao {
  return {
    numero: data.numero,
    texto: data.texto,
    subtexto: data.subtexto || undefined,
    secao: data.secao,
    tipo_resposta: data.tipo_resposta,
    opcoes: data.opcoes.length > 0 ? data.opcoes : undefined,
    invertida: data.invertida,
    obrigatoria: data.obrigatoria,
    peso: data.peso,
    ordem: data.ordem
  }
}

// ===================================
// ANSWER SCALES
// ===================================

export interface AnswerScaleFormData {
  key: string
  opcoes: OpcaoResposta[]
}

/**
 * Predefined scales for quick selection
 */
export const PREDEFINED_SCALES: Record<string, OpcaoResposta[]> = {
  likert_0_4: [
    { valor: 0, texto: 'Nunca' },
    { valor: 1, texto: 'Raramente' },
    { valor: 2, texto: 'Às vezes' },
    { valor: 3, texto: 'Frequentemente' },
    { valor: 4, texto: 'Sempre' }
  ],
  likert_0_3: [
    { valor: 0, texto: 'Nunca verdade' },
    { valor: 1, texto: 'Raramente verdade' },
    { valor: 2, texto: 'Às vezes verdade' },
    { valor: 3, texto: 'Frequentemente verdade' }
  ],
  likert_0_2: [
    { valor: 0, texto: 'Não' },
    { valor: 1, texto: 'Às vezes' },
    { valor: 2, texto: 'Sim' }
  ],
  verdadeiro_falso: [
    { valor: 1, texto: 'Verdadeiro' },
    { valor: 0, texto: 'Falso' }
  ]
}

/**
 * Scale display names for UI
 */
export const SCALE_LABELS: Record<string, string> = {
  likert_0_4: 'Likert 0-4 (5 pontos)',
  likert_0_3: 'Likert 0-3 (4 pontos)',
  likert_0_2: 'Likert 0-2 (3 pontos)',
  verdadeiro_falso: 'Verdadeiro/Falso',
  multipla_escolha: 'Múltipla Escolha',
  texto_livre: 'Texto Livre',
  numero: 'Numérico'
}

// ===================================
// SCORING RULES
// ===================================

export interface SectionScoreFormData {
  nome: string
  questoes: number[]
  invertidas: number[]
  peso: number
}

export interface ScoringRulesFormData {
  tipo: 'soma_simples' | 'soma_ponderada' | 'secoes' | 'custom'
  // For soma_simples
  questoes_incluidas: number[]
  questoes_invertidas: number[]
  valor_maximo_escala: number
  // For soma_ponderada
  questoes_ponderadas: Array<{ numero: number; peso: number }>
  // For secoes
  secoes: SectionScoreFormData[]
  score_total: string
  // For custom
  funcao_calculo: string
}

/**
 * Converts RegrasCalculo to ScoringRulesFormData for editing
 */
export function regrasToFormData(regras: RegrasCalculo): ScoringRulesFormData {
  const base: ScoringRulesFormData = {
    tipo: regras.tipo,
    questoes_incluidas: [],
    questoes_invertidas: [],
    valor_maximo_escala: 4,
    questoes_ponderadas: [],
    secoes: [],
    score_total: 'soma_secoes',
    funcao_calculo: ''
  }

  switch (regras.tipo) {
    case 'soma_simples':
      return {
        ...base,
        questoes_incluidas: regras.questoes_incluidas,
        questoes_invertidas: regras.questoes_invertidas,
        valor_maximo_escala: regras.valor_maximo_escala
      }
    case 'soma_ponderada':
      return {
        ...base,
        questoes_ponderadas: regras.questoes
      }
    case 'secoes':
      return {
        ...base,
        secoes: Object.entries(regras.secoes).map(([nome, secao]) => ({
          nome,
          questoes: secao.questoes,
          invertidas: secao.invertidas,
          peso: secao.peso
        })),
        score_total: regras.score_total
      }
    case 'custom':
      return {
        ...base,
        funcao_calculo: regras.funcao_calculo
      }
    default:
      return base
  }
}

/**
 * Converts ScoringRulesFormData back to RegrasCalculo for saving
 */
export function formDataToRegras(data: ScoringRulesFormData): RegrasCalculo {
  switch (data.tipo) {
    case 'soma_simples':
      return {
        tipo: 'soma_simples',
        questoes_incluidas: data.questoes_incluidas,
        questoes_invertidas: data.questoes_invertidas,
        valor_maximo_escala: data.valor_maximo_escala
      }
    case 'soma_ponderada':
      return {
        tipo: 'soma_ponderada',
        questoes: data.questoes_ponderadas
      }
    case 'secoes':
      return {
        tipo: 'secoes',
        secoes: data.secoes.reduce((acc, secao) => {
          acc[secao.nome] = {
            questoes: secao.questoes,
            invertidas: secao.invertidas,
            peso: secao.peso
          }
          return acc
        }, {} as Record<string, { questoes: number[]; invertidas: number[]; peso: number }>),
        score_total: 'soma_secoes'
      }
    case 'custom':
      return {
        tipo: 'custom',
        funcao_calculo: data.funcao_calculo
      }
  }
}

// ===================================
// VERSION HISTORY
// ===================================

export interface TestVersion {
  id: string
  versao: string | null
  versao_numero: number
  motivo_alteracao: string | null
  alterado_por: string | null
  alterado_por_nome: string | null
  alterado_em: string | null
  ativo: boolean
  created_at: string
}

// ===================================
// COMPONENT PROPS
// ===================================

export interface TestBasicInfoFormProps {
  data: TestBasicInfoFormData
  onChange: (data: TestBasicInfoFormData) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export interface QuestionsEditorProps {
  questions: QuestionFormData[]
  onChange: (questions: QuestionFormData[]) => void
  availableScales: string[]
  errors?: Record<string, string>
  disabled?: boolean
}

export interface QuestionItemEditorProps {
  question: QuestionFormData
  index: number
  onChange: (question: QuestionFormData) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onDuplicate?: () => void
  availableScales: string[]
  disabled?: boolean
  isFirst?: boolean
  isLast?: boolean
}

export interface AnswerScalesEditorProps {
  scales: EscalasResposta
  onChange: (scales: EscalasResposta) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export interface ScoringRulesEditorProps {
  rules: ScoringRulesFormData
  onChange: (rules: ScoringRulesFormData) => void
  questionNumbers: number[]
  sections: string[]
  errors?: Record<string, string>
  disabled?: boolean
}

export interface VersionHistoryProps {
  versions: TestVersion[]
  currentVersionId: string
  onRestore: (versionId: string) => void
  onViewVersion?: (versionId: string) => void
  disabled?: boolean
}

// ===================================
// API PAYLOADS
// ===================================

export interface CreateTestVersionPayload {
  motivo_alteracao: string
  changes: Partial<TesteTemplate>
}

export interface RestoreVersionPayload {
  versionId: string
  motivo?: string
}

// ===================================
// EXTENDED TYPES
// ===================================

export interface TestWithVersions extends TesteTemplate {
  versions: TestVersion[]
}

// ===================================
// FORM VALIDATION
// ===================================

export interface ValidationError {
  field: string
  message: string
}

export function validateBasicInfo(data: TestBasicInfoFormData): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.nome || data.nome.length < 3) {
    errors.push({ field: 'nome', message: 'Nome deve ter pelo menos 3 caracteres' })
  }

  if (data.faixa_etaria_min !== null && data.faixa_etaria_max !== null) {
    if (data.faixa_etaria_min > data.faixa_etaria_max) {
      errors.push({
        field: 'faixa_etaria_min',
        message: 'Idade mínima não pode ser maior que idade máxima'
      })
    }
  }

  if (data.ano_publicacao !== null) {
    const currentYear = new Date().getFullYear()
    if (data.ano_publicacao < 1900 || data.ano_publicacao > currentYear) {
      errors.push({
        field: 'ano_publicacao',
        message: `Ano deve estar entre 1900 e ${currentYear}`
      })
    }
  }

  return errors
}

export function validateQuestions(questions: QuestionFormData[]): ValidationError[] {
  const errors: ValidationError[] = []

  if (questions.length === 0) {
    errors.push({ field: 'questions', message: 'Adicione pelo menos uma questão' })
  }

  questions.forEach((q, index) => {
    if (!q.texto || q.texto.trim().length === 0) {
      errors.push({
        field: `question_${index}_texto`,
        message: `Questão ${q.numero}: texto é obrigatório`
      })
    }

    if (!q.secao || q.secao.trim().length === 0) {
      errors.push({
        field: `question_${index}_secao`,
        message: `Questão ${q.numero}: seção é obrigatória`
      })
    }

    if (q.tipo_resposta === 'multipla_escolha' && (!q.opcoes || q.opcoes.length < 2)) {
      errors.push({
        field: `question_${index}_opcoes`,
        message: `Questão ${q.numero}: múltipla escolha requer pelo menos 2 opções`
      })
    }
  })

  return errors
}

// ===================================
// DEFAULT VALUES
// ===================================

export function getDefaultBasicInfo(): TestBasicInfoFormData {
  return {
    nome: '',
    nome_completo: '',
    sigla: '',
    versao: '1.0',
    autor: '',
    ano_publicacao: null,
    editora: '',
    tipo: 'escala_likert',
    faixa_etaria_min: null,
    faixa_etaria_max: null,
    tempo_medio_aplicacao: null,
    publico: false,
    ativo: true
  }
}

export function getDefaultQuestion(numero: number): QuestionFormData {
  return {
    numero,
    texto: '',
    subtexto: '',
    secao: '',
    tipo_resposta: 'likert_0_4',
    opcoes: [],
    invertida: false,
    obrigatoria: true,
    peso: 1,
    ordem: numero
  }
}

export function getDefaultScoringRules(): ScoringRulesFormData {
  return {
    tipo: 'soma_simples',
    questoes_incluidas: [],
    questoes_invertidas: [],
    valor_maximo_escala: 4,
    questoes_ponderadas: [],
    secoes: [],
    score_total: 'soma_secoes',
    funcao_calculo: ''
  }
}
