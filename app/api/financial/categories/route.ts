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
    const type = searchParams.get('type') as 'receita' | 'despesa' | undefined

    const repository = new FinancialRepository(supabase)
    const service = new FinancialService(repository)

    const result = await service.listCategories(session.clinica_id, type)

    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: result.error.statusCode })
    }

    return NextResponse.json(result.data)
}
