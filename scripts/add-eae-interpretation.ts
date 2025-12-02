import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

async function addEAEInterpretation() {
  console.log('🔧 Adding interpretation ranges for EAE...\n')

  // Get current EAE test
  const { data: eae, error: fetchError } = await supabase
    .from('testes_templates')
    .select('id, regras_calculo')
    .eq('sigla', 'EAE')
    .single()

  if (fetchError || !eae) {
    console.error('❌ Error fetching EAE:', fetchError)
    return
  }

  console.log('📋 Current EAE configuration:')
  console.log('Score range: 10-50 (10 questions × 1-5 scale)')
  console.log('')

  // Proposed interpretation ranges
  // Based on typical emotional assessment scale patterns:
  // - Lower scores = better emotional functioning
  // - Higher scores = more emotional difficulties
  const interpretationRanges = [
    {
      min: 10,
      max: 20,
      nivel: 'Adequado',
      descricao: 'Funcionamento emocional adequado'
    },
    {
      min: 21,
      max: 30,
      nivel: 'Leve',
      descricao: 'Dificuldades emocionais leves'
    },
    {
      min: 31,
      max: 40,
      nivel: 'Moderado',
      descricao: 'Dificuldades emocionais moderadas'
    },
    {
      min: 41,
      max: 50,
      nivel: 'Grave',
      descricao: 'Dificuldades emocionais graves'
    }
  ]

  console.log('📊 Proposed interpretation ranges:')
  for (const range of interpretationRanges) {
    console.log(`  ${range.min}-${range.max}: ${range.nivel} - ${range.descricao}`)
  }
  console.log('')

  // Add interpretation ranges to regras_calculo
  const updatedRegras = {
    ...eae.regras_calculo,
    interpretacao_ranges: interpretationRanges
  }

  // Update database
  const { error: updateError } = await supabase
    .from('testes_templates')
    .update({ regras_calculo: updatedRegras })
    .eq('id', eae.id)

  if (updateError) {
    console.error('\n❌ Error updating EAE:', updateError)
    return
  }

  console.log('✅ EAE interpretation ranges added successfully!')
  console.log('')
  console.log('⚠️  NOTE: These ranges are proposed based on typical emotional assessment')
  console.log('   patterns. If you have published cutoff scores for this specific scale,')
  console.log('   please update them accordingly.')
}

addEAEInterpretation()
