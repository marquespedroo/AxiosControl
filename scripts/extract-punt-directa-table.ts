import * as fs from 'fs'
import * as path from 'path'

const analysisDir = path.join(__dirname, '../analysis')
const outputDir = path.join(__dirname, '../analysis')

console.log('📊 Extracting PUNT-DIRECTA Table (PD → BR Conversion)...\n')

// Load the PUNT-DIRECTA sheet data
const puntDirectaData = JSON.parse(
  fs.readFileSync(path.join(analysisDir, 'mcmi_sheet_10_PUNT_DIRECTA.json'), 'utf-8')
)

const data = puntDirectaData.data

console.log(`Total rows: ${data.length}`)
console.log(`\nFirst 10 rows (raw data):`)
data.slice(0, 10).forEach((row: any[], idx: number) => {
  console.log(`Row ${idx}: ${JSON.stringify(row)}`)
})

// Parse the table structure
// Row 0: Headers (scale codes)
// Row 1+: PD values → BR values for each scale

const headers = data[0] // Should contain scale codes like "1", "2A", "2B", etc.
console.log(`\n📋 Headers (Scale Codes):`)
console.log(JSON.stringify(headers))

// Build conversion map
const conversionTable: any = {
  metadata: {
    source: 'PUNT-DIRECTA sheet',
    purpose: 'PD (Puntuación Directa / Raw Score) to BR (Base Rate) conversion',
    named_range: 'TABLAPD',
    total_scales: 0,
    pd_range: { min: 0, max: 0 }
  },
  scales: {}
}

// Find where actual data starts (skip null/empty rows)
let headerRow = -1
let dataStartRow = -1

for (let i = 0; i < data.length; i++) {
  const row = data[i]
  if (row && row.length > 0) {
    // Look for row with scale codes (contains numbers/codes like "1", "2A", etc.)
    const hasScaleCodes = row.some((cell: any) =>
      typeof cell === 'string' && (
        /^\d+$/.test(cell) || // Pure number like "1"
        /^\d+[A-Z]$/.test(cell) || // Number + letter like "2A"
        /^[A-Z]+$/.test(cell) // Pure letters like "V", "W"
      )
    )

    if (hasScaleCodes && headerRow === -1) {
      headerRow = i
      dataStartRow = i + 1
      console.log(`\n✅ Found header row at index ${i}`)
      console.log(`Header row: ${JSON.stringify(row.slice(0, 30))}`)
      break
    }
  }
}

if (headerRow === -1) {
  console.error('❌ Could not find header row with scale codes')
  process.exit(1)
}

// Extract scale codes from header
// Skip first two columns (null and "Punt. Directa" label)
const scaleCodes: string[] = []
const scaleColumnMap: { [key: string]: number } = {}

data[headerRow].forEach((cell: any, colIndex: number) => {
  if (colIndex < 2) return // Skip first two columns

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

// Extract conversion data (PD → BR for each scale)
let minPD = Infinity
let maxPD = -Infinity

for (let i = dataStartRow; i < data.length; i++) {
  const row = data[i]
  if (!row || row.length === 0) continue

  // Second column (index 1) contains PD value
  const pdValue = row[1]
  if (pdValue === null || pdValue === undefined || pdValue === '') continue

  const pd = typeof pdValue === 'number' ? pdValue : parseInt(String(pdValue))
  if (isNaN(pd)) continue

  minPD = Math.min(minPD, pd)
  maxPD = Math.max(maxPD, pd)

  // For each scale, get the BR value at this PD
  scaleCodes.forEach(scaleCode => {
    const colIndex = scaleColumnMap[scaleCode]
    const brValue = row[colIndex]

    if (brValue !== null && brValue !== undefined && brValue !== '') {
      const br = typeof brValue === 'number' ? brValue : parseInt(String(brValue))
      if (!isNaN(br)) {
        conversionTable.scales[scaleCode][`pd_${pd}`] = br
      }
    }
  })
}

conversionTable.metadata.total_scales = scaleCodes.length
conversionTable.metadata.pd_range.min = minPD
conversionTable.metadata.pd_range.max = maxPD

// Save to JSON
const outputPath = path.join(outputDir, 'mcmi_pd_to_br_conversion.json')
fs.writeFileSync(
  outputPath,
  JSON.stringify(conversionTable, null, 2)
)

console.log('\n' + '='.repeat(80))
console.log('✅ EXTRACTION COMPLETE')
console.log('='.repeat(80))
console.log(`📊 Scales extracted: ${scaleCodes.length}`)
console.log(`📊 PD range: ${minPD} to ${maxPD}`)
console.log(`📊 Output file: ${outputPath}`)

// Show sample conversion for first scale
const firstScale = scaleCodes[0]
console.log(`\n📋 Sample conversion for scale "${firstScale}":`)
const sampleEntries = Object.entries(conversionTable.scales[firstScale]).slice(0, 10)
sampleEntries.forEach(([pd, br]) => {
  console.log(`   ${pd} → BR ${br}`)
})

console.log('\n✅ Saved to: analysis/mcmi_pd_to_br_conversion.json')
