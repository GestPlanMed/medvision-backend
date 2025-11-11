import type { FastifyReply, FastifyRequest } from 'fastify'
import { AuthRepository } from '../repositories/auth.repository'
import {
	ForgotPasswordDoctorSchema,
	ResetPasswordDoctorSchema,
	SignInDoctorSchema,
	SignUpDoctorSchema,
	UpdateDoctorSchema,
} from '../schemas/auth.schema'
import bcrypt from 'bcrypt'

export class AuthController {
	private authRepository: AuthRepository

	constructor() {
		this.authRepository = new AuthRepository()
	}

	async createDoctor(req: FastifyRequest, res: FastifyReply) {
		try {
			const Doctor = SignUpDoctorSchema.safeParse(req.body)

			if (!Doctor.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: Doctor.error.format(),
				})
			}

			const DoctorExists = await this.authRepository.findDoctorByCRM(Doctor.data.crm)

			if (DoctorExists.length > 0) {
				return res.status(409).send({ message: 'Paciente já cadastrado.' })
			}

			const saltRounds = 5
			const hashedPassword = await bcrypt.hash(Doctor.data.password, saltRounds)
			Doctor.data.password = hashedPassword

			const createdDoctor = await this.authRepository.createDoctor(Doctor.data)

			return createdDoctor
		} catch (error) {
			throw error
		}
	}

	async updateDoctor(req: FastifyRequest, res: FastifyReply) {
		try {
			const Doctor = UpdateDoctorSchema.safeParse(req.body)

			if (!Doctor.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: Doctor.error.format(),
				})
			}

			const DoctorExists = await this.authRepository.findDoctorById(Doctor.data.id)

			if (DoctorExists.length === 0) {
				return res.status(404).send({ message: 'Paciente não encontrado.' })
			}

			const updatedDoctor = await this.authRepository.updateDoctor(Doctor.data)

			return updatedDoctor
		} catch (error) {
			throw error
		}
	}

	async signInDoctor(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = SignInDoctorSchema.safeParse(req.body)

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			const Doctor = await this.authRepository.findDoctorByEmail(data.data.email)

			if (Doctor.length === 0) {
				return res.status(404).send({ message: 'Doctoristrador não encontrado.' })
			}

			const isPasswordValid = await bcrypt.compare(data.data.password, Doctor[0].password)

			if (!isPasswordValid) {
				return res.status(401).send({ message: 'Credenciais inválidas.' })
			}

			const token = req.server.jwt.sign({
				id: Doctor[0].id,
				email: Doctor[0].email,
				name: Doctor[0].name,
				role: 'doctor',
			})

			// Define o token no cookie
			res.setCookie('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				maxAge: 24 * 60 * 60, // 24 horas em segundos
			})

			return res.status(200).send({
				message: 'Login realizado com sucesso.',
				user: {
					id: Doctor[0].id,
					email: Doctor[0].email,
					name: Doctor[0].name,
					crm: Doctor[0].crm,
					role: 'doctor',
				},
			})
		} catch (error) {
			throw error
		}
	}

	async forgotPassword(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = ForgotPasswordDoctorSchema.safeParse(req.body)

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			const Doctor = await this.authRepository.findDoctorByEmail(data.data.email)

			if (Doctor.length === 0) {
				return res.status(404).send({ message: 'Paciente não encontrado.' })
			}

			const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase()

			await this.authRepository.updateDoctor({
				id: Doctor[0].id,
				resetCode: resetCode,
			})

			// TODO: Implementar envio de email com o código de recuperação
			// await emailService.send({
			// 	to: Doctor[0].email,
			// 	subject: 'Recuperação de senha',
			// 	body: `Seu código de recuperação é: ${resetCode}`
			// })

			console.log(`Código de recuperação para ${Doctor[0].email}: ${resetCode}`)

			return await res.status(200).send({ message: 'Código de recuperação enviado com sucesso.' })
		} catch (error) {
			throw error
		}
	}

	async resetPassword(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = ResetPasswordDoctorSchema.safeParse(req.body)

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			const Doctor = await this.authRepository.findDoctorByEmail(data.data.email)

			if (Doctor.length === 0) {
				return res.status(404).send({ message: 'Doctoristrador não encontrado.' })
			}

			// Verifica se existe um código de recuperação
			if (!Doctor[0].resetCode) {
				return res.status(400).send({ message: 'Nenhum código de recuperação foi solicitado.' })
			}

			// Verifica se o código informado está correto
			if (Doctor[0].resetCode !== data.data.code) {
				return res.status(400).send({ message: 'Código de recuperação inválido.' })
			}

			const saltRounds = 5
			const hashedPassword = await bcrypt.hash(data.data.newPassword, saltRounds)

			await this.authRepository.updateDoctor({
				id: Doctor[0].id,
				password: hashedPassword,
				resetCode: null,
			})

			return res.status(200).send({ message: 'Senha redefinida com sucesso.' })
		} catch (error) {
			throw error
		}
	}

	async logout(_req: FastifyRequest, res: FastifyReply) {
		try {
			// Remove o cookie de token
			res.clearCookie('token', {
				path: '/',
			})

			return res.status(200).send({ message: 'Logout realizado com sucesso.' })
		} catch (error) {
			throw error
		}
	}

	async me(req: FastifyRequest, res: FastifyReply) {
		try {
			// O user já está disponível no request graças ao plugin de autenticação
			return res.status(200).send({
				user: req.user,
			})
		} catch (error) {
			throw error
		}
	}
}
