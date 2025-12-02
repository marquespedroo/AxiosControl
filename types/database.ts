// Database types generated from schema

export interface Database {
  public: {
    Tables: {
      clinicas: {
        Row: Clinica
        Insert: ClinicaInsert
        Update: ClinicaUpdate
      }
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      user_roles: {
        Row: UserRole
        Insert: UserRoleInsert
        Update: UserRoleUpdate
      }
      professional_details: {
        Row: ProfessionalDetails
        Insert: ProfessionalDetailsInsert
        Update: ProfessionalDetailsUpdate
      }
      pacientes: {
        Row: Paciente
        Insert: PacienteInsert
        Update: PacienteUpdate
      }
      testes_templates: {
        Row: TesteTemplate
        Insert: TesteTemplateInsert
        Update: TesteTemplateUpdate
      }
      tabelas_normativas: {
        Row: TabelaNormativa
        Insert: TabelaNormativaInsert
        Update: TabelaNormativaUpdate
      }
      testes_aplicados: {
        Row: TesteAplicado
        Insert: TesteAplicadoInsert
        Update: TesteAplicadoUpdate
      }
      registros_manuais: {
        Row: RegistroManual
        Insert: RegistroManualInsert
        Update: RegistroManualUpdate
      }
      logs_auditoria: {
        Row: LogAuditoria
        Insert: LogAuditoriaInsert
        Update: LogAuditoriaUpdate
      }
      tags: {
        Row: Tag
        Insert: TagInsert
        Update: TagUpdate
      }
      testes_templates_tags: {
        Row: TesteTemplateTag
        Insert: TesteTemplateTagInsert
        Update: TesteTemplateTagUpdate
      }
      professional_availability: {
        Row: ProfessionalAvailability
        Insert: ProfessionalAvailabilityInsert
        Update: ProfessionalAvailabilityUpdate
      }
      appointments: {
        Row: Appointment
        Insert: AppointmentInsert
        Update: AppointmentUpdate
      }
    }
  }
}

// ===================================
// CLINICAS
// ===================================

export interface Clinica {
  id: string
  nome: string
  cnpj: string | null
  endereco: Endereco | null
  telefone: string | null
  email: string | null
  logo_url: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export type ClinicaInsert = Omit<Clinica, 'id' | 'created_at' | 'updated_at'>
export type ClinicaUpdate = Partial<ClinicaInsert>

// ===================================
// USERS
// ===================================

export type UserRoleType = 'super_admin' | 'clinic_admin' | 'psychologist' | 'secretary'

export interface User {
  id: string
  clinica_id: string
  nome_completo: string
  email: string
  senha_hash: string
  ativo: boolean
  ultimo_acesso: string | null
  created_at: string
  updated_at: string
}

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type UserUpdate = Partial<Omit<UserInsert, 'senha_hash'>>

// User without sensitive data
export type UserPublic = Omit<User, 'senha_hash'>

export interface UserWithRoles extends User {
  roles: UserRoleType[]
}

// ===================================
// USER ROLES
// ===================================

export interface UserRole {
  user_id: string
  role: UserRoleType
  created_at: string
}

export type UserRoleInsert = UserRole
export type UserRoleUpdate = never // Roles are just inserted or deleted

// ===================================
// PSICOLOGOS
// ===================================

export interface Psicologo {
  id: string
  clinica_id: string
  nome_completo: string
  email: string
  crp: string
  crp_estado: string
  especialidades: string[] | null
  is_super_admin: boolean
  ativo: boolean
  created_at: string
  updated_at: string
}


// ===================================
// PROFESSIONAL DETAILS
// ===================================

export interface ProfessionalDetails {
  id: string
  user_id: string
  crp: string | null
  crp_estado: string | null
  especialidades: string[] | null
  default_session_duration: number
  break_between_sessions: number
  default_price: number | null
  created_at: string
  updated_at: string
}

export type ProfessionalDetailsInsert = Omit<ProfessionalDetails, 'id' | 'created_at' | 'updated_at'>
export type ProfessionalDetailsUpdate = Partial<ProfessionalDetailsInsert>

// ===================================
// PACIENTES
// ===================================

export interface Paciente {
  id: string
  clinica_id: string
  psicologo_responsavel_id: string | null
  nome_completo: string
  data_nascimento: string
  sexo: string | null
  cpf: string | null
  escolaridade_anos: number
  escolaridade_nivel: string | null
  profissao: string | null
  estado_civil: string | null
  telefone: string | null
  email: string | null
  endereco: Endereco | null
  motivo_encaminhamento: string | null
  observacoes_clinicas: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export type PacienteInsert = Omit<Paciente, 'id' | 'created_at' | 'updated_at'>
export type PacienteUpdate = Partial<PacienteInsert>

// ===================================
// TESTES TEMPLATES
// ===================================

export type TipoTeste = 'escala_likert' | 'multipla_escolha' | 'manual'
export type TipoResposta =
  | 'likert_0_4'
  | 'likert_0_3'
  | 'likert_0_2'
  | 'multipla_escolha'
  | 'verdadeiro_falso'
  | 'texto_livre'
  | 'numero'

export interface Questao {
  numero: number
  texto: string
  subtexto?: string
  secao: string
  tipo_resposta: TipoResposta
  tipo?: string
  escala_opcoes?: Array<{ valor: number; label: string }>
  opcoes?: string[]
  invertida: boolean
  obrigatoria: boolean
  peso: number
  depende_de?: number
  ordem: number
}

export interface OpcaoResposta {
  valor: number
  texto: string
}

export interface EscalasResposta {
  [key: string]: OpcaoResposta[]
}

export interface RegrasCalculoSimples {
  tipo: 'soma_simples'
  questoes_incluidas: number[]
  questoes_invertidas: number[]
  valor_maximo_escala: number
}

export interface RegrasCalculoPonderada {
  tipo: 'soma_ponderada'
  questoes: Array<{ numero: number; peso: number }>
}

export interface SecaoCalculo {
  questoes: number[]
  invertidas: number[]
  peso: number
}

export interface RegrasCalculoSecoes {
  tipo: 'secoes'
  secoes: Record<string, SecaoCalculo>
  score_total: 'soma_secoes'
}

export interface RegrasCalculoCustom {
  tipo: 'custom'
  funcao_calculo: string
}

export type RegrasCalculo =
  | RegrasCalculoSimples
  | RegrasCalculoPonderada
  | RegrasCalculoSecoes
  | RegrasCalculoCustom

export interface TesteTemplate {
  id: string
  nome: string
  nome_completo: string | null
  sigla: string | null
  versao: string | null
  autor: string | null
  ano_publicacao: number | null
  editora: string | null
  referencias_bibliograficas: string[] | null
  tipo: TipoTeste
  faixa_etaria_min: number | null
  faixa_etaria_max: number | null
  tempo_medio_aplicacao: number | null
  aplicacao_permitida: string[] | null
  materiais_necessarios: string[] | null
  questoes: Questao[]
  escalas_resposta: EscalasResposta
  regras_calculo: RegrasCalculo
  interpretacao: any
  ativo: boolean
  publico: boolean
  criado_por: string | null
  // Versioning fields
  versao_origem_id: string | null
  versao_numero: number
  motivo_alteracao: string | null
  alterado_por: string | null
  alterado_em: string | null
  created_at: string
  updated_at: string
}

export type TesteTemplateInsert = Omit<TesteTemplate, 'id' | 'created_at' | 'updated_at'>
export type TesteTemplateUpdate = Partial<TesteTemplateInsert>

// ===================================
// TABELAS NORMATIVAS
// ===================================

export interface FaixaNormativa {
  idade_min: number
  idade_max: number
  escolaridade_min: number
  escolaridade_max: number
  sexo?: string
  n: number
  media: number
  desvio_padrao: number
  percentis: {
    5: number
    10: number
    25: number
    50: number
    75: number
    90: number
    95: number
  }
}

export interface TabelaNormativa {
  id: string
  teste_template_id: string
  nome: string
  pais: string
  regiao: string | null
  ano_coleta: number
  tamanho_amostra: number
  variaveis_estratificacao: string[]
  faixas: FaixaNormativa[]
  ativo: boolean
  padrao: boolean
  created_at: string
  updated_at: string
}

export type TabelaNormativaInsert = Omit<TabelaNormativa, 'id' | 'created_at' | 'updated_at'>
export type TabelaNormativaUpdate = Partial<TabelaNormativaInsert>

// ===================================
// TESTES APLICADOS
// ===================================

export type TipoAplicacao = 'presencial' | 'remota' | 'manual' | 'entrega'
export type StatusTesteAplicado =
  | 'aguardando'
  | 'em_andamento'
  | 'completo'
  | 'reaberto'
  | 'bloqueado'
  | 'expirado'
  | 'abandonado'

export interface Respostas {
  [key: string]: number | string
}

export interface PontuacaoBruta {
  total: number
  secoes?: Record<string, number>
}

export interface Normalizacao {
  tabela_utilizada: string
  faixa_aplicada: {
    idade: string
    escolaridade: string
    sexo?: string
  }
  exact_match: boolean
  percentil: number
  escore_z: number | null
  escore_t: number | null
  classificacao: string
  descricao: string
}

export interface Interpretacao {
  [key: string]: string | string[] | undefined
  classificacao_geral: string
  pontos_atencao: string[]
  recomendacoes: string[]
}

export interface TesteAplicado {
  id: string
  paciente_id: string
  psicologo_id: string
  teste_template_id: string
  tipo_aplicacao: TipoAplicacao
  link_token: string | null
  codigo_acesso: string | null
  tentativas_codigo: number
  status: StatusTesteAplicado
  respostas: Respostas | null
  progresso: number
  data_criacao: string
  data_primeiro_acesso: string | null
  data_conclusao: string | null
  data_reabertura: string | null
  motivo_reabertura: string | null
  data_expiracao: string | null
  pontuacao_bruta: PontuacaoBruta | null
  normalizacao: Normalizacao | null
  interpretacao: Interpretacao | null
  tabela_normativa_id: string | null
  metadata?: any
  created_at: string
  updated_at: string
}

export type TesteAplicadoInsert = Omit<TesteAplicado, 'id' | 'created_at' | 'updated_at'>
export type TesteAplicadoUpdate = Partial<TesteAplicadoInsert>

// ===================================
// REGISTROS MANUAIS
// ===================================

export interface Anexo {
  url: string
  nome: string
  tipo: string
  tamanho: number
}

export interface RegistroManual {
  id: string
  paciente_id: string
  psicologo_id: string
  nome_teste: string
  data_aplicacao: string
  resultado_texto: string | null
  observacoes: string | null
  anexos: Anexo[] | null
  created_at: string
  updated_at: string
}

export type RegistroManualInsert = Omit<RegistroManual, 'id' | 'created_at' | 'updated_at'>
export type RegistroManualUpdate = Partial<RegistroManualInsert>

// ===================================
// LOGS AUDITORIA
// ===================================

export type AcaoAuditoria = 'visualizar' | 'criar' | 'editar' | 'deletar' | 'exportar'

export interface LogAuditoria {
  id: string
  usuario_id: string | null
  acao: AcaoAuditoria
  entidade: string
  entidade_id: string
  dados_anteriores: any
  dados_novos: any
  ip_origem: string | null
  user_agent: string | null
  timestamp: string
}

export type LogAuditoriaInsert = Omit<LogAuditoria, 'id' | 'timestamp'>
export type LogAuditoriaUpdate = never // Logs are immutable

// ===================================
// SHARED TYPES
// ===================================

export interface Endereco {
  [key: string]: string | null | undefined
  rua: string | null
  numero: string | null
  complemento?: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
}

// ===================================
// API RESPONSE TYPES
// ===================================

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  message: string
  details?: any
}

// ===================================
// CALCULATION TYPES
// ===================================

export interface CalculationResult {
  pontuacao_bruta: PontuacaoBruta
  normalizacao?: Normalizacao
  interpretacao?: Interpretacao
}

export interface PatientDemographics {
  idade: number
  escolaridade_anos: number
  sexo: string
}

// ===================================
// AUTH TYPES
// ===================================

export interface AuthUser {
  id: string
  email: string
  nome_completo: string
  roles: UserRoleType[]
  clinica_id: string
  crp?: string
}

export interface AuthSession {
  user: AuthUser
  token: string
  refreshToken: string
}

// ===================================
// PRONTUARIO (MEDICAL RECORD) TYPES
// ===================================

export interface ProntuarioResumo {
  total_avaliacoes: number
  primeira_avaliacao: string | null
  ultima_avaliacao: string | null
}

export interface AvaliacaoProntuario {
  id: string
  teste_template: {
    nome: string
    sigla: string
  }
  data_aplicacao: string
  tipo_aplicacao: TipoAplicacao
  status: StatusTesteAplicado
  pontuacao_bruta: PontuacaoBruta | null
  normalizacao: Normalizacao | null
  psicologo: {
    nome_completo: string
  }
}

export interface Prontuario {
  paciente: {
    id: string
    nome_completo: string
    idade_atual: number
  }
  resumo: ProntuarioResumo
  avaliacoes: AvaliacaoProntuario[]
  registros_manuais: Array<{
    id: string
    nome_teste: string
    data_aplicacao: string
    resultado_texto: string | null
    anexos: Anexo[] | null
  }>
}

// ===================================
// TAGS (CATEGORIZAÇÃO DE TESTES)
// ===================================

export type CategoriaTag = 'populacao' | 'dominio_clinico' | 'faixa_etaria' | 'instrumento'

export interface Tag {
  id: string
  nome: string
  slug: string
  descricao: string | null
  categoria: CategoriaTag
  cor: string
  icone: string | null
  ordem: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export type TagInsert = Omit<Tag, 'id' | 'created_at' | 'updated_at'>
export type TagUpdate = Partial<TagInsert>

// Simplified tag for display purposes
export interface TagSimple {
  id: string
  nome: string
  slug: string
  categoria: CategoriaTag
  cor: string
  icone: string | null
}

// ===================================
// TESTES_TEMPLATES_TAGS (JUNCTION TABLE)
// ===================================

export interface TesteTemplateTag {
  id: string
  teste_template_id: string
  tag_id: string
  created_at: string
}

export type TesteTemplateTagInsert = Omit<TesteTemplateTag, 'id' | 'created_at'>
export type TesteTemplateTagUpdate = Partial<TesteTemplateTagInsert>

// ===================================
// EXTENDED TYPES WITH TAGS
// ===================================

export interface TesteTemplateWithTags extends TesteTemplate {
  tags: TagSimple[]
}

export interface TagWithCount extends Tag {
  teste_count: number
}

// ===================================
// CONFIGURAÇÕES DO SISTEMA
// ===================================

export interface ConfiguracaoSistema {
  id: string
  clinica_id: string | null
  chave: string
  valor: unknown
  descricao: string | null
  created_at: string
  updated_at: string
}

export type ConfiguracaoSistemaInsert = Omit<ConfiguracaoSistema, 'id' | 'created_at' | 'updated_at'>
export type ConfiguracaoSistemaUpdate = Partial<ConfiguracaoSistemaInsert>

// ===================================
// LINKS PACIENTE (HUB)
// ===================================

export type StatusLinkPaciente = 'ativo' | 'expirado' | 'revogado' | 'completo'

export interface LinkPaciente {
  id: string
  paciente_id: string
  psicologo_id: string
  clinica_id: string
  link_token: string
  codigo_acesso_hash: string
  codigo_acesso_plain: string | null
  data_expiracao: string
  status: StatusLinkPaciente
  primeiro_acesso: string | null
  ultimo_acesso: string | null
  tentativas_falhas: number
  bloqueado: boolean
  created_at: string
  updated_at: string
}

export type LinkPacienteInsert = Omit<LinkPaciente, 'id' | 'created_at' | 'updated_at'>
export type LinkPacienteUpdate = Partial<Omit<LinkPacienteInsert, 'link_token' | 'clinica_id' | 'paciente_id'>>

// ===================================
// LINK TESTES (JUNCTION)
// ===================================

export interface LinkTeste {
  id: string
  link_id: string
  teste_aplicado_id: string
  ordem: number
  created_at: string
}

export type LinkTesteInsert = Omit<LinkTeste, 'id' | 'created_at'>
export type LinkTesteUpdate = Partial<Pick<LinkTeste, 'ordem'>>

// ===================================
// MODO APLICAÇÃO
// ===================================

export type ModoAplicacao = 'presencial' | 'entrega' | 'link'

// ===================================
// EXTENDED TYPES FOR LINKS
// ===================================

export interface LinkPacienteWithDetails extends LinkPaciente {
  paciente: Pick<Paciente, 'id' | 'nome_completo' | 'data_nascimento'>
  psicologo: Pick<User, 'id' | 'nome_completo'>
  testes: LinkTesteWithDetails[]
  total_testes: number
  testes_completos: number
  progresso_geral: number
}

export interface LinkTesteWithDetails extends LinkTeste {
  teste_aplicado: Pick<TesteAplicado, 'id' | 'status' | 'progresso' | 'data_conclusao'>
  teste_template: Pick<TesteTemplate, 'id' | 'nome' | 'sigla'>
}

export interface TesteAplicadoWithTemplate extends TesteAplicado {
  teste_template: TesteTemplate
}

// ===================================
// SCHEDULE MANAGEMENT
// ===================================

export interface ProfessionalAvailability {
  id: string
  user_id: string
  day_of_week: number // 0-6
  start_time: string // HH:MM:SS
  end_time: string // HH:MM:SS
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProfessionalAvailabilityInsert = Omit<ProfessionalAvailability, 'id' | 'created_at' | 'updated_at'>
export type ProfessionalAvailabilityUpdate = Partial<ProfessionalAvailabilityInsert>

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  clinica_id: string
  professional_id: string
  patient_id: string
  start_time: string // ISO timestamp
  end_time: string // ISO timestamp
  status: AppointmentStatus
  payment_type: 'particular' | 'plano_saude'
  insurance_product_id: string | null
  price: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type AppointmentInsert = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
export type AppointmentUpdate = Partial<AppointmentInsert>

export interface AppointmentWithDetails extends Appointment {
  patient: Pick<Paciente, 'id' | 'nome_completo'>
  professional: Pick<User, 'id' | 'nome_completo'>
  insurance_product?: Pick<InsuranceProduct, 'id' | 'name'>
}

// ===================================
// SETTINGS MODULE (HEALTH INSURANCE)
// ===================================

export interface HealthInsurance {
  id: string
  clinica_id: string
  name: string
  active: boolean
  created_at: string
  updated_at: string
}

export type HealthInsuranceInsert = Omit<HealthInsurance, 'id' | 'created_at' | 'updated_at'>
export type HealthInsuranceUpdate = Partial<HealthInsuranceInsert>

export interface InsuranceProduct {
  id: string
  insurance_id: string
  name: string
  price: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export type InsuranceProductInsert = Omit<InsuranceProduct, 'id' | 'created_at' | 'updated_at'>
export type InsuranceProductUpdate = Partial<InsuranceProductInsert>

export interface InsuranceProductWithDetails extends InsuranceProduct {
  insurance: Pick<HealthInsurance, 'id' | 'name'>
}

// ===================================
// FINANCIAL MODULE
// ===================================

export type TransactionType = 'receita' | 'despesa'
export type TransactionStatus = 'pending' | 'paid' | 'cancelled'
export type PaymentMethodType = 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'bank_slip' | 'insurance' | 'other'

export interface FinancialCategory {
  id: string
  clinica_id: string
  name: string
  type: TransactionType
  active: boolean
  created_at: string
  updated_at: string
}

export type FinancialCategoryInsert = Omit<FinancialCategory, 'id' | 'created_at' | 'updated_at'>
export type FinancialCategoryUpdate = Partial<FinancialCategoryInsert>

export interface PaymentMethod {
  id: string
  clinica_id: string
  name: string
  type: PaymentMethodType
  days_to_receive: number
  fee_percentage: number
  active: boolean
  created_at: string
  updated_at: string
}

export type PaymentMethodInsert = Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>
export type PaymentMethodUpdate = Partial<PaymentMethodInsert>

export interface FinancialTransaction {
  id: string
  clinica_id: string
  description: string
  amount: number
  type: TransactionType
  category_id: string | null
  payment_method_id: string | null
  transaction_date: string
  due_date: string
  status: TransactionStatus
  appointment_id: string | null
  patient_id: string | null
  created_at: string
  updated_at: string
}

export type FinancialTransactionInsert = Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>
export type FinancialTransactionUpdate = Partial<FinancialTransactionInsert>

export interface FinancialTransactionWithDetails extends FinancialTransaction {
  category?: Pick<FinancialCategory, 'id' | 'name'>
  payment_method?: Pick<PaymentMethod, 'id' | 'name'>
  patient?: Pick<Paciente, 'id' | 'nome_completo'>
}
