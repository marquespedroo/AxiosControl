import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { supabaseAdmin } from '@/lib/supabase/client'

/**
 * Middleware to require super admin privileges
 * Returns 403 if user is not a super admin
 */
export async function requireSuperAdmin(
  request: NextRequest,
  handler: (request: NextRequest, session: any) => Promise<NextResponse>
): Promise<NextResponse> {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const session = sessionResult.data

  // Check if user is super admin
  // Use admin client to bypass RLS
  const { count, error } = await supabaseAdmin
    .from('user_roles' as any)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.id)
    .eq('role', 'super_admin')

  if (error || count === 0) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas super administradores podem realizar esta ação.' },
      { status: 403 }
    )
  }

  // User is super admin, proceed with handler
  return handler(request, session)
}

/**
 * Helper to check if current user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const { count, error } = await supabaseAdmin
    .from('user_roles' as any)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'super_admin')

  if (error) {
    return false
  }

  return (count || 0) > 0
}
