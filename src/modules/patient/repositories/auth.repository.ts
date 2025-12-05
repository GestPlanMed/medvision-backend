import { db } from '@/lib/prisma'
import type { SignUpPatientInput } from '../schemas/auth.schema'

export class PatientAuthRepository {
	async findByCPF(cpf: string) {
		const patient = await db.patient.findUnique({
			where: { cpf },
			include: {
				appointments: true,
			},
		})

		if (!patient) return null

		return patient
	}

	async findById(id: string) {
		const patient = await db.patient.findUnique({
			where: { id },
		})

		if (!patient) return null

		return patient
	}

	async findByPhone(phone: string) {
		const patient = await db.patient.findFirst({
			where: { phone },
		})

		if (!patient) return null

		return patient
	}

	async create(data: SignUpPatientInput) {
		// Converter address para objeto JSON se for string
		let addressData: object | undefined = undefined
		if (data.address) {
			if (typeof data.address === 'string' && (data.address as string).trim()) {
				try {
					addressData = JSON.parse(data.address)
				} catch {
					// Se não for JSON válido, não salvar
					addressData = undefined
				}
			} else if (typeof data.address === 'object') {
				addressData = data.address
			}
		}

		const patient = await db.patient.create({
			data: {
				name: data.name,
				age: data.age,
				cpf: data.cpf,
				phone: data.phone,
				gender: data.gender,
				address: addressData,
			},
		})

		return patient
	}

	async updateVerificationCode(patientId: string, code: string) {
		const patient = await db.patient.update({
			where: { id: patientId },
			data: {
				code,
				updatedAt: new Date(),
			},
		})

		return patient
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
