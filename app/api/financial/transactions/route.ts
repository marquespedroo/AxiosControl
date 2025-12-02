import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { FinancialRepository } from '@/lib/repositories/FinancialRepository'
import { FinancialService } from '@/lib/services/FinancialService'
import { SessionManager } from '@/lib/auth/SessionManager'

export async function GET(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const sessionResult = await SessionManager.getSession()

    if (!sessionResult.success) {
        return new NextResponse('Unauthorized', { status: 401 })
    }
    const session = sessionResult.data

    const { searchParams } = new URL(request.url)
    const filters = {
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        type: searchParams.get('type') as 'receita' | 'despesa' | undefined,
        status: searchParams.get('status') as 'pending' | 'paid' | undefined
    }

    const repository = new FinancialRepository(supabase)
    const service = new FinancialService(repository)

    const result = await service.listTransactions(session.clinica_id, filters)

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

    const result = await service.createTransaction({
        ...body,
        clinica_id: session.clinica_id
    })

    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: result.error.statusCode })
    }

    return NextResponse.json(result.data)
}
