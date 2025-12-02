import * as fs from 'fs'
import * as path from 'path'

const analysisDir = path.join(__dirname, '../analysis')
const outputDir = path.join(__dirname, '../analysis')

console.log('📊 Extracting PERCENTIL2 Table (BR → Percentile Conversion)...\n')

// Load the PERCENTIL2 sheet data
const percentil2Data = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_12_PERCENTIL2.json'), 'utf-8')
)

const data = percentil2Data.data

console.log(`Total rows: ${data.length}`)
console.log(`\nFirst 10 rows (raw data):`)
data.slice(0, 10).forEach((row: any[], idx: number) => {
  console.log(`Row ${idx}: ${JSON.stringify(row.slice(0, 15))}`)
})

// Build conversion map
const conversionTable: any = {
  metadata: {
    source: 'PERCENTIL2 sheet',
    purpose: 'BR (Base Rate) to Percentile conversion',
    named_range: 'TABLAPER',
    total_scales: 0,
    br_range: { min: 0, max: 0 }
  },
  scales: {}
}

// Find header row - look for row with scale codes (numbers like 1, 2A, etc.)
let headerRow = -1
let dataStartRow = -1

for (let i = 0; i < data.length; i++) {
  const row = data[i]
  if (row && row.length > 0) {
    // Look for row with scale codes
    const hasScaleCodes = row.some((cell: any) =>
      typeof cell === 'string' && (
        /^\d+$/.test(cell.trim()) || /^\d+[A-Z]$/.test(cell.trim()) || /^[A-Z]+$/.test(cell.trim())
      ) || typeof cell === 'number'
    )

    if (hasScaleCodes && headerRow === -1) {
      headerRow = i
      dataStartRow = i + 1
      console.log(`\n✅ Found header row at index ${i}`)
      console.log(`Header row: ${JSON.stringify(row.slice(0, 20))}`)
      break
    }
  }
}

if (headerRow === -1) {
  console.error('❌ Could not find header row')
  process.exit(1)
}

// Extract scale codes from header
const scaleCodes: string[] = []
const scaleColumnMap: { [key: string]: number } = {}

data[headerRow].forEach((cell: any, colIndex: number) => {
  if (colIndex < 1) return // Skip first column (percentile label column)

  if (cell !== null && cell !== undefined && cell !== '') {
    const scaleCode = String(cell).trim()
    // Only include valid scale codes (numbers, numbers+letters, or letters)
    if (/^\d+$/.test(scaleCode) || /^\d+[A-Z]$/.test(scaleCode) || /^[A-Z]+$/.test(scaleCode)) {
      scaleCodes.push(scaleCode)
      scaleColumnMap[scaleCode] = colIndex
      conversionTable.scales[scaleCode] = {}
    }
  }
})

console.log(`\n📊 Found ${scaleCodes.length} scales:`)
console.log(scaleCodes.join(', '))

// Extract conversion data (BR → Percentile for each scale)
let minBR = Infinity
let maxBR = -Infinity

for (let i = dataStartRow; i < data.length; i++) {
  const row = data[i]
  if (!row || row.length === 0) continue

  // First non-null column should contain BR value or percentile reference
  let brValue = row[0] !== null && row[0] !== undefined && row[0] !== '' ? row[0] : row[1]
  if (brValue === null || brValue === undefined || brValue === '') continue

  const br = typeof brValue === 'number' ? brValue : parseInt(String(brValue))
  if (isNaN(br)) continue

  minBR = Math.min(minBR, br)
  maxBR = Math.max(maxBR, br)

  // For each scale, get the percentile value at this BR
  scaleCodes.forEach(scaleCode => {
    const colIndex = scaleColumnMap[scaleCode]
    const percentileValue = row[colIndex]

    if (percentileValue !== null && percentileValue !== undefined && percentileValue !== '') {
      const percentile = typeof percentileValue === 'number' ? percentileValue : parseInt(String(percentileValue))
      if (!isNaN(percentile)) {
        conversionTable.scales[scaleCode][`br_${br}`] = percentile
      }
    }
  })
}

conversionTable.metadata.total_scales = scaleCodes.length
conversionTable.metadata.br_range.min = minBR
conversionTable.metadata.br_range.max = maxBR

// Save to JSON
const outputPath = path.join(outputDir, 'mcmi_br_to_percentile_conversion.json')
fs.writeFileSync(
  outputPath,
  JSON.stringify(conversionTable, null, 2)
)

console.log('\n' + '='.repeat(80))
console.log('✅ EXTRACTION COMPLETE')
console.log('='.repeat(80))
console.log(`📊 Scales extracted: ${scaleCodes.length}`)
console.log(`📊 BR range: ${minBR} to ${maxBR}`)
console.log(`📊 Output file: ${outputPath}`)

// Show sample conversion for first scale
if (scaleCodes.length > 0) {
  const firstScale = scaleCodes[0]
  console.log(`\n📋 Sample conversion for scale "${firstScale}":`)
  const sampleEntries = Object.entries(conversionTable.scales[firstScale]).slice(0, 10)
  sampleEntries.forEach(([br, percentile]) => {
    console.log(`   ${br} → ${percentile}th percentile`)
  })
}

console.log('\n✅ Saved to: analysis/mcmi_br_to_percentile_conversion.json')
