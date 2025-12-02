'use client'

import { addDays, format, startOfWeek, addMinutes, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Settings, User, Search, Check, ChevronsUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'



import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Label } from '@/components/ui/atoms/Label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/molecules/Command'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/molecules/Dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/molecules/Popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/molecules/Select'
import { useAppointments, useSchedule, useHealthInsurance, useUsers, usePacientes, useFinancial } from '@/lib/hooks/useApi'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { cn } from '@/lib/utils'

export default function AgendaPage() {
    const router = useRouter()
    const { listInsurances, listProducts } = useHealthInsurance()
    const { list: listUsers } = useUsers()
    const { user } = useAuthStore()
    const { list: listAppointments, create: createAppointment, remove: deleteAppointment } = useAppointments()
    const { list: listPatients } = usePacientes()
    const { getSettings } = useSchedule()

    const [currentDate, setCurrentDate] = useState(new Date())
    const [appointments, setAppointments] = useState<any[]>([])
    const [patients, setPatients] = useState<any[]>([])
    const [insurances, setInsurances] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [professionals, setProfessionals] = useState<any[]>([])
    const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState('')
    const [openPatientCombobox, setOpenPatientCombobox] = useState(false)

    const [settings, setSettings] = useState<{ duration: number; break: number; default_price?: number | null }>({ duration: 50, break: 10, default_price: null })
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
    const [formData, setFormData] = useState({
        patient_id: '',
        notes: '',
        payment_type: 'particular',
        insurance_id: '',
        insurance_product_id: '',
        price: ''
    })

    const isAdmin = user?.roles.includes('clinic_admin') || user?.roles.includes('super_admin')

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
            loadSettings()
            loadAppointments()
        }
    }, [currentDate, selectedProfessionalId])

    useEffect(() => {
        loadPatients()
        loadInsurances()
    }, [])

    useEffect(() => {
        if (formData.insurance_id) {
            loadProducts(formData.insurance_id)
        } else {
            setProducts([])
        }
    }, [formData.insurance_id])

    const loadSettings = async () => {
        const res = await getSettings(selectedProfessionalId)
        if (res) {
            setSettings({
                duration: res.default_session_duration || 50,
                break: res.break_between_sessions || 10,
                default_price: res.default_price
            })
        }
    }

    const loadPatients = async () => {
        const res = await listPatients({ limit: 100 })
        if (res && res.data) {
            setPatients(res.data)
        }
    }

    const loadInsurances = async () => {
        const res = await listInsurances()
        if (res) {
            setInsurances(res)
        }
    }

    const loadProducts = async (insuranceId: string) => {
        const res = await listProducts(insuranceId)
        if (res) {
            setProducts(res)
        }
    }

    const loadProfessionals = async () => {
        const res = await listUsers({ limit: 100 })
        if (res && res.data) {
            setProfessionals(res.data)
        }
    }

    const loadAppointments = async () => {
        if (!selectedProfessionalId) return

        const start = startOfWeek(currentDate, { weekStartsOn: 1 })
        const end = addDays(start, 7)

        const res = await listAppointments({
            start_date: start.toISOString(),
            end_date: end.toISOString(),
            professional_id: selectedProfessionalId
        })

        if (res) {
            setAppointments(res)
        }
    }

    const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7))
    const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7))

    const handleSlotClick = (date: Date, hour: number) => {
        const start = new Date(date)
        start.setHours(hour, 0, 0, 0)
        const end = addMinutes(start, settings.duration)

        setSelectedSlot({ start, end })
        setFormData({
            patient_id: '',
            notes: '',
            payment_type: 'particular',
            insurance_id: '',
            insurance_product_id: '',
            price: settings.default_price ? settings.default_price.toString() : ''
        })
        setIsDialogOpen(true)
    }

    const handleCreateAppointment = async () => {
        if (!selectedSlot || !formData.patient_id) return

        try {
            const res = await createAppointment({
                patient_id: formData.patient_id,
                professional_id: selectedProfessionalId, // Use selected professional
                start_time: selectedSlot.start.toISOString(),
                end_time: selectedSlot.end.toISOString(),
                notes: formData.notes,
                status: 'scheduled',
                payment_type: formData.payment_type,
                insurance_product_id: formData.payment_type === 'plano_saude' ? formData.insurance_product_id : null,
                price: formData.payment_type === 'particular' && formData.price ? parseFloat(formData.price) : null
            })

            if (res) {
                toast.success('Agendamento criado!')
                setIsDialogOpen(false)
                loadAppointments()
            }
        } catch (error) {
            toast.error('Erro ao criar agendamento')
        }
    }

    const handleDeleteAppointment = async (id: string) => {
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            try {
                await deleteAppointment(id)
                toast.success('Agendamento cancelado')
                loadAppointments()
            } catch (error) {
                toast.error('Erro ao cancelar')
            }
        }
    }

    // Generate week days
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
    const hours = Array.from({ length: 11 }).map((_, i) => i + 8) // 8am to 6pm

    const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false)
    const [receiveData, setReceiveData] = useState({
        appointment_id: '',
        amount: 0,
        payment_method_id: '',
        transaction_date: new Date().toISOString().split('T')[0]
    })
    const [paymentMethods, setPaymentMethods] = useState<any[]>([])
    const { listPaymentMethods, createTransaction } = useFinancial()

    useEffect(() => {
        if (isReceiveDialogOpen) {
            loadPaymentMethods()
        }
    }, [isReceiveDialogOpen])

    const loadPaymentMethods = async () => {
        const res = await listPaymentMethods()
        if (res && res.data) {
            setPaymentMethods(res.data)
        }
    }

    const handleOpenReceive = (appointment: any) => {
        setReceiveData({
            appointment_id: appointment.id,
            amount: appointment.price || 0,
            payment_method_id: '',
            transaction_date: new Date().toISOString().split('T')[0]
        })
        setIsReceiveDialogOpen(true)
    }

    const handleReceive = async () => {
        try {
            const method = paymentMethods.find(m => m.id === receiveData.payment_method_id)
            const daysToReceive = method ? method.days_to_receive : 0
            const dueDate = addDays(new Date(receiveData.transaction_date), daysToReceive)

            await createTransaction({
                clinica_id: user?.clinica_id,
                description: `Recebimento Agendamento`,
                amount: receiveData.amount,
                type: 'receita',
                payment_method_id: receiveData.payment_method_id,
                transaction_date: receiveData.transaction_date,
                due_date: format(dueDate, 'yyyy-MM-dd'),
                status: 'paid', // Or pending depending on logic, but "Receber" implies marking as paid/received
                appointment_id: receiveData.appointment_id,
                patient_id: appointments.find(a => a.id === receiveData.appointment_id)?.patient_id
            })

            toast.success('Pagamento registrado!')
            setIsReceiveDialogOpen(false)
        } catch (error) {
            toast.error('Erro ao registrar pagamento')
        }
    }

    return (
        <div className="space-y-6">


            <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Recebimento</DialogTitle>
                        <DialogDescription>Confirme os dados do pagamento.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={receiveData.amount}
                                onChange={(e) => setReceiveData({ ...receiveData, amount: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Forma de Pagamento</Label>
                            <Select
                                value={receiveData.payment_method_id}
                                onValueChange={(value) => setReceiveData({ ...receiveData, payment_method_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((method) => (
                                        <SelectItem key={method.id} value={method.id}>
                                            {method.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Data do Pagamento</Label>
                            <Input
                                type="date"
                                value={receiveData.transaction_date}
                                onChange={(e) => setReceiveData({ ...receiveData, transaction_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReceiveDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleReceive} className="bg-green-600 text-white hover:bg-green-700">Confirmar Recebimento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Agenda
                    </h1>
                    <p className="text-muted-foreground">Gerencie seus atendimentos e horários.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar paciente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 bg-white dark:bg-gray-800"
                        />
                    </div>
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
                    <Button
                        variant="outline"
                        onClick={() => router.push('/agenda/configuracao')}
                        className="gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        Configurações
                    </Button>
                    <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-1">
                        <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-medium min-w-[150px] text-center text-sm px-2">
                            {format(weekStart, "d 'de' MMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMM", { locale: ptBR })}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/50 overflow-hidden"
            >
                <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
                    <div className="col-span-1 p-4 border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"></div>
                    {weekDays.map((day, i) => (
                        <div key={i} className={`col-span-1 p-4 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                            <div className="font-medium text-sm text-gray-500 uppercase">{format(day, 'EEE', { locale: ptBR })}</div>
                            <div className={`text-xl font-bold mt-1 ${isSameDay(day, new Date()) ? 'text-blue-600' : ''}`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                    <div className="grid grid-cols-8">
                        {hours.map((hour) => (
                            <Fragment key={hour}>
                                <div key={`time-${hour}`} className="col-span-1 p-2 text-right text-xs font-medium text-gray-400 border-r border-b border-gray-100 dark:border-gray-800 bg-gray-50/30">
                                    {hour}:00
                                </div>
                                {weekDays.map((day, dayIndex) => {
                                    const dayAppointments = appointments.filter(apt => {
                                        const aptDate = parseISO(apt.start_time)
                                        const matchesDate = isSameDay(aptDate, day) && aptDate.getHours() === hour
                                        const matchesSearch = !searchTerm || apt.patient?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
                                        return matchesDate && matchesSearch
                                    })

                                    return (
                                        <div
                                            key={`${dayIndex}-${hour}`}
                                            className="col-span-1 min-h-[80px] border-r border-b border-gray-100 dark:border-gray-800 relative group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                        >
                                            {dayAppointments.length > 0 ? (
                                                dayAppointments.map(apt => (
                                                    <motion.div
                                                        key={apt.id}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className={`absolute inset-1 rounded-lg p-2 text-white shadow-md cursor-pointer hover:shadow-lg transition-all z-10 ${apt.payment_type === 'plano_saude' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                                                        onClick={() => handleDeleteAppointment(apt.id)}
                                                        title={`${apt.patient?.nome_completo} - ${format(parseISO(apt.start_time), 'HH:mm')}`}
                                                    >
                                                        <div className="font-semibold text-xs truncate flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {apt.patient?.nome_completo}
                                                        </div>
                                                        <div className="text-[10px] opacity-90 mt-0.5 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {format(parseISO(apt.start_time), 'HH:mm')}
                                                        </div>
                                                        {apt.payment_type === 'plano_saude' && (
                                                            <div className="text-[9px] opacity-80 mt-0.5 truncate">
                                                                {apt.insurance_product?.name || 'Convênio'}
                                                            </div>
                                                        )}
                                                        {apt.payment_type === 'particular' && (
                                                            <div className="mt-1 flex justify-end">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 text-[10px] text-white hover:text-white/80 hover:bg-white/20 px-2"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleOpenReceive(apt)
                                                                    }}
                                                                >
                                                                    Receber
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div
                                                    className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                                    onClick={() => handleSlotClick(day, hour)}
                                                >
                                                    <div className="bg-blue-500/10 text-blue-600 rounded-full p-1">
                                                        <Plus className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </motion.div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Agendamento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Data e Hora</Label>
                            <div className="flex items-center text-sm text-muted-foreground bg-muted p-2 rounded-md">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedSlot && format(selectedSlot.start, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Paciente</Label>
                            <Popover open={openPatientCombobox} onOpenChange={setOpenPatientCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openPatientCombobox}
                                        className="w-full justify-between"
                                    >
                                        {formData.patient_id
                                            ? patients.find((patient) => patient.id === formData.patient_id)?.nome_completo
                                            : "Selecione um paciente..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar paciente..." />
                                        <CommandList>
                                            <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {patients.map((patient) => (
                                                    <CommandItem
                                                        key={patient.id}
                                                        value={patient.nome_completo}
                                                        onSelect={() => {
                                                            setFormData({ ...formData, patient_id: patient.id })
                                                            setOpenPatientCombobox(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.patient_id === patient.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {patient.nome_completo}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Pagamento</Label>
                            <Select
                                value={formData.payment_type}
                                onValueChange={(value) => setFormData({ ...formData, payment_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="particular">Particular</SelectItem>
                                    <SelectItem value="plano_saude">Plano de Saúde</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.payment_type === 'plano_saude' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Convênio</Label>
                                    <Select
                                        value={formData.insurance_id}
                                        onValueChange={(value) => setFormData({ ...formData, insurance_id: value, insurance_product_id: '' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {insurances.map((ins) => (
                                                <SelectItem key={ins.id} value={ins.id}>
                                                    {ins.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Produto/Plano</Label>
                                    <Select
                                        value={formData.insurance_product_id}
                                        onValueChange={(value) => setFormData({ ...formData, insurance_product_id: value })}
                                        disabled={!formData.insurance_id || products.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((prod) => (
                                                <SelectItem key={prod.id} value={prod.id}>
                                                    {prod.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Observações</Label>
                            <Input
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Opcional"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateAppointment} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">Agendar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
