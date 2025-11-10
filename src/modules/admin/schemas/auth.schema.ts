import z from 'zod'

export const SignUpAdminSchema = z.object({
	name: z.string().min(3).max(100),
	email: z.string().email(),
	password: z.string().min(6).max(100),
})

export const SignInAdminSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6).max(25),
})

export const UpdateAdminSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(3).max(100).optional(),
	email: z.string().email().optional(),
	password: z.string().min(6).max(100).optional(),
	resetCode: z.string().length(6).optional().nullable()
})

export const ForgotPasswordAdminSchema = z.object({
	email: z.string().email(),
})

export const ResetPasswordAdminSchema = z.object({
	email: z.string().email(),
	code: z.string().length(6),
	newPassword: z.string().min(6).max(100),
})

export type SignUpAdminInput = z.infer<typeof SignUpAdminSchema>
export type SignInAdminInput = z.infer<typeof SignInAdminSchema>
export type UpdateAdminInput = z.infer<typeof UpdateAdminSchema>
export type ForgotPasswordAdminInput = z.infer<typeof ForgotPasswordAdminSchema>
export type ResetPasswordAdminInput = z.infer<typeof ResetPasswordAdminSchema>