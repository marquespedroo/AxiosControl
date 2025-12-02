import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { TagService } from '@/lib/services/TagService'
import { createServerClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/testes-templates/[id]/tags
 * Get all tags for a specific test template
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const { id } = await params
  const supabase = await createServerClient()
  const service = new TagService(supabase)

  // Get tags for test template
  const result = await service.getTesteTemplateTags(id)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json({ data: result.data })
}

/**
 * PUT /api/testes-templates/[id]/tags
 * Set tags for a test template (replaces all existing tags)
 * Body: { tag_ids: string[] } or { tag_slugs: string[] }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const { id } = await params
  const supabase = await createServerClient()
  const service = new TagService(supabase)

  // Parse request body
  const body = await request.json()
  const { tag_ids, tag_slugs } = body

  let result

  // Use slugs if provided, otherwise use IDs
  if (tag_slugs && Array.isArray(tag_slugs)) {
    result = await service.setTesteTagsBySlugs(id, tag_slugs)
  } else if (tag_ids && Array.isArray(tag_ids)) {
    result = await service.setTesteTags(id, tag_ids)
  } else {
    return NextResponse.json(
      { error: 'tag_ids ou tag_slugs é obrigatório' },
      { status: 400 }
    )
  }

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  // Return updated tags
  const tagsResult = await service.getTesteTemplateTags(id)

  if (!tagsResult.success) {
    return NextResponse.json(
      { error: tagsResult.error.message },
      { status: tagsResult.error.statusCode || 500 }
    )
  }

  return NextResponse.json({ data: tagsResult.data })
}

/**
 * POST /api/testes-templates/[id]/tags
 * Add a single tag to a test template
 * Body: { tag_id: string } or { tag_slug: string }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const { id } = await params
  const supabase = await createServerClient()
  const service = new TagService(supabase)

  // Parse request body
  const body = await request.json()
  const { tag_id, tag_slug } = body

  let tagId = tag_id

  // If slug is provided, resolve to ID
  if (tag_slug && !tag_id) {
    const tagResult = await service.getBySlug(tag_slug)
    if (!tagResult.success) {
      return NextResponse.json(
        { error: tagResult.error.message },
        { status: tagResult.error.statusCode || 500 }
      )
    }
    tagId = tagResult.data.id
  }

  if (!tagId) {
    return NextResponse.json(
      { error: 'tag_id ou tag_slug é obrigatório' },
      { status: 400 }
    )
  }

  // Add tag to test
  const result = await service.addTagToTeste(id, tagId)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}

/**
 * DELETE /api/testes-templates/[id]/tags
 * Remove a tag from a test template
 * Query: ?tag_id=xxx or ?tag_slug=xxx
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const { id } = await params
  const supabase = await createServerClient()
  const service = new TagService(supabase)

  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const tag_id = searchParams.get('tag_id')
  const tag_slug = searchParams.get('tag_slug')

  let tagId = tag_id

  // If slug is provided, resolve to ID
  if (tag_slug && !tag_id) {
    const tagResult = await service.getBySlug(tag_slug)
    if (!tagResult.success) {
      return NextResponse.json(
        { error: tagResult.error.message },
        { status: tagResult.error.statusCode || 500 }
      )
    }
    tagId = tagResult.data.id
  }

  if (!tagId) {
    return NextResponse.json(
      { error: 'tag_id ou tag_slug é obrigatório' },
      { status: 400 }
    )
  }

  // Remove tag from test
  const result = await service.removeTagFromTeste(id, tagId)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json({ success: true })
}
