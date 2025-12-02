'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, User, Search, Calendar, ArrowRight } from 'lucide-react'
import type { TesteTemplate, Paciente } from '@/types/database'

export default function SelecionarPacientePage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<TesteTemplate | null>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch template - cookies are sent automatically
        const templateRes = await fetch(`/api/testes-templates/${params.testeId}`, {
          credentials: 'include' // Ensure cookies are sent
        })
        if (templateRes.ok) {
          const templateData = await templateRes.json()
          setTemplate(templateData)
        } else {
          console.error('Template fetch failed:', await templateRes.text())
        }

        // Fetch patients - cookies are sent automatically
        const pacientesRes = await fetch('/api/pacientes?limit=100', {
          credentials: 'include' // Ensure cookies are sent
        })
        if (pacientesRes.ok) {
          const pacientesData = await pacientesRes.json()
          setPacientes(pacientesData.data || [])
        } else {
          console.error('Patients fetch failed:', await pacientesRes.text())
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.testeId])

  const handleSelectPaciente = async (pacienteId: string) => {
    if (!template) return

    setIsCreating(true)
    try {
      // Create teste_aplicado - cookies are sent automatically
      const response = await fetch('/api/testes-aplicados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          paciente_id: pacienteId,
          teste_template_id: template.id,
          tipo_aplicacao: 'presencial',
          status: 'em_andamento'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar teste aplicado')
      }

      const testeAplicado = await response.json()

      console.log('✅ Test instance created:', {
        id: testeAplicado.id,
        template_id: testeAplicado.teste_template_id,
        patient_id: testeAplicado.paciente_id,
        status: testeAplicado.status
      })

      // Small delay to ensure database commit
      await new Promise(resolve => setTimeout(resolve, 100))

      // Redirect to test application page
      console.log('➡️ Redirecting to:', `/aplicar/${testeAplicado.id}`)
      router.push(`/aplicar/${testeAplicado.id}`)
    } catch (error) {
      console.error('Error creating teste aplicado:', error)
      alert(error instanceof Error ? error.message : 'Erro ao iniciar teste. Tente novamente.')
      setIsCreating(false)
    }
  }

  const filteredPacientes = pacientes.filter(p =>
    p.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf?.includes(search)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Teste não encontrado</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{template.nome}</h1>
            <p className="text-blue-100">Selecione o paciente para aplicar o teste</p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar paciente por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      {/* Patients List */}
      {filteredPacientes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
              {search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {search ? 'Tente ajustar sua busca' : 'Cadastre um paciente para aplicar testes'}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filteredPacientes.map((paciente, index) => (
            <motion.button
              key={paciente.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => handleSelectPaciente(paciente.id)}
              disabled={isCreating}
              className="group text-left w-full"
            >
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {paciente.nome_completo}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {paciente.data_nascimento && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {paciente.cpf && (
                          <span>CPF: {paciente.cpf}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-blue-600 group-hover:translate-x-2 transition-transform">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
