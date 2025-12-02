import { create } from 'zustand'

import { Paciente } from '@/types/database'

interface PacienteState {
  pacientes: Paciente[]
  selectedPaciente: Paciente | null
  isLoading: boolean
  error: string | null
  total: number
  currentPage: number
  pageSize: number
  searchQuery: string
}

interface PacienteActions {
  setPacientes: (pacientes: Paciente[]) => void
  setSelectedPaciente: (paciente: Paciente | null) => void
  addPaciente: (paciente: Paciente) => void
  updatePaciente: (id: string, updates: Partial<Paciente>) => void
  removePaciente: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPagination: (total: number, page: number, pageSize: number) => void
  setSearchQuery: (query: string) => void
  reset: () => void
}

export type PacienteStore = PacienteState & PacienteActions

const initialState: PacienteState = {
  pacientes: [],
  selectedPaciente: null,
  isLoading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,
  searchQuery: '',
}

/**
 * Paciente store
 * Manages patient data and operations
 */
export const usePacienteStore = create<PacienteStore>()((set) => ({
  ...initialState,

  // Actions
  setPacientes: (pacientes) =>
    set({ pacientes, error: null }),

  setSelectedPaciente: (paciente) =>
    set({ selectedPaciente: paciente }),

  addPaciente: (paciente) =>
    set((state) => ({
      pacientes: [paciente, ...state.pacientes],
      total: state.total + 1,
    })),

  updatePaciente: (id, updates) =>
    set((state) => ({
      pacientes: state.pacientes.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      selectedPaciente:
        state.selectedPaciente?.id === id
          ? { ...state.selectedPaciente, ...updates }
          : state.selectedPaciente,
    })),

  removePaciente: (id) =>
    set((state) => ({
      pacientes: state.pacientes.filter((p) => p.id !== id),
      selectedPaciente:
        state.selectedPaciente?.id === id ? null : state.selectedPaciente,
      total: state.total - 1,
    })),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error, isLoading: false }),

  setPagination: (total, page, pageSize) =>
    set({ total, currentPage: page, pageSize }),

  setSearchQuery: (query) =>
    set({ searchQuery: query, currentPage: 1 }),

  reset: () =>
    set(initialState),
}))

// Selectors
export const selectPacientes = (state: PacienteStore) => state.pacientes
export const selectSelectedPaciente = (state: PacienteStore) => state.selectedPaciente
export const selectIsLoading = (state: PacienteStore) => state.isLoading
export const selectError = (state: PacienteStore) => state.error
export const selectPagination = (state: PacienteStore) => ({
  total: state.total,
  currentPage: state.currentPage,
  pageSize: state.pageSize,
  totalPages: Math.ceil(state.total / state.pageSize),
})
export const selectSearchQuery = (state: PacienteStore) => state.searchQuery

// Computed selectors
export const selectPacienteById = (id: string) => (state: PacienteStore) =>
  state.pacientes.find((p) => p.id === id)

export const selectActivePacientes = (state: PacienteStore) =>
  state.pacientes.filter((p) => p.ativo)
