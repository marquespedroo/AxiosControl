'use client'

import { ArrowLeft, Save } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import * as React from 'react'
import toast from 'react-hot-toast'

import {
  TestBasicInfoForm,
  QuestionsEditor,
  AnswerScalesEditor,
  ScoringRulesEditor,
  VersionHistory
} from '@/components/biblioteca'
import { Button } from '@/components/ui/atoms/Button'
import { Card, CardContent } from '@/components/ui/atoms/Card'
import {
  type TestBasicInfoFormData,
  type QuestionFormData,
  type ScoringRulesFormData,
  type TestVersion,
  questaoToFormData,
  formDataToQuestao,
  regrasToFormData,
  formDataToRegras,
  getDefaultBasicInfo,
  getDefaultScoringRules,
  validateBasicInfo,
  validateQuestions,
  SCALE_LABELS
} from '@/types/biblioteca'
import type { TesteTemplate, EscalasResposta } from '@/types/database'

type TabKey = 'info' | 'questions' | 'scales' | 'scoring' | 'history'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Informações' },
  { key: 'questions', label: 'Questões' },
  { key: 'scales', label: 'Escalas' },
  { key: 'scoring', label: 'Pontuação' },
  { key: 'history', label: 'Histórico' }
]

export default function EditarTestePage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string

  const [activeTab, setActiveTab] = React.useState<TabKey>('info')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [showSaveModal, setShowSaveModal] = React.useState(false)
  const [motivo, setMotivo] = React.useState('')

  // Form state
  const [basicInfo, setBasicInfo] = React.useState<TestBasicInfoFormData>(getDefaultBasicInfo())
  const [questions, setQuestions] = React.useState<QuestionFormData[]>([])
  const [scales, setScales] = React.useState<EscalasResposta>({})
  const [scoringRules, setScoringRules] = React.useState<ScoringRulesFormData>(getDefaultScoringRules())
  const [versions, setVersions] = React.useState<TestVersion[]>([])
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Original test data for comparison (reserved for future diff feature)
  const [, setOriginalTest] = React.useState<TesteTemplate | null>(null)

  // Load test data
  React.useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/api/testes-templates/${testId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) {
          throw new Error('Teste não encontrado')
        }

        const test: TesteTemplate = await response.json()
        setOriginalTest(test)

        // Populate form state
        setBasicInfo({
          nome: test.nome,
          nome_completo: test.nome_completo || '',
          sigla: test.sigla || '',
          versao: test.versao || '',
          autor: test.autor || '',
          ano_publicacao: test.ano_publicacao,
          editora: test.editora || '',
          tipo: test.tipo,
          faixa_etaria_min: test.faixa_etaria_min,
          faixa_etaria_max: test.faixa_etaria_max,
          tempo_medio_aplicacao: test.tempo_medio_aplicacao,
          publico: test.publico,
          ativo: test.ativo
        })

        setQuestions(test.questoes.map(questaoToFormData))
        setScales(test.escalas_resposta)
        setScoringRules(regrasToFormData(test.regras_calculo))

        // Fetch versions
        const versionsResponse = await fetch(`/api/testes-templates/${testId}/versions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (versionsResponse.ok) {
          const versionsData = await versionsResponse.json()
          setVersions(versionsData)
        }
      } catch (error) {
        toast.error('Erro ao carregar teste')
        router.push('/biblioteca')
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId, router])

  const handleSave = () => {
    // Validate
    const basicErrors = validateBasicInfo(basicInfo)
    const questionErrors = validateQuestions(questions)
    const allErrors = [...basicErrors, ...questionErrors]

    if (allErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      allErrors.forEach(e => { errorMap[e.field] = e.message })
      setErrors(errorMap)
      toast.error('Corrija os erros antes de salvar')
      return
    }

    setErrors({})
    setShowSaveModal(true)
  }

  const handleConfirmSave = async () => {
    if (!motivo.trim()) {
      toast.error('Informe o motivo da alteração')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('auth_token')
      const changes = {
        nome: basicInfo.nome,
        nome_completo: basicInfo.nome_completo || null,
        sigla: basicInfo.sigla || null,
        versao: basicInfo.versao || null,
        autor: basicInfo.autor || null,
        ano_publicacao: basicInfo.ano_publicacao,
        editora: basicInfo.editora || null,
        tipo: basicInfo.tipo,
        faixa_etaria_min: basicInfo.faixa_etaria_min,
        faixa_etaria_max: basicInfo.faixa_etaria_max,
        tempo_medio_aplicacao: basicInfo.tempo_medio_aplicacao,
        publico: basicInfo.publico,
        ativo: basicInfo.ativo,
        questoes: questions.map(formDataToQuestao),
        escalas_resposta: scales,
        regras_calculo: formDataToRegras(scoringRules)
      }

      const response = await fetch(`/api/testes-templates/${testId}/version`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ changes, motivo_alteracao: motivo })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar')
      }

      const newVersion = await response.json()
      toast.success('Nova versão criada com sucesso!')
      setShowSaveModal(false)
      setMotivo('')

      // Redirect to new version
      router.push(`/biblioteca/${newVersion.id}/editar`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleRestore = async (versionId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/testes-templates/${testId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ versionId })
      })

      if (!response.ok) throw new Error('Erro ao restaurar')

      const restoredVersion = await response.json()
      toast.success('Versão restaurada com sucesso!')
      router.push(`/biblioteca/${restoredVersion.id}/editar`)
    } catch {
      toast.error('Erro ao restaurar versão')
    }
  }

  const availableScales = React.useMemo(() => {
    return [...Object.keys(scales), ...Object.keys(SCALE_LABELS)]
      .filter((v, i, a) => a.indexOf(v) === i)
  }, [scales])

  const questionNumbers = React.useMemo(() => questions.map(q => q.numero), [questions])
  const sectionNames = React.useMemo(() => {
    const sections = new Set(questions.map(q => q.secao).filter(Boolean))
    return Array.from(sections)
  }, [questions])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/biblioteca')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Teste</h1>
            <p className="text-sm text-muted-foreground">{basicInfo.nome || 'Sem nome'}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.key === 'questions' && ` (${questions.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pb-8">
        {activeTab === 'info' && (
          <TestBasicInfoForm data={basicInfo} onChange={setBasicInfo} errors={errors} />
        )}
        {activeTab === 'questions' && (
          <QuestionsEditor
            questions={questions}
            onChange={setQuestions}
            availableScales={availableScales}
            errors={errors}
          />
        )}
        {activeTab === 'scales' && (
          <AnswerScalesEditor scales={scales} onChange={setScales} errors={errors} />
        )}
        {activeTab === 'scoring' && (
          <ScoringRulesEditor
            rules={scoringRules}
            onChange={setScoringRules}
            questionNumbers={questionNumbers}
            sections={sectionNames}
            errors={errors}
          />
        )}
        {activeTab === 'history' && (
          <VersionHistory
            versions={versions}
            currentVersionId={testId}
            onRestore={handleRestore}
          />
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Salvar Alterações</h3>
              <p className="text-sm text-muted-foreground">
                Uma nova versão do teste será criada. Informe o motivo da alteração:
              </p>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Correção de texto na questão 5"
                className="w-full h-24 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveModal(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmSave} isLoading={saving}>
                  Criar Nova Versão
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
