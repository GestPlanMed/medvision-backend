import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { admins } from '../../../db/schema'
import type { SignUpAdminInput } from '../schemas/auth.schema'
import type { AdminData } from '../types'

export class AdminAuthRepository {
	async findByEmail(email: string): Promise<AdminData | null> {
		const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1)

		return (admin as AdminData) || null
	}

	async findById(id: string): Promise<AdminData | null> {
		const [admin] = await db.select().from(admins).where(eq(admins.id, id)).limit(1)

		return (admin as AdminData) || null
	}

	async create(data: SignUpAdminInput & { password: string }): Promise<AdminData> {
		const [admin] = await db
			.insert(admins)
			.values({
				name: data.name,
				email: data.email,
				password: data.password,
			})
			.returning()

		return admin as AdminData
	}

	async updatePassword(adminId: string, hashedPassword: string): Promise<void> {
		await db
			.update(admins)
			.set({
				password: hashedPassword,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(admins.id, adminId))
	}

	async updateResetCode(adminId: string, code: string): Promise<void> {
		await db
			.update(admins)
			.set({
				resetCode: code,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(admins.id, adminId))
	}

	async clearResetCode(adminId: string): Promise<void> {
		await db
			.update(admins)
			.set({
				resetCode: null,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(admins.id, adminId))
	}

	async emailExists(email: string): Promise<boolean> {
		const admin = await this.findByEmail(email)
		return admin !== null
	}
}
