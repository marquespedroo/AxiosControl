'use client'

import { useState, useEffect } from 'react'
import { useHealthInsurance } from '@/lib/hooks/useApi'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Label } from '@/components/ui/atoms/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/molecules/Dialog'
import { toast } from 'react-hot-toast'
import { Loader2, Plus, Trash2, Shield, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HealthInsurancePage() {
    const { listInsurances, createInsurance, deleteInsurance, listProducts, createProduct, deleteProduct } = useHealthInsurance()

    const [insurances, setInsurances] = useState<any[]>([])
    const [selectedInsurance, setSelectedInsurance] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingProducts, setLoadingProducts] = useState(false)

    // Dialog states
    const [isInsuranceDialogOpen, setIsInsuranceDialogOpen] = useState(false)
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
    const [newInsuranceName, setNewInsuranceName] = useState('')
    const [newProductData, setNewProductData] = useState({ name: '', price: '' })

    useEffect(() => {
        loadInsurances()
    }, [])

    useEffect(() => {
        if (selectedInsurance) {
            loadProducts(selectedInsurance.id)
        } else {
            setProducts([])
        }
    }, [selectedInsurance])

    const loadInsurances = async () => {
        setLoading(true)
        const res = await listInsurances() // Assuming clinic_id is handled by backend or hook default
        if (res) {
            setInsurances(res)
            if (res.length > 0 && !selectedInsurance) {
                setSelectedInsurance(res[0])
            }
        }
        setLoading(false)
    }

    const loadProducts = async (insuranceId: string) => {
        setLoadingProducts(true)
        const res = await listProducts(insuranceId)
        if (res) {
            setProducts(res)
        }
        setLoadingProducts(false)
    }

    const handleCreateInsurance = async () => {
        if (!newInsuranceName.trim()) return
        try {
            const res = await createInsurance({ name: newInsuranceName })
            if (res) {
                toast.success('Convênio adicionado!')
                setNewInsuranceName('')
                setIsInsuranceDialogOpen(false)
                loadInsurances()
            }
        } catch (error) {
            toast.error('Erro ao adicionar convênio')
        }
    }

    const handleDeleteInsurance = async (id: string) => {
        if (confirm('Tem certeza? Isso apagará todos os produtos associados.')) {
            try {
                await deleteInsurance(id)
                toast.success('Convênio removido')
                if (selectedInsurance?.id === id) setSelectedInsurance(null)
                loadInsurances()
            } catch (error) {
                toast.error('Erro ao remover convênio')
            }
        }
    }

    const handleCreateProduct = async () => {
        if (!newProductData.name.trim() || !selectedInsurance) return
        try {
            const res = await createProduct({
                insurance_id: selectedInsurance.id,
                name: newProductData.name,
                price: newProductData.price ? parseFloat(newProductData.price) : null
            })
            if (res) {
                toast.success('Produto adicionado!')
                setNewProductData({ name: '', price: '' })
                setIsProductDialogOpen(false)
                loadProducts(selectedInsurance.id)
            }
        } catch (error) {
            toast.error('Erro ao adicionar produto')
        }
    }

    const handleDeleteProduct = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este produto?')) {
            try {
                await deleteProduct(id)
                toast.success('Produto removido')
                loadProducts(selectedInsurance.id)
            } catch (error) {
                toast.error('Erro ao remover produto')
            }
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Insurances List */}
            <Card className="md:col-span-1 flex flex-col h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Convênios</CardTitle>
                        <Button size="sm" onClick={() => setIsInsuranceDialogOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
                    {insurances.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8 text-sm">Nenhum convênio cadastrado</div>
                    ) : (
                        insurances.map((ins) => (
                            <div
                                key={ins.id}
                                onClick={() => setSelectedInsurance(ins)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${selectedInsurance?.id === ins.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 border' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className={`h-4 w-4 ${selectedInsurance?.id === ins.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span className="font-medium text-sm">{ins.name}</span>
                                </div>
                                {selectedInsurance?.id === ins.id && (
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteInsurance(ins.id) }}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                        <ChevronRight className="h-4 w-4 text-blue-600" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Products List */}
            <Card className="md:col-span-2 flex flex-col h-full">
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">
                                {selectedInsurance ? `Produtos - ${selectedInsurance.name}` : 'Selecione um convênio'}
                            </CardTitle>
                            <CardDescription>Gerencie os planos e preços para este convênio.</CardDescription>
                        </div>
                        {selectedInsurance && (
                            <Button onClick={() => setIsProductDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Produto
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6">
                    {!selectedInsurance ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Shield className="h-12 w-12 mb-4 opacity-20" />
                            <p>Selecione um convênio à esquerda para gerenciar seus produtos.</p>
                        </div>
                    ) : loadingProducts ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                    ) : products.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                            <p>Nenhum produto cadastrado para este convênio.</p>
                            <Button variant="link" onClick={() => setIsProductDialogOpen(true)}>Adicionar o primeiro</Button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-md transition-all"
                                >
                                    <div>
                                        <h4 className="font-semibold">{product.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {product.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price) : 'Preço não definido'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteProduct(product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <Dialog open={isInsuranceDialogOpen} onOpenChange={setIsInsuranceDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Convênio</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Convênio</Label>
                            <Input
                                value={newInsuranceName}
                                onChange={(e) => setNewInsuranceName(e.target.value)}
                                placeholder="Ex: Unimed, Bradesco Saúde"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInsuranceDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateInsurance}>Adicionar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Produto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Produto/Plano</Label>
                            <Input
                                value={newProductData.name}
                                onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                                placeholder="Ex: Básico, Especial, Apartamento"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Preço Padrão (Opcional)</Label>
                            <Input
                                type="number"
                                value={newProductData.price}
                                onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateProduct}>Adicionar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
