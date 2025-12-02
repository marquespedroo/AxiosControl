'use client'

import { useState, useEffect } from 'react'
import { useUsers } from '@/lib/hooks/useApi'
import { Button } from '@/components/ui/atoms/Button'
import { Input } from '@/components/ui/atoms/Input'
import { Label } from '@/components/ui/atoms/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/molecules/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/molecules/Select'
import { toast } from 'react-hot-toast'
import { Loader2, Plus, Mail, Trash2 } from 'lucide-react'

export default function TeamPage() {
    const { list, create, remove } = useUsers()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        nome_completo: '',
        email: '',
        password: '',
        role: 'psychologist'
    })

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        // Assuming list returns all users for the clinic, or we need to adjust the hook/API
        const res = await list({ limit: 100 })
        if (res && res.data) {
            setUsers(res.data)
        }
        setLoading(false)
    }

    const handleCreateUser = async () => {
        if (!newUser.nome_completo || !newUser.email || !newUser.password) {
            toast.error('Preencha todos os campos obrigatórios')
            return
        }

        try {
            const res = await create(newUser)
            if (res) {
                toast.success('Usuário convidado com sucesso!')
                setIsDialogOpen(false)
                setNewUser({ nome_completo: '', email: '', password: '', role: 'psychologist' })
                loadUsers()
            }
        } catch (error) {
            toast.error('Erro ao criar usuário')
        }
    }

    const handleRemoveUser = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este usuário?')) {
            try {
                await remove(id)
                toast.success('Usuário removido')
                loadUsers()
            } catch (error) {
                toast.error('Erro ao remover usuário')
            }
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Equipe</h2>
                    <p className="text-muted-foreground">Gerencie os membros da sua clínica.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Membro
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {users.map((user) => (
                    <Card key={user.id} className="overflow-hidden">
                        <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                                    {user.nome_completo.charAt(0)}
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 rounded-full bg-white dark:bg-gray-800 text-xs font-medium border border-gray-200 dark:border-gray-700">
                                        {user.roles?.[0] === 'clinic_admin' ? 'Admin' :
                                            user.roles?.[0] === 'secretary' ? 'Secretária' : 'Psicólogo'}
                                    </span>
                                </div>
                            </div>
                            <CardTitle className="mt-4 text-lg">{user.nome_completo}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {user.email}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex justify-end">
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveUser(user.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remover
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Membro</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input
                                value={newUser.nome_completo}
                                onChange={(e) => setNewUser({ ...newUser, nome_completo: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Senha Temporária</Label>
                            <Input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Função</Label>
                            <Select
                                value={newUser.role}
                                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="psychologist">Psicólogo</SelectItem>
                                    <SelectItem value="secretary">Secretária</SelectItem>
                                    <SelectItem value="clinic_admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateUser}>Adicionar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
