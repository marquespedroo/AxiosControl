import { NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { HealthInsuranceService } from '@/lib/services/HealthInsuranceService'

export async function GET(request: Request) {
    const sessionResult = await SessionManager.requireAuth()
    if (!sessionResult.success) {
        return NextResponse.json({ error: sessionResult.error.message }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const insurance_id = searchParams.get('insurance_id')

    if (!insurance_id) {
        return NextResponse.json({ error: 'Insurance ID required' }, { status: 400 })
    }

    try {
        const products = await HealthInsuranceService.listProducts(insurance_id)
        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching products' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const sessionResult = await SessionManager.requireRole(['clinic_admin', 'super_admin'])
    if (!sessionResult.success) {
        return NextResponse.json({ error: sessionResult.error.message }, { status: 401 })
    }

    try {
        const body = await request.json()
        const product = await HealthInsuranceService.createProduct(body)
        return NextResponse.json(product)
    } catch (error) {
        console.error('[API] Error creating product:', error)
        return NextResponse.json({ error: 'Error creating product' }, { status: 500 })
    }
}
