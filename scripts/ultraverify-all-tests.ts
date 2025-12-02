import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface VerificationIssue {
  severity: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO'
  message: string
  details?: any
}

async function ultraVerifyTest(test: any): Promise<VerificationIssue[]> {
  const issues: VerificationIssue[] = []

  console.log('\n' + '='.repeat(80))
  console.log(`🔍 ULTRA VERIFICATION: ${test.sigla} - ${test.nome}`)
  console.log('='.repeat(80))

  const questoes = test.questoes as any[]
  const escalasResposta = test.escalas_resposta
  const regrasCalculo = test.regras_calculo

  // 1. Analyze Questions
  console.log('\n📋 QUESTIONS ANALYSIS:')
  console.log(`   Total Questions: ${questoes.length}`)

  const questionTypes = new Set(questoes.map(q => q.tipo))
  console.log(`   Question Types: ${Array.from(questionTypes).join(', ')}`)

  // Check if questions have opcoes defined
  const questoesComOpcoes = questoes.filter(q => q.opcoes && Array.isArray(q.opcoes))
  console.log(`   Questions with opcoes: ${questoesComOpcoes.length}/${questoes.length}`)

  if (questoesComOpcoes.length > 0) {
    const firstWithOpcoes = questoesComOpcoes[0]
    console.log(`   Sample opcoes (Q${firstWithOpcoes.numero}):`, firstWithOpcoes.opcoes)
  }

  // Check for escala_opcoes
  const questoesComEscalaOpcoes = questoes.filter(q => q.escala_opcoes)
  if (questoesComEscalaOpcoes.length > 0) {
    console.log(`   Questions with escala_opcoes: ${questoesComEscalaOpcoes.length}`)
    console.log(`   Sample:`, questoesComEscalaOpcoes[0].escala_opcoes)
  }

  // 2. Analyze escalas_resposta
  console.log('\n📊 RESPONSE SCALES:')
  if (!escalasResposta) {
    issues.push({
      severity: 'CRITICAL',
      message: 'No escalas_resposta defined!'
    })
    console.log('   ❌ CRITICAL: No escalas_resposta defined!')
  } else {
    console.log(`   Defined scales: ${Object.keys(escalasResposta).join(', ')}`)

    for (const [scaleName, scaleData] of Object.entries(escalasResposta)) {
      console.log(`\n   Scale: ${scaleName}`)
      const scale = scaleData as any

      if (Array.isArray(scale)) {
        console.log(`     Type: Array of options`)
        console.log(`     Count: ${scale.length} options`)
        console.log(`     Format: ${JSON.stringify(scale[0])}`)

        // Check if options have both texto and valor
        const hasTexto = scale.every((opt: any) => opt.texto !== undefined)
        const hasValor = scale.every((opt: any) => opt.valor !== undefined)

        console.log(`     Has texto: ${hasTexto}`)
        console.log(`     Has valor: ${hasValor}`)

        if (!hasValor) {
          issues.push({
            severity: 'ERROR',
            message: `Scale ${scaleName} missing valor field`,
            details: scale
          })
        }

        // Show all options
        console.log(`     Options:`)
        scale.forEach((opt: any) => {
          console.log(`       - texto: "${opt.texto}" → valor: ${JSON.stringify(opt.valor)}`)
        })
      }
    }
  }

  // 3. Analyze calculation rules
  console.log('\n🧮 CALCULATION RULES:')
  console.log(`   Type: ${regrasCalculo?.tipo || 'UNDEFINED'}`)

  if (regrasCalculo?.tipo === 'gabarito_binario') {
    const gabarito = regrasCalculo.gabarito
    console.log(`   Gabarito entries: ${Object.keys(gabarito).length}`)
    console.log(`   Expected answer format:`)

    const uniqueValues = [...new Set(Object.values(gabarito))]
    console.log(`     Possible values: ${uniqueValues.map(v => JSON.stringify(v)).join(', ')}`)
    console.log(`     Sample: ${Object.entries(gabarito).slice(0, 5).map(([k, v]) => `${k}:${v}`).join(', ')}`)
  }

  // 4. CRITICAL CHECK: Do question types match escalas_resposta?
  console.log('\n🔍 COMPATIBILITY CHECK:')

  for (const questionType of Array.from(questionTypes)) {
    console.log(`\n   Question Type: "${questionType}"`)

    // What scale should be used for this type?
    let expectedScale = null
    let matchFound = false

    if (questionType === 'likert' && escalasResposta) {
      // Check if there's a likert, likert_0_4, likert_0_5, or binario scale
      if (escalasResposta.likert) {
        expectedScale = 'likert'
        matchFound = true
      } else if (escalasResposta.likert_0_4) {
        expectedScale = 'likert_0_4'
        matchFound = true
      } else if (escalasResposta.likert_0_5) {
        expectedScale = 'likert_0_5'
        matchFound = true
      } else if (escalasResposta.binario) {
        expectedScale = 'binario'
        matchFound = true
        console.log(`     ⚠️  Question type is 'likert' but scale is 'binario'`)
      }
    } else if (questionType === 'multipla_escolha' && escalasResposta?.multipla_escolha) {
      expectedScale = 'multipla_escolha'
      matchFound = true
    }

    if (matchFound) {
      console.log(`     ✓ Scale found: ${expectedScale}`)
    } else {
      console.log(`     ❌ NO MATCHING SCALE FOUND!`)
      issues.push({
        severity: 'CRITICAL',
        message: `Question type "${questionType}" has no matching scale in escalas_resposta`,
        details: { questionType, availableScales: Object.keys(escalasResposta || {}) }
      })
    }
  }

  // 5. ULTRA CRITICAL: Check if QuestionRenderer will work correctly
  console.log('\n🎯 RENDERING PREDICTION:')

  const firstQuestion = questoes[0]
  console.log(`   First question tipo: "${firstQuestion.tipo}"`)
  console.log(`   Has opcoes: ${!!firstQuestion.opcoes}`)
  console.log(`   Has escala_opcoes: ${!!firstQuestion.escala_opcoes}`)

  // Simulate QuestionRenderer logic
  if (firstQuestion.tipo === 'multipla_escolha' && firstQuestion.opcoes?.length === 4) {
    console.log(`   → QuestionRenderer will use: BDI-II format (grouped 4 options)`)
    console.log(`   → Will save: option text (e.g., "Não me sinto triste.")`)
  } else if (firstQuestion.tipo === 'likert' || !firstQuestion.tipo) {
    console.log(`   → QuestionRenderer will use: Likert format`)
    if (firstQuestion.escala_opcoes) {
      console.log(`   → Will show: custom escala_opcoes`)
      console.log(`   → Options: ${firstQuestion.escala_opcoes.join(', ')}`)
    } else {
      console.log(`   → Will show: DEFAULT HARDCODED Likert options`)
      console.log(`   → Options: "Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"`)
    }
    console.log(`   → Will save: option text (e.g., "Concordo totalmente")`)
  } else if (firstQuestion.tipo === 'multipla_escolha' && firstQuestion.opcoes) {
    console.log(`   → QuestionRenderer will use: Multiple choice format`)
    console.log(`   → Will save: option text`)
  } else {
    console.log(`   → QuestionRenderer will use: FALLBACK (unknown type)`)
  }

  // 6. VERIFY: What does calculation expect vs what will be saved?
  console.log('\n⚡ CRITICAL MISMATCH CHECK:')

  if (regrasCalculo?.tipo === 'gabarito_binario') {
    const gabarito = regrasCalculo.gabarito
    const expectedValues = [...new Set(Object.values(gabarito))]

    console.log(`   Calculation expects: ${expectedValues.map(v => JSON.stringify(v)).join(', ')}`)

    if (escalasResposta?.binario) {
      const scaleTextos = escalasResposta.binario.map((o: any) => o.texto)
      const scaleValores = escalasResposta.binario.map((o: any) => o.valor)

      console.log(`   Scale textos: ${scaleTextos.map((t: any) => JSON.stringify(t)).join(', ')}`)
      console.log(`   Scale valores: ${scaleValores.map((v: any) => JSON.stringify(v)).join(', ')}`)

      // Check if QuestionRenderer will save correct format
      if (firstQuestion.tipo === 'likert' && !firstQuestion.escala_opcoes) {
        console.log('\n   🚨 CRITICAL MISMATCH DETECTED!')
        console.log(`   Question type: "likert"`)
        console.log(`   QuestionRenderer will show: DEFAULT Likert options (Concordo/Discordo)`)
        console.log(`   QuestionRenderer will save: "Concordo totalmente", "Discordo", etc.`)
        console.log(`   But calculation expects: ${expectedValues.join(', ')}`)
        console.log(`   Result: WILL ALWAYS SCORE 0 - NO MATCHES POSSIBLE!`)

        issues.push({
          severity: 'CRITICAL',
          message: 'RENDERING/CALCULATION MISMATCH: Questions will save wrong format',
          details: {
            willSave: 'Likert text (Concordo/Discordo)',
            calculationExpects: expectedValues,
            impact: 'Score will always be 0'
          }
        })
      } else if (firstQuestion.opcoes) {
        console.log(`   Question has opcoes defined`)
        console.log(`   Will save: option text from opcoes array`)
        console.log(`   Need to verify if opcoes contain correct values...`)
      }
    }
  }

  return issues
}

async function runUltraVerification() {
  console.log('🔬 ULTRA VERIFICATION OF ALL TESTS')
  console.log('Checking: Questions → Scales → Calculation → Rendering')
  console.log('='.repeat(80))

  const { data: tests, error } = await supabase
    .from('testes_templates')
    .select('id, nome, sigla, questoes, escalas_resposta, regras_calculo')
    .eq('ativo', true)
    .order('sigla')

  if (error || !tests) {
    console.error('❌ Failed to load tests:', error)
    return
  }

  const allIssues: Record<string, VerificationIssue[]> = {}

  for (const test of tests) {
    const issues = await ultraVerifyTest(test)
    if (issues.length > 0) {
      allIssues[test.sigla] = issues
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(80))
  console.log('🚨 ULTRA VERIFICATION SUMMARY')
  console.log('='.repeat(80))

  const criticalCount = Object.values(allIssues).flat().filter(i => i.severity === 'CRITICAL').length
  const errorCount = Object.values(allIssues).flat().filter(i => i.severity === 'ERROR').length
  const warningCount = Object.values(allIssues).flat().filter(i => i.severity === 'WARNING').length

  console.log(`\nTotal Tests: ${tests.length}`)
  console.log(`Tests with Issues: ${Object.keys(allIssues).length}`)
  console.log(`\n🚨 CRITICAL Issues: ${criticalCount}`)
  console.log(`❌ ERROR Issues: ${errorCount}`)
  console.log(`⚠️  WARNING Issues: ${warningCount}`)

  if (criticalCount > 0) {
    console.log('\n\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE FIX:')
    for (const [sigla, issues] of Object.entries(allIssues)) {
      const criticalIssues = issues.filter(i => i.severity === 'CRITICAL')
      if (criticalIssues.length > 0) {
        console.log(`\n${sigla}:`)
        criticalIssues.forEach(issue => {
          console.log(`  🚨 ${issue.message}`)
          if (issue.details) {
            console.log(`     Details: ${JSON.stringify(issue.details, null, 2)}`)
          }
        })
      }
    }
  }

  console.log('\n' + '='.repeat(80))
}

runUltraVerification().catch(console.error)
