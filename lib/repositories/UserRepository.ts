import { SupabaseClient } from '@supabase/supabase-js'
import { Repository, PaginationParams, PaginationResult } from './base/Repository'
import { Result, success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import { Database } from '@/types/database.generated'
import { User, UserRoleType } from '@/types/database'

export interface UserSearchParams extends PaginationParams {
    clinica_id?: string
    search?: string
}

export interface UserWithRoles extends User {
    roles: UserRoleType[]
}

/**
 * Repository for User entity
 * Handles all database operations for users and their roles
 */
export class UserRepository extends Repository<User> {
    constructor(supabase: SupabaseClient<Database>) {
        super('users', supabase)
    }

    /**
     * Find users by clinic with search and pagination
     */
    async findByClinica(params: UserSearchParams): Promise<Result<PaginationResult<UserWithRoles>, AppError>> {
        try {
            let query = this.supabase
                .from(this.tableName as any)
                .select('*, user_roles(role)', { count: 'exact' })
                .order('nome_completo', { ascending: true })

            // Apply clinic filter
            if (params.clinica_id) {
                query = query.eq('clinica_id', params.clinica_id)
            }

            // Apply search filter
            if (params.search) {
                query = query.or(`nome_completo.ilike.%${params.search}%,email.ilike.%${params.search}%`)
            }

            // Apply pagination
            const offset = (params.page - 1) * params.limit
            query = query.range(offset, offset + params.limit - 1)

            const { data, error, count } = await query

            if (error) {
                return failure(new AppError('USER_REPO_001', 'Erro ao buscar usuários', 500, { cause: error }))
            }

            // Transform data to include roles array
            const usersWithRoles = (data || []).map((user: any) => ({
                ...user,
                roles: user.user_roles?.map((ur: any) => ur.role) || []
            })) as UserWithRoles[]

            return success({
                data: usersWithRoles,
                meta: {
                    page: params.page,
                    limit: params.limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / params.limit)
                }
            })
        } catch (error) {
            return failure(new AppError('USER_REPO_002', 'Erro inesperado ao buscar usuários', 500, { cause: error }))
        }
    }

    /**
     * Find user by email with roles
     */
    async findByEmail(email: string): Promise<Result<UserWithRoles | null, AppError>> {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName as any)
                .select('*, user_roles(role)')
                .eq('email', email)
                .single()

            if (error) {
                // Not found is not an error
                if (error.code === 'PGRST116') {
                    return success(null)
                }
                return failure(new AppError('USER_REPO_003', 'Erro ao buscar usuário por email', 500, { cause: error }))
            }

            const userWithRoles: UserWithRoles = {
                ...(data as unknown as User),
                roles: (data as any).user_roles?.map((ur: any) => ur.role) || []
            }

            return success(userWithRoles)
        } catch (error) {
            return failure(new AppError('USER_REPO_004', 'Erro inesperado ao buscar por email', 500, { cause: error }))
        }
    }

    /**
     * Find user by ID with roles
     */
    async findByIdWithRoles(id: string): Promise<Result<UserWithRoles | null, AppError>> {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName as any)
                .select('*, user_roles(role)')
                .eq('id', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    return success(null)
                }
                return failure(new AppError('USER_REPO_005', 'Erro ao buscar usuário por ID', 500, { cause: error }))
            }

            const userWithRoles: UserWithRoles = {
                ...(data as unknown as User),
                roles: (data as any).user_roles?.map((ur: any) => ur.role) || []
            }

            return success(userWithRoles)
        } catch (error) {
            return failure(new AppError('USER_REPO_006', 'Erro inesperado ao buscar por ID', 500, { cause: error }))
        }
    }
}
