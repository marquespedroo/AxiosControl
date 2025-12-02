'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { usePacientes } from '@/lib/hooks/usePacientes'

import { Button, Textarea } from '../atoms'
import { FormField } from '../molecules'

const pacienteSchema = z.object({
    nome_completo: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    data_nascimento: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data inválida',
    }),
    sexo: z.enum(['M', 'F'], {
        errorMap: () => ({ message: 'Selecione o sexo' }),
    }),
    escolaridade: z.string().optional(),
    observacoes: z.string().optional(),
})

type PacienteFormData = z.infer<typeof pacienteSchema>

export interface PacienteFormProps {
    onSuccess?: () => void
    initialData?: Partial<PacienteFormData>
}

export const PacienteForm: React.FC<PacienteFormProps> = ({ onSuccess, initialData }) => {
    const { createPaciente, isLoading } = usePacientes()
    const [error, setError] = React.useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PacienteFormData>({
        resolver: zodResolver(pacienteSchema),
        defaultValues: initialData,
    })

    const onSubmit = async (data: PacienteFormData) => {
        setError(null)
        try {
            await createPaciente({
                ...data,
                data_nascimento: new Date(data.data_nascimento).toISOString(),
            } as any)
            onSuccess?.()
        } catch (err) {
            setError('Erro ao salvar paciente')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            <FormField
                label="Nome Completo"
                {...register('nome_completo')}
                error={errors.nome_completo?.message}
                required
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                    label="Data de Nascimento"
                    type="date"
                    {...register('data_nascimento')}
                    error={errors.data_nascimento?.message}
                    required
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Sexo
                    </label>
                    <select
                        {...register('sexo')}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Selecione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                    </select>
                    {errors.sexo && (
                        <p className="text-sm font-medium text-destructive">{errors.sexo.message}</p>
                    )}
                </div>
            </div>

            <FormField
                label="Escolaridade"
                {...register('escolaridade')}
                error={errors.escolaridade?.message}
            />

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Observações
                </label>
                <Textarea
                    {...register('observacoes')}
                />
                {errors.observacoes && (
                    <p className="text-sm font-medium text-destructive">{errors.observacoes.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
                Salvar Paciente
            </Button>
        </form>
    )
}
