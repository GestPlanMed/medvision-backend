import type { FastifyReply, FastifyRequest } from 'fastify'
import { createCryptoService, createJWTService } from '../../../services'
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

			return res.status(201).send({
				ok: true,
				message: `Paciente ${patient.name} cadastrado.`,
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

			console.log(`Código de segurança enviado para ${patient.phone}: ${securityCode}`)

			return res.send({
				ok: true,
				message: 'Código de segurança enviado',
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

			res.setCookie('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: expiresIn,
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

			console.log(`Código reenviado para ${patient.phone}: ${securityCode}`)

			return res.send({
				ok: true,
				message: 'Código reenviado',
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
