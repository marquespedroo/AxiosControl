'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PatientForm from '@/components/forms/PatientForm'
import { Paciente } from '@/types/database'

export default function EditarPacientePage() {
  const params = useParams()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/api/pacientes/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Paciente não encontrado')
        }

        const data = await response.json()
        setPaciente(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaciente()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (error || !paciente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Paciente não encontrado'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Editar Paciente</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PatientForm mode="edit" paciente={paciente} />
      </div>
    </div>
  )
}
