import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { HealthInsuranceService } from '@/lib/services/HealthInsuranceService'

export async function GET(request: Request) {
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
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const product = await HealthInsuranceService.createProduct(body)
        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating product' }, { status: 500 })
    }
}
