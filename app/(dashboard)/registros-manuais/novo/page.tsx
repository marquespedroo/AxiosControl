'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ManualRecordForm from '@/components/forms/ManualRecordForm'
import { LoadingState } from '@/components/ui/molecules/LoadingState'

function NovoRegistroContent() {
  const searchParams = useSearchParams()
  const pacienteId = searchParams.get('paciente_id') || undefined

  return <ManualRecordForm mode="create" paciente_id={pacienteId} />
}

export default function NovoRegistroPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Novo Registro Manual</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registre resultados de testes aplicados manualmente ou fora do sistema
        </p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <NovoRegistroContent />
      </Suspense>
    </div>
  )
}
