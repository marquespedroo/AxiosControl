import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { TabelaNormativaService } from '@/lib/services/TabelaNormativaService'
import { SessionManager } from '@/lib/auth/SessionManager'
import type { TabelaNormativaUpdate } from '@/types/database'

/**
 * GET /api/tabelas-normativas/[id]
 * Get normative table by ID
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
  const service = new TabelaNormativaService(supabase)

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
 * PUT /api/tabelas-normativas/[id]
 * Update normative table
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
  const service = new TabelaNormativaService(supabase)

  // Parse request body
  const body: TabelaNormativaUpdate = await request.json()

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Update normative table
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
 * DELETE /api/tabelas-normativas/[id]
 * Delete normative table
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
  const service = new TabelaNormativaService(supabase)

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Delete normative table
  const result = await service.delete(params.id, session.id, ip, userAgent)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 204 })
}
