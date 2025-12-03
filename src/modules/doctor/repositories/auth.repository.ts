import { db } from '@/lib/prisma'
import type { SignUpDoctorInput } from '../schemas/auth.schema'

export class DoctorAuthRepository {
	async findByEmail(email: string) {
		return await db.doctor.findUnique({
			where: { email },
		})
	}

	async findByCRM(crm: string) {
		return await db.doctor.findUnique({
			where: { crm },
		})
	}

	async findById(id: string) {
		return await db.doctor.findUnique({
			where: { id },
			include: {
				appointments: {
					include: {
						patient: true
					}
				},
			},
		})
	}

	async create(data: SignUpDoctorInput & { password: string }) {
		return await db.doctor.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				crm: data.crm,
				specialty: data.specialty,
				password: data.password,
			}
		})
	}

	async updatePassword(doctorId: string, hashedPassword: string) {
		await db.doctor.update({
			where: { id: doctorId },
			data: {
				password: hashedPassword,
				updatedAt: new Date(),
			},
		})
	}

	async updateResetCode(doctorId: string, code: string | null): Promise<void> {
		await db.doctor.update({
			where: { id: doctorId },
			data: {
				resetCode: code,
				updatedAt: new Date(),
			},
		})
	}

	async clearResetCode(doctorId: string): Promise<void> {
		await db.doctor.update({
			where: { id: doctorId },
			data: {
				resetCode: null,
				updatedAt: new Date(),
			},
		})
	}

	async emailExists(email: string) {
		const doctor = await this.findByEmail(email)
		return doctor !== null
	}

	async crmExists(crm: string) {
		const doctor = await this.findByCRM(crm)
		return doctor !== null
	}
}
