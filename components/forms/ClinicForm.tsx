'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Clinica, Endereco } from '@/types/database'

interface ClinicFormProps {
  clinica?: Clinica
  mode: 'create' | 'edit'
}

export default function ClinicForm({ clinica, mode }: ClinicFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [nome, setNome] = useState(clinica?.nome || '')
  const [cnpj, setCnpj] = useState(clinica?.cnpj || '')
  const [telefone, setTelefone] = useState(clinica?.telefone || '')
  const [email, setEmail] = useState(clinica?.email || '')
  const [logoUrl, setLogoUrl] = useState(clinica?.logo_url || '')

  // Address fields
  const [cep, setCep] = useState(clinica?.endereco?.cep || '')
  const [rua, setRua] = useState(clinica?.endereco?.rua || '')
  const [numero, setNumero] = useState(clinica?.endereco?.numero || '')
  const [complemento, setComplemento] = useState(clinica?.endereco?.complemento || '')
  const [bairro, setBairro] = useState(clinica?.endereco?.bairro || '')
  const [cidade, setCidade] = useState(clinica?.endereco?.cidade || '')
  const [estado, setEstado] = useState(clinica?.endereco?.estado || '')

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 14) {
      return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    }
    return value
  }

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value)
    setCnpj(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!nome) {
        setError('Nome da clínica é obrigatório')
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
        nome,
        cnpj: cnpj || null,
        telefone: telefone || null,
        email: email || null,
        logo_url: logoUrl || null,
        endereco,
        ativo: true,
      }

      const token = localStorage.getItem('auth_token')
      const url = mode === 'create' ? '/api/clinicas' : `/api/clinicas/${clinica?.id}`
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
        setError(data.error || 'Erro ao salvar clínica')
        setIsLoading(false)
        return
      }

      // Redirect to clinics list
      router.push('/admin')
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('Erro ao salvar clínica')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Nome da Clínica *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              CNPJ
            </label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => handleCNPJChange(e.target.value)}
              placeholder="00.000.000/0000-00"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL do Logo
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CEP
            </label>
            <input
              type="text"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              placeholder="00000-000"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Rua
            </label>
            <input
              type="text"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número
            </label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Complemento
            </label>
            <input
              type="text"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bairro
            </label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cidade
            </label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AP">AP</option>
              <option value="AM">AM</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MT">MT</option>
              <option value="MS">MS</option>
              <option value="MG">MG</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RS">RS</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="SC">SC</option>
              <option value="SP">SP</option>
              <option value="SE">SE</option>
              <option value="TO">TO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Clínica' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  )
}
