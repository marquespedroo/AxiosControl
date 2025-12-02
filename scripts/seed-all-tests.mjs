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

// Helper function to create question objects
const createQuestions = (texts) => {
  return texts.map((texto, index) => ({
    tipo: 'likert',
    texto,
    numero: index + 1,
    invertida: false
  }))
}

const testTemplates = [
  // Test 1: EPF-TDAH
  {
    nome: 'EPF-TDAH',
    nome_completo: 'Escala de Prejuízos Funcionais - TDAH',
    sigla: 'EPF-TDAH',
    versao: '1.0',
    tipo: 'escala_likert',
    faixa_etaria_min: 18,
    faixa_etaria_max: null,
    tempo_medio_aplicacao: 20,
    publico: true,
    ativo: true,
    questoes: createQuestions([
      'Meus trabalhos foram de baixa qualidade.',
      'Fui reprovado.',
      'Meus professores e/ou colegas deixaram de confiar em mim.',
      'Fiquei estressado por deixar as tarefas para a última hora.',
      'Deixei cursos inacabados.',
      'Obtive notas baixas.',
      'Gastei mais tempo para concluí-los.',
      'Percebi variações em meu desempenho.',
      'As pessoas ficaram insatisfeitas com o meu desempenho.',
      'Fui repreendido pelo meu superior.',
      'Perdi oportunidades.',
      'Me senti fracassado.',
      'Me senti inseguro.',
      'As pessoas deixaram de confiar em mim.',
      'Fui demitido.',
      'Ocupei cargo abaixo do meu potencial.',
      'A minha carreira ficou parada.',
      'As minhas relações com os colegas de trabalho foram conflituosas.',
      'O meu parceiro precisou assumir responsabilidades que eram minhas.',
      'Os términos foram precipitados.',
      'Recebi queixas sobre o meu modo de ser.',
      'Vivenciei conflitos com o meu companheiro.',
      'Pequenos desentendimentos ganharam uma grande proporção.',
      'O meu parceiro precisou assumir responsabilidades que eram minhas.',
      'Os términos foram precipitados.',
      'Recebi queixas sobre o meu modo de ser.',
      'Vivenciei conflitos com o meu companheiro.',
      'Pequenos desentendimentos ganharam uma grande proporção.',
      'Meu parceiro ficou insatisfeito comigo.',
      'Senti-me entediado.',
      'Tive dificuldade em manter relações duradouras.',
      'Os ambientes ficaram bagunçados por um grande período de tempo.',
      'Meus familiares ficaram chateados pelo meu modo de ser.',
      'Ocorreram pequenos acidentes (por exemplo, esqueci a panela no fogo, me cortei).',
      'Senti-me incapaz para realizar os afazeres domésticos.',
      'Vivenciei conflitos com meus familiares.',
      'Perdi o prazo de garantia de eletrodomésticos que precisavam de troca ou reparo.',
      'Fui chamado de irresponsável.',
      'Tive gastos desnecessários.',
      'Fiquei endividado.',
      'Tive algum serviço cortado/suspenso por falta de pagamento.',
      'Dependi de alguém para controlar minhas finanças.',
      'Tive prejuízos financeiros.',
      'Tive restrição de crédito.',
      'Tive meu nome incluído em algum cadastro (SERASA, SPC) em função de dívidas.',
      'Tive horários de alimentação desregulados.',
      'Adoeci por falta de prevenção.',
      'A minha rotina de sono foi alterada.',
      'Fiquei sedentário.',
      'Tive doenças agravadas por falta de cuidado.',
      'Tive problemas com álcool, cigarro e/ou drogas.',
      'As pessoas se sentiram inseguras em andar comigo enquanto eu dirigia o carro.',
      'Me envolvi em acidentes.',
      'Recebi multas de trânsito.',
      'Coloquei-me em situações de risco.',
      'Me envolvi em conflitos com outros motoristas quando dirigia meu carro.',
      'Meu veículo ficou exposto a danos e desgastes mecânicos.',
      'Vivenciei momentos difíceis por desacatar figuras de autoridade (como policiais, professores ou eu chefe).',
      'Me envolvi em situações graves em que poderia ter sido preso.',
      'Me expus a situações perigosas por fazer uso e/ou transportar substâncias ilícitas.',
      'Com o risco de ser processado por estranger, insultar e/ou humilhar outra pessoa.',
      'Com o risco de ser processado por agredir outra pessoa.'
    ]),
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

// I'll continue with remaining tests in next message due to size
console.log('Note: This is Test 1 only. Will create separate files for each test.')

async function seedTests() {
  console.log('🌱 Starting test seeding...\n')
  console.log(`📊 Inserting ${testTemplates.length} test template(s)...\\n`)

  for (const template of testTemplates) {
    try {
      console.log(`📝 Inserting: ${template.nome} (${template.sigla})`)

      // Check if already exists
      const { data: existing } = await supabase
        .from('testes_templates')
        .select('id, sigla')
        .eq('sigla', template.sigla)
        .single()

      if (existing) {
        console.log(`⚠️  Test ${template.sigla} already exists (ID: ${existing.id})`)
        console.log(`   Skipping...\\n`)
        continue
      }

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
      console.log(`   - ${template.questoes.length} questions`)
      console.log(`   - ID: ${data[0].id}\\n`)
    } catch (err) {
      console.error(`❌ Exception inserting ${template.sigla}:`, err.message)
    }
  }

  console.log('\\n✨ Test templates seed completed!')
  console.log(`📊 Total templates processed: ${testTemplates.length}`)
}

seedTests()
  .then(() => {
    console.log('\\n🎉 Seed script finished successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\\n💥 Seed script failed:', error)
    process.exit(1)
  })
