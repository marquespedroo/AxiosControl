import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/auth/SessionManager'

export async function GET(_request: NextRequest) {
  try {
    // Get and verify session
    const sessionResult = await SessionManager.getSession()

    if (!sessionResult.success) {
      return NextResponse.json(
        { error: 'AUTH_004', message: 'Sessão inválida ou expirada' },
        { status: 401 }
      )
    }

    const session = sessionResult.data

    return NextResponse.json({
      user: {
        id: session.id,
        email: session.email,
        nome: session.nome,
        roles: session.roles,
        clinica_id: session.clinica_id,
        is_super_admin: session.roles.includes('super_admin'),
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'AUTH_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}
