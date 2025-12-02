'use client'

import { Plus, Trash2 } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/atoms/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { getDefaultQuestion } from '@/types/biblioteca'
import type { QuestionsEditorProps, QuestionFormData } from '@/types/biblioteca'

import { QuestionItemEditor } from './QuestionItemEditor'

export function QuestionsEditor({
  questions,
  onChange,
  availableScales,
  errors = {},
  disabled = false
}: QuestionsEditorProps) {
  const [selectedQuestions, setSelectedQuestions] = React.useState<Set<number>>(new Set())

  const handleAddQuestion = () => {
    const nextNumber = questions.length > 0
      ? Math.max(...questions.map(q => q.numero)) + 1
      : 1
    const newQuestion = getDefaultQuestion(nextNumber)
    onChange([...questions, newQuestion])
  }

  const handleQuestionChange = (index: number, updatedQuestion: QuestionFormData) => {
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    onChange(newQuestions)
  }

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    // Renumber questions
    const renumbered = newQuestions.map((q, i) => ({
      ...q,
      numero: i + 1,
      ordem: i + 1
    }))
    onChange(renumbered)
    setSelectedQuestions(new Set())
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newQuestions = [...questions]
    const temp = newQuestions[index]
    newQuestions[index] = newQuestions[index - 1]
    newQuestions[index - 1] = temp
    // Update ordem
    const reordered = newQuestions.map((q, i) => ({
      ...q,
      numero: i + 1,
      ordem: i + 1
    }))
    onChange(reordered)
  }

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return
    const newQuestions = [...questions]
    const temp = newQuestions[index]
    newQuestions[index] = newQuestions[index + 1]
    newQuestions[index + 1] = temp
    // Update ordem
    const reordered = newQuestions.map((q, i) => ({
      ...q,
      numero: i + 1,
      ordem: i + 1
    }))
    onChange(reordered)
  }

  const handleDuplicate = (index: number) => {
    const questionToDuplicate = questions[index]
    const nextNumber = Math.max(...questions.map(q => q.numero)) + 1
    const newQuestion: QuestionFormData = {
      ...questionToDuplicate,
      numero: nextNumber,
      ordem: nextNumber
    }
    // Insert after the duplicated question
    const newQuestions = [
      ...questions.slice(0, index + 1),
      newQuestion,
      ...questions.slice(index + 1)
    ]
    // Renumber all
    const renumbered = newQuestions.map((q, i) => ({
      ...q,
      numero: i + 1,
      ordem: i + 1
    }))
    onChange(renumbered)
  }

  const handleSelectQuestion = (index: number, selected: boolean) => {
    const newSelected = new Set(selectedQuestions)
    if (selected) {
      newSelected.add(index)
    } else {
      newSelected.delete(index)
    }
    setSelectedQuestions(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(questions.map((_, i) => i)))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedQuestions.size === 0) return
    const newQuestions = questions.filter((_, i) => !selectedQuestions.has(i))
    const renumbered = newQuestions.map((q, i) => ({
      ...q,
      numero: i + 1,
      ordem: i + 1
    }))
    onChange(renumbered)
    setSelectedQuestions(new Set())
  }

  // Group questions by section for display
  const sections = React.useMemo(() => {
    const sectionMap = new Map<string, number[]>()
    questions.forEach((q, index) => {
      const section = q.secao || 'Sem Seção'
      if (!sectionMap.has(section)) {
        sectionMap.set(section, [])
      }
      sectionMap.get(section)!.push(index)
    })
    return sectionMap
  }, [questions])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Questões ({questions.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            {questions.length > 0 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={disabled}
                >
                  {selectedQuestions.size === questions.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                </Button>
                {selectedQuestions.size > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir ({selectedQuestions.size})
                  </Button>
                )}
              </>
            )}
            <Button
              type="button"
              onClick={handleAddQuestion}
              disabled={disabled}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Questão
            </Button>
          </div>
        </div>
        {errors.questions && (
          <p className="text-sm text-red-500 mt-2">{errors.questions}</p>
        )}
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma questão adicionada.</p>
            <p className="text-sm mt-1">Clique em "Adicionar Questão" para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Section summary */}
            {sections.size > 1 && (
              <div className="flex flex-wrap gap-2 pb-4 border-b">
                {Array.from(sections.entries()).map(([section, indices]) => (
                  <span
                    key={section}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                  >
                    {section}: {indices.length}
                  </span>
                ))}
              </div>
            )}

            {/* Questions list */}
            {questions.map((question, index) => (
              <div key={`question-${index}`} className="relative">
                {questions.length > 1 && (
                  <div className="absolute left-0 top-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.has(index)}
                      onChange={(e) => handleSelectQuestion(index, e.target.checked)}
                      disabled={disabled}
                      className="h-4 w-4 rounded border-gray-300 ml-2"
                    />
                  </div>
                )}
                <div className={questions.length > 1 ? 'ml-8' : ''}>
                  <QuestionItemEditor
                    question={question}
                    index={index}
                    onChange={(q) => handleQuestionChange(index, q)}
                    onDelete={() => handleDeleteQuestion(index)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onDuplicate={() => handleDuplicate(index)}
                    availableScales={availableScales}
                    disabled={disabled}
                    isFirst={index === 0}
                    isLast={index === questions.length - 1}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
