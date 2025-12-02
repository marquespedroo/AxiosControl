import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 Checking RLS policies on remote database...\\n')

// Check if RLS is enabled
const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
  sql: `
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'testes_templates'
  `
})

if (rlsError) {
  console.log('Could not check RLS status via RPC')
  console.log('Attempting to apply RLS policy fix...\\n')
} else {
  console.log('RLS Status:', rlsData)
}

// Apply the fix: Update RLS policy to allow anon access to public tests
const sqlFix = `
-- Drop existing policy if it exists
DROP POLICY IF EXISTS \"Ver testes disponíveis\" ON testes_templates;

-- Create new policy that allows reading public tests without authentication
CREATE POLICY \"Ver testes disponíveis\"
  ON testes_templates FOR SELECT
  USING (
    publico = true OR
    (auth.uid() IS NOT NULL AND criado_por IN (
      SELECT id FROM psicologos WHERE clinica_id = (
        SELECT clinica_id FROM psicologos WHERE id = auth.uid()
      )
    ))
  );
`

console.log('Applying RLS policy fix...\\n')
console.log('SQL:', sqlFix)

