import { z } from 'zod'

/**
 * Test validation schemas
 */

export const aplicarTesteSchema = z.object({
  paciente_id: z.string().uuid('ID de paciente inválido'),

  teste_template_id: z.string().uuid('ID de teste inválido'),

  psicologo_id: z.string().uuid('ID de psicólogo inválido'),

  tipo_aplicacao: z.enum(['presencial', 'remota', 'manual'], {
    errorMap: () => ({ message: 'Tipo de aplicação inválido' }),
  }),

  data_agendada: z
    .string()
    .refine((date) => {
      const agendada = new Date(date)
      const hoje = new Date()
      return agendada >= hoje
    }, 'Data agendada deve ser futura')
    .optional()
    .nullable(),

  data_expiracao: z
    .string()
    .refine((date) => {
      const expiracao = new Date(date)
      const hoje = new Date()
      return expiracao > hoje
    }, 'Data de expiração deve ser futura')
    .optional()
    .nullable(),

  observacoes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
})

export const responderQuestaoSchema = z.object({
  teste_aplicado_id: z.string().uuid('ID de teste aplicado inválido'),

  questao_numero: z.number().int('Número da questão deve ser inteiro').positive('Número da questão deve ser positivo'),

  resposta: z.union([
    z.number(),
    z.string(),
    z.array(z.number()),
    z.array(z.string()),
  ]),
})

export const finalizarTesteSchema = z.object({
  teste_aplicado_id: z.string().uuid('ID de teste aplicado inválido'),

  confirmar_finalizacao: z
    .boolean()
    .refine((val) => val === true, 'Você deve confirmar a finalização do teste'),
})

export const reabrirTesteSchema = z.object({
  teste_aplicado_id: z.string().uuid('ID de teste aplicado inválido'),

  motivo: z
    .string()
    .min(10, 'Motivo deve ter no mínimo 10 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres'),
})

/**
 * Inferred types
 */
export type AplicarTesteFormData = z.infer<typeof aplicarTesteSchema>
export type ResponderQuestaoFormData = z.infer<typeof responderQuestaoSchema>
export type FinalizarTesteFormData = z.infer<typeof finalizarTesteSchema>
export type ReabrirTesteFormData = z.infer<typeof reabrirTesteSchema>
