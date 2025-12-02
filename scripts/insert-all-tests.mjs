import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Load all questions from JSON file
const questionsData = JSON.parse(
  readFileSync(resolve(__dirname, 'all-questions.json'), 'utf-8')
)

// Helper to create question objects
const createQuestions = (texts) => {
  return texts.map((texto, index) => ({
    tipo: 'likert',
    texto,
    numero: index + 1,
    invertida: false
  }))
}

// All 8 test templates with complete data
const testTemplates = [
  // 1. EPF-TDAH
  {
    nome: 'EPF-TDAH',
    nome_completo: 'Escala de Prejuízos Funcionais - TDAH',
    sigla: 'EPF-TDAH',
    versao: '1.0',
    tipo: 'escala_likert',
    faixa_etaria_min: 18,
    tempo_medio_aplicacao: 20,
    publico: true,
    ativo: true,
    questoes: createQuestions(questionsData['EPF-TDAH']),
    escalas_resposta: {
      likert_0_4: [
        { texto: 'Não se aplica (NA)', valor: 0 },
        { texto: 'Nunca (N)', valor: 0 },
        { texto: 'Raramente (R)', valor: 1 },
        { texto: 'Algumas vezes (AV)', valor: 2 },
        { texto: 'Muitas vezes (MV)', valor: 3 },
        { texto: 'Sempre (S)', valor: 4 }
      ]
    },
    regras_calculo: {
      tipo: 'soma_simples',
      escala_maxima: 4,
      pontuacao_minima: 0,
      pontuacao_maxima: 264,
      interpretacao_ranges: [
        { min: 0, max: 88, nivel: 'Baixo', descricao: 'Prejuízos funcionais baixos' },
        { min: 89, max: 176, nivel: 'Moderado', descricao: 'Prejuízos funcionais moderados' },
        { min: 177, max: 264, nivel: 'Alto', descricao: 'Prejuízos funcionais altos' }
      ]
    }
  },

  // 2. AQ
  {
    nome: 'AQ',
    nome_completo: 'Quociente Autism-Spectrum',
    sigla: 'AQ',
    versao: '1.0',
    tipo: 'multipla_escolha',
    faixa_etaria_min: 18,
    tempo_medio_aplicacao: 15,
    publico: true,
    ativo: true,
    questoes: createQuestions(questionsData['AQ']),
    escalas_resposta: {
      multipla_escolha: [
        { texto: 'Concordo definitivamente', valor: 0 },
        { texto: 'Concordo um pouco', valor: 1 },
        { texto: 'Discordo um pouco', valor: 2 },
        { texto: 'Discordo definitivamente', valor: 3 }
      ]
    },
    regras_calculo: {
      tipo: 'pontuacao_especifica',
      pontuacao_minima: 0,
      pontuacao_maxima: 50,
      interpretacao_ranges: [
        { min: 0, max: 25, nivel: 'Baixo', descricao: 'Poucos traços autísticos' },
        { min: 26, max: 31, nivel: 'Limítrofe', descricao: 'Possíveis traços autísticos' },
        { min: 32, max: 50, nivel: 'Alto', descricao: 'Traços autísticos significativos' }
      ]
    }
  },

  // 3. Perfil Sensorial
  {
    nome: 'PSA',
    nome_completo: 'Perfil Sensorial do Adulto/Adolescente',
    sigla: 'PSA',
    versao: '1.0',
    tipo: 'escala_likert',
    faixa_etaria_min: 12,
    tempo_medio_aplicacao: 25,
    publico: true,
    ativo: true,
    questoes: createQuestions(questionsData['Perfil_Sensorial']),
    escalas_resposta: {
      likert_1_5: [
        { texto: 'Quase nunca', valor: 1 },
        { texto: 'Raramente', valor: 2 },
        { texto: 'Ocasionalmente', valor: 3 },
        { texto: 'Frequentemente', valor: 4 },
        { texto: 'Quase sempre', valor: 5 }
      ]
    },
    regras_calculo: {
      tipo: 'soma_por_secao',
      pontuacao_minima: 60,
      pontuacao_maxima: 300,
      secoes: {
        processamento_tatil_olfativo: { inicio: 0, fim: 7 },
        processamento_movimento: { inicio: 8, fim: 15 },
        processamento_visual: { inicio: 16, fim: 25 },
        processamento_tatil: { inicio: 26, fim: 38 },
        nivel_atividade: { inicio: 39, fim: 48 },
        processamento_auditivo: { inicio: 49, fim: 59 }
      },
      interpretacao_ranges: [
        { min: 60, max: 155, nivel: 'Muito Menos', descricao: 'Resposta sensorial muito menor que a maioria' },
        { min: 156, max: 216, nivel: 'Menos', descricao: 'Resposta sensorial menor que a maioria' },
        { min: 217, max: 233, nivel: 'Normal', descricao: 'Resposta sensorial típica' },
        { min: 234, max: 294, nivel: 'Mais', descricao: 'Resposta sensorial maior que a maioria' },
        { min: 295, max: 300, nivel: 'Muito Mais', descricao: 'Resposta sensorial muito maior que a maioria' }
      ]
    }
  },

  // 4. ETDAH-AD
  {
    nome: 'ETDAH-AD',
    nome_completo: 'Escala de Transtorno de Déficit de Atenção/Hiperatividade - Adultos',
    sigla: 'ETDAH-AD',
    versao: '1.0',
    tipo: 'escala_likert',
    faixa_etaria_min: 18,
    tempo_medio_aplicacao: 20,
    publico: true,
    ativo: true,
    questoes: createQuestions(questionsData['ETDAH-AD']),
    escalas_resposta: {
      likert_0_5: [
        { texto: 'Nunca (0)', valor: 0 },
        { texto: 'Muito raramente (1)', valor: 1 },
        { texto: 'Raramente (2)', valor: 2 },
        { texto: 'Geralmente (3)', valor: 3 },
        { texto: 'Frequentemente (4)', valor: 4 },
        { texto: 'Muito Frequentemente (5)', valor: 5 }
      ]
    },
    regras_calculo: {
      tipo: 'soma_simples',
      escala_maxima: 5,
      pontuacao_minima: 0,
      pontuacao_maxima: 345,
      interpretacao_ranges: [
        { min: 0, max: 50, nivel: 'Ausente', descricao: 'Sintomas ausentes ou mínimos de TDAH' },
        { min: 51, max: 100, nivel: 'Leve', descricao: 'Sintomas leves de TDAH' },
        { min: 101, max: 200, nivel: 'Moderado', descricao: 'Sintomas moderados de TDAH' },
        { min: 201, max: 345, nivel: 'Grave', descricao: 'Sintomas graves de TDAH' }
      ]
    }
  },

  // 5. BHS
  {
    nome: 'BHS',
    nome_completo: 'Escala de Desesperança de Beck',
    sigla: 'BHS',
    versao: '1.0',
    tipo: 'multipla_escolha',
    faixa_etaria_min: 17,
    tempo_medio_aplicacao: 10,
    publico: true,
    ativo: true,
    questoes: createQuestions(questionsData['BHS']),
    escalas_resposta: {
      binario: [
        { texto: 'Certo', valor: 'C' },
        { texto: 'Errado', valor: 'E' }
      ]
    },
    regras_calculo: {
      tipo: 'gabarito_binario',
      pontuacao_minima: 0,
      pontuacao_maxima: 20,
      gabarito: {
        0: 'E', 1: 'C', 2: 'C', 3: 'E', 4: 'C', 5: 'E', 6: 'C', 7: 'E', 8: 'C', 9: 'E',
        10: 'E', 11: 'C', 12: 'C', 13: 'E', 14: 'C', 15: 'E', 16: 'C', 17: 'C', 18: 'C', 19: 'E'
      },
      interpretacao_ranges: [
        { min: 0, max: 3, nivel: 'Mínimo', descricao: 'Desesperança mínima' },
        { min: 4, max: 8, nivel: 'Leve', descricao: 'Desesperança leve' },
        { min: 9, max: 14, nivel: 'Moderado', descricao: 'Desesperança moderada' },
        { min: 15, max: 20, nivel: 'Grave', descricao: 'Desesperança grave' }
      ]
    }
  },

  // 6. SRS-2
  {
    nome: 'SRS-2',
    nome_completo: 'Escala de Responsividade Social - Versão 2',
    sigla: 'SRS-2',
    versao: '2.0',
    tipo: 'escala_likert',
    faixa_etaria_min: 19,
    tempo_medio_aplicacao: 20,
    publico: true,
    ativo: true,
    questoes: createQuestions(questionsData['SRS-2']),
    escalas_resposta: {
      likert_1_4: [
        { texto: 'Não é verdade', valor: 1 },
        { texto: 'Algumas vezes é verdade', valor: 2 },
        { texto: 'Muitas vezes é verdade', valor: 3 },
        { texto: 'Quase sempre é verdade', valor: 4 }
      ]
    },
    regras_calculo: {
      tipo: 'soma_simples',
      escala_maxima: 4,
      pontuacao_minima: 65,
      pontuacao_maxima: 260,
      interpretacao_ranges: [
        { min: 65, max: 108, nivel: 'Normal', descricao: 'Funcionamento social dentro da média' },
        { min: 109, max: 148, nivel: 'Leve', descricao: 'Dificuldades sociais leves' },
        { min: 149, max: 188, nivel: 'Moderado', descricao: 'Dificuldades sociais moderadas' },
        { min: 189, max: 260, nivel: 'Grave', descricao: 'Dificuldades sociais graves' }
      ]
    }
  },

  // 7. BDEFS
  {
    nome: 'BDEFS',
    nome_completo: 'Barkley Deficits in Executive Functioning Scale',
    sigla: 'BDEFS',
    versao: '1.0',
    tipo: 'escala_likert',
    faixa_etaria_min: 18,
    tempo_medio_aplicacao: 25,
    publico: true,
    ativo: true,
    questoes: createQuestions(questionsData['BDEFS']),
    escalas_resposta: {
      likert_1_4: [
        { texto: 'Raramente ou nunca', valor: 1 },
        { texto: 'Às vezes', valor: 2 },
        { texto: 'Frequentemente', valor: 3 },
        { texto: 'Muito frequentemente', valor: 4 }
      ]
    },
    regras_calculo: {
      tipo: 'soma_por_secao',
      pontuacao_minima: 89,
      pontuacao_maxima: 356,
      secoes: {
        gestao_tempo: { inicio: 0, fim: 20 },
        organizacao: { inicio: 21, fim: 29 },
        autocontrole: { inicio: 30, fim: 44 },
        automotivacao: { inicio: 45, fim: 63 },
        autorregulacao_emocional: { inicio: 64, fim: 88 }
      },
      interpretacao_ranges: [
        { min: 89, max: 130, nivel: 'Normal', descricao: 'Funcionamento executivo adequado' },
        { min: 131, max: 180, nivel: 'Leve', descricao: 'Déficits leves em funções executivas' },
        { min: 181, max: 270, nivel: 'Moderado', descricao: 'Déficits moderados em funções executivas' },
        { min: 271, max: 356, nivel: 'Grave', descricao: 'Déficits graves em funções executivas' }
      ]
    }
  },

  // 8. BDI-II
  {
    nome: 'BDI-II',
    nome_completo: 'Inventário de Depressão de Beck - II',
    sigla: 'BDI-II',
    versao: '2.0',
    tipo: 'multipla_escolha',
    faixa_etaria_min: 13,
    tempo_medio_aplicacao: 10,
    publico: true,
    ativo: true,
    questoes: questionsData['BDI-II'].map((texto, index) => ({
      tipo: 'multipla_escolha',
      texto,
      numero: index + 1,
      opcoes_especificas: true // BDI-II has specific options per question
    })),
    escalas_resposta: {
      multipla_escolha: [
        { texto: 'Opção 0', valor: 0 },
        { texto: 'Opção 1', valor: 1 },
        { texto: 'Opção 2', valor: 2 },
        { texto: 'Opção 3', valor: 3 }
      ]
    },
    regras_calculo: {
      tipo: 'soma_simples',
      pontuacao_minima: 0,
      pontuacao_maxima: 63,
      interpretacao_ranges: [
        { min: 0, max: 13, nivel: 'Mínimo', descricao: 'Depressão mínima ou ausente' },
        { min: 14, max: 19, nivel: 'Leve', descricao: 'Depressão leve' },
        { min: 20, max: 28, nivel: 'Moderado', descricao: 'Depressão moderada' },
        { min: 29, max: 63, nivel: 'Grave', descricao: 'Depressão grave' }
      ]
    }
  }
]

async function seedAllTests() {
  console.log('🌱 Starting complete test seeding...\n')
  console.log(`📊 Inserting ${testTemplates.length} tests with ${Object.values(questionsData).flat().length} total questions\n`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const template of testTemplates) {
    try {
      console.log(`📝 Processing: ${template.nome_completo} (${template.sigla})`)
      console.log(`   Questions: ${template.questoes.length}`)

      // Check if already exists
      const { data: existing } = await supabase
        .from('testes_templates')
        .select('id, sigla')
        .eq('sigla', template.sigla)
        .single()

      if (existing) {
        console.log(`⚠️  Already exists (ID: ${existing.id}) - Skipping\n`)
        skipCount++
        continue
      }

      const { data, error } = await supabase
        .from('testes_templates')
        .insert([template])
        .select()

      if (error) {
        console.error(`❌ Error:`, error.message)
        errorCount++
        continue
      }

      console.log(`✅ Success! ID: ${data[0].id}\n`)
      successCount++

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (err) {
      console.error(`❌ Exception:`, err.message)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ Seeding completed!')
  console.log('='.repeat(60))
  console.log(`✅ Successfully inserted: ${successCount}`)
  console.log(`⚠️  Skipped (already exist): ${skipCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📊 Total processed: ${testTemplates.length}`)
  console.log('='.repeat(60))
}

seedAllTests()
  .then(() => {
    console.log('\n🎉 Seed script finished!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
