import z from 'zod'

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,100}$/

const phoneRegex = /^(\+?55\s?)?(\(?\d{2}\)?)?(?:9\d{4}-?\d{4}|\d{4}-?\d{4})$/

const crmRegex = /^\d{4,6}\/[A-Z]{2}$/

export const SignUpDoctorSchema = z.object({
	name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
	email: z.string().email('Email inválido').endsWith('.com', 'Email corporativo obrigatório'),
	phone: z.string().regex(phoneRegex, 'Formato de telefone inválido'),
	crm: z.string().regex(crmRegex, 'Formato de CRM inválido (ex: 12345/SP)'),
	specialty: z
		.string()
		.min(3, 'Especialidade deve ter no mínimo 3 caracteres')
		.max(100, 'Especialidade deve ter no máximo 100 caracteres'),
	password: z.string().min(8, 'Senha deve conter: mínimo 8 caracteres'),
})

export const SignInDoctorSchema = z.object({
	email: z.string().email('Email inválido'),
	password: z.string().min(1, 'Senha é obrigatória'),
})

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

export const RefreshTokenDoctorSchema = z.object({
	refreshToken: z.string().min(1, 'Token de refresh é obrigatório'),
})

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

export const ChangePasswordDoctorSchema = z.object({
	currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
	newPassword: z
		.string()
		.regex(strongPasswordRegex, 'Senha deve conter: maiúscula, minúscula, número e mínimo 8 caracteres'),
})

export type SignUpDoctorInput = z.infer<typeof SignUpDoctorSchema>
export type SignInDoctorInput = z.infer<typeof SignInDoctorSchema>
export type ForgotPasswordDoctorInput = z.infer<typeof ForgotPasswordDoctorSchema>
export type ResetPasswordDoctorInput = z.infer<typeof ResetPasswordDoctorSchema>
export type RefreshTokenDoctorInput = z.infer<typeof RefreshTokenDoctorSchema>
export type UpdateDoctorProfileInput = z.infer<typeof UpdateDoctorProfileSchema>
export type ChangePasswordDoctorInput = z.infer<typeof ChangePasswordDoctorSchema>
