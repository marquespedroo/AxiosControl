import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { TesteTemplateService } from '@/lib/services/TesteTemplateService'
import { SessionManager } from '@/lib/auth/SessionManager'

interface RestoreVersionBody {
  versionId: string
}

/**
 * POST /api/testes-templates/[id]/restore
 * Restore a previous version of a test template
 * Creates a new version based on the specified version's content
 */
export async function POST(
  request: NextRequest,
  _context: { params: { id: string } }
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
  let body: RestoreVersionBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisição inválido' },
      { status: 400 }
    )
  }

  // Validate required fields
  if (!body.versionId) {
    return NextResponse.json(
      { error: 'ID da versão é obrigatório' },
      { status: 400 }
    )
  }

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Restore version
  const result = await service.restoreVersion(
    body.versionId,
    session.id,
    ip,
    userAgent
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data, { status: 201 })
}
