import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/auth/SessionManager'
import { createClient } from '@/lib/supabase/server'
import { LinkPacienteService } from '@/lib/services/LinkPacienteService'
import { LinkPacienteRepository } from '@/lib/repositories/LinkPacienteRepository'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/links-paciente/[id]
 * Get link details with tests and progress
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await SessionManager.requireAuth()
    const supabase = createClient()
    const service = new LinkPacienteService(supabase)

    const result = await service.getById(params.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.code, message: result.error.message },
        { status: 500 }
      )
    }

    if (!result.data) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Link não encontrado' },
        { status: 404 }
      )
    }

    // Build link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || ''
    const linkUrl = service.buildLinkUrl(result.data.link_token, baseUrl)

    return NextResponse.json({
      ...result.data,
      link_url: linkUrl,
    })
  } catch (error) {
    console.error('Error getting link:', error)
    return NextResponse.json(
      { error: 'LINK_API_003', message: 'Erro ao buscar link' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/links-paciente/[id]
 * Update link (extend expiration, etc.)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await SessionManager.requireAuth()
    const supabase = createClient()
    const repo = new LinkPacienteRepository(supabase)

    const body = await request.json()

    const result = await repo.update(params.id, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.code, message: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error updating link:', error)
    return NextResponse.json(
      { error: 'LINK_API_004', message: 'Erro ao atualizar link' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/links-paciente/[id]
 * Revoke link (soft delete)
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await SessionManager.requireAuth()
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error.code, message: authResult.error.message },
        { status: 401 }
      )
    }
    const supabase = createClient()
    const service = new LinkPacienteService(supabase)

    const result = await service.revogar(params.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.code, message: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking link:', error)
    return NextResponse.json(
      { error: 'LINK_API_005', message: 'Erro ao revogar link' },
      { status: 500 }
    )
  }
}
