import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { LinkPacienteRepository } from '@/lib/repositories/LinkPacienteRepository'
import { LinkPacienteService } from '@/lib/services/LinkPacienteService'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createLinkPacienteSchema } from '@/lib/validations/schemas/link.schema'

/**
 * Set RLS context for the current user session
 */
async function setRlsContext(userId: string, clinicaId: string) {
  const { error } = await (supabaseAdmin as any).rpc('set_rls_context', {
    p_user_id: userId,
    p_clinica_id: clinicaId,
  })
  if (error) {
    console.error('Failed to set RLS context:', error)
    throw new Error('Failed to set security context')
  }
}

/**
 * GET /api/links-paciente
 * List all links for the clinic with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await SessionManager.requireAuth()
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error.code, message: authResult.error.message },
        { status: 401 }
      )
    }
    const session = authResult.data

    // Set RLS context for this user
    await setRlsContext(session.id, session.clinica_id)

    const repo = new LinkPacienteRepository(supabaseAdmin)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const status = searchParams.get('status') || undefined
    const pacienteId = searchParams.get('paciente_id') || undefined

    const result = await repo.findByClinica(
      session.clinica_id,
      { page, limit },
      { status, pacienteId }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.code, message: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error listing links:', error)
    return NextResponse.json(
      { error: 'LINK_API_001', message: 'Erro ao listar links' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/links-paciente
 * Create new link hub or add tests to existing active hub
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await SessionManager.requireAuth()
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error.code, message: authResult.error.message },
        { status: 401 }
      )
    }
    const session = authResult.data

    // Set RLS context for this user
    await setRlsContext(session.id, session.clinica_id)

    const service = new LinkPacienteService(supabaseAdmin)

    const body = await request.json()

    // Validate input
    const validation = createLinkPacienteSchema.safeParse(body)
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

    const { paciente_id, teste_template_ids, dias_expiracao } = validation.data

    console.log('[links-paciente] Creating link hub:', {
      pacienteId: paciente_id,
      psicologoId: session.id,
      clinicaId: session.clinica_id,
      testeTemplateIds: teste_template_ids,
      diasExpiracao: dias_expiracao,
    })

    const result = await service.createOrGetHub({
      pacienteId: paciente_id,
      psicologoId: session.id,
      clinicaId: session.clinica_id,
      testeTemplateIds: teste_template_ids,
      diasExpiracao: dias_expiracao,
    })

    if (!result.success) {
      console.error('[links-paciente] Error creating hub:', result.error)
      return NextResponse.json(
        { error: result.error.code, message: result.error.message },
        { status: 400 }
      )
    }

    // Build response with link URL and share message
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || ''
    const linkUrl = service.buildLinkUrl(result.data.link_token, baseUrl)

    // Get plain code (only available before first access)
    const codigo = result.data.codigo_acesso_plain || '******'

    const shareMessage = service.generateShareMessage(
      result.data.paciente.nome_completo,
      linkUrl,
      codigo,
      new Date(result.data.data_expiracao)
    )

    return NextResponse.json({
      ...result.data,
      link_url: linkUrl,
      share_message: shareMessage,
    })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json(
      { error: 'LINK_API_002', message: 'Erro ao criar link' },
      { status: 500 }
    )
  }
}
