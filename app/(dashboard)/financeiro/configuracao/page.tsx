'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFinancial } from '@/lib/hooks/useApi'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Label } from '@/components/ui/atoms/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/molecules/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/molecules/Select'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Plus, CreditCard, Wallet, Banknote } from 'lucide-react'

export default function FinancialSettingsPage() {
    const router = useRouter()
    const { listPaymentMethods, createPaymentMethod, updatePaymentMethod } = useFinancial()
    const [methods, setMethods] = useState<any[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMethod, setEditingMethod] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: '',
        type: 'credit_card',
        days_to_receive: 0,
        fee_percentage: 0
    })

    useEffect(() => {
        loadMethods()
    }, [])

    const loadMethods = async () => {
        const res = await listPaymentMethods()
        if (res && res.data) {
            setMethods(res.data)
        }
    }

    const handleSave = async () => {
        try {
            if (editingMethod) {
                await updatePaymentMethod(editingMethod.id, formData)
                toast.success('Método atualizado!')
            } else {
                await createPaymentMethod(formData)
                toast.success('Método criado!')
            }
            setIsDialogOpen(false)
            loadMethods()
        } catch (error) {
            toast.error('Erro ao salvar')
        }
    }

    const openEdit = (method: any) => {
        setEditingMethod(method)
        setFormData({
            name: method.name,
            type: method.type,
            days_to_receive: method.days_to_receive,
            fee_percentage: method.fee_percentage
        })
        setIsDialogOpen(true)
    }

    const openNew = () => {
        setEditingMethod(null)
        setFormData({
            name: '',
            type: 'credit_card',
            days_to_receive: 0,
            fee_percentage: 0
        })
        setIsDialogOpen(true)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'credit_card': return <CreditCard className="h-5 w-5 text-blue-500" />
            case 'debit_card': return <CreditCard className="h-5 w-5 text-green-500" />
            case 'pix': return <Wallet className="h-5 w-5 text-purple-500" />
            case 'cash': return <Banknote className="h-5 w-5 text-emerald-500" />
            default: return <Wallet className="h-5 w-5 text-gray-500" />
        }
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
                            Configurações Financeiras
                        </h1>
                        <p className="text-muted-foreground">Gerencie formas de pagamento e taxas.</p>
                    </div>
                </div>
                <Button onClick={openNew} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <Plus className="h-4 w-4" />
                    Novo Método
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {methods.map((method) => (
                    <Card key={method.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(method)}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {method.name}
                            </CardTitle>
                            {getIcon(method.type)}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{method.days_to_receive} dias</div>
                            <p className="text-xs text-muted-foreground">
                                para recebimento
                            </p>
                            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                                <span className="text-muted-foreground">Taxa:</span>
                                <span className="font-medium text-red-600">{method.fee_percentage}%</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingMethod ? 'Editar Método' : 'Novo Método'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Cartão de Crédito Visa"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                                    <SelectItem value="pix">PIX</SelectItem>
                                    <SelectItem value="cash">Dinheiro</SelectItem>
                                    <SelectItem value="bank_slip">Boleto</SelectItem>
                                    <SelectItem value="insurance">Convênio</SelectItem>
                                    <SelectItem value="other">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dias para Recebimento</Label>
                                <Input
                                    type="number"
                                    value={formData.days_to_receive}
                                    onChange={(e) => setFormData({ ...formData, days_to_receive: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Taxa (%)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.fee_percentage}
                                    onChange={(e) => setFormData({ ...formData, fee_percentage: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
