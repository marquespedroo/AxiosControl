import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { RegistroManualService } from '@/lib/services/RegistroManualService'
import { createServerClient } from '@/lib/supabase/server'
import type { RegistroManualUpdate } from '@/types/database'

/**
 * GET /api/registros-manuais/[id]
 * Get manual record by ID
 */
export async function GET(
  _request: NextRequest,
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

  const supabase = await createServerClient()
  const service = new RegistroManualService(supabase)

  const result = await service.getById(params.id)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * PUT /api/registros-manuais/[id]
 * Update manual record
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
  const service = new RegistroManualService(supabase)

  // Parse request body
  const body: RegistroManualUpdate = await request.json()

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Update manual record
  const result = await service.update(params.id, body, session.id, ip, userAgent)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * DELETE /api/registros-manuais/[id]
 * Delete manual record
 */
export async function DELETE(
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
  const service = new RegistroManualService(supabase)

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Delete manual record
  const result = await service.delete(params.id, session.id, ip, userAgent)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 204 })
}
