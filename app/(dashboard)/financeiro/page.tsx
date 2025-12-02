'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFinancial } from '@/lib/hooks/useApi'
import { Button } from '@/components/ui/atoms/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Settings, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

export default function FinancialPage() {
    const router = useRouter()
    const { listTransactions } = useFinancial()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [transactions, setTransactions] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [currentDate])

    const loadData = async () => {
        const start = startOfMonth(currentDate)
        const end = endOfMonth(currentDate)

        const res = await listTransactions({
            startDate: start.toISOString(),
            endDate: end.toISOString()
        })

        if (res && res.data) {
            setTransactions(res.data)
        }
    }

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

    const totalRevenue = transactions
        .filter(t => t.type === 'receita')
        .reduce((acc, t) => acc + t.amount, 0)

    const totalExpenses = transactions
        .filter(t => t.type === 'despesa')
        .reduce((acc, t) => acc + t.amount, 0)

    const pendingReceivables = transactions
        .filter(t => t.type === 'receita' && t.status === 'pending')
        .reduce((acc, t) => acc + t.amount, 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Financeiro
                    </h1>
                    <p className="text-muted-foreground">Acompanhe seu fluxo de caixa e recebíveis.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/financeiro/configuracao')}
                        className="gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        Configurações
                    </Button>
                    <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-1">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-medium min-w-[150px] text-center text-sm px-2">
                            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                                Receitas Totais
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                            </div>
                            <p className="text-xs text-green-600/80 dark:text-green-400/80">
                                neste mês
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-100 dark:border-red-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
                                Despesas
                            </CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
                            </div>
                            <p className="text-xs text-red-600/80 dark:text-red-400/80">
                                neste mês
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                A Receber (Futuro)
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingReceivables)}
                            </div>
                            <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                                agendado para este mês
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lançamentos do Mês</CardTitle>
                    <CardDescription>Histórico detalhado de receitas e despesas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum lançamento encontrado neste mês.
                            </div>
                        ) : (
                            transactions.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${t.type === 'receita' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {t.type === 'receita' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <div className="font-medium">{t.description}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(t.due_date), "d 'de' MMM", { locale: ptBR })} • {t.payment_method?.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'receita' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                        </div>
                                        <div className={`text-xs ${t.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                            {t.status === 'paid' ? 'Recebido' : 'Pendente'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
