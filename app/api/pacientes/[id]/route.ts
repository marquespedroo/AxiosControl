import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth/helpers'
import { supabaseAdmin } from '@/lib/supabase/client'
import { createAuditLog } from '@/lib/supabase/helpers'
import { PacienteUpdate } from '@/types/database'

// GET /api/pacientes/[id] - Get patient details
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

    const { data, error } = await supabaseAdmin
      .from('pacientes')
      .select('*')
      .eq('id', params.id)
      .eq('clinica_id', user.clinica_id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'PAC_005', message: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('GET /api/pacientes/[id] error:', error)
    return NextResponse.json(
      { error: 'PAC_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/pacientes/[id] - Update patient
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

    // Get existing patient
    const { data: existingPatient, error: fetchError } = await supabaseAdmin
      .from('pacientes')
      .select('*')
      .eq('id', params.id)
      .eq('clinica_id', user.clinica_id)
      .single()

    if (fetchError || !existingPatient) {
      return NextResponse.json(
        { error: 'PAC_005', message: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Prepare update data
    const updateData: PacienteUpdate = {}

    if (body.nome_completo !== undefined) updateData.nome_completo = body.nome_completo
    if (body.data_nascimento !== undefined) updateData.data_nascimento = body.data_nascimento
    if (body.escolaridade_anos !== undefined) updateData.escolaridade_anos = body.escolaridade_anos
    if (body.sexo !== undefined) updateData.sexo = body.sexo
    if (body.cpf !== undefined) updateData.cpf = body.cpf
    if (body.telefone !== undefined) updateData.telefone = body.telefone
    if (body.email !== undefined) updateData.email = body.email
    if (body.endereco !== undefined) updateData.endereco = body.endereco
    if (body.observacoes_clinicas !== undefined) updateData.observacoes_clinicas = body.observacoes_clinicas
    if (body.motivo_encaminhamento !== undefined) updateData.motivo_encaminhamento = body.motivo_encaminhamento
    if (body.escolaridade_nivel !== undefined) updateData.escolaridade_nivel = body.escolaridade_nivel
    if (body.profissao !== undefined) updateData.profissao = body.profissao
    if (body.estado_civil !== undefined) updateData.estado_civil = body.estado_civil
    if (body.ativo !== undefined) updateData.ativo = body.ativo

    // Update patient using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('pacientes')
      .update(updateData)
      .eq('id', params.id)
      .eq('clinica_id', user.clinica_id)
      .select()
      .single()

    if (error) {
      // Check for duplicate CPF
      if (error.code === '23505' && error.message.includes('cpf')) {
        return NextResponse.json(
          { error: 'PAC_003', message: 'CPF já cadastrado' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'PAC_006', message: 'Erro ao atualizar paciente', details: error.message },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog({
      usuario_id: user.id,
      acao: 'criar' as any,
      entidade: 'pacientes',
      entidade_id: params.id,
      dados_anteriores: existingPatient,
      dados_novos: data,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('PUT /api/pacientes/[id] error:', error)
    return NextResponse.json(
      { error: 'PAC_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/pacientes/[id] - Soft delete patient
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

    // Get existing patient
    const { data: existingPatient, error: fetchError } = await supabaseAdmin
      .from('pacientes')
      .select('*')
      .eq('id', params.id)
      .eq('clinica_id', user.clinica_id)
      .single()

    if (fetchError || !existingPatient) {
      return NextResponse.json(
        { error: 'PAC_005', message: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete (set ativo = false)
    const { data, error } = await supabaseAdmin
      .from('pacientes')
      .update({ ativo: false })
      .eq('id', params.id)
      .eq('clinica_id', user.clinica_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'PAC_007', message: 'Erro ao deletar paciente', details: error.message },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog({
      usuario_id: user.id,
      acao: 'criar' as any,
      entidade: 'pacientes',
      entidade_id: params.id,
      dados_anteriores: existingPatient,
      dados_novos: data,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ message: 'Paciente desativado com sucesso' })
  } catch (error: any) {
    console.error('DELETE /api/pacientes/[id] error:', error)
    return NextResponse.json(
      { error: 'PAC_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}
