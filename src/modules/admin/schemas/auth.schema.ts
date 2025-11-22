import z from 'zod'

export const SignUpAdminSchema = z.object({
	name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
	email: z.string().email('Email inválido').endsWith('.com', 'Email corporativo obrigatório'),
	password: z.string().min(8, 'Senha deve conter: mínimo 8 caracteres'),
})

export const SignInAdminSchema = z.object({
	email: z.string().email('Email inválido'),
	password: z.string().min(1, 'Senha é obrigatória'),
	totpCode: z
		.string()
		.length(6, 'Código TOTP deve ter 6 dígitos')
		.regex(/^\d{6}$/, 'Código TOTP deve conter apenas números')
		.optional(),
})

export const VerifyTwoFactorAdminSchema = z.object({
	email: z.string().email('Email inválido'),
	tempToken: z.string().min(1, 'Token temporário é obrigatório'),
	totpCode: z
		.string()
		.length(6, 'Código TOTP deve ter 6 dígitos')
		.regex(/^\d{6}$/, 'Código TOTP deve conter apenas números'),
})

export const SetupTwoFactorAdminSchema = z.object({
	totpCode: z
		.string()
		.length(6, 'Código TOTP deve ter 6 dígitos')
		.regex(/^\d{6}$/, 'Código TOTP deve conter apenas números'),
})

export const ConfirmTwoFactorAdminSchema = z.object({
	totpCode: z
		.string()
		.length(6, 'Código TOTP deve ter 6 dígitos')
		.regex(/^\d{6}$/, 'Código TOTP deve conter apenas números'),
})

export const ForgotPasswordAdminSchema = z.object({
	email: z.string().email('Email inválido'),
})

export const ResetPasswordAdminSchema = z.object({
	email: z.string().email('Email inválido'),
	code: z
		.string()
		.length(6, 'Código de reset deve ter 6 dígitos')
		.regex(/^\d{6}$/, 'Código deve conter apenas números'),
	newPassword: z.string().min(8, 'Senha deve conter: mínimo 8 caracteres'),
})

export const RefreshTokenAdminSchema = z.object({
	refreshToken: z.string().min(1, 'Token de refresh é obrigatório'),
})

export const UpdateAdminProfileSchema = z.object({
	name: z
		.string()
		.min(3, 'Nome deve ter no mínimo 3 caracteres')
		.max(100, 'Nome deve ter no máximo 100 caracteres')
		.optional(),
})

export const ChangePasswordAdminSchema = z.object({
	currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
	newPassword: z.string().min(8, 'Senha deve conter: mínimo 8 caracteres'),
	totpCode: z
		.string()
		.length(6, 'Código TOTP deve ter 6 dígitos')
		.regex(/^\d{6}$/, 'Código TOTP deve conter apenas números'),
})

export const UpdateAdminSchema = z.object({
	id: z.string().uuid('ID deve ser um UUID válido'),
	name: z
		.string()
		.min(3, 'Nome deve ter no mínimo 3 caracteres')
		.max(100, 'Nome deve ter no máximo 100 caracteres')
		.optional(),
	email: z.string().email('Email inválido').optional(),
	password: z.string().min(8, 'Senha deve conter: mínimo 8 caracteres').optional(),
})

export const TerminateSessionAdminSchema = z.object({
	sessionId: z.string().uuid('ID de sessão deve ser um UUID válido'),
})

export type SignUpAdminInput = z.infer<typeof SignUpAdminSchema>
export type SignInAdminInput = z.infer<typeof SignInAdminSchema>
export type VerifyTwoFactorAdminInput = z.infer<typeof VerifyTwoFactorAdminSchema>
export type SetupTwoFactorAdminInput = z.infer<typeof SetupTwoFactorAdminSchema>
export type ConfirmTwoFactorAdminInput = z.infer<typeof ConfirmTwoFactorAdminSchema>
export type ForgotPasswordAdminInput = z.infer<typeof ForgotPasswordAdminSchema>
export type ResetPasswordAdminInput = z.infer<typeof ResetPasswordAdminSchema>
export type RefreshTokenAdminInput = z.infer<typeof RefreshTokenAdminSchema>
export type UpdateAdminProfileInput = z.infer<typeof UpdateAdminProfileSchema>
export type ChangePasswordAdminInput = z.infer<typeof ChangePasswordAdminSchema>
export type UpdateAdminInput = z.infer<typeof UpdateAdminSchema>
export type TerminateSessionAdminInput = z.infer<typeof TerminateSessionAdminSchema>
