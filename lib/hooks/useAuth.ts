'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, selectUser, selectIsAuthenticated } from '@/lib/stores/useAuthStore'

/**
 * Custom hook for authentication operations
 * Integrates with useAuthStore and auth API routes
 */
export function useAuth() {
  const router = useRouter()

  // Store state
  const user = useAuthStore(selectUser)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  // Store actions
  const { login: loginStore, logout: logoutStore, setLoading } = useAuthStore()

  /**
   * Login user
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          setLoading(false)
          return {
            success: false,
            error: data.error || 'Erro ao fazer login',
          }
        }

        // Update store
        loginStore(data.user, data.token)

        // Redirect to dashboard
        router.push('/dashboard')

        return { success: true }
      } catch (error) {
        setLoading(false)
        return {
          success: false,
          error: 'Erro de conexão',
        }
      }
    },
    [loginStore, setLoading, router]
  )

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Clear store
    logoutStore()

    // Redirect to login
    router.push('/login')
  }, [logoutStore, router])

  /**
   * Check and refresh session
   */
  const refreshSession = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      })

      if (!response.ok) {
        logoutStore()
        setLoading(false)
        return false
      }

      const data = await response.json()
      loginStore(data.user, data.token)
      setLoading(false)
      return true
    } catch (error) {
      logoutStore()
      setLoading(false)
      return false
    }
  }, [loginStore, logoutStore, setLoading])

  return {
    // State
    user,
    isAuthenticated,

    // Actions
    login,
    logout,
    refreshSession,
  }
}
