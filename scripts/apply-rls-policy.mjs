import postgres from 'postgres'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env.local') })

// Extract connection details from Supabase URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1]
const password = process.env.SUPABASE_DB_PASSWORD || prompt('Enter database password: ')

const connectionString = `postgres://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

console.log('🔧 Applying RLS policy fix to remote database...\n')

try {
  const sql = postgres(connectionString, {
    max: 1,
    ssl: 'require'
  })

  console.log('📝 Dropping existing policy...')
  await sql`DROP POLICY IF EXISTS "Ver testes disponíveis" ON testes_templates`
  console.log('✅ Existing policy dropped\n')

  console.log('📝 Creating new policy (allows public tests without auth)...')
  await sql`
    CREATE POLICY "Ver testes disponíveis"
      ON testes_templates FOR SELECT
      USING (
        publico = true OR
        (auth.uid() IS NOT NULL AND criado_por IN (
          SELECT id FROM psicologos WHERE clinica_id = (
            SELECT clinica_id FROM psicologos WHERE id = auth.uid()
          )
        ))
      )
  `
  console.log('✅ New policy created successfully!\n')

  await sql.end()

  console.log('🎉 RLS policy fix applied successfully!')
  console.log('📊 Public tests should now be visible to all users')
} catch (error) {
  console.error('❌ Error applying RLS fix:', error.message)
  console.error('\nDetails:', error)
  process.exit(1)
}
