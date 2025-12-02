import * as fs from 'fs'
import * as path from 'path'

const analysisDir = path.join(__dirname, '../analysis')
const aplicacionFile = path.join(analysisDir, 'mcmi_sheet_1_APLICACION.json')

console.log('📝 Extracting MCMI-IV Items...\n')

try {
  const data = JSON.parse(fs.readFileSync(aplicacionFile, 'utf-8'))
  const rows = data.data

  const items: { numero: number; texto: string }[] = []

  // Items start at row 13 (index 12)
  for (let i = 12; i < rows.length; i++) {
    const row = rows[i]
    const numero = row[0]
    const texto = row[1]

    // Only include rows with valid item number and text
    if (typeof numero === 'number' && typeof texto === 'string' && texto.trim()) {
      items.push({ numero, texto: texto.trim() })
    }
  }

  console.log(`✅ Extracted ${items.length} items\n`)

  // Save to text file
  const textContent = items.map(item => `${item.numero}. ${item.texto}`).join('\n')
  fs.writeFileSync(path.join(analysisDir, 'mcmi_items_spanish.txt'), textContent, 'utf-8')

  // Save to JSON
  fs.writeFileSync(path.join(analysisDir, 'mcmi_items.json'), JSON.stringify(items, null, 2), 'utf-8')

  console.log('📄 First 10 items:')
  items.slice(0, 10).forEach(item => {
    console.log(`${item.numero}. ${item.texto}`)
  })

  console.log(`\n... and ${items.length - 10} more items\n`)
  console.log(`✅ Files saved:`)
  console.log(`   - ${path.join(analysisDir, 'mcmi_items_spanish.txt')}`)
  console.log(`   - ${path.join(analysisDir, 'mcmi_items.json')}`)

} catch (error: any) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
