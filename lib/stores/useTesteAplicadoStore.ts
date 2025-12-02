import { create } from 'zustand'

import { TesteAplicado } from '@/types/database'

type TesteStatus = 'aguardando' | 'em_andamento' | 'finalizado' | 'expirado'

interface TesteAplicadoState {
  testes: TesteAplicado[]
  selectedTeste: TesteAplicado | null
  currentTeste: TesteAplicado | null // For test execution
  isLoading: boolean
  error: string | null
  total: number
  currentPage: number
  pageSize: number
  statusFilter: TesteStatus | 'all'
}

interface TesteAplicadoActions {
  setTestes: (testes: TesteAplicado[]) => void
  setSelectedTeste: (teste: TesteAplicado | null) => void
  setCurrentTeste: (teste: TesteAplicado | null) => void
  addTeste: (teste: TesteAplicado) => void
  updateTeste: (id: string, updates: Partial<TesteAplicado>) => void
  removeTeste: (id: string) => void
  updateRespostas: (questaoId: string, resposta: any) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPagination: (total: number, page: number, pageSize: number) => void
  setStatusFilter: (status: TesteStatus | 'all') => void
  reset: () => void
  resetCurrentTeste: () => void
}

export type TesteAplicadoStore = TesteAplicadoState & TesteAplicadoActions

const initialState: TesteAplicadoState = {
  testes: [],
  selectedTeste: null,
  currentTeste: null,
  isLoading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,
  statusFilter: 'all',
}

/**
 * TesteAplicado store
 * Manages applied test data and test execution
 */
export const useTesteAplicadoStore = create<TesteAplicadoStore>()((set) => ({
  ...initialState,

  // Actions
  setTestes: (testes) =>
    set({ testes, error: null }),

  setSelectedTeste: (teste) =>
    set({ selectedTeste: teste }),

  setCurrentTeste: (teste) =>
    set({ currentTeste: teste }),

  addTeste: (teste) =>
    set((state) => ({
      testes: [teste, ...state.testes],
      total: state.total + 1,
    })),

  updateTeste: (id, updates) =>
    set((state) => ({
      testes: state.testes.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
      selectedTeste:
        state.selectedTeste?.id === id
          ? { ...state.selectedTeste, ...updates }
          : state.selectedTeste,
      currentTeste:
        state.currentTeste?.id === id
          ? { ...state.currentTeste, ...updates }
          : state.currentTeste,
    })),

  removeTeste: (id) =>
    set((state) => ({
      testes: state.testes.filter((t) => t.id !== id),
      selectedTeste:
        state.selectedTeste?.id === id ? null : state.selectedTeste,
      currentTeste:
        state.currentTeste?.id === id ? null : state.currentTeste,
      total: state.total - 1,
    })),

  updateRespostas: (questaoId, resposta) =>
    set((state) => {
      if (!state.currentTeste) return state

      const respostas = {
        ...state.currentTeste.respostas,
        [questaoId]: resposta,
      }

      return {
        currentTeste: {
          ...state.currentTeste,
          respostas,
        },
      }
    }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error, isLoading: false }),

  setPagination: (total, page, pageSize) =>
    set({ total, currentPage: page, pageSize }),

  setStatusFilter: (status) =>
    set({ statusFilter: status, currentPage: 1 }),

  reset: () =>
    set(initialState),

  resetCurrentTeste: () =>
    set({ currentTeste: null }),
}))

// Selectors
export const selectTestes = (state: TesteAplicadoStore) => state.testes
export const selectSelectedTeste = (state: TesteAplicadoStore) => state.selectedTeste
export const selectCurrentTeste = (state: TesteAplicadoStore) => state.currentTeste
export const selectIsLoading = (state: TesteAplicadoStore) => state.isLoading
export const selectError = (state: TesteAplicadoStore) => state.error
export const selectPagination = (state: TesteAplicadoStore) => ({
  total: state.total,
  currentPage: state.currentPage,
  pageSize: state.pageSize,
  totalPages: Math.ceil(state.total / state.pageSize),
})
export const selectStatusFilter = (state: TesteAplicadoStore) => state.statusFilter

// Computed selectors
export const selectTesteById = (id: string) => (state: TesteAplicadoStore) =>
  state.testes.find((t) => t.id === id)

export const selectTestesByStatus = (status: TesteStatus) => (state: TesteAplicadoStore) =>
  state.testes.filter((t) => t.status === status)

export const selectFilteredTestes = (state: TesteAplicadoStore) => {
  if (state.statusFilter === 'all') return state.testes
  return state.testes.filter((t) => t.status === state.statusFilter)
}

export const selectCurrentRespostas = (state: TesteAplicadoStore) =>
  state.currentTeste?.respostas || {}

export const selectAnsweredQuestions = (state: TesteAplicadoStore) => {
  const respostas = state.currentTeste?.respostas || {}
  return Object.keys(respostas).length
}

export const selectIsTesteComplete = (totalQuestions: number) => (state: TesteAplicadoStore) => {
  const answered = selectAnsweredQuestions(state)
  return answered === totalQuestions && answered > 0
}
