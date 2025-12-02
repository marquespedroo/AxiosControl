import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Teste em Andamento | AxiosControl',
  description: 'Aplicação de teste neuropsicológico',
}

/**
 * Handoff Layout - Minimal layout without dashboard navigation
 * This ensures the patient cannot access any navigation elements
 */
export default function HandoffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
