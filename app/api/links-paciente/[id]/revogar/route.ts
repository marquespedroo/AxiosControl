import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/auth/SessionManager'
import { createClient } from '@/lib/supabase/server'
import { LinkPacienteService } from '@/lib/services/LinkPacienteService'

interface RouteParams {
  params: { id: string }
}

/**
 * POST /api/links-paciente/[id]/revogar
 * Revoke link and mark incomplete tests as abandoned
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
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

    return NextResponse.json({ success: true, message: 'Link revogado com sucesso' })
  } catch (error) {
    console.error('Error revoking link:', error)
    return NextResponse.json(
      { error: 'LINK_API_008', message: 'Erro ao revogar link' },
      { status: 500 }
    )
  }
}
