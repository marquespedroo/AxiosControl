'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Brain,
  Building2,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FolderOpen,
  Clock,
  Link2,
  Calendar,
  LogOut,
  Menu,
  X,
  Sparkles,
  DollarSign,
} from 'lucide-react'
import { AuthUser } from '@/types/database'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Load user data after hydration
    setIsClient(true)
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }

    // Set sidebar state based on screen size
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Call logout API to clear session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Clear local storage
    localStorage.removeItem('user')

    // Redirect to login
    router.push('/login')
  }

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agenda', label: 'Agenda', icon: Calendar },
    { href: '/pacientes', label: 'Pacientes', icon: Users },
    { href: '/aplicar', label: 'Aplicar Teste', icon: Brain },
    { href: '/testes-em-andamento', label: 'Em Andamento', icon: Clock },
    { href: '/links', label: 'Links', icon: Link2 },
    { href: '/resultados', label: 'Resultados', icon: BarChart3 },
    { href: '/biblioteca', label: 'Biblioteca', icon: FolderOpen },
    { href: '/registros-manuais', label: 'Registros', icon: ClipboardList },
    { href: '/admin', label: 'Administração', icon: Building2 },
    { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
  ]

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon

    return (
      <motion.button
        onClick={() => {
          router.push(item.href)
          if (window.innerWidth < 1024) {
            setMobileMenuOpen(false)
          }
        }}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium
          transition-all duration-300 group relative overflow-hidden
          ${isActive
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}

        <Icon className={`relative z-10 w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />

        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="relative z-10 text-sm"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {item.badge && sidebarOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative z-10 ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
          >
            {item.badge}
          </motion.span>
        )}
      </motion.button>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
          transition: { duration: 0.3, ease: 'easeInOut' }
        }}
        className="fixed left-0 top-0 h-screen bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 z-30 hidden lg:block shadow-2xl shadow-gray-200/50"
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between mb-8">
            <motion.div
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    AxiosControl
                  </h1>
                  <p className="text-xs text-gray-500">Gestão e Avaliação</p>
                </div>
              )}
            </motion.div>

            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* User Profile */}
          <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                {isClient && user?.nome_completo ? user.nome_completo.charAt(0).toUpperCase() : 'U'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {isClient ? (user?.nome_completo || 'Usuário') : 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{isClient ? (user?.email || '') : ''}</p>
                </div>
              )}
            </div>

            <motion.button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm">Sair</span>}
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed left-0 top-0 h-screen w-80 bg-white dark:bg-gray-900 z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        AxiosControl
                      </h1>
                      <p className="text-xs text-gray-500">Gestão e Avaliação</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="flex-1 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          router.push(item.href)
                          setMobileMenuOpen(false)
                        }}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                          ${isActive
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    )
                  })}
                </nav>

                <div className="pt-4 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'}`}>
        {/* Mobile Menu Button - Only shown on mobile */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <motion.button
            onClick={() => setMobileMenuOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          >
            <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
          </motion.button>
        </div>

        {/* Page Content with Animation */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 p-6"
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>

      {/* Quick Actions FAB (Mobile) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 lg:hidden z-30"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center text-white"
        >
          <Sparkles className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </div>
  )
}
