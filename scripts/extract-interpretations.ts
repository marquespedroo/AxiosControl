import * as fs from 'fs'
import * as path from 'path'

const analysisDir = path.join(__dirname, '../analysis')
const outputDir = path.join(__dirname, '../analysis')

console.log('📊 Extracting MCMI-IV Interpretation Text Mappings...\n')

// Load interpretation sheets
const interpretacion1Data = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_6_Interpretacion.json'), 'utf-8')
)

const interpretacion2Data = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_7_Interpretacion_.json'), 'utf-8')
)

const data1 = interpretacion1Data.data
const data2 = interpretacion2Data.data

console.log(`Interpretacion sheet 1: ${data1.length} rows`)
console.log(`Interpretacion sheet 2: ${data2.length} rows`)

console.log(`\nFirst 20 rows of Interpretacion sheet 1:`)
data1.slice(0, 20).forEach((row: any[], idx: number) => {
  if (row && row.some((cell: any) => cell !== null && cell !== '')) {
    console.log(`Row ${idx}: ${JSON.stringify(row.slice(0, 8))}`)
  }
})

// Build interpretation structure
const interpretations: any = {
  metadata: {
    source: 'Interpretacion sheets',
    purpose: 'BR score range to clinical interpretation text mapping',
    total_scales: 0
  },
  validity_scales: {},
  personality_patterns: {},
  severe_pathology: {},
  clinical_syndromes: {},
  notes: []
}

// Parse interpretacion sheet 1 - likely has validity scales and main scales
// Look for patterns like scale code, BR range, interpretation text

for (let i = 0; i < data1.length; i++) {
  const row = data1[i]
  if (!row || row.length === 0) continue

  // Look for scale codes in first column or cells
  const firstCell = row[0]
  if (!firstCell) continue

  const cellStr = String(firstCell).trim()

  // Check if this looks like a scale code
  if (/^[A-Z]+$/.test(cellStr) || /^\d+[A-Z]*$/.test(cellStr)) {
    // Found potential scale code
    const scaleCode = cellStr

    // Next columns might have BR ranges and interpretation text
    // Typical format: [Scale Code, Scale Name, BR/PD values, interpretation text, ...]

    const interpretation: any = {
      code: scaleCode,
      name: row[1] ? String(row[1]).trim() : '',
      ranges: [],
      raw_data: row.slice(0, 8)
    }

    // Try to extract interpretation text from subsequent columns
    for (let col = 2; col < row.length; col++) {
      if (row[col] && typeof row[col] === 'string' && row[col].length > 20) {
        interpretation.interpretation_text = row[col]
        break
      }
    }

    // Categorize by scale type
    if (['V', 'W', 'X', 'Y', 'Z'].includes(scaleCode)) {
      interpretations.validity_scales[scaleCode] = interpretation
    } else if (/^[1-8][AB]?$/.test(scaleCode)) {
      interpretations.personality_patterns[scaleCode] = interpretation
    } else if (['S', 'C', 'P'].includes(scaleCode)) {
      interpretations.severe_pathology[scaleCode] = interpretation
    } else if (/^[A-Z]{1,2}$/.test(scaleCode) || scaleCode.length <= 3) {
      interpretations.clinical_syndromes[scaleCode] = interpretation
    }
  }
}

// Parse interpretacion sheet 2 - might have more detailed interpretations
console.log(`\n\nFirst 20 rows of Interpretacion sheet 2:`)
data2.slice(0, 20).forEach((row: any[], idx: number) => {
  if (row && row.some((cell: any) => cell !== null && cell !== '')) {
    console.log(`Row ${idx}: ${JSON.stringify(row.slice(0, 8))}`)
  }
})

interpretations.metadata.total_scales =
  Object.keys(interpretations.validity_scales).length +
  Object.keys(interpretations.personality_patterns).length +
  Object.keys(interpretations.severe_pathology).length +
  Object.keys(interpretations.clinical_syndromes).length

interpretations.notes.push(
  'Interpretation text extracted from Excel sheets',
  'BR ranges need to be manually verified and refined',
  'Full interpretation paragraphs available in source files',
  'Spanish text - needs translation to Portuguese for final implementation'
)

// Save to JSON
const outputPath = path.join(outputDir, 'mcmi_interpretations.json')
fs.writeFileSync(
  outputPath,
  JSON.stringify(interpretations, null, 2)
)

console.log('\n' + '='.repeat(80))
console.log('✅ EXTRACTION COMPLETE')
console.log('='.repeat(80))
console.log(`📊 Validity scales: ${Object.keys(interpretations.validity_scales).length}`)
console.log(`📊 Personality patterns: ${Object.keys(interpretations.personality_patterns).length}`)
console.log(`📊 Severe pathology: ${Object.keys(interpretations.severe_pathology).length}`)
console.log(`📊 Clinical syndromes: ${Object.keys(interpretations.clinical_syndromes).length}`)
console.log(`📊 Total: ${interpretations.metadata.total_scales}`)

console.log('\n📋 Sample interpretations:')
Object.entries(interpretations.validity_scales).slice(0, 3).forEach(([code, data]: [string, any]) => {
  console.log(`\n${code} - ${data.name}:`)
  if (data.interpretation_text) {
    console.log(`   "${data.interpretation_text.substring(0, 100)}..."`)
  }
})

console.log('\n✅ Saved to: analysis/mcmi_interpretations.json')
console.log('\n⚠️  NOTE: Interpretation text is in Spanish and may need refinement.')
console.log('   Full detailed interpretation logic may require additional extraction from RESULTADOS sheet.')
