import z from 'zod'

export const CreateAppointmentSchema = z.object({
	patientId: z.string().uuid(),
	doctorId: z.string().uuid(),
	appointmentDate: z.string().datetime(),
	reason: z.string().min(3).max(500),
	status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
})

export const UpdateAppointmentSchema = z.object({
	id: z.string().uuid(),
	patientId: z.string().uuid().optional(),
	doctorId: z.string().uuid().optional(),
	appointmentDate: z.string().datetime().optional(),
	reason: z.string().min(3).max(500).optional(),
	status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
})

export const GetAppointmentByIdSchema = z.object({
	id: z.string().uuid(),
})

export const DeleteAppointmentSchema = z.object({
	id: z.string().uuid(),
})

export const ListAppointmentsQuerySchema = z.object({
	patientId: z.string().uuid().optional(),
	doctorId: z.string().uuid().optional(),
	status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	page: z.coerce.number().default(1),
	limit: z.coerce.number().default(10),
})

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>
export type GetAppointmentByIdInput = z.infer<typeof GetAppointmentByIdSchema>
export type DeleteAppointmentInput = z.infer<typeof DeleteAppointmentSchema>
export type ListAppointmentsQueryInput = z.infer<typeof ListAppointmentsQuerySchema>
