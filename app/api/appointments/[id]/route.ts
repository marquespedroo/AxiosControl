import { NextRequest, NextResponse } from 'next/server'
import { AppointmentService } from '@/lib/services/AppointmentService'
import { SessionManager } from '@/lib/auth/SessionManager'

/**
 * GET /api/appointments/[id]
 * Get appointment details
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const service = new AppointmentService()
    const result = await service.findById(params.id)

    if (!result.success) {
        return NextResponse.json(
            { error: result.error.message },
            { status: result.error.statusCode || 500 }
        )
    }

    return NextResponse.json(result.data)
}

/**
 * PATCH /api/appointments/[id]
 * Update appointment
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const service = new AppointmentService()
        const result = await service.update(params.id, body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.message },
                { status: result.error.statusCode || 500 }
            )
        }

        return NextResponse.json(result.data)
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}

/**
 * DELETE /api/appointments/[id]
 * Delete appointment
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const service = new AppointmentService()
    const result = await service.delete(params.id)

    if (!result.success) {
        return NextResponse.json(
            { error: result.error.message },
            { status: result.error.statusCode || 500 }
        )
    }

    return NextResponse.json({ success: true })
}
