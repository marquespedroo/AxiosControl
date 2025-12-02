import { NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { FinancialRepository } from '@/lib/repositories/FinancialRepository'
import { FinancialService } from '@/lib/services/FinancialService'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(request: Request) {
    const sessionResult = await SessionManager.requireAuth()

    if (!sessionResult.success) {
        return new NextResponse('Unauthorized', { status: 401 })
    }
    const session = sessionResult.data

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'receita' | 'despesa' | undefined

    // Use supabaseAdmin for server-side operations to bypass RLS or ensure correct context
    const repository = new FinancialRepository(supabaseAdmin)
    const service = new FinancialService(repository)

    const result = await service.listCategories(session.clinica_id, type)

    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: result.error.statusCode })
    }

    return NextResponse.json(result.data)
}
