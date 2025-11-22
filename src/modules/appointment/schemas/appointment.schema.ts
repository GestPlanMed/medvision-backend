import z from 'zod'

export const CreateAppointmentSchema = z.object({
	patientId: z.string().uuid(),
	doctorId: z.string().uuid(),
	appointmentDate: z.string().datetime(),
	reason: z.string().min(5).max(500),
	linkCall: z.string().url(),
})

export const UpdateAppointmentSchema = z.object({
	id: z.string().uuid(),
	patientId: z.string().uuid().optional(),
	doctorId: z.string().uuid().optional(),
	appointmentDate: z.string().datetime().optional(),
	reason: z.string().min(5).max(500).optional(),
	notes: z.string().min(0).max(1000).optional(),
	linkCall: z.string().url().optional(),
	status: z.enum(['scheduled', 'completed', 'canceled']).optional(),
})

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>
