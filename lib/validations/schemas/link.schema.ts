import { z } from 'zod'

// ===================================
// STATUS & ENUMS
// ===================================

export const statusLinkPacienteSchema = z.enum(['ativo', 'expirado', 'revogado', 'completo'])
export const modoAplicacaoSchema = z.enum(['presencial', 'entrega', 'link'])

// ===================================
// LINK PACIENTE SCHEMAS
// ===================================

export const linkPacienteSchema = z.object({
  id: z.string().uuid(),
  paciente_id: z.string().uuid(),
  psicologo_id: z.string().uuid(),
  clinica_id: z.string().uuid(),
  link_token: z.string().min(32).max(64),
  codigo_acesso_hash: z.string(),
  codigo_acesso_plain: z.string().length(6).nullable(),
  data_expiracao: z.string().datetime(),
  status: statusLinkPacienteSchema,
  primeiro_acesso: z.string().datetime().nullable(),
  ultimo_acesso: z.string().datetime().nullable(),
  tentativas_falhas: z.number().int().min(0),
  bloqueado: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createLinkPacienteSchema = z.object({
  paciente_id: z.string().uuid({ message: 'ID do paciente inválido' }),
  teste_template_ids: z
    .array(z.string().uuid({ message: 'ID do teste inválido' }))
    .min(1, { message: 'Selecione pelo menos um teste' }),
  dias_expiracao: z
    .number()
    .int()
    .min(1, { message: 'Mínimo de 1 dia' })
    .max(90, { message: 'Máximo de 90 dias' })
    .optional(),
})

export const updateLinkPacienteSchema = z.object({
  data_expiracao: z.string().datetime().optional(),
  status: statusLinkPacienteSchema.optional(),
})

export const extendLinkExpiracaoSchema = z.object({
  dias: z
    .number()
    .int()
    .min(1, { message: 'Mínimo de 1 dia' })
    .max(90, { message: 'Máximo de 90 dias' }),
})

export const addTestesToLinkSchema = z.object({
  teste_template_ids: z
    .array(z.string().uuid({ message: 'ID do teste inválido' }))
    .min(1, { message: 'Selecione pelo menos um teste' }),
})

// ===================================
// LINK TESTE SCHEMAS
// ===================================

export const linkTesteSchema = z.object({
  id: z.string().uuid(),
  link_id: z.string().uuid(),
  teste_aplicado_id: z.string().uuid(),
  ordem: z.number().int().min(0),
  created_at: z.string().datetime(),
})

// ===================================
// PATIENT PORTAL SCHEMAS
// ===================================

export const validarAcessoSchema = z.object({
  token: z.string().min(32, { message: 'Token inválido' }),
  codigo: z
    .string()
    .length(6, { message: 'Código deve ter 6 dígitos' })
    .regex(/^\d{6}$/, { message: 'Código deve conter apenas números' }),
})

// ===================================
// HANDOFF MODE SCHEMAS
// ===================================

export const iniciarHandoffSchema = z.object({
  teste_aplicado_id: z.string().uuid({ message: 'ID do teste inválido' }),
  pin: z
    .string()
    .length(4, { message: 'PIN deve ter 4 dígitos' })
    .regex(/^\d{4}$/, { message: 'PIN deve conter apenas números' }),
})

export const validarPinSchema = z.object({
  session_id: z.string().uuid({ message: 'Sessão inválida' }),
  pin: z
    .string()
    .length(4, { message: 'PIN deve ter 4 dígitos' })
    .regex(/^\d{4}$/, { message: 'PIN deve conter apenas números' }),
})

// ===================================
// CONFIGURAÇÃO SISTEMA SCHEMAS
// ===================================

export const configuracaoSistemaSchema = z.object({
  id: z.string().uuid(),
  clinica_id: z.string().uuid().nullable(),
  chave: z.string().min(1).max(100),
  valor: z.unknown(),
  descricao: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const updateConfiguracaoSchema = z.object({
  valor: z.unknown(),
  descricao: z.string().optional(),
})

// ===================================
// TYPE EXPORTS
// ===================================

export type StatusLinkPaciente = z.infer<typeof statusLinkPacienteSchema>
export type ModoAplicacao = z.infer<typeof modoAplicacaoSchema>
export type LinkPacienteInput = z.infer<typeof linkPacienteSchema>
export type CreateLinkPacienteInput = z.infer<typeof createLinkPacienteSchema>
export type UpdateLinkPacienteInput = z.infer<typeof updateLinkPacienteSchema>
export type ExtendLinkExpiracaoInput = z.infer<typeof extendLinkExpiracaoSchema>
export type AddTestesToLinkInput = z.infer<typeof addTestesToLinkSchema>
export type ValidarAcessoInput = z.infer<typeof validarAcessoSchema>
export type IniciarHandoffInput = z.infer<typeof iniciarHandoffSchema>
export type ValidarPinInput = z.infer<typeof validarPinSchema>
