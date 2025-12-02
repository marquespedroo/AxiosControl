/**
 * Application Error Hierarchy
 * SOLID Principle: Liskov Substitution - All errors can be used interchangeably
 */

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    const result: Record<string, any> = {
      error: this.code,
      message: this.message,
    }
    if (this.details) {
      result.details = this.details
    }
    return result
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details)
  }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autenticado', details?: unknown) {
    super('AUTHENTICATION_ERROR', message, 401, details)
  }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Acesso negado', details?: unknown) {
    super('AUTHORIZATION_ERROR', message, 403, details)
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} com identificador ${identifier} não encontrado`
      : `${resource} não encontrado`
    super('NOT_FOUND', message, 404)
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super('CONFLICT', message, 409, details)
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Erro interno no servidor', details?: unknown) {
    super('INTERNAL_ERROR', message, 500, details)
  }
}

/**
 * Calculation Error
 */
export class CalculationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('CALCULATION_ERROR', message, 422, details)
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super('DATABASE_ERROR', message, 500, details)
  }
}
