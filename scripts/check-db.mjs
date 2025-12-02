import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('🔍 Checking database structure...\n')

  // Check if table exists
  const { data: tables, error: tablesError } = await supabase
    .from('testes_templates')
    .select('*')
    .limit(1)

  if (tablesError) {
    console.error('❌ Error accessing testes_templates:', tablesError.message)
    console.log('\nTable might not exist or there might be a permission issue.')
    return
  }

  console.log('✅ Successfully connected to testes_templates table')

  // Check existing records
  const { data: existing, error: countError } = await supabase
    .from('testes_templates')
    .select('id, sigla, nome')

  if (countError) {
    console.error('❌ Error counting records:', countError.message)
    return
  }

  console.log(`\n📊 Found ${existing?.length || 0} existing test templates:`)
  if (existing && existing.length > 0) {
    existing.forEach(test => {
      console.log(`  - ${test.sigla}: ${test.nome}`)
    })
  }

  // Try to insert one test to see what error we get
  console.log('\n🧪 Testing insert with EPF-TDAH...')

  const testTemplate = {
    nome: 'EPF-TDAH - Escala de Prejuízos Funcionais TDAH',
    sigla: 'EPF-TDAH',
    descricao: 'Test description',
    tipo: 'escala_likert',
    versao: '1.0',
    faixa_etaria_min: 18,
    faixa_etaria_max: null,
    publico: true,
    ativo: true,
    configuracao: {
      escala_min: 0,
      escala_max: 4,
      opcoes: ['Opção 1', 'Opção 2'],
      gabarito: {}
    },
    perguntas: ['Pergunta 1', 'Pergunta 2']
  }

  const { data, error } = await supabase
    .from('testes_templates')
    .insert([testTemplate])
    .select()

  if (error) {
    console.error('❌ Insert error:', error.message)
    console.error('Error details:', JSON.stringify(error, null, 2))
  } else {
    console.log('✅ Test insert successful!')
    console.log('Inserted record ID:', data[0]?.id)

    // Clean up test record
    await supabase
      .from('testes_templates')
      .delete()
      .eq('id', data[0].id)
    console.log('🧹 Cleaned up test record')
  }
}

checkDatabase()
  .then(() => {
    console.log('\n✨ Database check completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error)
    process.exit(1)
  })
