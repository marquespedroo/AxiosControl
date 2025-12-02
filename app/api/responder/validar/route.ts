import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { LinkPacienteService } from '@/lib/services/LinkPacienteService'
import { validarAcessoSchema } from '@/lib/validations/schemas/link.schema'
import crypto from 'crypto'

/**
 * POST /api/responder/validar
 * Validate patient access with token + code
 * Returns a session token for subsequent requests
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const service = new LinkPacienteService(supabase)

    const body = await request.json()

    // Validate input
    const validation = validarAcessoSchema.safeParse(body)
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

    const { token, codigo } = validation.data

    const result = await service.validateAccess(token, codigo)

    if (!result.success) {
      const statusCode = (result.error as any).statusCode || 400
      return NextResponse.json(
        { error: result.error.code, message: result.error.message },
        { status: statusCode }
      )
    }

    // Generate patient session token
    const sessionToken = crypto.randomBytes(32).toString('hex')

    // Create signed cookie value
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key'
    const signature = crypto.createHmac('sha256', secret).update(token).digest('hex')
    const cookieValue = `${token}.${signature}`

    // Set cookie
    cookies().set('patient_session', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return NextResponse.json({
      success: true,
      session_token: sessionToken,
      link_token: token,
      is_first_access: result.data.isFirstAccess,
    })
  } catch (error) {
    console.error('Error validating access:', error)
    return NextResponse.json(
      { error: 'RESP_API_001', message: 'Erro ao validar acesso' },
      { status: 500 }
    )
  }
}
