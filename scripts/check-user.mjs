import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUser() {
  // Check if we can get a system user
  const { data: users, error } = await supabase
    .from('usuarios')
    .select('id, email, nome, papel')
    .limit(5)

  if (error) {
    console.log('❌ Cannot access usuarios table:', error.message)
    console.log('Will use NULL for criado_por field')
    return null
  }

  console.log('✅ Found users:')
  users?.forEach(u => console.log(`  - ${u.email} (${u.papel})`))

  // Try to find a superuser/admin
  const admin = users?.find(u => u.papel === 'superuser' || u.papel === 'admin')

  if (admin) {
    console.log(`\n✅ Using admin user: ${admin.email} (${admin.id})`)
    return admin.id
  }

  if (users && users.length > 0) {
    console.log(`\n⚠️  No admin found, using first user: ${users[0].email}`)
    return users[0].id
  }

  console.log('\n⚠️  No users found, will use NULL')
  return null
}

checkUser()
