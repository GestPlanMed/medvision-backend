import { eq, desc } from 'drizzle-orm'
import { db } from '@/db'
import { patients } from '@/db/schema'

export class PatientRepository {
	async findAll() {
		return await db
			.select({
				id: patients.id,
				name: patients.name,
				age: patients.age,
				cpf: patients.cpf,
				phone: patients.phone,
				address: patients.address,
				createdAt: patients.createdAt,
			})
			.from(patients)
			.orderBy(desc(patients.createdAt))
	}

	async findById(id: string) {
		const [patient] = await db
			.select({
				id: patients.id,
				name: patients.name,
				age: patients.age,
				cpf: patients.cpf,
				phone: patients.phone,
				address: patients.address,
				createdAt: patients.createdAt,
			})
			.from(patients)
			.where(eq(patients.id, id))
			.limit(1)

		return patient
	}

	async findByCpf(cpf: string) {
		const [patient] = await db.select().from(patients).where(eq(patients.cpf, cpf)).limit(1)

		return patient
	}

	async delete(id: string) {
		await db.delete(patients).where(eq(patients.id, id))
	}
}
