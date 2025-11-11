import { db } from '@/db'
import { doctors } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export class DoctorRepository {
	async findAll() {
		return await db
			.select({
				id: doctors.id,
				name: doctors.name,
				email: doctors.email,
				phone: doctors.phone,
				specialty: doctors.specialty,
				crm: doctors.crm,
				createdAt: doctors.createdAt,
			})
			.from(doctors)
			.orderBy(desc(doctors.createdAt))
	}

	async findById(id: string) {
		const [doctor] = await db
			.select({
				id: doctors.id,
				name: doctors.name,
				email: doctors.email,
				phone: doctors.phone,
				specialty: doctors.specialty,
				crm: doctors.crm,
				createdAt: doctors.createdAt,
			})
			.from(doctors)
			.where(eq(doctors.id, id))
			.limit(1)

		return doctor
	}

	async findByEmail(email: string) {
		const [doctor] = await db.select().from(doctors).where(eq(doctors.email, email)).limit(1)

		return doctor
	}

	async findByCRM(crm: string) {
		const [doctor] = await db.select().from(doctors).where(eq(doctors.crm, crm)).limit(1)

		return doctor
	}

	async create(data: { name: string; email: string; password: string; phone: string; specialty: string; crm: string }) {
		const [doctor] = await db.insert(doctors).values(data).returning()
		return doctor
	}

	async update(id: string, data: { name?: string; email?: string; phone?: string; specialty?: string; crm?: string }) {
		const [doctor] = await db
			.update(doctors)
			.set({
				...data,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(doctors.id, id))
			.returning()

		return doctor
	}

	async delete(id: string) {
		await db.delete(doctors).where(eq(doctors.id, id))
	}
}
