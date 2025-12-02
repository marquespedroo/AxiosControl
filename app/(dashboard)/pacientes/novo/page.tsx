import PatientForm from '@/components/forms/PatientForm'

export const metadata = {
  title: 'Novo Paciente - AxiosControl',
  description: 'Cadastrar novo paciente',
}

export default function NovoPacientePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PatientForm mode="create" />
      </div>
    </div>
  )
}
