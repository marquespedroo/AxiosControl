'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, User, Search, Calendar, ArrowRight, Plus } from 'lucide-react'
import type { Paciente } from '@/types/database'

export default function AplicarPage() {
  const router = useRouter()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await fetch('/api/pacientes?limit=100', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setPacientes(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching patients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPacientes()
  }, [])

  const filteredPacientes = pacientes.filter(p =>
    p.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf?.includes(search)
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
          <p className="text-gray-600 dark:text-gray-400">Carregando pacientes...</p>
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
            <h1 className="text-3xl font-bold">Aplicar Teste</h1>
            <p className="text-blue-100">Selecione um paciente para aplicar testes</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mt-6 text-sm">
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
            <span className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
            <span className="font-medium">Paciente</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/60" />
          <div className="flex items-center gap-2 text-white/60">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-medium text-xs">2</span>
            <span>Testes</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/60" />
          <div className="flex items-center gap-2 text-white/60">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-medium text-xs">3</span>
            <span>Modo</span>
          </div>
        </div>
      </motion.div>

      {/* Search and Add Patient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar paciente por nome ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => router.push('/pacientes/novo')}
            className="flex items-center gap-2 px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Novo Paciente</span>
          </button>
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
            {!search && (
              <button
                onClick={() => router.push('/pacientes/novo')}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Cadastrar Paciente
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filteredPacientes.map((paciente, index) => (
            <motion.button
              key={paciente.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              onClick={() => router.push(`/aplicar/paciente/${paciente.id}/selecionar-testes`)}
              className="group text-left w-full"
            >
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                      {paciente.nome_completo.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {paciente.nome_completo}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {paciente.data_nascimento && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {calculateAge(paciente.data_nascimento)} anos
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
