'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ClinicForm from '@/components/forms/ClinicForm'
import { Clinica } from '@/types/database'
import { useClinicas } from '@/lib/hooks/useApi'

export default function EditarClinicaPage() {
  const params = useParams()
  const clinicaId = params.id as string
  const clinicasApi = useClinicas()

  const [clinica, setClinica] = useState<Clinica | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClinica()
  }, [clinicaId])

  const loadClinica = async () => {
    const result = await clinicasApi.getById(clinicaId)
    if (result) {
      setClinica(result)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (!clinica) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Clínica não encontrada</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Clínica</h1>
        <p className="mt-1 text-sm text-gray-500">
          Atualize as informações da clínica {clinica.nome}
        </p>
      </div>

      <ClinicForm clinica={clinica} mode="edit" />
    </div>
  )
}
