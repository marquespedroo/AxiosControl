import * as fs from 'fs'
import * as path from 'path'

const analysisDir = path.join(__dirname, '../analysis')
const outputDir = path.join(__dirname, '../analysis')

interface ConversionTable {
  sheetName: string
  purpose: string
  data: any[]
  formulas?: any[]
}

const conversionTables: ConversionTable[] = []

console.log('🔍 Extracting ALL conversion tables and correction patterns...\n')

// Sheet 4: CORRECCION - Main correction/conversion logic
console.log('📋 Analyzing CORRECCION sheet...')
const correccionData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_4_CORRECCION.json'), 'utf-8')
)
console.log(`   - Rows: ${correccionData.data.length}`)
console.log(`   - Formulas: ${correccionData.formulas?.length || 0}`)
conversionTables.push({
  sheetName: 'CORRECCION',
  purpose: 'Main correction and conversion formulas',
  data: correccionData.data,
  formulas: correccionData.formulas
})

// Sheet 10: PUNT-DIRECTA - Raw score (PD) calculations
console.log('📋 Analyzing PUNT-DIRECTA sheet...')
const puntDirectaData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_10_PUNT_DIRECTA.json'), 'utf-8')
)
console.log(`   - Rows: ${puntDirectaData.data.length}`)
console.log(`   - Formulas: ${puntDirectaData.formulas?.length || 0}`)
conversionTables.push({
  sheetName: 'PUNT-DIRECTA',
  purpose: 'Raw score (Puntuación Directa) calculations',
  data: puntDirectaData.data,
  formulas: puntDirectaData.formulas
})

// Sheet 11: PERCENTIL - Main percentile conversion table
console.log('📋 Analyzing PERCENTIL sheet...')
const percentilData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_11_PERCENTIL.json'), 'utf-8')
)
console.log(`   - Rows: ${percentilData.data.length}`)
console.log(`   - Formulas: ${percentilData.formulas?.length || 0}`)
conversionTables.push({
  sheetName: 'PERCENTIL',
  purpose: 'PD to Percentile conversion table',
  data: percentilData.data,
  formulas: percentilData.formulas
})

// Sheet 12: PERCENTIL2 - Secondary percentile table
console.log('📋 Analyzing PERCENTIL2 sheet...')
const percentil2Data = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_12_PERCENTIL2.json'), 'utf-8')
)
console.log(`   - Rows: ${percentil2Data.data.length}`)
console.log(`   - Formulas: ${percentil2Data.formulas?.length || 0}`)
conversionTables.push({
  sheetName: 'PERCENTIL2',
  purpose: 'Secondary percentile conversion table',
  data: percentil2Data.data,
  formulas: percentil2Data.formulas
})

// Sheet 13: PERCENTIL GROSSMAN - Grossman facets percentile conversion
console.log('📋 Analyzing PERCENTIL GROSSMAN sheet...')
const percentilGrossmanData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_13_PERCENTIL_GROSSMAN.json'), 'utf-8')
)
console.log(`   - Rows: ${percentilGrossmanData.data.length}`)
console.log(`   - Formulas: ${percentilGrossmanData.formulas?.length || 0}`)
conversionTables.push({
  sheetName: 'PERCENTIL_GROSSMAN',
  purpose: 'Grossman facets percentile conversion',
  data: percentilGrossmanData.data,
  formulas: percentilGrossmanData.formulas
})

// Sheet 2: RESULTADOS - Result display formulas
console.log('📋 Analyzing RESULTADOS sheet (main results)...')
const resultadosData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_2_RESULTADOS_.json'), 'utf-8')
)
console.log(`   - Rows: ${resultadosData.data.length}`)
console.log(`   - Formulas: ${resultadosData.formulas?.length || 0}`)
conversionTables.push({
  sheetName: 'RESULTADOS',
  purpose: 'Main results display and interpretation',
  data: resultadosData.data,
  formulas: resultadosData.formulas
})

// Sheet 3: FACETAS GROSSMAN Y RESPUESTAS S
console.log('📋 Analyzing FACETAS GROSSMAN Y RESPUESTAS S sheet...')
const facetasData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_3_FACETAS_GROSSMAN_Y_RESPUESTAS_S.json'), 'utf-8')
)
console.log(`   - Rows: ${facetasData.data.length}`)
console.log(`   - Formulas: ${facetasData.formulas?.length || 0}`)
conversionTables.push({
  sheetName: 'FACETAS_GROSSMAN_Y_RESPUESTAS_S',
  purpose: 'Grossman facets and significant responses',
  data: facetasData.data,
  formulas: facetasData.formulas
})

// Sheet 6 & 7: Interpretation tables
console.log('📋 Analyzing Interpretacion sheets...')
const interpretacionData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_6_Interpretacion.json'), 'utf-8')
)
console.log(`   - Interpretacion 1 Rows: ${interpretacionData.data.length}`)
conversionTables.push({
  sheetName: 'Interpretacion',
  purpose: 'Interpretation rules and descriptions',
  data: interpretacionData.data,
  formulas: interpretacionData.formulas
})

const interpretacion2Data = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_7_Interpretacion_.json'), 'utf-8')
)
console.log(`   - Interpretacion 2 Rows: ${interpretacion2Data.data.length}`)
conversionTables.push({
  sheetName: 'Interpretacion_',
  purpose: 'Extended interpretation rules',
  data: interpretacion2Data.data,
  formulas: interpretacion2Data.formulas
})

// Save comprehensive conversion tables
console.log('\n💾 Saving conversion tables...')
fs.writeFileSync(
  path.join(outputDir, 'mcmi_conversion_tables_complete.json'),
  JSON.stringify(conversionTables, null, 2)
)

// Create summary report
console.log('\n' + '='.repeat(80))
console.log('📊 CONVERSION TABLES SUMMARY')
console.log('='.repeat(80))

let totalFormulas = 0
conversionTables.forEach(table => {
  console.log(`\n${table.sheetName}:`)
  console.log(`   Purpose: ${table.purpose}`)
  console.log(`   Data rows: ${table.data.length}`)
  console.log(`   Formulas: ${table.formulas?.length || 0}`)
  totalFormulas += table.formulas?.length || 0
})

console.log('\n' + '='.repeat(80))
console.log(`📊 TOTAL FORMULAS EXTRACTED: ${totalFormulas}`)
console.log('='.repeat(80))

// Analyze CORRECCION sheet in detail for PD → BR conversion
console.log('\n\n🔍 DETAILED ANALYSIS: CORRECCION SHEET (PD → BR conversion)')
console.log('='.repeat(80))

const correccionRows = correccionData.data
console.log(`\nFirst 20 rows of CORRECCION sheet:`)
correccionRows.slice(0, 20).forEach((row: any[], idx: number) => {
  if (row && row.length > 0 && row.some(cell => cell !== null && cell !== '')) {
    console.log(`Row ${idx}: ${JSON.stringify(row.slice(0, 15))}`)
  }
})

// Analyze PERCENTIL sheet structure
console.log('\n\n🔍 DETAILED ANALYSIS: PERCENTIL SHEET')
console.log('='.repeat(80))
const percentilRows = percentilData.data
console.log(`\nFirst 20 rows of PERCENTIL sheet:`)
percentilRows.slice(0, 20).forEach((row: any[], idx: number) => {
  if (row && row.length > 0 && row.some(cell => cell !== null && cell !== '')) {
    console.log(`Row ${idx}: ${JSON.stringify(row.slice(0, 10))}`)
  }
})

console.log('\n✅ Conversion tables extracted to: analysis/mcmi_conversion_tables_complete.json')
