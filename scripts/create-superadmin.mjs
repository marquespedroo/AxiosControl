import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import bcrypt from 'bcryptjs'

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

const TARGET_EMAIL = 'peterhenrike@gmail.com'
const TARGET_PASSWORD = 'pHdintel1080bras'
const TARGET_NAME = 'Peter Henrike'

async function createSuperAdmin() {
    console.log(`Starting superadmin creation for ${TARGET_EMAIL}...`)

    // 1. Hash password
    const salt = bcrypt.genSaltSync(10)
    const passwordHash = bcrypt.hashSync(TARGET_PASSWORD, salt)
    console.log('✅ Password hashed')

    // 2. Check if user exists
    const { data: existingUser, error: searchError } = await supabase
        .from('psicologos')
        .select('*')
        .eq('email', TARGET_EMAIL)
        .single()

    if (searchError && searchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('❌ Error searching for user:', searchError.message)
        return
    }

    if (existingUser) {
        console.log(`User ${TARGET_EMAIL} already exists. Updating to superadmin...`)
        const { error: updateError } = await supabase
            .from('psicologos')
            .update({
                is_super_admin: true,
                senha_hash: passwordHash,
                ativo: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.id)

        if (updateError) {
            console.error('❌ Error updating user:', updateError.message)
        } else {
            console.log('✅ User updated successfully!')
        }
        return
    }

    // 3. Create new user
    console.log('User does not exist. Creating new user...')

    // Get a clinic ID if possible
    const { data: clinics } = await supabase
        .from('clinicas')
        .select('id')
        .limit(1)

    const clinicaId = clinics && clinics.length > 0 ? clinics[0].id : null
    console.log(`Using clinica_id: ${clinicaId}`)

    const newUser = {
        nome_completo: TARGET_NAME,
        email: TARGET_EMAIL,
        senha_hash: passwordHash,
        is_super_admin: true,
        ativo: true,
        clinica_id: clinicaId,
        // Add dummy values for potentially required fields
        crp: '00/00000',
        crp_estado: 'SP',
        especialidades: ['Neuropsicologia'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    const { data: createdUser, error: createError } = await supabase
        .from('psicologos')
        .insert([newUser])
        .select()

    if (createError) {
        console.error('❌ Error creating user:', createError.message)
        console.error('Details:', createError.details)
        console.error('Hint:', createError.hint)
    } else {
        console.log('✅ Superadmin user created successfully!')
        if (createdUser && createdUser.length > 0) {
            console.log(`ID: ${createdUser[0].id}`)
        }
    }
}

createSuperAdmin()
