import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { TesteTemplateService } from '@/lib/services/TesteTemplateService'
import { createServerClient } from '@/lib/supabase/server'
import type { TesteTemplateInsert } from '@/types/database'

/**
 * GET /api/testes-templates
 * List all test templates with pagination
 */
export async function GET(request: NextRequest) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const supabase = await createServerClient()
  const service = new TesteTemplateService(supabase)

  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || undefined
  const tipo = searchParams.get('tipo') || undefined
  const ativo = searchParams.get('ativo') === 'true' ? true : searchParams.get('ativo') === 'false' ? false : undefined
  const publico = searchParams.get('publico') === 'true' ? true : searchParams.get('publico') === 'false' ? false : undefined
  const tagsParam = searchParams.get('tags')
  const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()).filter(Boolean) : undefined

  // Get test templates
  const result = await service.list({
    page,
    limit,
    search,
    tipo,
    ativo,
    publico,
    tags,
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * POST /api/testes-templates
 * Create a new test template
 */
export async function POST(request: NextRequest) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const session = sessionResult.data
  const supabase = await createServerClient()
  const service = new TesteTemplateService(supabase)

  // Parse request body
  const body: TesteTemplateInsert = await request.json()

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Create test template
  const result = await service.create(body, session.id, ip, userAgent)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data, { status: 201 })
}
