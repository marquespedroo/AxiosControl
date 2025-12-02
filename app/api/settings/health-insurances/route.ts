import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { HealthInsuranceService } from '@/lib/services/HealthInsuranceService'

export async function GET(request: Request) {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { searchParams } = new URL(request.url)
    const clinica_id = searchParams.get('clinica_id')

    if (!clinica_id) {
        // Try to get from user session if not provided
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // We need to fetch the user's clinica_id. 
        // Since we don't have easy access to it here without a DB call or custom claim, 
        // we assume the client should pass it or we fetch the user profile.
        // For now, let's require it or fetch user.
        const { data: user } = await supabase.from('users').select('clinica_id').eq('id', session.user.id).single()

        if (user?.clinica_id) {
            try {
                const insurances = await HealthInsuranceService.listInsurances(user.clinica_id)
                return NextResponse.json(insurances)
            } catch (error) {
                return NextResponse.json({ error: 'Error fetching insurances' }, { status: 500 })
            }
        }

        return NextResponse.json({ error: 'Clinic ID required' }, { status: 400 })
    }

    try {
        const insurances = await HealthInsuranceService.listInsurances(clinica_id)
        return NextResponse.json(insurances)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching insurances' }, { status: 500 })
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
        // Ensure clinica_id is set to user's clinic if not provided or enforce security
        const { data: user } = await supabase.from('users').select('clinica_id').eq('id', session.user.id).single()

        if (!user?.clinica_id) {
            return NextResponse.json({ error: 'User not associated with a clinic' }, { status: 403 })
        }

        const insurance = await HealthInsuranceService.createInsurance({
            ...body,
            clinica_id: user.clinica_id
        })
        return NextResponse.json(insurance)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating insurance' }, { status: 500 })
    }
}
