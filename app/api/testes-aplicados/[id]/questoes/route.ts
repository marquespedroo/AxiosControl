import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API] GET /api/testes-aplicados/[id]/questoes hit with ID:', params.id)
    try {
        // 1. Check for patient session cookie
        const cookieStore = cookies()
        const sessionCookie = cookieStore.get('patient_session')
        console.log('[API] Session cookie present:', !!sessionCookie)

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
                        .eq('link_id', link.id)
                        .eq('teste_aplicado_id', params.id)
                        .single()

                    if (linkTeste) {
                        isPatient = true
                    }
                }
            }
        }

        // If not patient, check for system auth (middleware handles this usually, but we removed it from protected routes)
        // So we must check if NOT patient
        if (!isPatient) {
            // For now, if not patient, return 401. 
            // Realistically, psychologists might also call this, but they usually use the main [id] route.
            // If we want to support psychologists too, we'd check for their session here.
            // But for this specific fix, we focus on patient access.
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Fetch test data using admin client
        // Use explicit foreign key to avoid ambiguity
        const { data: testeAplicado, error } = await supabaseAdmin
            .from('testes_aplicados')
            .select('*, testes_templates!testes_aplicados_teste_template_id_fkey(*)')
            .eq('id', params.id)
            .single()

        if (error || !testeAplicado) {
            console.error('[API] Error fetching test:', error)
            return NextResponse.json({ error: 'Teste não encontrado', details: error }, { status: 404 })
        }

        const template = (testeAplicado as any).testes_templates

        // Helper function to find scale options from escalas_resposta
        const findScaleOptions = (escalasResposta: any, questionType: string | undefined): any[] | null => {
            if (!escalasResposta) return null

            // Try direct match first
            if (questionType && escalasResposta[questionType]) {
                return escalasResposta[questionType]
            }

            // Try common scale name mappings
            const scaleMappings: Record<string, string[]> = {
                'likert': ['likert_0_4', 'likert_1_5', 'likert_0_5', 'multipla_escolha', 'likert'],
                'likert_agree_4': ['likert_agree_4', 'multipla_escolha'],
                'multipla_escolha': ['multipla_escolha', 'likert'],
            }

            const possibleScales = questionType ? (scaleMappings[questionType] || []) : []
            for (const scaleName of possibleScales) {
                if (escalasResposta[scaleName]) {
                    return escalasResposta[scaleName]
                }
            }

            // If no specific match, use the first available scale (most tests have only one)
            const availableScales = Object.keys(escalasResposta)
            if (availableScales.length > 0) {
                return escalasResposta[availableScales[0]]
            }

            return null
        }

        // Enrich questions with options if needed
        const enrichedQuestions = (template.questoes || []).map((q: any) => {
            // Ensure ID exists (use numero as ID)
            const questionWithId = {
                ...q,
                id: q.id || q.numero.toString()
            }

            // If question already has options, keep them
            if (questionWithId.opcoes && questionWithId.opcoes.length > 0) return questionWithId

            // Get the question type from either tipo_resposta or tipo field
            const questionType = questionWithId.tipo_resposta || questionWithId.tipo

            // Try to find scale options from escalas_resposta
            const scaleOptions = findScaleOptions(template.escalas_resposta, questionType)

            if (scaleOptions) {
                return {
                    ...questionWithId,
                    opcoes: scaleOptions.map((opt: any) => ({
                        valor: opt.valor,
                        texto: opt.label || opt.texto // Handle both label and texto
                    }))
                }
            }

            // Fallback for likert scales if not found in map but type implies it
            if ((questionType === 'likert_0_4' || questionType === 'likert') && !questionWithId.opcoes) {
                return {
                    ...questionWithId,
                    opcoes: [
                        { valor: 0, texto: 'Nunca' },
                        { valor: 1, texto: 'Raramente' },
                        { valor: 2, texto: 'Às vezes' },
                        { valor: 3, texto: 'Frequentemente' },
                        { valor: 4, texto: 'Sempre' }
                    ]
                }
            }

            return questionWithId
        })

        // 3. Return questions
        return NextResponse.json({
            questoes: enrichedQuestions,
            respostas: testeAplicado.respostas || {}
        })

    } catch (error) {
        console.error('Error fetching questions:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
