import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Pre-filled answers from the document (t = true/Verdadeiro, f = false/Falso)
const rawAnswers = `
1. t
2. t
3. t
4. f
5. f
6. f
7. f
8. t
9. t
10. t
11. f
12. f
13. f
14. f
15. f
16. f
17. f
18. f
19. f
20. t
21. f
22. f
23. f
24. f
25. f
26. f
27. f
28. t
29. f
30. t
31. f
32. t
33. t
34. f
35. t
36. f
37. f
38. t
39. f
40. f
41. t
42. f
43. t
44. t
45. f
46. t
47. f
48. t
49. f
50. t
51. f
52. f
53. f
54. t
55. f
56. t
57. f
58. f
59. f
60. f
61. f
62. t
63. t
64. t
65. f
66. f
67. t
68. f
69. t
70. f
71. f
72. f
73. t
74. t
75. t
76. f
77. f
78. f
79. f
80. f
81. f
82. f
83. t
84. f
85. f
86. f
87. t
88. t
89. t
90. t
91. f
92. f
93. f
94. f
95. f
96. f
97. t
98. f
99. f
100. f
101. f
102. f
103. f
104. f
105. f
106. f
107. f
108. t
109. f
110. f
111. f
112. f
113. t
114. f
115. t
116. f
117. f
118. f
119. f
120. t
121. f
122. f
123. f
124. t
125. f
126. f
127. f
128. t
129. f
130. f
131. f
132. t
133. f
134. f
135. f
136. f
137. t
138. f
139. f
140. t
141. t
142. t
143. f
144. f
145. t
146. t
147. f
148. f
149. f
150. f
151. f
152. f
153. f
154. t
155. t
156. f
157. t
158. t
159. t
160. f
161. f
162. f
163. t
164. f
165. t
166. f
167. f
168. t
169. f
170. f
171. t
172. f
173. f
174. t
175. f
176. t
177. f
178. f
179. f
180. f
181. f
182. f
183. f
184. f
185. t
186. f
187. t
188. t
189. t
190. f
191. f
192. f
193. f
194. f
195. f
`.trim()

function parseAnswers(raw: string): Record<number, string> {
  const answers: Record<number, string> = {}
  const lines = raw.split('\n').filter(line => line.trim())

  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s*([tf])/)
    if (match) {
      const questionNum = parseInt(match[1])
      const answer = match[2] === 't' ? 'Verdadeiro' : 'Falso'
      answers[questionNum] = answer
    }
  }

  return answers
}

async function createTestCase() {
  console.log('🧪 Creating MCMI-IV Test Case with Pre-filled Answers...\n')

  try {
    // 1. Get MCMI-IV test template
    console.log('📋 Step 1: Finding MCMI-IV test template...')
    const { data: testTemplate, error: templateError } = await supabase
      .from('testes_templates')
      .select('id, nome, sigla')
      .eq('sigla', 'MCMI-IV')
      .single()

    if (templateError || !testTemplate) {
      throw new Error('MCMI-IV test template not found. Run seed-mcmi-iv.ts first.')
    }

    console.log(`   ✅ Found: ${testTemplate.nome} (ID: ${testTemplate.id})`)

    // 2. Get or create a test patient
    console.log('\n👤 Step 2: Finding or creating test patient...')

    // First, get a clinic
    const { data: clinics } = await supabase
      .from('clinicas')
      .select('id, nome')
      .limit(1)

    if (!clinics || clinics.length === 0) {
      throw new Error('No clinic found. Please create a clinic first.')
    }

    const clinic = clinics[0]
    console.log(`   ✅ Using clinic: ${clinic.nome} (ID: ${clinic.id})`)

    // Check if test patient exists
    let { data: patient } = await supabase
      .from('pacientes')
      .select('id, nome_completo')
      .eq('nome_completo', 'Paciente Teste MCMI-IV')
      .eq('clinica_id', clinic.id)
      .single()

    if (!patient) {
      // Create test patient
      console.log('   📝 Creating test patient...')
      const { data: newPatient, error: patientError } = await supabase
        .from('pacientes')
        .insert({
          nome_completo: 'Paciente Teste MCMI-IV',
          data_nascimento: '1990-01-01',
          escolaridade_anos: 16, // Bachelor's degree
          sexo: 'M',
          clinica_id: clinic.id,
          telefone: '11999999999',
          email: 'teste@mcmi-iv.com'
        })
        .select()
        .single()

      if (patientError) {
        throw new Error(`Failed to create patient: ${patientError.message}`)
      }

      patient = newPatient
      console.log(`   ✅ Created patient: ${(patient as any).nome_completo} (ID: ${(patient as any).id})`)
    } else {
      console.log(`   ✅ Using existing patient: ${(patient as any).nome_completo} (ID: ${(patient as any).id})`)
    }

    // 3. Parse answers
    console.log('\n📝 Step 3: Parsing answers...')
    const parsedAnswers = parseAnswers(rawAnswers)
    const answerCount = Object.keys(parsedAnswers).length
    console.log(`   ✅ Parsed ${answerCount} answers`)

    // Convert to the format expected by the database
    const respostas: Record<string, string> = {}
    for (const [questionNum, answer] of Object.entries(parsedAnswers)) {
      respostas[`q${questionNum}`] = answer
    }

    // 4. Use specific psychologist
    console.log('\n👨‍⚕️ Step 4: Using psychologist...')
    const psychologistId = '550e8400-e29b-41d4-a716-446655440002'
    console.log(`   ✅ Using psychologist ID: ${psychologistId}`)

    // 5. Create test application
    console.log('\n🧪 Step 5: Creating test application...')
    const { data: testeAplicado, error: testeError } = await supabase
      .from('testes_aplicados')
      .insert({
        teste_template_id: testTemplate.id,
        paciente_id: (patient as any).id,
        psicologo_id: psychologistId,
        tipo_aplicacao: 'presencial', // Required field
        status: 'em_andamento',
        respostas: respostas
      })
      .select()
      .single()

    if (testeError) {
      throw new Error(`Failed to create test: ${testeError.message}`)
    }

    console.log(`   ✅ Test application created (ID: ${testeAplicado.id})`)

    // 6. Summary
    console.log('\n' + '='.repeat(80))
    console.log('✅ TEST CASE CREATED SUCCESSFULLY!')
    console.log('='.repeat(80))
    console.log(`📋 Test ID: ${testeAplicado.id}`)
    console.log(`👤 Patient: ${(patient as any).nome_completo}`)
    console.log(`👨‍⚕️ Psychologist ID: ${psychologistId}`)
    console.log(`🧪 Test: ${testTemplate.nome}`)
    console.log(`📊 Status: ${testeAplicado.status}`)
    console.log(`✅ Answers: ${answerCount}/195 pre-filled`)
    console.log('='.repeat(80))
    console.log('\n📝 Next Steps:')
    console.log('   1. Go to the application page: /aplicar/' + testeAplicado.id)
    console.log('   2. Navigate through questions (all answers are already filled)')
    console.log('   3. Click "Finalizar Teste" to test the finalization flow')
    console.log('   4. Verify results page displays correctly')
    console.log('   5. Test PDF export functionality')
    console.log('\n🔗 Direct Link:')
    console.log(`   http://localhost:3000/aplicar/${testeAplicado.id}`)

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the script
createTestCase()
  .then(() => {
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
