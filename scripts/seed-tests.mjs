import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Test templates data extracted from PDF
const testTemplates = [
  {
    nome: 'EPF-TDAH - Escala de Prejuízos Funcionais TDAH',
    sigla: 'EPF-TDAH',
    descricao: 'Escala composta por frases que descrevem prejuízos que adultos podem vivenciar no cotidiano em função de desatenção, esquecimento, agitação, impulsividade, falta de planejamento, descontrole das emoções e descontrole de raiva.',
    tipo: 'escala_likert',
    versao: '1.0',
    faixa_etaria_min: 18,
    faixa_etaria_max: null,
    publico: true,
    ativo: true,
    configuracao: {
      escala_min: 0,
      escala_max: 4,
      opcoes: ['Não se aplica (NA)', 'Nunca (N)', 'Raramente (R)', 'Algumas vezes (AV)', 'Muitas vezes (MV)', 'Sempre (S)'],
      gabarito: {}
    },
    perguntas: [
      'Meus trabalhos foram de baixa qualidade.',
      'Fui reprovado.',
      'Meus professores e/ou colegas deixaram de confiar em mim.',
      'Fiquei estressado por deixar as tarefas para a última hora.',
      'Deixei cursos inacabados.',
      'Obtive notas baixas.',
      'Gastei mais tempo para concluí-los.',
      'Percebi variações em meu desempenho.'
    ]
  },
  {
    nome: 'AQ - Quociente Autism-Spectrum',
    sigla: 'AQ',
    descricao: 'O Quociente Autism-Spectrum, ou AQ, é uma medida do grau de traços Autísticos em adultos. Este teste não é um autodiagnóstico, tem o objetivo de ajudar a identificar alguns traços que podem estar ligados ao comportamento autista.',
    tipo: 'multipla_escolha',
    versao: '1.0',
    faixa_etaria_min: 18,
    faixa_etaria_max: null,
    publico: true,
    ativo: true,
    configuracao: {
      opcoes: ['Concordo definitivamente', 'Concordo um pouco', 'Discordo um pouco', 'Discordo definitivamente'],
      gabarito: {}
    },
    perguntas: [
      'Eu prefiro fazer as coisas com os outros, em vez de sozinho.',
      'Eu prefiro fazer as coisas da mesma maneira sempre.',
      'Se eu tentar imaginar algo, acho que é muito fácil criar uma imagem em minha mente.'
    ]
  },
  {
    nome: 'BDI-II - Inventário de Depressão de Beck',
    sigla: 'BDI-II',
    descricao: 'Este questionário consiste em 21 grupos de afirmações. Por favor, leia cada uma delas cuidadosamente. Depois, escolha uma frase de cada grupo, que melhor descreva a maneira como você tem se sentido nas duas últimas semanas, incluindo o dia de hoje.',
    tipo: 'multipla_escolha',
    versao: '2.0',
    faixa_etaria_min: 13,
    faixa_etaria_max: null,
    publico: true,
    ativo: true,
    configuracao: {
      opcoes_por_pergunta: true,
      gabarito: {}
    },
    perguntas: [
      'Tristeza',
      'Pessimismo',
      'Fracasso passado'
    ]
  }
]

async function seedTests() {
  console.log('🌱 Starting test templates seed...')
  console.log(`📊 Inserting ${testTemplates.length} test templates...\n`)

  for (const template of testTemplates) {
    try {
      console.log(`📝 Inserting: ${template.nome} (${template.sigla})`)

      // Insert test template
      const { error } = await supabase
        .from('testes_templates')
        .insert([template])
        .select()

      if (error) {
        console.error(`❌ Error inserting ${template.sigla}:`, error.message)
        continue
      }

      console.log(`✅ Successfully inserted: ${template.sigla}`)
      console.log(`   - ${template.perguntas.length} questions`)
      console.log(`   - Type: ${template.tipo}\n`)
    } catch (err) {
      console.error(`❌ Exception inserting ${template.sigla}:`, err.message)
    }
  }

  console.log('\n✨ Test templates seed completed!')
  console.log(`📊 Total templates: ${testTemplates.length}`)
}

// Run the seed
seedTests()
  .then(() => {
    console.log('\n🎉 Seed script finished successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error)
    process.exit(1)
  })
