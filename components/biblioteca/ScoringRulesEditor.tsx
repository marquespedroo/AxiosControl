'use client'

import { Plus, Trash2 } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/atoms/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { Input } from '@/components/ui/atoms/Input'
import { Label } from '@/components/ui/atoms/Label'
import { cn } from '@/lib/utils'
import type { ScoringRulesEditorProps, ScoringRulesFormData, SectionScoreFormData } from '@/types/biblioteca'

type CalculationType = ScoringRulesFormData['tipo']

const CALCULATION_TYPES: { value: CalculationType; label: string; description: string }[] = [
  { value: 'soma_simples', label: 'Soma Simples', description: 'Soma direta das respostas' },
  { value: 'soma_ponderada', label: 'Soma Ponderada', description: 'Soma com pesos por questão' },
  { value: 'secoes', label: 'Por Seções', description: 'Cálculo separado por seção' },
  { value: 'custom', label: 'Personalizado', description: 'Função de cálculo customizada' }
]

export function ScoringRulesEditor({
  rules,
  onChange,
  questionNumbers,
  sections: _sections,
  errors = {},
  disabled = false
}: ScoringRulesEditorProps) {
  const handleTypeChange = (tipo: CalculationType) => {
    onChange({ ...rules, tipo })
  }

  const handleFieldChange = (field: keyof ScoringRulesFormData, value: unknown) => {
    onChange({ ...rules, [field]: value })
  }

  const toggleQuestion = (field: 'questoes_incluidas' | 'questoes_invertidas', numero: number) => {
    const current = rules[field]
    const newValue = current.includes(numero)
      ? current.filter(n => n !== numero)
      : [...current, numero].sort((a, b) => a - b)
    handleFieldChange(field, newValue)
  }

  const handleAddSection = () => {
    const newSection: SectionScoreFormData = {
      nome: `secao_${rules.secoes.length + 1}`,
      questoes: [],
      invertidas: [],
      peso: 1
    }
    handleFieldChange('secoes', [...rules.secoes, newSection])
  }

  const handleUpdateSection = (index: number, updates: Partial<SectionScoreFormData>) => {
    const newSections = rules.secoes.map((s, i) =>
      i === index ? { ...s, ...updates } : s
    )
    handleFieldChange('secoes', newSections)
  }

  const handleDeleteSection = (index: number) => {
    const newSections = rules.secoes.filter((_, i) => i !== index)
    handleFieldChange('secoes', newSections)
  }

  const toggleSectionQuestion = (
    sectionIndex: number,
    field: 'questoes' | 'invertidas',
    numero: number
  ) => {
    const section = rules.secoes[sectionIndex]
    const current = section[field]
    const newValue = current.includes(numero)
      ? current.filter(n => n !== numero)
      : [...current, numero].sort((a, b) => a - b)
    handleUpdateSection(sectionIndex, { [field]: newValue })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Regras de Cálculo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calculation Type Selection */}
        <div>
          <Label className="mb-3 block">Tipo de Cálculo</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CALCULATION_TYPES.map(({ value, label, description }) => (
              <label
                key={value}
                className={cn(
                  'flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                  rules.tipo === value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input
                  type="radio"
                  name="calculation-type"
                  value={value}
                  checked={rules.tipo === value}
                  onChange={() => handleTypeChange(value)}
                  disabled={disabled}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-muted-foreground">{description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Soma Simples Configuration */}
        {rules.tipo === 'soma_simples' && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label>Valor Máximo da Escala</Label>
              <Input
                type="number"
                min={1}
                value={rules.valor_maximo_escala}
                onChange={(e) => handleFieldChange('valor_maximo_escala', parseInt(e.target.value, 10) || 4)}
                disabled={disabled}
                className="max-w-xs"
              />
            </div>
            <div>
              <Label className="mb-2 block">Questões Incluídas</Label>
              <div className="flex flex-wrap gap-2">
                {questionNumbers.map(num => (
                  <label
                    key={num}
                    className={cn(
                      'inline-flex items-center justify-center h-8 w-8 rounded border cursor-pointer text-sm',
                      rules.questoes_incluidas.includes(num)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={rules.questoes_incluidas.includes(num)}
                      onChange={() => toggleQuestion('questoes_incluidas', num)}
                      disabled={disabled}
                      className="sr-only"
                    />
                    {num}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Questões Invertidas</Label>
              <div className="flex flex-wrap gap-2">
                {questionNumbers.map(num => (
                  <label
                    key={num}
                    className={cn(
                      'inline-flex items-center justify-center h-8 w-8 rounded border cursor-pointer text-sm',
                      rules.questoes_invertidas.includes(num)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'hover:bg-muted',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={rules.questoes_invertidas.includes(num)}
                      onChange={() => toggleQuestion('questoes_invertidas', num)}
                      disabled={disabled}
                      className="sr-only"
                    />
                    {num}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Soma Ponderada Configuration */}
        {rules.tipo === 'soma_ponderada' && (
          <div className="space-y-4 border-t pt-4">
            <Label className="mb-2 block">Peso por Questão</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {questionNumbers.map(num => {
                const existing = rules.questoes_ponderadas.find(q => q.numero === num)
                return (
                  <div key={num} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8">Q{num}</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={existing?.peso ?? 1}
                      onChange={(e) => {
                        const peso = parseFloat(e.target.value) || 1
                        const newPonderadas = rules.questoes_ponderadas.filter(q => q.numero !== num)
                        if (peso !== 1) {
                          newPonderadas.push({ numero: num, peso })
                        }
                        handleFieldChange('questoes_ponderadas', newPonderadas.sort((a, b) => a.numero - b.numero))
                      }}
                      disabled={disabled}
                      className="w-20"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Seções Configuration */}
        {rules.tipo === 'secoes' && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Seções de Pontuação</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSection} disabled={disabled}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar Seção
              </Button>
            </div>
            {rules.secoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma seção definida.</p>
            ) : (
              <div className="space-y-4">
                {rules.secoes.map((section, sIndex) => (
                  <div key={sIndex} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Input
                        value={section.nome}
                        onChange={(e) => handleUpdateSection(sIndex, { nome: e.target.value })}
                        disabled={disabled}
                        placeholder="Nome da seção"
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Peso:</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.1}
                          value={section.peso}
                          onChange={(e) => handleUpdateSection(sIndex, { peso: parseFloat(e.target.value) || 1 })}
                          disabled={disabled}
                          className="w-20"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSection(sIndex)}
                        disabled={disabled}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm mb-2 block">Questões</Label>
                        <div className="flex flex-wrap gap-1">
                          {questionNumbers.map(num => (
                            <label
                              key={num}
                              className={cn(
                                'inline-flex items-center justify-center h-7 w-7 rounded border cursor-pointer text-xs',
                                section.questoes.includes(num) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                disabled && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={section.questoes.includes(num)}
                                onChange={() => toggleSectionQuestion(sIndex, 'questoes', num)}
                                disabled={disabled}
                                className="sr-only"
                              />
                              {num}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block">Invertidas</Label>
                        <div className="flex flex-wrap gap-1">
                          {section.questoes.map(num => (
                            <label
                              key={num}
                              className={cn(
                                'inline-flex items-center justify-center h-7 w-7 rounded border cursor-pointer text-xs',
                                section.invertidas.includes(num) ? 'bg-orange-500 text-white' : 'hover:bg-muted',
                                disabled && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={section.invertidas.includes(num)}
                                onChange={() => toggleSectionQuestion(sIndex, 'invertidas', num)}
                                disabled={disabled}
                                className="sr-only"
                              />
                              {num}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Custom Configuration */}
        {rules.tipo === 'custom' && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label htmlFor="funcao_calculo">Nome da Função de Cálculo</Label>
              <Input
                id="funcao_calculo"
                value={rules.funcao_calculo}
                onChange={(e) => handleFieldChange('funcao_calculo', e.target.value)}
                disabled={disabled}
                placeholder="Ex: calcular_mcmi_iv"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Esta função deve estar implementada no sistema para processar os resultados.
              </p>
            </div>
          </div>
        )}

        {errors.rules && <p className="text-sm text-red-500">{errors.rules}</p>}
      </CardContent>
    </Card>
  )
}
