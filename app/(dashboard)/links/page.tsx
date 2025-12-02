'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, Search, Filter, RefreshCw } from 'lucide-react'
import { useLinkPaciente } from '@/lib/hooks/useLinkPaciente'
import LinkManagementTable from '@/components/aplicar/LinkManagementTable'
import LinkProgressCard from '@/components/aplicar/LinkProgressCard'
import TesteSelectorModal from '@/components/aplicar/TesteSelectorModal'
import type { LinkPacienteWithDetails } from '@/types/database'

export default function LinksPage() {
  const {
    links,
    selectedLink,
    isLoading,
    error,
    pagination,
    fetchLinks,
    extendExpiracao,
    revogar,
    setSelectedLink,
    addTestesToHub,
  } = useLinkPaciente()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showDetails, setShowDetails] = useState(false)
  const [showAddTestsModal, setShowAddTestsModal] = useState(false)
  const [selectedTesteIds, setSelectedTesteIds] = useState<string[]>([])
  const [linkForAddTests, setLinkForAddTests] = useState<LinkPacienteWithDetails | null>(null)
  const [isAddingTests, setIsAddingTests] = useState(false)

  useEffect(() => {
    fetchLinks({ page: 1, status: statusFilter || undefined })
  }, [statusFilter])

  const handleRefresh = () => {
    fetchLinks({ page: pagination.currentPage, status: statusFilter || undefined })
  }

  const handleViewDetails = (link: LinkPacienteWithDetails) => {
    setSelectedLink(link)
    setShowDetails(true)
  }

  const handleExtend = async (linkId: string, days: number) => {
    await extendExpiracao(linkId, days)
    handleRefresh()
  }

  const handleRevoke = async (linkId: string) => {
    await revogar(linkId)
    handleRefresh()
  }

  const handleAddTests = (link: LinkPacienteWithDetails) => {
    // Get existing test IDs to exclude from selection
    // const existingTesteIds = link.testes?.map((t) => t.teste_template_id) || []
    setSelectedTesteIds([])
    setLinkForAddTests(link)
    setShowAddTestsModal(true)
  }

  const handleToggleTeste = (testeId: string, selected: boolean) => {
    if (selected) {
      setSelectedTesteIds((prev) => [...prev, testeId])
    } else {
      setSelectedTesteIds((prev) => prev.filter((id) => id !== testeId))
    }
  }

  const handleConfirmAddTests = async (testeIds: string[]) => {
    if (!linkForAddTests || testeIds.length === 0) return

    setIsAddingTests(true)
    const success = await addTestesToHub(linkForAddTests.id, testeIds)
    setIsAddingTests(false)

    if (success) {
      setShowAddTestsModal(false)
      setLinkForAddTests(null)
      setSelectedTesteIds([])
      handleRefresh()
    }
  }

  const handleCloseAddTestsModal = () => {
    setShowAddTestsModal(false)
    setLinkForAddTests(null)
    setSelectedTesteIds([])
  }

  const handlePageChange = (page: number) => {
    fetchLinks({ page, status: statusFilter || undefined })
  }

  const filteredLinks = links
    .filter((link) => {
      if (!search) return true
      const searchLower = search.toLowerCase()
      return (
        link.paciente?.nome_completo?.toLowerCase().includes(searchLower) ||
        link.link_token.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      const nameA = a.paciente?.nome_completo || ''
      const nameB = b.paciente?.nome_completo || ''
      return nameA.localeCompare(nameB, 'pt-BR')
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Link2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Links de Acesso</h1>
            <p className="text-indigo-100">
              Gerencie os links enviados para seus pacientes
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-indigo-200 text-sm">Total</p>
            <p className="text-2xl font-bold">{pagination.total}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-indigo-200 text-sm">Ativos</p>
            <p className="text-2xl font-bold">
              {links.filter((l) => l.status === 'ativo').length}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-indigo-200 text-sm">Completos</p>
            <p className="text-2xl font-bold">
              {links.filter((l) => l.status === 'completo').length}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-indigo-200 text-sm">Expirados</p>
            <p className="text-2xl font-bold">
              {links.filter((l) => new Date(l.data_expiracao) < new Date()).length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="completo">Completos</option>
              <option value="revogado">Revogados</option>
              <option value="expirado">Expirados</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Atualizar</span>
          </button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden"
      >
        <LinkManagementTable
          links={filteredLinks}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onExtend={handleExtend}
          onRevoke={handleRevoke}
          onAddTests={handleAddTests}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Mostrando {(pagination.currentPage - 1) * pagination.pageSize + 1} a{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} de{' '}
              {pagination.total} resultados
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Details Modal */}
      {showDetails && selectedLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <LinkProgressCard
              link={selectedLink}
              onClose={() => {
                setShowDetails(false)
                setSelectedLink(null)
              }}
              showDetails={true}
            />
          </motion.div>
        </div>
      )}

      {/* Add Tests Modal */}
      <TesteSelectorModal
        isOpen={showAddTestsModal}
        onClose={handleCloseAddTestsModal}
        onConfirm={handleConfirmAddTests}
        selectedTesteIds={selectedTesteIds}
        onToggleTeste={handleToggleTeste}
        isLoading={isAddingTests}
      />
    </div>
  )
}
