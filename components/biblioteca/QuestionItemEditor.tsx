'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/atoms/Card'
import { Input } from '@/components/ui/atoms/Input'
import { Label } from '@/components/ui/atoms/Label'
import { Button } from '@/components/ui/atoms/Button'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, Trash2, Copy, Plus, X } from 'lucide-react'
import type { QuestionItemEditorProps } from '@/types/biblioteca'
import { SCALE_LABELS } from '@/types/biblioteca'
import type { TipoResposta } from '@/types/database'

export function QuestionItemEditor({
  question,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  availableScales,
  disabled = false,
  isFirst = false,
  isLast = false
}: QuestionItemEditorProps) {
  const handleFieldChange = (field: string, value: unknown) => {
    onChange({ ...question, [field]: value })
  }

  const handleAddOption = () => {
    const newOpcoes = [...question.opcoes, '']
    handleFieldChange('opcoes', newOpcoes)
  }

  const handleRemoveOption = (optIndex: number) => {
    const newOpcoes = question.opcoes.filter((_, i) => i !== optIndex)
    handleFieldChange('opcoes', newOpcoes)
  }

  const handleOptionChange = (optIndex: number, value: string) => {
    const newOpcoes = [...question.opcoes]
    newOpcoes[optIndex] = value
    handleFieldChange('opcoes', newOpcoes)
  }

  const showOptionsEditor = question.tipo_resposta === 'multipla_escolha'

  return (
    <Card className="relative">
      <CardContent className="pt-4 pb-4">
        {/* Header with question number and actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {question.numero}
            </span>
            <span className="text-sm text-muted-foreground">Questão {question.numero}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMoveUp}
              disabled={disabled || isFirst}
              title="Mover para cima"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMoveDown}
              disabled={disabled || isLast}
              title="Mover para baixo"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDuplicate}
              disabled={disabled}
              title="Duplicar questão"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              disabled={disabled}
              title="Excluir questão"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question text */}
        <div className="space-y-4">
          <div>
            <Label htmlFor={`q${index}-texto`} required>Texto da Questão</Label>
            <textarea
              id={`q${index}-texto`}
              value={question.texto}
              onChange={(e) => handleFieldChange('texto', e.target.value)}
              disabled={disabled}
              rows={2}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50 resize-none'
              )}
              placeholder="Digite o texto da questão..."
            />
          </div>

          <div>
            <Label htmlFor={`q${index}-subtexto`}>Subtexto/Instrução</Label>
            <Input
              id={`q${index}-subtexto`}
              value={question.subtexto}
              onChange={(e) => handleFieldChange('subtexto', e.target.value)}
              disabled={disabled}
              placeholder="Instrução adicional (opcional)"
            />
          </div>

          {/* Row: Seção, Tipo, Peso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`q${index}-secao`} required>Seção</Label>
              <Input
                id={`q${index}-secao`}
                value={question.secao}
                onChange={(e) => handleFieldChange('secao', e.target.value)}
                disabled={disabled}
                placeholder="Ex: ansiedade_fisica"
              />
            </div>
            <div>
              <Label htmlFor={`q${index}-tipo`} required>Tipo de Resposta</Label>
              <select
                id={`q${index}-tipo`}
                value={question.tipo_resposta}
                onChange={(e) => handleFieldChange('tipo_resposta', e.target.value as TipoResposta)}
                disabled={disabled}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {availableScales.map((scale) => (
                  <option key={scale} value={scale}>
                    {SCALE_LABELS[scale] || scale}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor={`q${index}-peso`}>Peso</Label>
              <Input
                id={`q${index}-peso`}
                type="number"
                min={0}
                step={0.1}
                value={question.peso}
                onChange={(e) => handleFieldChange('peso', parseFloat(e.target.value) || 1)}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Options for multipla_escolha */}
          {showOptionsEditor && (
            <div className="space-y-2">
              <Label>Opções de Resposta</Label>
              {question.opcoes.map((opcao, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <Input
                    value={opcao}
                    onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                    disabled={disabled}
                    placeholder={`Opção ${optIndex + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(optIndex)}
                    disabled={disabled || question.opcoes.length <= 2}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Opção
              </Button>
            </div>
          )}

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={question.obrigatoria}
                onChange={(e) => handleFieldChange('obrigatoria', e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Obrigatória</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={question.invertida}
                onChange={(e) => handleFieldChange('invertida', e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Pontuação Invertida</span>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
