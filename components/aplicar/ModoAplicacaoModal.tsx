'use client'

import { useState } from 'react'
import { ModoAplicacao } from '@/types/database'
import { Button } from '@/components/ui/atoms/Button'

interface ModoAplicacaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (mode: ModoAplicacao) => void
  pacienteNome?: string
}

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
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
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
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
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
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
    details: [
      'Link com código de 6 dígitos',
      'Válido por 7 dias (padrão)',
      'Mensagem pronta para copiar',
    ],
  },
]

export default function ModoAplicacaoModal({
  isOpen,
  onClose,
  onSelect,
  pacienteNome,
}: ModoAplicacaoModalProps) {
  const [selectedMode, setSelectedMode] = useState<ModoAplicacao | null>(null)
  const [hoveredMode, setHoveredMode] = useState<ModoAplicacao | null>(null)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (selectedMode) {
      onSelect(selectedMode)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Modo de Aplicação</h2>
            {pacienteNome && (
              <p className="text-sm text-gray-500 mt-1">
                Paciente: <span className="font-medium">{pacienteNome}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Escolha como deseja aplicar o teste ao paciente:
        </p>

        <div className="grid gap-4 mb-6">
          {modeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedMode(option.value)}
              onMouseEnter={() => setHoveredMode(option.value)}
              onMouseLeave={() => setHoveredMode(null)}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all
                ${
                  selectedMode === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    p-2 rounded-lg
                    ${
                      selectedMode === option.value
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{option.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>

                  {(selectedMode === option.value || hoveredMode === option.value) && (
                    <ul className="mt-3 space-y-1">
                      {option.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-sm text-gray-500"
                        >
                          <svg
                            className="w-4 h-4 mr-2 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedMode === option.value && (
                  <div className="absolute top-4 right-4">
                    <svg
                      className="w-6 h-6 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedMode}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
