import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/links/[token]/questoes
 * Fetch test questions for public test response
 *
 * No authentication required - validates token only
 * Returns test template with questions array
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createClient()

    // Find teste_aplicado by token
    const { data: testeData, error: testeError } = await supabase
      .from('testes_aplicados')
      .select('*, teste_templates(*)')
      .eq('link_token', params.token)
      .single()

    const testeAplicado = testeData as any

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

    // Check expiration (if applicable)
    // TODO: Add expiration check based on expira_em field

    // Get test template
    const template = (testeAplicado as any).teste_templates

    if (!template) {
      return NextResponse.json(
        { error: 'Template de teste não encontrado' },
        { status: 404 }
      )
    }

    // Return template with questions (don't expose answer keys)
    const response = {
      teste_aplicado_id: testeAplicado.id,
      teste_template: {
        id: template.id,
        nome: template.nome,
        sigla: template.sigla,
        tipo: template.tipo,
        questoes: template.questoes, // Full questions array
        escalas_resposta: template.escalas_resposta
        // Don't send regras_calculo to client
      },
      progresso: testeAplicado.progresso,
      respostas_existentes: testeAplicado.respostas || {}
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[API] Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
