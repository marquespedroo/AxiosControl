import { SupabaseClient } from '@supabase/supabase-js'

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AuthUser } from '@/types/database'

import { supabase } from './client'

// ===================================
// RLS CONTEXT HELPERS
// ===================================

/**
 * Create a Supabase client with RLS context set for the current user.
 * This sets PostgreSQL session variables that RLS policies can check.
 *
 * Use this instead of supabaseAdmin when you want RLS to be enforced
 * but are using custom JWT auth (not Supabase Auth).
 */
export async function createClientWithContext(
  userId: string,
  clinicaId: string
): Promise<SupabaseClient> {
  // Set the session variables for RLS
  await (supabaseAdmin as any).rpc('set_rls_context', {
    p_user_id: userId,
    p_clinica_id: clinicaId,
  })

  return supabaseAdmin
}

/**
 * Execute a database operation with RLS context.
 * Sets the context, runs the operation, then clears it.
 */
export async function withRlsContext<T>(
  userId: string,
  clinicaId: string,
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  // Set context
  const { error: setError } = await (supabaseAdmin as any).rpc('set_rls_context', {
    p_user_id: userId,
    p_clinica_id: clinicaId,
  })

  if (setError) {
    console.error('Failed to set RLS context:', setError)
    throw new Error('Failed to set RLS context')
  }

  try {
    return await operation(supabaseAdmin)
  } finally {
    // Clear context after operation
    try {
      await supabaseAdmin.rpc('clear_rls_context' as any)
    } catch {
      // Ignore errors when clearing
    }
  }
}

// ===================================
// AUTH HELPERS
// ===================================

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) return null

  // Fetch user data with roles and details
  const { data: user, error } = await supabase
    .from('users' as any)
    .select('*, user_roles(role), professional_details(crp)')
    .eq('id', session.user.id)
    .single()

  if (error || !user) return null

  return {
    id: (user as any).id,
    email: (user as any).email,
    nome_completo: (user as any).nome_completo,
    roles: (user as any).user_roles?.map((ur: any) => ur.role) || [],
    clinica_id: (user as any).clinica_id,
    crp: (user as any).professional_details?.[0]?.crp || undefined,
  }
}

/**
 * Get current user's clinic ID
 */
export async function getCurrentClinicaId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.clinica_id || null
}

/**
 * Check if user is clinic admin
 */
export async function isClinicAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return user.roles.includes('clinic_admin')
}

// ===================================
// QUERY HELPERS
// ===================================

/**
 * Generic paginated query
 */
type TableName = 'users' | 'clinicas' | 'pacientes' | 'testes_templates' | 'tabelas_normativas' | 'logs_auditoria' | 'registros_manuais' | 'testes_aplicados'

export async function paginatedQuery<T>({
  table,
  select = '*',
  filters = [],
  page = 1,
  limit = 20,
  orderBy,
}: {
  table: TableName
  select?: string
  filters?: Array<{ column: string; operator: string; value: any }>
  page?: number
  limit?: number
  orderBy?: { column: string; ascending?: boolean }
}) {
  const start = (page - 1) * limit
  const end = start + limit - 1

  let query = supabase.from(table as any).select(select, { count: 'exact' })

  // Apply filters
  filters.forEach(({ column, operator, value }) => {
    query = query.filter(column, operator, value)
  })

  // Apply ordering
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
  }

  // Apply pagination
  query = query.range(start, end)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data as T[],
    meta: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  }
}

/**
 * Check if record exists
 */
export async function recordExists(
  table: TableName,
  column: string,
  value: any
): Promise<boolean> {
  const { data, error } = await supabase
    .from(table as any)
    .select('id')
    .eq(column, value)
    .single()

  return !error && !!data
}

// ===================================
// STORAGE HELPERS
// ===================================

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<{ url: string; path: string }> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  bucket: string,
  files: Array<{ path: string; file: File | Blob }>
): Promise<Array<{ url: string; path: string }>> {
  const uploads = await Promise.all(
    files.map(({ path, file }) => uploadFile(bucket, path, file))
  )
  return uploads
}

// ===================================
// AUDIT LOG HELPERS
// ===================================

/**
 * Create audit log entry
 */
export async function createAuditLog({
  usuario_id,
  acao,
  entidade,
  entidade_id,
  dados_anteriores,
  dados_novos,
  ip_address,
  user_agent,
}: {
  usuario_id?: string | null
  acao: 'visualizar' | 'criar' | 'editar' | 'deletar' | 'exportar'
  entidade: string
  entidade_id: string
  dados_anteriores?: any
  dados_novos?: any
  ip_address?: string
  user_agent?: string
}): Promise<void> {
  await (supabaseAdmin as any).from('logs_auditoria').insert({
    usuario_id: usuario_id || null,
    acao,
    entidade,
    entidade_id,
    dados_anteriores,
    dados_novos,
    ip_origem: ip_address || null,
    user_agent: user_agent || null,
  })
}

// ===================================
// PATIENT HELPERS
// ===================================

/**
 * Calculate patient age
 */
export function calculateAge(dataNascimento: string): number {
  const today = new Date()
  const birthDate = new Date(dataNascimento)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Calculate patient age in months (for children)
 */
export function calculateAgeInMonths(dataNascimento: string): number {
  const today = new Date()
  const birthDate = new Date(dataNascimento)

  const yearDiff = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  return yearDiff * 12 + monthDiff
}

// ===================================
// ERROR HANDLING
// ===================================

/**
 * Format Supabase error for API response
 */
export function formatSupabaseError(error: any): {
  error: string
  message: string
  details?: any
} {
  // PostgreSQL unique violation
  if (error.code === '23505') {
    return {
      error: 'DUPLICATE_ENTRY',
      message: 'Este registro já existe no sistema',
      details: error.details,
    }
  }

  // Foreign key violation
  if (error.code === '23503') {
    return {
      error: 'FOREIGN_KEY_VIOLATION',
      message: 'Operação bloqueada devido a dependências',
      details: error.details,
    }
  }

  // RLS policy violation
  if (error.code === '42501' || error.message?.includes('row-level security')) {
    return {
      error: 'UNAUTHORIZED',
      message: 'Você não tem permissão para acessar este recurso',
    }
  }

  // Generic error
  return {
    error: 'DATABASE_ERROR',
    message: error.message || 'Erro ao processar requisição',
    details: error.details,
  }
}

// ===================================
// TRANSACTION HELPERS
// ===================================

/**
 * Execute multiple operations in a transaction-like manner
 * (Note: Supabase doesn't support real transactions in client, but this helps with rollback)
 */
export async function executeWithRollback<T>(
  operations: Array<() => Promise<any>>,
  rollbackOps?: Array<() => Promise<any>>
): Promise<T> {
  const completedOps: Array<() => Promise<any>> = []

  try {
    for (const op of operations) {
      await op()
      if (rollbackOps) {
        completedOps.push(rollbackOps[operations.indexOf(op)])
      }
    }

    return {} as T
  } catch (error) {
    // Attempt rollback
    if (completedOps.length > 0) {
      for (const rollback of completedOps.reverse()) {
        try {
          await rollback()
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError)
        }
      }
    }

    throw error
  }
}
