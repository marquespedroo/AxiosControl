import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Load translated data
const itemsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../analysis/mcmi_items_translated.json'), 'utf-8')
)
const scalesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../analysis/mcmi_scales_translated.json'), 'utf-8')
)

// Load conversion tables
const pdToBrTable = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../analysis/mcmi_pd_to_br_conversion.json'), 'utf-8')
)
const brToPercentileTable = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../analysis/mcmi_br_to_percentile_conversion.json'), 'utf-8')
)
const grossmanPercentilesTable = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../analysis/mcmi_grossman_percentiles.json'), 'utf-8')
)
const interpretationsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../analysis/mcmi_interpretations_extracted.json'), 'utf-8')
)

async function seedMCMIIV() {
  console.log('🌱 Starting MCMI-IV test seed...\n')

  try {
    // 1. Check if test already exists
    const { data: existingTest } = await supabase
      .from('testes_templates')
      .select('id')
      .eq('sigla', 'MCMI-IV')
      .single()

    let existingId = null
    if (existingTest) {
      console.log('⚠️  MCMI-IV test already exists. Updating in place...')
      existingId = existingTest.id
      // Don't delete - update instead to preserve foreign key references
    }

    // 2. Create the test template using ACTUAL database schema
    console.log('📝 Creating MCMI-IV test template...')

    // Build questions array - each question as an object with metadata
    const questoes = itemsData.items.map((item: any, index: number) => ({
      numero: index + 1,
      texto: item.pt,
      texto_original: item.es,
      tipo: 'multipla_escolha',
      opcoes: ['Verdadeiro', 'Falso']
    }))

    // Build test template using CORRECT column names from actual schema
    const testTemplate: any = {
      nome: 'MCMI-IV - Inventário Clínico Multiaxial de Millon',
      nome_completo: 'Inventário Clínico Multiaxial de Millon - IV',
      sigla: 'MCMI-IV',
      versao: '1.0',
      autor: 'Theodore Millon',
      tipo: 'multipla_escolha',
      faixa_etaria_min: 18,
      faixa_etaria_max: null,
      tempo_medio_aplicacao: 30,
      publico: true,
      ativo: true,

      // questoes: All 195 questions with structure
      questoes,

      // escalas_resposta: Response scale configuration
      escalas_resposta: {
        tipo: 'multipla_escolha',
        opcoes: ['Verdadeiro', 'Falso'],
        formato: 'binario'
      },

      // regras_calculo: Scoring rules and scale definitions
      regras_calculo: {
        metodo: 'weighted_formula',
        escalas: {
          validade: scalesData.validityScales,
          personalidade: scalesData.personalityPatterns,
          patologia_grave: scalesData.severePatterns,
          sindromes_clinicas: scalesData.clinicalSyndromes,
          facetas_grossman: scalesData.grossmanFacets,
          respostas_significativas: scalesData.significantResponses
        },
        total_escalas:
          scalesData.validityScales.length +
          scalesData.personalityPatterns.length +
          scalesData.severePatterns.length +
          scalesData.clinicalSyndromes.length +
          scalesData.grossmanFacets.length +
          scalesData.significantResponses.length,

        // Conversion tables for PD → BR → Percentile
        tabelas_conversao: {
          pd_to_br: pdToBrTable.scales,
          br_to_percentile: brToPercentileTable.scales,
          grossman_percentiles: grossmanPercentilesTable.facets
        },

        observacoes: 'Scoring requires weighted formulas from Excel analysis. See docs/MCMI-IV_IMPLEMENTATION_PLAN.md for complete formula documentation.'
      },

      // interpretacao: Interpretation ranges and texts
      interpretacao: {
        faixas: scalesData.interpretationRanges,
        descricao: 'Interpretação baseada em pontuações de Taxa Base (BR): <60 (Não Presente), 60-74 (Risco), 75-84 (Padrão Clínico), ≥85 (Proeminente)',
        textos: {
          validade: interpretationsData.validity_scales,
          personalidade: interpretationsData.personality_patterns,
          patologia_grave: interpretationsData.severe_pathology,
          sindromes_clinicas: interpretationsData.clinical_syndromes
        },
        nota: 'Textos de interpretação em espanhol - necessitam tradução para português'
      }
    }

    console.log(`   - ${existingId ? 'Updating' : 'Inserting'} test with ${questoes.length} questions...`)
    console.log(`   - Total scales: ${testTemplate.regras_calculo.total_escalas}`)
    console.log(`   - Conversion tables: PD→BR (${Object.keys(pdToBrTable.scales).length} scales), BR→Percentile (${Object.keys(brToPercentileTable.scales).length} scales), Grossman (${Object.keys(grossmanPercentilesTable.facets).length} facets)`)

    let test, testError
    if (existingId) {
      // Update existing template
      const result = await supabase
        .from('testes_templates')
        .update(testTemplate)
        .eq('id', existingId)
        .select()
      test = result.data
      testError = result.error
    } else {
      // Insert new template
      const result = await supabase
        .from('testes_templates')
        .insert([testTemplate])
        .select()
      test = result.data
      testError = result.error
    }

    if (testError) {
      console.error('❌ Error creating test:', testError)
      throw testError
    }

    console.log(`✅ Test template created successfully!`)
    console.log(`   - Test ID: ${(test as any)[0].id}`)
    console.log(`   - Test Code: ${(test as any)[0].sigla}`)

    // 3. Summary
    console.log('\n' + '='.repeat(80))
    console.log('📊 MCMI-IV SEED SUMMARY')
    console.log('='.repeat(80))
    console.log(`✅ Test ID: ${(test as any)[0].id}`)
    console.log(`✅ Test Code: ${(test as any)[0].sigla}`)
    console.log(`✅ Test Name: ${(test as any)[0].nome}`)
    console.log(`✅ Questions: ${questoes.length}`)
    console.log(`\n📋 Scale Distribution:`)
    console.log(`   🔐 Validity Scales: ${scalesData.validityScales.length}`)
    console.log(`   🧩 Personality Patterns: ${scalesData.personalityPatterns.length}`)
    console.log(`   ⚠️  Severe Patterns: ${scalesData.severePatterns.length}`)
    console.log(`   🏥 Clinical Syndromes: ${scalesData.clinicalSyndromes.length}`)
    console.log(`   🔬 Grossman Facets: ${scalesData.grossmanFacets.length}`)
    console.log(`   ⭐ Significant Responses: ${scalesData.significantResponses.length}`)
    console.log(`   📊 TOTAL SCALES: ${testTemplate.regras_calculo.total_escalas}`)
    console.log('='.repeat(80))
    console.log('\n🎉 MCMI-IV test successfully seeded to database!')
    console.log('\n✅ Included in seed:')
    console.log('   ✅ All 195 questions (Portuguese)')
    console.log('   ✅ All 67 scale definitions')
    console.log('   ✅ PD→BR conversion tables (25 scales)')
    console.log('   ✅ BR→Percentile conversion tables (25 scales)')
    console.log('   ✅ Grossman facets percentile tables (45 facets)')
    console.log('   ✅ Interpretation texts (Spanish - needs PT translation)')
    console.log('\n📝 Next Steps:')
    console.log('   1. Translate interpretation texts to Portuguese')
    console.log('   2. Implement scoring service (677 formulas)')
    console.log('   3. Create 8 visualization components')
    console.log('   4. Build MCMI-IV specific results page')
    console.log('   5. Implement PDF export with graphs')

  } catch (error) {
    console.error('\n❌ Fatal error during seed:', error)
    process.exit(1)
  }
}

// Run the seed
seedMCMIIV()
  .then(() => {
    console.log('\n✅ Seed completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  })
