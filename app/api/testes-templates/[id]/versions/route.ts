import { NextRequest, NextResponse } from 'next/server'

import { SessionManager } from '@/lib/auth/SessionManager'
import { TesteTemplateService } from '@/lib/services/TesteTemplateService'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/testes-templates/[id]/versions
 * Get all versions of a test template
 * Returns versions sorted by versao_numero descending (newest first)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify session
  const sessionResult = await SessionManager.requireAuth()

  if (!sessionResult.success) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  const supabase = await createServerClient()
  const service = new TesteTemplateService(supabase)

  // Get all versions
  const result = await service.getVersions(params.id)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: result.error.statusCode || 500 }
    )
  }

  // Map to TestVersion format for the frontend
  const versions = result.data.map(template => ({
    id: template.id,
    versao: template.versao,
    versao_numero: template.versao_numero || 1,
    motivo_alteracao: template.motivo_alteracao,
    alterado_por: template.alterado_por,
    alterado_em: template.alterado_em,
    created_at: template.created_at,
    ativo: template.ativo,
    // Include alterado_por_nome if we join with psicologos table
    // For now, we'll need to fetch this separately or handle in frontend
  }))

  return NextResponse.json(versions)
}
