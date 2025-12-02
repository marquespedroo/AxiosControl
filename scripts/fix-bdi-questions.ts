import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// BDI-II question groups with their 4 options (severity levels 0-3)
const bdiQuestionGroups = [
  {
    numero: 1,
    texto: 'Tristeza',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não me sinto triste.',
      'Eu me sinto triste grande parte do tempo.',
      'Estou triste o tempo todo.',
      'Estou tão triste ou tão infeliz que não consigo suportar.'
    ]
  },
  {
    numero: 2,
    texto: 'Pessimismo',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não estou desanimado(a) a respeito do meu futuro.',
      'Eu me sinto mais desanimado(a) a respeito do meu futuro do que de costume.',
      'Não espero que as coisas deem certo para mim.',
      'Sinto que não há esperança quanto ao meu futuro. Acho que só vai piorar.'
    ]
  },
  {
    numero: 3,
    texto: 'Fracasso passado',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não me sinto um(a) fracassado(a).',
      'Tenho fracassado mais do que deveria.',
      'Quando penso no passado vejo muitos fracassos.',
      'Sinto que como pessoa sou um fracasso total.'
    ]
  },
  {
    numero: 4,
    texto: 'Perda de prazer',
    tipo: 'multipla_escolha',
    opcoes: [
      'Continuo sentindo o mesmo prazer que sentia com as coisas de que eu gosto.',
      'Não sinto tanto prazer com as coisas como costumava sentir.',
      'Tenho muito pouco prazer nas coisas que eu costumava gostar.',
      'Não tenho mais nenhum prazer nas coisas que costumava gostar.'
    ]
  },
  {
    numero: 5,
    texto: 'Sentimentos de culpa',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não me sinto particularmente culpado(a).',
      'Eu me sinto culpado(a) a respeito de várias coisas que fiz e/ou que deveria ter feito.',
      'Eu me sinto culpado(a) a maior parte do tempo.',
      'Eu me sinto culpado(a) o tempo todo.'
    ]
  },
  {
    numero: 6,
    texto: 'Sentimentos de punição',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não sinto que estou sendo punido(a).',
      'Sinto que posso ser punido(a).',
      'Eu acho que serei punido(a).',
      'Sinto que estou sendo punido(a).'
    ]
  },
  {
    numero: 7,
    texto: 'Auto-estima',
    tipo: 'multipla_escolha',
    opcoes: [
      'Eu me sinto como sempre me senti em relação a mim mesmo(a).',
      'Perdi a confiança em mim mesmo(a).',
      'Estou desapontado(a) comigo mesmo(a).',
      'Não gosto de mim.'
    ]
  },
  {
    numero: 8,
    texto: 'Autocrítica',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não me critico nem me culpo mais do que o habitual.',
      'Estou sendo mais crítico(a) comigo mesmo(a) do que costumava ser.',
      'Eu me crítico por todos os meus erros.',
      'Eu me culpo por tudo de ruim que acontece.'
    ]
  },
  {
    numero: 9,
    texto: 'Pensamentos ou desejos suicidas',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não tenho nenhum pensamento de me matar.',
      'Tenho pensamentos de me matar, mas não levaria isso adiante.',
      'Gostaria de me matar.',
      'Eu me mataria se tivesse oportunidade.'
    ]
  },
  {
    numero: 10,
    texto: 'Choro',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não choro mais do que chorava antes.',
      'Choro mais agora do que costumava chorar.',
      'Choro por qualquer coisinha.',
      'Sinto vontade de chorar, mas não consigo.'
    ]
  },
  {
    numero: 11,
    texto: 'Agitação',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não me sinto mais inquieto(a) ou agitado(a) do que me sentia antes.',
      'Eu me sinto mais inquieto(a) ou agitado(a) do que me sentia antes.',
      'Eu me sinto tão inquieto(a) ou agitado(a) que é difícil ficar parado(a).',
      'Estou tão inquieto(a) ou agitado(a) que tenho que estar sempre me mexendo ou fazendo alguma coisa.'
    ]
  },
  {
    numero: 12,
    texto: 'Perda de interesse',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não perdi o interesse por outras pessoas ou coisas.',
      'Estou menos interessado pelas outras pessoas ou coisas do que costumava estar.',
      'Perdi quase todo o interesse por outras pessoas ou coisas.',
      'É difícil me interessar por alguma coisa.'
    ]
  },
  {
    numero: 13,
    texto: 'Indecisão',
    tipo: 'multipla_escolha',
    opcoes: [
      'Tomo minhas decisões tão bem quanto antes.',
      'Acho mais difícil tomar decisões agora do que antes.',
      'Tenho muito mais dificuldade em tomar decisões agora do que antes.',
      'Tenho dificuldade para tomar qualquer decisão.'
    ]
  },
  {
    numero: 14,
    texto: 'Desvalorização',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não me sinto sem valor.',
      'Não me considero hoje tão útil ou não me valorizo como antes.',
      'Eu me sinto com menos valor quando me comparo com outras pessoas.',
      'Eu me sinto completamente sem valor.'
    ]
  },
  {
    numero: 15,
    texto: 'Falta de energia',
    tipo: 'multipla_escolha',
    opcoes: [
      'Tenho tanta energia hoje como sempre tive.',
      'Tenho menos energia do que costumava ter.',
      'Não tenho energia suficiente para fazer muita coisa.',
      'Não tenho energia suficiente para nada.'
    ]
  },
  {
    numero: 16,
    texto: 'Alterações no padrão de sono',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não percebi nenhuma mudança no meu sono.',
      'Durmo um pouco mais/menos do que o habitual.',
      'Durmo muito mais/menos do que o habitual.',
      'Durmo a maior parte do dia / Acordo 1-2 horas mais cedo e não consigo voltar a dormir.'
    ]
  },
  {
    numero: 17,
    texto: 'Irritabilidade',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não estou mais irritado(a) do que o habitual.',
      'Estou mais irritado(a) do que o habitual.',
      'Estou muito mais irritado(a) do que o habitual.',
      'Fico irritado(a) o tempo todo.'
    ]
  },
  {
    numero: 18,
    texto: 'Alterações de apetite',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não percebi nenhuma mudança no meu apetite.',
      'Meu apetite está um pouco menor/maior do que o habitual.',
      'Meu apetite está muito menor/maior do que antes.',
      'Não tenho nenhum apetite / Quero comer o tempo todo.'
    ]
  },
  {
    numero: 19,
    texto: 'Dificuldade de concentração',
    tipo: 'multipla_escolha',
    opcoes: [
      'Posso me concentrar tão bem quanto antes.',
      'Não posso me concentrar tão bem como habitualmente.',
      'É muito difícil manter a concentração em alguma coisa por muito tempo.',
      'Eu acho que não consigo me concentrar em nada.'
    ]
  },
  {
    numero: 20,
    texto: 'Cansaço ou fadiga',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não estou mais cansado(a) ou fatigado(a) do que o habitual.',
      'Fico cansado(a) ou fatigado(a) mais facilmente do que o habitual.',
      'Eu me sinto muito cansado(a) ou fatigado(a) para fazer muitas das coisas que costumava fazer.',
      'Eu me sinto muito cansado(a) ou fatigado(a) para fazer a maioria das coisas que costumava fazer.'
    ]
  },
  {
    numero: 21,
    texto: 'Perda de interesse por sexo',
    tipo: 'multipla_escolha',
    opcoes: [
      'Não notei qualquer mudança recente no meu interesse por sexo.',
      'Estou menos interessado(a) em sexo do que costumava estar.',
      'Estou muito menos interessado(a) em sexo agora.',
      'Perdi completamente o interesse por sexo.'
    ]
  }
]

async function fixBDIQuestions() {
  console.log('🔧 Fixing BDI-II questions structure...')

  try {
    // First, get the BDI-II template
    const { data: template, error: fetchError } = await supabase
      .from('testes_templates')
      .select('id, nome, questoes')
      .eq('sigla', 'BDI-II')
      .single()

    if (fetchError || !template) {
      console.error('❌ BDI-II template not found:', fetchError?.message)
      return
    }

    console.log(`✅ Found BDI-II template: ${template.nome}`)
    console.log(`   Current questions structure:`, template.questoes)

    // Update the template with properly structured questions
    const { error: updateError } = await supabase
      .from('testes_templates')
      .update({ questoes: bdiQuestionGroups as any })
      .eq('id', template.id)
      .select()

    if (updateError) {
      console.error('❌ Error updating BDI-II questions:', updateError.message)
      return
    }

    console.log(`✅ Successfully updated BDI-II with ${bdiQuestionGroups.length} question groups`)
    console.log('   Each group now has 4 properly structured options')
  } catch (err: any) {
    console.error('❌ Exception:', err.message)
  }
}

// Run the fix
fixBDIQuestions()
  .then(() => {
    console.log('\n🎉 Fix completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error)
    process.exit(1)
  })
