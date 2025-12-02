import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function diagnoseBHSTest() {
  console.log('🔍 Diagnosing BHS Test Issue\n')
  console.log('='.repeat(80))

  // Find the most recent completed BHS test for Lucas Alves
  const { data: tests, error: testsError } = await supabase
    .from('testes_aplicados')
    .select(`
      *,
      teste_template:teste_template_id (
        id,
        nome,
        sigla,
        questoes,
        escalas_resposta,
        regras_calculo
      ),
      paciente:paciente_id (
        id,
        nome_completo
      )
    `)
    .eq('teste_template.sigla', 'BHS')
    .eq('status', 'completo')
    .order('data_conclusao', { ascending: false })
    .limit(3)

  if (testsError || !tests || tests.length === 0) {
    console.error('❌ No completed BHS tests found:', testsError)
    return
  }

  for (const teste of tests) {
    console.log(`\n📋 Test ID: ${teste.id}`)
    console.log(`Patient: ${(teste.paciente as any).nome_completo}`)
    console.log(`Completed: ${teste.data_conclusao}`)
    console.log(`Status: ${teste.status}`)

    const testTemplate = teste.teste_template as any
    const respostas = teste.respostas as any
    const pontuacaoBruta = teste.pontuacao_bruta as any
    const gabarito = testTemplate.regras_calculo?.gabarito

    console.log(`\n📊 Stored Score: ${pontuacaoBruta?.total}`)
    console.log(`Number of responses: ${Object.keys(respostas || {}).length}`)

    if (!gabarito) {
      console.log('❌ No gabarito found in test template!')
      continue
    }

    console.log(`\n🔑 Answer Key (Gabarito):`)
    console.log(`  Total entries: ${Object.keys(gabarito).length}`)
    console.log(`  Sample: ${Object.entries(gabarito).slice(0, 5).map(([k, v]) => `${k}:${v}`).join(', ')}...`)

    console.log(`\n📝 Patient Responses:`)
    const responseKeys = Object.keys(respostas || {}).sort((a, b) => {
      const numA = parseInt(a.replace('q', ''))
      const numB = parseInt(b.replace('q', ''))
      return numA - numB
    })
    console.log(`  Response keys: ${responseKeys.slice(0, 10).join(', ')}...`)
    console.log(`  Sample values: ${responseKeys.slice(0, 5).map(k => `${k}:${respostas[k]}`).join(', ')}...`)

    // Manual calculation to diagnose
    console.log(`\n🧮 Manual Calculation:`)
    let manualScore = 0
    const matches: string[] = []
    const mismatches: string[] = []

    for (const [gabaritoKey, correctAnswer] of Object.entries(gabarito)) {
      const questionNum = parseInt(gabaritoKey)

      // Check all possible key formats
      const possibleKeys = [
        `q${questionNum}`,
        `q${questionNum + 1}`,  // In case indexing is off
        questionNum.toString(),
        (questionNum + 1).toString()
      ]

      let userAnswer: any = null
      for (const key of possibleKeys) {
        if (respostas && respostas[key] !== undefined) {
          userAnswer = respostas[key]
          break
        }
      }

      if (userAnswer !== null) {
        if (userAnswer === correctAnswer) {
          manualScore++
          matches.push(`Q${questionNum}: ${userAnswer} ✓`)
        } else {
          mismatches.push(`Q${questionNum}: ${userAnswer} (expected ${correctAnswer}) ✗`)
        }
      } else {
        console.log(`  ⚠️  Question ${questionNum} not found in responses`)
        console.log(`     Tried keys: ${possibleKeys.join(', ')}`)
      }
    }

    console.log(`  Manual Score: ${manualScore}/${Object.keys(gabarito).length}`)
    console.log(`  Matches: ${matches.length}`)
    console.log(`  Mismatches: ${mismatches.length}`)

    if (matches.length > 0) {
      console.log(`\n  ✅ First 5 correct answers:`)
      matches.slice(0, 5).forEach(m => console.log(`     ${m}`))
    }

    if (mismatches.length > 0) {
      console.log(`\n  ❌ First 5 incorrect answers:`)
      mismatches.slice(0, 5).forEach(m => console.log(`     ${m}`))
    }

    // Check if calculation matches
    if (manualScore !== pontuacaoBruta?.total) {
      console.log(`\n⚠️  MISMATCH DETECTED!`)
      console.log(`   Stored score: ${pontuacaoBruta?.total}`)
      console.log(`   Manual calculation: ${manualScore}`)
      console.log(`   Difference: ${Math.abs(manualScore - (pontuacaoBruta?.total || 0))}`)
    } else {
      if (matches.length > 0) {
        console.log(`\n  ✅ First 5 correct answers:`)
        matches.slice(0, 5).forEach(m => console.log(`     ${m}`))
      }

      if (mismatches.length > 0) {
        console.log(`\n  ❌ First 5 incorrect answers:`)
        mismatches.slice(0, 5).forEach(m => console.log(`     ${m}`))
      }

      // Check if calculation matches
      if (manualScore !== pontuacaoBruta?.total) {
        console.log(`\n⚠️  MISMATCH DETECTED!`)
        console.log(`   Stored score: ${pontuacaoBruta?.total}`)
        console.log(`   Manual calculation: ${manualScore}`)
        console.log(`   Difference: ${Math.abs(manualScore - (pontuacaoBruta?.total || 0))}`)
      } else {
        console.log(`\n✅ Calculation matches stored score`)
      }

      // Test with actual calculator function
      try {
        const { calculateGabaritoScore } = await import('../lib/calculation/calculator')
        const calculatorScore = calculateGabaritoScore(respostas, gabarito)
        console.log(`\n🔧 Calculator Function Result: ${calculatorScore}`)

        if (calculatorScore !== manualScore) {
          console.log(`   ⚠️  Calculator function gives different result than manual calculation!`)
        }
      } catch (error: any) {
        console.log(`\n❌ Error calling calculator: ${error.message}`)
      }

      console.log('\n' + '='.repeat(80))
    }
  }
}

diagnoseBHSTest().catch(console.error)
