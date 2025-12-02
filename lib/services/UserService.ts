import { createClient } from '@/lib/supabase/server'
import { UserRepository } from '@/lib/repositories/UserRepository'
import type { Result } from '@/types/core/result'
import { success, failure } from '@/types/core/result'
import { AppError } from '@/lib/errors/AppError'
import { User, UserRoleType, UserWithRoles } from '@/types/database'
import bcrypt from 'bcryptjs'

export interface CreateUserParams {
    clinica_id: string
    nome_completo: string
    email: string
    senha: string
    roles: UserRoleType[]
    // Professional details (optional)
    crp?: string
    crp_estado?: string
    especialidades?: string[]
}

export interface UpdateUserParams {
    nome_completo?: string
    email?: string
    senha?: string
    roles?: UserRoleType[]
    ativo?: boolean
    // Professional details
    crp?: string
    crp_estado?: string
    especialidades?: string[]
}

export class UserService {
    private repository: UserRepository
    private supabase: any

    constructor() {
        this.supabase = createClient()
        this.repository = new UserRepository(this.supabase)
    }

    /**
     * List users with filters
     */
    async list(params: {
        clinica_id?: string
        search?: string
        page?: number
        limit?: number
    }): Promise<Result<{ data: UserWithRoles[]; meta: any }, AppError>> {
        try {
            return await this.repository.findByClinica({
                clinica_id: params.clinica_id,
                search: params.search,
                page: params.page || 1,
                limit: params.limit || 10
            })
        } catch (error) {
            return failure(
                new AppError('USER_SERVICE_001', 'Erro ao listar usuários', 500, { cause: error })
            )
        }
    }

    /**
   * Get user by ID
   */
    async get(id: string): Promise<Result<UserWithRoles, AppError>> {
        const result = await this.repository.findByIdWithRoles(id)
        if (!result.success) {
            return result
        }
        if (!result.data) {
            return failure(new AppError('USER_SERVICE_002', 'Usuário não encontrado', 404))
        }
        return success(result.data)
    }

    /**
     * Create new user
     */
    async create(params: CreateUserParams): Promise<Result<User, AppError>> {
        try {
            // Validate email format
            const emailValidation = this.validateEmail(params.email)
            if (!emailValidation.success) {
                return emailValidation as any
            }

            // Validate email uniqueness
            const emailExistsResult = await this.repository.findByEmail(params.email)
            if (!emailExistsResult.success) {
                return emailExistsResult as any
            }
            if (emailExistsResult.data) {
                return failure(new AppError('USER_SERVICE_002', 'Email já cadastrado', 400))
            }

            // Validate CRP if provided or if role is psychologist
            if (params.roles.includes('psychologist')) {
                if (!params.crp || !params.crp_estado) {
                    return failure(new AppError('USER_SERVICE_003', 'CRP e Estado são obrigatórios para psicólogos', 400))
                }
                const crpValidation = this.validateCRP(params.crp, params.crp_estado)
                if (!crpValidation.success) {
                    return crpValidation as any
                }
                // TODO: Check CRP uniqueness (need a method in repository for this)
            }

            // Validate password strength
            const passwordValidation = this.validatePassword(params.senha)
            if (!passwordValidation.success) {
                return passwordValidation as any
            }

            // Hash password
            const senhaHash = await this.hashPassword(params.senha)

            // 1. Create User
            const userResult = await this.repository.create({
                clinica_id: params.clinica_id,
                nome_completo: params.nome_completo,
                email: params.email,
                senha_hash: senhaHash,
                ativo: true
            })

            if (!userResult.success) {
                return userResult
            }

            const user = userResult.data

            // 2. Assign Roles
            for (const role of params.roles) {
                const { error: roleError } = await this.supabase
                    .from('user_roles')
                    .insert({
                        user_id: user.id,
                        role: role
                    })

                if (roleError) {
                    // Rollback user creation (best effort)
                    await this.repository.hardDelete(user.id)
                    return failure(new AppError('USER_SERVICE_004', 'Erro ao atribuir perfil', 500, { cause: roleError }))
                }
            }

            // 3. Create Professional Details (if applicable)
            if (params.crp && params.crp_estado) {
                const { error: detailsError } = await this.supabase
                    .from('professional_details')
                    .insert({
                        user_id: user.id,
                        crp: params.crp,
                        crp_estado: params.crp_estado,
                        especialidades: params.especialidades || []
                    })

                if (detailsError) {
                    // Rollback
                    await this.repository.hardDelete(user.id)
                    return failure(new AppError('USER_SERVICE_005', 'Erro ao salvar detalhes profissionais', 500, { cause: detailsError }))
                }
            }

            // Return user with roles (refetch to get everything structured)
            return await this.repository.findByIdWithRoles(user.id) as Result<User, AppError>

        } catch (error) {
            return failure(
                new AppError('USER_SERVICE_006', 'Erro ao criar usuário', 500, { cause: error })
            )
        }
    }

    /**
     * Update user
     */
    async update(id: string, params: UpdateUserParams): Promise<Result<User, AppError>> {
        try {
            // Get existing
            const existingResult = await this.repository.findByIdWithRoles(id)
            if (!existingResult.success || !existingResult.data) {
                return failure(new AppError('USER_SERVICE_007', 'Usuário não encontrado', 404))
            }
            const existingUser = existingResult.data

            const updateData: any = {}
            if (params.nome_completo) updateData.nome_completo = params.nome_completo
            if (params.ativo !== undefined) updateData.ativo = params.ativo

            // Validate email if changed
            if (params.email && params.email !== existingUser.email) {
                const emailValidation = this.validateEmail(params.email)
                if (!emailValidation.success) {
                    return emailValidation as any
                }

                // Check uniqueness
                const emailExistsResult = await this.repository.findByEmail(params.email)
                if (!emailExistsResult.success) {
                    return emailExistsResult as any
                }
                if (emailExistsResult.data && emailExistsResult.data.id !== id) {
                    return failure(new AppError('USER_SERVICE_008', 'Email já cadastrado', 400))
                }
                updateData.email = params.email
            }

            // Hash new password if provided
            if (params.senha) {
                const passwordValidation = this.validatePassword(params.senha)
                if (!passwordValidation.success) {
                    return passwordValidation as any
                }
                updateData.senha_hash = await this.hashPassword(params.senha)
            }

            // Update User
            if (Object.keys(updateData).length > 0) {
                const updateResult = await this.repository.update(id, updateData)
                if (!updateResult.success) {
                    return updateResult
                }
            }

            // Update Roles (if provided)
            if (params.roles) {
                // Delete existing roles
                await this.supabase.from('user_roles').delete().eq('user_id', id)

                // Insert new roles
                for (const role of params.roles) {
                    await this.supabase.from('user_roles').insert({ user_id: id, role })
                }
            }

            // Update Professional Details (if provided)
            if (params.crp || params.crp_estado || params.especialidades) {
                const detailsUpdate: any = {}
                if (params.crp) detailsUpdate.crp = params.crp
                if (params.crp_estado) detailsUpdate.crp_estado = params.crp_estado
                if (params.especialidades) detailsUpdate.especialidades = params.especialidades

                // Check if details exist
                const { data: existingDetails } = await this.supabase
                    .from('professional_details')
                    .select('id')
                    .eq('user_id', id)
                    .single()

                if (existingDetails) {
                    await this.supabase
                        .from('professional_details')
                        .update(detailsUpdate)
                        .eq('user_id', id)
                } else {
                    await this.supabase
                        .from('professional_details')
                        .insert({ user_id: id, ...detailsUpdate })
                }
            }

            return await this.repository.findByIdWithRoles(id) as Result<User, AppError>

        } catch (error) {
            return failure(
                new AppError('USER_SERVICE_009', 'Erro ao atualizar usuário', 500, { cause: error })
            )
        }
    }

    /**
     * Delete user (soft delete)
     */
    async delete(id: string): Promise<Result<void, AppError>> {
        return await this.repository.delete(id)
    }

    /**
     * Validate email format
     */
    private validateEmail(email: string): Result<true, AppError> {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return failure(new AppError('USER_SERVICE_010', 'Email inválido', 400))
        }
        return success(true)
    }

    /**
     * Validate CRP format
     */
    private validateCRP(crp: string, estado: string): Result<true, AppError> {
        if (!/^[A-Z]{2}$/.test(estado)) {
            return failure(new AppError('USER_SERVICE_011', 'Estado do CRP inválido (use 2 letras maiúsculas)', 400))
        }
        if (!/^\d{5,6}$/.test(crp)) {
            return failure(new AppError('USER_SERVICE_012', 'Número do CRP inválido (use 5-6 dígitos)', 400))
        }
        return success(true)
    }

    /**
     * Validate password strength
     */
    private validatePassword(senha: string): Result<true, AppError> {
        if (senha.length < 8) {
            return failure(new AppError('USER_SERVICE_013', 'Senha deve ter no mínimo 8 caracteres', 400))
        }
        if (!/[A-Z]/.test(senha)) {
            return failure(new AppError('USER_SERVICE_014', 'Senha deve conter pelo menos uma letra maiúscula', 400))
        }
        if (!/[a-z]/.test(senha)) {
            return failure(new AppError('USER_SERVICE_015', 'Senha deve conter pelo menos uma letra minúscula', 400))
        }
        if (!/[0-9]/.test(senha)) {
            return failure(new AppError('USER_SERVICE_016', 'Senha deve conter pelo menos um número', 400))
        }
        return success(true)
    }

    /**
     * Hash password using bcrypt
     */
    private async hashPassword(senha: string): Promise<string> {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(senha, salt)
    }
}
