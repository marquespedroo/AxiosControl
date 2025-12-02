'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, Search, Clock, ArrowRight, ArrowLeft, Check, User } from 'lucide-react'
import type { TesteTemplate, Paciente } from '@/types/database'

export default function SelecionarTestesPage() {
  const params = useParams()
  const router = useRouter()
  const pacienteId = params.pacienteId as string

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [templates, setTemplates] = useState<TesteTemplate[]>([])
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patient
        const pacienteRes = await fetch(`/api/pacientes/${pacienteId}`, {
          credentials: 'include'
        })
        if (pacienteRes.ok) {
          const pacienteData = await pacienteRes.json()
          setPaciente(pacienteData)
        }

        // Fetch templates
        const templatesRes = await fetch('/api/testes-templates?ativo=true&limit=50', {
          credentials: 'include'
        })
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json()
          setTemplates(templatesData.data || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [pacienteId])

  const toggleTest = (templateId: string) => {
    setSelectedTests(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const handleContinue = () => {
    if (selectedTests.length === 0) return

    // Store selected tests in sessionStorage and navigate to mode selection
    sessionStorage.setItem('selectedTests', JSON.stringify(selectedTests))
    router.push(`/aplicar/paciente/${pacienteId}/modo-aplicacao`)
  }

  const filteredTemplates = templates.filter(t =>
    t.nome.toLowerCase().includes(search.toLowerCase()) ||
    t.sigla?.toLowerCase().includes(search.toLowerCase())
  )

  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Paciente não encontrado</p>
          <button
            onClick={() => router.push('/aplicar')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Voltar para seleção de paciente
          </button>
        </div>
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
            <h1 className="text-3xl font-bold">Selecionar Testes</h1>
            <p className="text-blue-100">Escolha os testes para aplicar</p>
          </div>
        </div>

        {/* Patient info */}
        <div className="flex items-center gap-3 mt-4 bg-white/10 rounded-xl p-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{paciente.nome_completo}</p>
            {paciente.data_nascimento && (
              <p className="text-sm text-blue-200">{calculateAge(paciente.data_nascimento)} anos</p>
            )}
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mt-6 text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-medium text-xs">
              <Check className="w-4 h-4" />
            </span>
            <span>Paciente</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/60" />
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
            <span className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
            <span className="font-medium">Testes</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/60" />
          <div className="flex items-center gap-2 text-white/60">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-medium text-xs">3</span>
            <span>Modo</span>
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
            placeholder="Buscar teste por nome ou sigla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      {/* Tests Grid */}
      {filteredTemplates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-10 w-10 text-blue-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
              {search ? 'Nenhum teste encontrado' : 'Nenhum teste disponível'}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template, index) => {
            const isSelected = selectedTests.includes(template.id)
            return (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                onClick={() => toggleTest(template.id)}
                className="group text-left"
              >
                <div className={`relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border-2 shadow-lg transition-all duration-300 hover:shadow-xl h-full ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300'
                }`}>
                  {/* Selection indicator */}
                  <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4 pr-8">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600'
                    }`}>
                      <Brain className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {template.nome}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.sigla}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                      <span className="font-medium text-gray-900 dark:text-white text-right">
                        {template.tipo === 'escala_likert' ? 'Escala Likert' :
                         template.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Manual'}
                      </span>
                    </div>
                    {template.faixa_etaria_min !== null && template.faixa_etaria_max !== null && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Faixa Etária:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {template.faixa_etaria_min} - {template.faixa_etaria_max} anos
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Duração:</span>
                      <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~30 min
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Footer with navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sticky bottom-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/aplicar')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-4">
            {selectedTests.length > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTests.length} teste{selectedTests.length > 1 ? 's' : ''} selecionado{selectedTests.length > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={handleContinue}
              disabled={selectedTests.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                selectedTests.length > 0
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continuar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
