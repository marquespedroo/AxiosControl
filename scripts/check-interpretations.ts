import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkInterpretations() {
  const { data: tests, error } = await supabase
    .from('testes_templates')
    .select('sigla, nome, regras_calculo, interpretacao')
    .order('sigla')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('=== Test Interpretation Status ===\n')

  for (const test of tests) {
    const hasInterpretationRanges = test.regras_calculo?.interpretacao_ranges &&
                                   Array.isArray(test.regras_calculo.interpretacao_ranges) &&
                                   test.regras_calculo.interpretacao_ranges.length > 0

    const hasInterpretacaoField = test.interpretacao?.faixas &&
                                 Array.isArray(test.interpretacao.faixas) &&
                                 test.interpretacao.faixas.length > 0

    const status = (hasInterpretationRanges || hasInterpretacaoField) ? '✅' : '❌'

    console.log(`${status} ${test.sigla} - ${test.nome}`)

    if (hasInterpretationRanges) {
      console.log(`   └─ Has interpretacao_ranges in regras_calculo (${test.regras_calculo.interpretacao_ranges.length} ranges)`)
    }
    if (hasInterpretacaoField) {
      console.log(`   └─ Has faixas in interpretacao field (${test.interpretacao.faixas.length} ranges)`)
    }
    if (!hasInterpretationRanges && !hasInterpretacaoField) {
      console.log(`   └─ NO INTERPRETATION RANGES DEFINED`)
    }
    console.log('')
  }
}

checkInterpretations()
