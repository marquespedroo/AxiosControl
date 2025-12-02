import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env.local') })

// Test with ANON key (like frontend would use)
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

console.log('🔍 Testing with ANON key (frontend simulation)...\\n')

const { data, error, count } = await supabaseAnon
  .from('testes_templates')
  .select('*', { count: 'exact' })
  .eq('ativo', true)
  .limit(10)

if (error) {
  console.error('❌ Error:', error.message)
  console.error('Code:', error.code)
  console.error('Details:', error.details)
  console.error('Hint:', error.hint)
} else {
  console.log(`✅ Success! Found ${count} total tests`)
  console.log(`Returned ${data.length} tests`)
  if (data.length > 0) {
    console.log('\\nFirst test:', data[0].nome, '-', data[0].sigla)
  }
}

