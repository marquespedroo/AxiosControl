'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Paciente, Endereco } from '@/types/database'

interface PatientFormProps {
  paciente?: Paciente
  mode: 'create' | 'edit'
}

export default function PatientForm({ paciente, mode }: PatientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [nomeCompleto, setNomeCompleto] = useState(paciente?.nome_completo || '')
  const [dataNascimento, setDataNascimento] = useState(paciente?.data_nascimento || '')
  const [escolaridadeAnos, setEscolaridadeAnos] = useState(paciente?.escolaridade_anos?.toString() || '')
  const [escolaridadeNivel, setEscolaridadeNivel] = useState(paciente?.escolaridade_nivel || '')
  const [escolaridadeMode, setEscolaridadeMode] = useState<'anos' | 'nivel'>(
    paciente?.escolaridade_nivel ? 'nivel' : 'anos'
  )
  const [sexo, setSexo] = useState(paciente?.sexo || '')
  const [cpf, setCpf] = useState(paciente?.cpf || '')
  const [telefone, setTelefone] = useState(paciente?.telefone || '')
  const [email, setEmail] = useState(paciente?.email || '')
  const [observacoesClinicas, setObservacoesClinicas] = useState(paciente?.observacoes_clinicas || '')
  const [motivoEncaminhamento, setMotivoEncaminhamento] = useState(paciente?.motivo_encaminhamento || '')

  // Address fields
  const [cep, setCep] = useState(paciente?.endereco?.cep || '')
  const [rua, setRua] = useState(paciente?.endereco?.rua || '')
  const [numero, setNumero] = useState(paciente?.endereco?.numero || '')
  const [complemento, setComplemento] = useState(paciente?.endereco?.complemento || '')
  const [bairro, setBairro] = useState(paciente?.endereco?.bairro || '')
  const [cidade, setCidade] = useState(paciente?.endereco?.cidade || '')
  const [estado, setEstado] = useState(paciente?.endereco?.estado || '')

  const calculateAge = () => {
    if (!dataNascimento) return null
    const birth = new Date(dataNascimento)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!nomeCompleto || !dataNascimento || !sexo) {
        setError('Preencha todos os campos obrigatórios')
        setIsLoading(false)
        return
      }

      // Validate escolaridade: must have at least one
      if (!escolaridadeAnos && !escolaridadeNivel) {
        setError('Informe anos de estudo OU nível educacional')
        setIsLoading(false)
        return
      }

      // Prepare address object
      const endereco: Endereco | null = (cep || rua || cidade) ? {
        cep: cep || null,
        rua: rua || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
      } : null

      // Prepare request body
      const body = {
        nome_completo: nomeCompleto,
        data_nascimento: dataNascimento,
        escolaridade_anos: escolaridadeAnos ? parseInt(escolaridadeAnos) : null,
        escolaridade_nivel: escolaridadeNivel || null,
        sexo,
        cpf: cpf || null,
        telefone: telefone || null,
        email: email || null,
        endereco,
        observacoes_clinicas: observacoesClinicas || null,
        motivo_encaminhamento: motivoEncaminhamento || null,
        profissao: paciente?.profissao || null,
        estado_civil: paciente?.estado_civil || null,
      }

      const token = localStorage.getItem('auth_token')
      const url = mode === 'create' ? '/api/pacientes' : `/api/pacientes/${paciente?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Erro ao salvar paciente')
        setIsLoading(false)
        return
      }

      // Redirect to patients list
      router.push('/pacientes')
    } catch (err: any) {
      setError('Erro ao conectar com o servidor')
      setIsLoading(false)
    }
  }

  const idade = calculateAge()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nome Completo */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Nascimento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {idade !== null && (
              <p className="text-sm text-gray-600 mt-1">Idade: {idade} anos</p>
            )}
          </div>

          {/* Sexo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sexo <span className="text-red-500">*</span>
            </label>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          {/* Escolaridade */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Escolaridade <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const newMode = escolaridadeMode === 'anos' ? 'nivel' : 'anos'
                  setEscolaridadeMode(newMode)
                  // Clear the opposite field when switching
                  if (newMode === 'anos') {
                    setEscolaridadeNivel('')
                  } else {
                    setEscolaridadeAnos('')
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Usar {escolaridadeMode === 'anos' ? 'Nível Educacional' : 'Anos de Estudo'}
              </button>
            </div>

            {escolaridadeMode === 'anos' ? (
              <input
                type="number"
                value={escolaridadeAnos}
                onChange={(e) => setEscolaridadeAnos(e.target.value)}
                min="0"
                max="30"
                placeholder="Anos de estudo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <select
                value={escolaridadeNivel}
                onChange={(e) => setEscolaridadeNivel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o nível educacional</option>
                <option value="fundamental_incompleto">Ensino Fundamental Incompleto</option>
                <option value="fundamental_completo">Ensino Fundamental Completo</option>
                <option value="medio_incompleto">Ensino Médio Incompleto</option>
                <option value="medio_completo">Ensino Médio Completo</option>
                <option value="superior_incompleto">Ensino Superior Incompleto</option>
                <option value="superior_completo">Ensino Superior Completo</option>
                <option value="pos_graduacao">Pós-Graduação</option>
              </select>
            )}
          </div>

          {/* CPF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF
            </label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CEP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
            <input
              type="text"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              placeholder="00000-000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Rua */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
            <input
              type="text"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Número */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Complemento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
            <input
              type="text"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <input
              type="text"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              maxLength={2}
              placeholder="SP"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Clinical Notes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Clínicas</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo do Encaminhamento
            </label>
            <textarea
              value={motivoEncaminhamento}
              onChange={(e) => setMotivoEncaminhamento(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Descreva o motivo do encaminhamento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações Clínicas
            </label>
            <textarea
              value={observacoesClinicas}
              onChange={(e) => setObservacoesClinicas(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observações clínicas adicionais..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.push('/pacientes')}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Paciente' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  )
}
