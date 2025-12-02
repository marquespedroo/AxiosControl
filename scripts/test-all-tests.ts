import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TestResult {
  testName: string
  sigla: string
  status: 'success' | 'error'
  testId?: string
  error?: string
  details?: any
}

async function createTestPatient() {
  // Get or create test patient
  const { data: clinics } = await supabase
    .from('clinicas')
    .select('id')
    .limit(1)

  if (!clinics || clinics.length === 0) {
    throw new Error('No clinic found')
  }

  const clinicId = clinics[0].id

  let { data: patient } = await supabase
    .from('pacientes')
    .select('id')
    .eq('nome_completo', 'Paciente Teste Automatizado')
    .eq('clinica_id', clinicId)
    .single()

  if (!patient) {
    const { data: newPatient, error } = await supabase
      .from('pacientes')
      .insert({
        nome_completo: 'Paciente Teste Automatizado',
        data_nascimento: '1990-01-01',
        escolaridade_anos: 12,
        sexo: 'M',
        clinica_id: clinicId,
        telefone: '11999999999',
        email: 'teste@automatizado.com'
      })
      .select()
      .single()

    if (error) throw error
    patient = newPatient
  }

  return (patient as any).id
}

async function generateAnswers(test: any): Promise<Record<string, any>> {
  const respostas: Record<string, any> = {}
  const questoes = test.questoes as any[]

  // Determine answer format based on test structure
  if (test.regras_calculo?.tipo === 'gabarito_binario') {
    // For answer key tests like BHS - use the gabarito keys
    const gabarito = test.regras_calculo.gabarito as Record<string, string>
    const possibleAnswers = Object.values(gabarito).filter((v, i, arr) => arr.indexOf(v) === i)

    questoes.forEach((q, index) => {
      // Use gabarito answer for 70% of questions, random for 30%
      const useCorrect = Math.random() > 0.3
      const key = `q${q.numero}`

      if (useCorrect && gabarito[index.toString()]) {
        respostas[key] = gabarito[index.toString()]
      } else {
        respostas[key] = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)]
      }
    })
  } else if (test.sigla === 'MCMI-IV') {
    // MCMI-IV uses string answers
    questoes.forEach(q => {
      respostas[`q${q.numero}`] = Math.random() > 0.5 ? 'Verdadeiro' : 'Falso'
    })
  } else if (test.escalas_resposta?.likert) {
    // Likert scale tests - use numeric values
    questoes.forEach(q => {
      respostas[`q${q.numero}`] = Math.floor(Math.random() * 5) + 1 // 1-5
    })
  } else if (test.escalas_resposta?.binario) {
    // Binary tests - check what values are expected
    const opcoes = test.escalas_resposta.binario
    const valores = opcoes.map((o: any) => o.valor)

    questoes.forEach(q => {
      respostas[`q${q.numero}`] = valores[Math.floor(Math.random() * valores.length)]
    })
  } else {
    // Default: assume 1-5 scale
    questoes.forEach(q => {
      respostas[`q${q.numero}`] = Math.floor(Math.random() * 5) + 1
    })
  }

  return respostas
}

async function testOne(test: any, patientId: string, psychologistId: string): Promise<TestResult> {
  const result: TestResult = {
    testName: test.nome,
    sigla: test.sigla,
    status: 'error'
  }

  try {
    console.log(`\n🧪 Testing: ${test.sigla} - ${test.nome}`)
    console.log(`   Questions: ${(test.questoes as any[]).length}`)
    console.log(`   Calculation type: ${test.regras_calculo?.tipo || 'unknown'}`)

    // 1. Generate answers
    const respostas = await generateAnswers(test)
    console.log(`   ✅ Generated ${Object.keys(respostas).length} answers`)

    // 2. Create test application
    const { data: testeAplicado, error: createError } = await supabase
      .from('testes_aplicados')
      .insert({
        teste_template_id: test.id,
        paciente_id: patientId,
        psicologo_id: psychologistId,
        tipo_aplicacao: 'presencial',
        status: 'em_andamento',
        respostas: respostas
      })
      .select()
      .single()

    if (createError) {
      result.error = `Failed to create test: ${createError.message}`
      result.details = createError
      return result
    }

    console.log(`   ✅ Created test instance: ${testeAplicado.id}`)
    result.testId = testeAplicado.id

    // 3. Finalize test (this is where calculation happens)


    // Use the actual API endpoint logic instead
    // For now, let's simulate by directly calling the calculator
    const { calculateRawScore } = await import('../lib/calculation/calculator')

    let pontuacaoBruta: any
    try {
      if (test.sigla === 'MCMI-IV') {
        // Skip calculation for MCMI-IV
        pontuacaoBruta = { total: 0, respostas }
        console.log(`   ⏭️  Skipped calculation (MCMI-IV uses frontend scoring)`)
      } else {
        const rawScore = calculateRawScore(
          respostas,
          test.regras_calculo,
          test.questoes,
          5
        )
        pontuacaoBruta = {
          total: rawScore.total,
          respostas: respostas,
          ...(rawScore.secoes ? { secoes: rawScore.secoes } : {})
        }
        console.log(`   ✅ Calculated score: ${rawScore.total}`)
      }
    } catch (calcError: any) {
      result.error = `Calculation failed: ${calcError.message}`
      result.details = calcError
      console.log(`   ❌ Calculation error: ${calcError.message}`)
      return result
    }

    // 4. Update test with results
    const { error: updateError } = await supabase
      .from('testes_aplicados')
      .update({
        pontuacao_bruta: pontuacaoBruta,
        status: 'completo',
        data_conclusao: new Date().toISOString()
      })
      .eq('id', testeAplicado.id)

    if (updateError) {
      result.error = `Failed to update test: ${updateError.message}`
      result.details = updateError
      return result
    }

    console.log(`   ✅ Test completed successfully`)
    result.status = 'success'

  } catch (error: any) {
    result.error = error.message
    result.details = error
    console.log(`   ❌ Error: ${error.message}`)
  }

  return result
}

async function runAllTests() {
  console.log('🚀 Starting Automated Test Suite\n')
  console.log('='.repeat(80))

  try {
    // 1. Get test patient
    console.log('\n👤 Setting up test patient...')
    const patientId = await createTestPatient()
    const psychologistId = '550e8400-e29b-41d4-a716-446655440002'
    console.log(`   ✅ Patient ID: ${patientId}`)
    console.log(`   ✅ Psychologist ID: ${psychologistId}`)

    // 2. Get all test templates
    console.log('\n📋 Loading test templates...')
    const { data: tests, error: testsError } = await supabase
      .from('testes_templates')
      .select('id, nome, sigla, questoes, escalas_resposta, regras_calculo')
      .eq('ativo', true)
      .order('sigla')

    if (testsError || !tests) {
      throw new Error(`Failed to load tests: ${testsError?.message}`)
    }

    console.log(`   ✅ Found ${tests.length} active tests`)

    // 3. Test each one
    console.log('\n' + '='.repeat(80))
    console.log('RUNNING TESTS')
    console.log('='.repeat(80))

    const results: TestResult[] = []
    for (const test of tests) {
      const result = await testOne(test, patientId, psychologistId)
      results.push(result)
    }

    // 4. Summary
    console.log('\n' + '='.repeat(80))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(80))

    const successful = results.filter(r => r.status === 'success')
    const failed = results.filter(r => r.status === 'error')

    console.log(`\n✅ Successful: ${successful.length}/${results.length}`)
    successful.forEach(r => {
      console.log(`   ✓ ${r.sigla} - ${r.testName}`)
    })

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}/${results.length}`)
      failed.forEach(r => {
        console.log(`   ✗ ${r.sigla} - ${r.testName}`)
        console.log(`     Error: ${r.error}`)
      })
    }

    console.log('\n' + '='.repeat(80))

    if (failed.length > 0) {
      process.exit(1)
    }

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

runAllTests()
