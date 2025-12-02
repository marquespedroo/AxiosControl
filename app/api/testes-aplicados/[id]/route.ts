import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth/helpers'
import { supabaseAdmin } from '@/lib/supabase/client'
import { createAuditLog } from '@/lib/supabase/helpers'

// GET /api/testes-aplicados/[id] - Get test with questions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthUser(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'AUTH_004', message: 'Token não fornecido ou inválido' },
        { status: 401 }
      )
    }

    const user = authResult.data

    console.log('[API] GET /api/testes-aplicados/[id]:', {
      testId: params.id,
      userId: user.id,
      clinicId: user.clinica_id
    })

    // Get test application with template
    const { data: teste, error } = await supabaseAdmin
      .from('testes_aplicados')
      .select(`
        *,
        teste_template:teste_template_id (
          id,
          nome,
          sigla,
          tipo,
          questoes,
          escalas_resposta,
          regras_calculo,
          interpretacao,
          tempo_medio_aplicacao
        ),
        paciente:paciente_id (
          id,
          nome_completo,
          data_nascimento,
          escolaridade_anos,
          sexo
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('[API] Supabase query error:', error)
      return NextResponse.json(
        { error: 'TEST_005', message: 'Teste não encontrado', details: error.message },
        { status: 404 }
      )
    }

    if (!teste) {
      console.error('[API] Test not found in database, ID:', params.id)
      return NextResponse.json(
        { error: 'TEST_005', message: 'Teste não encontrado' },
        { status: 404 }
      )
    }

    console.log('[API] Test found:', {
      id: teste.id,
      template_id: teste.teste_template_id,
      patient_id: teste.paciente_id,
      status: teste.status,
      has_template_data: !!teste.teste_template,
      has_patient_data: !!teste.paciente
    })

    // Verify test belongs to user's clinic
    const { data: paciente } = await supabaseAdmin
      .from('pacientes')
      .select('clinica_id')
      .eq('id', teste.paciente_id)
      .single()

    console.log('[API] Clinic verification:', {
      patient_clinic: paciente?.clinica_id,
      user_clinic: user.clinica_id,
      match: paciente?.clinica_id === user.clinica_id
    })

    if (!paciente || paciente.clinica_id !== user.clinica_id) {
      console.error('[API] Access denied: clinic mismatch')
      return NextResponse.json(
        { error: 'TEST_006', message: 'Acesso negado' },
        { status: 403 }
      )
    }

    console.log('[API] ✅ Returning test data successfully')
    return NextResponse.json(teste)
  } catch (error: any) {
    console.error('GET /api/testes-aplicados/[id] error:', error)
    return NextResponse.json(
      { error: 'TEST_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/testes-aplicados/[id] - Save responses (progressive)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthUser(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'AUTH_004', message: 'Token não fornecido ou inválido' },
        { status: 401 }
      )
    }

    const user = authResult.data
    const body = await request.json()

    // Get existing test
    const { data: existingTest, error: fetchError } = await supabaseAdmin
      .from('testes_aplicados')
      .select('*, paciente:paciente_id(clinica_id)')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingTest) {
      return NextResponse.json(
        { error: 'TEST_005', message: 'Teste não encontrado' },
        { status: 404 }
      )
    }

    // Verify access
    if (existingTest.paciente.clinica_id !== user.clinica_id) {
      return NextResponse.json(
        { error: 'TEST_006', message: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Update responses
    const updateData: any = {}

    if (body.respostas !== undefined) {
      updateData.respostas = body.respostas
    }

    if (body.status !== undefined) {
      updateData.status = body.status
    }

    if (body.observacoes !== undefined) {
      updateData.observacoes = body.observacoes
    }

    // Update test using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('testes_aplicados')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'TEST_007', message: 'Erro ao atualizar teste', details: error.message },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog({
      usuario_id: user.id,
      acao: 'criar' as any,
      entidade: 'testes_aplicados',
      entidade_id: params.id,
      dados_anteriores: existingTest,
      dados_novos: data,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('PUT /api/testes-aplicados/[id] error:', error)
    return NextResponse.json(
      { error: 'TEST_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/testes-aplicados/[id] - Delete a test
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthUser(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'AUTH_004', message: 'Token não fornecido ou inválido' },
        { status: 401 }
      )
    }

    const user = authResult.data

    // Get existing test to verify ownership
    const { data: existingTest, error: fetchError } = await supabaseAdmin
      .from('testes_aplicados')
      .select('*, paciente:paciente_id(clinica_id)')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingTest) {
      return NextResponse.json(
        { error: 'TEST_005', message: 'Teste não encontrado' },
        { status: 404 }
      )
    }

    // Verify access - must belong to user's clinic
    if (existingTest.paciente.clinica_id !== user.clinica_id) {
      return NextResponse.json(
        { error: 'TEST_006', message: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Don't allow deleting completed tests
    if (existingTest.status === 'completo') {
      return NextResponse.json(
        { error: 'TEST_008', message: 'Não é possível excluir um teste já finalizado' },
        { status: 400 }
      )
    }

    // Delete the test
    const { error: deleteError } = await supabaseAdmin
      .from('testes_aplicados')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting test:', deleteError)
      return NextResponse.json(
        { error: 'TEST_009', message: 'Erro ao excluir teste', details: deleteError.message },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog({
      usuario_id: user.id,
      acao: 'excluir' as any,
      entidade: 'testes_aplicados',
      entidade_id: params.id,
      dados_anteriores: existingTest,
      dados_novos: null,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ success: true, message: 'Teste excluído com sucesso' })
  } catch (error: any) {
    console.error('DELETE /api/testes-aplicados/[id] error:', error)
    return NextResponse.json(
      { error: 'TEST_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}
