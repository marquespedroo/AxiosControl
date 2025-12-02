import { NextRequest, NextResponse } from 'next/server'

import { TesteAplicadoService } from '@/lib/services/TesteAplicadoService'

/**
 * POST /api/testes-aplicados/[id]/reabrir
 * Reopen completed test for editing
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate motivo field
    if (!body.motivo) {
      return NextResponse.json(
        { error: 'Campo obrigatório: motivo' },
        { status: 400 }
      )
    }

    const service = new TesteAplicadoService()
    const result = await service.reopen(params.id, body.motivo)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('[API] Error reopening test:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
