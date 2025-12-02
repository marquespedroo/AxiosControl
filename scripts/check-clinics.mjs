import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkClinics() {
    console.log('Checking "clinicas" table...')

    const { data: clinics, error } = await supabase
        .from('clinicas')
        .select('*')

    if (error) {
        console.error('❌ Error accessing clinicas table:', error.message)
        return
    }

    if (clinics && clinics.length > 0) {
        console.log(`✅ Found ${clinics.length} clinic(s):`)
        clinics.forEach(c => {
            console.log(`  - ${c.nome} (CNPJ: ${c.cnpj || 'N/A'}) [ID: ${c.id}]`)
            console.log(`    Active: ${c.ativo}`)
        })
    } else {
        console.log('⚠️  No clinics found.')
    }
}

checkClinics()
