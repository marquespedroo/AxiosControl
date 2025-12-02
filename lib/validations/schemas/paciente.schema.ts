import { z } from 'zod'

/**
 * Paciente validation schemas
 */

// CPF validation helper
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

// Phone validation helper
const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/

export const pacienteSchema = z.object({
  nome_completo: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),

  data_nascimento: z
    .string()
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 0 && age <= 150
    }, 'Data de nascimento inválida'),

  sexo: z.enum(['masculino', 'feminino', 'outro'], {
    errorMap: () => ({ message: 'Sexo deve ser masculino, feminino ou outro' }),
  }),

  escolaridade_anos: z
    .number()
    .int('Escolaridade deve ser um número inteiro')
    .min(0, 'Escolaridade não pode ser negativa')
    .max(30, 'Escolaridade não pode exceder 30 anos')
    .optional()
    .nullable(),

  escolaridade_nivel: z
    .enum([
      'fundamental_incompleto',
      'fundamental_completo',
      'medio_incompleto',
      'medio_completo',
      'superior_incompleto',
      'superior_completo',
      'pos_graduacao',
    ])
    .optional()
    .nullable(),

  cpf: z
    .string()
    .regex(cpfRegex, 'CPF deve estar no formato 000.000.000-00')
    .optional()
    .nullable()
    .or(z.literal('')),

  rg: z.string().max(20, 'RG deve ter no máximo 20 caracteres').optional().nullable(),

  telefone: z
    .string()
    .regex(phoneRegex, 'Telefone deve estar no formato (00) 00000-0000')
    .optional()
    .nullable()
    .or(z.literal('')),

  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),

  endereco: z
    .object({
      rua: z.string().optional(),
      numero: z.string().optional(),
      complemento: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
      cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000').optional(),
    })
    .optional()
    .nullable(),

  responsavel_nome: z.string().max(200).optional().nullable(),

  responsavel_parentesco: z.string().max(50).optional().nullable(),

  responsavel_telefone: z
    .string()
    .regex(phoneRegex, 'Telefone deve estar no formato (00) 00000-0000')
    .optional()
    .nullable()
    .or(z.literal('')),

  observacoes: z.string().max(2000, 'Observações devem ter no máximo 2000 caracteres').optional().nullable(),

  clinica_id: z.string().uuid('ID de clínica inválido'),
})

export const pacienteUpdateSchema = pacienteSchema.partial().required({ clinica_id: true })

export const pacienteCreateSchema = pacienteSchema
  .omit({ clinica_id: true })
  .refine(
    (data) => data.escolaridade_anos != null || data.escolaridade_nivel != null,
    {
      message: 'Informe anos de estudo OU nível educacional',
      path: ['escolaridade_anos'],
    }
  )

/**
 * Inferred types
 */
export type PacienteFormData = z.infer<typeof pacienteSchema>
export type PacienteUpdateFormData = z.infer<typeof pacienteUpdateSchema>
export type PacienteCreateFormData = z.infer<typeof pacienteCreateSchema>
