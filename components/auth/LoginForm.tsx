'use client'

import { useState } from 'react'
import { AuthSession } from '@/types/database'
import { useAuthStore } from '@/lib/stores/useAuthStore'

interface LoginFormProps {
  onSuccess?: (session: AuthSession) => void
  redirectTo?: string
}

export default function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const authStore = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Client-side validation
      if (!email || !password) {
        setError('Email e senha são obrigatórios')
        setIsLoading(false)
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Email inválido')
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError('Senha deve ter no mínimo 6 caracteres')
        setIsLoading(false)
        return
      }

      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Erro ao fazer login')
        setIsLoading(false)
        return
      }

      // Store session in localStorage for client-side use
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('refresh_token', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))

      // IMPORTANT: Also populate the Zustand auth store
      // This ensures components using useAuthStore can access user data including is_super_admin
      authStore.login(data.user, data.token)

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data)
      }

      // IMPORTANT: window.location is required here because:
      // 1. Server sets cookie via Set-Cookie header
      // 2. Browser receives and stores cookie
      // 3. router.push() makes immediate prefetch request before cookie is processed
      // 4. Middleware sees no cookie and redirects back to login
      // Solution: Full page navigation ensures cookie is sent with the request
      window.location.href = redirectTo
    } catch (err: any) {
      setError('Erro ao conectar com o servidor')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="seu@email.com"
          autoComplete="email"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
