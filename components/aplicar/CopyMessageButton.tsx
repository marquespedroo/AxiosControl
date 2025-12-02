'use client'

import { useState, useCallback } from 'react'

import { Button } from '@/components/ui/atoms/Button'

interface CopyMessageButtonProps {
  message: string
  label?: string
  successLabel?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export default function CopyMessageButton({
  message,
  label = 'Copiar Mensagem',
  successLabel = 'Copiado!',
  variant = 'default',
  size = 'default',
  className = '',
}: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [message])

  return (
    <Button
      variant={copied ? 'secondary' : variant}
      size={size}
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <>
          <svg
            className="w-4 h-4 mr-2"
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
          {successLabel}
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {label}
        </>
      )}
    </Button>
  )
}
