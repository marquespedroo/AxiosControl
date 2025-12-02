import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function queryValidTipos() {
  console.log('🔍 Querying valid tipo values...\n')

  const { data, error } = await supabase
    .from('testes_templates')
    .select('tipo, sigla')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('✅ Found tests:')
    data.forEach(test => {
      console.log(`   - ${test.sigla}: tipo = "${test.tipo}"`)
    })

    const uniqueTipos = [...new Set(data.map(t => t.tipo))]
    console.log('\n✅ Valid tipo values:')
    uniqueTipos.forEach(tipo => {
      console.log(`   - "${tipo}"`)
    })
  } else {
    console.log('⚠️  No tests found in database')
  }
}

queryValidTipos()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
