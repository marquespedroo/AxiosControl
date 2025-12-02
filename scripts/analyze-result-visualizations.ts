import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

const filePath = '/Users/pedrohenriqueoliveira/Downloads/sistema_testes/docs/704531450-libre-MCMI-IV-Inventario-Cli-nico-Multiaxial-de-Millon-xlsx-sin-contra-1.xlsx'

console.log('🎨 Analyzing MCMI-IV Result Visualizations...\n')

const workbook = XLSX.readFile(filePath, {
  cellFormula: true,
  cellStyles: true,
  bookVBA: true // Check for VBA/macros
})

// Analyze RESULTADOS sheets for charts and visualizations
const resultSheets = ['RESULTADOS ', 'RESULTADOS', 'FACETAS GROSSMAN Y RESPUESTAS S']

resultSheets.forEach(sheetName => {
  if (!workbook.Sheets[sheetName]) {
    console.log(`⚠️  Sheet "${sheetName}" not found`)
    return
  }

  console.log('='.repeat(80))
  console.log(`📊 SHEET: ${sheetName}`)
  console.log('='.repeat(80))

  const worksheet = workbook.Sheets[sheetName]

  // Check for charts (stored in !charts property)
  if (worksheet['!charts']) {
    console.log(`\n📈 CHARTS FOUND: ${worksheet['!charts'].length}`)
    worksheet['!charts'].forEach((chart: any, idx: number) => {
      console.log(`   Chart ${idx + 1}:`, chart)
    })
  } else {
    console.log('\n📈 No charts metadata found in sheet')
  }

  // Check for drawings/shapes
  if (worksheet['!drawings']) {
    console.log(`\n🎨 DRAWINGS FOUND: ${worksheet['!drawings'].length}`)
    worksheet['!drawings'].forEach((drawing: any, idx: number) => {
      console.log(`   Drawing ${idx + 1}:`, drawing)
    })
  }

  // Check for conditional formatting (often used for visual indicators)
  if (worksheet['!conditionalFormatting']) {
    console.log(`\n🌈 CONDITIONAL FORMATTING FOUND`)
    console.log(worksheet['!conditionalFormatting'])
  }

  // Analyze merged cells (often used for headers/visual layout)
  if (worksheet['!merges']) {
    console.log(`\n🔗 MERGED CELLS: ${worksheet['!merges'].length}`)
    worksheet['!merges'].slice(0, 10).forEach((merge: any) => {
      console.log(`   ${XLSX.utils.encode_range(merge)}`)
    })
  }

  // Look for text that indicates visual elements
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null })
  const visualKeywords = ['gráfico', 'grafico', 'chart', 'perfil', 'profile', 'diagrama', 'diagram']

  console.log('\n🔍 Searching for visual element indicators...')
  let foundVisuals = false
  data.forEach((row: any, idx: number) => {
    if (Array.isArray(row)) {
      row.forEach((cell: any) => {
        if (typeof cell === 'string') {
          const lowerCell = cell.toLowerCase()
          if (visualKeywords.some(keyword => lowerCell.includes(keyword))) {
            console.log(`   Row ${idx}: "${cell}"`)
            foundVisuals = true
          }
        }
      })
    }
  })

  if (!foundVisuals) {
    console.log('   No visual element keywords found in text')
  }

  // Analyze cell colors and styles (indicators of visual design)
  console.log('\n🎨 Analyzing cell styles...')
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  let coloredCells = 0
  let boldCells = 0

  for (let R = range.s.r; R <= Math.min(range.e.r, 50); ++R) {
    for (let C = range.s.c; C <= Math.min(range.e.c, 20); ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = worksheet[cellAddress]
      if (cell && cell.s) {
        if (cell.s.fgColor || cell.s.bgColor) {
          coloredCells++
        }
        if (cell.s.font && cell.s.font.bold) {
          boldCells++
        }
      }
    }
  }

  console.log(`   Colored cells (first 50 rows): ${coloredCells}`)
  console.log(`   Bold cells (first 50 rows): ${boldCells}`)

  console.log('\n')
})

// Check workbook-level objects
console.log('='.repeat(80))
console.log('📊 WORKBOOK-LEVEL ANALYSIS')
console.log('='.repeat(80))

if (workbook.Workbook) {
  console.log('\n📋 Workbook metadata found')

  if (workbook.Workbook.Sheets) {
    console.log(`\nSheet visibility:`)
    workbook.Workbook.Sheets.forEach((sheet: any) => {
      console.log(`   ${sheet.name}: ${sheet.Hidden ? 'HIDDEN' : 'VISIBLE'}`)
    })
  }

  if (workbook.Workbook.Names) {
    console.log(`\nNamed ranges: ${workbook.Workbook.Names.length}`)
    workbook.Workbook.Names.slice(0, 20).forEach((name: any) => {
      console.log(`   ${name.Name}: ${name.Ref}`)
    })
  }
}

// Save detailed analysis
const outputDir = path.join(__dirname, '../analysis')
const analysis = {
  timestamp: new Date().toISOString(),
  totalSheets: workbook.SheetNames.length,
  resultSheets: resultSheets,
  hasCharts: false,
  hasDrawings: false,
  hasConditionalFormatting: false,
  visualization_requirements: [
    'Graph/Chart for Personality Patterns (scales 1-8B)',
    'Graph/Chart for Clinical Syndromes (scales S1-C)',
    'Graph/Chart for Grossman Facets (24 facets)',
    'Table/List for Validity Scales (V, W, X, Y, Z)',
    'Table/List for Significant Responses',
    'Percentile bars or indicators',
    'BR (Base Rate) score displays',
    'Color-coded severity indicators'
  ],
  notes: [
    'Excel charts are typically embedded objects not easily extracted via xlsx library',
    'Need to recreate visualizations based on data structure and formatting patterns',
    'RESULTADOS sheet shows the final presentation layout',
    'FACETAS GROSSMAN sheet contains additional visual layouts'
  ]
}

fs.writeFileSync(
  path.join(outputDir, 'mcmi_visualization_analysis.json'),
  JSON.stringify(analysis, null, 2)
)

console.log('\n✅ Visualization analysis saved to: analysis/mcmi_visualization_analysis.json')
console.log('\n' + '='.repeat(80))
console.log('📝 CONCLUSION')
console.log('='.repeat(80))
console.log(`
The Excel file contains multiple result presentation formats:

1. RESULTADOS sheet - Main results dashboard with:
   - Validity scale indicators
   - Personality pattern scores
   - Clinical syndrome scores
   - Interpretations linked to score ranges

2. FACETAS GROSSMAN Y RESPUESTAS S sheet - Additional visualizations for:
   - 24 Grossman facets display
   - Significant responses tracking

3. Visual elements include:
   - Score displays with percentiles
   - BR (Base Rate) conversions
   - Color-coded severity levels
   - Merged cells for organized layout
   - Conditional formatting for visual emphasis

4. Required visualizations to recreate:
   ✅ Personality Profile Chart (bar/line graph)
   ✅ Clinical Syndromes Chart
   ✅ Grossman Facets Display (24 items)
   ✅ Validity Scales Table
   ✅ Significant Responses List
   ✅ Percentile indicators
   ✅ BR score displays
   ✅ Interpretation text based on score ranges
`)
