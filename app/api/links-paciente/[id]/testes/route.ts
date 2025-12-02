import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/auth/SessionManager'
import { createClient } from '@/lib/supabase/server'
import { LinkPacienteService } from '@/lib/services/LinkPacienteService'
import { LinkPacienteRepository } from '@/lib/repositories/LinkPacienteRepository'
import { addTestesToLinkSchema } from '@/lib/validations/schemas/link.schema'

interface RouteParams {
  params: { id: string }
}

/**
 * POST /api/links-paciente/[id]/testes
 * Add tests to existing link hub
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await SessionManager.requireAuth()
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error.code, message: authResult.error.message },
        { status: 401 }
      )
    }
    const session = authResult.data

    const supabase = createClient()
    const service = new LinkPacienteService(supabase)
    const repo = new LinkPacienteRepository(supabase)

    const body = await request.json()

    // Validate input
    const validation = addTestesToLinkSchema.safeParse(body)
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

    // Get link to verify it exists and is active
    const linkResult = await repo.findById(params.id)
    if (!linkResult.success) {
      return NextResponse.json(
        { error: linkResult.error.code, message: linkResult.error.message },
        { status: 500 }
      )
    }

    if (!linkResult.data) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Link não encontrado' },
        { status: 404 }
      )
    }

    const link = linkResult.data

    if (link.status !== 'ativo') {
      return NextResponse.json(
        { error: 'LINK_INACTIVE', message: `Link está ${link.status}` },
        { status: 400 }
      )
    }

    // Add tests
    const addResult = await service.addTestesToHub(
      params.id,
      validation.data.teste_template_ids,
      link.paciente_id,
      session.id
    )

    if (!addResult.success) {
      return NextResponse.json(
        { error: addResult.error.code, message: addResult.error.message },
        { status: 400 }
      )
    }

    // Return updated link details
    const detailsResult = await service.getById(params.id)
    if (!detailsResult.success) {
      return NextResponse.json(
        { error: detailsResult.error.code, message: detailsResult.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(detailsResult.data)
  } catch (error) {
    console.error('Error adding tests to link:', error)
    return NextResponse.json(
      { error: 'LINK_API_006', message: 'Erro ao adicionar testes' },
      { status: 500 }
    )
  }
}
