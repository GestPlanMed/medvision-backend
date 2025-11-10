import { db } from '@/db'
import { admins } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { SignUpAdminInput, UpdateAdminInput } from '../schemas/auth.schema'

export class AuthRepository {
	async findAdminByEmail(email: string) {
		return await db.select().from(admins).where(eq(admins.email, email)).limit(1)
	}

	async findAdminById(id: string) {
		return await db.select().from(admins).where(eq(admins.id, id)).limit(1)
	}

	async createAdmin(data: SignUpAdminInput) {
		const [admin] = await db.insert(admins).values(data).returning()
		const { password, ...adminWithoutPassword } = admin
		return adminWithoutPassword
	}

	async updateAdmin(data: UpdateAdminInput) {
		const { id, ...rest } = data

		const [admin] = await db
			.update(admins)
			.set({
				...rest,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(admins.id, id))
			.returning()

		if (!admin) return null

		const { password, ...adminWithoutPassword } = admin
		return adminWithoutPassword
	}
}
