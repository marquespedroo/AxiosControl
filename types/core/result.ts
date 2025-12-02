/**
 * Result Type - Railway-oriented programming pattern
 * Eliminates the need for try-catch blocks and provides type-safe error handling
 *
 * @example
 * function divide(a: number, b: number): Result<number> {
 *   if (b === 0) {
 *     return failure(new Error('Division by zero'))
 *   }
 *   return success(a / b)
 * }
 */

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * Create a successful result
 * The second type parameter E allows explicit error type specification
 */
export function success<T, E = Error>(data: T): Result<T, E> {
  return { success: true, data }
}

/**
 * Create a failed result
 */
export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error }
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true
}

/**
 * Type guard to check if result is failed
 */
export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false
}

/**
 * Map the data of a successful result
 */
export function map<T, U, E = Error>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (isSuccess(result)) {
    return { success: true, data: fn(result.data) }
  }
  return result as Result<U, E>
}

/**
 * Chain multiple result-returning operations
 */
export function chain<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (isSuccess(result)) {
    return fn(result.data)
  }
  return result
}

/**
 * Get data or throw error
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isSuccess(result)) {
    return result.data
  }
  throw result.error
}

/**
 * Get data or return default value
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isSuccess(result)) {
    return result.data
  }
  return defaultValue
}
