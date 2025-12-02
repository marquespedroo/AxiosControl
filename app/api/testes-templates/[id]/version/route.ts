import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { TesteTemplateService } from '@/lib/services/TesteTemplateService'
import { createServerClient } from '@/lib/supabase/server'
import type { TesteTemplate } from '@/types/database'

interface CreateVersionBody {
  changes: Partial<TesteTemplate>
  motivo_alteracao: string
}

/**
 * PUT /api/testes-templates/[id]/version
 * Create a new version of a test template
 * This deactivates the current version and creates a new one with the changes
 */
export async function PUT(
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
  let body: CreateVersionBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisição inválido' },
      { status: 400 }
    )
  }

  // Validate required fields
  if (!body.motivo_alteracao || body.motivo_alteracao.trim().length < 3) {
    return NextResponse.json(
      { error: 'Motivo da alteração é obrigatório (mínimo 3 caracteres)' },
      { status: 400 }
    )
  }

  if (!body.changes || typeof body.changes !== 'object') {
    return NextResponse.json(
      { error: 'Alterações são obrigatórias' },
      { status: 400 }
    )
  }

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Create new version
  const result = await service.createVersion(
    params.id,
    body.changes,
    body.motivo_alteracao,
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
