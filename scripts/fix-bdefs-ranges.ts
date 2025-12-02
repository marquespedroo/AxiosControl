import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixBDEFSRanges() {
  console.log('🔧 Fixing BDEFS section ranges...\n')

  // Get current BDEFS test
  const { data: bdefs, error: fetchError } = await supabase
    .from('testes_templates')
    .select('id, regras_calculo')
    .eq('sigla', 'BDEFS')
    .single()

  if (fetchError || !bdefs) {
    console.error('❌ Error fetching BDEFS:', fetchError)
    return
  }

  console.log('📋 Current section ranges:')
  const regrasCalculo = bdefs.regras_calculo as any
  for (const [nome, range] of Object.entries(regrasCalculo.secoes)) {
    const r = range as any
    console.log(`  ${nome}: ${r.inicio}-${r.fim}`)
  }

  // Fix the autorregulacao_emocional section
  regrasCalculo.secoes.autorregulacao_emocional = {
    inicio: 64,
    fim: 76  // Changed from 88 to 76 (77 total questions, 0-based ends at 76)
  }

  console.log('\n✅ Updated section ranges:')
  for (const [nome, range] of Object.entries(regrasCalculo.secoes)) {
    const r = range as any
    const count = r.fim - r.inicio + 1
    console.log(`  ${nome}: ${r.inicio}-${r.fim} (${count} questions)`)
  }

  // Update database
  const { error: updateError } = await supabase
    .from('testes_templates')
    .update({ regras_calculo: regrasCalculo })
    .eq('id', bdefs.id)

  if (updateError) {
    console.error('\n❌ Error updating BDEFS:', updateError)
    return
  }

  console.log('\n✅ BDEFS section ranges fixed successfully!')
}

fixBDEFSRanges().catch(console.error)
