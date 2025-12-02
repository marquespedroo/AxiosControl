#!/bin/bash

# Load environment variables
source <(grep -v '^#' .env.local | sed 's/^/export /')

# SQL to execute
read -r -d '' SQL << 'EOFSQL'
DROP POLICY IF EXISTS "Ver testes disponíveis" ON testes_templates;

CREATE POLICY "Ver testes disponíveis"
  ON testes_templates FOR SELECT
  USING (
    publico = true OR
    (auth.uid() IS NOT NULL AND criado_por IN (
      SELECT id FROM psicologos WHERE clinica_id = (
        SELECT clinica_id FROM psicologos WHERE id = auth.uid()
      )
    ))
  );
EOFSQL

echo "🔧 Applying RLS policy fix..."
echo ""
echo "SQL to execute:"
echo "$SQL"
echo ""

# Try to execute via psql if available
if command -v psql &> /dev/null; then
  echo "Using psql to apply fix..."
  PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | grep -oP 'https://\K[^.]+')
  echo "$SQL" | PGPASSWORD="${SUPABASE_DB_PASSWORD}" psql "postgres://postgres.${PROJECT_REF}@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -v ON_ERROR_STOP=1
  
  if [ $? -eq 0 ]; then
    echo "✅ RLS policy applied successfully!"
  else
    echo "❌ Failed to apply RLS policy"
    exit 1
  fi
else
  echo "❌ psql not available"
  echo "Please execute the SQL manually in Supabase Dashboard"
  echo "See scripts/RLS_FIX_INSTRUCTIONS.md for instructions"
  exit 1
fi
