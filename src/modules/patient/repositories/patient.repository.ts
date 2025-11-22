import { db } from '@/lib/prisma'

export class PatientRepository {
	async findAll() {
		return await db.patient.findMany({
			select: {
				id: true,
				name: true,
				age: true,
				cpf: true,
				phone: true,
				address: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
	}

	async findById(id: string) {
		return await db.patient.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				age: true,
				cpf: true,
				phone: true,
				address: true,
				createdAt: true,
			},
		})
	}

	async findByCpf(cpf: string) {
		return await db.patient.findUnique({
			where: { cpf },
		})
	}

	async delete(id: string) {
		await db.patient.delete({
			where: { id },
		})
	}
}
