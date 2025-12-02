import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 Verifying inserted tests...\\n')

const { data, error } = await supabase
  .from('testes_templates')
  .select('id, sigla, nome_completo, tipo, questoes, escalas_resposta, regras_calculo')
  .order('created_at', { ascending: false })
  .limit(8)

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log(`📊 Found ${data.length} tests\\n`)

data.forEach((test, idx) => {
  console.log(`${idx + 1}. ${test.sigla} - ${test.nome_completo}`)
  console.log(`   Type: ${test.tipo}`)
  console.log(`   Questions: ${test.questoes?.length || 0}`)
  console.log(`   Response Scales: ${Object.keys(test.escalas_resposta || {}).join(', ')}`)
  console.log(`   Scoring Rules: ${test.regras_calculo?.tipo || 'N/A'}`)

  if (test.regras_calculo?.interpretacao_ranges) {
    console.log(`   Interpretation Ranges: ${test.regras_calculo.interpretacao_ranges.length}`)
  }
  console.log()
})

console.log('✅ Verification complete\!')
