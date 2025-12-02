import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

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

// First, let me create a smaller test with EPF-TDAH to verify the structure
const testTemplates = [
  {
    nome: 'EPF-TDAH',
    nome_completo: 'Escala de Prejuízos Funcionais - TDAH',
    sigla: 'EPF-TDAH',
    versao: '1.0',
    tipo: 'escala_likert',
    faixa_etaria_min: 18,
    faixa_etaria_max: null,
    tempo_medio_aplicacao: 15,
    publico: true,
    ativo: true,
    questoes: [
      { tipo: 'likert', texto: 'Meus trabalhos foram de baixa qualidade.', numero: 1, invertida: false },
      { tipo: 'likert', texto: 'Fui reprovado.', numero: 2, invertida: false },
      { tipo: 'likert', texto: 'Meus professores e/ou colegas deixaram de confiar em mim.', numero: 3, invertida: false },
      { tipo: 'likert', texto: 'Fiquei estressado por deixar as tarefas para a última hora.', numero: 4, invertida: false },
      { tipo: 'likert', texto: 'Deixei cursos inacabados.', numero: 5, invertida: false }
    ],
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
  }
]

async function seedTests() {
  console.log('🌱 Starting test seeding with correct schema...\n')

  for (const template of testTemplates) {
    console.log(`📝 Inserting: ${template.nome}`)

    const { data, error } = await supabase
      .from('testes_templates')
      .insert([template])
      .select()

    if (error) {
      console.error(`❌ Error inserting ${template.sigla}:`, error.message)
      console.error('Details:', JSON.stringify(error, null, 2))
      continue
    }

    console.log(`✅ Successfully inserted: ${template.sigla}`)
    console.log(`   ID: ${data[0].id}`)
  }

  console.log('\n✨ Seed completed!')
}

seedTests()
