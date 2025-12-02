'use client'

import { Users, Shield, Calendar, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/atoms/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/atoms/Card'

export default function SettingsPage() {
    const router = useRouter()

    const cards = [
        {
            title: 'Planos de Saúde',
            description: 'Gerencie os convênios aceitos e seus produtos.',
            icon: Shield,
            href: '/configuracoes/planos',
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/20'
        },
        {
            title: 'Equipe',
            description: 'Adicione profissionais e gerencie permissões.',
            icon: Users,
            href: '/configuracoes/equipe',
            color: 'text-green-600',
            bg: 'bg-green-100 dark:bg-green-900/20'
        },
        {
            title: 'Agenda',
            description: 'Configure horários de funcionamento e sessões.',
            icon: Calendar,
            href: '/agenda/configuracao',
            color: 'text-purple-600',
            bg: 'bg-purple-100 dark:bg-purple-900/20'
        }
    ]

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
                <Card key={card.href} className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => router.push(card.href)}>
                    <CardHeader>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.bg}`}>
                            <card.icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                        <CardTitle className="group-hover:text-blue-600 transition-colors">{card.title}</CardTitle>
                        <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="ghost" className="w-full justify-between group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                            Acessar
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
