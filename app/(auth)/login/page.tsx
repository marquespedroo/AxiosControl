'use client'

import LoginForm from '@/components/auth/LoginForm'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  return <LoginForm redirectTo={redirect} />
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AxiosControl</h1>
          <p className="text-gray-600">Plataforma de Gestão e Avaliação</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Entrar na sua conta
          </h2>
          <Suspense fallback={<div className="text-center text-gray-500">Carregando...</div>}>
            <LoginContent />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Problemas para acessar?{' '}
          <a href="mailto:suporte@axioscontrol.com" className="text-blue-600 hover:underline">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  )
}
