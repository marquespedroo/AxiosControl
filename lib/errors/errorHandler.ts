/**
 * Centralized Error Handler
 * Single Responsibility: Transform errors into HTTP responses
 */

import { NextResponse } from 'next/server'
import { AppError, InternalServerError } from './AppError'
import { ZodError } from 'zod'

/**
 * Handle API errors and return appropriate NextResponse
 */
export function handleApiError(error: unknown): NextResponse {
  // Log error for monitoring
  if (process.env.NODE_ENV !== 'production') {
    console.error('[API Error]', error)
  }

  // Handle AppError hierarchy
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    )
  }

  // Handle database errors
  if (error && typeof error === 'object' && 'code' in error) {
    return handleDatabaseError(error as DatabaseErrorType)
  }

  // Generic error fallback
  const genericError = new InternalServerError(
    'Erro inesperado no servidor',
    process.env.NODE_ENV !== 'production' ? error : undefined
  )

  return NextResponse.json(genericError.toJSON(), { status: 500 })
}

/**
 * Database-specific error handling
 */
interface DatabaseErrorType {
  code?: string
  message?: string
  details?: string
}

function handleDatabaseError(error: DatabaseErrorType): NextResponse {
  // PostgreSQL unique violation
  if (error.code === '23505') {
    return NextResponse.json(
      {
        error: 'DUPLICATE_ENTRY',
        message: 'Este registro já existe no sistema',
        details: error.details,
      },
      { status: 409 }
    )
  }

  // PostgreSQL foreign key violation
  if (error.code === '23503') {
    return NextResponse.json(
      {
        error: 'FOREIGN_KEY_VIOLATION',
        message: 'Operação bloqueada devido a dependências',
        details: error.details,
      },
      { status: 409 }
    )
  }

  // RLS policy violation
  if (error.code === '42501' || error.message?.includes('row-level security')) {
    return NextResponse.json(
      {
        error: 'UNAUTHORIZED',
        message: 'Você não tem permissão para acessar este recurso',
      },
      { status: 403 }
    )
  }

  // Generic database error
  return NextResponse.json(
    {
      error: 'DATABASE_ERROR',
      message: error.message || 'Erro ao processar requisição no banco de dados',
      ...(process.env.NODE_ENV !== 'production' && { details: error.details }),
    },
    { status: 500 }
  )
}

/**
 * Error logger for monitoring services
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  // TODO: Integrate with monitoring service (Sentry, DataDog, etc.)
  console.error('[Error Log]', {
    error,
    context,
    timestamp: new Date().toISOString(),
  })
}
