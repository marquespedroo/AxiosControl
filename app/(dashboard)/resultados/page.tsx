'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Search,
  Calendar,
  User,
  Brain,
  Eye,
  Download,
  Filter,
  X,
  ChevronDown,
  CalendarDays,
  CalendarRange,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useMemo } from 'react'

interface TesteTemplate {
  id: string
  nome: string
  sigla: string
}

interface Resultado {
  id: string
  paciente_nome: string
  teste_nome: string
  teste_sigla: string
  teste_template_id: string
  data_aplicacao: string
  status: string
}

interface Filters {
  search: string
  testeTemplateId: string
  status: string
  dateType: 'none' | 'specific' | 'range'
  dataEspecifica: string
  dataInicio: string
  dataFim: string
}

const initialFilters: Filters = {
  search: '',
  testeTemplateId: '',
  status: '',
  dateType: 'none',
  dataEspecifica: '',
  dataInicio: '',
  dataFim: '',
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'aguardando', label: 'Aguardando' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'completo', label: 'Concluído' },
  { value: 'expirado', label: 'Expirado' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  completo: { label: 'Concluído', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  em_andamento: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  aguardando: { label: 'Aguardando', color: 'bg-blue-100 text-blue-700', icon: Clock },
  expirado: { label: 'Expirado', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

// Helper to format date string (YYYY-MM-DD) to locale without timezone issues
const formatDateString = (dateStr: string): string => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export default function ResultadosPage() {
  const router = useRouter()
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [availableTemplates, setAvailableTemplates] = useState<TesteTemplate[]>([])
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Build query string from filters
  const buildQueryString = useCallback((currentFilters: Filters): string => {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('limit', '100')

    if (currentFilters.search) {
      params.set('search', currentFilters.search)
    }
    if (currentFilters.testeTemplateId) {
      params.set('teste_template_id', currentFilters.testeTemplateId)
    }
    if (currentFilters.status) {
      params.set('status', currentFilters.status)
    }

    // Date filters based on type
    if (currentFilters.dateType === 'specific' && currentFilters.dataEspecifica) {
      params.set('data_especifica', currentFilters.dataEspecifica)
    } else if (currentFilters.dateType === 'range') {
      if (currentFilters.dataInicio) {
        params.set('data_inicio', currentFilters.dataInicio)
      }
      if (currentFilters.dataFim) {
        params.set('data_fim', currentFilters.dataFim)
      }
    }

    return params.toString()
  }, [])

  // Fetch results
  const fetchResultados = useCallback(async (currentFilters: Filters) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      const queryString = buildQueryString(currentFilters)
      const response = await fetch(`/api/testes-aplicados?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao buscar resultados')
      }

      const data = await response.json()
      setResultados(data.data || [])

      // Set available templates from first load (unfiltered)
      if (data.filters?.availableTemplates && availableTemplates.length === 0) {
        setAvailableTemplates(data.filters.availableTemplates)
      }
    } catch (err: any) {
      console.error('Error fetching results:', err)
      setError(err.message || 'Erro ao carregar resultados')
    } finally {
      setIsLoading(false)
    }
  }, [buildQueryString, availableTemplates.length])

  // Initial load - fetch all templates first
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = localStorage.getItem('auth_token')

        // First, fetch all test templates for the filter dropdown
        const templatesResponse = await fetch('/api/testes-templates?limit=100', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json()
          if (templatesData.data) {
            setAvailableTemplates(templatesData.data.map((t: any) => ({
              id: t.id,
              nome: t.nome,
              sigla: t.sigla || ''
            })))
          }
        }
      } catch (err) {
        console.error('Error loading templates:', err)
      }

      // Then fetch results
      fetchResultados(initialFilters)
    }

    loadInitialData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update filter and refetch
  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }

      // Reset date fields when changing date type
      if (key === 'dateType') {
        if (value === 'none') {
          newFilters.dataEspecifica = ''
          newFilters.dataInicio = ''
          newFilters.dataFim = ''
        } else if (value === 'specific') {
          newFilters.dataInicio = ''
          newFilters.dataFim = ''
        } else if (value === 'range') {
          newFilters.dataEspecifica = ''
        }
      }

      return newFilters
    })
  }, [])

  // Apply filters (trigger fetch)
  const applyFilters = useCallback(() => {
    fetchResultados(filters)
  }, [fetchResultados, filters])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    fetchResultados(initialFilters)
  }, [fetchResultados])

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.testeTemplateId !== '' ||
      filters.status !== '' ||
      filters.dateType !== 'none'
    )
  }, [filters])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.testeTemplateId) count++
    if (filters.status) count++
    if (filters.dateType !== 'none') count++
    return count
  }, [filters])

  // Statistics
  const stats = useMemo(() => ({
    total: resultados.length,
    concluidos: resultados.filter(r => r.status === 'completo' || r.status === 'concluido').length,
    emAndamento: resultados.filter(r => r.status === 'em_andamento').length,
    aguardando: resultados.filter(r => r.status === 'aguardando').length,
  }), [resultados])

  // Get status display config
  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || { label: 'Pendente', color: 'bg-gray-100 text-gray-700', icon: Clock }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Resultados</h1>
            <p className="text-green-100">Visualize e analise os resultados dos testes aplicados</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-green-100">Total de Testes</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-green-100">Concluídos</p>
            <p className="text-2xl font-bold mt-1">{stats.concluidos}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-green-100">Em Andamento</p>
            <p className="text-2xl font-bold mt-1">{stats.emAndamento}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-green-100">Aguardando</p>
            <p className="text-2xl font-bold mt-1">{stats.aguardando}</p>
          </div>
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden"
      >
        {/* Search and Filter Toggle */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente ou teste..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                isFiltersOpen || hasActiveFilters
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
                  : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Apply/Reset Buttons */}
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Buscar
              </button>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  <RefreshCw className="w-5 h-5" />
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Test Template Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Brain className="w-4 h-4 inline mr-2" />
                      Tipo de Teste
                    </label>
                    <select
                      value={filters.testeTemplateId}
                      onChange={(e) => updateFilter('testeTemplateId', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="">Todos os testes</option>
                      {availableTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.sigla ? `${template.sigla} - ${template.nome}` : template.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <CheckCircle2 className="w-4 h-4 inline mr-2" />
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => updateFilter('status', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Filtro de Data
                    </label>
                    <select
                      value={filters.dateType}
                      onChange={(e) => updateFilter('dateType', e.target.value as Filters['dateType'])}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="none">Sem filtro de data</option>
                      <option value="specific">Data específica</option>
                      <option value="range">Intervalo de datas</option>
                    </select>
                  </div>

                  {/* Date Inputs - Conditional */}
                  {filters.dateType === 'specific' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <CalendarDays className="w-4 h-4 inline mr-2" />
                        Data Específica
                      </label>
                      <input
                        type="date"
                        value={filters.dataEspecifica}
                        onChange={(e) => updateFilter('dataEspecifica', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}

                  {filters.dateType === 'range' && (
                    <>
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <CalendarRange className="w-4 h-4 inline mr-2" />
                          Intervalo de Datas
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="date"
                            value={filters.dataInicio}
                            onChange={(e) => updateFilter('dataInicio', e.target.value)}
                            placeholder="Data inicial"
                            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          />
                          <span className="text-gray-500">até</span>
                          <input
                            type="date"
                            value={filters.dataFim}
                            onChange={(e) => updateFilter('dataFim', e.target.value)}
                            placeholder="Data final"
                            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Active Filters Tags */}
                {hasActiveFilters && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Filtros ativos:</span>

                    {filters.search && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm dark:bg-green-900/30 dark:text-green-300">
                        Busca: "{filters.search}"
                        <button onClick={() => updateFilter('search', '')} className="hover:text-green-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {filters.testeTemplateId && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm dark:bg-blue-900/30 dark:text-blue-300">
                        Teste: {availableTemplates.find(t => t.id === filters.testeTemplateId)?.sigla ||
                                availableTemplates.find(t => t.id === filters.testeTemplateId)?.nome || 'Selecionado'}
                        <button onClick={() => updateFilter('testeTemplateId', '')} className="hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {filters.status && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm dark:bg-purple-900/30 dark:text-purple-300">
                        Status: {STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
                        <button onClick={() => updateFilter('status', '')} className="hover:text-purple-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {filters.dateType === 'specific' && filters.dataEspecifica && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm dark:bg-orange-900/30 dark:text-orange-300">
                        Data: {formatDateString(filters.dataEspecifica)}
                        <button onClick={() => updateFilter('dateType', 'none')} className="hover:text-orange-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    {filters.dateType === 'range' && (filters.dataInicio || filters.dataFim) && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm dark:bg-orange-900/30 dark:text-orange-300">
                        Período: {filters.dataInicio ? formatDateString(filters.dataInicio) : '...'} - {filters.dataFim ? formatDateString(filters.dataFim) : '...'}
                        <button onClick={() => updateFilter('dateType', 'none')} className="hover:text-orange-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando resultados...</span>
        </motion.div>
      )}

      {/* Results List */}
      {!isLoading && !error && (
        <>
          {resultados.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-10 w-10 text-green-600" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                  {hasActiveFilters ? 'Nenhum resultado encontrado com os filtros aplicados' : 'Nenhum resultado disponível'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {hasActiveFilters ? 'Tente ajustar os filtros de busca' : 'Os resultados aparecerão aqui após a aplicação dos testes'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Limpar filtros
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Results count */}
              <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
                {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
              </p>

              {resultados.map((resultado, index) => {
                const statusConfig = getStatusConfig(resultado.status)
                const StatusIcon = statusConfig.icon

                return (
                  <motion.button
                    key={resultado.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    onClick={() => router.push(`/resultados/${resultado.id}`)}
                    className="w-full group"
                  >
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            {resultado.paciente_nome?.charAt(0).toUpperCase() || 'P'}
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {resultado.paciente_nome || 'Paciente'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                              <Brain className="w-4 h-4" />
                              {resultado.teste_sigla ? `${resultado.teste_sigla} - ` : ''}{resultado.teste_nome || 'Teste'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 justify-end">
                              <Calendar className="w-4 h-4" />
                              {resultado.data_aplicacao ? new Date(resultado.data_aplicacao).toLocaleDateString('pt-BR') : '-'}
                            </p>
                            <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              <Download className="w-5 h-5 text-gray-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
