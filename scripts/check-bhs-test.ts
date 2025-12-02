import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkBHS() {
  const { data: bhs, error } = await supabase
    .from('testes_templates')
    .select('id, nome, sigla, questoes, escalas_resposta, regras_calculo')
    .eq('sigla', 'BHS')
    .single()

  if (error) {
    console.log('❌ BHS not found:', error.message)

    // List all available tests
    const { data: allTests } = await supabase
      .from('testes_templates')
      .select('sigla, nome')
      .order('sigla')

    console.log('\n📋 Available tests:')
    allTests?.forEach(t => console.log(`  - ${t.sigla}: ${t.nome}`))
    return
  }

  console.log('✅ BHS Test Found:')
  console.log('ID:', bhs.id)
  console.log('Name:', bhs.nome)
  console.log('\n📝 Questions (' + (bhs.questoes as any[]).length + ' total):')
  console.log(JSON.stringify((bhs.questoes as any[]).slice(0, 3), null, 2))
  console.log('...')

  console.log('\n📊 Escalas Resposta:')
  console.log(JSON.stringify(bhs.escalas_resposta, null, 2))

  console.log('\n🧮 Regras Calculo:')
  console.log(JSON.stringify(bhs.regras_calculo, null, 2))
}

checkBHS().catch(console.error)
