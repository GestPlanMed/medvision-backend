import z from 'zod'

export const SignUpDoctorSchema = z.object({
	name: z.string().min(3).max(100),
	email: z.string().email(),
	phone: z.string().min(10).max(15),
	crm: z.string().min(5).max(20),
	specialty: z.string().min(3).max(100),
	password: z.string().min(6).max(100),
	code: z.string().min(3).max(6).optional().nullable(),
	resetCode: z.string().length(6).optional().nullable(),
})

export const SignInDoctorSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6).max(25),
})

export const UpdateDoctorSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(3).max(100).optional(),
	email: z.string().email().optional(),
	password: z.string().min(6).max(100).optional(),
	resetCode: z.string().length(6).optional().nullable(),
	phone: z.string().min(10).max(15).optional(),
	crm: z.string().min(5).max(20).optional(),
	specialty: z.string().min(3).max(100).optional(),
	code: z.string().min(3).max(6).optional().nullable(),
})

export const ForgotPasswordDoctorSchema = z.object({
	email: z.string().email(),
})

export const ResetPasswordDoctorSchema = z.object({
	email: z.string().email(),
	code: z.string().length(6),
	newPassword: z.string().min(6).max(100),
})

export type SignUpDoctorInput = z.infer<typeof SignUpDoctorSchema>
export type SignInDoctorInput = z.infer<typeof SignInDoctorSchema>
export type UpdateDoctorInput = z.infer<typeof UpdateDoctorSchema>
export type ForgotPasswordDoctorInput = z.infer<typeof ForgotPasswordDoctorSchema>
export type ResetPasswordDoctorInput = z.infer<typeof ResetPasswordDoctorSchema>