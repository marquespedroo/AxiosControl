import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBDEFS() {
  const { data, error } = await supabase
    .from('teste_template')
    .select('id, nome, sigla, questoes, escalas_resposta, regras_calculo')
    .eq('sigla', 'BDEFS')
    .single()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('=== BDEFS Test Configuration ===')
  console.log('Name:', data.nome)
  console.log('Total questions:', data.questoes?.length || 0)
  console.log('')
  console.log('Escalas de Resposta:')
  console.log(JSON.stringify(data.escalas_resposta, null, 2))
  console.log('')
  console.log('Regras de Cálculo:')
  console.log(JSON.stringify(data.regras_calculo, null, 2))

  // Check question types
  if (data.questoes && Array.isArray(data.questoes)) {
    const questionTypes = new Set(data.questoes.map((q: any) => q.tipo))
    console.log('')
    console.log('Question types used:', Array.from(questionTypes))
  }
}

checkBDEFS()
