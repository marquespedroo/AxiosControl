import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { UserService } from '@/lib/services/UserService'

/**
 * GET /api/psicologos
 * List users with filters
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
      return NextResponse.json({ error: sessionResult.error.message }, { status: 401 })
    }
    const session = sessionResult.data
    const isSuperAdmin = session.roles.includes('super_admin')

    const searchParams = request.nextUrl.searchParams
    let clinica_id = searchParams.get('clinica_id') || undefined
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role') || undefined

    // Enforce clinic filter for non-superadmins
    if (!isSuperAdmin) {
      clinica_id = session.clinica_id
    }

    const service = new UserService()
    const result = await service.list({ clinica_id, search, page, limit })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    let users = result.data.data

    // Filter by role if provided
    if (role) {
      users = users.filter(u => u.roles?.includes(role as any))
    }

    return NextResponse.json({
      data: users,
      meta: result.data.meta
    })
  } catch (error) {
    console.error('[API] Error listing users:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/psicologos
 * Create new user
 */
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await SessionManager.requireRole(['super_admin', 'clinic_admin'])
    if (!sessionResult.success) {
      return NextResponse.json({ error: sessionResult.error.message }, { status: 403 })
    }
    const session = sessionResult.data
    const isSuperAdmin = session.roles.includes('super_admin')

    const body = await request.json()

    // Enforce clinic_id for non-superadmins
    if (!isSuperAdmin) {
      body.clinica_id = session.clinica_id
    }

    // Validate required fields
    const requiredFields = ['clinica_id', 'nome_completo', 'email', 'password'] // Changed senha to password to match frontend
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate CRP only if role includes psychologist
    if (body.roles?.includes('psychologist')) {
      // CRP is optional for now as per user request flow, or we can enforce it. 
      // Given the UI doesn't ask for CRP in TeamPage, we should probably make it optional or handle it later.
      // The TeamPage dialog DOES NOT have CRP fields. 
      // So we should probably NOT enforce CRP here for now, or the user creation will fail.
    }

    const service = new UserService()
    const result = await service.create({
      ...body,
      senha: body.password, // Map password to senha
      roles: body.roles || ['psychologist']
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error('[API] Error creating user:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
