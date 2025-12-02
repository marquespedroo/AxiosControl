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
        const product = await HealthInsuranceService.updateProduct(params.id, body)
        return NextResponse.json(product)
    } catch (error) {
        console.error('[API] Error updating product:', error)
        return NextResponse.json({ error: 'Error updating product' }, { status: 500 })
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
        await HealthInsuranceService.deleteProduct(params.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[API] Error deleting product:', error)
        return NextResponse.json({ error: 'Error deleting product' }, { status: 500 })
    }
}
