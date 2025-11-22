import { db } from '@/lib/prisma'
import type { SignUpAdminInput } from '../schemas/auth.schema'

export class AdminAuthRepository {
	async findByEmail(email: string) {
		return await db.admin.findUnique({
			where: { email },
		})
	}

	async findById(id: string) {
		return await db.admin.findUnique({
			where: { id },
		})
	}

	async create(data: SignUpAdminInput & { password: string }) {
		return await db.admin.create({
			data: {
				name: data.name,
				email: data.email,
				password: data.password,
			},
		})
	}

	async updatePassword(adminId: string, hashedPassword: string) {
		await db.admin.update({
			where: { id: adminId },
			data: {
				password: hashedPassword,
				updatedAt: new Date(),
			},
		})
	}

	async updateResetCode(adminId: string, code: string) {
		await db.admin.update({
			where: { id: adminId },
			data: {
				resetCode: code,
				updatedAt: new Date(),
			},
		})
	}

	async clearResetCode(adminId: string) {
		await db.admin.update({
			where: { id: adminId },
			data: {
				resetCode: null,
				updatedAt: new Date(),
			},
		})
	}

	async emailExists(email: string) {
		const admin = await this.findByEmail(email)
		return admin !== null
	}
}
