import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
}

function validateTest(test: any): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const questoes = test.questoes as any[]
  const regras = test.regras_calculo
  const escalas = test.escalas_resposta

  console.log('\n' + '='.repeat(80))
  console.log(`📋 ${test.sigla} - ${test.nome}`)
  console.log('='.repeat(80))
  console.log(`Total Questions: ${questoes.length}`)
  console.log(`Calculation Type: ${regras?.tipo || 'MISSING'}`)

  // Basic validation
  if (!regras || !regras.tipo) {
    issues.push({ severity: 'error', message: 'Missing calculation rules or type' })
    return issues
  }

  // Validate by calculation type
  switch (regras.tipo) {
    case 'gabarito_binario': {
      console.log('\n🔑 Answer Key Scoring (gabarito_binario)')

      if (!regras.gabarito) {
        issues.push({ severity: 'error', message: 'Missing gabarito (answer key)' })
      } else {
        const gabaritoKeys = Object.keys(regras.gabarito)
        console.log(`  Answer Key Entries: ${gabaritoKeys.length}`)
        console.log(`  Expected Questions: ${questoes.length}`)

        // Check if gabarito covers all questions
        if (gabaritoKeys.length !== questoes.length) {
          issues.push({
            severity: 'warning',
            message: `Gabarito has ${gabaritoKeys.length} entries but test has ${questoes.length} questions`
          })
        }

        // Show sample of gabarito
        const sampleKeys = gabaritoKeys.slice(0, 5)
        console.log(`  Sample answers: ${sampleKeys.map(k => `${k}:${regras.gabarito[k]}`).join(', ')}...`)

        // Check answer values
        const uniqueAnswers = [...new Set(Object.values(regras.gabarito))]
        console.log(`  Unique answer values: ${uniqueAnswers.join(', ')}`)

        // Verify escalas_resposta matches gabarito values
        if (escalas && escalas.binario) {
          const scaleValues = escalas.binario.map((o: any) => o.valor)
          console.log(`  Scale values: ${scaleValues.join(', ')}`)

          const invalidAnswers = uniqueAnswers.filter(a => !scaleValues.includes(a))
          if (invalidAnswers.length > 0) {
            issues.push({
              severity: 'error',
              message: `Gabarito contains values not in scale: ${invalidAnswers.join(', ')}`
            })
          }
        }
      }

      // Check score ranges
      if (regras.pontuacao_minima !== undefined && regras.pontuacao_maxima !== undefined) {
        console.log(`  Score Range: ${regras.pontuacao_minima} - ${regras.pontuacao_maxima}`)

        const expectedMax = questoes.length
        if (regras.pontuacao_maxima !== expectedMax) {
          issues.push({
            severity: 'warning',
            message: `Max score is ${regras.pontuacao_maxima} but expected ${expectedMax} (1 point per question)`
          })
        }
      }
      break
    }

    case 'soma_simples': {
      console.log('\n➕ Simple Sum Scoring')

      // Check for questoes_incluidas
      if (regras.questoes_incluidas) {
        console.log(`  Included Questions: ${regras.questoes_incluidas.length} of ${questoes.length}`)

        // Verify all included questions exist
        const invalidQuestions = regras.questoes_incluidas.filter((q: number) =>
          !questoes.some(quest => quest.numero === q)
        )
        if (invalidQuestions.length > 0) {
          issues.push({
            severity: 'error',
            message: `questoes_incluidas references non-existent questions: ${invalidQuestions.join(', ')}`
          })
        }
      } else {
        console.log(`  Included Questions: All ${questoes.length} questions`)
      }

      // Check for inverted questions
      if (regras.questoes_invertidas && regras.questoes_invertidas.length > 0) {
        console.log(`  Inverted Questions: ${regras.questoes_invertidas.length}`)
        console.log(`  Sample: ${regras.questoes_invertidas.slice(0, 5).join(', ')}${regras.questoes_invertidas.length > 5 ? '...' : ''}`)
      } else {
        console.log(`  Inverted Questions: None`)
      }

      // Check scale
      if (regras.escala_maxima) {
        console.log(`  Scale Maximum: ${regras.escala_maxima}`)
      } else if (escalas) {
        // Try to infer from escalas_resposta
        if (escalas.likert) {
          const maxValue = Math.max(...escalas.likert.map((o: any) => o.valor))
          console.log(`  Scale Maximum (inferred from likert): ${maxValue}`)
          issues.push({
            severity: 'info',
            message: `Consider adding escala_maxima: ${maxValue} to regras_calculo`
          })
        }
      }

      // Validate score ranges if present
      if (regras.pontuacao_minima !== undefined && regras.pontuacao_maxima !== undefined) {
        console.log(`  Score Range: ${regras.pontuacao_minima} - ${regras.pontuacao_maxima}`)

        const effectiveQuestions = regras.questoes_incluidas?.length || questoes.length
        const minScale = 1 // Usually starts at 1
        const maxScale = regras.escala_maxima || 5

        const expectedMin = effectiveQuestions * minScale
        const expectedMax = effectiveQuestions * maxScale

        console.log(`  Expected Range: ${expectedMin} - ${expectedMax} (${effectiveQuestions} questions × ${minScale}-${maxScale} scale)`)

        if (Math.abs(regras.pontuacao_maxima - expectedMax) > effectiveQuestions) {
          issues.push({
            severity: 'warning',
            message: `Max score ${regras.pontuacao_maxima} differs significantly from expected ${expectedMax}`
          })
        }
      }
      break
    }

    case 'pontuacao_especifica': {
      console.log('\n🎯 Specific Scoring (treated as simple sum)')

      console.log(`  All Questions: ${questoes.length}`)

      if (escalas && escalas.likert) {
        const maxValue = Math.max(...escalas.likert.map((o: any) => o.valor))
        const minValue = Math.min(...escalas.likert.map((o: any) => o.valor))
        console.log(`  Scale Range: ${minValue} - ${maxValue}`)
      }

      if (regras.pontuacao_minima !== undefined && regras.pontuacao_maxima !== undefined) {
        console.log(`  Score Range: ${regras.pontuacao_minima} - ${regras.pontuacao_maxima}`)
      } else {
        issues.push({
          severity: 'warning',
          message: 'Missing score range (pontuacao_minima/maxima)'
        })
      }

      // Check interpretation ranges
      if (regras.interpretacao_ranges) {
        console.log(`  Interpretation Levels: ${regras.interpretacao_ranges.length}`)
        regras.interpretacao_ranges.forEach((range: any) => {
          console.log(`    - ${range.nivel}: ${range.min}-${range.max} (${range.descricao})`)
        })
      }
      break
    }

    case 'soma_por_secao': {
      console.log('\n📊 Sum by Section (question ranges)')

      if (!regras.secoes) {
        issues.push({ severity: 'error', message: 'Missing sections definition' })
        break
      }

      const secoes = regras.secoes
      const sectionNames = Object.keys(secoes)
      console.log(`  Sections: ${sectionNames.length}`)

      let totalQuestionsInSections = 0
      let hasGaps = false
      let hasOverlaps = false

      // Analyze each section
      for (const [nome, range] of Object.entries(secoes) as [string, any][]) {
        const count = range.fim - range.inicio + 1
        totalQuestionsInSections += count

        console.log(`    ${nome}: questions ${range.inicio + 1}-${range.fim + 1} (${count} questions)`)

        // Check if range is valid
        if (range.inicio < 0) {
          issues.push({
            severity: 'error',
            message: `Section ${nome} has negative inicio: ${range.inicio}`
          })
        }

        if (range.fim >= questoes.length) {
          issues.push({
            severity: 'error',
            message: `Section ${nome} fim ${range.fim} exceeds question count ${questoes.length - 1} (0-based)`
          })
        }

        if (range.inicio > range.fim) {
          issues.push({
            severity: 'error',
            message: `Section ${nome} has inicio ${range.inicio} > fim ${range.fim}`
          })
        }
      }

      console.log(`  Total Questions in Sections: ${totalQuestionsInSections}`)
      console.log(`  Actual Questions: ${questoes.length}`)

      if (totalQuestionsInSections !== questoes.length) {
        issues.push({
          severity: 'error',
          message: `Section questions (${totalQuestionsInSections}) doesn't match total questions (${questoes.length})`
        })
      }

      // Check for gaps and overlaps
      const covered = new Set<number>()
      for (const [, range] of Object.entries(secoes || {}) as [string, any][]) {
        for (let i = range.inicio; i <= range.fim; i++) {
          if (covered.has(i)) {
            hasOverlaps = true
            issues.push({
              severity: 'error',
              message: `Question ${i + 1} is covered by multiple sections`
            })
          }
          covered.add(i)
        }
      }

      for (let i = 0; i < questoes.length; i++) {
        if (!covered.has(i)) {
          hasGaps = true
          issues.push({
            severity: 'error',
            message: `Question ${i + 1} is not covered by any section`
          })
        }
      }

      if (!hasGaps && !hasOverlaps) {
        console.log(`  ✅ All questions covered exactly once`)
      }

      // Check score ranges
      if (regras.pontuacao_minima !== undefined && regras.pontuacao_maxima !== undefined) {
        console.log(`  Score Range: ${regras.pontuacao_minima} - ${regras.pontuacao_maxima}`)
      }

      // Check interpretation ranges
      if (regras.interpretacao_ranges) {
        console.log(`  Interpretation Levels: ${regras.interpretacao_ranges.length}`)
      }
      break
    }

    default: {
      issues.push({
        severity: 'error',
        message: `Unknown calculation type: ${regras.tipo}`
      })
    }
  }

  // Display issues
  if (issues.length > 0) {
    console.log('\n⚠️  Validation Issues:')
    issues.forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'
      console.log(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`)
    })
  } else {
    console.log('\n✅ No validation issues found')
  }

  return issues
}

async function verifyAllCalculations() {
  console.log('🔍 COMPREHENSIVE CALCULATION VERIFICATION')
  console.log('Verifying all tests except MCMI-IV\n')

  const { data: tests, error } = await supabase
    .from('testes_templates')
    .select('id, nome, sigla, questoes, escalas_resposta, regras_calculo')
    .eq('ativo', true)
    .neq('sigla', 'MCMI-IV')
    .order('sigla')

  if (error || !tests) {
    console.error('❌ Error fetching tests:', error)
    return
  }

  const allIssues: Record<string, ValidationIssue[]> = {}

  for (const test of tests) {
    const issues = validateTest(test)
    if (issues.length > 0) {
      allIssues[test.sigla] = issues
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 VERIFICATION SUMMARY')
  console.log('='.repeat(80))

  const totalTests = tests.length
  const testsWithErrors = Object.values(allIssues).filter(issues =>
    issues.some(i => i.severity === 'error')
  ).length
  const testsWithWarnings = Object.values(allIssues).filter(issues =>
    issues.some(i => i.severity === 'warning') && !issues.some(i => i.severity === 'error')
  ).length
  const testsClean = totalTests - testsWithErrors - testsWithWarnings

  console.log(`\nTotal Tests Verified: ${totalTests}`)
  console.log(`✅ Clean: ${testsClean}`)
  console.log(`⚠️  With Warnings: ${testsWithWarnings}`)
  console.log(`❌ With Errors: ${testsWithErrors}`)

  if (Object.keys(allIssues).length > 0) {
    console.log('\n📋 Tests with Issues:')
    for (const [sigla, issues] of Object.entries(allIssues)) {
      const errorCount = issues.filter(i => i.severity === 'error').length
      const warningCount = issues.filter(i => i.severity === 'warning').length
      const infoCount = issues.filter(i => i.severity === 'info').length

      console.log(`  ${sigla}: ${errorCount} errors, ${warningCount} warnings, ${infoCount} info`)
    }
  }

  console.log('\n' + '='.repeat(80))
}

verifyAllCalculations().catch(console.error)
