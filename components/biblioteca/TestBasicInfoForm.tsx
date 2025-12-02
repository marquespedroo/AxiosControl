'use client'

import * as React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/atoms/Card'
import { Input } from '@/components/ui/atoms/Input'
import { Label } from '@/components/ui/atoms/Label'
import { cn } from '@/lib/utils'
import type { TestBasicInfoFormData, TestBasicInfoFormProps } from '@/types/biblioteca'
import type { TipoTeste } from '@/types/database'

const TIPO_TESTE_OPTIONS: { value: TipoTeste; label: string }[] = [
  { value: 'escala_likert', label: 'Escala Likert' },
  { value: 'multipla_escolha', label: 'Múltipla Escolha' },
  { value: 'manual', label: 'Manual' }
]

export function TestBasicInfoForm({
  data,
  onChange,
  errors = {},
  disabled = false
}: TestBasicInfoFormProps) {
  const handleChange = (field: keyof TestBasicInfoFormData, value: unknown) => {
    onChange({ ...data, [field]: value })
  }

  const handleNumberChange = (field: keyof TestBasicInfoFormData, value: string) => {
    const num = value === '' ? null : parseInt(value, 10)
    handleChange(field, isNaN(num as number) ? null : num)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Row 1: Nome e Sigla */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="nome" required>Nome do Teste</Label>
            <Input
              id="nome"
              value={data.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              error={errors.nome}
              disabled={disabled}
              placeholder="Ex: Inventário de Ansiedade"
              required
            />
          </div>
          <div>
            <Label htmlFor="sigla">Sigla</Label>
            <Input
              id="sigla"
              value={data.sigla}
              onChange={(e) => handleChange('sigla', e.target.value)}
              error={errors.sigla}
              disabled={disabled}
              placeholder="Ex: BAI"
            />
          </div>
        </div>

        {/* Row 2: Nome Completo */}
        <div>
          <Label htmlFor="nome_completo">Nome Completo</Label>
          <Input
            id="nome_completo"
            value={data.nome_completo}
            onChange={(e) => handleChange('nome_completo', e.target.value)}
            error={errors.nome_completo}
            disabled={disabled}
            placeholder="Ex: Inventário de Ansiedade de Beck"
          />
        </div>

        {/* Row 3: Tipo e Versão */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipo" required>Tipo de Teste</Label>
            <select
              id="tipo"
              value={data.tipo}
              onChange={(e) => handleChange('tipo', e.target.value as TipoTeste)}
              disabled={disabled}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                errors.tipo && 'border-red-500'
              )}
            >
              {TIPO_TESTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="versao">Versão</Label>
            <Input
              id="versao"
              value={data.versao}
              onChange={(e) => handleChange('versao', e.target.value)}
              error={errors.versao}
              disabled={disabled}
              placeholder="Ex: 1.0"
            />
          </div>
        </div>

        {/* Row 4: Autor e Editora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="autor">Autor</Label>
            <Input
              id="autor"
              value={data.autor}
              onChange={(e) => handleChange('autor', e.target.value)}
              error={errors.autor}
              disabled={disabled}
              placeholder="Ex: Aaron T. Beck"
            />
          </div>
          <div>
            <Label htmlFor="editora">Editora</Label>
            <Input
              id="editora"
              value={data.editora}
              onChange={(e) => handleChange('editora', e.target.value)}
              error={errors.editora}
              disabled={disabled}
              placeholder="Ex: Pearson"
            />
          </div>
        </div>

        {/* Row 5: Ano e Tempo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ano_publicacao">Ano de Publicação</Label>
            <Input
              id="ano_publicacao"
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              value={data.ano_publicacao ?? ''}
              onChange={(e) => handleNumberChange('ano_publicacao', e.target.value)}
              error={errors.ano_publicacao}
              disabled={disabled}
              placeholder="Ex: 1988"
            />
          </div>
          <div>
            <Label htmlFor="tempo_medio_aplicacao">Tempo Médio (min)</Label>
            <Input
              id="tempo_medio_aplicacao"
              type="number"
              min={1}
              value={data.tempo_medio_aplicacao ?? ''}
              onChange={(e) => handleNumberChange('tempo_medio_aplicacao', e.target.value)}
              error={errors.tempo_medio_aplicacao}
              disabled={disabled}
              placeholder="Ex: 15"
            />
          </div>
        </div>

        {/* Row 6: Faixa Etária */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="faixa_etaria_min">Idade Mínima</Label>
            <Input
              id="faixa_etaria_min"
              type="number"
              min={0}
              max={120}
              value={data.faixa_etaria_min ?? ''}
              onChange={(e) => handleNumberChange('faixa_etaria_min', e.target.value)}
              error={errors.faixa_etaria_min}
              disabled={disabled}
              placeholder="Ex: 8"
            />
          </div>
          <div>
            <Label htmlFor="faixa_etaria_max">Idade Máxima</Label>
            <Input
              id="faixa_etaria_max"
              type="number"
              min={0}
              max={120}
              value={data.faixa_etaria_max ?? ''}
              onChange={(e) => handleNumberChange('faixa_etaria_max', e.target.value)}
              error={errors.faixa_etaria_max}
              disabled={disabled}
              placeholder="Ex: 80"
            />
          </div>
        </div>

        {/* Row 7: Checkboxes */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.publico}
              onChange={(e) => handleChange('publico', e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">Teste Público</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.ativo}
              onChange={(e) => handleChange('ativo', e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">Ativo</span>
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
