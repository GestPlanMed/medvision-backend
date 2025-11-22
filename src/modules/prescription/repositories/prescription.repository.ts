import { db } from '@/lib/prisma'
import type { CreatePrescriptionInput, UpdatePrescriptionInput, ListPrescriptionsFilterInput } from '../schemas/prescription.schema'

export class PrescriptionRepository {
	async findAll(filters: Partial<ListPrescriptionsFilterInput> = {}) {
		const { patientId, doctorId, status, page = 1, limit = 10 } = filters

		const skip = (page - 1) * limit

		return await db.prescription.findMany({
			where: {
				patientId: patientId ? patientId : undefined,
				doctorId: doctorId ? doctorId : undefined,
				status: status ? status : undefined,
			},
			select: {
				id: true,
				patientId: true,
				doctorId: true,
				appointmentId: true,
				content: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
			skip,
			take: limit,
		})
	}

	async findById(id: string) {
		return await db.prescription.findUnique({
			where: { id },
			select: {
				id: true,
				patientId: true,
				doctorId: true,
				appointmentId: true,
				content: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				patient: {
					select: {
						id: true,
						name: true,
						cpf: true,
						phone: true,
					},
				},
				doctor: {
					select: {
						id: true,
						name: true,
						crm: true,
						specialty: true,
					},
				},
			},
		})
	}

	async findByPatientId(patientId: string, filters: Partial<ListPrescriptionsFilterInput> = {}) {
		const { status, page = 1, limit = 10 } = filters

		const skip = (page - 1) * limit

		return await db.prescription.findMany({
			where: {
				patientId,
				status: status ? status : undefined,
			},
			select: {
				id: true,
				patientId: true,
				doctorId: true,
				appointmentId: true,
				content: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				doctor: {
					select: {
						id: true,
						name: true,
						specialty: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			skip,
			take: limit,
		})
	}

	async findByDoctorId(doctorId: string, filters: Partial<ListPrescriptionsFilterInput> = {}) {
		const { status, page = 1, limit = 10 } = filters

		const skip = (page - 1) * limit

		return await db.prescription.findMany({
			where: {
				doctorId,
				status: status ? status : undefined,
			},
			select: {
				id: true,
				patientId: true,
				doctorId: true,
				appointmentId: true,
				content: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				patient: {
					select: {
						id: true,
						name: true,
						cpf: true,
						phone: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			skip,
			take: limit,
		})
	}

	async findByAppointmentId(appointmentId: string) {
		return await db.prescription.findMany({
			where: { appointmentId },
			select: {
				id: true,
				patientId: true,
				doctorId: true,
				appointmentId: true,
				content: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		})
	}

	async create(data: CreatePrescriptionInput) {
		return await db.prescription.create({
			data: {
				patientId: data.patientId,
				doctorId: data.doctorId,
				appointmentId: data.appointmentId,
				content: data.content,
				status: 'active',
			},
			select: {
				id: true,
				patientId: true,
				doctorId: true,
				appointmentId: true,
				content: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		})
	}

	async update(data: UpdatePrescriptionInput) {
		const { id, ...updateData } = data

		return await db.prescription.update({
			where: { id },
			data: {
				...updateData,
				updatedAt: new Date(),
			},
			select: {
				id: true,
				patientId: true,
				doctorId: true,
				appointmentId: true,
				content: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		})
	}

	async delete(id: string) {
		await db.prescription.delete({
			where: { id },
		})
	}

	async countByPatientId(patientId: string) {
		return await db.prescription.count({
			where: { patientId },
		})
	}

	async countByDoctorId(doctorId: string) {
		return await db.prescription.count({
			where: { doctorId },
		})
	}
}
