import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { UserRepository } from '@/lib/repositories/UserRepository'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/supabase/helpers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'AUTH_001', message: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Query user by email (using admin client to bypass RLS)
    const userRepository = new UserRepository(supabaseAdmin)
    const result = await userRepository.findByEmail(email.toLowerCase().trim())

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: 'AUTH_002', message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    const user = result.data

    // Check if account is active
    if (!user.ativo) {
      return NextResponse.json(
        { error: 'AUTH_003', message: 'Conta desativada. Entre em contato com o administrador.' },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.senha_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'AUTH_002', message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Update last access
    await (supabaseAdmin as any)
      .from('users')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', user.id)

    // Create session using SessionManager
    const sessionResult = await SessionManager.create({
      id: user.id,
      email: user.email,
      nome: user.nome_completo,
      roles: user.roles,
      clinica_id: user.clinica_id,
    })

    if (!sessionResult.success) {
      return NextResponse.json(
        { error: 'AUTH_004', message: 'Erro ao criar sessão' },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog({
      usuario_id: user.id,
      acao: 'login' as any,
      entidade: 'auth',
      entidade_id: user.id,
      dados_anteriores: null,
      dados_novos: { email: user.email },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome_completo,
        roles: user.roles,
        clinica_id: user.clinica_id,
      },
      token: sessionResult.data,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'AUTH_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}

