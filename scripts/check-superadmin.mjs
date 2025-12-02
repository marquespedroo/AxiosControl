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

async function checkSuperAdmin() {
    console.log('Checking users in "psicologos" table...')

    const { data: users, error } = await supabase
        .from('psicologos')
        .select('id, nome_completo, email, is_super_admin')

    if (error) {
        console.error('❌ Error accessing psicologos table:', error.message)
        return
    }

    const superAdmins = users.filter(u => u.is_super_admin)

    if (superAdmins.length > 0) {
        console.log(`✅ Found ${superAdmins.length} superadmin(s):`)
        superAdmins.forEach(u => console.log(`  - ${u.nome_completo} (${u.email}) [ID: ${u.id}]`))
    } else {
        console.log('❌ No superadmin users found.')
    }

    if (users.length > 0) {
        console.log(`\nℹ️  Total users found: ${users.length}`)
        console.log('Existing users:')
        users.forEach(u => {
            console.log(`  - ${u.nome_completo} (${u.email}) - SuperAdmin: ${u.is_super_admin}`)
        })
    } else {
        console.log('⚠️  No users found in the database.')
    }
}

checkSuperAdmin()
