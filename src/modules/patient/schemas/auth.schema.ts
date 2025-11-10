import z from 'zod'

export const SignUpPatientSchema = z.object({
	name: z.string().min(3).max(100),
	age: z.number().min(0).max(120),
	phone: z.string().min(10).max(15),
	cpf: z.string().min(11).max(11),
	address: z.object({
		street: z.string().min(1),
		city: z.string().min(1),
		state: z.string().min(2).max(2),
		zipCode: z.string().min(5).max(10),
	}).optional(),
	code: z.string().min(6).max(6).optional(),
})

export const SignInPatientSchema = z.object({
	cpf: z.string().min(11).max(11),
})

export const ValidateCodePatientSchema = z.object({
	cpf: z.string().min(11).max(11),
	code: z.string().min(6).max(6),
})

export const ResendCodePatientSchema = z.object({
	cpf: z.string().min(11).max(11),
})

export const UpdatePatientSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(3).max(100).optional(),
	age: z.number().min(0).max(120).optional(),
	phone: z.string().min(10).max(15).optional(),
	address: z
		.object({
			street: z.string().min(1).optional(),
			city: z.string().min(1).optional(),
			state: z.string().min(2).max(2).optional(),
			zipCode: z.string().min(5).max(10).optional(),
		})
		.optional(),
	code: z.string().min(6).max(6).optional(),
})

export type SignUpPatientInput = z.infer<typeof SignUpPatientSchema>
export type SignInPatientInput = z.infer<typeof SignInPatientSchema>
export type ValidateCodePatientInput = z.infer<typeof ValidateCodePatientSchema>
export type ResendCodePatientInput = z.infer<typeof ResendCodePatientSchema>
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>
