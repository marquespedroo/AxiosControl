
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      clinicas: {
        Row: {
          ativo: boolean | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: Json | null
          id: string
          logo_url: string | null
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: Json | null
          id?: string
          logo_url?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: Json | null
          id?: string
          logo_url?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracoes_sistema: {
        Row: {
          chave: string
          clinica_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          updated_at: string | null
          valor: Json
        }
        Insert: {
          chave: string
          clinica_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor: Json
        }
        Update: {
          chave?: string
          clinica_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor?: Json
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_sistema_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "configuracoes_sistema_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["clinica_id"]
          },
        ]
      }
      link_testes: {
        Row: {
          created_at: string | null
          id: string
          link_id: string
          ordem: number
          teste_aplicado_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_id: string
          ordem?: number
          teste_aplicado_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link_id?: string
          ordem?: number
          teste_aplicado_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_testes_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links_paciente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_testes_teste_aplicado_id_fkey"
            columns: ["teste_aplicado_id"]
            isOneToOne: true
            referencedRelation: "testes_aplicados"
            referencedColumns: ["id"]
          },
        ]
      }
      links_paciente: {
        Row: {
          bloqueado: boolean
          clinica_id: string
          codigo_acesso_hash: string
          codigo_acesso_plain: string | null
          created_at: string | null
          data_expiracao: string
          id: string
          link_token: string
          paciente_id: string
          primeiro_acesso: string | null
          psicologo_id: string
          status: string
          tentativas_falhas: number
          ultimo_acesso: string | null
          updated_at: string | null
        }
        Insert: {
          bloqueado?: boolean
          clinica_id: string
          codigo_acesso_hash: string
          codigo_acesso_plain?: string | null
          created_at?: string | null
          data_expiracao: string
          id?: string
          link_token: string
          paciente_id: string
          primeiro_acesso?: string | null
          psicologo_id: string
          status?: string
          tentativas_falhas?: number
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Update: {
          bloqueado?: boolean
          clinica_id?: string
          codigo_acesso_hash?: string
          codigo_acesso_plain?: string | null
          created_at?: string | null
          data_expiracao?: string
          id?: string
          link_token?: string
          paciente_id?: string
          primeiro_acesso?: string | null
          psicologo_id?: string
          status?: string
          tentativas_falhas?: number
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "links_paciente_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_paciente_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["clinica_id"]
          },
          {
            foreignKeyName: "links_paciente_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_paciente_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes_com_escolaridade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_paciente_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_auditoria: {
        Row: {
          acao: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          entidade: string
          entidade_id: string
          id: string
          ip_origem: unknown
          timestamp: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          entidade: string
          entidade_id: string
          id?: string
          ip_origem?: unknown
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          entidade?: string
          entidade_id?: string
          id?: string
          ip_origem?: unknown
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          ativo: boolean | null
          clinica_id: string
          cpf: string | null
          created_at: string | null
          data_nascimento: string
          email: string | null
          endereco: Json | null
          escolaridade_anos: number | null
          escolaridade_nivel: string | null
          estado_civil: string | null
          id: string
          motivo_encaminhamento: string | null
          nome_completo: string
          observacoes_clinicas: string | null
          profissao: string | null
          psicologo_responsavel_id: string | null
          sexo: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          clinica_id: string
          cpf?: string | null
          created_at?: string | null
          data_nascimento: string
          email?: string | null
          endereco?: Json | null
          escolaridade_anos?: number | null
          escolaridade_nivel?: string | null
          estado_civil?: string | null
          id?: string
          motivo_encaminhamento?: string | null
          nome_completo: string
          observacoes_clinicas?: string | null
          profissao?: string | null
          psicologo_responsavel_id?: string | null
          sexo?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          clinica_id?: string
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string
          email?: string | null
          endereco?: Json | null
          escolaridade_anos?: number | null
          escolaridade_nivel?: string | null
          estado_civil?: string | null
          id?: string
          motivo_encaminhamento?: string | null
          nome_completo?: string
          observacoes_clinicas?: string | null
          profissao?: string | null
          psicologo_responsavel_id?: string | null
          sexo?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["clinica_id"]
          },
          {
            foreignKeyName: "pacientes_psicologo_responsavel_id_fkey"
            columns: ["psicologo_responsavel_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      psicologos: {
        Row: {
          ativo: boolean | null
          clinica_id: string
          created_at: string | null
          crp: string
          crp_estado: string
          email: string
          especialidades: string[] | null
          id: string
          is_super_admin: boolean
          nome_completo: string
          senha_hash: string
          ultimo_acesso: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          clinica_id: string
          created_at?: string | null
          crp: string
          crp_estado: string
          email: string
          especialidades?: string[] | null
          id?: string
          is_super_admin?: boolean
          nome_completo: string
          senha_hash: string
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          clinica_id?: string
          created_at?: string | null
          crp?: string
          crp_estado?: string
          email?: string
          especialidades?: string[] | null
          id?: string
          is_super_admin?: boolean
          nome_completo?: string
          senha_hash?: string
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psicologos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psicologos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["clinica_id"]
          },
        ]
      }
      registros_manuais: {
        Row: {
          anexos: Json | null
          created_at: string | null
          data_aplicacao: string
          id: string
          nome_teste: string
          observacoes: string | null
          paciente_id: string
          psicologo_id: string
          resultado_texto: string | null
          updated_at: string | null
        }
        Insert: {
          anexos?: Json | null
          created_at?: string | null
          data_aplicacao: string
          id?: string
          nome_teste: string
          observacoes?: string | null
          paciente_id: string
          psicologo_id: string
          resultado_texto?: string | null
          updated_at?: string | null
        }
        Update: {
          anexos?: Json | null
          created_at?: string | null
          data_aplicacao?: string
          id?: string
          nome_teste?: string
          observacoes?: string | null
          paciente_id?: string
          psicologo_id?: string
          resultado_texto?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registros_manuais_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_manuais_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes_com_escolaridade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_manuais_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      tabelas_normativas: {
        Row: {
          ano_coleta: number
          ativo: boolean | null
          created_at: string | null
          faixas: Json
          id: string
          nome: string
          padrao: boolean | null
          pais: string | null
          regiao: string | null
          tamanho_amostra: number
          teste_template_id: string
          updated_at: string | null
          variaveis_estratificacao: string[]
        }
        Insert: {
          ano_coleta: number
          ativo?: boolean | null
          created_at?: string | null
          faixas: Json
          id?: string
          nome: string
          padrao?: boolean | null
          pais?: string | null
          regiao?: string | null
          tamanho_amostra: number
          teste_template_id: string
          updated_at?: string | null
          variaveis_estratificacao: string[]
        }
        Update: {
          ano_coleta?: number
          ativo?: boolean | null
          created_at?: string | null
          faixas?: Json
          id?: string
          nome?: string
          padrao?: boolean | null
          pais?: string | null
          regiao?: string | null
          tamanho_amostra?: number
          teste_template_id?: string
          updated_at?: string | null
          variaveis_estratificacao?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "tabelas_normativas_teste_template_id_fkey"
            columns: ["teste_template_id"]
            isOneToOne: false
            referencedRelation: "testes_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          ativo: boolean | null
          categoria: string
          cor: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      testes_aplicados: {
        Row: {
          codigo_acesso: string | null
          created_at: string | null
          data_conclusao: string | null
          data_criacao: string | null
          data_expiracao: string | null
          data_primeiro_acesso: string | null
          data_reabertura: string | null
          id: string
          interpretacao: Json | null
          link_token: string | null
          metadata: Json | null
          motivo_reabertura: string | null
          normalizacao: Json | null
          paciente_id: string
          pontuacao_bruta: Json | null
          progresso: number | null
          psicologo_id: string
          respostas: Json | null
          status: string | null
          tabela_normativa_id: string | null
          tentativas_codigo: number | null
          teste_template_id: string
          tipo_aplicacao: string
          updated_at: string | null
        }
        Insert: {
          codigo_acesso?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_criacao?: string | null
          data_expiracao?: string | null
          data_primeiro_acesso?: string | null
          data_reabertura?: string | null
          id?: string
          interpretacao?: Json | null
          link_token?: string | null
          metadata?: Json | null
          motivo_reabertura?: string | null
          normalizacao?: Json | null
          paciente_id: string
          pontuacao_bruta?: Json | null
          progresso?: number | null
          psicologo_id: string
          respostas?: Json | null
          status?: string | null
          tabela_normativa_id?: string | null
          tentativas_codigo?: number | null
          teste_template_id: string
          tipo_aplicacao: string
          updated_at?: string | null
        }
        Update: {
          codigo_acesso?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_criacao?: string | null
          data_expiracao?: string | null
          data_primeiro_acesso?: string | null
          data_reabertura?: string | null
          id?: string
          interpretacao?: Json | null
          link_token?: string | null
          metadata?: Json | null
          motivo_reabertura?: string | null
          normalizacao?: Json | null
          paciente_id?: string
          pontuacao_bruta?: Json | null
          progresso?: number | null
          psicologo_id?: string
          respostas?: Json | null
          status?: string | null
          tabela_normativa_id?: string | null
          tentativas_codigo?: number | null
          teste_template_id?: string
          tipo_aplicacao?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testes_aplicados_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_aplicados_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes_com_escolaridade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_aplicados_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_aplicados_tabela_normativa_id_fkey"
            columns: ["tabela_normativa_id"]
            isOneToOne: false
            referencedRelation: "tabelas_normativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_aplicados_teste_template_id_fkey"
            columns: ["teste_template_id"]
            isOneToOne: false
            referencedRelation: "testes_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      testes_templates: {
        Row: {
          ano_publicacao: number | null
          aplicacao_permitida: string[] | null
          ativo: boolean | null
          autor: string | null
          created_at: string | null
          criado_por: string | null
          editora: string | null
          escalas_resposta: Json
          faixa_etaria_max: number | null
          faixa_etaria_min: number | null
          id: string
          interpretacao: Json | null
          materiais_necessarios: string[] | null
          nome: string
          nome_completo: string | null
          publico: boolean | null
          questoes: Json
          referencias_bibliograficas: string[] | null
          regras_calculo: Json
          sigla: string | null
          tempo_medio_aplicacao: number | null
          tipo: string
          updated_at: string | null
          versao: string | null
        }
        Insert: {
          ano_publicacao?: number | null
          aplicacao_permitida?: string[] | null
          ativo?: boolean | null
          autor?: string | null
          created_at?: string | null
          criado_por?: string | null
          editora?: string | null
          escalas_resposta: Json
          faixa_etaria_max?: number | null
          faixa_etaria_min?: number | null
          id?: string
          interpretacao?: Json | null
          materiais_necessarios?: string[] | null
          nome: string
          nome_completo?: string | null
          publico?: boolean | null
          questoes: Json
          referencias_bibliograficas?: string[] | null
          regras_calculo: Json
          sigla?: string | null
          tempo_medio_aplicacao?: number | null
          tipo: string
          updated_at?: string | null
          versao?: string | null
        }
        Update: {
          ano_publicacao?: number | null
          aplicacao_permitida?: string[] | null
          ativo?: boolean | null
          autor?: string | null
          created_at?: string | null
          criado_por?: string | null
          editora?: string | null
          escalas_resposta?: Json
          faixa_etaria_max?: number | null
          faixa_etaria_min?: number | null
          id?: string
          interpretacao?: Json | null
          materiais_necessarios?: string[] | null
          nome?: string
          nome_completo?: string | null
          publico?: boolean | null
          questoes?: Json
          referencias_bibliograficas?: string[] | null
          regras_calculo?: Json
          sigla?: string | null
          tempo_medio_aplicacao?: number | null
          tipo?: string
          updated_at?: string | null
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testes_templates_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      testes_templates_tags: {
        Row: {
          created_at: string | null
          id: string
          tag_id: string
          teste_template_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tag_id: string
          teste_template_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tag_id?: string
          teste_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testes_templates_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_templates_tags_teste_template_id_fkey"
            columns: ["teste_template_id"]
            isOneToOne: false
            referencedRelation: "testes_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          avaliacoes_mes_atual: number | null
          avaliacoes_pendentes: number | null
          clinica_id: string | null
          total_avaliacoes: number | null
          total_pacientes: number | null
        }
        Relationships: []
      }
      pacientes_com_escolaridade: {
        Row: {
          anos_estudo_efetivos: number | null
          ativo: boolean | null
          clinica_id: string | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          endereco: Json | null
          escolaridade_anos: number | null
          escolaridade_nivel: string | null
          estado_civil: string | null
          id: string | null
          motivo_encaminhamento: string | null
          nome_completo: string | null
          observacoes_clinicas: string | null
          profissao: string | null
          psicologo_responsavel_id: string | null
          sexo: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          anos_estudo_efetivos?: never
          ativo?: boolean | null
          clinica_id?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: Json | null
          escolaridade_anos?: number | null
          escolaridade_nivel?: string | null
          estado_civil?: string | null
          id?: string | null
          motivo_encaminhamento?: string | null
          nome_completo?: string | null
          observacoes_clinicas?: string | null
          profissao?: string | null
          psicologo_responsavel_id?: string | null
          sexo?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          anos_estudo_efetivos?: never
          ativo?: boolean | null
          clinica_id?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: Json | null
          escolaridade_anos?: number | null
          escolaridade_nivel?: string | null
          estado_civil?: string | null
          id?: string | null
          motivo_encaminhamento?: string | null
          nome_completo?: string | null
          observacoes_clinicas?: string | null
          profissao?: string | null
          psicologo_responsavel_id?: string | null
          sexo?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["clinica_id"]
          },
          {
            foreignKeyName: "pacientes_psicologo_responsavel_id_fkey"
            columns: ["psicologo_responsavel_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      autenticar_link_remoto: {
        Args: { p_codigo_acesso: string; p_link_token: string }
        Returns: {
          autenticado: boolean
          mensagem: string
          teste_aplicado_id: string
        }[]
      }
      buscar_faixa_normativa: {
        Args: {
          p_escolaridade_anos: number
          p_idade: number
          p_sexo: string
          p_teste_template_id: string
        }
        Returns: Json
      }
      calcular_idade: { Args: { data_nascimento: string }; Returns: number }
      escolaridade_nivel_to_anos: { Args: { nivel: string }; Returns: number }
      get_active_link_for_patient: {
        Args: { p_clinica_id: string; p_paciente_id: string }
        Returns: string
      }
      get_config: {
        Args: { p_chave: string; p_clinica_id?: string }
        Returns: Json
      }
      get_teste_tags: { Args: { p_teste_template_id: string }; Returns: Json }
      is_clinic_admin: { Args: never; Returns: boolean }
      owns_patient: { Args: { patient_id: string }; Returns: boolean }
      search_testes_by_tags: {
        Args: { p_tag_slugs: string[] }
        Returns: {
          match_count: number
          teste_template_id: string
        }[]
      }
      user_clinica_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
