'use client'

import { motion } from 'framer-motion'
// Card components available if needed: import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Book, Search, Copy, Sparkles, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { TesteTemplate } from '@/types/database'

export default function BibliotecaPage() {
  const [templates, setTemplates] = useState<TesteTemplate[]>([])
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<string>('')
  const [publicoFilter, setPublicoFilter] = useState<string>('')

  useEffect(() => {
    // Fetch templates in background, don't block rendering
    const fetchTemplates = async () => {
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '50',
          ativo: 'true',
          ...(tipoFilter && { tipo: tipoFilter }),
          ...(publicoFilter && { publico: publicoFilter }),
        })

        const response = await fetch(`/api/testes-templates?${params}`)
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.data || [])
        } else {
          console.error('Error response:', await response.text())
        }
      } catch (error) {
        console.error('Error fetching templates:', error)
      }
    }

    fetchTemplates()
  }, [tipoFilter, publicoFilter])

  const duplicateTemplate = async (id: string) => {
    const newName = prompt('Nome do novo teste:')
    if (!newName) return

    try {
      const response = await fetch(`/api/testes-templates/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      })

      if (response.ok) {
        alert('Teste duplicado com sucesso!')
        // Refetch templates
        const params = new URLSearchParams({
          page: '1',
          limit: '50',
          ativo: 'true',
          ...(tipoFilter && { tipo: tipoFilter }),
          ...(publicoFilter && { publico: publicoFilter }),
        })
        const refreshResponse = await fetch(`/api/testes-templates?${params}`)
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setTemplates(data.data || [])
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao duplicar teste')
      }
    } catch (error) {
      console.error('Error duplicating template:', error)
      alert('Erro ao duplicar teste')
    }
  }

  const filteredTemplates = templates
    .filter(t =>
      t.nome.toLowerCase().includes(search.toLowerCase()) ||
      t.sigla?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Book className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Biblioteca de Testes</h1>
              <p className="text-indigo-100">Gerencie os templates de testes disponíveis</p>
            </div>
          </div>
          <motion.button
            onClick={() => router.push('/biblioteca/novo')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Novo Teste
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/50">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou sigla..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Todos os tipos</option>
              <option value="escala_likert">Escala Likert</option>
              <option value="multipla_escolha">Múltipla Escolha</option>
              <option value="manual">Manual</option>
            </select>
            <select
              value={publicoFilter}
              onChange={(e) => setPublicoFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Todos</option>
              <option value="true">Públicos</option>
              <option value="false">Privados</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full flex items-center justify-center mb-4">
              <Book className="h-10 w-10 text-blue-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
              {search ? 'Nenhum teste encontrado' : 'Nenhum teste disponível'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {search ? 'Tente ajustar os filtros de busca' : 'Aguardando cadastro de templates'}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="group"
            >
              <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {template.nome}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.sigla}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {template.versao_numero && template.versao_numero > 1 && (
                      <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-2 py-0.5 text-xs font-semibold text-white shadow-lg shadow-amber-500/30">
                        v{template.versao_numero}
                      </span>
                    )}
                    {template.publico ? (
                      <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-green-500/30">
                        Público
                      </span>
                    ) : (
                      <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-500/30">
                        Privado
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm mb-6 flex-1">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {template.tipo === 'escala_likert' ? 'Escala Likert' :
                       template.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Manual'}
                    </span>
                  </div>
                  {template.faixa_etaria_min !== null && template.faixa_etaria_max !== null && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <span className="text-gray-600 dark:text-gray-400">Faixa Etária:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {template.faixa_etaria_min} - {template.faixa_etaria_max} anos
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-400">Versão:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{template.versao}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => duplicateTemplate(template.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border-2 border-gray-300 dark:border-gray-700 px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600"
                    title="Duplicar teste"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Duplicar</span>
                  </motion.button>
                  <motion.button
                    onClick={() => router.push(`/biblioteca/${template.id}/editar`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border-2 border-amber-400 dark:border-amber-600 px-3 py-3 text-sm font-semibold text-amber-600 dark:text-amber-400 transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    title="Editar teste"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Editar</span>
                  </motion.button>
                  <motion.button
                    onClick={() => router.push(`/biblioteca/${template.id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                    title="Ver detalhes"
                  >
                    <span className="hidden sm:inline">Detalhes</span>
                    <span className="sm:hidden">Ver</span>
                  </motion.button>
                </div>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
