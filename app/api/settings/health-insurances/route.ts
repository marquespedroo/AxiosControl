import { NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { HealthInsuranceService } from '@/lib/services/HealthInsuranceService'

export async function GET(request: Request) {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
        return NextResponse.json({ error: sessionResult.error.message }, { status: 401 })
    }
    const session = sessionResult.data
    const { searchParams } = new URL(request.url)
    const clinica_id = searchParams.get('clinica_id')

    if (!clinica_id) {
        // Use session clinic_id if not provided in params
        if (session.clinica_id) {
            try {
                const insurances = await HealthInsuranceService.listInsurances(session.clinica_id)
                return NextResponse.json(insurances)
            } catch (error) {
                return NextResponse.json({ error: 'Error fetching insurances' }, { status: 500 })
            }
        }

        return NextResponse.json({ error: 'Clinic ID required' }, { status: 400 })
    }

    try {
        // TODO: Add authorization check if clinica_id is provided but different from session?
        // For now, assuming listing is safe or we trust the ID if provided (e.g. super admin)
        const insurances = await HealthInsuranceService.listInsurances(clinica_id)
        return NextResponse.json(insurances)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching insurances' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const sessionResult = await SessionManager.requireRole(['clinic_admin', 'super_admin'])
    if (!sessionResult.success) {
        return NextResponse.json({ error: sessionResult.error.message }, { status: 401 })
    }
    const session = sessionResult.data

    try {
        const body = await request.json()

        if (!session.clinica_id) {
            return NextResponse.json({ error: 'User not associated with a clinic' }, { status: 403 })
        }

        const insurance = await HealthInsuranceService.createInsurance({
            ...body,
            clinica_id: session.clinica_id
        })
        return NextResponse.json(insurance)
    } catch (error) {
        console.error('[API] Error creating insurance:', error)
        return NextResponse.json({ error: 'Error creating insurance' }, { status: 500 })
    }
}
