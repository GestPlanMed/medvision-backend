import { db } from '@/lib/prisma'
import type { SignUpPatientInput } from '../schemas/auth.schema'

export class PatientAuthRepository {
	async findByCPF(cpf: string) {
		return await db.patient.findUnique({
			where: { cpf },
		})
	}

	async findById(id: string) {
		return await db.patient.findUnique({
			where: { id },
		})
	}

	async findByPhone(phone: string) {
		return await db.patient.findFirst({
			where: { phone },
		})
	}

	async create(data: SignUpPatientInput) {
		return await db.patient.create({
			data: {
				name: data.name,
				age: data.age,
				cpf: data.cpf,
				phone: data.phone,
				address: data.address,
			},
		})
	}

	async updateVerificationCode(patientId: string, code: string) {
		return await db.patient.update({
			where: { id: patientId },
			data: {
				code,
				updatedAt: new Date(),
			},
		})
	}

	async verifyCode(patientId: string, code: string) {
		const patient = await this.findById(patientId)

		if (!patient || !patient.code) {
			return false
		}

		return patient.code === code
	}

	async clearVerificationCode(patientId: string) {
		await db.patient.update({
			where: { id: patientId },
			data: {
				code: null,
				updatedAt: new Date(),
			},
		})
	}

	async cpfExists(cpf: string) {
		const patient = await this.findByCPF(cpf)
		return patient !== null
	}

	async phoneExists(phone: string) {
		const patient = await this.findByPhone(phone)
		return patient !== null
	}
}
