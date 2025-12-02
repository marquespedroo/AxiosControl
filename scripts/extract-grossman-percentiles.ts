import * as fs from 'fs'
import * as path from 'path'

const analysisDir = path.join(__dirname, '../analysis')
const outputDir = path.join(__dirname, '../analysis')

console.log('📊 Extracting PERCENTIL GROSSMAN Table...\n')

// Load the PERCENTIL GROSSMAN sheet data
const percentilGrossmanData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_13_PERCENTIL_GROSSMAN.json'), 'utf-8')
)

const data = percentilGrossmanData.data

console.log(`Total rows: ${data.length}`)
console.log(`\nFirst 15 rows (raw data):`)
data.slice(0, 15).forEach((row: any[], idx: number) => {
  console.log(`Row ${idx}: ${JSON.stringify(row.slice(0, 20))}`)
})

// Build conversion map
const conversionTable: any = {
  metadata: {
    source: 'PERCENTIL GROSSMAN sheet',
    purpose: 'Grossman Facets percentile conversion',
    total_facets: 0,
    score_range: { min: 0, max: 0 }
  },
  facets: {}
}

// This table has a different structure:
// - First column has facet codes (1.1, 1.2, 2A.1, etc.)
// - Pairs of columns show TB (Tasa Base / Base Rate) and Pc (Percentile)
// - Row 0 has TB scores (0, 1, 2, 3, etc.)
// - Row 1 has labels "TB" and "Pc" alternating

const dataStartRow = 2 // Data starts at row 2

// Extract TB scores from row 0 (these are the BR score reference points)
const tbScores: number[] = []
data[0].forEach((cell: any) => {
  if (cell !== null && cell !== undefined && cell !== '') {
    const score = typeof cell === 'number' ? cell : parseInt(String(cell))
    if (!isNaN(score)) {
      tbScores.push(score)
    }
  }
})

console.log(`\n📊 TB (Base Rate) reference scores:`)
console.log(tbScores.join(', '))

// Extract facet codes and their percentile mappings
const facetCodes: string[] = []

for (let i = dataStartRow; i < data.length; i++) {
  const row = data[i]
  if (!row || row.length === 0) continue

  // First column contains facet code
  const facetCode = row[0]
  if (!facetCode) continue

  const facetCodeStr = String(facetCode).trim()
  facetCodes.push(facetCodeStr)
  conversionTable.facets[facetCodeStr] = {}

  // Extract percentiles for each TB score
  // Columns alternate: TB value, Percentile value
  for (let col = 1; col < row.length; col += 2) {
    const tbValue = row[col]
    const percentileValue = row[col + 1]

    if (tbValue !== null && tbValue !== undefined && percentileValue !== null && percentileValue !== undefined) {
      const tb = typeof tbValue === 'number' ? tbValue : parseInt(String(tbValue))
      const percentile = typeof percentileValue === 'number' ? percentileValue : parseInt(String(percentileValue))

      if (!isNaN(tb) && !isNaN(percentile)) {
        conversionTable.facets[facetCodeStr][`br_${tb}`] = percentile
      }
    }
  }
}

console.log(`\n📊 Found ${facetCodes.length} Grossman facets:`)
console.log(facetCodes.join(', '))

conversionTable.metadata.total_facets = facetCodes.length
conversionTable.metadata.score_range.min = tbScores.length > 0 ? Math.min(...tbScores) : 0
conversionTable.metadata.score_range.max = tbScores.length > 0 ? Math.max(...tbScores) : 0

// Save to JSON
const outputPath = path.join(outputDir, 'mcmi_grossman_percentiles.json')
fs.writeFileSync(
  outputPath,
  JSON.stringify(conversionTable, null, 2)
)

console.log('\n' + '='.repeat(80))
console.log('✅ EXTRACTION COMPLETE')
console.log('='.repeat(80))
console.log(`📊 Facets extracted: ${facetCodes.length}`)
console.log(`📊 Score range: ${conversionTable.metadata.score_range.min} to ${conversionTable.metadata.score_range.max}`)
console.log(`📊 Output file: ${outputPath}`)

// Show sample conversion for first facet
if (facetCodes.length > 0) {
  const firstFacet = facetCodes[0]
  console.log(`\n📋 Sample conversion for facet "${firstFacet}":`)
  const sampleEntries = Object.entries(conversionTable.facets[firstFacet]).slice(0, 10)
  sampleEntries.forEach(([score, percentile]) => {
    console.log(`   ${score} → ${percentile}th percentile`)
  })
}

console.log('\n✅ Saved to: analysis/mcmi_grossman_percentiles.json')
