import crypto from 'crypto'

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Check for patient session cookie
        const cookieStore = cookies()
        const sessionCookie = cookieStore.get('patient_session')

        let isPatient = false

        if (sessionCookie) {
            const [token, signature] = sessionCookie.value.split('.')
            const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key'
            const expectedSignature = crypto.createHmac('sha256', secret).update(token).digest('hex')

            if (signature === expectedSignature) {
                // Verify if this test belongs to the link token
                const { data: link } = await supabaseAdmin
                    .from('links_paciente')
                    .select('id')
                    .eq('link_token', token)
                    .single()

                if (link) {
                    // Check if test is in this link
                    const { data: linkTeste } = await supabaseAdmin
                        .from('link_testes')
                        .select('id')
                        .eq('link_id', (link as any).id)
                        .eq('teste_aplicado_id', params.id)
                        .single()

                    if (linkTeste) {
                        isPatient = true
                    }
                }
            }
        }

        if (!isPatient) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { questao_id, resposta } = body

        // 2. Fetch current answers
        const { data: testeData, error: fetchError } = await supabaseAdmin
            .from('testes_aplicados')
            .select('respostas, progresso, testes_templates!testes_aplicados_teste_template_id_fkey(questoes)')
            .eq('id', params.id)
            .single()

        const teste = testeData as any

        if (fetchError || !teste) {
            return NextResponse.json({ error: 'Teste não encontrado' }, { status: 404 })
        }

        // 3. Update answers
        const currentRespostas = (teste.respostas as Record<string, number>) || {}
        const newRespostas = { ...currentRespostas, [questao_id]: resposta }

        // Calculate progress
        const totalQuestions = (teste.testes_templates as any).questoes.length
        const answeredCount = Object.keys(newRespostas).length
        const progresso = Math.round((answeredCount / totalQuestions) * 100)

        // 4. Save to DB
        const { error: updateError } = await (supabaseAdmin as any)
            .from('testes_aplicados')
            .update({
                respostas: newRespostas,
                progresso,
                status: 'em_andamento',
                updated_at: new Date().toISOString()
            })
            .eq('id', params.id)

        if (updateError) {
            return NextResponse.json({ error: 'Erro ao salvar resposta' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error saving response:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
