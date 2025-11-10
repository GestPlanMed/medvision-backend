import { db } from '@/db'
import { patients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { SignUpPatientInput, UpdatePatientInput } from '../schemas/auth.schema'

export class AuthRepository {
	async findPatientByCpf(cpf: string) {
		return await db.select().from(patients).where(eq(patients.cpf, cpf)).limit(1)
	}

	async findPatientById(id: string) {
		return await db.select().from(patients).where(eq(patients.id, id)).limit(1)
	}

	async createPatient(data: SignUpPatientInput) {
		return await db.insert(patients).values({
			name: data.name,
			age: data.age,
			cpf: data.cpf,
			phone: data.phone,
			address: data.address ? JSON.stringify(data.address) : null
		}).returning()
	}

	async updatePatient(data: UpdatePatientInput) {
		const { id, address, ...rest } = data

		return await db
			.update(patients)
			.set({
				...rest,
				address: address ? JSON.stringify(address) : undefined,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(patients.id, id))
			.returning()
	}
}
