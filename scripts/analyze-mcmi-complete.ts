import * as fs from 'fs'
import * as path from 'path'

const analysisDir = path.join(__dirname, '../analysis')

console.log('🔍 MCMI-IV COMPLETE ANALYSIS\n')
console.log('='.repeat(80))

// Read the RESULTADOS sheet to understand the scales
const resultadosFile = path.join(analysisDir, 'mcmi_sheet_2_RESULTADOS_.json')
const resultadosData = JSON.parse(fs.readFileSync(resultadosFile, 'utf-8'))

console.log('\n📊 SCALE STRUCTURE ANALYSIS\n')

// Extract scales from RESULTADOS
const validityScales: any[] = []
const personalityPatterns: any[] = []
const severePatterns: any[] = []
const clinicalSyndromes: any[] = []

const rows = resultadosData.data

// Validity Scales (rows around 6-11 based on earlier output)
console.log('🔐 VALIDITY SCALES:')
for (let i = 6; i <= 11; i++) {
  const row = rows[i]
  if (row && row[0]) {
    console.log(`   ${row[0]}: ${row[1]}`)
    validityScales.push({ code: row[0], name: row[1] })
  }
}

// Personality Patterns (rows 14-25)
console.log('\n🧩 PERSONALITY PATTERN SCALES (14 scales):')
for (let i = 14; i <= 25; i++) {
  const row = rows[i]
  if (row && row[0]) {
    console.log(`   ${row[0]}: ${row[1]}`)
    personalityPatterns.push({ code: row[0], name: row[1] })
  }
}

// Severe Pathology Scales (rows 27-29)
console.log('\n⚠️  SEVERE PATHOLOGY SCALES:')
for (let i = 27; i <= 29; i++) {
  const row = rows[i]
  if (row && row[0]) {
    console.log(`   ${row[0]}: ${row[1]}`)
    severePatterns.push({ code: row[0], name: row[1] })
  }
}

// Clinical Syndromes (rows 33-43)
console.log('\n🏥 CLINICAL SYNDROME SCALES:')
for (let i = 33; i <= 43; i++) {
  const row = rows[i]
  if (row && row[0] && row[1]) {
    console.log(`   ${row[0]}: ${row[1]}`)
    clinicalSyndromes.push({ code: row[0], name: row[1] })
  }
}

// Read the facetas sheet for Grossman facets
const facetasFile = path.join(analysisDir, 'mcmi_sheet_3_FACETAS_GROSSMAN_Y_RESPUESTAS_S.json')
const facetasData = JSON.parse(fs.readFileSync(facetasFile, 'utf-8'))

console.log('\n🔬 GROSSMAN FACETS (Sub-scales):')
const facetas: any[] = []
for (let i = 5; i < 60; i++) {
  const row = facetasData.data[i]
  if (row && row[0] && row[1] && typeof row[0] === 'string' && row[0].includes('.')) {
    console.log(`   ${row[0]}: ${row[1]}`)
    facetas.push({ code: row[0], name: row[1] })
  }
}

// Read significant responses
console.log('\n⭐ SIGNIFICANT RESPONSE SCALES (13 scales):')
const significantResponses: any[] = []
const rptaFile = path.join(analysisDir, 'mcmi_sheet_5_RPTA_SIGNIFICATIVAS.json')
const rptaData = JSON.parse(fs.readFileSync(rptaFile, 'utf-8'))

for (let i = 1; i < 14; i++) {
  const row = rptaData.data[i]
  if (row && row[0] && row[1]) {
    console.log(`   ${row[0]}: ${row[1]}`)
    significantResponses.push({ code: row[0], name: row[1] })
  }
}

// Analyze formulas from APLICACION
const aplicacionFile = path.join(analysisDir, 'mcmi_sheet_1_APLICACION.json')
const aplicacionData = JSON.parse(fs.readFileSync(aplicacionFile, 'utf-8'))

console.log('\n📐 SCORING FORMULAS ANALYSIS:')
console.log(`   Total formulas found: ${aplicacionData.formulas.length}`)
console.log(`\n   Sample scoring formulas:`)

// Show first 5 formulas to understand the pattern
aplicacionData.formulas.slice(0, 5).forEach((f: any) => {
  console.log(`   ${f.cell}: ${f.formula}`)
})

// Summary
console.log('\n' + '='.repeat(80))
console.log('📋 SUMMARY')
console.log('='.repeat(80))
console.log(`\n✅ MCMI-IV Test Structure:`)
console.log(`   - Total Items: 195`)
console.log(`   - Response Format: True/False (Verdadero/Falso)`)
console.log(`\n✅ Scale Categories:`)
console.log(`   - Validity Scales: ${validityScales.length}`)
console.log(`   - Personality Patterns: ${personalityPatterns.length}`)
console.log(`   - Severe Pathology: ${severePatterns.length}`)
console.log(`   - Clinical Syndromes: ${clinicalSyndromes.length}`)
console.log(`   - Grossman Facets: ${facetas.length}`)
console.log(`   - Significant Responses: ${significantResponses.length}`)
console.log(`   - TOTAL SCALES: ${validityScales.length + personalityPatterns.length + severePatterns.length + clinicalSyndromes.length + facetas.length + significantResponses.length}`)

console.log(`\n✅ Scoring System:`)
console.log(`   - Raw Scores (PD - Puntuación Directa)`)
console.log(`   - Base Rate Scores (BR/PE - Prevalence Estimates)`)
console.log(`   - Percentiles`)
console.log(`   - Interpretation Ranges: <60, 60-74, 75-84, ≥85`)

console.log(`\n✅ Key Features Needed:`)
console.log(`   1. Weighted item scoring (2x weight for certain items)`)
console.log(`   2. Formula-based raw score calculation`)
console.log(`   3. Conversion tables: Raw Score → Base Rate → Percentile`)
console.log(`   4. Automatic interpretation based on BR thresholds`)
console.log(`   5. Profile graph generation (bar charts)`)
console.log(`   6. Grossman facet visualization`)
console.log(`   7. Significant response indicators`)

// Save complete structure to JSON
const structure = {
  testName: 'MCMI-IV',
  fullName: 'Inventario Clínico Multiaxial de Millon - IV',
  totalItems: 195,
  responseFormat: 'true_false',
  validityScales,
  personalityPatterns,
  severePatterns,
  clinicalSyndromes,
  grossmanFacets: facetas,
  significantResponses,
  scoringMethod: 'weighted_formula',
  interpretationRanges: {
    noPresent: '<60',
    risk: '60-74',
    pattern: '75-84',
    critical: '≥85'
  }
}

fs.writeFileSync(
  path.join(analysisDir, 'mcmi_structure.json'),
  JSON.stringify(structure, null, 2),
  'utf-8'
)

console.log(`\n✅ Structure saved to: ${path.join(analysisDir, 'mcmi_structure.json')}`)
