import type { FastifyReply, FastifyRequest } from 'fastify'
import { AdminAuthRepository } from '../repositories/auth.repository'
import { createCryptoService, createJWTService, emailService } from '../../../services'
import { SignUpAdminSchema, SignInAdminSchema, ResetPasswordAdminSchema } from '../schemas/auth.schema'

interface Dependencies {
	fastify: FastifyRequest['server']
}

export class AdminAuthController {
	private repository: AdminAuthRepository
	private crypto = createCryptoService()
	private jwt: ReturnType<typeof createJWTService>

	constructor(deps: Dependencies) {
		this.repository = new AdminAuthRepository()
		this.jwt = createJWTService({ fastify: deps.fastify })
		this.crypto = createCryptoService()
	}

	async signup(req: FastifyRequest, res: FastifyReply) {
		try {
			if (req.user?.role !== 'admin') {
				return res.status(403).send({
					ok: false,
					message: 'Acesso negado',
				})
			}

			const validation = SignUpAdminSchema.safeParse(req.body)

			if (!validation.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: validation.error.flatten(),
				})
			}

			const { email: adminEmail, password } = validation.data

			if (await this.repository.emailExists(adminEmail)) {
				return res.status(409).send({
					ok: false,
					message: 'Email já cadastrado',
				})
			}

			const hashedPassword = await this.crypto.hashPassword(password)

			const admin = await this.repository.create({
				...validation.data,
				password: hashedPassword,
			})

			// Enviar email de boas-vindas com senha
			try {
				await emailService.sendWelcomeAdmin(admin.email, {
					name: admin.email.split('@')[0], // Usa parte do email como nome
					email: admin.email,
					loginUrl: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : undefined,
					temporaryPassword: password, // Admin sempre tem senha definida no cadastro
				})
				console.log('✅ Email de boas-vindas enviado para admin:', admin.email)
			} catch (emailError) {
				console.error('⚠️ Erro ao enviar email de boas-vindas:', emailError)
			}

			return res.status(201).send({
				ok: true,
				message: 'Admin cadastrado com sucesso',
				data: {
					adminId: admin.id,
					email: admin.email,
				},
			})
		} catch (error) {
			console.error('[AdminSignUp Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao cadastrar admin',
			})
		}
	}

	async signin(req: FastifyRequest, res: FastifyReply) {
		try {
			const validation = SignInAdminSchema.safeParse(req.body)

			if (!validation.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: validation.error.flatten(),
				})
			}

			const { email: adminEmail, password } = validation.data

			const admin = await this.repository.findByEmail(adminEmail)

			if (!admin) {
				return res.status(401).send({
					ok: false,
					message: 'Email ou senha inválidos',
				})
			}

			const isValidPassword = await this.crypto.comparePassword(password, admin.password)

			if (!isValidPassword) {
				return res.status(401).send({
					ok: false,
					message: 'Email ou senha inválidos',
				})
			}

			const { token, refreshToken, expiresIn } = this.jwt.generateAdminToken(admin.id, admin.email)

			res.setCookie('med_vision_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: expiresIn,
			})

			return res.send({
				ok: true,
				message: 'Login realizado com sucesso',
				data: {
					token,
					refreshToken,
					expiresIn,
					admin: {
						id: admin.id,
						email: admin.email,
						name: admin.name,
					}
				}
			})
		} catch (error) {
			console.error('[AdminSignIn Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao fazer login',
			})
		}
	}

	async recoveryPassword(req: FastifyRequest, res: FastifyReply) {
		try {
			const { email: adminEmail } = req.body as { email: string }

			const admin = await this.repository.findByEmail(adminEmail)

			if (!admin) {
				return res.status(404).send({
					ok: false,
					message: 'Admin não encontrado',
				})
			}

			const recoveryCode = this.crypto.generateRandomCode(6)

			await this.repository.updateResetCode(admin.id, recoveryCode)

			// Enviar código por email
			try {
				await emailService.sendPasswordRecoveryCode(admin.email, {
					name: admin.email.split('@')[0],
					recoveryCode: recoveryCode,
					expiresIn: '15 minutos',
				})
				console.log(`✅ Código de recuperação enviado por email para: ${adminEmail}`)
			} catch (emailError) {
				console.error('⚠️ Erro ao enviar email de recuperação:', emailError)
			}

			// Log para backup
			console.log(`Código de recuperação para ${adminEmail}: ${recoveryCode}`)

			return res.send({
				ok: true,
				message: 'Código de recuperação enviado para o email',
			})
		} catch (error) {
			console.error('[AdminRecoveryPassword Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao recuperar senha',
			})
		}
	}

	async validateCode(req: FastifyRequest, res: FastifyReply) {
		try {
			const { email: adminEmail, code } = req.body as { email: string; code: string }

			const admin = await this.repository.findByEmail(adminEmail)

			if (!admin || admin.resetCode !== code) {
				return res.status(400).send({
					ok: false,
					message: 'Código inválido',
				})
			}

			return res.send({
				ok: true,
				message: 'Código válido',
			})
		} catch (error) {
			console.error('[AdminValideCode Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao validar código',
			})
		}
	}

	async resetPassword(req: FastifyRequest, res: FastifyReply) {
		try {
			const validation = ResetPasswordAdminSchema.safeParse(req.body)

			if (!validation.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: validation.error.flatten(),
				})
			}

			const { email, newPassword } = validation.data

			const admin = await this.repository.findByEmail(email)

			if (!admin) {
				return res.status(400).send({
					ok: false,
					message: 'Código inválido ou expirado',
				})
			}

			const hashedPassword = await this.crypto.hashPassword(newPassword)

			await this.repository.updatePassword(admin.id, hashedPassword)
			await this.repository.clearResetCode(admin.id)

			return res.send({
				ok: true,
				message: 'Senha atualizada com sucesso',
			})
		} catch (error) {
			console.error('[AdminResetPassword Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao resetar senha',
			})
		}
	}

	async getProfile(req: FastifyRequest, res: FastifyReply) {
		try {

			if (req.user.role !== 'admin') {
				return res.status(401).send({
					ok: false,
					message: 'Não autorizado',
				})
			}

			const admin = await this.repository.findById(req.user.sub)

			if (!admin) {
				return res.status(404).send({
					ok: false,
					message: 'Admin não encontrado',
				})
			}

			return res.send({
				ok: true,
				data: {
					id: admin.id,
					email: admin.email,
					name: admin.name,
				}
			})
		} catch (error) {
			console.error('[AdminGetProfile Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao obter perfil',
			})
		}
	}
}
