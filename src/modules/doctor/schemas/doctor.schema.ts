import z from 'zod'

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,100}$/

const phoneRegex = /^(\+?55\s?)?(\(?\d{2}\)?)?(?:9\d{4}-?\d{4}|\d{4}-?\d{4})$/

const crmRegex = /^\d{4,6}\/[A-Z]{2}$/

export const CreateDoctorSchema = z.object({
	name: z.string().min(2).max(100),
	specialty: z.string().min(2).max(100),
	email: z.string().email(),
	phone: z.string().min(10).max(15),
	crm: z.string().min(2).max(20),
	password: z
		.string()
		.regex(strongPasswordRegex, 'Senha deve conter: maiúscula, minúscula, número e mínimo 8 caracteres'),
})

export const DoctorSchema = CreateDoctorSchema.extend({
	id: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

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

export type CreateDoctorInput = z.infer<typeof CreateDoctorSchema>
export type UpdateDoctorInput = z.infer<typeof UpdateDoctorSchema>
export type DoctorOutput = z.infer<typeof DoctorSchema>
