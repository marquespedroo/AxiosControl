import { NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { FinancialRepository } from '@/lib/repositories/FinancialRepository'
import { FinancialService } from '@/lib/services/FinancialService'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(_request: Request) {
    const sessionResult = await SessionManager.requireAuth()

    if (!sessionResult.success) {
        return new NextResponse('Unauthorized', { status: 401 })
    }
    const session = sessionResult.data

    const repository = new FinancialRepository(supabaseAdmin)
    const service = new FinancialService(repository)

    const result = await service.listPaymentMethods(session.clinica_id)

    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: result.error.statusCode })
    }

    return NextResponse.json(result.data)
}

export async function POST(request: Request) {
    const sessionResult = await SessionManager.requireRole(['clinic_admin', 'super_admin'])

    if (!sessionResult.success) {
        return new NextResponse('Unauthorized', { status: 401 })
    }
    const session = sessionResult.data

    const body = await request.json()
    const repository = new FinancialRepository(supabaseAdmin)
    const service = new FinancialService(repository)

    const result = await service.createPaymentMethod({
        ...body,
        clinica_id: session.clinica_id
    })

    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: result.error.statusCode })
    }

    return NextResponse.json(result.data)
}
