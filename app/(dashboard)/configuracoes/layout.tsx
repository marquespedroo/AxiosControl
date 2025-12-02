'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, Users, Calendar, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsLayoutProps {
    children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()

    const navItems = [
        {
            title: 'Visão Geral',
            href: '/configuracoes',
            icon: Settings,
            description: 'Configurações gerais da clínica'
        },
        {
            title: 'Planos de Saúde',
            href: '/configuracoes/planos',
            icon: Shield,
            description: 'Gerenciar convênios e produtos'
        },
        {
            title: 'Equipe',
            href: '/configuracoes/equipe',
            icon: Users,
            description: 'Gerenciar profissionais e acessos'
        },
        {
            title: 'Agenda',
            href: '/agenda/configuracao', // Reuse existing page
            icon: Calendar,
            description: 'Configurações de agendamento'
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                    Configurações
                </h1>
                <p className="text-muted-foreground">
                    Gerencie as configurações da sua clínica e equipe.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <button
                                key={item.href}
                                onClick={() => router.push(item.href)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500")} />
                                <div className="text-left">
                                    <div>{item.title}</div>
                                </div>
                            </button>
                        )
                    })}
                </aside>

                <main className="flex-1 min-h-[500px]">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
