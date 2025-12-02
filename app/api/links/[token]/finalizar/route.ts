import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TesteAplicadoService } from '@/lib/services/TesteAplicadoService'

/**
 * POST /api/links/[token]/finalizar
 * Complete remote test
 *
 * No authentication required - validates token only
 * Changes status to completo, calls NormalizacaoService, saves results, blocks link
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createClient()

    // Find teste_aplicado by token
    const { data: testeAplicado, error: testeError } = await supabase
      .from('testes_aplicados')
      .select('*')
      .eq('link_token', params.token)
      .single()

    if (testeError || !testeAplicado) {
      return NextResponse.json(
        { error: 'Link inválido ou expirado' },
        { status: 404 }
      )
    }

    // Validate status
    if (testeAplicado.status === 'completo') {
      return NextResponse.json(
        { error: 'Teste já finalizado' },
        { status: 400 }
      )
    }

    // Validate all required questions answered
    // TODO: Get total questions from template and validate
    const respostas = testeAplicado.respostas as Record<string, any>
    if (!respostas || Object.keys(respostas).length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma resposta foi salva' },
        { status: 400 }
      )
    }

    // Use TesteAplicadoService to finalize (calculates scores and normalizes)
    const service = new TesteAplicadoService()
    const result = await service.finalize(testeAplicado.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    // Block link by setting ativo = false on the link
    // This prevents further access
    // TODO: If there's a separate links table, update it here

    return NextResponse.json({
      success: true,
      message: 'Teste finalizado com sucesso',
      teste_aplicado_id: testeAplicado.id
    })
  } catch (error) {
    console.error('[API] Error finalizing test:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
