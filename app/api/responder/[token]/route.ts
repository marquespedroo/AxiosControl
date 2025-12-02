import crypto from 'crypto'

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { LinkPacienteService } from '@/lib/services/LinkPacienteService'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface RouteParams {
  params: { token: string }
}

/**
 * GET /api/responder/[token]
 * Get link info and tests for patient portal
 * Patient must have validated access first
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('patient_session')

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'AUTH_REQUIRED', message: 'Senha necessária' },
        { status: 403 }
      )
    }

    const [cookieToken, signature] = sessionCookie.value.split('.')

    // Verify token matches URL
    if (cookieToken !== params.token) {
      return NextResponse.json(
        { error: 'INVALID_SESSION', message: 'Sessão inválida' },
        { status: 403 }
      )
    }

    // Verify signature
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key'
    const expectedSignature = crypto.createHmac('sha256', secret).update(cookieToken).digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'INVALID_SIGNATURE', message: 'Assinatura inválida' },
        { status: 403 }
      )
    }

    // Use admin client to bypass RLS since this is a public access point (with token security)
    const service = new LinkPacienteService(supabaseAdmin)

    // Get link details by token
    const result = await service.getByToken(params.token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.code, message: result.error.message },
        { status: 500 }
      )
    }

    if (!result.data) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Link não encontrado' },
        { status: 404 }
      )
    }

    const link = result.data

    // Check if link is still valid
    if (link.status !== 'ativo') {
      return NextResponse.json(
        { error: 'LINK_INACTIVE', message: `Link está ${link.status}` },
        { status: 403 }
      )
    }

    if (new Date(link.data_expiracao) < new Date()) {
      return NextResponse.json(
        { error: 'LINK_EXPIRED', message: 'Link expirado' },
        { status: 403 }
      )
    }

    if (link.bloqueado) {
      return NextResponse.json(
        { error: 'LINK_BLOCKED', message: 'Link bloqueado' },
        { status: 403 }
      )
    }

    // Return link info without sensitive data
    // Patient should NOT see: results, interpretation, scores
    const sanitizedTestes = link.testes.map(t => ({
      id: t.id,
      teste_aplicado_id: t.teste_aplicado.id,
      ordem: t.ordem,
      status: t.teste_aplicado.status,
      progresso: t.teste_aplicado.progresso,
      teste_nome: t.teste_template.nome,
      teste_sigla: t.teste_template.sigla,
      // Explicitly NOT including: pontuacao_bruta, normalizacao, interpretacao
    }))

    return NextResponse.json({
      paciente_nome: link.paciente.nome_completo.split(' ')[0], // First name only for privacy
      total_testes: link.total_testes,
      testes_completos: link.testes_completos,
      progresso_geral: link.progresso_geral,
      testes: sanitizedTestes,
      data_expiracao: link.data_expiracao,
    })
  } catch (error) {
    console.error('Error getting link for patient:', error)
    return NextResponse.json(
      { error: 'RESP_API_002', message: 'Erro ao buscar dados' },
      { status: 500 }
    )
  }
}
