import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { HandoffService } from '@/lib/services/HandoffService'
import { validarPinSchema } from '@/lib/validations/schemas/link.schema'

/**
 * POST /api/handoff/validar-pin
 * Validate PIN to exit handoff mode
 */
export async function POST(request: NextRequest) {
  try {
    // Use admin client to bypass RLS
    const service = new HandoffService(supabaseAdmin)

    const body = await request.json()

    // Validate input
    const validation = validarPinSchema.safeParse(body)
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

    const { session_id, pin } = validation.data

    // For clinica_id, we need to get it from session context
    // Since this is called from handoff mode, we use a fallback
    const result = await service.validarPin(session_id, pin, '')

    if (!result.success) {
      const statusCode = (result.error as any).statusCode || 400
      return NextResponse.json(
        { error: result.error.code, message: result.error.message },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      valid: result.data.valid,
      remaining_attempts: result.data.remainingAttempts,
    })
  } catch (error) {
    console.error('Error validating PIN:', error)
    return NextResponse.json(
      { error: 'HANDOFF_API_002', message: 'Erro ao validar PIN' },
      { status: 500 }
    )
  }
}
