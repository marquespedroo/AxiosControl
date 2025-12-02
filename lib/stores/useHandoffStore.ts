import { create } from 'zustand'
import { TesteAplicado } from '@/types/database'

interface HandoffState {
  // Session state
  sessionId: string | null
  isActive: boolean
  isLocked: boolean

  // Test state
  currentTeste: TesteAplicado | null
  testeId: string | null

  // PIN state
  showPinEntry: boolean
  showPinExit: boolean
  pinAttempts: number
  maxAttempts: number

  // Loading state
  isLoading: boolean
  error: string | null
}

interface HandoffActions {
  // Session actions
  startSession: (sessionId: string, teste: TesteAplicado) => void
  endSession: () => void
  lockSession: () => void

  // Test actions
  setCurrentTeste: (teste: TesteAplicado | null) => void
  updateTesteProgress: (progresso: number) => void

  // PIN actions
  openPinEntry: () => void
  closePinEntry: () => void
  openPinExit: () => void
  closePinExit: () => void
  incrementPinAttempts: () => void
  resetPinAttempts: () => void
  setMaxAttempts: (max: number) => void

  // Loading actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Reset
  reset: () => void
}

export type HandoffStore = HandoffState & HandoffActions

const initialState: HandoffState = {
  sessionId: null,
  isActive: false,
  isLocked: false,
  currentTeste: null,
  testeId: null,
  showPinEntry: false,
  showPinExit: false,
  pinAttempts: 0,
  maxAttempts: 3,
  isLoading: false,
  error: null,
}

export const useHandoffStore = create<HandoffStore>()((set) => ({
  ...initialState,

  // Session actions
  startSession: (sessionId, teste) =>
    set({
      sessionId,
      isActive: true,
      isLocked: false,
      currentTeste: teste,
      testeId: teste.id,
      showPinEntry: false,
      error: null,
    }),

  endSession: () =>
    set({
      sessionId: null,
      isActive: false,
      isLocked: false,
      currentTeste: null,
      testeId: null,
      showPinExit: false,
      pinAttempts: 0,
    }),

  lockSession: () =>
    set({
      isLocked: true,
      showPinExit: false,
    }),

  // Test actions
  setCurrentTeste: (teste) =>
    set({
      currentTeste: teste,
      testeId: teste?.id || null,
    }),

  updateTesteProgress: (progresso) =>
    set((state) => ({
      currentTeste: state.currentTeste
        ? { ...state.currentTeste, progresso }
        : null,
    })),

  // PIN actions
  openPinEntry: () => set({ showPinEntry: true }),

  closePinEntry: () => set({ showPinEntry: false }),

  openPinExit: () => set({ showPinExit: true }),

  closePinExit: () => set({ showPinExit: false }),

  incrementPinAttempts: () =>
    set((state) => {
      const newAttempts = state.pinAttempts + 1
      return {
        pinAttempts: newAttempts,
        isLocked: newAttempts >= state.maxAttempts,
      }
    }),

  resetPinAttempts: () => set({ pinAttempts: 0 }),

  setMaxAttempts: (max) => set({ maxAttempts: max }),

  // Loading actions
  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  // Reset
  reset: () => set(initialState),
}))

// Selectors
export const selectIsHandoffActive = (state: HandoffStore) => state.isActive
export const selectIsLocked = (state: HandoffStore) => state.isLocked
export const selectSessionId = (state: HandoffStore) => state.sessionId
export const selectCurrentTeste = (state: HandoffStore) => state.currentTeste

export const selectPinState = (state: HandoffStore) => ({
  showEntry: state.showPinEntry,
  showExit: state.showPinExit,
  attempts: state.pinAttempts,
  maxAttempts: state.maxAttempts,
  remainingAttempts: state.maxAttempts - state.pinAttempts,
})

export const selectCanExit = (state: HandoffStore) =>
  state.isActive && !state.isLocked

export const selectProgress = (state: HandoffStore) =>
  state.currentTeste?.progresso || 0
