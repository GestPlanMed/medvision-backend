import { FastifyReply, FastifyRequest } from 'fastify'
import { AuthRepository } from '../repositories/auth.repository'
import {
	ResendCodePatientSchema,
	SignInPatientSchema,
	SignUpPatientSchema,
	UpdatePatientSchema,
	ValidateCodePatientSchema,
} from '../schemas/auth.schema'

export class AuthController {
	private authRepository: AuthRepository

	constructor() {
		this.authRepository = new AuthRepository()
	}

	async createPatient(req: FastifyRequest, res: FastifyReply) {
		try {
			const patient = SignUpPatientSchema.safeParse(req.body)

			if (!patient.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: patient.error.format(),
				})
			}

			const patientExists = await this.authRepository.findPatientByCpf(patient.data.cpf)

			if (patientExists.length > 0) {
				return res.status(409).send({ message: 'Paciente já cadastrado.' })
			}

			const createdPatient = await this.authRepository.createPatient(patient.data)

			return createdPatient
		} catch (error) {
			throw error
		}
	}

	async updatePatient(req: FastifyRequest, res: FastifyReply) {
		try {
			const patient = UpdatePatientSchema.safeParse(req.body)

			if (!patient.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: patient.error.format(),
				})
			}

			const patientExists = await this.authRepository.findPatientById(patient.data.id)

			if (patientExists.length === 0) {
				return res.status(404).send({ message: 'Paciente não encontrado.' })
			}

			const updatedPatient = await this.authRepository.updatePatient(patient.data)

			return updatedPatient
		} catch (error) {
			throw error
		}
	}

	async signInPatient(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = SignInPatientSchema.safeParse(req.body)

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			const patient = await this.authRepository.findPatientByCpf(data.data.cpf)

			if (patient.length === 0) {
				return res.status(404).send({ message: 'Paciente não encontrado.' })
			}

			const patientCode = Math.random().toString(36).substring(2, 8).toUpperCase()

			await this.authRepository.updatePatient({
				id: patient[0].id,
				code: patientCode,
			})

			return await res.status(200).send({ message: 'Código de acesso enviado com sucesso.' })
		} catch (error) {
			throw error
		}
	}

	async validateCodePatient(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = ValidateCodePatientSchema.safeParse(req.body)

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			const patient = await this.authRepository.findPatientByCpf(data.data.cpf)

			if (patient.length === 0) {
				return res.status(404).send({ message: 'Paciente não encontrado.' })
			}

			if (patient[0].code !== data.data.code) {
				return res.status(401).send({ message: 'Código inválido.' })
			}

			return res.status(200).send({ message: 'Código validado com sucesso.' })
		} catch (error) {
			throw error
		}
	}

	async resendCodePatient(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = ResendCodePatientSchema.safeParse(req.body)

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			const patient = await this.authRepository.findPatientByCpf(data.data.cpf)

			if (patient.length === 0) {
				return res.status(404).send({ message: 'Paciente não encontrado.' })
			}

			const patientCode = Math.random().toString(36).substring(2, 8).toUpperCase()

			await this.authRepository.updatePatient({
				id: patient[0].id,
				code: patientCode,
			})

			return res.status(200).send({ message: 'Código reenviado com sucesso.' })
		} catch (error) {
			throw error
		}
	}
}
