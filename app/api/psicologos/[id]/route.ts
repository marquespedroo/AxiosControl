import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { UserService } from '@/lib/services/UserService'

/**
 * GET /api/psicologos/[id]
 * Get psychologist by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
      return NextResponse.json({ error: sessionResult.error.message }, { status: 401 })
    }

    const service = new UserService()
    const result = await service.get(params.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('[API] Error getting psicologo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/psicologos/[id]
 * Update psychologist
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await SessionManager.requireRole(['super_admin', 'clinic_admin'])
    if (!sessionResult.success) {
      return NextResponse.json({ error: sessionResult.error.message }, { status: 403 })
    }
    const session = sessionResult.data
    const isSuperAdmin = session.roles.includes('super_admin')

    const body = await request.json()

    // Prevent non-superadmins from changing clinic_id
    if (!isSuperAdmin) {
      delete body.clinica_id
    }

    const service = new UserService()

    // Check if user belongs to the same clinic (if not super admin)
    if (!isSuperAdmin) {
      const userResult = await service.get(params.id)
      if (userResult.success && userResult.data.clinica_id !== session.clinica_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    const result = await service.update(params.id, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('[API] Error updating psicologo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/psicologos/[id]
 * Soft delete psychologist (set ativo = false)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await SessionManager.requireRole(['super_admin', 'clinic_admin'])
    if (!sessionResult.success) {
      return NextResponse.json({ error: sessionResult.error.message }, { status: 403 })
    }
    const session = sessionResult.data
    const isSuperAdmin = session.roles.includes('super_admin')

    const service = new UserService()

    // Check if user belongs to the same clinic (if not super admin)
    if (!isSuperAdmin) {
      const userResult = await service.get(params.id)
      if (userResult.success && userResult.data.clinica_id !== session.clinica_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    const result = await service.delete(params.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error deleting psicologo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
