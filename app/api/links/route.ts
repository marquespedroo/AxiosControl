import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { LinkService } from '@/lib/services/LinkService'
import { SessionManager } from '@/lib/auth/SessionManager'

/**
 * POST /api/links
 * Generate a new access link
 */
export async function POST(request: NextRequest) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const session = sessionResult.data
  const supabase = await createServerClient()
  const service = new LinkService(supabase)

  // Parse request body
  const body = await request.json()
  const { teste_aplicado_id, expira_em, requer_codigo } = body

  if (!teste_aplicado_id || !expira_em) {
    return NextResponse.json(
      { error: 'Dados incompletos. Necessário: teste_aplicado_id, expira_em' },
      { status: 400 }
    )
  }

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Generate link
  const result = await service.generateToken(
    teste_aplicado_id,
    new Date(expira_em),
    session.id,
    ip,
    userAgent,
    requer_codigo || false
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data, { status: 201 })
}
