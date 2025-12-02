'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { Input } from '@/components/ui/atoms/Input'
import { Label } from '@/components/ui/atoms/Label'
import { Button } from '@/components/ui/atoms/Button'
import { Plus, Trash2, X } from 'lucide-react'
import { PREDEFINED_SCALES, SCALE_LABELS } from '@/types/biblioteca'
import type { AnswerScalesEditorProps } from '@/types/biblioteca'
import type { EscalasResposta, OpcaoResposta } from '@/types/database'

export function AnswerScalesEditor({
  scales,
  onChange,
  errors = {},
  disabled = false
}: AnswerScalesEditorProps) {
  const scaleEntries = Object.entries(scales)

  const handleAddPredefinedScale = (scaleKey: string) => {
    if (scales[scaleKey]) return // Already exists
    const predefined = PREDEFINED_SCALES[scaleKey]
    if (predefined) {
      onChange({ ...scales, [scaleKey]: predefined })
    }
  }

  const handleAddCustomScale = () => {
    const baseName = 'custom_scale'
    let counter = 1
    let newKey = baseName
    while (scales[newKey]) {
      newKey = `${baseName}_${counter}`
      counter++
    }
    onChange({
      ...scales,
      [newKey]: [
        { valor: 0, texto: 'Opção 1' },
        { valor: 1, texto: 'Opção 2' }
      ]
    })
  }

  const handleDeleteScale = (scaleKey: string) => {
    const newScales = { ...scales }
    delete newScales[scaleKey]
    onChange(newScales)
  }

  const handleUpdateScaleKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey || !newKey.trim()) return
    if (scales[newKey]) return // Key already exists

    const newScales: EscalasResposta = {}
    Object.entries(scales).forEach(([key, value]) => {
      if (key === oldKey) {
        newScales[newKey] = value
      } else {
        newScales[key] = value
      }
    })
    onChange(newScales)
  }

  const handleAddOption = (scaleKey: string) => {
    const currentOptions = scales[scaleKey]
    const maxValue = Math.max(...currentOptions.map(o => o.valor), -1) + 1
    const newOptions = [...currentOptions, { valor: maxValue, texto: '' }]
    onChange({ ...scales, [scaleKey]: newOptions })
  }

  const handleRemoveOption = (scaleKey: string, optionIndex: number) => {
    const currentOptions = scales[scaleKey]
    if (currentOptions.length <= 2) return // Minimum 2 options
    const newOptions = currentOptions.filter((_, i) => i !== optionIndex)
    onChange({ ...scales, [scaleKey]: newOptions })
  }

  const handleUpdateOption = (
    scaleKey: string,
    optionIndex: number,
    field: keyof OpcaoResposta,
    value: string | number
  ) => {
    const currentOptions = scales[scaleKey]
    const newOptions = currentOptions.map((opt, i) =>
      i === optionIndex ? { ...opt, [field]: value } : opt
    )
    onChange({ ...scales, [scaleKey]: newOptions })
  }

  // Get predefined scales not yet added
  const availablePredefined = Object.keys(PREDEFINED_SCALES).filter(key => !scales[key])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Escalas de Resposta ({scaleEntries.length})</CardTitle>
          <div className="flex items-center gap-2">
            {availablePredefined.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddPredefinedScale(e.target.value)
                    e.target.value = ''
                  }
                }}
                disabled={disabled}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                defaultValue=""
              >
                <option value="">Adicionar Predefinida...</option>
                {availablePredefined.map(key => (
                  <option key={key} value={key}>{SCALE_LABELS[key] || key}</option>
                ))}
              </select>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomScale}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-1" />
              Escala Personalizada
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {scaleEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma escala de resposta definida.</p>
            <p className="text-sm mt-1">Adicione uma escala predefinida ou crie uma personalizada.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {scaleEntries.map(([scaleKey, options]) => (
              <div key={scaleKey} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Label className="sr-only">Nome da Escala</Label>
                    <Input
                      value={scaleKey}
                      onChange={(e) => handleUpdateScaleKey(scaleKey, e.target.value)}
                      disabled={disabled || !!PREDEFINED_SCALES[scaleKey]}
                      className="max-w-xs font-medium"
                      placeholder="Nome da escala"
                    />
                    {PREDEFINED_SCALES[scaleKey] && (
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                        Predefinida
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteScale(scaleKey)}
                    disabled={disabled}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <div className="w-16">
                        <Input
                          type="number"
                          value={option.valor}
                          onChange={(e) => handleUpdateOption(
                            scaleKey,
                            optIndex,
                            'valor',
                            parseInt(e.target.value, 10) || 0
                          )}
                          disabled={disabled}
                          className="text-center"
                        />
                      </div>
                      <Input
                        value={option.texto}
                        onChange={(e) => handleUpdateOption(scaleKey, optIndex, 'texto', e.target.value)}
                        disabled={disabled}
                        placeholder="Texto da opção"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(scaleKey, optIndex)}
                        disabled={disabled || options.length <= 2}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddOption(scaleKey)}
                    disabled={disabled}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Opção
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {errors.scales && (
          <p className="text-sm text-red-500 mt-4">{errors.scales}</p>
        )}
      </CardContent>
    </Card>
  )
}
