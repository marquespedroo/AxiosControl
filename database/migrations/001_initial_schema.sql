-- ===================================
-- MIGRATION 001: Initial Schema
-- NeuroTest Platform Database
-- ===================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================
-- ORGANIZAÇÕES E USUÁRIOS
-- ===================================

CREATE TABLE clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  endereco JSONB,
  telefone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT clinicas_nome_min_length CHECK (LENGTH(nome) >= 3)
);

CREATE INDEX idx_clinicas_ativo ON clinicas(ativo) WHERE ativo = true;
CREATE INDEX idx_clinicas_cnpj ON clinicas(cnpj) WHERE cnpj IS NOT NULL;

COMMENT ON TABLE clinicas IS 'Clínicas/consultórios cadastrados no sistema';
COMMENT ON COLUMN clinicas.endereco IS 'JSON: {rua, numero, complemento, bairro, cidade, estado, cep}';

-- ===================================

CREATE TABLE psicologos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  crp VARCHAR(20) NOT NULL,
  crp_estado VARCHAR(2) NOT NULL,
  especialidades TEXT[],
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT psicologos_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT psicologos_crp_format CHECK (crp ~* '^\d{2}/\d{4,6}$'),
  CONSTRAINT psicologos_crp_estado_format CHECK (crp_estado ~* '^[A-Z]{2}$')
);

CREATE INDEX idx_psicologos_clinica ON psicologos(clinica_id);
CREATE INDEX idx_psicologos_email ON psicologos(email);
CREATE INDEX idx_psicologos_ativo ON psicologos(ativo) WHERE ativo = true;

COMMENT ON TABLE psicologos IS 'Profissionais psicólogos cadastrados';
COMMENT ON COLUMN psicologos.senha_hash IS 'Hash bcrypt da senha';
COMMENT ON COLUMN psicologos.crp IS 'Formato: UF/número (ex: 01/12345)';

-- ===================================
-- PACIENTES
-- ===================================

CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  psicologo_responsavel_id UUID REFERENCES psicologos(id) ON DELETE SET NULL,

  -- Dados pessoais
  nome_completo VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  sexo VARCHAR(20),
  cpf VARCHAR(14) UNIQUE,

  -- Dados demográficos (para normatização)
  escolaridade_anos INTEGER NOT NULL,
  escolaridade_nivel VARCHAR(50), -- fundamental, médio, superior, pós
  profissao VARCHAR(100),
  estado_civil VARCHAR(50),

  -- Contato
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco JSONB,

  -- Clínico
  motivo_encaminhamento TEXT,
  observacoes_clinicas TEXT,

  -- Metadados
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT pacientes_data_nascimento_valida CHECK (data_nascimento <= CURRENT_DATE),
  CONSTRAINT pacientes_data_nascimento_razoavel CHECK (data_nascimento >= '1900-01-01'),
  CONSTRAINT pacientes_escolaridade_anos CHECK (escolaridade_anos >= 0 AND escolaridade_anos <= 30),
  CONSTRAINT pacientes_cpf_format CHECK (cpf IS NULL OR cpf ~* '^\d{3}\.\d{3}\.\d{3}-\d{2}$')
);

-- Índices
CREATE INDEX idx_pacientes_clinica ON pacientes(clinica_id);
CREATE INDEX idx_pacientes_psicologo ON pacientes(psicologo_responsavel_id);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_pacientes_ativo ON pacientes(ativo) WHERE ativo = true;
CREATE INDEX idx_pacientes_data_nascimento ON pacientes(data_nascimento);

-- Função para calcular idade atual
CREATE OR REPLACE FUNCTION calcular_idade(data_nascimento DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON TABLE pacientes IS 'Pacientes cadastrados no sistema';
COMMENT ON COLUMN pacientes.endereco IS 'JSON: {rua, numero, complemento, bairro, cidade, estado, cep}';
COMMENT ON COLUMN pacientes.cpf IS 'CPF criptografado, formato: 000.000.000-00';

-- ===================================
-- BIBLIOTECA DE TESTES
-- ===================================

CREATE TABLE testes_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Metadados
  nome VARCHAR(255) NOT NULL,
  nome_completo TEXT,
  sigla VARCHAR(50),
  versao VARCHAR(20),
  autor VARCHAR(255),
  ano_publicacao INTEGER,
  editora VARCHAR(255),
  referencias_bibliograficas TEXT[],

  -- Configuração
  tipo VARCHAR(50) NOT NULL, -- 'escala_likert', 'multipla_escolha', 'manual'
  faixa_etaria_min INTEGER,
  faixa_etaria_max INTEGER,
  tempo_medio_aplicacao INTEGER, -- minutos
  aplicacao_permitida TEXT[], -- ['presencial', 'remota']
  materiais_necessarios TEXT[],

  -- Questões e regras (JSONB para flexibilidade)
  questoes JSONB NOT NULL,
  escalas_resposta JSONB NOT NULL,
  regras_calculo JSONB NOT NULL,
  interpretacao JSONB,

  -- Controle
  ativo BOOLEAN DEFAULT true,
  publico BOOLEAN DEFAULT false, -- se disponível para todas clínicas
  criado_por UUID REFERENCES psicologos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT testes_tipo_valido CHECK (tipo IN ('escala_likert', 'multipla_escolha', 'manual')),
  CONSTRAINT testes_faixa_etaria_valida CHECK (
    faixa_etaria_min IS NULL OR
    faixa_etaria_max IS NULL OR
    faixa_etaria_min <= faixa_etaria_max
  )
);

CREATE INDEX idx_testes_tipo ON testes_templates(tipo);
CREATE INDEX idx_testes_sigla ON testes_templates(sigla);
CREATE INDEX idx_testes_ativo ON testes_templates(ativo) WHERE ativo = true;
CREATE INDEX idx_testes_publico ON testes_templates(publico) WHERE publico = true;

COMMENT ON TABLE testes_templates IS 'Biblioteca de testes neuropsicológicos';
COMMENT ON COLUMN testes_templates.questoes IS 'Array de questões: [{numero, texto, subtexto, tipo_resposta, ...}]';
COMMENT ON COLUMN testes_templates.escalas_resposta IS 'Definição das escalas: {likert_0_4: [{valor, texto}], ...}';
COMMENT ON COLUMN testes_templates.regras_calculo IS 'Regras de cálculo: {tipo, secoes, score_total, ...}';

-- ===================================
-- TABELAS NORMATIVAS
-- ===================================

CREATE TABLE tabelas_normativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teste_template_id UUID NOT NULL REFERENCES testes_templates(id) ON DELETE CASCADE,

  -- Metadados da norma
  nome VARCHAR(255) NOT NULL,
  pais VARCHAR(50) DEFAULT 'Brasil',
  regiao VARCHAR(100), -- Sul, Sudeste, etc.
  ano_coleta INTEGER NOT NULL,
  tamanho_amostra INTEGER NOT NULL,

  -- Variáveis de estratificação
  variaveis_estratificacao TEXT[] NOT NULL, -- ['idade', 'escolaridade', 'sexo']

  -- Dados normativos (JSONB para flexibilidade)
  faixas JSONB NOT NULL,
  /* Exemplo de estrutura:
  [
    {
      "idade_min": 18,
      "idade_max": 25,
      "escolaridade_min": 0,
      "escolaridade_max": 8,
      "sexo": "M",
      "n": 150,
      "media": 42.5,
      "desvio_padrao": 12.3,
      "percentis": {
        "5": 20, "10": 25, "25": 35, "50": 42,
        "75": 50, "90": 58, "95": 62
      }
    }
  ]
  */

  -- Controle
  ativo BOOLEAN DEFAULT true,
  padrao BOOLEAN DEFAULT false, -- norma padrão para o teste
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT normas_ano_coleta_valido CHECK (ano_coleta >= 1900 AND ano_coleta <= EXTRACT(YEAR FROM CURRENT_DATE)),
  CONSTRAINT normas_tamanho_amostra_valido CHECK (tamanho_amostra > 0)
);

CREATE INDEX idx_normas_teste ON tabelas_normativas(teste_template_id);
CREATE INDEX idx_normas_ativo ON tabelas_normativas(ativo) WHERE ativo = true;
CREATE INDEX idx_normas_padrao ON tabelas_normativas(teste_template_id, padrao) WHERE padrao = true;

COMMENT ON TABLE tabelas_normativas IS 'Tabelas normativas para testes';
COMMENT ON COLUMN tabelas_normativas.faixas IS 'Array de bins normativos com idade, escolaridade, sexo, média, DP e percentis';

-- Garantir apenas uma norma padrão por teste
CREATE UNIQUE INDEX idx_normas_padrao_unico ON tabelas_normativas(teste_template_id)
  WHERE padrao = true AND ativo = true;

-- ===================================
-- APLICAÇÃO DE TESTES
-- ===================================

CREATE TABLE testes_aplicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  psicologo_id UUID NOT NULL REFERENCES psicologos(id),
  teste_template_id UUID NOT NULL REFERENCES testes_templates(id),

  -- Tipo de aplicação
  tipo_aplicacao VARCHAR(50) NOT NULL, -- 'presencial', 'remota', 'manual'

  -- Link remoto (se aplicável)
  link_token VARCHAR(50) UNIQUE,
  codigo_acesso VARCHAR(6),
  tentativas_codigo INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'aguardando',
  -- 'aguardando', 'em_andamento', 'completo', 'reaberto', 'bloqueado', 'expirado'

  -- Respostas
  respostas JSONB,
  progresso INTEGER DEFAULT 0, -- percentual 0-100

  -- Datas
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_primeiro_acesso TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  data_reabertura TIMESTAMP WITH TIME ZONE,
  motivo_reabertura TEXT,
  data_expiracao TIMESTAMP WITH TIME ZONE,

  -- Resultados
  pontuacao_bruta JSONB,
  normalizacao JSONB,
  interpretacao JSONB,

  -- Norma utilizada
  tabela_normativa_id UUID REFERENCES tabelas_normativas(id),

  -- Controle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT testes_aplicados_tipo_valido CHECK (tipo_aplicacao IN ('presencial', 'remota', 'manual')),
  CONSTRAINT testes_aplicados_status_valido CHECK (status IN ('aguardando', 'em_andamento', 'completo', 'reaberto', 'bloqueado', 'expirado')),
  CONSTRAINT testes_aplicados_progresso_valido CHECK (progresso >= 0 AND progresso <= 100),
  CONSTRAINT testes_aplicados_codigo_acesso_format CHECK (codigo_acesso IS NULL OR codigo_acesso ~* '^\d{6}$'),
  CONSTRAINT testes_aplicados_link_remoto_completo CHECK (
    (tipo_aplicacao = 'remota' AND link_token IS NOT NULL AND codigo_acesso IS NOT NULL) OR
    (tipo_aplicacao != 'remota')
  )
);

-- Índices
CREATE INDEX idx_testes_aplicados_paciente ON testes_aplicados(paciente_id);
CREATE INDEX idx_testes_aplicados_psicologo ON testes_aplicados(psicologo_id);
CREATE INDEX idx_testes_aplicados_token ON testes_aplicados(link_token) WHERE link_token IS NOT NULL;
CREATE INDEX idx_testes_aplicados_status ON testes_aplicados(status);
CREATE INDEX idx_testes_aplicados_data_criacao ON testes_aplicados(data_criacao DESC);

COMMENT ON TABLE testes_aplicados IS 'Testes aplicados a pacientes';
COMMENT ON COLUMN testes_aplicados.link_token IS 'Token único para acesso remoto (8 caracteres)';
COMMENT ON COLUMN testes_aplicados.codigo_acesso IS 'Código de 6 dígitos para autenticação do paciente';
COMMENT ON COLUMN testes_aplicados.respostas IS 'JSON: {questao_numero: valor_resposta}';
COMMENT ON COLUMN testes_aplicados.pontuacao_bruta IS 'JSON: {total, secoes: {...}}';
COMMENT ON COLUMN testes_aplicados.normalizacao IS 'JSON: {percentil, escore_z, escore_t, classificacao, ...}';

-- Trigger para expiração automática de links remotos (30 dias)
CREATE OR REPLACE FUNCTION set_expiracao_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo_aplicacao = 'remota' AND NEW.data_expiracao IS NULL THEN
    NEW.data_expiracao := NEW.data_criacao + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_expiracao_link
  BEFORE INSERT ON testes_aplicados
  FOR EACH ROW
  EXECUTE FUNCTION set_expiracao_link();

-- Trigger para atualizar status expirado
CREATE OR REPLACE FUNCTION check_link_expiracao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo_aplicacao = 'remota' AND
     NEW.status NOT IN ('completo', 'bloqueado') AND
     NEW.data_expiracao < NOW() THEN
    NEW.status := 'expirado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_link_expiracao
  BEFORE UPDATE ON testes_aplicados
  FOR EACH ROW
  EXECUTE FUNCTION check_link_expiracao();

-- ===================================
-- REGISTROS MANUAIS
-- ===================================

CREATE TABLE registros_manuais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  psicologo_id UUID NOT NULL REFERENCES psicologos(id),

  -- Dados do teste
  nome_teste VARCHAR(255) NOT NULL,
  data_aplicacao DATE NOT NULL,
  resultado_texto TEXT,
  observacoes TEXT,

  -- Anexos (URLs do Supabase Storage)
  anexos JSONB, -- [{url, nome, tipo, tamanho}]

  -- Controle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT registros_data_aplicacao_valida CHECK (data_aplicacao <= CURRENT_DATE)
);

CREATE INDEX idx_registros_paciente ON registros_manuais(paciente_id);
CREATE INDEX idx_registros_psicologo ON registros_manuais(psicologo_id);
CREATE INDEX idx_registros_data_aplicacao ON registros_manuais(data_aplicacao DESC);

COMMENT ON TABLE registros_manuais IS 'Registros manuais de testes não digitalizados';
COMMENT ON COLUMN registros_manuais.anexos IS 'Array de anexos: [{url, nome, tipo, tamanho}]';

-- ===================================
-- LOGS DE AUDITORIA
-- ===================================

CREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES psicologos(id),
  acao VARCHAR(100) NOT NULL, -- 'visualizar', 'editar', 'deletar', 'criar', 'exportar'
  entidade VARCHAR(100) NOT NULL, -- 'paciente', 'teste_aplicado', 'clinica'
  entidade_id UUID NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_origem INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT logs_acao_valida CHECK (acao IN ('visualizar', 'criar', 'editar', 'deletar', 'exportar'))
);

CREATE INDEX idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_timestamp ON logs_auditoria(timestamp DESC);
CREATE INDEX idx_logs_entidade ON logs_auditoria(entidade, entidade_id);
CREATE INDEX idx_logs_acao ON logs_auditoria(acao);

COMMENT ON TABLE logs_auditoria IS 'Auditoria completa de ações no sistema (LGPD)';

-- Função para registrar auditoria automaticamente
CREATE OR REPLACE FUNCTION log_auditoria()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO logs_auditoria (usuario_id, acao, entidade, entidade_id, dados_anteriores)
    VALUES (current_setting('app.current_user_id', true)::UUID, 'deletar', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO logs_auditoria (usuario_id, acao, entidade, entidade_id, dados_anteriores, dados_novos)
    VALUES (current_setting('app.current_user_id', true)::UUID, 'editar', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO logs_auditoria (usuario_id, acao, entidade, entidade_id, dados_novos)
    VALUES (current_setting('app.current_user_id', true)::UUID, 'criar', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Aplicar auditoria em tabelas críticas
CREATE TRIGGER trigger_audit_pacientes AFTER INSERT OR UPDATE OR DELETE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION log_auditoria();

CREATE TRIGGER trigger_audit_testes_aplicados AFTER INSERT OR UPDATE OR DELETE ON testes_aplicados
  FOR EACH ROW EXECUTE FUNCTION log_auditoria();

CREATE TRIGGER trigger_audit_registros_manuais AFTER INSERT OR UPDATE OR DELETE ON registros_manuais
  FOR EACH ROW EXECUTE FUNCTION log_auditoria();

-- ===================================
-- FUNÇÕES AUXILIARES
-- ===================================

-- Função para buscar faixa normativa
CREATE OR REPLACE FUNCTION buscar_faixa_normativa(
  p_teste_template_id UUID,
  p_idade INTEGER,
  p_escolaridade_anos INTEGER,
  p_sexo VARCHAR(20)
) RETURNS JSONB AS $$
DECLARE
  v_faixa JSONB;
BEGIN
  SELECT faixa INTO v_faixa
  FROM tabelas_normativas tn,
       LATERAL jsonb_array_elements(tn.faixas) faixa
  WHERE tn.teste_template_id = p_teste_template_id
    AND tn.ativo = true
    AND (tn.padrao = true OR NOT EXISTS (
      SELECT 1 FROM tabelas_normativas WHERE teste_template_id = p_teste_template_id AND padrao = true
    ))
    AND (faixa->>'idade_min')::INTEGER <= p_idade
    AND (faixa->>'idade_max')::INTEGER >= p_idade
    AND (faixa->>'escolaridade_min')::INTEGER <= p_escolaridade_anos
    AND (faixa->>'escolaridade_max')::INTEGER >= p_escolaridade_anos
    AND (faixa->>'sexo' IS NULL OR faixa->>'sexo' = p_sexo)
  ORDER BY tn.padrao DESC, tn.ano_coleta DESC
  LIMIT 1;

  RETURN v_faixa;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_faixa_normativa IS 'Busca faixa normativa apropriada para paciente';

-- ===================================
-- VIEWS MATERIALIZADAS
-- ===================================

-- Dashboard stats (atualizado a cada hora)
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT
  c.id as clinica_id,
  COUNT(DISTINCT p.id) FILTER (WHERE p.ativo = true) as total_pacientes,
  COUNT(ta.id) as total_avaliacoes,
  COUNT(ta.id) FILTER (WHERE ta.status IN ('aguardando', 'em_andamento')) as avaliacoes_pendentes,
  COUNT(ta.id) FILTER (WHERE ta.data_criacao >= DATE_TRUNC('month', CURRENT_DATE)) as avaliacoes_mes_atual
FROM clinicas c
LEFT JOIN pacientes p ON c.id = p.clinica_id
LEFT JOIN testes_aplicados ta ON p.id = ta.paciente_id
GROUP BY c.id;

CREATE UNIQUE INDEX idx_dashboard_stats_clinica ON dashboard_stats(clinica_id);

COMMENT ON MATERIALIZED VIEW dashboard_stats IS 'Estatísticas do dashboard (refresh a cada hora)';

-- ===================================
-- TRIGGERS DE UPDATED_AT
-- ===================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinicas_updated_at BEFORE UPDATE ON clinicas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_psicologos_updated_at BEFORE UPDATE ON psicologos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testes_templates_updated_at BEFORE UPDATE ON testes_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tabelas_normativas_updated_at BEFORE UPDATE ON tabelas_normativas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testes_aplicados_updated_at BEFORE UPDATE ON testes_aplicados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registros_manuais_updated_at BEFORE UPDATE ON registros_manuais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- COMENTÁRIOS FINAIS
-- ===================================

COMMENT ON SCHEMA public IS 'NeuroTest Platform - Sistema de Neuroavaliação';
