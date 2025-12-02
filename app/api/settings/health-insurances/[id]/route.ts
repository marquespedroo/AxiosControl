import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { HealthInsuranceService } from '@/lib/services/HealthInsuranceService'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const insurance = await HealthInsuranceService.updateInsurance(params.id, body)
        return NextResponse.json(insurance)
    } catch (error) {
        return NextResponse.json({ error: 'Error updating insurance' }, { status: 500 })
    }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await HealthInsuranceService.deleteInsurance(params.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting insurance' }, { status: 500 })
    }
}
