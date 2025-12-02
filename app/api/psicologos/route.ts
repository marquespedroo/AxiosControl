import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/UserService'

/**
 * GET /api/psicologos
 * List psychologists with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clinica_id = searchParams.get('clinica_id') || undefined
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const service = new UserService()
    // TODO: Filter by role 'psychologist' when listing
    const result = await service.list({ clinica_id, search, page, limit })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    // Filter results to only include psychologists (if not done in service/repo)
    // For now, assuming all users in this context are relevant or filtering happens in repo
    const psychologists = result.data.data.filter(u => u.roles?.includes('psychologist'))

    return NextResponse.json({
      data: psychologists,
      meta: result.data.meta
    })
  } catch (error) {
    console.error('[API] Error listing psicologos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/psicologos
 * Create new psychologist
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['clinica_id', 'nome_completo', 'email', 'senha', 'crp', 'crp_estado']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field}` },
          { status: 400 }
        )
      }
    }

    const service = new UserService()
    const result = await service.create({
      ...body,
      roles: ['psychologist']
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error('[API] Error creating psicologo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
