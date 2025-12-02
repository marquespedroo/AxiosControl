# Product Requirements Document (PRD)
# Sistema de Neuroavaliação com Normatização Automática

**Versão:** 1.0  
**Data:** 04/10/2025  
**Produto:** NeuroTest Platform  
**Stakeholders:** Neuropsicólogos, Clínicas de Psicologia, Pacientes

---

## 1. VISÃO GERAL DO PRODUTO

### 1.1 Objetivo
Desenvolver uma plataforma web que permita a neuropsicólogos aplicar, calcular e interpretar automaticamente testes neuropsicológicos, com suporte a normatização por idade, escolaridade e outras variáveis demográficas. Web app será usado majoriatariamente em dispositivos mobile, mas tambem deverá ter uma versão web, isso é extremamente importante. 

### 1.2 Problema
Neuropsicólogos gastam tempo significativo:
- Calculando manualmente resultados de testes
- Buscando tabelas normativas impressas
- Convertendo pontuações brutas em percentis/escores-Z
- Digitando resultados em prontuários
- Gerando relatórios individuais

### 1.3 Solução
Sistema integrado que:
- Aplica testes digitalmente (presencial ou remoto)
- Calcula automaticamente pontuações brutas
- Aplica normatização baseada em dados demográficos do paciente
- Gera resultados normatizados (percentil, escore-Z, classificação)
- Armazena histórico completo no prontuário digital
- Exporta relatórios em PDF
- Extremamente importante: interface mobile first. O applicativo será mais usado em celulares do que no computador, a interface precisa ser compativel com mobile e desktop. 

---

## 2. ESCOPO DO MVP

### 2.1 Funcionalidades Incluídas
✅ Gestão de clínicas, psicólogos e pacientes  
✅ Cadastro de pacientes com dados demográficos completos  
✅ Biblioteca de testes neuropsicológicos  
✅ Aplicação presencial (psicólogo insere respostas)  
✅ Aplicação remota (link para paciente)  
✅ Cálculo automático de pontuações brutas  
✅ Normatização automática por idade/escolaridade  
✅ Registro manual de testes (desenhos, observações)  
✅ Prontuário digital unificado  
✅ Exportação de resultados em PDF  
✅ Sistema de links com controle de status  

### 2.2 Funcionalidades Futuras (Pós-MVP)
❌ Assinatura digital de relatórios  
❌ Integração com prontuários eletrônicos (PEP)  
❌ Agendamento de reavaliações automáticas  
❌ Gráficos de evolução longitudinal  
❌ Bateria de testes sugerida por IA  
❌ Relatório narrativo gerado automaticamente  

---

## 3. REQUISITOS FUNCIONAIS

### 3.1 Gestão de Usuários e Organizações

#### RF-001: Cadastro de Clínicas
**Descrição:** Sistema multi-tenant onde cada clínica tem seus dados isolados.

**Campos:**
- Nome da clínica
- CNPJ
- Endereço completo
- Telefone/Email
- Logo (opcional)

**Regras:**
- Uma clínica pode ter múltiplos psicólogos
- Dados entre clínicas são isolados (row-level security)

#### RF-002: Cadastro de Psicólogos
**Descrição:** Profissionais vinculados a uma clínica.

**Campos:**
- Nome completo
- CRP (número e estado)
- Email (login)
- Senha (hash bcrypt)
- Especialidades
- Clínica vinculada

**Regras:**
- Um psicólogo pertence a uma clínica
- Pode visualizar apenas seus pacientes e os da clínica
- Autenticação via email/senha + 2FA (opcional)

#### RF-003: Cadastro de Pacientes
**Descrição:** Dados completos para normatização de testes.

**Campos Obrigatórios:**
- Nome completo
- Data de nascimento
- Sexo/gênero
- Escolaridade (em anos completos)
- CPF (opcional, para busca)

**Campos Opcionais:**
- Telefone/Email
- Profissão
- Estado civil
- Endereço
- Observações clínicas
- Motivo do encaminhamento

**Cálculos Automáticos:**
- Idade em anos (na data de aplicação do teste)
- Idade em meses (para crianças)
- Faixa etária (conforme tabelas normativas)

**Regras:**
- Paciente vinculado ao psicólogo responsável
- Histórico completo de avaliações
- LGPD: dados sensíveis criptografados

---

### 3.2 Biblioteca de Testes

#### RF-004: Estrutura de Testes
**Descrição:** Sistema flexível para cadastrar diferentes tipos de testes.

**Tipos de Testes:**

1. **Escala Likert:**
   - Múltiplas questões
   - Escala de resposta fixa (ex: 0-4)
   - Cálculo por somatória

2. **Múltipla Escolha:**
   - Questões com alternativas
   - Pontuação por alternativa
   - Cálculo por regras complexas

3. **Teste Manual:**
   - Sem questões estruturadas
   - Psicólogo insere resultado diretamente
   - Útil para desenhos, observações

**Metadados do Teste:**
```json
{
  "nome": "EPF-TDAH",
  "nome_completo": "Escala de Prejuízos Funcionais - TDAH",
  "sigla": "EPF-TDAH",
  "versao": "1.0",
  "autor": "Ana Paula Assis de Oliveira",
  "ano_publicacao": 2017,
  "editora": "Hogrefe CETEPP",
  "tipo": "escala_likert",
  "faixa_etaria": { "min": 18, "max": 99 },
  "tempo_medio_aplicacao": 20,
  "aplicacao_permitida": ["presencial", "remota"],
  "materiais_necessarios": [],
  "referencias_bibliograficas": ["..."]
}
```

#### RF-005: Configuração de Questões
**Descrição:** Cadastro de questões com metadados para cálculo.

**Estrutura de Questão:**
```json
{
  "numero": 1,
  "texto": "Nos estudos/cursos/treinamentos, com que frequência nos últimos anos:",
  "subtexto": "Meus trabalhos foram de baixa qualidade.",
  "secao": "estudos_trabalho",
  "tipo_resposta": "likert_0_4",
  "invertida": false,
  "obrigatoria": true,
  "peso": 1,
  "depende_de": null,
  "ordem": 1
}
```

**Tipos de Resposta:**
- `likert_0_4`: Nunca (0) a Sempre (4)
- `likert_0_3`: Discordo totalmente (0) a Concordo totalmente (3)
- `multipla_escolha`: Alternativas A, B, C, D
- `texto_livre`: Campo aberto
- `numero`: Valor numérico

#### RF-006: Regras de Cálculo
**Descrição:** Definição de como calcular pontuações brutas.

**Tipos de Cálculo:**

1. **Soma Simples:**
```json
{
  "tipo": "soma_simples",
  "questoes_incluidas": [1, 2, 3, 4, 5],
  "questoes_invertidas": [2, 5],
  "valor_maximo_escala": 4
}
```

2. **Soma Ponderada:**
```json
{
  "tipo": "soma_ponderada",
  "questoes": [
    { "numero": 1, "peso": 1 },
    { "numero": 2, "peso": 2 }
  ]
}
```

3. **Cálculo por Seções:**
```json
{
  "tipo": "secoes",
  "secoes": {
    "estudos_trabalho": {
      "questoes": [1, 2, 3, 4, 5, 6, 7, 8],
      "invertidas": [2, 5],
      "peso": 1
    },
    "profissional": {
      "questoes": [9, 10, 11, 12],
      "invertidas": [],
      "peso": 1.5
    }
  },
  "score_total": "soma_secoes"
}
```

4. **Cálculo Custom (JavaScript):**
```json
{
  "tipo": "custom",
  "funcao_calculo": "function(respostas) { /* código */ }"
}
```

**Validações:**
- Sistema deve impedir cálculos inválidos
- Testes com cálculo custom precisam ser revisados manualmente
- Logs de todas as mudanças em regras de cálculo

---

### 3.3 Sistema de Normatização

#### RF-007: Tabelas Normativas
**Descrição:** Armazenamento de normas para conversão de pontuações brutas.

**Estrutura de Tabela Normativa:**
```json
{
  "teste_id": "uuid",
  "nome": "Normas EPF-TDAH - Brasil 2017",
  "pais": "Brasil",
  "ano_coleta": 2017,
  "tamanho_amostra": 1250,
  "variaveis_estratificacao": ["idade", "escolaridade"],
  
  "faixas": [
    {
      "idade_min": 18,
      "idade_max": 25,
      "escolaridade_min": 0,
      "escolaridade_max": 8,
      "n": 150,
      "media": 42.5,
      "desvio_padrao": 12.3,
      "percentis": {
        "5": 20,
        "10": 25,
        "25": 35,
        "50": 42,
        "75": 50,
        "90": 58,
        "95": 62
      }
    }
  ]
}
```

**Tipos de Normatização:**

1. **Por Idade:**
   - Faixas etárias (ex: 18-25, 26-35, 36-50, 51+)
   - Idade em anos ou meses

2. **Por Escolaridade:**
   - Anos de estudo (ex: 0-8, 9-11, 12+)
   - Nível educacional (fundamental, médio, superior)

3. **Por Idade + Escolaridade:**
   - Combinação de ambas (mais comum)
   - Matriz de faixas

4. **Por Sexo:**
   - Normas separadas por gênero

5. **Multinível:**
   - Idade + Escolaridade + Sexo + Região

#### RF-008: Algoritmo de Normatização
**Descrição:** Conversão automática de pontuações brutas.

**Fluxo:**
1. Sistema recebe pontuação bruta do teste
2. Busca dados demográficos do paciente (idade, escolaridade)
3. Identifica tabela normativa aplicável
4. Localiza faixa correspondente
5. Calcula métricas normatizadas

**Métricas Calculadas:**

1. **Percentil:**
```javascript
function calcularPercentil(pontuacao_bruta, percentis_tabela) {
  // Interpolação linear entre percentis
  if (pontuacao_bruta <= percentis_tabela['5']) return 5;
  if (pontuacao_bruta >= percentis_tabela['95']) return 95;
  
  // Encontrar percentis adjacentes
  for (let p of [10, 25, 50, 75, 90]) {
    if (pontuacao_bruta < percentis_tabela[p]) {
      let p_anterior = percentis_anteriores[p];
      let interpolacao = /* cálculo */;
      return interpolacao;
    }
  }
}
```

2. **Escore-Z:**
```javascript
function calcularEscoreZ(pontuacao_bruta, media, desvio_padrao) {
  return (pontuacao_bruta - media) / desvio_padrao;
}
```

3. **Escore-T:**
```javascript
function calcularEscoreT(escore_z) {
  return 50 + (escore_z * 10);
}
```

4. **Classificação Qualitativa:**
```javascript
function classificar(percentil) {
  if (percentil <= 5) return "Muito Inferior";
  if (percentil <= 16) return "Inferior";
  if (percentil <= 84) return "Médio";
  if (percentil <= 95) return "Superior";
  return "Muito Superior";
}
```

**Tratamento de Casos Especiais:**

- **Paciente fora das normas:** 
  - Alertar psicólogo
  - Usar norma mais próxima
  - Indicar no relatório: "Extrapolação de normas"

- **Múltiplas tabelas disponíveis:**
  - Usar a mais recente
  - Priorizar normas nacionais
  - Permitir seleção manual

- **Normas ausentes:**
  - Exibir apenas pontuação bruta
  - Sugerir normas de outros estudos
  - Permitir interpretação qualitativa

#### RF-009: Interface de Cadastro de Normas
**Descrição:** Formulário para profissionais cadastrarem tabelas normativas.

**Campos:**
- Upload de CSV/Excel com dados normativos
- Mapeamento de colunas (idade, escolaridade, percentis)
- Validação de dados
- Preview da tabela antes de salvar

**Validações:**
- Verificar consistência dos percentis (ordem crescente)
- Média e DP compatíveis com distribuição
- Faixas sem sobreposição
- N mínimo por célula (sugestão: 30)

---

### 3.4 Aplicação de Testes

#### RF-010: Aplicação Presencial
**Descrição:** Psicólogo aplica teste durante sessão e insere respostas.

**Fluxo:**
1. Psicólogo seleciona paciente
2. Escolhe teste da biblioteca
3. Clica em "Aplicar Presencialmente"
4. Sistema exibe questões uma a uma (ou todas)
5. Psicólogo lê questão e marca resposta do paciente
6. Ao finalizar, sistema calcula automaticamente
7. Resultados aparecem instantaneamente

**Interface:**
```
┌─────────────────────────────────────────┐
│  EPF-TDAH - Aplicação Presencial        │
├─────────────────────────────────────────┤
│  Paciente: João Silva (32 anos)         │
│  Progresso: 5/69 questões               │
├─────────────────────────────────────────┤
│                                         │
│  1. Nos estudos/cursos/treinamentos:    │
│     Meus trabalhos foram de baixa       │
│     qualidade.                          │
│                                         │
│  ○ Nunca (0)                            │
│  ● Raramente (1) [SELECIONADO]          │
│  ○ Algumas vezes (2)                    │
│  ○ Muitas vezes (3)                     │
│  ○ Sempre (4)                           │
│                                         │
│  [Voltar]  [Salvar Rascunho]  [Próxima]│
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Salvar rascunho (pausar e continuar depois)
- Navegação entre questões
- Marcação de questões para revisar
- Timer opcional (para testes com limite de tempo)

#### RF-011: Aplicação Remota (Link)
**Descrição:** Psicólogo gera link e envia para paciente responder.

**Fluxo:**
1. Psicólogo seleciona paciente
2. Escolhe teste(s) da biblioteca
3. Clica em "Gerar Link"
4. Sistema cria:
   - Token único (ex: `a7f3k9m2`)
   - Código de acesso de 6 dígitos (ex: `483926`)
   - URL: `app.com/responder/a7f3k9m2`
5. Psicólogo envia link + código por WhatsApp/Email
6. Paciente acessa e digita código
7. Responde teste no próprio ritmo
8. Ao finalizar, link é bloqueado automaticamente
9. Psicólogo recebe notificação

**Estados do Link:**
- `aguardando`: Criado, paciente ainda não acessou
- `em_andamento`: Paciente começou a responder
- `completo`: Finalizado, link bloqueado
- `reaberto`: Psicólogo reabriu para edição

**Interface do Paciente:**
```
┌─────────────────────────────────────────┐
│  🔒 Acesso Seguro                       │
├─────────────────────────────────────────┤
│  Digite o código de 6 dígitos enviado  │
│  pelo seu psicólogo:                    │
│                                         │
│  [_][_][_][_][_][_]                    │
│                                         │
│  [Acessar]                              │
│                                         │
│  ⚠️ Após 3 tentativas incorretas, o    │
│  link será bloqueado.                   │
└─────────────────────────────────────────┘

// Após autenticação bem-sucedida:
┌─────────────────────────────────────────┐
│  Avaliação Neuropsicológica             │
├─────────────────────────────────────────┤
│  Instruções:                            │
│  Leia cada questão atentamente e        │
│  marque a opção que melhor descreve     │
│  você nas últimas semanas.              │
│                                         │
│  Progresso: ▓▓▓▓▓░░░░░ 15/69 (22%)     │
│                                         │
│  [Iniciar Avaliação]                    │
└─────────────────────────────────────────┘
```

**Regras:**
- Paciente NÃO vê suas respostas anteriores (exceto se reaberto)
- Paciente NÃO vê resultados
- Sistema salva progresso automaticamente
- Timeout: link expira após 30 dias sem acesso (configurável)
- Máximo 3 tentativas de código incorreto

#### RF-012: Reabertura de Link
**Descrição:** Psicólogo pode reabrir teste completado.

**Casos de Uso:**
- Paciente cometeu erro ao responder
- Psicólogo quer que refaça questões específicas
- Teste aplicado parcialmente (interrompido)

**Fluxo:**
1. Psicólogo acessa prontuário do paciente
2. Visualiza teste "completo"
3. Clica em "Reabrir para Edição"
4. Insere motivo (opcional): "Paciente pediu para revisar questões 10-15"
5. Sistema muda status para `reaberto`
6. Link volta a funcionar
7. Paciente vê respostas anteriores (pode editar)
8. Ao finalizar novamente, volta para `completo`

**Registro:**
- Histórico de reabertu ras (quem, quando, motivo)
- Versões de respostas (antes/depois)

#### RF-013: Registro Manual
**Descrição:** Psicólogo cadastra teste não estruturado.

**Casos de Uso:**
- Testes de desenho (HTP, Família, Pessoa sob Chuva)
- Testes projetivos (Rorschach, TAT)
- Observações clínicas
- Testes que não estão digitalizados

**Interface:**
```
┌─────────────────────────────────────────┐
│  Adicionar Registro Manual              │
├─────────────────────────────────────────┤
│  Nome do Teste:                         │
│  [Teste do Desenho da Figura Humana]    │
│                                         │
│  Data de Aplicação:                     │
│  [15/01/2025]                           │
│                                         │
│  Resultado/Interpretação:               │
│  ┌─────────────────────────────────┐   │
│  │ [Editor de texto rico]          │   │
│  │                                 │   │
│  │ - Desenho proporcionado         │   │
│  │ - Presença de detalhes          │   │
│  │ - Indicadores emocionais: ...   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Anexar Imagens/PDFs:                   │
│  [📎 Adicionar Arquivo]                │
│  - foto_desenho.jpg (removido)          │
│                                         │
│  [Cancelar]              [Salvar]       │
└─────────────────────────────────────────┘
```

**Campos:**
- Nome do teste (texto livre)
- Data de aplicação
- Resultado/Interpretação (rich text)
- Anexos (imagens, PDFs - limite 10MB)
- Observações adicionais

---

### 3.5 Resultados e Prontuário

#### RF-014: Cálculo Automático
**Descrição:** Sistema calcula resultados assim que teste é finalizado.

**Saída do Cálculo:**
```json
{
  "teste_aplicado_id": "uuid",
  "pontuacao_bruta": {
    "total": 85,
    "secoes": {
      "estudos_trabalho": 18,
      "profissional": 22,
      "relacionamentos": 15,
      "casa": 12,
      "relacionamentos_afetivos": 8,
      "saude": 6,
      "financeiro": 4
    }
  },
  
  "normalizacao": {
    "tabela_utilizada": "EPF-TDAH Brasil 2017",
    "faixa_aplicada": {
      "idade": "26-35 anos",
      "escolaridade": "12+ anos"
    },
    "percentil": 72,
    "escore_z": 0.58,
    "escore_t": 56,
    "classificacao": "Médio",
    "descricao": "Prejuízos funcionais dentro da média esperada para a faixa etária e escolaridade."
  },
  
  "interpretacao": {
    "classificacao_geral": "Prejuízos Leves a Moderados",
    "pontos_atencao": [
      "Seção Profissional com pontuação elevada (P80)",
      "Relacionamentos afetivos abaixo da média (P25)"
    ],
    "recomendacoes": [
      "Investigar mais profundamente dificuldades no contexto profissional",
      "Considerar avaliação complementar de habilidades sociais"
    ]
  },
  
  "timestamp": "2025-10-15T14:30:00Z",
  "calculado_por": "sistema_v1.0"
}
```

#### RF-015: Prontuário Digital
**Descrição:** Visualização unificada de todos os testes do paciente.

**Interface:**
```
┌──────────────────────────────────────────────┐
│  Prontuário: João Silva (32 anos, M)        │
├──────────────────────────────────────────────┤
│  📊 Resumo                                   │
│  • Total de Avaliações: 8                    │
│  • Primeira: 15/01/2024                      │
│  • Última: 15/10/2025                        │
│                                              │
│  [+ Nova Avaliação] [Exportar Prontuário]   │
├──────────────────────────────────────────────┤
│  📋 Histórico de Avaliações                  │
│                                              │
│  🟢 15/10/2025 - EPF-TDAH                    │
│     Score: 85/144 (P72) - Médio             │
│     [Ver Detalhes] [Exportar PDF] [Reabrir] │
│                                              │
│  🟢 15/07/2025 - BDI-II                      │
│     Score: 12/63 (P45) - Mínima             │
│     [Ver Detalhes] [Exportar PDF]            │
│                                              │
│  🟢 20/03/2025 - Perfil Sensorial            │
│     Scores por categoria...                  │
│     [Ver Detalhes] [Exportar PDF]            │
│                                              │
│  🔵 15/02/2025 - Teste HTP (Manual)          │
│     Observações clínicas                     │
│     [Ver Detalhes] [Editar]                  │
│                                              │
│  🟡 15/01/2025 - WAIS-IV (Em Andamento)      │
│     Progresso: 40% - Pausado                 │
│     [Continuar]                              │
└──────────────────────────────────────────────┘
```

**Filtros:**
- Por data
- Por tipo de teste
- Por status (completo, em andamento)
- Por psicólogo aplicador

**Funcionalidades:**
- Comparação entre avaliações (gráficos de evolução)
- Timeline visual
- Busca de testes específicos
- Agrupamento por bateria

#### RF-016: Detalhes do Resultado
**Descrição:** Visualização completa de um teste aplicado.

**Seções:**

1. **Informações Gerais:**
   - Nome do teste
   - Data de aplicação
   - Psicólogo aplicador
   - Forma de aplicação (presencial/remota)
   - Tempo de conclusão

2. **Pontuação Bruta:**
   - Score total
   - Scores por seção
   - Tabela com todas as respostas

3. **Normatização:**
   - Tabela normativa utilizada
   - Faixa demográfica
   - Percentil, Escore-Z, Escore-T
   - Classificação qualitativa
   - Gráfico de curva normal

4. **Interpretação:**
   - Classificação geral
   - Pontos de atenção
   - Recomendações
   - Comparação com avaliações anteriores (se houver)

5. **Respostas Detalhadas:**
   - Questão por questão
   - Resposta do paciente
   - Pontuação atribuída

6. **Anexos:**
   - Caderno de respostas escaneado
   - Observações clínicas

#### RF-017: Exportação em PDF
**Descrição:** Gerar relatórios profissionais em PDF.

**Tipos de Relatório:**

1. **Resultado Individual:**
```
┌──────────────────────────────────────────┐
│  RESULTADO DA AVALIAÇÃO NEUROPSICOLÓGICA │
├──────────────────────────────────────────┤
│  Paciente: João Silva                    │
│  Idade: 32 anos                          │
│  Escolaridade: 16 anos (Superior)        │
│  Data de Nascimento: 08/08/1993          │
│                                          │
│  Teste: EPF-TDAH                         │
│  Data de Aplicação: 15/10/2025           │
│  Psicólogo: Dra. Maria Santos            │
│  CRP: 01/12345                           │
│                                          │
├──────────────────────────────────────────┤
│  RESULTADOS                              │
├──────────────────────────────────────────┤
│  Pontuação Bruta Total: 85/144           │
│  Percentil: 72                           │
│  Classificação: Médio                    │
│                                          │
│  Scores por Seção:                       │
│  • Estudos/Trabalho: 18/32 (P65)         │
│  • Profissional: 22/40 (P80) ⚠️          │
│  • Relacionamentos: 15/24 (P60)          │
│  ...                                     │
│                                          │
│  [Gráfico de perfil]                     │
│                                          │
├──────────────────────────────────────────┤
│  INTERPRETAÇÃO                           │
├──────────────────────────────────────────┤
│  Os resultados indicam prejuízos         │
│  funcionais dentro da faixa média para   │
│  a idade e escolaridade do examinando... │
│                                          │
│  Destaca-se pontuação elevada na seção   │
│  Profissional (P80), sugerindo...        │
│                                          │
│  _______________________                 │
│  Dra. Maria Santos                       │
│  CRP 01/12345                            │
│                                          │
│  São Paulo, 15 de outubro de 2025        │
└──────────────────────────────────────────┘
```

2. **Prontuário Completo:**
   - Todos os testes aplicados
   - Evolução temporal
   - Gráficos comparativos

3. **Relatório Comparativo:**
   - Duas ou mais avaliações
   - Análise de mudanças
   - Gráfico de evolução

**Customizações:**
- Logo da clínica
- Cabeçalho/rodapé personalizados
- Incluir/excluir seções
- Nível de detalhamento (resumido/completo)

---

## 4. REQUISITOS NÃO-FUNCIONAIS

### 4.1 Performance
- **RNF-001:** Cálculo de resultados em < 2 segundos
- **RNF-002:** Carregamento de página em < 1 segundo
- **RNF-003:** Geração de PDF em < 5 segundos
- **RNF-004:** Sistema suporta 100 usuários simultâneos

### 4.2 Segurança
- **RNF-005:** Criptografia de dados sensíveis em repouso (AES-256)
- **RNF-006:** HTTPS obrigatório (TLS 1.3)
- **RNF-007:** Row-level security no banco de dados
- **RNF-008:** Logs de auditoria (quem acessou/modificou o quê)
- **RNF-009:** Backup automático diário
- **RNF-010:** Conformidade LGPD

### 4.3 Usabilidade
- **RNF-011:** Interface responsiva (mobile-friendly)
- **RNF-012:** Acessibilidade WCAG 2.1 nível AA
- **RNF-013:** Suporte a Chrome, Firefox, Safari, Edge
- **RNF-014:** Idioma: Português brasileiro

### 4.4 Escalabilidade
- **RNF-015:** Arquitetura serverless (escala automaticamente)
- **RNF-016:** Banco de dados suporta 10.000 pacientes por clínica
- **RNF-017:** Armazenamento de anexos escalável (S3/Supabase Storage)

### 4.5 Disponibilidade
- **RNF-018:** Uptime de 99.5% (permitido ~3.5h downtime/mês)
- **RNF-019:** Mensagens de erro amigáveis
- **RNF-020:** Modo offline para aplicação presencial (sincroniza depois)

---

## 5. MODELO DE DADOS

### 5.1 Schema do Banco de Dados (PostgreSQL)

```sql
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE psicologos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  crp VARCHAR(20) NOT NULL,
  crp_estado VARCHAR(2) NOT NULL,
  especialidades TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_psicologos_clinica ON psicologos(clinica_id);
CREATE INDEX idx_psicologos_email ON psicologos(email);

-- ===================================
-- PACIENTES
-- ===================================

CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  psicologo_responsavel_id UUID REFERENCES psicologos(id),
  
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Função auxiliar: calcular idade
  GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento))
  ) STORED idade_atual
);

CREATE INDEX idx_pacientes_clinica ON pacientes(clinica_id);
CREATE INDEX idx_pacientes_psicologo ON pacientes(psicologo_responsavel_id);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);

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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_testes_tipo ON testes_templates(tipo);
CREATE INDEX idx_testes_sigla ON testes_templates(sigla);

-- ===================================
-- TABELAS NORMATIVAS
-- ===================================

CREATE TABLE tabelas_normativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teste_template_id UUID REFERENCES testes_templates(id) ON DELETE CASCADE,
  
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_normas_teste ON tabelas_normativas(teste_template_id);

-- ===================================
-- APLICAÇÃO DE TESTES
-- ===================================

CREATE TABLE testes_aplicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  psicologo_id UUID REFERENCES psicologos(id),
  teste_template_id UUID REFERENCES testes_templates(id),
  
  -- Tipo de aplicação
  tipo_aplicacao VARCHAR(50) NOT NULL, -- 'presencial', 'remota', 'manual'
  
  -- Link remoto (se aplicável)
  link_token VARCHAR(50) UNIQUE,
  codigo_acesso VARCHAR(6),
  tentativas_codigo INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'aguardando',
  -- 'aguardando', 'em_andamento', 'completo', 'reaberto'
  
  -- Respostas
  respostas JSONB,
  progresso INTEGER DEFAULT 0, -- percentual
  
  -- Datas
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_primeiro_acesso TIMESTAMP,
  data_conclusao TIMESTAMP,
  data_reabertura TIMESTAMP,
  motivo_reabertura TEXT,
  
  -- Resultados
  pontuacao_bruta JSONB,
  normalizacao JSONB,
  interpretacao JSONB,
  
  -- Norma utilizada
  tabela_normativa_id UUID REFERENCES tabelas_normativas(id),
  
  -- Controle
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_testes_aplicados_paciente ON testes_aplicados(paciente_id);
CREATE INDEX idx_testes_aplicados_psicologo ON testes_aplicados(psicologo_id);
CREATE INDEX idx_testes_aplicados_token ON testes_aplicados(link_token);
CREATE INDEX idx_testes_aplicados_status ON testes_aplicados(status);

-- ===================================
-- REGISTROS MANUAIS
-- ===================================

CREATE TABLE registros_manuais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  psicologo_id UUID REFERENCES psicologos(id),
  
  -- Dados do teste
  nome_teste VARCHAR(255) NOT NULL,
  data_aplicacao DATE NOT NULL,
  resultado_texto TEXT,
  observacoes TEXT,
  
  -- Anexos
  anexos JSONB, -- array de URLs de arquivos
  
  -- Controle
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_registros_paciente ON registros_manuais(paciente_id);

-- ===================================
-- LOGS DE AUDITORIA
-- ===================================

CREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES psicologos(id),
  acao VARCHAR(100) NOT NULL, -- 'visualizar', 'editar', 'deletar', etc.
  entidade VARCHAR(100) NOT NULL, -- 'paciente', 'teste_aplicado', etc.
  entidade_id UUID NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_origem INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_timestamp ON logs_auditoria(timestamp);
CREATE INDEX idx_logs_entidade ON logs_auditoria(entidade, entidade_id);

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE testes_aplicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_manuais ENABLE ROW LEVEL SECURITY;

-- Psicólogo só vê pacientes da sua clínica
CREATE POLICY psicologo_ve_sua_clinica ON pacientes
  FOR ALL
  USING (clinica_id = (
    SELECT clinica_id FROM psicologos WHERE id = auth.uid()
  ));

-- Psicólogo só vê testes da sua clínica
CREATE POLICY psicologo_ve_testes_clinica ON testes_aplicados
  FOR ALL
  USING (paciente_id IN (
    SELECT id FROM pacientes WHERE clinica_id = (
      SELECT clinica_id FROM psicologos WHERE id = auth.uid()
    )
  ));
```

---

## 6. API ENDPOINTS

### 6.1 Autenticação
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/reset-password
```

### 6.2 Clínicas e Psicólogos
```
GET    /api/clinicas
POST   /api/clinicas
GET    /api/clinicas/:id
PUT    /api/clinicas/:id
DELETE /api/clinicas/:id

GET    /api/psicologos
POST   /api/psicologos
GET    /api/psicologos/:id
PUT    /api/psicologos/:id
DELETE /api/psicologos/:id
```

### 6.3 Pacientes
```
GET    /api/pacientes
POST   /api/pacientes
GET    /api/pacientes/:id
PUT    /api/pacientes/:id
DELETE /api/pacientes/:id
GET    /api/pacientes/:id/prontuario
GET    /api/pacientes/:id/prontuario/export-pdf
```

### 6.4 Testes Templates
```
GET    /api/testes-templates
POST   /api/testes-templates
GET    /api/testes-templates/:id
PUT    /api/testes-templates/:id
DELETE /api/testes-templates/:id
POST   /api/testes-templates/:id/duplicate
```

### 6.5 Tabelas Normativas
```
GET    /api/tabelas-normativas
POST   /api/tabelas-normativas
GET    /api/tabelas-normativas/:id
PUT    /api/tabelas-normativas/:id
DELETE /api/tabelas-normativas/:id
POST   /api/tabelas-normativas/import-csv
```

### 6.6 Aplicação de Testes
```
POST   /api/testes-aplicados                    # Criar aplicação
GET    /api/testes-aplicados/:id                # Detalhes
PUT    /api/testes-aplicados/:id/respostas      # Salvar respostas
POST   /api/testes-aplicados/:id/finalizar      # Finalizar e calcular
POST   /api/testes-aplicados/:id/reabrir        # Reabrir
GET    /api/testes-aplicados/:id/export-pdf     # Exportar

# Link remoto
POST   /api/links/gerar                         # Gerar link remoto
POST   /api/links/:token/autenticar             # Validar código
GET    /api/links/:token/questoes               # Obter questões
PUT    /api/links/:token/responder              # Salvar resposta
POST   /api/links/:token/finalizar              # Finalizar
```

### 6.7 Registros Manuais
```
GET    /api/registros-manuais
POST   /api/registros-manuais
GET    /api/registros-manuais/:id
PUT    /api/registros-manuais/:id
DELETE /api/registros-manuais/:id
POST   /api/registros-manuais/:id/upload-anexo
```

### 6.8 Cálculo e Normatização
```
POST   /api/calcular
# Body: { teste_template_id, respostas, paciente_id }
# Retorna: pontuacao_bruta, normalizacao, interpretacao
```

---

## 7. FLUXOS DE USUÁRIO

### 7.1 Fluxo: Aplicação Presencial
```
1. Psicólogo faz login
2. Acessa "Pacientes"
3. Seleciona paciente
4. Clica em "Nova Avaliação"
5. Escolhe "Teste Digital"
6. Seleciona "EPF-TDAH"
7. Clica em "Aplicar Presencialmente"
8. Sistema exibe primeira questão
9. Psicólogo lê questão para paciente
10. Marca resposta
11. Clica em "Próxima"
12. Repete até finalizar todas questões
13. Clica em "Finalizar"
14. Sistema calcula automaticamente
15. Exibe resultados normatizados
16. Psicólogo pode exportar PDF
```

### 7.2 Fluxo: Aplicação Remota
```
1. Psicólogo faz login
2. Acessa "Pacientes"
3. Seleciona paciente
4. Clica em "Nova Avaliação"
5. Escolhe "Teste Digital"
6. Seleciona "EPF-TDAH"
7. Clica em "Enviar Link"
8. Sistema gera:
   - Link: app.com/responder/a7f3k9m2
   - Código: 483926
9. Psicólogo copia e envia por WhatsApp
10. Paciente clica no link
11. Sistema pede código de 6 dígitos
12. Paciente digita código
13. Sistema valida e libera acesso
14. Paciente lê instruções
15. Clica em "Iniciar"
16. Responde questões no próprio ritmo
17. Pode pausar e continuar depois
18. Ao finalizar, clica em "Enviar"
19. Link é bloqueado automaticamente
20. Sistema calcula resultados
21. Psicólogo recebe notificação
22. Psicólogo acessa resultados normatizados
```

### 7.3 Fluxo: Cálculo com Normatização
```
1. Sistema recebe respostas finalizadas
2. Executa regras de cálculo do teste
3. Obtém pontuação bruta
4. Busca dados demográficos do paciente:
   - Idade: 32 anos
   - Escolaridade: 16 anos (superior)
   - Sexo: M
5. Busca tabela normativa ativa para o teste
6. Identifica faixa aplicável:
   - Idade: 26-35 anos
   - Escolaridade: 12+ anos
7. Busca média, DP e percentis da faixa
8. Calcula:
   - Percentil: 72
   - Escore-Z: 0.58
   - Escore-T: 56
   - Classificação: "Médio"
9. Gera interpretação baseada em regras
10. Salva tudo no banco
11. Retorna resultado ao psicólogo
```

---

## 8. INTERFACE DO USUÁRIO

### 8.1 Wireframes Principais

**Dashboard:**
```
┌────────────────────────────────────────────────┐
│ 🧠 NeuroTest    [Buscar...]    [👤 Dra. Maria] │
├────────────────────────────────────────────────┤
│ 📊 Dashboard                                   │
│                                                │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ 45       │ │ 12       │ │ 8        │        │
│ │ Pacientes│ │ Avaliações│ │ Pendentes│        │
│ └──────────┘ └──────────┘ └──────────┘        │
│                                                │
│ Avaliações Recentes:                           │
│ ┌────────────────────────────────────────────┐ │
│ │ João Silva - EPF-TDAH - Completo           │ │
│ │ Maria Costa - BDI-II - Em andamento        │ │
│ │ Pedro Santos - WAIS-IV - Aguardando        │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ [+ Nova Avaliação]                             │
└────────────────────────────────────────────────┘
```

**Lista de Pacientes:**
```
┌────────────────────────────────────────────────┐
│ 👥 Pacientes                    [+ Novo]       │
├────────────────────────────────────────────────┤
│ [Buscar...] [Filtros ▼]                        │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ João Silva (32 anos, M)                    │ │
│ │ CPF: 123.456.789-00                        │ │
│ │ Última avaliação: 15/10/2025               │ │
│ │ [Ver Prontuário] [Nova Avaliação]          │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ Maria Costa (28 anos, F)                   │ │
│ │ ...                                        │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### 8.2 Design System
- **Cores:**
  - Primária: #3B82F6 (azul)
  - Secundária: #10B981 (verde)
  - Alerta: #F59E0B (amarelo)
  - Erro: #EF4444 (vermelho)
  - Fundo: #F9FAFB (cinza claro)

- **Tipografia:**
  - Fonte: Inter (sans-serif)
  - Títulos: 24px/32px, peso 600
  - Corpo: 16px/24px, peso 400

- **Componentes:**
  - Shadcn/UI (React)
  - Tailwind CSS para estilização

---

## 9. CASOS DE USO ESPECIAIS

### 9.1 Paciente Fora das Normas
**Cenário:** Paciente de 70 anos, mas normas só vão até 65.

**Solução:**
1. Sistema identifica que paciente está fora da faixa normativa
2. Usa a faixa mais próxima (61-65 anos)
3. Exibe alerta ao psicólogo:
   ```
   ⚠️ Atenção: Paciente fora da faixa normativa
   
   Idade do paciente: 70 anos
   Normas disponíveis: até 65 anos
   
   Solução aplicada: Utilizadas normas da faixa 61-65 anos.
   
   Interpretação deve considerar extrapolação de dados.
   ```
4. No PDF, inclui nota de rodapé explicando

### 9.2 Múltiplas Normas Disponíveis
**Cenário:** Teste tem normas de 2017 e 2023.

**Solução:**
1. Sistema usa norma marcada como "padrão"
2. Psicólogo pode alterar manualmente
3. Interface:
   ```
   Norma utilizada: Brasil 2023 (padrão)
   [Alterar ▼]
     ○ Brasil 2023 (N=1500) - Padrão
     ○ Brasil 2017 (N=1250)
     ○ Portugal 2020 (N=800)
   ```

### 9.3 Teste Sem Normas
**Cenário:** Teste novo sem tabelas normativas cadastradas.

**Solução:**
1. Sistema calcula apenas pontuação bruta
2. Exibe mensagem:
   ```
   ℹ️ Normas não disponíveis
   
   Este teste ainda não possui tabelas normativas
   cadastradas no sistema.
   
   Resultado: Pontuação bruta apenas
   
   [Cadastrar Normas]
   ```
3. Psicólogo pode interpretar qualitativamente

### 9.4 Link Expirado ou Bloqueado
**Cenário:** Paciente tenta acessar link após 3 tentativas erradas de código.

**Solução:**
1. Sistema exibe mensagem:
   ```
   🔒 Link Bloqueado
   
   Este link foi bloqueado por segurança após
   múltiplas tentativas incorretas.
   
   Entre em contato com seu psicólogo para
   gerar um novo link.
   ```
2. Psicólogo recebe notificação
3. Pode gerar novo link se necessário

---

## 10. ROADMAP DE DESENVOLVIMENTO

### Fase 1: MVP Core (8-10 semanas)
**Semanas 1-2: Infraestrutura e Autenticação**
- Setup Next.js + Supabase + Vercel
- Sistema de autenticação
- CRUD de clínicas e psicólogos
- CRUD de pacientes

**Semanas 3-4: Biblioteca de Testes**
- Model de testes templates
- Cadastro de questões
- Configuração de regras de cálculo simples
- Interface de administração

**Semanas 5-6: Aplicação de Testes**
- Aplicação presencial
- Aplicação remota (link)
- Sistema de respostas
- Controle de status

**Semanas 7-8: Cálculo e Normatização**
- Motor de cálculo
- Cadastro de tabelas normativas
- Algoritmo de normatização
- Exibição de resultados

**Semanas 9-10: Prontuário e Exportação**
- Prontuário digital
- Exportação em PDF
- Testes finais
- Deploy em produção

### Fase 2: Melhorias (4-6 semanas)
- Registros manuais com anexos
- Gráficos de evolução
- Comparação entre avaliações
- Notificações por email
- Melhorias de UX

### Fase 3: Features Avançadas (6-8 semanas)
- Relatório narrativo automático
- Sugestão de bateria de testes
- Agendamento de reavaliações
- Integração com agendas
- Dashboard analítico

---

## 11. MÉTRICAS DE SUCESSO

### 11.1 Produto
- **Tempo de aplicação:** Redução de 30% vs. papel
- **Tempo de correção:** Redução de 90% vs. manual
- **Taxa de adoção:** 70% dos psicólogos usando regularmente após 3 meses
- **NPS:** > 50

### 11.2 Técnicas
- **Uptime:** 99.5%
- **Tempo de cálculo:** < 2 segundos
- **Tempo de carregamento:** < 1 segundo
- **Taxa de erro:** < 0.1%

### 11.3 Negócio
- **Custo operacional:** Mantém-se no Free Tier por 6 meses
- **Escalabilidade:** Suporta 20 psicólogos simultâneos sem degradação
- **Satisfação:** 80% dos usuários reportam "muito satisfeito"

---

## 12. RISCOS E MITIGAÇÕES

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Cálculos incorretos | Alto | Média | Validação extensiva, testes automatizados, dupla conferência manual |
| Dados sensíveis vazados | Alto | Baixa | Criptografia, RLS, auditorias de segurança |
| Performance ruim | Médio | Média | Otimização de queries, caching, CDN |
| Normas desatualizadas | Médio | Alta | Alerta de normas antigas, processo de atualização |
| Psicólogos resistem ao digital | Médio | Média | Treinamento, suporte, interface intuitiva |

---

## 13. APÊNDICES

### Apêndice A: Glossário
- **Pontuação Bruta:** Score calculado diretamente das respostas
- **Percentil:** Posição do paciente em relação à população normativa
- **Escore-Z:** Quantos desvios-padrão o paciente está da média
- **Escore-T:** Escore-Z convertido para escala com média 50 e DP 10
- **Normatização:** Processo de comparar resultado com população de referência
- **Faixa Etária:** Intervalo de idade usado nas tabelas normativas

### Apêndice B: Referências
- Manual EPF-TDAH (Hogrefe CETEPP, 2017)
- Manual BDI-II (Casa do Psicólogo, 2011)
- LGPD - Lei 13.709/2018
- CFP - Resoluções sobre uso de testes psicológicos

---

**Aprovações:**

- [ ] Product Owner: ___________________________
- [ ] Tech Lead: ___________________________
- [ ] Designer: ___________________________
- [ ] Cliente (Neuropsicóloga): ___________________________

**Data:** ___/___/_____