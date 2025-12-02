import { NextRequest, NextResponse } from 'next/server'
import { ScheduleService } from '@/lib/services/ScheduleService'
import { SessionManager } from '@/lib/auth/SessionManager'

/**
 * GET /api/schedule/settings
 * Get current user's schedule settings
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

    const service = new ScheduleService()
    const result = await service.getSettings(userIdToFetch)

    if (!result.success) {
        return NextResponse.json(
            { error: result.error.message },
            { status: result.error.statusCode || 500 }
        )
    }

    return NextResponse.json(result.data)
}

/**
 * POST /api/schedule/settings
 * Update current user's schedule settings
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
        const service = new ScheduleService()
        const result = await service.updateSettings(userIdToUpdate, body)

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
