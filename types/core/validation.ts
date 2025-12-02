/**
 * Validation Result Type
 * Provides detailed validation feedback with type safety
 */

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult<T = unknown> {
  isValid: boolean
  data?: T
  errors: ValidationError[]
}

/**
 * Create a successful validation result
 */
export function validationSuccess<T>(data: T): ValidationResult<T> {
  return {
    isValid: true,
    data,
    errors: [],
  }
}

/**
 * Create a failed validation result
 */
export function validationFailure(errors: ValidationError[]): ValidationResult {
  return {
    isValid: false,
    errors,
  }
}

/**
 * Add error to validation result
 */
export function addError(
  result: ValidationResult,
  field: string,
  message: string,
  code: string
): ValidationResult {
  return {
    ...result,
    isValid: false,
    errors: [...result.errors, { field, message, code }],
  }
}

/**
 * Combine multiple validation results
 */
export function combineValidations<T>(
  validations: ValidationResult<T>[]
): ValidationResult<T[]> {
  const allErrors = validations.flatMap((v) => v.errors)

  if (allErrors.length > 0) {
    return {
      isValid: false,
      errors: allErrors,
    }
  }

  const allData = validations
    .map((v) => v.data)
    .filter((data): data is T => data !== undefined)

  return validationSuccess(allData)
}
