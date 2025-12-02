import { NextRequest, NextResponse } from 'next/server'
import { createAuditLog } from '@/lib/supabase/helpers'
import { SessionManager } from '@/lib/auth/SessionManager'

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const sessionResult = await SessionManager.getSession()

    // Create audit log if session exists
    if (sessionResult.success) {
      const session = sessionResult.data
      await createAuditLog({
        usuario_id: session.id,
        acao: 'deletar' as any,
        entidade: 'auth',
        entidade_id: session.id,
        dados_anteriores: { email: session.email },
        dados_novos: null,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })
    }

    // Destroy session
    await SessionManager.destroy()

    return NextResponse.json(
      { message: 'Logout realizado com sucesso' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'AUTH_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}
