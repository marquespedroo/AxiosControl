'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/atoms/Button'
import { Card, CardContent } from '@/components/ui/atoms/Card'
import { ArrowLeft, Save, Book } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  TestBasicInfoForm,
  QuestionsEditor,
  AnswerScalesEditor,
  ScoringRulesEditor
} from '@/components/biblioteca'
import {
  type TestBasicInfoFormData,
  type QuestionFormData,
  type ScoringRulesFormData,
  formDataToQuestao,
  formDataToRegras,
  getDefaultBasicInfo,
  getDefaultScoringRules,
  validateBasicInfo,
  validateQuestions,
  SCALE_LABELS
} from '@/types/biblioteca'
import type { EscalasResposta } from '@/types/database'

type TabKey = 'info' | 'questions' | 'scales' | 'scoring'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Informações' },
  { key: 'questions', label: 'Questões' },
  { key: 'scales', label: 'Escalas' },
  { key: 'scoring', label: 'Pontuação' }
]

export default function NovoTestePage() {
  const router = useRouter()

  const [activeTab, setActiveTab] = React.useState<TabKey>('info')
  const [saving, setSaving] = React.useState(false)

  // Form state
  const [basicInfo, setBasicInfo] = React.useState<TestBasicInfoFormData>(getDefaultBasicInfo())
  const [questions, setQuestions] = React.useState<QuestionFormData[]>([])
  const [scales, setScales] = React.useState<EscalasResposta>({})
  const [scoringRules, setScoringRules] = React.useState<ScoringRulesFormData>(getDefaultScoringRules())
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSave = async () => {
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
    setSaving(true)

    try {
      const payload = {
        nome: basicInfo.nome,
        nome_completo: basicInfo.nome_completo || null,
        sigla: basicInfo.sigla || null,
        versao: basicInfo.versao || '1.0',
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

      const response = await fetch('/api/testes-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success('Teste criado com sucesso!')
        router.push('/biblioteca')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao criar teste')
      }
    } catch (error) {
      console.error('Error creating test:', error)
      toast.error('Erro ao criar teste')
    } finally {
      setSaving(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/biblioteca')} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Novo Teste</h1>
              <p className="text-indigo-100 text-sm">Crie um novo template de teste</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-white text-indigo-600 hover:bg-white/90">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Teste'}
          </Button>
        </div>
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
      </div>

      {/* Bottom Save Bar */}
      <Card className="sticky bottom-4 border-2 shadow-lg">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {questions.length} questões configuradas
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/biblioteca')} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Criar Teste'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
