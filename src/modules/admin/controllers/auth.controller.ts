import type { FastifyReply, FastifyRequest } from 'fastify'
import { AuthRepository } from '../repositories/auth.repository'
import {
	ForgotPasswordAdminSchema,
	ResetPasswordAdminSchema,
	SignInAdminSchema,
	SignUpAdminSchema,
	UpdateAdminSchema,
} from '../schemas/auth.schema'
import bcrypt from 'bcrypt'

export class AuthController {
	private authRepository: AuthRepository

	constructor() {
		this.authRepository = new AuthRepository()
	}

	async createAdmin(req: FastifyRequest, res: FastifyReply) {
		try {
			const Admin = SignUpAdminSchema.safeParse(req.body)

			if (!Admin.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: Admin.error.format(),
				})
			}

			const AdminExists = await this.authRepository.findAdminByEmail(Admin.data.email)

			if (AdminExists.length > 0) {
				return res.status(409).send({ message: 'Paciente já cadastrado.' })
			}

			const saltRounds = 5
			const hashedPassword = await bcrypt.hash(Admin.data.password, saltRounds)
			Admin.data.password = hashedPassword

			console.log(Admin.data)

			const createdAdmin = await this.authRepository.createAdmin(Admin.data)

			return createdAdmin
		} catch (error) {
			throw error
		}
	}

	async updateAdmin(req: FastifyRequest, res: FastifyReply) {
		try {
			const Admin = UpdateAdminSchema.safeParse(req.body)

			if (!Admin.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: Admin.error.format(),
				})
			}

			const AdminExists = await this.authRepository.findAdminById(Admin.data.id)

			if (AdminExists.length === 0) {
				return res.status(404).send({ message: 'Paciente não encontrado.' })
			}

			const updatedAdmin = await this.authRepository.updateAdmin(Admin.data)

			return updatedAdmin
		} catch (error) {
			throw error
		}
	}

	async signInAdmin(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = SignInAdminSchema.safeParse(req.body)

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			const Admin = await this.authRepository.findAdminByEmail(data.data.email)

			if (Admin.length === 0) {
				return res.status(404).send({ message: 'Administrador não encontrado.' })
			}

			// Verifica se a senha está correta
			const isPasswordValid = await bcrypt.compare(data.data.password, Admin[0].password)

			if (!isPasswordValid) {
				return res.status(401).send({ message: 'Credenciais inválidas.' })
			}

			const token = req.server.jwt.sign({
				id: Admin[0].id,
				email: Admin[0].email,
				name: Admin[0].name,
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
				token: token,
				user: {
					id: Admin[0].id,
					email: Admin[0].email,
					name: Admin[0].name,
				},
			})
		} catch (error) {
			throw error
		}
	}

	async forgotPassword(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = ForgotPasswordAdminSchema.safeParse(req.body)

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			const Admin = await this.authRepository.findAdminByEmail(data.data.email)

			if (Admin.length === 0) {
				return res.status(404).send({ message: 'Paciente não encontrado.' })
			}

			const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase()

			await this.authRepository.updateAdmin({
				id: Admin[0].id,
				resetCode: resetCode,
			})

			// TODO: Implementar envio de email com o código de recuperação
			// await emailService.send({
			// 	to: Admin[0].email,
			// 	subject: 'Recuperação de senha',
			// 	body: `Seu código de recuperação é: ${resetCode}`
			// })

			console.log(`Código de recuperação para ${Admin[0].email}: ${resetCode}`)

			return await res.status(200).send({ message: 'Código de recuperação enviado com sucesso.' })
		} catch (error) {
			throw error
		}
	}

	async resetPassword(req: FastifyRequest, res: FastifyReply) {
		try {
			const data = ResetPasswordAdminSchema.safeParse(req.body)

			if (!data.success) {
				return res.status(400).send({
					message: 'Dados inválidos.',
					errors: data.error.format(),
				})
			}

			const Admin = await this.authRepository.findAdminByEmail(data.data.email)

			if (Admin.length === 0) {
				return res.status(404).send({ message: 'Administrador não encontrado.' })
			}

			// Verifica se existe um código de recuperação
			if (!Admin[0].resetCode) {
				return res.status(400).send({ message: 'Nenhum código de recuperação foi solicitado.' })
			}

			// Verifica se o código informado está correto
			if (Admin[0].resetCode !== data.data.code) {
				return res.status(400).send({ message: 'Código de recuperação inválido.' })
			}

			const saltRounds = 5
			const hashedPassword = await bcrypt.hash(data.data.newPassword, saltRounds)

			await this.authRepository.updateAdmin({
				id: Admin[0].id,
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
