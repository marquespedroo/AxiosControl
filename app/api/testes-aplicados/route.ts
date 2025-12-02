import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { createAuditLog } from '@/lib/supabase/helpers'
import { SessionManager } from '@/lib/auth/SessionManager'
import crypto from 'crypto'

// GET /api/testes-aplicados - List applied tests with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const authResult = await SessionManager.requireAuth()
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

    // Filter parameters
    const search = searchParams.get('search') || ''
    const testeTemplateId = searchParams.get('teste_template_id') || ''
    const status = searchParams.get('status') || ''
    const dataInicio = searchParams.get('data_inicio') || ''
    const dataFim = searchParams.get('data_fim') || ''
    const dataEspecifica = searchParams.get('data_especifica') || ''
    const pacienteId = searchParams.get('paciente_id') || ''

    const offset = (page - 1) * limit

    // Build query - get tests from user's clinic with patient and test template names
    let query = supabaseAdmin
      .from('testes_aplicados')
      .select(`
        *,
        paciente:paciente_id(id, nome_completo, clinica_id),
        teste_template:teste_template_id(id, nome, sigla, questoes)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply server-side filters
    if (testeTemplateId) {
      query = query.eq('teste_template_id', testeTemplateId)
    }

    if (status) {
      // Support multiple statuses separated by comma
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean)
      if (statuses.length === 1) {
        query = query.eq('status', statuses[0])
      } else if (statuses.length > 1) {
        query = query.in('status', statuses)
      }
    }

    if (pacienteId) {
      query = query.eq('paciente_id', pacienteId)
    }

    // Date filters - specific date takes precedence
    // Note: Input dates are in YYYY-MM-DD format from the date picker
    // We treat the selected date as the user's local date (Brazil timezone, UTC-3)
    // So we need to convert to UTC by adding 3 hours to the start of day
    // Brazil timezone offset: UTC-3 (standard) / UTC-2 (daylight saving - not used since 2019)
    const BRAZIL_OFFSET_HOURS = 3

    if (dataEspecifica) {
      // Filter for a specific day in Brazil timezone
      // Start of day in Brazil (00:00 BRT) = 03:00 UTC
      // End of day in Brazil (23:59:59 BRT) = 02:59:59 UTC next day
      const [year, month, day] = dataEspecifica.split('-').map(Number)
      const startOfDay = new Date(Date.UTC(year, month - 1, day, BRAZIL_OFFSET_HOURS, 0, 0, 0))
      const endOfDay = new Date(Date.UTC(year, month - 1, day + 1, BRAZIL_OFFSET_HOURS - 1, 59, 59, 999))

      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
    } else {
      // Date range filters
      if (dataInicio) {
        const [year, month, day] = dataInicio.split('-').map(Number)
        const startDate = new Date(Date.UTC(year, month - 1, day, BRAZIL_OFFSET_HOURS, 0, 0, 0))
        query = query.gte('created_at', startDate.toISOString())
      }

      if (dataFim) {
        const [year, month, day] = dataFim.split('-').map(Number)
        const endDate = new Date(Date.UTC(year, month - 1, day + 1, BRAZIL_OFFSET_HOURS - 1, 59, 59, 999))
        query = query.lte('created_at', endDate.toISOString())
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'TEST_001', message: 'Erro ao buscar testes aplicados', details: error.message },
        { status: 500 }
      )
    }

    console.log('[API] GET /api/testes-aplicados - Query returned', data?.length || 0, 'tests')

    // Filter by clinic and transform data to include paciente_nome and teste_nome
    let filteredData = (data || [])
      .filter(teste => teste.paciente?.clinica_id === user.clinica_id)

    console.log('[API] GET /api/testes-aplicados - After clinic filter:', filteredData.length, 'tests for clinic', user.clinica_id)

    const enrichedData = filteredData.map(teste => ({
      ...teste,
      paciente_nome: teste.paciente?.nome_completo || 'Paciente não encontrado',
      teste_nome: teste.teste_template?.nome || 'Teste não encontrado',
      teste_sigla: teste.teste_template?.sigla || '',
      data_aplicacao: teste.created_at,
    }))

    // Apply text search filter (client-side for flexibility)
    let resultData = enrichedData

    // Apply text search filter (client-side for flexibility)
    if (search) {
      const searchLower = search.toLowerCase()
      resultData = enrichedData.filter(teste =>
        teste.paciente_nome.toLowerCase().includes(searchLower) ||
        teste.teste_nome.toLowerCase().includes(searchLower) ||
        teste.teste_sigla.toLowerCase().includes(searchLower)
      )
    }

    // Get unique test templates for filter dropdown (from all data in current page/context)
    const uniqueTemplates = [...new Map(
      enrichedData.map(item => [item.teste_template_id, {
        id: item.teste_template_id,
        nome: item.teste_nome,
        sigla: item.teste_sigla
      }])
    ).values()]

    return NextResponse.json({
      data: resultData,
      meta: {
        total: resultData.length,
        page,
        limit,
        totalPages: Math.ceil(resultData.length / limit),
      },
      filters: {
        availableTemplates: uniqueTemplates,
        availableStatuses: ['aguardando', 'em_andamento', 'completo', 'expirado']
      }
    })
  } catch (error: any) {
    console.error('GET /api/testes-aplicados error:', error)
    return NextResponse.json(
      { error: 'TEST_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/testes-aplicados - Create new test application
export async function POST(request: NextRequest) {
  try {
    const authResult = await SessionManager.requireAuth()
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'AUTH_004', message: 'Token não fornecido ou inválido' },
        { status: 401 }
      )
    }

    const user = authResult.data

    const body = await request.json()

    console.log('[API] POST /api/testes-aplicados - Creating test:', {
      userId: user.id,
      clinicId: user.clinica_id,
      patientId: body.paciente_id,
      templateId: body.teste_template_id,
      tipoAplicacao: body.tipo_aplicacao
    })

    // Validate required fields
    if (!body.paciente_id || !body.teste_template_id || !body.tipo_aplicacao) {
      return NextResponse.json(
        { error: 'TEST_001', message: 'Campos obrigatórios faltando: paciente_id, teste_template_id, tipo_aplicacao' },
        { status: 400 }
      )
    }

    // Verify patient belongs to same clinic
    const { data: paciente, error: pacienteError } = await supabaseAdmin
      .from('pacientes')
      .select('clinica_id')
      .eq('id', body.paciente_id)
      .single()

    if (pacienteError || !paciente || paciente.clinica_id !== user.clinica_id) {
      return NextResponse.json(
        { error: 'TEST_002', message: 'Paciente não encontrado ou não pertence à sua clínica' },
        { status: 404 }
      )
    }

    // Get test template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('testes_templates')
      .select('questoes')
      .eq('id', body.teste_template_id)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'TEST_003', message: 'Template de teste não encontrado' },
        { status: 404 }
      )
    }

    // Generate link token and access code for remote tests
    const linkToken = body.tipo_aplicacao === 'remota'
      ? crypto.randomBytes(25).toString('hex')
      : null

    const codigoAcesso = body.tipo_aplicacao === 'remota'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : null

    // Calculate expiration date (30 days from now)
    const dataExpiracao = body.tipo_aplicacao === 'remota'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null

    // Prepare test application data
    const testeData = {
      paciente_id: body.paciente_id,
      teste_template_id: body.teste_template_id,
      psicologo_id: user.id,
      tipo_aplicacao: body.tipo_aplicacao,
      status: body.tipo_aplicacao === 'remota' ? 'aguardando' : 'em_andamento',
      respostas: {},
      pontuacao_bruta: null,
      normalizacao: null,
      interpretacao: null,
      link_token: linkToken,
      codigo_acesso: codigoAcesso,
      data_expiracao: dataExpiracao,
      tentativas_codigo: 0,
    }

    // Insert test application using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('testes_aplicados')
      .insert(testeData as any)
      .select()
      .single()

    if (error) {
      console.error('[API] Failed to create test:', error)
      return NextResponse.json(
        { error: 'TEST_004', message: 'Erro ao criar aplicação de teste', details: error.message },
        { status: 500 }
      )
    }

    console.log('[API] ✅ Test created successfully:', {
      id: data.id,
      patientId: data.paciente_id,
      templateId: data.teste_template_id,
      status: data.status
    })

    // Create audit log
    await createAuditLog({
      usuario_id: user.id,
      acao: 'criar' as any,
      entidade: 'testes_aplicados',
      entidade_id: data.id,
      dados_anteriores: null,
      dados_novos: data,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    })

    console.log('[API] Returning test instance to client')
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/testes-aplicados error:', error)
    return NextResponse.json(
      { error: 'TEST_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}
