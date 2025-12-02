import * as fs from 'fs'
import * as path from 'path'

const analysisDir = path.join(__dirname, '../analysis')
const outputDir = path.join(__dirname, '../analysis')

console.log('📊 Extracting Interpretation Text from CORRECCION Sheet...\n')

// Load CORRECCION sheet
const correccionData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_4_CORRECCION.json'), 'utf-8')
)

const data = correccionData.data

console.log(`Total rows: ${data.length}\n`)

// Build interpretation structure
const interpretations: any = {
  metadata: {
    source: 'CORRECCION sheet - column with interpretation text',
    purpose: 'BR score interpretation text for each scale',
    br_interpretation_ranges: {
      validity_specific: 'Each validity scale has specific thresholds',
      general: '<60 (Not Present), 60-74 (At Risk), 75-84 (Clinical Pattern), ≥85 (Prominent)'
    }
  },
  validity_scales: [],
  personality_patterns: [],
  severe_pathology: [],
  clinical_syndromes: []
}

// Parse data rows
// Expected format:
// Column 0: Scale Code (V, W, X, 1, 2A, etc.)
// Column 1: Scale Name (Spanish)
// Column 2: PD or BR value
// Column 13: Interpretation text

let currentCategory = ''

for (let i = 0; i < data.length; i++) {
  const row = data[i]
  if (!row || row.length === 0) continue

  const scaleCode = row[0]
  const scaleName = row[1]
  const pdOrBR = row[2]
  const interpretationText = row[13]

  // Detect category headers
  if (scaleCode && typeof scaleCode === 'string') {
    if (scaleCode.includes('VALIDEZ')) {
      currentCategory = 'validity'
      continue
    } else if (scaleCode.includes('Patrones de Personalidad')) {
      currentCategory = 'personality'
      continue
    } else if (scaleCode.includes('Patología Grave') || scaleCode.includes('Severa')) {
      currentCategory = 'severe'
      continue
    } else if (scaleCode.includes('Síndromes Clínicos') || scaleCode.includes('Síndrome')) {
      currentCategory = 'clinical'
      continue
    }
  }

  // Parse scale data
  if (scaleCode && scaleName && typeof scaleCode === 'string' && typeof scaleName === 'string') {
    const codeStr = String(scaleCode).trim()
    const nameStr = String(scaleName).trim()

    // Skip header rows
    if (codeStr.toLowerCase().includes('escala') || nameStr.toLowerCase().includes('escalas')) {
      continue
    }

    const scaleData: any = {
      code: codeStr,
      name_es: nameStr,
      pd_or_br_example: pdOrBR,
      interpretation_es: interpretationText && typeof interpretationText === 'string' ? interpretationText.trim() : ''
    }

    // Categorize
    if (currentCategory === 'validity') {
      interpretations.validity_scales.push(scaleData)
    } else if (currentCategory === 'personality') {
      interpretations.personality_patterns.push(scaleData)
    } else if (currentCategory === 'severe') {
      interpretations.severe_pathology.push(scaleData)
    } else if (currentCategory === 'clinical') {
      interpretations.clinical_syndromes.push(scaleData)
    }
  }
}

// Save to JSON
const outputPath = path.join(outputDir, 'mcmi_interpretations_extracted.json')
fs.writeFileSync(
  outputPath,
  JSON.stringify(interpretations, null, 2)
)

console.log('='.repeat(80))
console.log('✅ EXTRACTION COMPLETE')
console.log('='.repeat(80))
console.log(`📊 Validity scales: ${interpretations.validity_scales.length}`)
console.log(`📊 Personality patterns: ${interpretations.personality_patterns.length}`)
console.log(`📊 Severe pathology: ${interpretations.severe_pathology.length}`)
console.log(`📊 Clinical syndromes: ${interpretations.clinical_syndromes.length}`)

console.log('\n📋 Validity Scales:')
interpretations.validity_scales.forEach((scale: any) => {
  console.log(`   ${scale.code} (${scale.name_es}): "${scale.interpretation_es.substring(0, 60)}..."`)
})

console.log('\n📋 Sample Personality Patterns:')
interpretations.personality_patterns.slice(0, 5).forEach((scale: any) => {
  console.log(`   ${scale.code} (${scale.name_es}): "${scale.interpretation_es.substring(0, 60)}..."`)
})

console.log('\n✅ Saved to: analysis/mcmi_interpretations_extracted.json')
console.log('\n⚠️  NOTE: All text is in Spanish - needs translation to Portuguese')
