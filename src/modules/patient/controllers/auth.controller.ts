import type { FastifyReply, FastifyRequest } from 'fastify'
import { createCryptoService, createJWTService, emailService } from '../../../services'
import {
	ResendCodePatientSchema,
	SignInPatientSchema,
	SignUpPatientSchema,
	ValidateCodePatientSchema,
} from '../schemas/auth.schema'
import { PatientAuthRepository } from '../repositories/auth.repository'

interface Dependencies {
	fastify: FastifyRequest['server']
}

export class PatientAuthController {
	private repository: PatientAuthRepository
	private crypto = createCryptoService()
	private jwt: ReturnType<typeof createJWTService>

	constructor(deps: Dependencies) {
		this.repository = new PatientAuthRepository()
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

			const validation = SignUpPatientSchema.safeParse(req.body)

			if (!validation.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: validation.error.flatten(),
				})
			}

			const { cpf } = validation.data

			if (await this.repository.findByCPF(cpf)) {
				return res.status(409).send({
					ok: false,
					message: 'CPF já cadastrado',
				})
			}

			const patient = await this.repository.create(validation.data)

			// Enviar email de boas-vindas
			try {
				// TODO: Usar patient.email quando o campo for adicionado ao modelo
				const tempEmail = 'natanaelsouza.dev@gmail.com'
				await emailService.sendWelcomePatient(tempEmail, {
					name: patient.name,
					email: tempEmail,
					loginUrl: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : undefined,
				})
				console.log('✅ Email de boas-vindas enviado para:', tempEmail)
			} catch (emailError) {
				console.error('⚠️ Erro ao enviar email de boas-vindas:', emailError)
			}

			return res.status(201).send({
				ok: true,
				message: `Paciente ${patient.name} cadastrado.`,
				data: {
					patient
				}
			})
		} catch (error) {
			console.error('[SignUp Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao cadastrar paciente',
			})
		}
	}

	async signin(req: FastifyRequest, res: FastifyReply) {
		try {
			const validation = SignInPatientSchema.safeParse(req.body)

			if (!validation.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: validation.error.flatten(),
				})
			}

			const { cpf } = validation.data

			const patient = await this.repository.findByCPF(cpf)

			if (!patient) {
				return res.status(401).send({
					ok: false,
					message: 'CPF não encontrado',
				})
			}

		const securityCode = this.crypto.generateSecurityCode()
		await this.repository.updateVerificationCode(patient.id, securityCode)

		// Enviar código por email
		try {
			// TODO: Usar patient.email quando o campo for adicionado ao modelo
			const tempEmail = 'natanaelsouza.dev@gmail.com'
			await emailService.sendSecurityCode(tempEmail, {
				name: patient.name,
				securityCode: securityCode,
				expiresIn: '10 minutos',
			})
			console.log(`✅ Código de segurança enviado por email para: ${tempEmail}`)
		} catch (emailError) {
			console.error('⚠️ Erro ao enviar email com código:', emailError)
			// Continua mesmo se o email falhar
		}

		// Log para backup (caso email falhe)
		console.log(`Código de segurança para ${patient.phone}: ${securityCode}`)

		return res.send({
			ok: true,
			message: 'Código de segurança enviado para seu email',
		})
		} catch (error) {
			console.error('[SignIn Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao fazer login',
			})
		}
	}

	async validateCode(req: FastifyRequest, res: FastifyReply) {
		try {
			const validation = ValidateCodePatientSchema.safeParse(req.body)

			if (!validation.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: validation.error.flatten(),
				})
			}

			const { cpf, securityCode } = validation.data

			const patient = await this.repository.findByCPF(cpf)

			if (!patient) {
				return res.status(401).send({
					ok: false,
					message: 'CPF não encontrado',
				})
			}

			const isValid = await this.repository.verifyCode(patient.id, securityCode)

			if (!isValid) {
				return res.send({
					ok: false,
					message: 'Código inválido ou expirado',
				})
			}

			const { token, refreshToken, expiresIn } = await this.jwt.generatePatientToken(patient.id, patient.cpf)

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

			return res.send({
				ok: true,
				message: 'Código válido',
				data: {
					token,
					refreshToken,
					expiresIn,
					patient: {
						id: patient.id,
						name: patient.name,
						cpf: patient.cpf,
						appointments: patient.appointments,
					}
				},
			})
		} catch (error) {
			console.error('[ValidateCode Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao validar código',
			})
		}
	}

	async resendCode(req: FastifyRequest, res: FastifyReply) {
		try {
			const validation = ResendCodePatientSchema.safeParse(req.body)

			if (!validation.success) {
				return res.status(400).send({
					ok: false,
					message: 'Dados inválidos',
					errors: validation.error.flatten(),
				})
			}

			const { cpf } = validation.data

			const patient = await this.repository.findByCPF(cpf)

			if (!patient) {
				return res.status(401).send({
					ok: false,
					message: 'CPF não encontrado',
				})
			}

		const securityCode = this.crypto.generateSecurityCode()
		await this.repository.updateVerificationCode(patient.id, securityCode)

		// Enviar código por email
		try {
			await emailService.sendSecurityCode(patient.email, {
				name: patient.name,
				securityCode: securityCode,
				expiresIn: '10 minutos',
			})
			console.log(`✅ Código reenviado por email para: ${patient.email}`)
		} catch (emailError) {
			console.error('⚠️ Erro ao reenviar email com código:', emailError)
		}

		// Log para backup
		console.log(`Código reenviado para ${patient.phone}: ${securityCode}`)

		return res.send({
			ok: true,
			message: 'Código reenviado para seu email',
		})
		} catch (error) {
			console.error('[ResendCode Error]', error)
			return res.status(500).send({
				ok: false,
				message: 'Erro ao reenviar código',
			})
		}
	}
}
