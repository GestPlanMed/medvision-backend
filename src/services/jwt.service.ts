import type { FastifyInstance } from 'fastify'
import type { JWTPayload, PatientJWTPayload, DoctorJWTPayload, AdminJWTPayload } from '../types/auth.types'
import { TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from '../types/auth.types'

interface JWTServiceConfig {
	fastify: FastifyInstance
}

export function createJWTService(config: JWTServiceConfig) {
	const { fastify } = config

	function generatePatientToken(
		patientId: string,
		cpf: string,
	): {
		token: string
		refreshToken: string
		expiresIn: number
	} {
		const expiresIn = TOKEN_EXPIRATION.patient
		const payload: PatientJWTPayload = {
			sub: patientId,
			role: 'patient',
			cpf,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + expiresIn,
			aud: 'medvision',
			iss: 'medvision-auth',
		}

		const token = fastify.jwt.sign(payload, { expiresIn: `${expiresIn}s` })

		const refreshPayload: PatientJWTPayload = { ...payload }
		const refreshExpiresIn = REFRESH_TOKEN_EXPIRATION.patient
		const refreshToken = fastify.jwt.sign(refreshPayload, { expiresIn: `${refreshExpiresIn}s` })

		return { token, refreshToken, expiresIn }
	}

	function generateDoctorToken(
		doctorId: string,
		email: string,
		crm: string,
	): {
		token: string
		refreshToken: string
		expiresIn: number
	} {
		const expiresIn = TOKEN_EXPIRATION.doctor
		const payload: DoctorJWTPayload = {
			sub: doctorId,
			role: 'doctor',
			email,
			crm,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + expiresIn,
			aud: 'medvision',
			iss: 'medvision-auth',
		}

		const token = fastify.jwt.sign(payload, { expiresIn: `${expiresIn}s` })

		const refreshPayload: DoctorJWTPayload = { ...payload }
		const refreshExpiresIn = REFRESH_TOKEN_EXPIRATION.doctor
		const refreshToken = fastify.jwt.sign(refreshPayload, { expiresIn: `${refreshExpiresIn}s` })

		return { token, refreshToken, expiresIn }
	}

	function generateAdminToken(
		adminId: string,
		email: string,
		sessionId: string,
	): {
		token: string
		refreshToken: string
		expiresIn: number
	} {
		const expiresIn = TOKEN_EXPIRATION.admin
		const payload: AdminJWTPayload = {
			sub: adminId,
			role: 'admin',
			email,
			sessionId,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + expiresIn,
			aud: 'medvision',
			iss: 'medvision-auth',
		}

		const token = fastify.jwt.sign(payload, { expiresIn: `${expiresIn}s` })

		const refreshPayload: AdminJWTPayload = { ...payload }
		const refreshExpiresIn = REFRESH_TOKEN_EXPIRATION.admin
		const refreshToken = fastify.jwt.sign(refreshPayload, { expiresIn: `${refreshExpiresIn}s` })

		return { token, refreshToken, expiresIn }
	}

	function verifyToken(token: string): JWTPayload | null {
		try {
			const decoded = fastify.jwt.verify(token) as JWTPayload
			return decoded
		} catch {
			return null
		}
	}

	function verifyRefreshToken(token: string): JWTPayload | null {
		try {
			const decoded = fastify.jwt.verify(token) as JWTPayload
			return decoded
		} catch {
			return null
		}
	}

	return {
		generatePatientToken,
		generateDoctorToken,
		generateAdminToken,
		verifyToken,
		verifyRefreshToken,
	}
}

export type JWTService = ReturnType<typeof createJWTService>
