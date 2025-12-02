'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ClipboardList, Search, Plus, Calendar, User, FileText, Eye, Edit } from 'lucide-react'

interface Registro {
  id: string
  paciente_nome: string
  teste_nome: string
  data_registro: string
  criado_por: string
}

export default function RegistrosManuaisPage() {
  const router = useRouter()
  const [registros] = useState<Registro[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Fetch manual registrations
    const fetchRegistros = async () => {
      try {
        // TODO: Implement API endpoint for manual registrations
        // const response = await fetch('/api/registros-manuais?page=1&limit=50')
        // if (response.ok) {
        //   const data = await response.json()
        //   setRegistros(data.data || [])
        // }
      } catch (error) {
        console.error('Error fetching registrations:', error)
      }
    }

    fetchRegistros()
  }, [])

  const filteredRegistros = registros.filter(r =>
    r.paciente_nome?.toLowerCase().includes(search.toLowerCase()) ||
    r.teste_nome?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Registros Manuais</h1>
              <p className="text-purple-100">Gerencie registros de testes inseridos manualmente</p>
            </div>
          </div>
          <motion.button
            onClick={() => router.push('/registros-manuais/novo')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Novo Registro
          </motion.button>
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
            placeholder="Buscar por paciente ou teste..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      {/* Registrations List */}
      {filteredRegistros.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="h-10 w-10 text-purple-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
              {search ? 'Nenhum registro encontrado' : 'Nenhum registro manual'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {search ? 'Tente ajustar sua busca' : 'Clique em "Novo Registro" para criar o primeiro'}
            </p>
            <motion.button
              onClick={() => router.push('/registros-manuais/novo')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Registro
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRegistros.map((registro, index) => (
            <motion.button
              key={registro.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => router.push(`/registros-manuais/${registro.id}`)}
              className="group text-left"
            >
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {registro.paciente_nome?.charAt(0).toUpperCase() || 'R'}
                  </div>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                    Manual
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Paciente
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {registro.paciente_nome || 'Sem nome'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Teste
                    </p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {registro.teste_nome || 'Sem teste'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {registro.data_registro ? new Date(registro.data_registro).toLocaleDateString('pt-BR') : '-'}
                    </p>
                    <div className="flex gap-2">
                      <Eye className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      <Edit className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
