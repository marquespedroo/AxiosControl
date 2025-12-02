import crypto from 'crypto'

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth/helpers'
import { calculateRawScore } from '@/lib/calculation/calculator'
import { calculatePercentile, calculateZScore, calculateTScore, classifyPerformance, findNormativeBin } from '@/lib/calculation/normalization'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createAuditLog, calculateAge } from '@/lib/supabase/helpers'

// POST /api/testes-aplicados/[id]/finalizar - Finalize test and calculate results
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let user: any = null
    let isPatient = false

    // 1. Check for patient session cookie first
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('patient_session')

    if (sessionCookie) {
      const [token, signature] = sessionCookie.value.split('.')
      const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key'
      const expectedSignature = crypto.createHmac('sha256', secret).update(token).digest('hex')

      if (signature === expectedSignature) {
        // Verify if this test belongs to the link token
        const { data: link } = await supabaseAdmin
          .from('links_paciente')
          .select('id, clinica_id')
          .eq('link_token', token)
          .single()

        if (link) {
          const { data: linkTeste } = await supabaseAdmin
            .from('link_testes')
            .select('id')
            .eq('link_id', (link as any).id)
            .eq('teste_aplicado_id', params.id)
            .single()

          if (linkTeste) {
            isPatient = true
            user = { id: 'patient', clinica_id: (link as any).clinica_id } // Mock user for compatibility
          }
        }
      }
    }

    // 2. If not patient, check for system auth
    if (!isPatient) {
      const authResult = await getAuthUser(request)
      if (!authResult.success) {
        return NextResponse.json(
          { error: 'AUTH_004', message: 'Token não fornecido ou inválido' },
          { status: 401 }
        )
      }
      user = authResult.data
    }

    console.log('[API] POST /api/testes-aplicados/[id]/finalizar:', {
      testId: params.id,
      userId: user.id,
      clinicId: user.clinica_id,
      isPatient
    })

    // Get test with all related data using ADMIN CLIENT to bypass RLS
    const { data: testeData, error: testeError } = await supabaseAdmin
      .from('testes_aplicados')
      .select(`
        *,
        teste_template:teste_template_id (
          id,
          nome,
          sigla,
          tipo,
          questoes,
          escalas_resposta,
          regras_calculo
        ),
        paciente:paciente_id (
          id,
          data_nascimento,
          escolaridade_anos,
          sexo,
          clinica_id
        )
      `)
      .eq('id', params.id)
      .single()

    const teste = testeData as any

    console.log('[API] Test query result:', {
      found: !!teste,
      error: testeError?.message,
      testId: teste?.id,
      status: teste?.status
    })

    if (testeError || !teste) {
      console.error('[API] Test not found:', testeError)
      return NextResponse.json(
        { error: 'TEST_005', message: 'Teste não encontrado', details: testeError?.message },
        { status: 404 }
      )
    }

    // Verify access
    if (teste.paciente.clinica_id !== user.clinica_id) {
      return NextResponse.json(
        { error: 'TEST_006', message: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Calculate raw score
    const questoes = teste.teste_template.questoes as any[]
    const respostas = teste.respostas as any
    const regrasCalculo = teste.teste_template.regras_calculo as any
    const escalasResposta = teste.teste_template.escalas_resposta as any
    const testeSigla = teste.teste_template.sigla || ''

    let pontuacaoBruta: any

    // MCMI-IV has specialized scoring in frontend - skip generic calculation
    if (testeSigla === 'MCMI-IV') {
      console.log('[API] MCMI-IV test detected - using specialized scoring')
      pontuacaoBruta = {
        total: 0,  // Placeholder - actual scoring done in frontend
        respostas  // Include answers for MCMI-IV scoring service
      }
    } else {
      // Determine max scale value
      let maxScaleValue = 5 // default
      if (regrasCalculo?.escala_maxima) {
        maxScaleValue = regrasCalculo.escala_maxima
      } else if (escalasResposta) {
        if (escalasResposta.multipla_escolha) {
          maxScaleValue = Math.max(...escalasResposta.multipla_escolha.map((o: any) => o.valor))
        } else if (escalasResposta.likert) {
          maxScaleValue = Math.max(...escalasResposta.likert.map((o: any) => o.valor))
        } else if (escalasResposta.likert_0_4) {
          maxScaleValue = 4
        } else if (escalasResposta.likert_0_5) {
          maxScaleValue = 5
        } else if (escalasResposta.binario) {
          maxScaleValue = Math.max(...escalasResposta.binario.map((o: any) => o.valor))
        }
      }

      console.log('[API] Calculating with max scale value:', maxScaleValue)

      // Use proper dispatcher that handles all calculation types
      try {
        const rawScore = calculateRawScore(
          respostas,
          regrasCalculo,
          questoes,
          maxScaleValue
        )

        pontuacaoBruta = {
          total: rawScore.total,
          respostas,
          ...(rawScore.secoes ? { secoes: rawScore.secoes } : {})
        }

        console.log('[API] ✅ Calculated score:', rawScore.total)
      } catch (error: any) {
        console.error('[API] Calculation error:', error)

        // Save answers even when calculation fails
        // This allows users to retry calculation or view answers later
        try {
          await (supabaseAdmin as any)
            .from('testes_aplicados')
            .update({
              respostas,
              status: 'erro_calculo',
              observacoes: `Erro de cálculo: ${error.message}`
            })
            .eq('id', params.id)

          console.log('[API] ✅ Answers saved despite calculation error')
        } catch (saveError: any) {
          console.error('[API] Failed to save answers after calculation error:', saveError)
        }

        return NextResponse.json(
          {
            error: 'CALC_999',
            message: 'Erro ao calcular pontuação bruta',
            details: error.message,
            answersSaved: true,
            canRetry: true
          },
          { status: 500 }
        )
      }
    }

    // Get normative tables
    const idade = calculateAge(teste.paciente.data_nascimento)

    const { data: normativeTables } = await supabaseAdmin
      .from('tabelas_normativas')
      .select('*')
      .eq('teste_template_id', teste.teste_template_id)

    let normalizacao: any = null

    if (normativeTables && normativeTables.length > 0) {
      try {
        // Find appropriate normative bin
        const demographics = {
          idade,
          escolaridade_anos: teste.paciente.escolaridade_anos || 0,
          sexo: teste.paciente.sexo || 'M',
        }

        const binResult = findNormativeBin(demographics, (normativeTables as any)[0].faixas as any[])

        if (binResult) {
          const { bin, exact } = binResult

          // Calculate percentile
          const percentil = calculatePercentile(pontuacaoBruta.total, bin.percentis)

          // Calculate Z-score and T-score if mean and SD are available
          let escoreZ: number | null = null
          let escoreT: number | null = null

          if (bin.media !== undefined && bin.desvio_padrao !== undefined) {
            escoreZ = calculateZScore(pontuacaoBruta.total, bin.media, bin.desvio_padrao)
            if (escoreZ !== null) {
              escoreT = calculateTScore(escoreZ)
            }
          }

          // Classify performance
          const classificacao = classifyPerformance(percentil)

          normalizacao = {
            tabela_utilizada: (normativeTables as any)[0].id,
            faixa_aplicada: {
              idade: `${bin.idade_min}-${bin.idade_max}`,
              escolaridade: `${bin.escolaridade_min}-${bin.escolaridade_max}`,
            },
            exact_match: exact,
            percentil,
            escore_z: escoreZ,
            escore_t: escoreT,
            classificacao,
          }
        }
      } catch (error: any) {
        console.error('Normalization error:', error)
        // Continue without normalization if it fails
      }
    }

    // Update test with results using ADMIN CLIENT
    console.log('[API] Updating test with results:', {
      testId: params.id,
      status: 'completo',
      hasNormalization: !!normalizacao
    })

    const { data, error } = await (supabaseAdmin as any)
      .from('testes_aplicados')
      .update({
        pontuacao_bruta: pontuacaoBruta,
        normalizacao,
        status: 'completo',
        data_conclusao: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[API] Error updating test:', error)
      return NextResponse.json(
        { error: 'TEST_008', message: 'Erro ao finalizar teste', details: error.message },
        { status: 500 }
      )
    }

    console.log('[API] ✅ Test finalized successfully:', {
      testId: data.id,
      status: data.status
    })

    // Create audit log (only for system users)
    if (!isPatient) {
      await createAuditLog({
        usuario_id: user.id,
        acao: 'criar' as any,
        entidade: 'testes_aplicados',
        entidade_id: params.id,
        dados_anteriores: teste,
        dados_novos: data,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('POST /api/testes-aplicados/[id]/finalizar error:', error)
    return NextResponse.json(
      { error: 'TEST_999', message: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    )
  }
}
