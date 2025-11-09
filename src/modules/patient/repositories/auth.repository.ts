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
		return await db.insert(patients).values(data).returning()
	}

	async updatePatient(data: UpdatePatientInput) {
		return await db.update(patients).set(data).where(eq(patients.id, data.id)).returning()
	}
}
