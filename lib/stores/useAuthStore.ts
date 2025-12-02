import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  nome: string
  roles: string[]
  clinica_id: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export type AuthStore = AuthState & AuthActions

/**
 * Authentication store
 * Manages user session and authentication state
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) =>
        set({ token }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selectors
export const selectUser = (state: AuthStore) => state.user
export const selectToken = (state: AuthStore) => state.token
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated
export const selectIsLoading = (state: AuthStore) => state.isLoading
export const selectClinicaId = (state: AuthStore) => state.user?.clinica_id
export const selectUserId = (state: AuthStore) => state.user?.id
export const selectUserRoles = (state: AuthStore) => state.user?.roles || []
export const selectIsSuperAdmin = (state: AuthStore) => state.user?.roles.includes('super_admin') || false
export const selectIsClinicAdmin = (state: AuthStore) => state.user?.roles.includes('clinic_admin') || false

