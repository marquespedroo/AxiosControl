import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { TagService } from '@/lib/services/TagService'
import { createServerClient } from '@/lib/supabase/server'
import type { TagUpdate } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/tags/[id]
 * Get a single tag by ID or slug
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

  // Check if ID is a UUID or a slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  const result = isUUID
    ? await service.getById(id)
    : await service.getBySlug(id)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * PUT /api/tags/[id]
 * Update a tag
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
  const body: TagUpdate = await request.json()

  // Update tag
  const result = await service.update(id, body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * DELETE /api/tags/[id]
 * Delete a tag (soft delete)
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

  // Delete tag
  const result = await service.delete(id)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json({ success: true })
}
