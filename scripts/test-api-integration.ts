import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Base URL for API calls


interface TestResult {
  testName: string
  sigla: string
  testId?: string
  status: 'success' | 'error'
  error?: string
  details?: any
  stage?: 'creation' | 'finalization'
}

async function createTestPatient() {
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
    .eq('nome_completo', 'Paciente Teste API Integration')
    .eq('clinica_id', clinicId)
    .single()

  if (!patient) {
    const { data: newPatient, error } = await supabase
      .from('pacientes')
      .insert({
        nome_completo: 'Paciente Teste API Integration',
        data_nascimento: '1990-01-01',
        escolaridade_anos: 12,
        sexo: 'M',
        clinica_id: clinicId,
        telefone: '11999999999',
        email: 'teste.api@integration.com'
      })
      .select()
      .single()

    if (error) throw error
    patient = newPatient
  }

  return (patient as any).id
}

function generateAnswers(test: any): Record<string, any> {
  const respostas: Record<string, any> = {}
  const questoes = test.questoes as any[]

  if (test.regras_calculo?.tipo === 'gabarito_binario') {
    // For BHS - use gabarito pattern
    const gabarito = test.regras_calculo.gabarito as Record<string, string>
    const possibleAnswers = Object.values(gabarito).filter((v, i, arr) => arr.indexOf(v) === i)

    questoes.forEach((q, index) => {
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
  } else if (test.escalas_resposta?.multipla_escolha) {
    // Multiple choice with specific values
    const opcoes = test.escalas_resposta.multipla_escolha
    const valores = opcoes.map((o: any) => o.valor)

    questoes.forEach(q => {
      respostas[`q${q.numero}`] = valores[Math.floor(Math.random() * valores.length)]
    })
  } else if (test.escalas_resposta?.likert) {
    // Likert scale
    const opcoes = test.escalas_resposta.likert
    const valores = opcoes.map((o: any) => o.valor)

    questoes.forEach(q => {
      respostas[`q${q.numero}`] = valores[Math.floor(Math.random() * valores.length)]
    })
  } else if (test.escalas_resposta?.likert_0_4) {
    // EPF-TDAH scale 0-4
    const opcoes = test.escalas_resposta.likert_0_4
    const valores = opcoes.map((o: any) => o.valor)

    questoes.forEach(q => {
      respostas[`q${q.numero}`] = valores[Math.floor(Math.random() * valores.length)]
    })
  } else if (test.escalas_resposta?.likert_0_5) {
    // ETDAH-AD scale 0-5
    const opcoes = test.escalas_resposta.likert_0_5
    const valores = opcoes.map((o: any) => o.valor)

    questoes.forEach(q => {
      respostas[`q${q.numero}`] = valores[Math.floor(Math.random() * valores.length)]
    })
  } else if (test.escalas_resposta?.binario) {
    // Binary tests
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

async function testOneAPI(test: any, patientId: string, psychologistId: string): Promise<TestResult> {
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
    const respostas = generateAnswers(test)
    console.log(`   ✅ Generated ${Object.keys(respostas).length} answers`)

    // Log first 3 answers for debugging
    const sampleKeys = Object.keys(respostas).slice(0, 3)
    console.log(`   Sample answers: ${sampleKeys.map(k => `${k}:${respostas[k]}`).join(', ')}...`)

    // 2. Create test application (via direct DB insert for speed)
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
      result.stage = 'creation'
      return result
    }

    console.log(`   ✅ Created test instance: ${testeAplicado.id}`)
    result.testId = testeAplicado.id

    // 3. Call the actual finalize API endpoint (like the frontend does)
    try {
      // Use supabase admin to finalize (simulating the API route)
      const { data: testeData, error: fetchError } = await supabase
        .from('testes_aplicados')
        .select(`
          *,
          teste_template:teste_template_id (
            id,
            nome,
            sigla,
            tipo,
            questoes,
            escalas_resposta,
            regras_calculo
          ),
          paciente:paciente_id (
            id,
            nome_completo,
            data_nascimento,
            sexo,
            escolaridade_anos
          )
        `)
        .eq('id', testeAplicado.id)
        .single()

      if (fetchError || !testeData) {
        result.error = `Failed to fetch test for finalization: ${fetchError?.message}`
        result.details = fetchError
        result.stage = 'finalization'
        return result
      }

      // Import calculator to test actual calculation
      const { calculateRawScore } = await import('../lib/calculation/calculator')

      const testTemplate = testeData.teste_template as any
      const questoes = testTemplate.questoes as any[]
      const regrasCalculo = testTemplate.regras_calculo
      const escalasResposta = testTemplate.escalas_resposta

      // Get max scale value
      let maxScaleValue = 5 // default
      if (regrasCalculo?.escala_maxima) {
        maxScaleValue = regrasCalculo.escala_maxima
      } else if (escalasResposta) {
        if (escalasResposta.multipla_escolha) {
          maxScaleValue = Math.max(...escalasResposta.multipla_escolha.map((o: any) => o.valor))
        } else if (escalasResposta.likert) {
          maxScaleValue = Math.max(...escalasResposta.likert.map((o: any) => o.valor))
        } else if (escalasResposta.likert_0_4) {
          maxScaleValue = 4
        } else if (escalasResposta.likert_0_5) {
          maxScaleValue = 5
        } else if (escalasResposta.binario) {
          maxScaleValue = Math.max(...escalasResposta.binario.map((o: any) => o.valor))
        }
      }

      console.log(`   Max scale value: ${maxScaleValue}`)

      let pontuacaoBruta: any

      // MCMI-IV has specialized scoring - skip generic calculation
      if (testTemplate.sigla === 'MCMI-IV') {
        pontuacaoBruta = {
          total: 0,
          respostas: respostas
        }
        console.log(`   ⏭️  Skipped calculation (MCMI-IV uses frontend scoring)`)
      } else {
        try {
          const rawScore = calculateRawScore(
            respostas,
            regrasCalculo,
            questoes,
            maxScaleValue
          )
          pontuacaoBruta = {
            total: rawScore.total,
            respostas: respostas,
            ...(rawScore.secoes ? { secoes: rawScore.secoes } : {})
          }
          console.log(`   ✅ Calculated score: ${rawScore.total}`)
          if (rawScore.secoes) {
            console.log(`   Section scores: ${JSON.stringify(rawScore.secoes)}`)
          }
        } catch (calcError: any) {
          result.error = `Calculation failed: ${calcError.message}`
          result.details = {
            error: calcError,
            stack: calcError.stack,
            regrasCalculo,
            maxScaleValue,
            sampleAnswers: Object.fromEntries(Object.entries(respostas).slice(0, 5))
          }
          result.stage = 'finalization'
          console.log(`   ❌ Calculation error: ${calcError.message}`)
          console.log(`   Stack: ${calcError.stack}`)
          return result
        }
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
        result.stage = 'finalization'
        return result
      }

      console.log(`   ✅ Test completed successfully`)
      result.status = 'success'

    } catch (apiError: any) {
      result.error = `API call failed: ${apiError.message}`
      result.details = {
        error: apiError,
        stack: apiError.stack
      }
      result.stage = 'finalization'
      console.log(`   ❌ API error: ${apiError.message}`)
      console.log(`   Stack: ${apiError.stack}`)
    }

  } catch (error: any) {
    result.error = error.message
    result.details = {
      error: error,
      stack: error.stack
    }
    console.log(`   ❌ Error: ${error.message}`)
    console.log(`   Stack: ${error.stack}`)
  }

  return result
}

async function runAPIIntegrationTests() {
  console.log('🚀 Starting API Integration Test Suite\n')
  console.log('This test calls the ACTUAL finalization logic (not just calculator functions)\n')
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
    console.log('RUNNING API INTEGRATION TESTS')
    console.log('='.repeat(80))

    const results: TestResult[] = []
    for (const test of tests) {
      const result = await testOneAPI(test, patientId, psychologistId)
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
        console.log(`\n   ✗ ${r.sigla} - ${r.testName}`)
        console.log(`     Stage: ${r.stage}`)
        console.log(`     Error: ${r.error}`)
        if (r.details) {
          console.log(`     Details:`)
          console.log(JSON.stringify(r.details, null, 6))
        }
      })
    }

    console.log('\n' + '='.repeat(80))

    if (failed.length > 0) {
      process.exit(1)
    }

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

runAPIIntegrationTests()
