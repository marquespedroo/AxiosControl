import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/auth/SessionManager'
import { createClient } from '@/lib/supabase/server'
import { LinkPacienteService } from '@/lib/services/LinkPacienteService'
import { extendLinkExpiracaoSchema } from '@/lib/validations/schemas/link.schema'

interface RouteParams {
  params: { id: string }
}

/**
 * POST /api/links-paciente/[id]/estender
 * Extend link expiration by specified days
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await SessionManager.requireAuth()
    const supabase = createClient()
    const service = new LinkPacienteService(supabase)

    const body = await request.json()

    // Validate input
    const validation = extendLinkExpiracaoSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const result = await service.extendExpiracao(params.id, validation.data.dias)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.code, message: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error extending link:', error)
    return NextResponse.json(
      { error: 'LINK_API_007', message: 'Erro ao estender validade' },
      { status: 500 }
    )
  }
}
