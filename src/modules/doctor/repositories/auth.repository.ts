import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { doctors } from '../../../db/schema'
import type { SignUpDoctorInput } from '../schemas/auth.schema'
import type { DoctorData } from '../types'

export class DoctorAuthRepository {
	async findByEmail(email: string): Promise<DoctorData | null> {
		const [doctor] = await db.select().from(doctors).where(eq(doctors.email, email)).limit(1)

		return (doctor as DoctorData) || null
	}

	async findByCRM(crm: string): Promise<DoctorData | null> {
		const [doctor] = await db.select().from(doctors).where(eq(doctors.crm, crm)).limit(1)

		return (doctor as DoctorData) || null
	}

	async findById(id: string): Promise<DoctorData | null> {
		const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1)

		return (doctor as DoctorData) || null
	}

	async create(data: SignUpDoctorInput & { password: string }): Promise<DoctorData> {
		const [doctor] = await db
			.insert(doctors)
			.values({
				name: data.name,
				email: data.email,
				phone: data.phone,
				crm: data.crm,
				specialty: data.specialty,
				password: data.password,
			})
			.returning()

		return doctor as DoctorData
	}

	async updatePassword(doctorId: string, hashedPassword: string): Promise<void> {
		await db
			.update(doctors)
			.set({
				password: hashedPassword,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(doctors.id, doctorId))
	}

	async updateResetCode(doctorId: string, code: string): Promise<void> {
		await db
			.update(doctors)
			.set({
				resetCode: code,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(doctors.id, doctorId))
	}

	async clearResetCode(doctorId: string): Promise<void> {
		await db
			.update(doctors)
			.set({
				resetCode: null,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(doctors.id, doctorId))
	}

	async emailExists(email: string): Promise<boolean> {
		const doctor = await this.findByEmail(email)
		return doctor !== null
	}

	async crmExists(crm: string): Promise<boolean> {
		const doctor = await this.findByCRM(crm)
		return doctor !== null
	}
}
