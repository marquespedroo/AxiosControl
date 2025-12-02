'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSchedule, useUsers } from '@/lib/hooks/useApi'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Label } from '@/components/ui/atoms/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/molecules/Select'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Save, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ScheduleSettingsPage() {
    const router = useRouter()
    const { getSettings, updateSettings, getAvailability, updateAvailability } = useSchedule()
    const { list: listUsers } = useUsers()
    const { user } = useAuthStore()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<{ default_session_duration: number; break_between_sessions: number; default_price?: number | null }>({ default_session_duration: 50, break_between_sessions: 10, default_price: null })
    const [availability, setAvailability] = useState<any[]>([])
    const [professionals, setProfessionals] = useState<any[]>([])
    const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('')

    const isAdmin = user?.roles.includes('clinic_admin') || user?.roles.includes('super_admin')

    const days = [
        { id: 1, label: 'Segunda' },
        { id: 2, label: 'Terça' },
        { id: 3, label: 'Quarta' },
        { id: 4, label: 'Quinta' },
        { id: 5, label: 'Sexta' },
        { id: 6, label: 'Sábado' },
        { id: 0, label: 'Domingo' },
    ]

    useEffect(() => {
        if (user) {
            setSelectedProfessionalId(user.id)
            if (isAdmin) {
                loadProfessionals()
            }
        }
    }, [user])

    useEffect(() => {
        if (selectedProfessionalId) {
            loadData()
        }
    }, [selectedProfessionalId])

    const loadProfessionals = async () => {
        const res = await listUsers({ limit: 100 })
        if (res && res.data) {
            setProfessionals(res.data)
        }
    }

    const loadData = async () => {
        setLoading(true)
        try {
            const [settingsRes, availabilityRes] = await Promise.all([
                getSettings(selectedProfessionalId),
                getAvailability(selectedProfessionalId)
            ])

            if (settingsRes) {
                setSettings({
                    default_session_duration: settingsRes.default_session_duration || 50,
                    break_between_sessions: settingsRes.break_between_sessions || 10,
                    default_price: settingsRes.default_price
                })
            }

            if (availabilityRes) {
                // Initialize with default structure if empty
                const initial = days.map(day => {
                    const existing = availabilityRes.find((a: any) => a.day_of_week === day.id)
                    return existing || {
                        day_of_week: day.id,
                        start_time: '08:00',
                        end_time: '18:00',
                        is_active: day.id >= 1 && day.id <= 5 // Mon-Fri active by default
                    }
                })
                setAvailability(initial)
            }
        } catch (error) {
            toast.error('Erro ao carregar configurações')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await Promise.all([
                updateSettings(settings, selectedProfessionalId),
                updateAvailability(availability.filter(a => a.is_active).map(a => ({
                    day_of_week: a.day_of_week,
                    start_time: a.start_time,
                    end_time: a.end_time
                })), selectedProfessionalId)
            ])
            toast.success('Configurações salvas!')
        } catch (error) {
            toast.error('Erro ao salvar')
        } finally {
            setSaving(false)
        }
    }

    const updateDay = (dayId: number, field: string, value: any) => {
        setAvailability(prev => prev.map(day =>
            day.day_of_week === dayId ? { ...day, [field]: value } : day
        ))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Configuração da Agenda
                        </h1>
                        <p className="text-muted-foreground">Defina seus horários e preferências.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <div className="w-[200px]">
                            <Select
                                value={selectedProfessionalId}
                                onValueChange={setSelectedProfessionalId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o profissional" />
                                </SelectTrigger>
                                <SelectContent>
                                    {professionals.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.nome_completo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <Button onClick={handleSave} disabled={saving || loading} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <Save className="h-4 w-4" />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                Sessões
                            </CardTitle>
                            <CardDescription>Configure a duração padrão dos atendimentos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Duração da Sessão (minutos)</Label>
                                <Input
                                    type="number"
                                    value={settings.default_session_duration}
                                    onChange={(e) => setSettings({ ...settings, default_session_duration: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Intervalo entre Sessões (minutos)</Label>
                                <Input
                                    type="number"
                                    value={settings.break_between_sessions}
                                    onChange={(e) => setSettings({ ...settings, break_between_sessions: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Valor da Sessão Particular (R$)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={settings.default_price || ''}
                                    onChange={(e) => setSettings({ ...settings, default_price: parseFloat(e.target.value) })}
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Este valor será preenchido automaticamente ao agendar sessões particulares.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Horários de Atendimento</CardTitle>
                            <CardDescription>Defina sua disponibilidade semanal.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {days.map((day) => {
                                const dayConfig = availability.find(a => a.day_of_week === day.id) || {}
                                return (
                                    <div key={day.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                        <div className="flex items-center gap-2 w-32">
                                            <input
                                                type="checkbox"
                                                checked={dayConfig.is_active}
                                                onChange={(e) => updateDay(day.id, 'is_active', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className={dayConfig.is_active ? 'font-medium' : 'text-muted-foreground'}>
                                                {day.label}
                                            </span>
                                        </div>
                                        {dayConfig.is_active && (
                                            <div className="flex items-center gap-2 flex-1">
                                                <Input
                                                    type="time"
                                                    value={dayConfig.start_time}
                                                    onChange={(e) => updateDay(day.id, 'start_time', e.target.value)}
                                                    className="w-32"
                                                />
                                                <span className="text-muted-foreground">-</span>
                                                <Input
                                                    type="time"
                                                    value={dayConfig.end_time}
                                                    onChange={(e) => updateDay(day.id, 'end_time', e.target.value)}
                                                    className="w-32"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
