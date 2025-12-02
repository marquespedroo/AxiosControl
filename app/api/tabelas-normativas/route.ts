import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { TabelaNormativaService } from '@/lib/services/TabelaNormativaService'
import { SessionManager } from '@/lib/auth/SessionManager'
import type { TabelaNormativaInsert } from '@/types/database'

/**
 * GET /api/tabelas-normativas
 * List all normative tables with pagination
 */
export async function GET(request: NextRequest) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const supabase = await createServerClient()
  const service = new TabelaNormativaService(supabase)

  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const teste_id = searchParams.get('teste_id') || undefined
  const faixa_etaria_min = searchParams.get('faixa_etaria_min') ? parseInt(searchParams.get('faixa_etaria_min')!) : undefined
  const faixa_etaria_max = searchParams.get('faixa_etaria_max') ? parseInt(searchParams.get('faixa_etaria_max')!) : undefined
  const sexo = (searchParams.get('sexo') as 'M' | 'F' | 'ambos') || undefined
  const escolaridade = searchParams.get('escolaridade') || undefined
  const is_default = searchParams.get('is_default') === 'true' ? true : searchParams.get('is_default') === 'false' ? false : undefined

  // Get normative tables
  const result = await service.list({
    page,
    limit,
    teste_id,
    faixa_etaria_min,
    faixa_etaria_max,
    sexo,
    escolaridade,
    padrao: is_default,
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * POST /api/tabelas-normativas
 * Create a new normative table
 */
export async function POST(request: NextRequest) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const session = sessionResult.data
  const supabase = await createServerClient()
  const service = new TabelaNormativaService(supabase)

  // Parse request body
  const body: TabelaNormativaInsert = await request.json()

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Create normative table
  const result = await service.create(body, session.id, ip, userAgent)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data, { status: 201 })
}
