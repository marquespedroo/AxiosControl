'use client'

import ClinicForm from '@/components/forms/ClinicForm'

export default function NovaClinicaPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nova Clínica</h1>
        <p className="mt-1 text-sm text-gray-500">
          Preencha as informações para cadastrar uma nova clínica
        </p>
      </div>

      <ClinicForm mode="create" />
    </div>
  )
}
