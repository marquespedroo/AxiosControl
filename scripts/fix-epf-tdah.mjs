import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const questionsData = JSON.parse(
  readFileSync(resolve(__dirname, 'all-questions.json'), 'utf-8')
)

const createQuestions = (texts) => {
  return texts.map((texto, index) => ({
    tipo: 'likert',
    texto,
    numero: index + 1,
    invertida: false
  }))
}

console.log('🔄 Updating EPF-TDAH with correct questions...\\n')

const updatedTest = {
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
}

const { data, error } = await supabase
  .from('testes_templates')
  .update(updatedTest)
  .eq('sigla', 'EPF-TDAH')
  .select()

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log(`✅ Updated EPF-TDAH successfully!`)
console.log(`   Questions: ${data[0].questoes.length}`)
console.log(`   ID: ${data[0].id}`)
