'use client'

import React from 'react'

interface TestInstructionsProps {
  titulo: string
  instrucoes: string
  exemplos?: Array<{
    texto_esquerda: string
    texto_direita: string
    marcacao: number  // 0-3
    descricao: string
  }>
  onStart: () => void
}

export default function TestInstructions({
  titulo,
  instrucoes,
  exemplos,
  onStart
}: TestInstructionsProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{titulo}</h1>

      {/* Instructions Panel */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
        <h2 className="font-semibold text-lg mb-2">Instruções</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{instrucoes}</p>
      </div>

      {/* Examples Section */}
      {exemplos && exemplos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Exemplos</h3>
          <div className="space-y-6">
            {exemplos.map((ex, index) => (
              <div key={index} className="space-y-2">
                {/* Example Question Layout */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  {/* Left Statement */}
                  <div className="flex-1 text-center sm:text-right text-sm text-gray-700">
                    {ex.texto_esquerda}
                  </div>

                  {/* Response Circles */}
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((pos) => (
                      <div
                        key={pos}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          pos === ex.marcacao
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {pos === ex.marcacao && (
                          <span className="text-white font-bold text-sm">X</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Right Statement */}
                  <div className="flex-1 text-center sm:text-left text-sm text-gray-700">
                    {ex.texto_direita}
                  </div>
                </div>

                {/* Example Description */}
                <div className="text-sm text-gray-500 italic text-center sm:text-left pl-0 sm:pl-2">
                  {ex.descricao}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={onStart}
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Iniciar Teste
      </button>
    </div>
  )
}
