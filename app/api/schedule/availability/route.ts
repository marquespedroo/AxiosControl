import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { ScheduleService } from '@/lib/services/ScheduleService'
import { supabaseAdmin } from '@/lib/supabase/client'

/**
 * GET /api/schedule/availability
 * Get current user's availability
 */
export async function GET(request: NextRequest) {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const session = sessionResult.data
    const searchParams = request.nextUrl.searchParams
    const targetUserId = searchParams.get('user_id')

    let userIdToFetch = session.id

    if (targetUserId && targetUserId !== session.id) {
        const isAdmin = session.roles.includes('clinic_admin') || session.roles.includes('super_admin')
        if (!isAdmin) {
            return NextResponse.json({ error: 'Permissões insuficientes' }, { status: 403 })
        }
        userIdToFetch = targetUserId
    }

    // Use supabaseAdmin to bypass RLS since we already validated the session
    const service = new ScheduleService(supabaseAdmin)
    const result = await service.getAvailability(userIdToFetch)

    if (!result.success) {
        return NextResponse.json(
            { error: result.error.message },
            { status: result.error.statusCode || 500 }
        )
    }

    return NextResponse.json(result.data)
}

/**
 * POST /api/schedule/availability
 * Update current user's availability
 */
export async function POST(request: NextRequest) {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const session = sessionResult.data
    const searchParams = request.nextUrl.searchParams
    const targetUserId = searchParams.get('user_id')

    let userIdToUpdate = session.id

    if (targetUserId && targetUserId !== session.id) {
        const isAdmin = session.roles.includes('clinic_admin') || session.roles.includes('super_admin')
        if (!isAdmin) {
            return NextResponse.json({ error: 'Permissões insuficientes' }, { status: 403 })
        }
        userIdToUpdate = targetUserId
    }

    try {
        const body = await request.json()
        // Body should be an array of availability slots
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Body must be an array' }, { status: 400 })
        }

        // Use supabaseAdmin to bypass RLS since we already validated the session
        const service = new ScheduleService(supabaseAdmin)
        const result = await service.updateAvailability(userIdToUpdate, body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.message },
                { status: result.error.statusCode || 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}
