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

console.log('🔍 Checking test status...\\n')

const { data, error } = await supabase
  .from('testes_templates')
  .select('sigla, nome, ativo, publico, nome_completo')
  .order('created_at', { ascending: false })
  .limit(10)

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log('Found', data.length, 'tests\\n')
data.forEach(t => {
  console.log(`${t.sigla}: ativo=${t.ativo}, publico=${t.publico}`)
})

