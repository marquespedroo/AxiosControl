import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { HandoffService } from '@/lib/services/HandoffService'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { iniciarHandoffSchema } from '@/lib/validations/schemas/link.schema'

/**
 * POST /api/handoff/iniciar
 * Initialize handoff session with PIN
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

    // Use admin client to bypass RLS when reading testes_aplicados
    const service = new HandoffService(supabaseAdmin)

    const body = await request.json()

    console.log('[API] POST /api/handoff/iniciar - Request body:', {
      teste_aplicado_id: body.teste_aplicado_id,
      pin: body.pin ? '****' : undefined,
      clinica_id: session.clinica_id
    })

    // Validate input
    const validation = iniciarHandoffSchema.safeParse(body)
    if (!validation.success) {
      console.log('[API] Validation failed:', validation.error.flatten().fieldErrors)
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { teste_aplicado_id, pin } = validation.data

    console.log('[API] Starting handoff session for teste:', teste_aplicado_id)

    const result = await service.iniciarSessao(
      teste_aplicado_id,
      pin,
      session.clinica_id
    )

    if (!result.success) {
      console.log('[API] Handoff session failed:', result.error.code, result.error.message)
      return NextResponse.json(
        { error: result.error.code, message: result.error.message },
        { status: 400 }
      )
    }

    console.log('[API] ✅ Handoff session created:', result.data.sessionId)

    return NextResponse.json({
      success: true,
      session_id: result.data.sessionId,
      teste: {
        id: result.data.teste.id,
        status: result.data.teste.status,
        progresso: result.data.teste.progresso,
      },
    })
  } catch (error) {
    console.error('Error starting handoff:', error)
    return NextResponse.json(
      { error: 'HANDOFF_API_001', message: 'Erro ao iniciar modo entrega' },
      { status: 500 }
    )
  }
}
