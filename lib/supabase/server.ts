import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SessionManager } from '@/lib/auth/SessionManager'
import type { Database } from '@/types/database.generated'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create Supabase client for server-side operations with custom JWT auth
 * Sets PostgreSQL session variables so RLS policies can access user context
 */
export async function createServerClient() {
  // Create base client
  const client = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)

  // Get session from custom JWT
  const sessionResult = await SessionManager.getSession()

  if (sessionResult.success) {
    const session = sessionResult.data

    // Set PostgreSQL session variables for RLS
    // Call the set_session_variables function we created in the migration
    try {
      await client.rpc('set_session_variables' as any, {
        user_id: session.id,
        clinica_id: session.clinica_id,
        is_super_admin: session.roles.includes('super_admin') || false
      })
      console.log('[Server Client] Session variables set for user:', session.id, 'roles:', session.roles)
    } catch (error) {
      console.error('[Server Client] Failed to set session variables:', error)
      // Continue anyway - the function might not exist yet if migration hasn't run
    }
  }

  return client
}

/**
 * Legacy export for compatibility
 */
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}
