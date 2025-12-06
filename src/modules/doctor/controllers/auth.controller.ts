import { createCryptoService, createJWTService, emailService } from '../../../services'
import { DoctorAuthRepository } from '../repositories/auth.repository'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { SignUpDoctorSchema, SignInDoctorSchema } from '../schemas/auth.schema'

interface Dependencies {
	fastify: FastifyRequest['server']
}

export class DoctorAuthController {
	private repository: DoctorAuthRepository
	private crypto = createCryptoService()
	private jwt: ReturnType<typeof createJWTService>

	constructor(deps: Dependencies) {
		this.repository = new DoctorAuthRepository()
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

			const validation = SignUpDoctorSchema.safeParse(req.body)

			if (!validation.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: validation.error.flatten(),
				})
			}

			const { email: doctorEmail, crm, password } = validation.data

			if (await this.repository.emailExists(doctorEmail)) {
				return res.status(409).send({
					ok: false,
					message: 'Email já cadastrado',
				})
			}

			if (await this.repository.crmExists(crm)) {
				return res.status(409).send({
					ok: false,
					message: 'CRM já cadastrado',
				})
			}

			const generatedPassword = password || await this.crypto.generatePassword(8);

			const hashedPassword = await this.crypto.hashPassword(generatedPassword)

			const doctor = await this.repository.create({
				...validation.data,
				password: hashedPassword,
			})

			// Enviar email de boas-vindas
			try {
				await emailService.sendWelcomeDoctor(doctor.email, {
					name: doctor.name,
					email: doctor.email,
					loginUrl: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : undefined,
					// Envia senha apenas se foi gerada automaticamente (não fornecida pelo usuário)
					temporaryPassword: !password ? generatedPassword : undefined,
				})
				console.log('✅ Email de boas-vindas enviado para:', doctor.email)
			} catch (emailError) {
				console.error('⚠️ Erro ao enviar email de boas-vindas:', emailError)
			}

			return res.status(201).send({
				ok: true,
				message: `Médico cadastrado com sucesso: ${doctor.name}`,
				data: {
					doctor
				}
			})
		} catch (error) {
			console.error('[DoctorSignUp Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao cadastrar médico',
			})
		}
	}

	async signin(req: FastifyRequest, res: FastifyReply) {
		try {
			const validation = SignInDoctorSchema.safeParse(req.body)

			if (!validation.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: validation.error.flatten(),
				})
			}

			const { email: doctorEmail, password } = validation.data

			const doctor = await this.repository.findByEmail(doctorEmail)

			if (!doctor) {
				return res.status(401).send({
					ok: false,
					message: 'Email ou senha inválidos',
				})
			}

			const isValidPassword = await this.crypto.comparePassword(password, doctor.password)

			if (!isValidPassword) {
				return res.status(401).send({
					ok: false,
					message: 'Email ou senha inválidos',
				})
			}

			const { token, refreshToken, expiresIn } = this.jwt.generateDoctorToken(doctor.id, doctor.email, doctor.crm)

			// Log para debug
			console.log('🔐 Configurando cookie de autenticação:', {
				protocol: req.protocol,
				forwardedProto: req.headers['x-forwarded-proto'],
				origin: req.headers.origin,
			})

			res.setCookie('token', token, {
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				maxAge: expiresIn,
				path: '/',
			})

			res.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				maxAge: 7 * 24 * 60 * 60,
				path: '/',
			})

			return res.send({
				ok: true,
				message: 'Login realizado com sucesso',
				data: {
					token,
					refreshToken,
					expiresIn,
					doctor: {
						id: doctor.id,
						name: doctor.name,
						email: doctor.email,
						crm: doctor.crm,
						specialty: doctor.specialty,
					},
				},
			})
		} catch (error) {
			console.error('[DoctorSignIn Error]', error)
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
				await emailService.sendPasswordRecoveryCode(adminEmail, {
					name: admin.name || adminEmail.split('@')[0],
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
			const { email, password } = req.body as { email: string; password: string }

			const doctor = await this.repository.findByEmail(email)

			if (!doctor) {
				return res.status(400).send({
					ok: false,
					message: 'Médico não encontrado',
				})
			}

			const hashedPassword = await this.crypto.hashPassword(password)

			await this.repository.updatePassword(doctor.id, hashedPassword)
			await this.repository.updateResetCode(doctor.id, null)

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
			
			const doctorId = req.user?.sub

			if (req.user?.role !== 'doctor' || !doctorId) {
				return res.status(401).send({
					ok: false,
					message: 'Não autorizado',
				})
			}

			const doctor = await this.repository.findById(doctorId)

			if (!doctor) {
				return res.status(404).send({
					ok: false,
					message: 'Médico não encontrado',
				})
			}

			return res.send({
				ok: true,
				message: 'Perfil obtido com sucesso',
				data: {
					doctor: {
						id: doctor.id,
						name: doctor.name,
						email: doctor.email,
						crm: doctor.crm,
						specialty: doctor.specialty,
						appointments: doctor.appointments,
					},
				},
			})
		} catch (error) {
			console.error('[DoctorGetProfile Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao obter perfil',
			})
		}
	}
}
