import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { FinancialRepository } from '@/lib/repositories/FinancialRepository'
import { FinancialService } from '@/lib/services/FinancialService'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const supabase = createRouteHandlerClient({ cookies })
    const sessionResult = await SessionManager.getSession()

    if (!sessionResult.success) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const repository = new FinancialRepository(supabase)
    const service = new FinancialService(repository)

    const result = await service.updatePaymentMethod(params.id, body)

    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: result.error.statusCode })
    }

    return NextResponse.json(result.data)
}
