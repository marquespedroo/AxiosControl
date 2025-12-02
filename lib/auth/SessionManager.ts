import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'

export interface SessionPayload {
  id: string
  email: string
  clinica_id: string
  nome: string
  roles: string[]
  iat?: number
  exp?: number
}

export class SessionManager {
  private static readonly SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'axioscontrol-jwt-secret-change-in-production-min-32-chars'
  )
  private static readonly COOKIE_NAME = 'auth_token'
  private static readonly TOKEN_EXPIRY = '7d' // 7 days
  private static readonly REFRESH_THRESHOLD = 24 * 60 * 60 // 24 hours in seconds

  /**
   * Create a new session token
   */
  static async create(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<Result<string, AppError>> {
    try {
      const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(this.TOKEN_EXPIRY)
        .sign(this.SECRET)

      // Set HTTP-only cookie
      const cookieStore = await cookies()
      cookieStore.set(this.COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      })

      return success(token)
    } catch (error) {
      return failure(
        new AppError('AUTH_001', 'Falha ao criar sessão', 500, { cause: error })
      )
    }
  }

  /**
   * Verify and decode a session token
   */
  static async verify(token?: string): Promise<Result<SessionPayload, AppError>> {
    try {
      // Get token from parameter or cookie
      let tokenToVerify = token
      if (!tokenToVerify) {
        const cookieStore = await cookies()
        tokenToVerify = cookieStore.get(this.COOKIE_NAME)?.value
      }

      if (!tokenToVerify) {
        return failure(
          new AppError('AUTH_002', 'Token não fornecido', 401)
        )
      }

      const { payload } = await jwtVerify(tokenToVerify, this.SECRET)

      // Check if token needs refresh (within 24 hours of expiry)
      if (payload.exp) {
        const timeUntilExpiry = payload.exp - Math.floor(Date.now() / 1000)
        if (timeUntilExpiry < this.REFRESH_THRESHOLD) {
          // Auto-refresh token
          await this.create({
            id: payload.id as string,
            email: payload.email as string,
            clinica_id: payload.clinica_id as string,
            nome: payload.nome as string,
            roles: payload.roles as string[],
          })
        }
      }

      return success(payload as unknown as SessionPayload)
    } catch (error) {
      return failure(
        new AppError('AUTH_003', 'Token inválido ou expirado', 401, { cause: error })
      )
    }
  }

  /**
   * Destroy the current session
   */
  static async destroy(): Promise<Result<void, AppError>> {
    try {
      const cookieStore = await cookies()
      cookieStore.delete(this.COOKIE_NAME)
      return success(undefined)
    } catch (error) {
      return failure(
        new AppError('AUTH_004', 'Falha ao destruir sessão', 500, { cause: error })
      )
    }
  }

  /**
   * Get current session from cookie
   */
  static async getSession(): Promise<Result<SessionPayload, AppError>> {
    const cookieStore = await cookies()
    const token = cookieStore.get(this.COOKIE_NAME)?.value

    if (!token) {
      return failure(
        new AppError('AUTH_005', 'Nenhuma sessão ativa', 401)
      )
    }

    return this.verify(token)
  }

  /**
   * Refresh session token (extends expiration)
   */
  static async refresh(): Promise<Result<string, AppError>> {
    const sessionResult = await this.getSession()

    if (!sessionResult.success) {
      return failure(sessionResult.error)
    }

    const session = sessionResult.data
    return this.create({
      id: session.id,
      email: session.email,
      clinica_id: session.clinica_id,
      nome: session.nome,
      roles: session.roles,
    })
  }

  /**
   * Validate session and return payload (helper for route handlers)
   */
  static async requireAuth(): Promise<Result<SessionPayload, AppError>> {
    const sessionResult = await this.getSession()

    if (!sessionResult.success) {
      return failure(
        new AppError('AUTH_006', 'Autenticação necessária', 401)
      )
    }

    return sessionResult
  }

  /**
   * Validate session with specific user role requirement
   */
  static async requireRole(
    allowedRoles: string[]
  ): Promise<Result<SessionPayload, AppError>> {
    const authResult = await this.requireAuth()

    if (!authResult.success) {
      return authResult
    }

    const session = authResult.data

    // Check if user has at least one of the allowed roles
    const hasRole = session.roles.some(role => allowedRoles.includes(role))

    if (!hasRole) {
      return failure(
        new AppError('AUTH_007', 'Permissões insuficientes', 403)
      )
    }

    return success(session)
  }
}

