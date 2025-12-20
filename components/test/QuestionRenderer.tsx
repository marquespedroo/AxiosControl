'use client'

import { useState, useEffect } from 'react'

import { Questao } from '@/types/database'

interface QuestionRendererProps {
  questao: Questao
  resposta?: string
  onResponder: (numeroQuestao: number, valor: string) => void
  readonly?: boolean
  escalasResposta?: Record<string, any>
}

export default function QuestionRenderer({
  questao,
  resposta,
  onResponder,
  readonly = false,
  escalasResposta
}: QuestionRendererProps) {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(resposta)

  // CRITICAL FIX: Sync local state with prop changes when navigating between questions
  useEffect(() => {
    setSelectedValue(resposta)
  }, [resposta, questao.numero]) // Reset when question changes

  const handleSelect = (valor: string) => {
    if (readonly) return
    setSelectedValue(valor)
    onResponder(questao.numero, valor)
  }

  // Render BDI-II grouped options format
  if (questao.tipo === 'multipla_escolha' && questao.opcoes && Array.isArray(questao.opcoes) && questao.opcoes.length === 4) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {/* Question number and group name */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-base">
              {questao.numero}
            </span>
            <div>
              <p className="text-xl font-semibold text-gray-900">{questao.texto}</p>
              <p className="text-sm text-gray-500 mt-1">Escolha a afirmação que melhor descreve como você tem se sentido</p>
            </div>
          </div>
        </div>

        {/* Grouped options (BDI-II format: 4 options representing severity levels 0-3) */}
        <div className="space-y-3">
          {questao.opcoes.map((opcao, index) => {
            const opcaoTexto = typeof opcao === 'string' ? opcao : (opcao as any).texto || String(opcao)
            // CRITICAL FIX: Save the INDEX (0-3) not the text, for BDI-II scoring
            const isSelected = selectedValue === String(index)

            return (
              <button
                key={index}
                onClick={() => handleSelect(String(index))}  // Save index: 0, 1, 2, 3
                disabled={readonly}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                } ${readonly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`text-base leading-relaxed ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                      {opcaoTexto}  {/* Display text to user */}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Render bipolar/semantic differential (EBADEP-A format)
  if (questao.tipo_resposta === 'diferencial_0_3') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {/* Question number */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
              {questao.numero}
            </span>
          </div>
        </div>

        {/* Bipolar statements with horizontal options */}
        <div className="flex items-center gap-4">
          {/* Left statement (positive) */}
          <div className="flex-1 text-right">
            <p className="text-base text-gray-900">{questao.texto_esquerda}</p>
          </div>

          {/* Horizontal radio buttons */}
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3].map((valor) => {
              const isSelected = selectedValue === String(valor)

              return (
                <button
                  key={valor}
                  onClick={() => handleSelect(String(valor))}
                  disabled={readonly}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 hover:border-blue-400'
                  } ${readonly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  aria-label={`Opção ${valor}`}
                >
                  {isSelected && (
                    <div className="w-4 h-4 bg-white rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right statement (negative) */}
          <div className="flex-1 text-left">
            <p className="text-base text-gray-900">{questao.texto_direita}</p>
          </div>
        </div>
      </div>
    )
  }

  // Render Likert scale (most common)
  if (questao.tipo === 'likert' || !questao.tipo) {
    // CRITICAL FIX: Find appropriate scale from escalasResposta
    // Check for: binario, likert, likert_0_4, likert_0_5, likert_1_4, likert_1_5, etc.
    let escalaOpcoes: Array<{ texto: string; valor: any }> = []

    if (escalasResposta) {
      // Try to find the appropriate scale
      // Check for all possible scale variants including multipla_escolha for tests like AQ
      const possibleScaleNames = [
        'binario',
        'likert',
        'likert_0_4',
        'likert_0_5',
        'likert_1_4',
        'likert_1_5',
        'multipla_escolha'  // Some tests like AQ use this for likert-type questions
      ]

      for (const scaleName of possibleScaleNames) {
        if (escalasResposta[scaleName] && Array.isArray(escalasResposta[scaleName])) {
          escalaOpcoes = escalasResposta[scaleName].map((opt: any) => ({
            texto: opt.texto,
            valor: opt.valor
          }))
          break
        }
      }
    }

    // Fallback to question-specific escala_opcoes or hardcoded defaults
    if (escalaOpcoes.length === 0) {
      const customOpcoes = questao.escala_opcoes || [
        'Discordo totalmente',
        'Discordo',
        'Neutro',
        'Concordo',
        'Concordo totalmente'
      ]
      escalaOpcoes = customOpcoes.map((texto, index) => ({
        texto: typeof texto === 'string' ? texto : texto.label,
        valor: index + 1 // Default to 1-based indexing
      }))
    }

    return (
      <div className="bg-white rounded-lg shadow p-6">
        {/* Question number and text */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
              {questao.numero}
            </span>
            <p className="text-lg text-gray-900">{questao.texto}</p>
          </div>
          {questao.invertida && (
            <p className="mt-2 ml-11 text-sm text-amber-600">
              ⚠️ Questão invertida
            </p>
          )}
        </div>

        {/* Likert scale options */}
        <div className="space-y-3">
          {escalaOpcoes.map((opcao, index) => {
            // CRITICAL FIX: Compare using VALOR instead of TEXT
            const isSelected = selectedValue === String(opcao.valor)

            return (
              <button
                key={index}
                onClick={() => handleSelect(String(opcao.valor))} // CRITICAL FIX: Save VALOR
                disabled={readonly}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                } ${readonly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                    {opcao.texto}  {/* CRITICAL FIX: Display TEXTO to user */}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Render multiple choice
  if (questao.tipo === 'multipla_escolha') {
    const opcoes = questao.opcoes || []

    return (
      <div className="bg-white rounded-lg shadow p-6">
        {/* Question number and text */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
              {questao.numero}
            </span>
            <p className="text-lg text-gray-900">{questao.texto}</p>
          </div>
        </div>

        {/* Multiple choice options */}
        <div className="space-y-3">
          {opcoes.map((opcao, index) => {
            const opcaoTexto = typeof opcao === 'string' ? opcao : (opcao as any).texto || String(opcao)
            const isSelected = selectedValue === opcaoTexto

            return (
              <button
                key={index}
                onClick={() => handleSelect(opcaoTexto)}
                disabled={readonly}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                } ${readonly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                    {opcaoTexto}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Fallback for unknown question types
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-500">Tipo de questão não suportado: {questao.tipo}</p>
    </div>
  )
}
