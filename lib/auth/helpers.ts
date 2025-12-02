import { NextRequest } from 'next/server'

import { AppError } from '@/lib/errors/AppError'
import { Result } from '@/types/core/result'

import { SessionManager, SessionPayload } from './SessionManager'

/**
 * Get authenticated user from request
 * Helper for API routes
 */
export async function getAuthUser(_request: NextRequest): Promise<Result<SessionPayload, AppError>> {
  return SessionManager.requireAuth()
}

/**
 * Require specific role(s) for API route
 */
export async function requireRole(
  _request: NextRequest,
  allowedTypes: Array<'admin' | 'psicologo'>
): Promise<Result<SessionPayload, AppError>> {
  return SessionManager.requireRole(allowedTypes)
}
