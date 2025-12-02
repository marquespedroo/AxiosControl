'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Brain, TrendingUp, Clock, Plus, Eye } from 'lucide-react'

interface DashboardStats {
  totalPacientes: number
  testesAplicados: number
  testesPendentes: number
  testsThisMonth: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    testesAplicados: 0,
    testesPendentes: 0,
    testsThisMonth: 0,
  })

  useEffect(() => {
    // Fetch stats in background, don't block rendering
    const fetchDashboardStats = async () => {
      try {
        const [pacientesRes, testesRes] = await Promise.all([
          fetch('/api/pacientes?page=1&limit=1'),
          fetch('/api/testes-aplicados?page=1&limit=1'),
        ])

        const pacientesData = pacientesRes.ok ? await pacientesRes.json() : null
        const testesData = testesRes.ok ? await testesRes.json() : null

        setStats({
          totalPacientes: pacientesData?.meta?.total || 0,
          testesAplicados: testesData?.meta?.total || 0,
          testesPendentes: 0,
          testsThisMonth: 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchDashboardStats()
  }, [])

  const statCards = [
    {
      title: 'Total de Pacientes',
      value: stats.totalPacientes,
      icon: Users,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
    },
    {
      title: 'Testes Aplicados',
      value: stats.testesAplicados,
      icon: Brain,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600',
    },
    {
      title: 'Testes Pendentes',
      value: stats.testesPendentes,
      icon: Clock,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-600',
    },
  ]

  const quickActions = [
    {
      title: 'Novo Paciente',
      description: 'Cadastrar novo paciente',
      icon: Plus,
      href: '/pacientes/novo',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Ver Pacientes',
      description: 'Listar todos os pacientes',
      icon: Eye,
      href: '/pacientes',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Aplicar Teste',
      description: 'Iniciar nova avaliação',
      icon: Brain,
      href: '/aplicar',
      gradient: 'from-purple-500 to-pink-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {card.title}
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-xl`}>
                  <card.icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>

              {/* Bottom indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/50"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Ações Rápidas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              onClick={() => router.push(action.href)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-transparent transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <action.icon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-white transition-colors">
                    {action.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white/80 transition-colors">
                    {action.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/50"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Atividades Recentes
        </h3>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Nenhuma atividade recente
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            As atividades aparecerão aqui quando houver registros
          </p>
        </div>
      </motion.div>
    </div>
  )
}
