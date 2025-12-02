import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyBHSFix() {
  console.log('🔬 VERIFYING BHS FIX')
  console.log('=' .repeat(80))

  // Get BHS test template
  const { data: bhsTest, error } = await supabase
    .from('testes_templates')
    .select('id, nome, sigla, questoes, escalas_resposta, regras_calculo')
    .eq('sigla', 'BHS')
    .single()

  if (error || !bhsTest) {
    console.error('❌ Failed to load BHS test:', error)
    return
  }

  console.log(`\n📋 BHS Test Structure:`)
  console.log(`   Test ID: ${bhsTest.id}`)
  console.log(`   Name: ${bhsTest.nome}`)
  console.log(`   Total Questions: ${(bhsTest.questoes as any[]).length}`)

  // Check questions structure
  const questoes = bhsTest.questoes as any[]
  const firstQuestion = questoes[0]

  console.log(`\n🔍 First Question Structure:`)
  console.log(`   Número: ${firstQuestion.numero}`)
  console.log(`   Tipo: ${firstQuestion.tipo}`)
  console.log(`   Texto: ${firstQuestion.texto}`)
  console.log(`   Has opcoes: ${!!firstQuestion.opcoes}`)
  console.log(`   Has escala_opcoes: ${!!firstQuestion.escala_opcoes}`)

  // Check escalas_resposta
  console.log(`\n📊 Escalas Resposta:`)
  if (!bhsTest.escalas_resposta) {
    console.log('   ❌ CRITICAL: No escalas_resposta defined!')
    return
  }

  const escalasResposta = bhsTest.escalas_resposta
  console.log(`   Available scales: ${Object.keys(escalasResposta).join(', ')}`)

  // Check for binario scale
  if (escalasResposta.binario) {
    console.log(`\n   ✓ Binario scale found:`)
    escalasResposta.binario.forEach((opt: any) => {
      console.log(`     - texto: "${opt.texto}" → valor: "${opt.valor}"`)
    })
  } else {
    console.log(`   ❌ CRITICAL: No binario scale found!`)
    return
  }

  // Check calculation rules
  console.log(`\n🧮 Calculation Rules:`)
  const regrasCalculo = bhsTest.regras_calculo
  console.log(`   Type: ${regrasCalculo?.tipo}`)

  if (regrasCalculo?.tipo === 'gabarito_binario') {
    const gabarito = regrasCalculo.gabarito
    const uniqueValues = [...new Set(Object.values(gabarito))]
    console.log(`   Gabarito entries: ${Object.keys(gabarito).length}`)
    console.log(`   Expected values: ${uniqueValues.map(v => JSON.stringify(v)).join(', ')}`)
  }

  // Simulate QuestionRenderer behavior with fix
  console.log(`\n🎯 SIMULATED RENDERING WITH FIX:`)
  console.log(`\n   Question tipo: "${firstQuestion.tipo}"`)

  // Find appropriate scale (same logic as QuestionRenderer)
  const possibleScaleNames = ['binario', 'likert', 'likert_0_4', 'likert_0_5', 'likert_1_4', 'likert_1_5']
  let escalaOpcoes: Array<{ texto: string; valor: any }> = []

  for (const scaleName of possibleScaleNames) {
    if (escalasResposta[scaleName] && Array.isArray(escalasResposta[scaleName])) {
      escalaOpcoes = escalasResposta[scaleName].map((opt: any) => ({
        texto: opt.texto,
        valor: opt.valor
      }))
      console.log(`   ✓ Found scale: "${scaleName}"`)
      break
    }
  }

  if (escalaOpcoes.length === 0) {
    console.log(`   ❌ No appropriate scale found - would fall back to defaults`)
    return
  }

  console.log(`   \n   QuestionRenderer will show these options:`)
  escalaOpcoes.forEach((opt) => {
    console.log(`     Button: "${opt.texto}" → will save: "${opt.valor}"`)
  })

  // Verify with calculation
  console.log(`\n   When user clicks "Certo", will save: "${escalaOpcoes[0].valor}"`)
  console.log(`   When user clicks "Errado", will save: "${escalaOpcoes[1].valor}"`)

  if (regrasCalculo?.tipo === 'gabarito_binario') {
    const gabarito = regrasCalculo.gabarito
    const firstCorrectAnswer = gabarito['0'] || gabarito['1']
    console.log(`\n   Gabarito expects for Q1: "${firstCorrectAnswer}"`)

    // Check if saved values will match
    const savedValues = escalaOpcoes.map(o => String(o.valor))
    const gabaritoValues = [...new Set(Object.values(gabarito))]

    const willMatch = gabaritoValues.every((gv: any) => savedValues.includes(String(gv)))

    if (willMatch) {
      console.log(`   ✅ SUCCESS: Saved values WILL MATCH gabarito values!`)
      console.log(`      Saved values: ${savedValues.join(', ')}`)
      console.log(`      Gabarito expects: ${gabaritoValues.map(v => JSON.stringify(v)).join(', ')}`)
    } else {
      console.log(`   ❌ FAIL: Saved values WILL NOT MATCH gabarito values!`)
      console.log(`      Saved values: ${savedValues.join(', ')}`)
      console.log(`      Gabarito expects: ${gabaritoValues.map(v => JSON.stringify(v)).join(', ')}`)
    }
  }

  // Test with actual calculator function
  console.log(`\n🔧 TESTING WITH ACTUAL CALCULATOR:`)
  try {
    const { calculateGabaritoScore } = await import('../lib/calculation/calculator')

    // Simulate user answering all questions correctly
    const simulatedRespostas: Record<string, any> = {}
    if (regrasCalculo?.tipo === 'gabarito_binario') {
      const gabarito = regrasCalculo.gabarito
      Object.entries(gabarito).forEach(([key, correctAnswer]) => {
        const questionNum = parseInt(key) + 1
        simulatedRespostas[`q${questionNum}`] = correctAnswer
      })
    }

    console.log(`   Simulated responses (all correct):`)
    console.log(`   Total responses: ${Object.keys(simulatedRespostas).length}`)
    console.log(`   Sample: ${Object.entries(simulatedRespostas).slice(0, 3).map(([k, v]) => `${k}:${v}`).join(', ')}...`)

    const score = calculateGabaritoScore(simulatedRespostas, regrasCalculo.gabarito)
    const expectedScore = Object.keys(regrasCalculo.gabarito).length

    console.log(`   \n   Calculator result: ${score}/${expectedScore}`)

    if (score === expectedScore) {
      console.log(`   ✅ PERFECT: All answers matched!`)
    } else {
      console.log(`   ⚠️  Score: ${score}/${expectedScore} (${Math.round(score/expectedScore*100)}% correct)`)
    }
  } catch (error: any) {
    console.log(`   ❌ Error testing calculator: ${error.message}`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ BHS FIX VERIFICATION COMPLETE')
  console.log('='.repeat(80))
}

verifyBHSFix().catch(console.error)
