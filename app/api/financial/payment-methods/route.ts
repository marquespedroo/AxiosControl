import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { FinancialRepository } from '@/lib/repositories/FinancialRepository'
import { FinancialService } from '@/lib/services/FinancialService'
import { SessionManager } from '@/lib/auth/SessionManager'

export async function GET(_request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const sessionResult = await SessionManager.getSession()

    if (!sessionResult.success) {
        return new NextResponse('Unauthorized', { status: 401 })
    }
    const session = sessionResult.data

    const repository = new FinancialRepository(supabase)
    const service = new FinancialService(repository)

    const result = await service.listPaymentMethods(session.clinica_id)

    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: result.error.statusCode })
    }

    return NextResponse.json(result.data)
}

export async function POST(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const sessionResult = await SessionManager.getSession()

    if (!sessionResult.success) {
        return new NextResponse('Unauthorized', { status: 401 })
    }
    const session = sessionResult.data

    const body = await request.json()
    const repository = new FinancialRepository(supabase)
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
