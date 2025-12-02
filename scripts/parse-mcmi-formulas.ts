import * as fs from 'fs'
import * as path from 'path'

const analysisDir = path.join(__dirname, '../analysis')
const outputDir = path.join(__dirname, '../analysis')

console.log('🧮 Parsing MCMI-IV Formulas to Extract Item Mappings...\n')

// Load APLICACION sheet with formulas
const aplicacionData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_1_APLICACION.json'), 'utf-8')
)



const formulas = aplicacionData.formulas

console.log(`Total formulas found: ${formulas.length}\n`)

// The formulas start at row 17 (F17) for scale 1
// Pattern: weighted items in 2*(...) and unweighted items after +

// Scale codes in order (based on Excel structure)


interface ScaleItems {
  code: string
  name: string
  items_weighted: number[]
  items_unweighted: number[]
  formula_original: string
}

const scaleItemMappings: ScaleItems[] = []

/**
 * Parse cell reference to question number
 * D18 → row 18 → question number (18 - 12) = 6 where 12 is header offset
 * But actually checking the data: row 13 in array (index 12) has question 1
 * So: cell D18 (row 18) → array index 17 → question (17 - 12) = 5
 *
 * Need to determine the offset by checking actual data
 */
function cellToQuestionNumber(cellRef: string): number {
  // Extract row number from cell reference (e.g., "D18" → 18)
  const rowMatch = cellRef.match(/\d+/)
  if (!rowMatch) return 0

  const row = parseInt(rowMatch[0])

  // From the Excel: row 13 starts questions (question 1 at row 13)
  // So: question_number = row - 12
  return row - 12
}

/**
 * Parse formula to extract weighted and unweighted items
 * Example: "(2*(D18+D27+D55)+D29+D36+D42)"
 * Weighted: items in 2*(...) section
 * Unweighted: items after + outside the 2*(...)
 */
function parseFormula(formula: string): { weighted: number[]; unweighted: number[] } {
  const weighted: number[] = []
  const unweighted: number[] = []

  // Match the 2*(...) section for weighted items
  const weightedMatch = formula.match(/2\*\((.*?)\)/)
  if (weightedMatch) {
    const weightedSection = weightedMatch[1]
    // Extract all cell references from weighted section
    const cellRefs = weightedSection.match(/[A-Z]+\d+/g) || []
    cellRefs.forEach(cellRef => {
      const questionNum = cellToQuestionNumber(cellRef)
      if (questionNum > 0 && questionNum <= 195) {
        weighted.push(questionNum)
      }
    })
  }

  // Remove the weighted section and get everything after
  const withoutWeighted = formula.replace(/2\*\(.*?\)\+?/, '')
  // Extract all cell references from unweighted section
  const unweightedCells = withoutWeighted.match(/[A-Z]+\d+/g) || []
  unweightedCells.forEach(cellRef => {
    const questionNum = cellToQuestionNumber(cellRef)
    if (questionNum > 0 && questionNum <= 195) {
      unweighted.push(questionNum)
    }
  })

  return { weighted, unweighted }
}

// Process formulas
console.log('📊 Processing formulas...\n')

formulas.forEach((formulaData: any) => {
  const { cell, formula } = formulaData

  // Find which scale this formula belongs to
  // Cells F17-F28 are personality patterns (indices 0-11)
  // Cells F35-F37 are severe pathology (indices 12-14)
  // Cells F38-F47 are clinical syndromes (indices 15-24)

  let scaleCode: string | null = null
  let scaleName: string = ''

  if (cell.startsWith('F17')) { scaleCode = '1'; scaleName = 'Esquizoide' }
  else if (cell.startsWith('F18')) { scaleCode = '2A'; scaleName = 'Evitativo' }
  else if (cell.startsWith('F19')) { scaleCode = '2B'; scaleName = 'Melancólico' }
  else if (cell.startsWith('F20')) { scaleCode = '3'; scaleName = 'Dependente' }
  else if (cell.startsWith('F21')) { scaleCode = '4A'; scaleName = 'Histriónico' }
  else if (cell.startsWith('F22')) { scaleCode = '4B'; scaleName = 'Tempestuoso' }
  else if (cell.startsWith('F23')) { scaleCode = '5'; scaleName = 'Narcisista' }
  else if (cell.startsWith('F24')) { scaleCode = '6A'; scaleName = 'Antisocial' }
  else if (cell.startsWith('F25')) { scaleCode = '6B'; scaleName = 'Agressivo (Sádico)' }
  else if (cell.startsWith('F26')) { scaleCode = '7'; scaleName = 'Compulsivo' }
  else if (cell.startsWith('F27')) { scaleCode = '8A'; scaleName = 'Negativista' }
  else if (cell.startsWith('F28')) { scaleCode = '8B'; scaleName = 'Masoquista' }
  else if (cell.startsWith('F35')) { scaleCode = 'S'; scaleName = 'Esquizotípico' }
  else if (cell.startsWith('F36')) { scaleCode = 'C'; scaleName = 'Borderline' }
  else if (cell.startsWith('F37')) { scaleCode = 'P'; scaleName = 'Paranoide' }
  else if (cell.startsWith('F38')) { scaleCode = 'A'; scaleName = 'Ansiedade' }
  else if (cell.startsWith('F39')) { scaleCode = 'H'; scaleName = 'Somatização' }
  else if (cell.startsWith('F40')) { scaleCode = 'N'; scaleName = 'Bipolar' }
  else if (cell.startsWith('F41')) { scaleCode = 'D'; scaleName = 'Distimia' }
  else if (cell.startsWith('F42')) { scaleCode = 'B'; scaleName = 'Dependência de Álcool' }
  else if (cell.startsWith('F43')) { scaleCode = 'T'; scaleName = 'Dependência de Drogas' }
  else if (cell.startsWith('F44')) { scaleCode = 'R'; scaleName = 'Estresse Pós-Traumático' }
  else if (cell.startsWith('F45')) { scaleCode = 'SS'; scaleName = 'Pensamento Psicótico' }
  else if (cell.startsWith('F46')) { scaleCode = 'CC'; scaleName = 'Depressão Maior' }
  else if (cell.startsWith('F47')) { scaleCode = 'PP'; scaleName = 'Delírio Psicótico' }

  if (scaleCode) {
    const { weighted, unweighted } = parseFormula(formula)

    scaleItemMappings.push({
      code: scaleCode,
      name: scaleName,
      items_weighted: weighted.sort((a, b) => a - b),
      items_unweighted: unweighted.sort((a, b) => a - b),
      formula_original: formula
    })

    console.log(`${scaleCode.padEnd(4)} (${scaleName.padEnd(25)}): ${weighted.length} weighted + ${unweighted.length} unweighted items`)
  }
})

// Save to JSON
const outputPath = path.join(outputDir, 'mcmi_scale_item_mappings.json')
fs.writeFileSync(
  outputPath,
  JSON.stringify({
    metadata: {
      source: 'APLICACION sheet formulas',
      total_scales: scaleItemMappings.length,
      notes: [
        'Item numbers are 1-indexed (1-195)',
        'items_weighted: items that count 2x in formula',
        'items_unweighted: items that count 1x in formula',
        'Formula: PD = (2 × sum(weighted)) + sum(unweighted)'
      ]
    },
    scales: scaleItemMappings
  }, null, 2)
)

console.log('\n' + '='.repeat(80))
console.log('✅ EXTRACTION COMPLETE')
console.log('='.repeat(80))
console.log(`📊 Total scales mapped: ${scaleItemMappings.length}`)
console.log(`📊 Output file: ${outputPath}`)

// Show sample
console.log(`\n📋 Sample - Scale 1 (Esquizoide):`)
const scale1 = scaleItemMappings.find(s => s.code === '1')
if (scale1) {
  console.log(`   Weighted items (2x): ${scale1.items_weighted.join(', ')}`)
  console.log(`   Unweighted items (1x): ${scale1.items_unweighted.join(', ')}`)
  console.log(`   Total items: ${scale1.items_weighted.length + scale1.items_unweighted.length}`)
}

console.log('\n✅ Saved to: analysis/mcmi_scale_item_mappings.json')
