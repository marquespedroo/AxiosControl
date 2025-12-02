'use client'

import { Loader2, Plus, Mail, Trash2, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/atoms/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { Input } from '@/components/ui/atoms/Input'
import { Label } from '@/components/ui/atoms/Label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/molecules/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/molecules/Select'
import { useUsers, useClinicas } from '@/lib/hooks/useApi'
import { useAuthStore } from '@/lib/stores/useAuthStore'


export default function TeamPage() {
    const { list, create, update, remove } = useUsers({
        onError: (message) => toast.error(message)
    })
    const { list: listClinics } = useClinicas()
    const { user } = useAuthStore()

    const [users, setUsers] = useState<any[]>([])
    const [clinics, setClinics] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any>(null)
    const [formData, setFormData] = useState({
        nome_completo: '',
        email: '',
        password: '',
        roles: ['psychologist'] as string[],
        clinica_id: '',
        crp: '',
        crp_estado: ''
    })

    const isSuperAdmin = user?.roles.includes('super_admin')

    useEffect(() => {
        loadUsers()
        if (isSuperAdmin) {
            loadClinics()
        }
    }, [user])

    const loadUsers = async () => {
        setLoading(true)
        const res = await list({ limit: 100 })
        if (res && res.data) {
            setUsers(res.data)
        }
        setLoading(false)
    }

    const loadClinics = async () => {
        const res = await listClinics({ limit: 100, ativo: true })
        if (res && res.data) {
            setClinics(res.data)
        }
    }

    const handleOpenDialog = (userToEdit?: any) => {
        if (userToEdit) {
            setEditingUser(userToEdit)
            setFormData({
                nome_completo: userToEdit.nome_completo,
                email: userToEdit.email,
                password: '', // Don't fill password
                roles: userToEdit.roles || [],
                clinica_id: userToEdit.clinica_id || '',
                crp: userToEdit.crp || '',
                crp_estado: userToEdit.crp_estado || ''
            })
        } else {
            setEditingUser(null)
            setFormData({
                nome_completo: '',
                email: '',
                password: '',
                roles: ['psychologist'],
                clinica_id: '',
                crp: '',
                crp_estado: ''
            })
        }
        setIsDialogOpen(true)
    }

    const handleSaveUser = async () => {
        if (!formData.nome_completo || !formData.email) {
            toast.error('Nome e Email são obrigatórios')
            return
        }

        if (!editingUser && !formData.password) {
            toast.error('Senha é obrigatória para novos usuários')
            return
        }

        if (isSuperAdmin && !formData.clinica_id) {
            toast.error('Selecione uma clínica')
            return
        }

        if (formData.roles.length === 0) {
            toast.error('Selecione pelo menos uma função')
            return
        }

        try {
            const payload: any = {
                ...formData,
                clinica_id: isSuperAdmin ? formData.clinica_id : user?.clinica_id
            }

            // Remove password if empty during edit
            if (editingUser && !payload.password) {
                delete payload.password
            }

            let res
            if (editingUser) {
                res = await update(editingUser.id, payload)
                if (res) toast.success('Usuário atualizado com sucesso!')
            } else {
                res = await create(payload)
                if (res) toast.success('Usuário criado com sucesso!')
            }

            if (res) {
                setIsDialogOpen(false)
                loadUsers()
            }
        } catch (error) {
            // Error handled by useUsers onError
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

    const toggleRole = (role: string) => {
        setFormData(prev => {
            const roles = prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role]
            return { ...prev, roles }
        })
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
                <Button onClick={() => handleOpenDialog()}>
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
                                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                                    {user.roles?.map((role: string) => (
                                        <span key={role} className="px-2 py-1 rounded-full bg-white dark:bg-gray-800 text-xs font-medium border border-gray-200 dark:border-gray-700">
                                            {role === 'clinic_admin' ? 'Admin' :
                                                role === 'secretary' ? 'Secretária' :
                                                    role === 'super_admin' ? 'Super Admin' : 'Psicólogo'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <CardTitle className="mt-4 text-lg">{user.nome_completo}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {user.email}
                            </CardDescription>
                            {isSuperAdmin && user.clinica_id && (
                                <CardDescription className="text-xs mt-1">
                                    Clínica ID: {user.clinica_id}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
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
                        <DialogTitle>{editingUser ? 'Editar Membro' : 'Adicionar Membro'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input
                                value={formData.nome_completo}
                                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Senha {editingUser ? '(Deixe em branco para manter)' : ''}</Label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        {isSuperAdmin && (
                            <div className="space-y-2">
                                <Label>Clínica</Label>
                                <Select
                                    value={formData.clinica_id}
                                    onValueChange={(value) => setFormData({ ...formData, clinica_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a clínica" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clinics.map((clinic) => (
                                            <SelectItem key={clinic.id} value={clinic.id}>
                                                {clinic.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Funções</Label>
                            <div className="space-y-2 border rounded-md p-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="role-psychologist"
                                        checked={formData.roles.includes('psychologist')}
                                        onChange={() => toggleRole('psychologist')}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="role-psychologist" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Psicólogo
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="role-secretary"
                                        checked={formData.roles.includes('secretary')}
                                        onChange={() => toggleRole('secretary')}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="role-secretary" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Secretária
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="role-admin"
                                        checked={formData.roles.includes('clinic_admin')}
                                        onChange={() => toggleRole('clinic_admin')}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="role-admin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Administrador da Clínica
                                    </label>
                                </div>
                            </div>
                        </div>

                        {formData.roles.includes('psychologist') && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>CRP</Label>
                                    <Input
                                        value={formData.crp}
                                        onChange={(e) => setFormData({ ...formData, crp: e.target.value })}
                                        placeholder="00000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado CRP</Label>
                                    <Select
                                        value={formData.crp_estado}
                                        onValueChange={(value) => setFormData({ ...formData, crp_estado: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map((uf) => (
                                                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveUser}>{editingUser ? 'Salvar Alterações' : 'Adicionar'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
