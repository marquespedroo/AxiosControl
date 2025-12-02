import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function checkGabaritoKeys() {
  const { data } = await supabase
    .from('testes_templates')
    .select('questoes, regras_calculo')
    .eq('sigla', 'BHS')
    .single()

  const questoes = data!.questoes as any[]
  const gabarito = data!.regras_calculo.gabarito

  console.log('🔍 BHS Question Numbers vs Gabarito Keys:')
  console.log('='.repeat(80))
  console.log()

  console.log('First 10 questions:')
  questoes.slice(0, 10).forEach((q, idx) => {
    console.log(`  Q${q.numero} (index ${idx}): gabarito["${idx}"] = "${gabarito[idx]}"`)
  })

  console.log()
  console.log('Gabarito structure:')
  console.log('  Total gabarito entries:', Object.keys(gabarito).length)
  console.log('  Gabarito keys:', Object.keys(gabarito).join(', '))

  console.log()
  console.log('🔑 Key Mapping Analysis:')
  console.log('  - Question números: 1-based (1, 2, 3...)')
  console.log('  - Gabarito keys: 0-based (0, 1, 2...)')
  console.log()
  console.log('  CRITICAL: For question with número=1, gabarito key should be "0"')
  console.log('  CRITICAL: For question with número=2, gabarito key should be "1"')
  console.log()
  console.log('  Frontend saves: q1, q2, q3... (1-based)')
  console.log('  Calculator looks for gabarito[parseInt(questionKey)]')
  console.log('  If gabarito uses 0-based keys, calculator must convert q1 → gabarito["0"]')

  console.log()
  console.log('🧮 Calculator Test:')
  const { calculateGabaritoScore } = await import('../lib/calculation/calculator')

  // Test with correct mapping
  const correctRespostas: Record<string, any> = {}
  questoes.forEach((q, idx) => {
    // Question número is 1-based, gabarito key is 0-based
    const correctAnswer = gabarito[String(idx)]
    correctRespostas[`q${q.numero}`] = correctAnswer
  })

  console.log(`  Correct responses: ${Object.entries(correctRespostas).slice(0, 3).map(([k, v]) => `${k}:${v}`).join(', ')}...`)

  const score = calculateGabaritoScore(correctRespostas, gabarito)
  console.log(`  Score: ${score}/${Object.keys(gabarito).length}`)

  if (score === Object.keys(gabarito).length) {
    console.log(`  ✅ PERFECT: Calculator correctly handles key mapping!`)
  } else {
    console.log(`  ❌ ISSUE: Calculator is not matching correctly!`)
    console.log()
    console.log('  Debugging first mismatch:')

    for (let idx = 0; idx < 5; idx++) {
      const q = questoes[idx]
      const userAnswer = correctRespostas[`q${q.numero}`]
      const correctAnswer = gabarito[String(idx)]
      const match = userAnswer === correctAnswer

      console.log(`    Q${q.numero}: user="${userAnswer}", gabarito["${idx}"]="${correctAnswer}" ${match ? '✓' : '✗'}`)
    }
  }
}

checkGabaritoKeys().catch(console.error)
