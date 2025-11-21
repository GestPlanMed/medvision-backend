import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { patients } from '../../../db/schema'
import type { SignUpPatientInput } from '../schemas/auth.schema'
import type { PatientData } from '../types'

export class PatientAuthRepository {
	async findByCPF(cpf: string): Promise<PatientData | null> {
		const [patient] = await db.select().from(patients).where(eq(patients.cpf, cpf)).limit(1)

		return (patient as PatientData) || null
	}

	async findById(id: string): Promise<PatientData | null> {
		const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1)

		return (patient as PatientData) || null
	}

	async findByPhone(phone: string): Promise<PatientData | null> {
		const [patient] = await db.select().from(patients).where(eq(patients.phone, phone)).limit(1)

		return (patient as PatientData) || null
	}

	async create(data: SignUpPatientInput): Promise<PatientData> {
		const [patient] = await db
			.insert(patients)
			.values({
				name: data.name,
				age: data.age,
				cpf: data.cpf,
				phone: data.phone,
				address: data.address,
			})
			.returning()

		return patient as PatientData
	}

	async updateVerificationCode(patientId: string, code: string): Promise<PatientData> {
		const [updated] = await db
			.update(patients)
			.set({
				code,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(patients.id, patientId))
			.returning()

		return updated as PatientData
	}

	async verifyCode(patientId: string, code: string): Promise<boolean> {
		const patient = await this.findById(patientId)

		if (!patient || !patient.code) {
			return false
		}

		return patient.code === code
	}

	async clearVerificationCode(patientId: string): Promise<void> {
		await db
			.update(patients)
			.set({
				code: null,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(patients.id, patientId))
	}

	async cpfExists(cpf: string): Promise<boolean> {
		const patient = await this.findByCPF(cpf)
		return patient !== null
	}

	async phoneExists(phone: string): Promise<boolean> {
		const patient = await this.findByPhone(phone)
		return patient !== null
	}
}
