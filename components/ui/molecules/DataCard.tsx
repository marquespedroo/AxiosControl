import * as React from 'react'

import { cn } from '@/lib/utils'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../atoms'

export interface DataCardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

/**
 * DataCard molecule component
 * Displays data with title, description, and optional trend
 */
export const DataCard: React.FC<DataCardProps> = ({
  title,
  description,
  icon,
  value,
  trend,
  className,
}) => {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <CardDescription className="mt-1">{description}</CardDescription>}
        {trend && (
          <p
            className={cn(
              'mt-2 text-xs',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </p>
        )}
      </CardContent>
    </Card>
  )
}

DataCard.displayName = 'DataCard'
