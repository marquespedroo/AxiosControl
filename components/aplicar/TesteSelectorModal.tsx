'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/atoms/Button'
import { useTestesTemplates } from '@/lib/hooks/useApi'

interface TesteTemplate {
  id: string
  nome: string
  sigla: string
  descricao?: string
  tempo_estimado?: number
  tipo: string
}

interface TesteSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (testeIds: string[]) => void
  selectedTesteIds: string[]
  onToggleTeste: (testeId: string, selected: boolean) => void
  isLoading?: boolean
}

export default function TesteSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  selectedTesteIds,
  onToggleTeste,
  isLoading = false,
}: TesteSelectorModalProps) {
  const testesApi = useTestesTemplates()
  const [testes, setTestes] = useState<TesteTemplate[]>([])
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadTestes()
    }
  }, [isOpen])

  const loadTestes = async () => {
    setLoading(true)
    const result = await testesApi.list({ limit: 100 })
    if (result?.data) {
      setTestes(result.data)
    }
    setLoading(false)
  }

  if (!isOpen) return null

  const filteredTestes = testes
    .filter((teste) => {
      const matchesSearch =
        !search ||
        teste.nome.toLowerCase().includes(search.toLowerCase()) ||
        teste.sigla.toLowerCase().includes(search.toLowerCase())
      const matchesTipo = !tipoFilter || teste.tipo === tipoFilter
      return matchesSearch && matchesTipo
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  const tipos = [...new Set(testes.map((t) => t.tipo))].filter(Boolean)

  const handleToggle = (testeId: string) => {
    const isSelected = selectedTesteIds.includes(testeId)
    onToggleTeste(testeId, !isSelected)
  }

  const handleSelectAll = () => {
    filteredTestes.forEach((teste) => {
      if (!selectedTesteIds.includes(teste.id)) {
        onToggleTeste(teste.id, true)
      }
    })
  }

  const handleClearAll = () => {
    selectedTesteIds.forEach((id) => {
      onToggleTeste(id, false)
    })
  }

  const handleConfirm = () => {
    if (selectedTesteIds.length > 0) {
      onConfirm(selectedTesteIds)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 m-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Selecionar Testes</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedTesteIds.length} teste{selectedTesteIds.length !== 1 ? 's' : ''}{' '}
              selecionado{selectedTesteIds.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar testes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Selection Controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Selecionar todos
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Limpar seleção
          </button>
        </div>

        {/* Tests List */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : filteredTestes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>Nenhum teste encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTestes.map((teste) => {
                const isSelected = selectedTesteIds.includes(teste.id)
                return (
                  <label
                    key={teste.id}
                    className={`
                      flex items-start gap-4 p-4 cursor-pointer transition-colors
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(teste.id)}
                      className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {teste.sigla}
                        </span>
                        <span className="text-gray-600">{teste.nome}</span>
                        {teste.tipo && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            {teste.tipo}
                          </span>
                        )}
                      </div>
                      {teste.descricao && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {teste.descricao}
                        </p>
                      )}
                      {teste.tempo_estimado && (
                        <p className="text-xs text-gray-400 mt-1">
                          Tempo estimado: ~{teste.tempo_estimado} min
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {selectedTesteIds.length === 0
              ? 'Selecione pelo menos um teste'
              : `${selectedTesteIds.length} selecionado${
                  selectedTesteIds.length !== 1 ? 's' : ''
                }`}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedTesteIds.length === 0 || isLoading}
              isLoading={isLoading}
            >
              Confirmar Seleção
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
