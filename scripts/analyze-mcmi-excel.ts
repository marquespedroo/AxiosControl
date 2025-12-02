import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

const filePath = '/Users/pedrohenriqueoliveira/Downloads/sistema_testes/docs/704531450-libre-MCMI-IV-Inventario-Cli-nico-Multiaxial-de-Millon-xlsx-sin-contra-1.xlsx'

console.log('📊 Analyzing MCMI-IV Excel File...\n')

try {
  // Read the Excel file
  const workbook = XLSX.readFile(filePath, { cellFormula: true, cellStyles: true })

  console.log('📋 WORKBOOK INFORMATION')
  console.log('=======================')
  console.log(`Total Sheets: ${workbook.SheetNames.length}`)
  console.log(`Sheet Names: ${workbook.SheetNames.join(', ')}\n`)

  // Analyze each sheet
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`SHEET ${index + 1}: ${sheetName}`)
    console.log('='.repeat(80))

    const worksheet = workbook.Sheets[sheetName]
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')

    console.log(`\nDimensions: ${range.e.r + 1} rows x ${range.e.c + 1} columns`)
    console.log(`Range: ${worksheet['!ref']}`)

    // Get all data with formulas
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' })

    // Find formulas
    const formulas: any[] = []
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        const cell = worksheet[cellAddress]
        if (cell && cell.f) {
          formulas.push({
            cell: cellAddress,
            formula: cell.f,
            value: cell.v,
            type: cell.t
          })
        }
      }
    }

    if (formulas.length > 0) {
      console.log(`\n📐 FORMULAS FOUND: ${formulas.length}`)
      formulas.slice(0, 20).forEach(f => {
        console.log(`  ${f.cell}: ${f.formula} = ${f.value}`)
      })
      if (formulas.length > 20) {
        console.log(`  ... and ${formulas.length - 20} more formulas`)
      }
    }

    // Show first 30 rows of data
    console.log(`\n📄 SAMPLE DATA (first 30 rows):`)
    console.log('-'.repeat(80))
    data.slice(0, 30).forEach((row: any, idx) => {
      const rowData = Array.isArray(row) ? row : Object.values(row)
      const displayRow = rowData.slice(0, 10).map((cell: any) => {
        const str = String(cell || '')
        return str.length > 20 ? str.substring(0, 17) + '...' : str
      })
      console.log(`Row ${idx + 1}: ${JSON.stringify(displayRow)}`)
    })

    if (data.length > 30) {
      console.log(`... and ${data.length - 30} more rows`)
    }

    // Check for merged cells
    if (worksheet['!merges']) {
      console.log(`\n🔗 MERGED CELLS: ${worksheet['!merges'].length}`)
      worksheet['!merges'].slice(0, 10).forEach((merge: any) => {
        console.log(`  ${XLSX.utils.encode_range(merge)}`)
      })
    }

    // Check for special features
    if (worksheet['!cols']) {
      console.log(`\n📏 COLUMN WIDTHS: ${worksheet['!cols'].length} columns with custom widths`)
    }

    if (worksheet['!rows']) {
      console.log(`\n📏 ROW HEIGHTS: ${worksheet['!rows'].length} rows with custom heights`)
    }

    // Save sheet data to JSON for detailed analysis
    const outputDir = path.join(__dirname, '../analysis')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null })
    fs.writeFileSync(
      path.join(outputDir, `mcmi_sheet_${index + 1}_${sheetName.replace(/[^a-z0-9]/gi, '_')}.json`),
      JSON.stringify({
        name: sheetName,
        data: jsonData,
        formulas: formulas,
        range: worksheet['!ref'],
        merges: worksheet['!merges'] || []
      }, null, 2)
    )
  })

  console.log('\n\n' + '='.repeat(80))
  console.log('ANALYSIS COMPLETE')
  console.log('='.repeat(80))
  console.log(`\n✅ Detailed JSON files saved to: ${path.join(__dirname, '../analysis')}`)
  console.log('\nNext steps:')
  console.log('1. Review the JSON files for detailed structure')
  console.log('2. Identify question items and scoring logic')
  console.log('3. Map scales and subscales')
  console.log('4. Extract interpretation rules')
  console.log('5. Identify graph/visualization requirements')

} catch (error: any) {
  console.error('❌ Error reading Excel file:', error.message)
  process.exit(1)
}
