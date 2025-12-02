import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTests() {
  const { data: tests, error } = await supabase
    .from('testes_templates')
    .select('id, nome, sigla, regras_calculo')
    .in('sigla', ['AQ', 'BDEFS', 'PSA'])
    .order('sigla')

  if (error) {
    console.error('Error fetching tests:', error)
    return
  }

  tests?.forEach(test => {
    console.log('\n' + '='.repeat(80))
    console.log(`Test: ${test.sigla} - ${test.nome}`)
    console.log('='.repeat(80))
    console.log('\n🧮 Regras Calculo:')
    console.log(JSON.stringify(test.regras_calculo, null, 2))
  })
}

checkTests().catch(console.error)
