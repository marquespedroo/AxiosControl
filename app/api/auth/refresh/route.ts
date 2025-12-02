import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/auth/SessionManager'

export async function POST(_request: NextRequest) {
  try {
    // Refresh session
    const refreshResult = await SessionManager.refresh()

    if (!refreshResult.success) {
      return NextResponse.json(
        { error: 'AUTH_005', message: 'Falha ao renovar sessão' },
        { status: 401 }
      )
    }

    // Get updated session
    const sessionResult = await SessionManager.getSession()

    if (!sessionResult.success) {
      return NextResponse.json(
        { error: 'AUTH_006', message: 'Falha ao obter sessão renovada' },
        { status: 500 }
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
      },
      token: refreshResult.data,
    })
  } catch (error: any) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'AUTH_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}
