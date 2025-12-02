import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { LinkService } from '@/lib/services/LinkService'

/**
 * GET /api/links/[token]
 * Validate access link token
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = await createServerClient()
  const service = new LinkService(supabase)

  const result = await service.validate(params.token)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * POST /api/links/[token]
 * Authenticate with token and optional code
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = await createServerClient()
  const service = new LinkService(supabase)

  // Parse request body for optional code
  const body = await request.json()
  const { codigo } = body

  const result = await service.authenticate(params.token, codigo)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data)
}
