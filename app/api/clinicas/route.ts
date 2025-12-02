import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { requireSuperAdmin } from '@/lib/middleware/requireSuperAdmin'

export async function GET(request: NextRequest) {
  return requireSuperAdmin(request, async (_req, _session) => {
    try {
      const searchParams = request.nextUrl.searchParams
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const offset = (page - 1) * limit

      // Use admin client to bypass RLS (superadmin already verified by middleware)
      // Get total count
      const { count, error: countError } = await supabaseAdmin
        .from('clinicas')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw countError
      }

      // Get data
      const { data: clinicas, error } = await supabaseAdmin
        .from('clinicas')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({
        data: clinicas,
        meta: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    } catch (error: any) {
      console.error('Error fetching clinics:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar clínicas', details: error.message },
        { status: 500 }
      )
    }
  })
}
