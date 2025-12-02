import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { AppointmentService } from '@/lib/services/AppointmentService'
import { supabaseAdmin } from '@/lib/supabase/client'

/**
 * GET /api/appointments
 * List appointments
 */
export async function GET(request: NextRequest) {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const start_date = searchParams.get('start_date') || undefined
    const end_date = searchParams.get('end_date') || undefined
    const patient_id = searchParams.get('patient_id') || undefined
    const professional_id = searchParams.get('professional_id') || undefined
    const clinica_id = searchParams.get('clinica_id') || undefined

    // Use supabaseAdmin to bypass RLS since we already validated the session
    const service = new AppointmentService(supabaseAdmin)

    const result = await service.list({
        clinica_id,
        professional_id,
        patient_id,
        start_date,
        end_date
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
 * POST /api/appointments
 * Create new appointment
 */
export async function POST(request: NextRequest) {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const body = await request.json()
        // Use supabaseAdmin to bypass RLS since we already validated the session
        const service = new AppointmentService(supabaseAdmin)

        // Ensure clinica_id is set to user's clinic
        const data = {
            ...body,
            clinica_id: sessionResult.data.clinica_id,
            // If professional_id not provided, assume current user if they are a professional
            professional_id: body.professional_id || sessionResult.data.id
        }

        const result = await service.create(data)

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
