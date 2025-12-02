import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { createAuditLog } from '@/lib/supabase/helpers'
import { PacienteInsert } from '@/types/database'
import { getAuthUser } from '@/lib/auth/helpers'

// GET /api/pacientes - List patients with pagination and search
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'AUTH_004', message: 'Token não fornecido ou inválido' },
        { status: 401 }
      )
    }

    const user = authResult.data

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('pacientes')
      .select('*', { count: 'exact' })
      .eq('clinica_id', user.clinica_id)
      .order('nome_completo', { ascending: true })

    // Apply search filter
    if (search) {
      query = query.or(`nome_completo.ilike.%${search}%,cpf.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'PAC_001', message: 'Erro ao buscar pacientes', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('GET /api/pacientes error:', error)
    return NextResponse.json(
      { error: 'PAC_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/pacientes - Create new patient
export async function POST(request: NextRequest) {
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
    console.log('POST /api/pacientes - Request body:', JSON.stringify(body, null, 2))

    // Validate required fields
    if (!body.nome_completo || !body.data_nascimento || !body.sexo) {
      return NextResponse.json(
        { error: 'PAC_002', message: 'Campos obrigatórios faltando: nome_completo, data_nascimento, sexo' },
        { status: 400 }
      )
    }

    // Validate escolaridade: must have at least one
    if (!body.escolaridade_anos && !body.escolaridade_nivel) {
      return NextResponse.json(
        { error: 'PAC_002', message: 'Deve informar escolaridade_anos OU escolaridade_nivel' },
        { status: 400 }
      )
    }

    // Prepare patient data
    const pacienteData: PacienteInsert = {
      clinica_id: user.clinica_id,
      psicologo_responsavel_id: user.id,
      nome_completo: body.nome_completo,
      data_nascimento: body.data_nascimento,
      escolaridade_anos: body.escolaridade_anos ?? null,
      sexo: body.sexo,
      cpf: body.cpf || null,
      telefone: body.telefone || null,
      email: body.email || null,
      endereco: body.endereco || null,
      observacoes_clinicas: body.observacoes_clinicas || null,
      motivo_encaminhamento: body.motivo_encaminhamento || null,
      escolaridade_nivel: body.escolaridade_nivel || null,
      profissao: body.profissao || null,
      estado_civil: body.estado_civil || null,
      ativo: true,
    }

    // Insert patient using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('pacientes')
      .insert(pacienteData)
      .select()
      .single()

    if (error) {
      console.error('POST /api/pacientes - Supabase error:', error)
      // Check for duplicate CPF
      if (error.code === '23505' && error.message.includes('cpf')) {
        return NextResponse.json(
          { error: 'PAC_003', message: 'CPF já cadastrado' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'PAC_004', message: 'Erro ao criar paciente', details: error.message },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog({
      usuario_id: user.id,
      acao: 'criar' as any,
      entidade: 'pacientes',
      entidade_id: data.id,
      dados_anteriores: null,
      dados_novos: data,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/pacientes error:', error)
    return NextResponse.json(
      { error: 'PAC_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}
