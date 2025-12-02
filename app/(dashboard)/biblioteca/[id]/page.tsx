'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Book, Users, FileText, Trash2, Copy } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { TesteTemplate } from '@/types/database'

export default function BibliotecaDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<TesteTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/testes-templates/${params.id}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Teste não encontrado')
        }

        const data = await response.json()
        setTemplate(data)
      } catch (err: any) {
        console.error('Error fetching template:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplate()
  }, [params.id])

  const handleDuplicate = async () => {
    if (!template) return

    const newName = prompt('Nome do novo teste:')
    if (!newName) return

    try {
      const response = await fetch(`/api/testes-templates/${template.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newName }),
      })

      if (response.ok) {
        alert('Teste duplicado com sucesso!')
        router.push('/biblioteca')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao duplicar teste')
      }
    } catch (error) {
      console.error('Error duplicating template:', error)
      alert('Erro ao duplicar teste')
    }
  }

  const handleDelete = async () => {
    if (!template) return

    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o teste "${template.nome}"? Esta ação não pode ser desfeita.`
    )

    if (!confirmar) return

    try {
      const response = await fetch(`/api/testes-templates/${template.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        alert('Teste excluído com sucesso!')
        router.push('/biblioteca')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao excluir teste')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Erro ao excluir teste')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando detalhes...</div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-red-600 text-lg">{error || 'Teste não encontrado'}</div>
        <button
          onClick={() => router.push('/biblioteca')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Voltar para Biblioteca
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <button
          onClick={() => router.push('/biblioteca')}
          className="flex items-center gap-2 mb-4 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Biblioteca
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Book className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{template.nome}</h1>
              <p className="text-indigo-100">{template.sigla || 'Sem sigla'}</p>
            </div>
          </div>

          {template.publico ? (
            <span className="rounded-full bg-green-500/20 border border-green-300 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              Público
            </span>
          ) : (
            <span className="rounded-full bg-blue-500/20 border border-blue-300 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              Privado
            </span>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4"
      >
        <button
          onClick={handleDuplicate}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          <Copy className="w-5 h-5" />
          Duplicar Teste
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
        >
          <Trash2 className="w-5 h-5" />
          Excluir Teste
        </button>
      </motion.div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Informações Básicas
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400">Nome Completo:</span>
              <span className="font-semibold text-gray-900 dark:text-white text-right">
                {template.nome_completo || template.nome}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {template.tipo === 'escala_likert' ? 'Escala Likert' :
                  template.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Manual'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400">Versão:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {template.versao || 'N/A'}
              </span>
            </div>
            {template.autor && (
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-gray-600 dark:text-gray-400">Autor:</span>
                <span className="font-semibold text-gray-900 dark:text-white text-right">
                  {template.autor}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Application Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Aplicação
          </h2>
          <div className="space-y-3">
            {(template.faixa_etaria_min !== null && template.faixa_etaria_max !== null) && (
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-gray-600 dark:text-gray-400">Faixa Etária:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {template.faixa_etaria_min} - {template.faixa_etaria_max} anos
                </span>
              </div>
            )}
            {template.tempo_medio_aplicacao && (
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-gray-600 dark:text-gray-400">Tempo Médio:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {template.tempo_medio_aplicacao} minutos
                </span>
              </div>
            )}
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400">Questões:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {template.questoes?.length || 0}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`font-semibold ${template.ativo ? 'text-green-600' : 'text-red-600'}`}>
                {template.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Questions Preview */}
      {template.questoes && template.questoes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Pré-visualização de Questões ({template.questoes.length} total)
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {template.questoes.slice(0, 5).map((questao, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="font-medium text-gray-900 dark:text-white mb-2">
                  {index + 1}. {questao.texto}
                </p>
                {questao.subtexto && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {questao.subtexto}
                  </p>
                )}
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Seção: {questao.secao}</span>
                  <span>Tipo: {questao.tipo_resposta}</span>
                  {questao.obrigatoria && <span className="text-red-600">Obrigatória</span>}
                </div>
              </div>
            ))}
            {template.questoes.length > 5 && (
              <p className="text-center text-sm text-gray-500">
                ... e mais {template.questoes.length - 5} questões
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
