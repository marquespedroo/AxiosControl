import { NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { HealthInsuranceService } from '@/lib/services/HealthInsuranceService'

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const sessionResult = await SessionManager.requireRole(['clinic_admin', 'super_admin'])
    if (!sessionResult.success) {
        return NextResponse.json({ error: sessionResult.error.message }, { status: 401 })
    }

    try {
        const body = await request.json()
        const insurance = await HealthInsuranceService.updateInsurance(params.id, body)
        return NextResponse.json(insurance)
    } catch (error) {
        console.error('[API] Error updating insurance:', error)
        return NextResponse.json({ error: 'Error updating insurance' }, { status: 500 })
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const sessionResult = await SessionManager.requireRole(['clinic_admin', 'super_admin'])
    if (!sessionResult.success) {
        return NextResponse.json({ error: sessionResult.error.message }, { status: 401 })
    }

    try {
        await HealthInsuranceService.deleteInsurance(params.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[API] Error deleting insurance:', error)
        return NextResponse.json({ error: 'Error deleting insurance' }, { status: 500 })
    }
}
