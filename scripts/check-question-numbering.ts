import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkNumbering() {
  const { data: bdefs } = await supabase
    .from('testes_templates')
    .select('questoes, regras_calculo')
    .eq('sigla', 'BDEFS')
    .single()

  const questoes = bdefs?.questoes as any[]
  console.log('\n📋 BDEFS Question Numbering:')
  console.log('First 5 questions:', questoes.slice(0, 5).map(q => ({ numero: q.numero })))
  console.log('Last 5 questions:', questoes.slice(-5).map(q => ({ numero: q.numero })))
  console.log('Total questions:', questoes.length)

  console.log('\n🧮 BDEFS Sections (from regras_calculo):')
  const secoes = bdefs?.regras_calculo?.secoes
  for (const [nome, range] of Object.entries(secoes as any)) {
    console.log(`  ${nome}: inicio ${(range as any).inicio} → fim ${(range as any).fim}`)
  }

  const { data: psa } = await supabase
    .from('testes_templates')
    .select('questoes, regras_calculo')
    .eq('sigla', 'PSA')
    .single()

  const questoes2 = psa?.questoes as any[]
  console.log('\n📋 PSA Question Numbering:')
  console.log('First 5 questions:', questoes2.slice(0, 5).map(q => ({ numero: q.numero })))
  console.log('Last 5 questions:', questoes2.slice(-5).map(q => ({ numero: q.numero })))
  console.log('Total questions:', questoes2.length)

  console.log('\n🧮 PSA Sections (from regras_calculo):')
  const secoes2 = psa?.regras_calculo?.secoes
  for (const [nome, range] of Object.entries(secoes2 as any)) {
    console.log(`  ${nome}: inicio ${(range as any).inicio} → fim ${(range as any).fim}`)
  }
}

checkNumbering().catch(console.error)
