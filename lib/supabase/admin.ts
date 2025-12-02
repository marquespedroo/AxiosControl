import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
    console.error('[Supabase Admin] Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseServiceRoleKey) {
    console.error('[Supabase Admin] Missing SUPABASE_SERVICE_ROLE_KEY')
}

// Server-side Supabase client (with service role key)
export const supabaseAdmin = createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)
