import { NextRequest, NextResponse } from 'next/server'

import { requireSuperAdmin } from '@/lib/middleware/requireSuperAdmin'
import { ClinicaService } from '@/lib/services/ClinicaService'
import { createServerClient } from '@/lib/supabase/server'
import type { ClinicaUpdate } from '@/types/database'

/**
 * GET /api/clinicas/[id]
 * Get clinic by ID
 * @requires Super Admin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireSuperAdmin(request, async (_req, _session) => {
    const supabase = await createServerClient()
    const service = new ClinicaService(supabase)

    const result = await service.getById(params.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode || 500 }
      )
    }

    return NextResponse.json(result.data)
  })
}

/**
 * PUT /api/clinicas/[id]
 * Update clinic
 * @requires Super Admin
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireSuperAdmin(request, async (req, session) => {
    const supabase = await createServerClient()
    const service = new ClinicaService(supabase)

    // Parse request body
    const body: ClinicaUpdate = await req.json()

    // Get IP and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    const userAgent = req.headers.get('user-agent') || ''

    // Update clinic
    const result = await service.update(params.id, body, session.id, ip, userAgent)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode || 500 }
      )
    }

    return NextResponse.json(result.data)
  })
}

/**
 * DELETE /api/clinicas/[id]
 * Soft delete clinic
 * @requires Super Admin
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireSuperAdmin(request, async (req, session) => {
    const supabase = await createServerClient()
    const service = new ClinicaService(supabase)

    // Get IP and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    const userAgent = req.headers.get('user-agent') || ''

    // Delete clinic
    const result = await service.delete(params.id, session.id, ip, userAgent)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode || 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 204 })
  })
}
