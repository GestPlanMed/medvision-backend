import { db } from '@/lib/prisma'
import type { CreateDoctorInput, UpdateDoctorInput } from '../schemas/doctor.schema'

export class DoctorRepository {
	async findAll() {
		return await db.doctor.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				specialty: true,
				crm: true,
				createdAt: true,
				appointments: true
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
	}

	async findById(id: string) {
		return await db.doctor.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				specialty: true,
				crm: true,
				createdAt: true,
			},
		})
	}

	async findByEmail(email: string) {
		return await db.doctor.findUnique({
			where: { email },
		})
	}

	async findByCRM(crm: string) {
		return await db.doctor.findUnique({
			where: { crm },
		})
	}

	async create(data: CreateDoctorInput) {
		return await db.doctor.create({
			data,
		})
	}

	async update(data: UpdateDoctorInput) {
		const { id, ...updateData } = data

		return await db.doctor.update({
			where: { id },
			data: {
				...updateData,
				updatedAt: new Date(),
			},
		})
	}

	async delete(id: string) {
		await db.doctor.delete({
			where: { id },
		})
	}
}
