'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { Building2, Plus, Edit, Trash2, ShieldAlert } from 'lucide-react'
import type { Clinica } from '@/types/database'

export default function AdminPage() {
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const [clinicas, setClinicas] = useState<Clinica[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fetchClinicas()
  }, [])

  const fetchClinicas = async () => {
    try {
      const response = await fetch('/api/clinicas?page=1&limit=100')
      if (response.ok) {
        const data = await response.json()
        setClinicas(data.data || [])
      } else {
        console.error('Error response:', await response.text())
      }
    } catch (error) {
      console.error('Error fetching clinics:', error)
    }
  }

  const deleteClinica = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar esta clínica?')) return

    try {
      const response = await fetch(`/api/clinicas/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Clínica desativada com sucesso!')
        fetchClinicas()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao desativar clínica')
      }
    } catch (error) {
      console.error('Error deleting clinic:', error)
      alert('Erro ao desativar clínica')
    }
  }

  const isSuperAdmin = isClient && user?.roles?.includes('super_admin')

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Administração</h1>
              <p className="text-amber-100">Painel de gerenciamento do sistema</p>
            </div>
          </div>
          {isSuperAdmin && (
            <motion.button
              onClick={() => router.push('/admin/clinicas/nova')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white text-amber-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Nova Clínica
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      {isSuperAdmin && (
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: 'Total de Clínicas', value: clinicas.length, icon: Building2, color: 'blue' },
            { title: 'Clínicas Ativas', value: clinicas.filter(c => c.ativo).length, icon: Building2, color: 'green' },
            { title: 'Clínicas Inativas', value: clinicas.filter(c => !c.ativo).length, icon: Building2, color: 'gray' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Clinics List or General Admin Content */}
      {isSuperAdmin ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Clínicas Cadastradas</h2>
            <p className="text-gray-600 dark:text-gray-400">Gerencie as clínicas do sistema</p>
          </div>

          {clinicas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-10 w-10 text-amber-600" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Nenhuma clínica cadastrada</p>
              <motion.button
                onClick={() => router.push('/admin/clinicas/nova')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Criar Primeira Clínica
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {clinicas.map((clinica, index) => (
                <motion.div
                  key={clinica.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-amber-500 hover:shadow-lg transition-all sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">{clinica.nome}</h3>
                      {clinica.ativo ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Ativa
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          Inativa
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {clinica.cnpj && <p>CNPJ: {clinica.cnpj}</p>}
                      {clinica.email && <p>Email: {clinica.email}</p>}
                      {clinica.telefone && <p>Telefone: {clinica.telefone}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => router.push(`/admin/clinicas/${clinica.id}/editar`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 rounded-xl border-2 border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </motion.button>
                    <motion.button
                      onClick={() => deleteClinica(clinica.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 rounded-xl border-2 border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Desativar
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-lg text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <ShieldAlert className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Área Administrativa</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isClient ? 'Você não tem permissão de Super Admin para gerenciar clínicas.' : 'Carregando...'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
