/**
 * @fileoverview
 * Schemas de validação para médicos
 * Autenticação robusta com Email + Senha + 2FA Opcional
 */

import z from 'zod'

/**
 * Validação de senha robusta para médico
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos uma maiúscula
 * - Pelo menos uma minúscula
 * - Pelo menos um número
 */
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,100}$/

const phoneRegex = /^(\+?55\s?)?(\(?\d{2}\)?)?(?:9\d{4}-?\d{4}|\d{4}-?\d{4})$/

const crmRegex = /^\d{4,6}\/[A-Z]{2}$/

// ============================================================================
// SIGNUP - Cadastro de Médico (para administradores criarem)
// ============================================================================

export const SignUpDoctorSchema = z.object({
	name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
	email: z.string().email('Email inválido').endsWith('.com', 'Email corporativo obrigatório'),
	phone: z.string().regex(phoneRegex, 'Formato de telefone inválido'),
	crm: z.string().regex(crmRegex, 'Formato de CRM inválido (ex: 12345/SP)'),
	specialty: z
		.string()
		.min(3, 'Especialidade deve ter no mínimo 3 caracteres')
		.max(100, 'Especialidade deve ter no máximo 100 caracteres'),
	password: z
		.string()
		.regex(strongPasswordRegex, 'Senha deve conter: maiúscula, minúscula, número e mínimo 8 caracteres'),
})

// ============================================================================
// LOGIN - Autenticação Robusta
// ============================================================================

/**
 * Login do médico com email e senha
 * Opcional: 2FA via TOTP (Google Authenticator, Authy, etc)
 */
export const SignInDoctorSchema = z.object({
	email: z.string().email('Email inválido'),
	password: z.string().min(1, 'Senha é obrigatória'),
	totpCode: z
		.string()
		.length(6, 'Código TOTP deve ter 6 dígitos')
		.regex(/^\d{6}$/, 'Código TOTP deve conter apenas números')
		.optional(),
})

// ============================================================================
// VERIFICAÇÃO 2FA
// ============================================================================

export const VerifyTwoFactorDoctorSchema = z.object({
	email: z.string().email('Email inválido'),
	tempToken: z.string().min(1, 'Token temporário é obrigatório').optional(),
	totpCode: z
		.string()
		.length(6, 'Código TOTP deve ter 6 dígitos')
		.regex(/^\d{6}$/, 'Código TOTP deve conter apenas números'),
})

// ============================================================================
// SETUP 2FA
// ============================================================================

export const SetupTwoFactorDoctorSchema = z.object({
	method: z.enum(['totp', 'sms', 'email']),
})

export const ConfirmTwoFactorDoctorSchema = z.object({
	totpCode: z
		.string()
		.length(6, 'Código TOTP deve ter 6 dígitos')
		.regex(/^\d{6}$/, 'Código TOTP deve conter apenas números'),
})

// ============================================================================
// RECUPERAÇÃO DE SENHA
// ============================================================================

export const ForgotPasswordDoctorSchema = z.object({
	email: z.string().email('Email inválido'),
})

export const ResetPasswordDoctorSchema = z.object({
	email: z.string().email('Email inválido'),
	code: z
		.string()
		.length(6, 'Código de reset deve ter 6 dígitos')
		.regex(/^\d{6}$/, 'Código deve conter apenas números'),
	newPassword: z
		.string()
		.regex(strongPasswordRegex, 'Senha deve conter: maiúscula, minúscula, número e mínimo 8 caracteres'),
})

// ============================================================================
// REFRESH TOKEN
// ============================================================================

export const RefreshTokenDoctorSchema = z.object({
	refreshToken: z.string().min(1, 'Token de refresh é obrigatório'),
})

// ============================================================================
// ATUALIZAÇÃO DE PERFIL
// ============================================================================

export const UpdateDoctorProfileSchema = z.object({
	name: z
		.string()
		.min(3, 'Nome deve ter no mínimo 3 caracteres')
		.max(100, 'Nome deve ter no máximo 100 caracteres')
		.optional(),
	phone: z.string().regex(phoneRegex, 'Formato de telefone inválido').optional(),
	specialty: z
		.string()
		.min(3, 'Especialidade deve ter no mínimo 3 caracteres')
		.max(100, 'Especialidade deve ter no máximo 100 caracteres')
		.optional(),
})

// ============================================================================
// ATUALIZAÇÃO DE SENHA
// ============================================================================

export const ChangePasswordDoctorSchema = z.object({
	currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
	newPassword: z
		.string()
		.regex(strongPasswordRegex, 'Senha deve conter: maiúscula, minúscula, número e mínimo 8 caracteres'),
})

// ============================================================================
// ATUALIZAÇÃO COMPLETA (ADMIN)
// ============================================================================

export const UpdateDoctorSchema = z.object({
	id: z.string().uuid('ID deve ser um UUID válido'),
	name: z
		.string()
		.min(3, 'Nome deve ter no mínimo 3 caracteres')
		.max(100, 'Nome deve ter no máximo 100 caracteres')
		.optional(),
	email: z.string().email('Email inválido').optional(),
	phone: z.string().regex(phoneRegex, 'Formato de telefone inválido').optional(),
	crm: z.string().regex(crmRegex, 'Formato de CRM inválido (ex: 12345/SP)').optional(),
	specialty: z
		.string()
		.min(3, 'Especialidade deve ter no mínimo 3 caracteres')
		.max(100, 'Especialidade deve ter no máximo 100 caracteres')
		.optional(),
	password: z
		.string()
		.regex(strongPasswordRegex, 'Senha deve conter: maiúscula, minúscula, número e mínimo 8 caracteres')
		.optional(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SignUpDoctorInput = z.infer<typeof SignUpDoctorSchema>
export type SignInDoctorInput = z.infer<typeof SignInDoctorSchema>
export type VerifyTwoFactorDoctorInput = z.infer<typeof VerifyTwoFactorDoctorSchema>
export type SetupTwoFactorDoctorInput = z.infer<typeof SetupTwoFactorDoctorSchema>
export type ConfirmTwoFactorDoctorInput = z.infer<typeof ConfirmTwoFactorDoctorSchema>
export type ForgotPasswordDoctorInput = z.infer<typeof ForgotPasswordDoctorSchema>
export type ResetPasswordDoctorInput = z.infer<typeof ResetPasswordDoctorSchema>
export type RefreshTokenDoctorInput = z.infer<typeof RefreshTokenDoctorSchema>
export type UpdateDoctorProfileInput = z.infer<typeof UpdateDoctorProfileSchema>
export type ChangePasswordDoctorInput = z.infer<typeof ChangePasswordDoctorSchema>
export type UpdateDoctorInput = z.infer<typeof UpdateDoctorSchema>
