'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../atoms'
import { FormField } from '../molecules'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { useAuth } from '@/lib/hooks'

export interface LoginFormProps {
  onSuccess?: () => void
}

/**
 * LoginForm organism component
 * Complete login form with validation and authentication
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth()
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)

    const result = await login(data.email, data.password)

    if (result.success) {
      onSuccess?.()
    } else {
      setError(result.error || 'Erro ao fazer login')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div
          className="rounded-md bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <FormField
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        autoComplete="email"
        required
      />

      <FormField
        label="Senha"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        autoComplete="current-password"
        required
      />

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Entrar
      </Button>
    </form>
  )
}

LoginForm.displayName = 'LoginForm'
