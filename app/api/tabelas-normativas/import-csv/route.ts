import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { TabelaNormativaService } from '@/lib/services/TabelaNormativaService'
import { SessionManager } from '@/lib/auth/SessionManager'

/**
 * POST /api/tabelas-normativas/import-csv
 * Import normative data from CSV
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
  const body = await request.json()
  const { teste_id, csvContent, metadata } = body

  if (!teste_id || !csvContent || !metadata) {
    return NextResponse.json(
      { error: 'Dados incompletos. Necessário: teste_id, csvContent, metadata' },
      { status: 400 }
    )
  }

  // Validate metadata
  const { nome, faixa_etaria_min, faixa_etaria_max, sexo, escolaridade, is_default } = metadata

  if (!nome || faixa_etaria_min === undefined || faixa_etaria_max === undefined || !sexo) {
    return NextResponse.json(
      { error: 'Metadados incompletos. Necessário: nome, faixa_etaria_min, faixa_etaria_max, sexo' },
      { status: 400 }
    )
  }

  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
  const userAgent = request.headers.get('user-agent') || ''

  // Import CSV
  const result = await service.importCSV(
    teste_id,
    csvContent,
    {
      nome,
      faixa_etaria_min,
      faixa_etaria_max,
      sexo,
      escolaridade,
      is_default,
    },
    session.id,
    ip,
    userAgent
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  return NextResponse.json(result.data, { status: 201 })
}
