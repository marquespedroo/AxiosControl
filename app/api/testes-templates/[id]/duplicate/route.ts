import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { TesteTemplateService } from '@/lib/services/TesteTemplateService'
import { SessionManager } from '@/lib/auth/SessionManager'

/**
 * POST /api/testes-templates/[id]/duplicate
 * Duplicate a test template
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
  const service = new TesteTemplateService(supabase)

  // Parse request body
  const { newName } = await request.json()

  if (!newName) {
    return NextResponse.json(
      { error: 'Nome do novo teste é obrigatório' },
      { status: 400 }
    )
  }

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Duplicate test template
  const result = await service.duplicate(params.id, newName, session.id, ip, userAgent)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data, { status: 201 })
}
