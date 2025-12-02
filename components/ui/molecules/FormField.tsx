'use client'

import * as React from 'react'
import { Input, Label } from '../atoms'
import { cn } from '@/lib/utils'

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

/**
 * FormField molecule component
 * Combines Label + Input with error handling
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const fieldId = id || `field-${React.useId()}`

    return (
      <div className={cn('space-y-2', className)}>
        <Label htmlFor={fieldId} required={props.required}>
          {label}
        </Label>
        <Input
          id={fieldId}
          ref={ref}
          error={error}
          aria-describedby={
            error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined
          }
          {...props}
        />
        {!error && helperText && (
          <p id={`${fieldId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
