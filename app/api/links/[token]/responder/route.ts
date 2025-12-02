import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PUT /api/links/[token]/responder
 * Save single answer to test
 *
 * No authentication required - validates token only
 * Updates respostas JSONB and progresso
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.questao_id || body.resposta === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: questao_id, resposta' },
        { status: 400 }
      )
    }

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

    // Update respostas
    const respostasAtualizadas = {
      ...(testeAplicado.respostas as Record<string, any> || {}),
      [body.questao_id]: body.resposta
    }

    // Calculate progress (simple count)
    // TODO: Calculate percentage based on total questions
    const totalRespostas = Object.keys(respostasAtualizadas).length

    // Update teste aplicado
    const { error: updateError } = await supabase
      .from('testes_aplicados')
      .update({
        respostas: respostasAtualizadas,
        progresso: totalRespostas,
        status: 'em_andamento',
        data_primeiro_acesso: testeAplicado.data_primeiro_acesso || new Date().toISOString()
      })
      .eq('id', testeAplicado.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao salvar resposta' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      progresso: totalRespostas,
      total_respostas: totalRespostas
    })
  } catch (error) {
    console.error('[API] Error saving answer:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
