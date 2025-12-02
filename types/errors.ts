export class AppError extends Error {
    public readonly code: string
    public readonly statusCode: number
    public readonly meta?: Record<string, any>

    constructor(code: string, message: string, statusCode: number = 400, meta?: Record<string, any>) {
        super(message)
        this.code = code
        this.statusCode = statusCode
        this.meta = meta
        Object.setPrototypeOf(this, AppError.prototype)
    }
}

export type Result<T, E = AppError> =
    | { data: T; error: null }
    | { data: null; error: E }

export function success<T>(data: T): Result<T> {
    return { data, error: null }
}

export function failure<E = AppError>(error: E): Result<any, E> {
    return { data: null, error }
}
