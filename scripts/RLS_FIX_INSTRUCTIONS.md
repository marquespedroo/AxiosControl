# RLS Policy Fix - Manual Instructions

## Problem
Tests are not showing on `/aplicar` page because Row Level Security (RLS) blocks unauthenticated access to public tests.

## Solution
Execute the following SQL in Supabase Dashboard SQL Editor to allow reading public tests without authentication:

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard/project/vndbzqafzuqdyxbayrdd
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Execute This SQL

```sql
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Ver testes disponíveis" ON testes_templates;

-- Create new policy that allows reading public tests without authentication
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
```

### Step 3: Verify
Run this query to confirm the policy was created:

```sql
SELECT * FROM pg_policies
WHERE tablename = 'testes_templates'
AND policyname = 'Ver testes disponíveis';
```

## What This Does
- Allows **anyone** (authenticated or not) to read tests where `publico = true`
- Allows **authenticated users** to read private tests created by their clinic
- Maintains security for private/clinic-specific tests

## After Applying
1. Refresh http://localhost:3001/aplicar
2. Tests should now be visible
