import { create } from 'zustand'

import { LinkPacienteWithDetails, ModoAplicacao } from '@/types/database'

interface LinkPacienteState {
  // List state
  links: LinkPacienteWithDetails[]
  isLoading: boolean
  error: string | null
  total: number
  currentPage: number
  pageSize: number

  // Selected link
  selectedLink: LinkPacienteWithDetails | null

  // Mode selection flow
  selectedPacienteId: string | null
  selectedMode: ModoAplicacao | null
  selectedTesteIds: string[]

  // Generated link result
  generatedLink: LinkPacienteWithDetails | null
  shareMessage: string | null
  linkUrl: string | null
}

interface LinkPacienteActions {
  // List actions
  setLinks: (links: LinkPacienteWithDetails[]) => void
  addLink: (link: LinkPacienteWithDetails) => void
  updateLink: (id: string, updates: Partial<LinkPacienteWithDetails>) => void
  removeLink: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPagination: (total: number, page: number, pageSize: number) => void

  // Selection actions
  setSelectedLink: (link: LinkPacienteWithDetails | null) => void
  setSelectedPacienteId: (id: string | null) => void
  setSelectedMode: (mode: ModoAplicacao | null) => void
  setSelectedTesteIds: (ids: string[]) => void
  addSelectedTesteId: (id: string) => void
  removeSelectedTesteId: (id: string) => void
  clearSelection: () => void

  // Generated link actions
  setGeneratedLink: (link: LinkPacienteWithDetails | null) => void
  setShareMessage: (message: string | null) => void
  setLinkUrl: (url: string | null) => void
  clearGeneratedLink: () => void

  // Reset
  reset: () => void
}

export type LinkPacienteStore = LinkPacienteState & LinkPacienteActions

const initialState: LinkPacienteState = {
  links: [],
  isLoading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,
  selectedLink: null,
  selectedPacienteId: null,
  selectedMode: null,
  selectedTesteIds: [],
  generatedLink: null,
  shareMessage: null,
  linkUrl: null,
}

export const useLinkPacienteStore = create<LinkPacienteStore>()((set) => ({
  ...initialState,

  // List actions
  setLinks: (links) => set({ links, error: null }),

  addLink: (link) =>
    set((state) => ({
      links: [link, ...state.links],
      total: state.total + 1,
    })),

  updateLink: (id, updates) =>
    set((state) => ({
      links: state.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      selectedLink:
        state.selectedLink?.id === id
          ? { ...state.selectedLink, ...updates }
          : state.selectedLink,
    })),

  removeLink: (id) =>
    set((state) => ({
      links: state.links.filter((l) => l.id !== id),
      selectedLink: state.selectedLink?.id === id ? null : state.selectedLink,
      total: state.total - 1,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  setPagination: (total, page, pageSize) =>
    set({ total, currentPage: page, pageSize }),

  // Selection actions
  setSelectedLink: (link) => set({ selectedLink: link }),

  setSelectedPacienteId: (id) => set({ selectedPacienteId: id }),

  setSelectedMode: (mode) => set({ selectedMode: mode }),

  setSelectedTesteIds: (ids) => set({ selectedTesteIds: ids }),

  addSelectedTesteId: (id) =>
    set((state) => ({
      selectedTesteIds: state.selectedTesteIds.includes(id)
        ? state.selectedTesteIds
        : [...state.selectedTesteIds, id],
    })),

  removeSelectedTesteId: (id) =>
    set((state) => ({
      selectedTesteIds: state.selectedTesteIds.filter((tid) => tid !== id),
    })),

  clearSelection: () =>
    set({
      selectedPacienteId: null,
      selectedMode: null,
      selectedTesteIds: [],
    }),

  // Generated link actions
  setGeneratedLink: (link) => set({ generatedLink: link }),

  setShareMessage: (message) => set({ shareMessage: message }),

  setLinkUrl: (url) => set({ linkUrl: url }),

  clearGeneratedLink: () =>
    set({
      generatedLink: null,
      shareMessage: null,
      linkUrl: null,
    }),

  // Reset
  reset: () => set(initialState),
}))

// Selectors
export const selectLinks = (state: LinkPacienteStore) => state.links
export const selectSelectedLink = (state: LinkPacienteStore) => state.selectedLink
export const selectIsLoading = (state: LinkPacienteStore) => state.isLoading
export const selectError = (state: LinkPacienteStore) => state.error

export const selectPagination = (state: LinkPacienteStore) => ({
  total: state.total,
  currentPage: state.currentPage,
  pageSize: state.pageSize,
  totalPages: Math.ceil(state.total / state.pageSize),
})

export const selectFlowState = (state: LinkPacienteStore) => ({
  pacienteId: state.selectedPacienteId,
  mode: state.selectedMode,
  testeIds: state.selectedTesteIds,
})

export const selectGeneratedLinkState = (state: LinkPacienteStore) => ({
  link: state.generatedLink,
  message: state.shareMessage,
  url: state.linkUrl,
})

// Computed selectors
export const selectLinkById = (id: string) => (state: LinkPacienteStore) =>
  state.links.find((l) => l.id === id)

export const selectActiveLinks = (state: LinkPacienteStore) =>
  state.links.filter((l) => l.status === 'ativo')

export const selectCanProceed = (state: LinkPacienteStore) => {
  if (!state.selectedPacienteId) return false
  if (!state.selectedMode) return false
  if (state.selectedTesteIds.length === 0) return false
  return true
}
