import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { calculateAge } from '@/lib/supabase/helpers'
import { getAuthUser } from '@/lib/auth/helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthUser(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'AUTH_004', message: 'Token não fornecido ou inválido' },
        { status: 401 }
      )
    }

    const user = authResult.data

    // Get test result with all data
    const { data: teste, error } = await supabase
      .from('testes_aplicados')
      .select(`
        *,
        teste_template:teste_template_id (
          nome,
          sigla
        ),
        paciente:paciente_id (
          nome_completo,
          data_nascimento,
          escolaridade_anos,
          sexo,
          clinica_id
        ),
        psicologo:psicologo_id (
          nome_completo,
          crp
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !teste) {
      return NextResponse.json(
        { error: 'PDF_001', message: 'Teste não encontrado' },
        { status: 404 }
      )
    }

    // Verify access
    if (teste.paciente.clinica_id !== user.clinica_id) {
      return NextResponse.json(
        { error: 'PDF_002', message: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Check if test is complete
    if (teste.status !== 'completo' || !teste.pontuacao_bruta) {
      return NextResponse.json(
        { error: 'PDF_003', message: 'Teste não finalizado' },
        { status: 400 }
      )
    }

    // Prepare data for PDF
    const idade = calculateAge(teste.paciente.data_nascimento)

    const pdfData = {
      paciente: {
        nome_completo: teste.paciente.nome_completo,
        data_nascimento: teste.paciente.data_nascimento,
        escolaridade_anos: teste.paciente.escolaridade_anos,
        sexo: teste.paciente.sexo,
        idade,
      },
      teste: {
        nome: teste.teste_template.nome,
        sigla: teste.teste_template.sigla,
      },
      pontuacaoBruta: teste.pontuacao_bruta,
      normalizacao: teste.normalizacao,
      dataConclusao: teste.data_conclusao,
      psicologo: {
        nome_completo: teste.psicologo.nome_completo,
        crp: teste.psicologo.crp,
      },
    }

    // For now, return JSON data (PDF generation will be implemented client-side or with a separate service)
    return NextResponse.json({
      success: true,
      message: 'PDF data prepared',
      data: pdfData,
      filename: `resultado_${teste.teste_template.sigla}_${teste.paciente.nome_completo.replace(/\s+/g, '_')}.pdf`,
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'PDF_999', message: 'Erro ao gerar PDF', details: error.message },
      { status: 500 }
    )
  }
}
