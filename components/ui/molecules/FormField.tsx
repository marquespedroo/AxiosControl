'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Input, Label } from '../atoms'

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
    const generatedId = React.useId()
    const fieldId = id || `field-${generatedId}`

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
