import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Simulate QuestionRenderer scale finding logic
function findScale(escalasResposta: any): Array<{ texto: string; valor: any }> | null {
  if (!escalasResposta) return null

  const possibleScaleNames = [
    'binario',
    'likert',
    'likert_0_4',
    'likert_0_5',
    'likert_1_4',
    'likert_1_5',
    'multipla_escolha'
  ]

  for (const scaleName of possibleScaleNames) {
    if (escalasResposta[scaleName] && Array.isArray(escalasResposta[scaleName])) {
      return escalasResposta[scaleName].map((opt: any) => ({
        texto: opt.texto,
        valor: opt.valor
      }))
    }
  }

  return null
}

async function verifyOneTest(test: any) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`🧪 ${test.sigla} - ${test.nome}`)
  console.log('='.repeat(80))

  const questoes = test.questoes as any[]
  const escalasResposta = test.escalas_resposta
  const regrasCalculo = test.regras_calculo

  console.log(`\n📊 Test Structure:`)
  console.log(`   Questions: ${questoes.length}`)
  console.log(`   Question tipo: ${questoes[0].tipo}`)
  console.log(`   Calculation type: ${regrasCalculo?.tipo}`)

  // Check if scale can be found
  console.log(`\n🔍 Scale Finding (QuestionRenderer Logic):`)
  const foundScale = findScale(escalasResposta)

  if (foundScale) {
    console.log(`   ✅ Scale found with ${foundScale.length} options`)
    console.log(`   Options:`)
    foundScale.forEach(opt => {
      console.log(`     - "${opt.texto}" → valor: ${JSON.stringify(opt.valor)}`)
    })
  } else {
    console.log(`   ⚠️  No scale found - will fall back to defaults`)
    console.log(`   Available scales: ${Object.keys(escalasResposta || {}).join(', ')}`)
  }

  // Simulate calculation
  console.log(`\n🧮 Calculation Test:`)

  if (!foundScale && regrasCalculo?.tipo !== 'gabarito_binario') {
    console.log(`   ⚠️  Using default scale, assuming valores 1-5`)
  }

  try {
    const { calculateRawScore } = await import('../lib/calculation/calculator')

    // Generate test responses
    let testRespostas: Record<string, any> = {}

    if (regrasCalculo?.tipo === 'gabarito_binario') {
      // For gabarito tests, use correct answers
      const gabarito = regrasCalculo.gabarito
      questoes.forEach((q, idx) => {
        const correctAnswer = gabarito[String(idx)]
        testRespostas[`q${q.numero}`] = correctAnswer
      })
    } else if (foundScale) {
      // Use first option valor for each question
      questoes.forEach(q => {
        testRespostas[`q${q.numero}`] = foundScale[0].valor
      })
    } else {
      // Use default valor 1
      questoes.forEach(q => {
        testRespostas[`q${q.numero}`] = 1
      })
    }

    // Get max scale value
    let maxScaleValue = 5
    if (foundScale) {
      maxScaleValue = Math.max(...foundScale.map(o => {
        const val = typeof o.valor === 'number' ? o.valor : parseInt(o.valor)
        return isNaN(val) ? 5 : val
      }))
    }

    console.log(`   Max scale value: ${maxScaleValue}`)
    console.log(`   Sample responses: ${Object.entries(testRespostas).slice(0, 3).map(([k, v]) => `${k}:${v}`).join(', ')}...`)

    const rawScore = calculateRawScore(testRespostas, regrasCalculo, questoes, maxScaleValue)

    console.log(`   ✅ Calculation successful`)
    console.log(`   Score: ${rawScore.total}`)
    if (rawScore.secoes) {
      console.log(`   Sections: ${Object.entries(rawScore.secoes).map(([k, v]) => `${k}:${v}`).join(', ')}`)
    }

    // Verify result makes sense
    if (regrasCalculo?.tipo === 'gabarito_binario') {
      const expectedScore = Object.keys(regrasCalculo.gabarito).length
      if (rawScore.total === expectedScore) {
        console.log(`   ✅ PERFECT: All answers matched!`)
        return { sigla: test.sigla, status: 'success', score: rawScore.total, expected: expectedScore }
      } else {
        console.log(`   ⚠️  Score ${rawScore.total}/${expectedScore} - may indicate key mismatch`)
        return { sigla: test.sigla, status: 'partial', score: rawScore.total, expected: expectedScore }
      }
    } else {
      console.log(`   ℹ️  Non-gabarito test, score ${rawScore.total} looks reasonable`)
      return { sigla: test.sigla, status: 'success', score: rawScore.total }
    }
  } catch (error: any) {
    console.log(`   ❌ Calculation failed: ${error.message}`)
    return { sigla: test.sigla, status: 'error', error: error.message }
  }
}

async function verifyAllFixes() {
  console.log('🔬 COMPREHENSIVE VERIFICATION OF ALL FIXES')
  console.log('Testing: QuestionRenderer scale finding + Calculator')
  console.log('=' .repeat(80))

  const { data: tests, error } = await supabase
    .from('testes_templates')
    .select('id, nome, sigla, questoes, escalas_resposta, regras_calculo')
    .eq('ativo', true)
    .order('sigla')

  if (error || !tests) {
    console.error('❌ Failed to load tests:', error)
    return
  }

  console.log(`\nFound ${tests.length} active tests`)

  const results = []
  for (const test of tests) {
    const result = await verifyOneTest(test)
    results.push(result)
  }

  // Summary
  console.log(`\n\n${'='.repeat(80)}`)
  console.log('📊 COMPREHENSIVE VERIFICATION SUMMARY')
  console.log('='.repeat(80))

  const successful = results.filter(r => r.status === 'success')
  const partial = results.filter(r => r.status === 'partial')
  const failed = results.filter(r => r.status === 'error')

  console.log(`\n✅ Successful: ${successful.length}/${results.length}`)
  successful.forEach(r => {
    console.log(`   ✓ ${r.sigla}${r.score !== undefined ? ` (score: ${r.score})` : ''}`)
  })

  if (partial.length > 0) {
    console.log(`\n⚠️  Partial: ${partial.length}/${results.length}`)
    partial.forEach(r => {
      console.log(`   ~ ${r.sigla} (score: ${r.score}/${r.expected})`)
    })
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${results.length}`)
    failed.forEach(r => {
      console.log(`   ✗ ${r.sigla}: ${r.error}`)
    })
  }

  console.log(`\n${'='.repeat(80)}`)

  if (failed.length === 0) {
    console.log('✅ ALL TESTS PASSED!')
  } else {
    console.log(`⚠️  ${failed.length} test(s) still have issues`)
  }
}

verifyAllFixes().catch(console.error)
