import { db } from '@/lib/prisma'
import type { UpdatePatientInput } from '../schemas/patient.schema'

export class PatientRepository {
	async findAll() {
		const patients = await db.patient.findMany({
			select: {
				id: true,
				name: true,
				age: true,
				cpf: true,
				phone: true,
				address: true,
				createdAt: true,
				appointments: {
					select: {
						id: true,
						doctorId: true,
						appointmentDate: true,
						status: true,
						reason: true,
						createdAt: true,
						doctor: {
							select: {
								id: true,
								name: true,
								specialty: true,
							},
						},
					},
					orderBy: {
						appointmentDate: 'desc',
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return patients.map(patient => ({
			...patient,
			address: typeof patient.address === 'string' ? JSON.parse(patient.address) : patient.address
		}))
	}

	async findById(id: string) {
		const patient = await db.patient.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				age: true,
				cpf: true,
				phone: true,
				address: true,
				createdAt: true,
				appointments: {
					select: {
						id: true,
						doctorId: true,
						appointmentDate: true,
						status: true,
						reason: true,
						createdAt: true,
						roomName: true,
						doctor: {
							select: {
								id: true,
								name: true,
								specialty: true,
							},
						},
					},
					orderBy: {
						appointmentDate: 'desc',
					},
				},
			},
		})

		if (!patient) return null

		return {
			...patient,
			address: typeof patient.address === 'string' ? JSON.parse(patient.address) : patient.address
		}
	}

	async findByCpf(cpf: string) {
		const patient = await db.patient.findUnique({
			where: { cpf },
		})

		if (!patient) return null

		return patient
	}

	async delete(id: string) {
		await db.patient.delete({
			where: { id },
		})
	}

	async update(data: UpdatePatientInput) {
		const { id, ...updateData } = data

		const patient = await db.patient.update({
			where: { id },
			data: {
				...updateData,
				updatedAt: new Date(),
			},
		})

		return {
			...patient,
			address: typeof patient.address === 'string' ? JSON.parse(patient.address) : patient.address
		}
	}
}
