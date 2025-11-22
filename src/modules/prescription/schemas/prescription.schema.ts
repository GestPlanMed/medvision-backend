import z from 'zod'

export const CreatePrescriptionSchema = z.object({
	patientId: z.string().uuid('ID do paciente inválido'),
	doctorId: z.string().uuid('ID do médico inválido'),
	appointmentId: z.string().uuid('ID da consulta inválido').optional(),
	content: z.string().min(5, 'Conteúdo deve ter no mínimo 5 caracteres').max(2000, 'Conteúdo muito longo'),
})

export const UpdatePrescriptionSchema = z.object({
    id: z.string().uuid('ID da prescrição inválido'),
    content: z.string().min(5, 'Conteúdo deve ter no mínimo 5 caracteres').max(2000, 'Conteúdo muito longo').optional(),
    status: z.enum(['active', 'expired', 'cancelled']).optional(),
})

export const ListPrescriptionsFilterSchema = z.object({
	patientId: z.string().uuid().optional(),
	doctorId: z.string().uuid().optional(),
	status: z.enum(['active', 'expired', 'cancelled']).optional(),
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().max(100).default(10),
})

export type CreatePrescriptionInput = z.infer<typeof CreatePrescriptionSchema>
export type UpdatePrescriptionInput = z.infer<typeof UpdatePrescriptionSchema>
export type ListPrescriptionsFilterInput = z.infer<typeof ListPrescriptionsFilterSchema>
