import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { RegistroManualService } from '@/lib/services/RegistroManualService'
import { createServerClient } from '@/lib/supabase/server'
import type { RegistroManualInsert } from '@/types/database'

/**
 * GET /api/registros-manuais
 * List all manual records with pagination
 */
export async function GET(request: NextRequest) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const supabase = await createServerClient()
  const service = new RegistroManualService(supabase)

  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const paciente_id = searchParams.get('paciente_id') || undefined
  const psicologo_id = searchParams.get('psicologo_id') || undefined
  const tipo_teste = searchParams.get('tipo_teste') || undefined
  const data_inicio = searchParams.get('data_inicio') || undefined
  const data_fim = searchParams.get('data_fim') || undefined

  // Get manual records
  const result = await service.list({
    page,
    limit,
    paciente_id,
    psicologo_id,
    tipo_teste,
    data_inicio,
    data_fim,
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * POST /api/registros-manuais
 * Create a new manual record
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
  const service = new RegistroManualService(supabase)

  // Parse request body
  const body: RegistroManualInsert = await request.json()

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Create manual record
  const result = await service.create(body, session.id, ip, userAgent)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data, { status: 201 })
}
