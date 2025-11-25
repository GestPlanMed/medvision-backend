import z from 'zod'

const cpfRegex = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/

const phoneRegex = /^(\+?55\s?)?(\(?\d{2}\)?)?(?:9\d{4}-?\d{4}|\d{4}-?\d{4})$/

export const SignUpPatientSchema = z.object({
	name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
	age: z.number().min(0, 'Idade não pode ser negativa').max(120, 'Idade inválida'),
	phone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos').max(15, 'Telefone deve ter no máximo 15 caracteres'),
	cpf: z
		.string()
		.min(11, 'CPF deve ter no mínimo 11 dígitos')
		.max(14, 'CPF deve ter no máximo 14 caracteres'),
	address: z
		.object({
			number: z.string().min(1, 'Número é obrigatório'),
			zipcode: z.string().min(8, 'CEP deve ter no mínimo 8 caracteres').max(9, 'CEP deve ter no máximo 9 caracteres'),
			street: z.string().min(1, 'Rua é obrigatória'),
			city: z.string().min(1, 'Cidade é obrigatória'),
			neighborhood: z.string().min(1, 'Bairro é obrigatório'),
		})
		.optional(),
})

export const SignInPatientSchema = z.object({
	cpf: z
		.string()
		.min(11, 'CPF deve ter no mínimo 11 dígitos')
		.max(14, 'CPF deve ter no máximo 14 caracteres')
		.regex(cpfRegex, 'Formato de CPF inválido'),
})

export const ValidateCodePatientSchema = z.object({
	cpf: z
		.string()
		.min(11, 'CPF deve ter no mínimo 11 dígitos')
		.max(14, 'CPF deve ter no máximo 14 caracteres')
		.regex(cpfRegex, 'Formato de CPF inválido'),
	securityCode: z
		.string()
		.length(6, 'Código de segurança deve ter exatamente 6 dígitos')
		.regex(/^\d{6}$/, 'Código deve conter apenas números'),
})

export const ResendCodePatientSchema = z.object({
	cpf: z
		.string()
		.min(11, 'CPF deve ter no mínimo 11 dígitos')
		.max(14, 'CPF deve ter no máximo 14 caracteres')
		.regex(cpfRegex, 'Formato de CPF inválido'),
})

export const GenerateSecurityCodeSchema = z.object({
	cpf: z
		.string()
		.min(11, 'CPF deve ter no mínimo 11 dígitos')
		.max(14, 'CPF deve ter no máximo 14 caracteres')
		.regex(cpfRegex, 'Formato de CPF inválido'),
})

export const RefreshTokenPatientSchema = z.object({
	refreshToken: z.string().min(1, 'Token de refresh é obrigatório'),
})

export const UpdatePatientProfileSchema = z.object({
	name: z
		.string()
		.min(3, 'Nome deve ter no mínimo 3 caracteres')
		.max(100, 'Nome deve ter no máximo 100 caracteres')
		.optional(),
	phone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos').max(15, 'Telefone deve ter no máximo 15 caracteres').regex(phoneRegex, 'Formato de telefone inválido').optional(),
	address: z.union([z.string(), z.object({}).passthrough()]).optional().nullable(),
})

export const UpdatePatientSchema = z.object({
	id: z.string().uuid('ID deve ser um UUID válido'),
	name: z
		.string()
		.min(3, 'Nome deve ter no mínimo 3 caracteres')
		.max(100, 'Nome deve ter no máximo 100 caracteres')
		.optional(),
	age: z.number().min(0, 'Idade não pode ser negativa').max(120, 'Idade inválida').optional(),
	phone: z.string().regex(phoneRegex, 'Formato de telefone inválido').optional(),
	address: z.union([z.string(), z.object({}).passthrough()]).optional().nullable(),
})

export type SignUpPatientInput = z.infer<typeof SignUpPatientSchema>
export type SignInPatientInput = z.infer<typeof SignInPatientSchema>
export type ValidateCodePatientInput = z.infer<typeof ValidateCodePatientSchema>
export type ResendCodePatientInput = z.infer<typeof ResendCodePatientSchema>
export type GenerateSecurityCodeInput = z.infer<typeof GenerateSecurityCodeSchema>
export type RefreshTokenPatientInput = z.infer<typeof RefreshTokenPatientSchema>
export type UpdatePatientProfileInput = z.infer<typeof UpdatePatientProfileSchema>
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>
