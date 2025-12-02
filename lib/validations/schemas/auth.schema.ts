import { z } from 'zod'

/**
 * Authentication validation schemas
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),

  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerPsicologoSchema = z.object({
  nome_completo: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),

  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),

  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),

  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),

  crp: z
    .string()
    .min(1, 'CRP é obrigatório')
    .regex(/^\d{2}\/\d{5}$/, 'CRP deve estar no formato 00/00000'),

  crp_estado: z
    .string()
    .length(2, 'Estado do CRP deve ter 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'Estado do CRP deve conter apenas letras maiúsculas'),

  clinica_id: z.string().uuid('ID de clínica inválido'),

  especialidades: z.array(z.string()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual é obrigatória'),

  newPassword: z
    .string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Nova senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Nova senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Nova senha deve conter pelo menos um número'),

  confirmNewPassword: z.string().min(1, 'Confirmação de nova senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmNewPassword'],
})

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
})

/**
 * Inferred types
 */
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterPsicologoFormData = z.infer<typeof registerPsicologoSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
