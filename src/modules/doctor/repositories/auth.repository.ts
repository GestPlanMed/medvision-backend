import { db } from '@/db'
import { doctors } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { SignUpDoctorInput, UpdateDoctorInput } from '../schemas/auth.schema'

export class AuthRepository {
	async findDoctorByEmail(email: string) {
		return await db.select().from(doctors).where(eq(doctors.email, email)).limit(1)
	}

	async findDoctorByCRM(crm: string) {
		return await db.select().from(doctors).where(eq(doctors.crm, crm)).limit(1)
	}

	async findDoctorById(id: string) {
		return await db.select().from(doctors).where(eq(doctors.id, id)).limit(1)
	}

	async createDoctor(data: SignUpDoctorInput) {
		const [Doctor] = await db.insert(doctors).values(data).returning()
		const { password: _password, ...DoctorWithoutPassword } = Doctor
		return DoctorWithoutPassword
	}

	async updateDoctor(data: UpdateDoctorInput) {
		const { id, ...rest } = data

		const [Doctor] = await db
			.update(doctors)
			.set({
				...rest,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(doctors.id, id))
			.returning()

		if (!Doctor) return null

		const { password: _password, ...DoctorWithoutPassword } = Doctor
		return DoctorWithoutPassword
	}
}
