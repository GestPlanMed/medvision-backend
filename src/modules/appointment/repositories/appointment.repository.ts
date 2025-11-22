import { db } from '@/lib/prisma'
import type { CreateAppointmentInput, UpdateAppointmentInput } from '../schemas/appointment.schema'

export class AppointmentRepository {
	async create(appointmentData: CreateAppointmentInput) {
		await db.appointment.create({ data: appointmentData })
	}

	async findById(appointmentId: string) {
		return await db.appointment.findUnique({ where: { id: appointmentId } })
	}

	async findAll() {
		return await db.appointment.findMany({
			include: {
				prescriptions: true,
				doctor: {
					select: {
						id: true,
						name: true,
						specialty: true,
					},
				},
				patient: {
					select: {
						id: true,
						name: true,
						cpf: true,
					}
				}
			}
		})
	}

	async update(updateData: UpdateAppointmentInput) {
		const { id, ...data } = updateData

		return await db.appointment.update({
			where: { id },
			data,
		})
	}
}
