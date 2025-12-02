'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, User, ArrowRight, ArrowLeft, Check, Smartphone, Link2, UserCheck, Loader2 } from 'lucide-react'
import type { Paciente, TesteTemplate, ModoAplicacao, LinkPacienteWithDetails } from '@/types/database'
import LinkHubResult from '@/components/aplicar/LinkHubResult'
import PinEntryModal from '@/components/aplicar/PinEntryModal'
import { useLinkPaciente } from '@/lib/hooks/useLinkPaciente'

interface ModeOption {
  value: ModoAplicacao
  title: string
  description: string
  icon: React.ReactNode
  details: string[]
}

const modeOptions: ModeOption[] = [
  {
    value: 'presencial',
    title: 'Aplicar Pessoalmente',
    description: 'Você aplica o teste com o paciente presente',
    icon: <UserCheck className="w-8 h-8" />,
    details: [
      'Aplicação direta pelo profissional',
      'Controle total do processo',
      'Interação em tempo real',
    ],
  },
  {
    value: 'entrega',
    title: 'Entregar ao Paciente',
    description: 'O paciente responde no seu dispositivo com PIN de proteção',
    icon: <Smartphone className="w-8 h-8" />,
    details: [
      'Paciente usa seu dispositivo',
      'PIN de 4 dígitos para sair',
      'Tela bloqueada durante o teste',
    ],
  },
  {
    value: 'link',
    title: 'Enviar Link',
    description: 'Gera um link seguro para o paciente responder remotamente',
    icon: <Link2 className="w-8 h-8" />,
    details: [
      'Link com código de 6 dígitos',
      'Válido por 7 dias (padrão)',
      'Mensagem pronta para copiar',
    ],
  },
]

export default function ModoAplicacaoPage() {
  const params = useParams()
  const router = useRouter()
  const pacienteId = params.pacienteId as string

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [templates, setTemplates] = useState<TesteTemplate[]>([])
  const [selectedMode, setSelectedMode] = useState<ModoAplicacao | null>(null)
  const [hoveredMode, setHoveredMode] = useState<ModoAplicacao | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Link mode state
  const [linkResult, setLinkResult] = useState<{
    link: LinkPacienteWithDetails
    shareMessage: string
    linkUrl: string
  } | null>(null)

  // Handoff mode state
  const [showPinEntry, setShowPinEntry] = useState(false)

  // Hook for generating share message
  const { generateShareMessage } = useLinkPaciente()

  useEffect(() => {
    // Get selected tests from sessionStorage
    const stored = sessionStorage.getItem('selectedTests')
    if (!stored) {
      router.push(`/aplicar/paciente/${pacienteId}/selecionar-testes`)
      return
    }
    setSelectedTests(JSON.parse(stored))

    const fetchData = async () => {
      try {
        // Fetch patient
        const pacienteRes = await fetch(`/api/pacientes/${pacienteId}`, {
          credentials: 'include'
        })
        if (pacienteRes.ok) {
          const pacienteData = await pacienteRes.json()
          setPaciente(pacienteData)
        }

        // Fetch templates to get names
        const templatesRes = await fetch('/api/testes-templates?ativo=true&limit=50', {
          credentials: 'include'
        })
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json()
          setTemplates(templatesData.data || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [pacienteId, router])

  const selectedTemplates = templates.filter(t => selectedTests.includes(t.id))

  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleConfirm = async () => {
    if (!selectedMode || !paciente) return

    setIsProcessing(true)
    setError(null)

    try {
      // For single test in presencial mode, use simple direct flow
      if (selectedMode === 'presencial' && selectedTests.length === 1) {
        const response = await fetch('/api/testes-aplicados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paciente_id: pacienteId,
            teste_template_id: selectedTests[0],
            tipo_aplicacao: 'presencial',
            status: 'em_andamento'
          })
        })

        if (!response.ok) {
          throw new Error('Erro ao criar teste aplicado')
        }

        const testeAplicado = await response.json()
        sessionStorage.removeItem('selectedTests')
        router.push(`/aplicar/${testeAplicado.id}`)
        return
      }

      // For multiple tests in presencial mode, create a link hub and use bateria runner
      if (selectedMode === 'presencial' && selectedTests.length > 1) {
        const response = await fetch('/api/links-paciente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paciente_id: pacienteId,
            teste_template_ids: selectedTests,
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Erro ao criar bateria de testes')
        }

        const linkData = await response.json()
        sessionStorage.removeItem('selectedTests')
        // Redirect to in-person multi-test runner (bateria)
        router.push(`/aplicar/bateria/${linkData.id}`)
        return
      }

      // Handoff mode (entrega)
      if (selectedMode === 'entrega') {
        setShowPinEntry(true)
        setIsProcessing(false)
        return
      }

      // Link mode (remote)
      if (selectedMode === 'link') {
        // Create link hub with all selected tests
        const response = await fetch('/api/links-paciente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paciente_id: pacienteId,
            teste_template_ids: selectedTests,
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Erro ao criar link')
        }

        const linkData: LinkPacienteWithDetails = await response.json()
        const baseUrl = window.location.origin
        const linkUrl = `${baseUrl}/responder/${linkData.link_token}`
        const shareMessage = generateShareMessage(
          paciente.nome_completo,
          linkUrl,
          linkData.codigo_acesso_plain || '',
          new Date(linkData.data_expiracao)
        )

        setLinkResult({
          link: linkData,
          shareMessage,
          linkUrl,
        })
        setIsProcessing(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar')
      setIsProcessing(false)
    }
  }

  const handlePinSubmit = async (pin: string): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)

    try {
      // For multiple tests, create a link hub for the bateria
      if (selectedTests.length > 1) {
        const linkResponse = await fetch('/api/links-paciente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paciente_id: pacienteId,
            teste_template_ids: selectedTests,
          })
        })

        if (!linkResponse.ok) {
          const data = await linkResponse.json()
          throw new Error(data.message || 'Erro ao criar bateria de testes')
        }

        const linkData = await linkResponse.json()

        // Store handoff session info with link ID for multi-test
        sessionStorage.setItem('handoffSession', JSON.stringify({
          linkId: linkData.id,
          pin, // Store PIN for session (will be validated server-side)
          mode: 'bateria',
        }))
        sessionStorage.removeItem('selectedTests')

        // Redirect to handoff bateria runner
        window.location.href = `/aplicar/bateria/${linkData.id}/handoff`
        return true
      }

      // Single test: Create teste_aplicado directly
      const response = await fetch('/api/testes-aplicados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paciente_id: pacienteId,
          teste_template_id: selectedTests[0],
          tipo_aplicacao: 'entrega',
          status: 'em_andamento'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar teste aplicado')
      }

      const testeAplicado = await response.json()

      // Initialize handoff session
      const handoffResponse = await fetch('/api/handoff/iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teste_aplicado_id: testeAplicado.id,
          pin,
        })
      })

      if (!handoffResponse.ok) {
        const data = await handoffResponse.json()
        throw new Error(data.message || 'Erro ao iniciar modo entrega')
      }

      const handoffData = await handoffResponse.json()

      // Store session info
      sessionStorage.setItem('handoffSession', JSON.stringify({
        sessionId: handoffData.session_id,
        testeAplicadoId: testeAplicado.id,
        mode: 'single',
      }))
      sessionStorage.removeItem('selectedTests')

      // Redirect to handoff test application
      window.location.href = `/aplicar/${testeAplicado.id}/handoff`
      return true

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar')
      setIsProcessing(false)
      return false
    }
  }

  const handleLinkClose = () => {
    sessionStorage.removeItem('selectedTests')
    router.push('/links')
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Paciente não encontrado</p>
          <button
            onClick={() => router.push('/aplicar')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Voltar para seleção de paciente
          </button>
        </div>
      </div>
    )
  }

  // Show link result if generated
  if (linkResult) {
    return (
      <LinkHubResult
        link={linkResult.link}
        shareMessage={linkResult.shareMessage}
        linkUrl={linkResult.linkUrl}
        onClose={handleLinkClose}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Modo de Aplicação</h1>
            <p className="text-blue-100">Como deseja aplicar os testes?</p>
          </div>
        </div>

        {/* Patient and tests info */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{paciente.nome_completo}</span>
            {paciente.data_nascimento && (
              <span className="text-xs text-blue-200">({calculateAge(paciente.data_nascimento)} anos)</span>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <Brain className="w-4 h-4" />
            <span className="text-sm">{selectedTests.length} teste{selectedTests.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mt-6 text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-medium text-xs">
              <Check className="w-4 h-4" />
            </span>
            <span>Paciente</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/60" />
          <div className="flex items-center gap-2 text-white/60">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-medium text-xs">
              <Check className="w-4 h-4" />
            </span>
            <span>Testes</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/60" />
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
            <span className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
            <span className="font-medium">Modo</span>
          </div>
        </div>
      </motion.div>

      {/* Selected tests summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Testes selecionados:</h3>
        <div className="flex flex-wrap gap-2">
          {selectedTemplates.map(template => (
            <span
              key={template.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
            >
              <Brain className="w-4 h-4" />
              {template.sigla || template.nome}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Mode selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4"
      >
        {modeOptions.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            onClick={() => setSelectedMode(option.value)}
            onMouseEnter={() => setHoveredMode(option.value)}
            onMouseLeave={() => setHoveredMode(null)}
            className="text-left w-full"
          >
            <div className={`
              relative p-6 rounded-2xl border-2 transition-all duration-300
              ${selectedMode === option.value
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 hover:border-blue-300 hover:shadow-md'
              }
            `}>
              <div className="flex items-start gap-4">
                <div className={`
                  p-3 rounded-xl transition-colors
                  ${selectedMode === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{option.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{option.description}</p>

                  {(selectedMode === option.value || hoveredMode === option.value) && (
                    <ul className="mt-4 space-y-2">
                      {option.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedMode === option.value && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Footer with navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="sticky bottom-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/aplicar/paciente/${pacienteId}/selecionar-testes`)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedMode || isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              selectedMode && !isProcessing
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Confirmar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* PIN Entry Modal for Handoff mode */}
      <PinEntryModal
        isOpen={showPinEntry}
        onClose={() => setShowPinEntry(false)}
        onSubmit={handlePinSubmit}
        title="Definir PIN de Proteção"
        description="Digite um PIN de 4 dígitos que será necessário para sair do modo de aplicação"
      />
    </div>
  )
}
