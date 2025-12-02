import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectTable() {
  console.log('🔍 Fetching existing test template...\n')

  // Get one existing record to see its structure
  const { data, error } = await supabase
    .from('testes_templates')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log('✅ Existing record structure:')
  console.log(JSON.stringify(data, null, 2))

  console.log('\n📋 Column names:')
  Object.keys(data).forEach(col => {
    console.log(`  - ${col}: ${typeof data[col]}`)
  })
}

inspectTable()
