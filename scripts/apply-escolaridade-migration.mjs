import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔧 Applying escolaridade flexibility migration...\n')

const sql = readFileSync(
  resolve(__dirname, '../supabase/migrations/004_make_escolaridade_flexible.sql'),
  'utf-8'
)

console.log('SQL to execute:')
console.log('─'.repeat(80))
console.log(sql)
console.log('─'.repeat(80))
console.log('\n⚠️  This migration will:')
console.log('  1. Make escolaridade_anos NULLABLE')
console.log('  2. Add constraint requiring at least one of escolaridade_anos OR escolaridade_nivel')
console.log('  3. Create helper function to convert nivel to anos')
console.log('  4. Create view for easier querying\n')

console.log('📝 Note: Execute this SQL manually in Supabase Dashboard > SQL Editor')
console.log('🔗 URL: https://supabase.com/dashboard/project/vndbzqafzuqdyxbayrdd/sql\n')

console.log('✅ Migration file ready at: supabase/migrations/004_make_escolaridade_flexible.sql')
