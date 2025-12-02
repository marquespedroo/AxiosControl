import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { TagService } from '@/lib/services/TagService'
import { createServerClient } from '@/lib/supabase/server'
import type { TagInsert, CategoriaTag } from '@/types/database'

/**
 * GET /api/tags
 * List all tags with optional filters
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
  const service = new TagService(supabase)

  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '100')
  const search = searchParams.get('search') || undefined
  const categoria = searchParams.get('categoria') as CategoriaTag | undefined
  const ativo = searchParams.get('ativo') === 'true' ? true : searchParams.get('ativo') === 'false' ? false : undefined
  const grouped = searchParams.get('grouped') === 'true'
  const withCount = searchParams.get('withCount') === 'true'

  // Return grouped by category if requested
  if (grouped) {
    const result = await service.getAllGroupedByCategory()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode || 500 }
      )
    }

    return NextResponse.json(result.data)
  }

  // Return with test count if requested
  if (withCount) {
    const result = await service.getAllWithCount()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode || 500 }
      )
    }

    return NextResponse.json({ data: result.data })
  }

  // Get tags with pagination
  const result = await service.list({
    page,
    limit,
    search,
    categoria,
    ativo,
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
 * POST /api/tags
 * Create a new tag
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

  const supabase = await createServerClient()
  const service = new TagService(supabase)

  // Parse request body
  const body: TagInsert = await request.json()

  // Auto-generate slug if not provided
  if (!body.slug && body.nome) {
    body.slug = service.generateSlug(body.nome)
  }

  // Create tag
  const result = await service.create(body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data, { status: 201 })
}
